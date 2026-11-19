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
    """加载 yolov8n.onnx 仅识别 COCO class 0 (person)。"""

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
        # YOLOv8 输出形状: (1, 84, 8400) -> 转置为 (8400, 84)
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
