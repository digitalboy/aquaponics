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
    mediamtx_rtsp_base: str
    snapshot_interval_sec: int
    heartbeat_idle_sec: int
    heartbeat_active_sec: int
    active_cameras: list[str]

    @classmethod
    def from_env(cls) -> "AgentConfig":
        raw_cams = os.getenv(
            "ACTIVE_CAMERAS",
            "CAM-GATE-IN-01,CAM-GATE-OUT-01,CAM-BACK-IN-01,CAM-FISH-PAN-01,CAM-FISH-P5-01,CAM-HYDRO-PAN-01,CAM-EQUIP-IN-01",
        )
        return cls(
            gateway_url=os.environ["VIDEO_GATEWAY_URL"].rstrip("/"),
            site_id=os.getenv("SITE_ID", "guangming-01"),
            agent_secret=os.environ["AGENT_SECRET"],
            hls_ram_dir=Path(os.getenv("HLS_RAM_DIR", "/mnt/hls_ram")),
            ram_limit_mb=int(os.getenv("RAM_LIMIT_MB", "512")),
            ram_high_water_ratio=float(os.getenv("RAM_HIGH_WATER_RATIO", "0.80")),
            mediamtx_rtsp_base=os.getenv("MEDIAMTX_RTSP_BASE", "rtsp://127.0.0.1:8554").rstrip("/"),
            snapshot_interval_sec=int(os.getenv("SNAPSHOT_INTERVAL_SEC", "600")),
            heartbeat_idle_sec=int(os.getenv("HEARTBEAT_IDLE_SEC", "10")),
            heartbeat_active_sec=int(os.getenv("HEARTBEAT_ACTIVE_SEC", "3")),
            active_cameras=[c.strip() for c in raw_cams.split(",") if c.strip()],
        )
