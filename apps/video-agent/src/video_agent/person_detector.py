"""基于 ONNX Runtime + YOLOv8n 的本地轻量级人形检测器（零 PyTorch 依赖）。"""

from dataclasses import dataclass
from io import BytesIO
from pathlib import Path

import numpy as np
import onnxruntime as ort
from PIL import Image, ImageDraw


@dataclass(frozen=True)
class PersonBox:
    x1: int
    y1: int
    x2: int
    y2: int
    confidence: float


def _iou(box: tuple[float, float, float, float], others: np.ndarray) -> np.ndarray:
    xx1 = np.maximum(box[0], others[:, 0])
    yy1 = np.maximum(box[1], others[:, 1])
    xx2 = np.minimum(box[2], others[:, 2])
    yy2 = np.minimum(box[3], others[:, 3])
    w = np.maximum(0.0, xx2 - xx1)
    h = np.maximum(0.0, yy2 - yy1)
    inter = w * h
    area_a = (box[2] - box[0]) * (box[3] - box[1])
    area_b = (others[:, 2] - others[:, 0]) * (others[:, 3] - others[:, 1])
    return inter / np.maximum(area_a + area_b - inter, 1e-6)


def _nms(boxes: np.ndarray, scores: np.ndarray, iou_thres: float = 0.45) -> list[int]:
    order = scores.argsort()[::-1]
    keep: list[int] = []
    while order.size > 0:
        i = int(order[0])
        keep.append(i)
        if order.size == 1:
            break
        ious = _iou(tuple(boxes[i]), boxes[order[1:]])
        order = order[1:][ious <= iou_thres]
    return keep


