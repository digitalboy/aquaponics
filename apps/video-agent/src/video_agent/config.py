from dataclasses import dataclass
import os
from pathlib import Path


@dataclass(frozen=True)
class AgentConfig:
    """边缘视频 Agent 运行时配置，从环境变量加载。"""

    gateway_url: str
    site_id: str
    agent_secret: str
    hls_ram_dir: Path
    ram_limit_mb: int
    ram_high_water_ratio: float
    snapshot_spool_dir: Path
    snapshot_spool_limit_mb: int
    mediamtx_rtsp_base: str
    snapshot_interval_sec: int
    heartbeat_idle_sec: int
    heartbeat_active_sec: int
    active_cameras: list[str]
    night_ai_enabled: bool
    site_lat: float
    site_lon: float
    night_sun_margin_min: int
    night_ai_interval_sec: int
    night_ai_conf_threshold: float
    night_ai_confirm_frames: int
    night_ai_cooldown_sec: int
    night_ai_model_path: Path
    day_ai_interval_sec: int
    day_ai_conf_threshold: float
    day_person_upload_cooldown_sec: int
    face_det_model_path: Path
    face_rec_model_path: Path
    face_gallery_path: Path
    face_cos_threshold: float
    hik_user: str
    hik_pass: str
    cam_ip_map: dict[str, str]
    night_stranger_flash_enabled: bool

    @classmethod
    def from_env(cls) -> "AgentConfig":
        raw_cams = os.getenv(
            "ACTIVE_CAMERAS",
            "CAM-GATE-IN-01,CAM-GATE-OUT-01,CAM-BACK-IN-01,CAM-FISH-PAN-01,CAM-FISH-P5-01,CAM-HYDRO-PAN-01,CAM-EQUIP-IN-01",
        )
        raw_ip_map = os.getenv(
            "CAM_IP_MAP",
            "CAM-GATE-IN-01=192.168.0.214,CAM-GATE-OUT-01=192.168.0.217,CAM-BACK-IN-01=192.168.0.205",
        )
        cam_ip_map: dict[str, str] = {}
        for pair in raw_ip_map.split(","):
            if "=" in pair:
                k, v = pair.split("=", 1)
                if k.strip() and v.strip():
                    cam_ip_map[k.strip()] = v.strip()
        return cls(
            gateway_url=os.environ["VIDEO_GATEWAY_URL"].rstrip("/"),
            site_id=os.getenv("SITE_ID", "guangming-01"),
            agent_secret=os.environ["AGENT_SECRET"],
            hls_ram_dir=Path(os.getenv("HLS_RAM_DIR", "/mnt/hls_ram")),
            ram_limit_mb=int(os.getenv("RAM_LIMIT_MB", "512")),
            ram_high_water_ratio=float(os.getenv("RAM_HIGH_WATER_RATIO", "0.80")),
            snapshot_spool_dir=Path(os.getenv("SNAPSHOT_SPOOL_DIR", "/var/spool/aquaponics/snapshots")),
            snapshot_spool_limit_mb=int(os.getenv("SNAPSHOT_SPOOL_LIMIT_MB", "1024")),
            mediamtx_rtsp_base=os.getenv("MEDIAMTX_RTSP_BASE", "rtsp://127.0.0.1:8554").rstrip("/"),
            snapshot_interval_sec=int(os.getenv("SNAPSHOT_INTERVAL_SEC", "600")),
            heartbeat_idle_sec=int(os.getenv("HEARTBEAT_IDLE_SEC", "10")),
            heartbeat_active_sec=int(os.getenv("HEARTBEAT_ACTIVE_SEC", "3")),
            active_cameras=[c.strip() for c in raw_cams.split(",") if c.strip()],
            night_ai_enabled=os.getenv("NIGHT_AI_ENABLED", "true").lower() in ("1", "true", "yes"),
            site_lat=float(os.getenv("SITE_LAT", "22.765")),
            site_lon=float(os.getenv("SITE_LON", "113.972")),
            night_sun_margin_min=int(os.getenv("NIGHT_SUN_MARGIN_MIN", "15")),
            night_ai_interval_sec=int(os.getenv("NIGHT_AI_INTERVAL_SEC", "4")),
            night_ai_conf_threshold=float(os.getenv("NIGHT_AI_CONF_THRESHOLD", "0.50")),
            night_ai_confirm_frames=int(os.getenv("NIGHT_AI_CONFIRM_FRAMES", "2")),
            night_ai_cooldown_sec=int(os.getenv("NIGHT_AI_COOLDOWN_SEC", "300")),
            night_ai_model_path=Path(os.getenv("NIGHT_AI_MODEL_PATH", "/opt/aquaponics/models/yolo26n.onnx")),
            day_ai_interval_sec=int(os.getenv("DAY_AI_INTERVAL_SEC", "60")),
            day_ai_conf_threshold=float(os.getenv("DAY_AI_CONF_THRESHOLD", "0.45")),
            day_person_upload_cooldown_sec=int(os.getenv("DAY_PERSON_UPLOAD_COOLDOWN_SEC", "300")),
            face_det_model_path=Path(os.getenv("FACE_DET_MODEL_PATH", "/opt/aquaponics/models/face_detection_yunet_2023mar.onnx")),
            face_rec_model_path=Path(os.getenv("FACE_REC_MODEL_PATH", "/opt/aquaponics/models/face_recognition_sface_2021dec.onnx")),
            face_gallery_path=Path(os.getenv("FACE_GALLERY_PATH", "/opt/aquaponics/faces/gallery.json")),
            face_cos_threshold=float(os.getenv("FACE_COS_THRESHOLD", "0.363")),
            hik_user=os.getenv("HIK_USER", "admin"),
            hik_pass=os.getenv("HIK_PASS", ""),
            cam_ip_map=cam_ip_map,
            night_stranger_flash_enabled=os.getenv("NIGHT_STRANGER_FLASH_ENABLED", "true").lower() in ("1", "true", "yes"),
        )
