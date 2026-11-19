"""基于 OpenCV YuNet + SFace 的本地轻量级人脸检测与身份比对模块。"""

from dataclasses import dataclass
import json
from pathlib import Path
import threading

import cv2
import numpy as np


@dataclass(frozen=True)
class FaceMatch:
    name: str | None
    similarity: float
    x1: int
    y1: int
    x2: int
    y2: int


def _decode_bgr(image_bytes: bytes, max_side: int = 1920) -> np.ndarray | None:
    arr = np.frombuffer(image_bytes, dtype=np.uint8)
    img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if img is None:
        return None
    h, w = img.shape[:2]
    longest = max(h, w)
    if longest > max_side:
        scale = max_side / float(longest)
        img = cv2.resize(img, (int(round(w * scale)), int(round(h * scale))), interpolation=cv2.INTER_AREA)
    return img


class FaceRecognizer:
    """加载 YuNet 人脸检测 + SFace 人脸识别 ONNX，支持本地底库 1:N 身份匹配。"""

    def __init__(
        self,
        det_model_path: Path,
        rec_model_path: Path,
        gallery_path: Path,
        cos_threshold: float = 0.363,
    ) -> None:
        self.det_model_path = det_model_path
        self.rec_model_path = rec_model_path
        self.gallery_path = gallery_path
        self.cos_threshold = cos_threshold

        self.detector = cv2.FaceDetectorYN.create(
            str(det_model_path),
            "",
            (640, 640),
            score_threshold=0.75,
            nms_threshold=0.3,
            top_k=20,
        )
        self.recognizer = cv2.FaceRecognizerSF.create(str(rec_model_path), "")
        self._lock = threading.Lock()
        self.gallery: dict[str, list[np.ndarray]] = {}
        self.reload_gallery()

    def reload_gallery(self) -> int:
        with self._lock:
            self.gallery.clear()
            if not self.gallery_path.exists():
                return 0
            raw = json.loads(self.gallery_path.read_text(encoding="utf-8"))
            for name, vecs in raw.items():
                self.gallery[name] = [np.asarray(v, dtype=np.float32).reshape(1, -1) for v in vecs]
            return sum(len(v) for v in self.gallery.values())

    def update_gallery_dict(self, faces: dict[str, list[list[float]]]) -> int:
        """热更新并持久化云端同步下来的人脸特征底库。"""
        self.gallery_path.parent.mkdir(parents=True, exist_ok=True)
        tmp_path = self.gallery_path.with_suffix(".tmp")
        tmp_path.write_text(json.dumps(faces, ensure_ascii=False), encoding="utf-8")
        tmp_path.replace(self.gallery_path)
        return self.reload_gallery()

    def extract_largest_feature(self, image_bytes: bytes) -> np.ndarray | None:
        img = _decode_bgr(image_bytes, max_side=1280)
        if img is None:
            return None
        h, w = img.shape[:2]
        self.detector.setInputSize((w, h))
        _, faces = self.detector.detect(img)
        if faces is None or len(faces) == 0:
            return None
        # 取面积最大的人脸
        best_face = max(faces, key=lambda f: float(f[2] * f[3]))
        aligned = self.recognizer.alignCrop(img, best_face)
        feat = self.recognizer.feature(aligned)
        return feat.astype(np.float32)

    def build_gallery_from_raw_dir(self, raw_dir: Path) -> dict[str, int]:
        """扫描 raw_dir/<姓名>/*.jpg 提取并保存所有人脸特征向量。"""
        data: dict[str, list[list[float]]] = {}
        counts: dict[str, int] = {}
        if not raw_dir.exists():
            return counts

        for person_dir in sorted(raw_dir.iterdir()):
            if not person_dir.is_dir():
                continue
            name = person_dir.name.strip()
            vecs: list[list[float]] = []
            for img_path in sorted(person_dir.iterdir()):
                if img_path.suffix.lower() not in (".jpg", ".jpeg", ".png", ".webp"):
                    continue
                feat = self.extract_largest_feature(img_path.read_bytes())
                if feat is not None:
                    vecs.append(feat.flatten().tolist())
            if vecs:
                data[name] = vecs
                counts[name] = len(vecs)

        self.gallery_path.parent.mkdir(parents=True, exist_ok=True)
        self.gallery_path.write_text(json.dumps(data, ensure_ascii=False), encoding="utf-8")
        self.reload_gallery()
        return counts

    def identify_bytes(self, image_bytes: bytes) -> list[FaceMatch]:
        img = _decode_bgr(image_bytes, max_side=1920)
        if img is None:
            return []
        h, w = img.shape[:2]
        self.detector.setInputSize((w, h))
        _, faces = self.detector.detect(img)
        if faces is None or len(faces) == 0:
            return []

        matches: list[FaceMatch] = []
        for face in faces:
            x, y, fw, fh = int(face[0]), int(face[1]), int(face[2]), int(face[3])
            aligned = self.recognizer.alignCrop(img, face)
            feat = self.recognizer.feature(aligned)

            best_name: str | None = None
            best_sim = -1.0
            with self._lock:
                gallery_items = list(self.gallery.items())
            for name, ref_vecs in gallery_items:
                for ref in ref_vecs:
                    sim = float(self.recognizer.match(feat, ref, cv2.FaceRecognizerSF_FR_COSINE))
                    if sim > best_sim:
                        best_sim = sim
                        best_name = name

            matched_name = best_name if best_sim >= self.cos_threshold else None
            matches.append(
                FaceMatch(
                    name=matched_name,
                    similarity=max(0.0, best_sim),
                    x1=max(0, x),
                    y1=max(0, y),
                    x2=min(w, x + fw),
                    y2=min(h, y + fh),
                )
            )
        return matches