class PersonDetector:
    """加载 YOLO ONNX（兼容 YOLO26 端到端 1x300x6 与 YOLOv8/11 1x84x8400）识别 COCO class 0 (person)。"""

    def __init__(self, model_path: Path, conf_threshold: float = 0.50, input_size: int = 640) -> None:
        self.model_path = model_path
        self.conf_threshold = conf_threshold
        self.input_size = input_size
        opts = ort.SessionOptions()
        opts.intra_op_num_threads = 2
        opts.inter_op_num_threads = 1
        self.session = ort.InferenceSession(
            str(model_path),
            sess_options=opts,
            providers=["CPUExecutionProvider"],
        )
        self.input_name = self.session.get_inputs()[0].name

    def _decode_end2end(
        self,
        outputs: np.ndarray,
        scale: float,
        pad_x: int,
        pad_y: int,
        orig_w: int,
        orig_h: int,
    ) -> list[PersonBox]:
        """解析 YOLO26n 端到端无 NMS 输出 (1, 300, 6): [x1, y1, x2, y2, conf, cls]。"""
        dets = np.squeeze(outputs, axis=0)
        if dets.ndim != 2 or dets.shape[1] < 6:
            return []
        confs = dets[:, 4]
        classes = dets[:, 5]
        mask = (classes == 0) & (confs >= self.conf_threshold)
        if not np.any(mask):
            return []

        filtered = dets[mask]
        x1, y1, x2, y2 = filtered[:, 0], filtered[:, 1], filtered[:, 2], filtered[:, 3]
        if float(np.max(filtered[:, :4])) <= 2.0:
            x1 = x1 * self.input_size
            y1 = y1 * self.input_size
            x2 = x2 * self.input_size
            y2 = y2 * self.input_size

        rx1 = np.clip((x1 - pad_x) / scale, 0, orig_w)
        ry1 = np.clip((y1 - pad_y) / scale, 0, orig_h)
        rx2 = np.clip((x2 - pad_x) / scale, 0, orig_w)
        ry2 = np.clip((y2 - pad_y) / scale, 0, orig_h)

        # 经验教训备注：红外黑白夜视下四足黑狗易同时触发 dog(16)/cat(15) 与 person(0) 两个 query。
        # 若同一位置存在较高置信度的猫狗框（IoU >= 0.45），优先抑制 person 误报，同时不靠死卡高宽比以免漏报弯腰/蹲姿人员。
        animal_mask = np.isin(classes, [15, 16]) & (confs >= 0.30)
        animal_boxes = np.empty((0, 4), dtype=np.float32)
        animal_confs = np.empty((0,), dtype=np.float32)
        if np.any(animal_mask):
            af = dets[animal_mask]
            ax1, ay1, ax2, ay2 = af[:, 0], af[:, 1], af[:, 2], af[:, 3]
            if float(np.max(af[:, :4])) <= 2.0:
                ax1 = ax1 * self.input_size
                ay1 = ay1 * self.input_size
                ax2 = ax2 * self.input_size
                ay2 = ay2 * self.input_size
            animal_boxes = np.stack(
                [
                    np.clip((ax1 - pad_x) / scale, 0, orig_w),
                    np.clip((ay1 - pad_y) / scale, 0, orig_h),
                    np.clip((ax2 - pad_x) / scale, 0, orig_w),
                    np.clip((ay2 - pad_y) / scale, 0, orig_h),
                ],
                axis=1,
            )
            animal_confs = af[:, 4]

        results: list[PersonBox] = []
        for i in range(len(filtered)):
            p_box = (float(rx1[i]), float(ry1[i]), float(rx2[i]), float(ry2[i]))
            p_conf = float(filtered[i, 4])
            if len(animal_boxes) > 0:
                ious = _iou(p_box, animal_boxes)
                if np.any((ious >= 0.45) & (animal_confs >= max(0.30, p_conf * 0.55))):
                    continue
            results.append(
                PersonBox(
                    x1=int(p_box[0]),
                    y1=int(p_box[1]),
                    x2=int(p_box[2]),
                    y2=int(p_box[3]),
                    confidence=p_conf,
                )
            )
        return results

    def _decode_raw_anchors(
        self,
        outputs: np.ndarray,
        scale: float,
        pad_x: int,
        pad_y: int,
        orig_w: int,
        orig_h: int,
    ) -> list[PersonBox]:
        """解析传统 YOLO 输出 (1, 84, 8400) 并执行 NMS。"""
        preds = np.squeeze(outputs, axis=0).T
        class_scores = preds[:, 4:]
        best_classes = np.argmax(class_scores, axis=1)
        person_scores = preds[:, 4]  # class 0 = person
        # 仅保留最高置信度类别确认为 person 的框，防止狗/椅子等其他高分目标被误报为人员
        mask = (best_classes == 0) & (person_scores >= self.conf_threshold)
        if not np.any(mask):
            return []

        filtered = preds[mask]
        scores = person_scores[mask]
        cx, cy, w, h = filtered[:, 0], filtered[:, 1], filtered[:, 2], filtered[:, 3]
        # 经验教训备注：部分 ONNX 导出模型（如 SpotLab yolov8n.onnx）输出的 cx/cy/w/h 为 [0,1] 归一化坐标，
        # 若不乘以 input_size(640) 会导致减 pad 后坐标全为负并被 clip 到左上角 (0,0)，进而引起 NMS 失效与人数翻倍。
        if float(np.max(filtered[:, :4])) <= 2.0:
            cx = cx * self.input_size
            cy = cy * self.input_size
            w = w * self.input_size
            h = h * self.input_size
        x1 = (cx - w / 2.0 - pad_x) / scale
        y1 = (cy - h / 2.0 - pad_y) / scale
        x2 = (cx + w / 2.0 - pad_x) / scale
        y2 = (cy + h / 2.0 - pad_y) / scale

        boxes = np.stack(
            [
                np.clip(x1, 0, orig_w),
                np.clip(y1, 0, orig_h),
                np.clip(x2, 0, orig_w),
                np.clip(y2, 0, orig_h),
            ],
            axis=1,
        )
        keep = _nms(boxes, scores, iou_thres=0.45)
        return [
            PersonBox(
                x1=int(boxes[idx, 0]),
                y1=int(boxes[idx, 1]),
                x2=int(boxes[idx, 2]),
                y2=int(boxes[idx, 3]),
                confidence=float(scores[idx]),
            )
            for idx in keep
        ]

    def detect_bytes(self, jpeg_bytes: bytes) -> list[PersonBox]:
        with Image.open(BytesIO(jpeg_bytes)) as img:
            rgb = img.convert("RGB")
            orig_w, orig_h = rgb.size
            scale = min(self.input_size / orig_w, self.input_size / orig_h)
            new_w = int(round(orig_w * scale))
            new_h = int(round(orig_h * scale))
            resized = rgb.resize((new_w, new_h), Image.BILINEAR)

            canvas = Image.new("RGB", (self.input_size, self.input_size), (114, 114, 114))
            pad_x = (self.input_size - new_w) // 2
            pad_y = (self.input_size - new_h) // 2
            canvas.paste(resized, (pad_x, pad_y))

        arr = np.asarray(canvas, dtype=np.float32) / 255.0
        blob = np.transpose(arr, (2, 0, 1))[None, ...]

        outputs = self.session.run(None, {self.input_name: blob})[0]
        if outputs.ndim == 3 and outputs.shape[-1] == 6:
            return self._decode_end2end(outputs, scale, pad_x, pad_y, orig_w, orig_h)
        return self._decode_raw_anchors(outputs, scale, pad_x, pad_y, orig_w, orig_h)


def draw_person_boxes(jpeg_bytes: bytes, boxes: list[PersonBox]) -> bytes:
    """在原图上绘制红色检测框和置信度标签，返回 JPEG 字节流。"""
    with Image.open(BytesIO(jpeg_bytes)) as img:
        rgb = img.convert("RGB")
        draw = ImageDraw.Draw(rgb)
        for box in boxes:
            draw.rectangle([box.x1, box.y1, box.x2, box.y2], outline=(239, 68, 68), width=4)
            label = f"PERSON {box.confidence:.0%}"
            text_y = max(4, box.y1 - 18)
            draw.rectangle([box.x1, text_y, box.x1 + len(label) * 7 + 8, text_y + 16], fill=(239, 68, 68))
            draw.text((box.x1 + 4, text_y + 2), label, fill=(255, 255, 255))
        out = BytesIO()
        rgb.save(out, format="JPEG", quality=88)
        return out.getvalue()


class MotionGateFilter:
    """
    基于缓慢更新灰度背景的运动门控过滤器。

    经验教训备注：
    YOLO 模型对静止近景物体（如斜靠的木板、推车、立柱）也可能给出 70%+ 的 person 误检置信度。
    仅靠置信度或连续帧数无法消除此类静态误报，必须叠加“框内像素相对背景是否有显著变化”的运动校验。
    """

    def __init__(
        self,
        thumb_size: tuple[int, int] = (320, 180),
        pixel_diff_threshold: float = 18.0,
        min_roi_motion_ratio: float = 0.08,
        global_light_jump_ratio: float = 0.85,
        bg_alpha: float = 0.05,
    ) -> None:
        self.thumb_size = thumb_size
        self.pixel_diff_threshold = pixel_diff_threshold
        self.min_roi_motion_ratio = min_roi_motion_ratio
        self.global_light_jump_ratio = global_light_jump_ratio
        self.bg_alpha = bg_alpha
        self._backgrounds: dict[str, np.ndarray] = {}

    def reset(self, cam_id: str | None = None) -> None:
        if cam_id is None:
            self._backgrounds.clear()
        else:
            self._backgrounds.pop(cam_id, None)

    def _to_gray_thumb(self, jpeg_bytes: bytes) -> tuple[np.ndarray, int, int]:
        with Image.open(BytesIO(jpeg_bytes)) as img:
            orig_w, orig_h = img.size
            gray = img.convert("L").resize(self.thumb_size, Image.BILINEAR)
            return np.asarray(gray, dtype=np.float32), orig_w, orig_h

    def filter_moving_boxes(
        self,
        cam_id: str,
        jpeg_bytes: bytes,
        boxes: list[PersonBox],
    ) -> list[PersonBox]:
        """过滤掉与背景无显著像素差异的静态误报框，同时维护机位背景基线。"""
        curr, orig_w, orig_h = self._to_gray_thumb(jpeg_bytes)
        bg = self._backgrounds.get(cam_id)
        if bg is None or bg.shape != curr.shape:
            # 首帧只建立基线，不触发报警，防止把本来就摆在画面里的物体当成新闯入者
            self._backgrounds[cam_id] = curr
            return []

        abs_diff = np.abs(curr - bg)
        global_change = float(np.mean(abs_diff >= self.pixel_diff_threshold))

        # 开关灯或日落/补光灯骤亮导致的全局亮度跳变：刷新基线并跳过当前帧
        if global_change >= self.global_light_jump_ratio:
            self._backgrounds[cam_id] = curr
            return []

        if not boxes:
            self._backgrounds[cam_id] = (1.0 - self.bg_alpha) * bg + self.bg_alpha * curr
            return []

        tw, th = self.thumb_size
        sx = tw / max(orig_w, 1)
        sy = th / max(orig_h, 1)

        moving: list[PersonBox] = []
        for box in boxes:
            x1 = max(0, min(tw - 1, int(box.x1 * sx)))
            y1 = max(0, min(th - 1, int(box.y1 * sy)))
            x2 = max(x1 + 1, min(tw, int(box.x2 * sx)))
            y2 = max(y1 + 1, min(th, int(box.y2 * sy)))
            roi_diff = abs_diff[y1:y2, x1:x2]
            motion_ratio = float(np.mean(roi_diff >= self.pixel_diff_threshold))
            if motion_ratio >= self.min_roi_motion_ratio:
                moving.append(box)

        if not moving:
            # 确认是静态背景误报时，缓慢融合进背景以适应光线渐暗
            self._backgrounds[cam_id] = (1.0 - self.bg_alpha) * bg + self.bg_alpha * curr

        return moving
