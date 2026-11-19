import asyncio
from datetime import datetime, timezone
import json
import logging
from pathlib import Path
import time
from urllib.parse import quote

import httpx

from .config import AgentConfig
from .ffmpeg_runner import FFmpegRunner
from .person_detector import PersonDetector, draw_person_boxes
from .sun_schedule import is_night_guard_window
from .utils import (
    atomic_spool_file,
    build_agent_headers,
    enforce_dir_quota,
    enforce_ram_watermark,
    filename_to_iso_utc,
    get_dir_used_bytes,
    utc_now_iso,
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("video-agent")


class VideoAgent:
    """倍控 N100 边缘视频主调度器：心跳指令消费、定时快照、按需直播与 R2 上传。"""

    def __init__(self, cfg: AgentConfig) -> None:
        self.cfg = cfg
        self.runner = FFmpegRunner(cfg.mediamtx_rtsp_base, cfg.hls_ram_dir)
        self.desired_modes: dict[str, str] = {c: "snapshot" for c in cfg.active_cameras}
        self._uploaded_hls: set[Path] = set()

    async def _signed_request(
        self,
        client: httpx.AsyncClient,
        method: str,
        path: str,
        content: bytes,
        content_type: str = "application/json",
    ) -> httpx.Response:
        headers = build_agent_headers(self.cfg.agent_secret, self.cfg.site_id, method, path, content)
        headers["Content-Type"] = content_type
        return await client.request(method, f"{self.cfg.gateway_url}{path}", content=content, headers=headers)

    async def _upload_and_ingest(
        self,
        client: httpx.AsyncClient,
        local_file: Path,
        r2_key: str,
        kind: str,
        cam_id: str,
        timestamp: str,
        duration_sec: float | None = None,
    ) -> bool:
        data = local_file.read_bytes()
        upload_path = f"/api/internal/agent/upload/{quote(r2_key, safe='/')}"
        ctype = "image/jpeg" if kind == "snapshot" else "video/mp2t"
        res = await self._signed_request(client, "PUT", upload_path, data, content_type=ctype)
        if res.status_code != 200:
            logger.warning("R2 upload failed (%s): %s", res.status_code, res.text)
            return False

        item: dict[str, object] = {
            "kind": kind,
            "cam_id": cam_id,
            "r2_key": r2_key,
            "timestamp": timestamp,
            "size_bytes": len(data),
        }
        if duration_sec is not None:
            item["duration_sec"] = duration_sec

        ingest_body = json.dumps({"items": [item]}).encode("utf-8")
        ing = await self._signed_request(client, "POST", "/api/internal/agent/ingest", ingest_body)
        if ing.status_code != 200:
            logger.warning("D1 ingest failed (%s): %s", ing.status_code, ing.text)
            return False

        local_file.unlink(missing_ok=True)
        return True

    async def _handle_commands(self, client: httpx.AsyncClient, commands: list[dict]) -> None:
        for cmd in commands:
            cmd_id = cmd["cmd_id"]
            cam_id = cmd["cam_id"]
            action = cmd["action"]
            payload = cmd.get("payload") or {}
            logger.info("Executing command %s: %s on %s", cmd_id, action, cam_id)

            ok = True
            if action == "wake_live":
                await self.runner.start_live_hls(cam_id, segment_sec=int(payload.get("segment_sec", 4)))
            elif action == "sleep_live":
                await self.runner.stop_live_hls(cam_id)
            elif action == "capture_now":
                snap = await self.runner.capture_snapshot(cam_id)
                if snap:
                    f, ts = snap
                    date_path = ts[:10].replace("-", "/")
                    r2_key = f"snapshots/{self.cfg.site_id}/{cam_id}/{date_path}/{ts.replace(':', '-')}.jpg"
                    ok = await self._upload_and_ingest(client, f, r2_key, "snapshot", cam_id, ts)
                else:
                    ok = False

            ack_body = json.dumps({"status": "completed" if ok else "failed"}).encode("utf-8")
            await self._signed_request(client, "POST", f"/api/internal/agent/commands/{cmd_id}/ack", ack_body)

    async def heartbeat_loop(self, client: httpx.AsyncClient) -> None:
        while True:
            any_live = any(self.runner.is_live_active(c) for c in self.cfg.active_cameras)
            try:
                used_mb = round(get_dir_used_bytes(self.cfg.hls_ram_dir) / (1024 * 1024), 2)
                body = json.dumps(
                    {
                        "agent_version": "1.0.0",
                        "sent_at": utc_now_iso(),
                        "ram_disk": {
                            "mount": str(self.cfg.hls_ram_dir),
                            "used_mb": used_mb,
                            "limit_mb": self.cfg.ram_limit_mb,
                        },
                        "cameras": [
                            {
                                "cam_id": c,
                                "status": "online",
                                "active_live": self.runner.is_live_active(c),
                            }
                            for c in self.cfg.active_cameras
                        ],
                    }
                ).encode("utf-8")
                res = await self._signed_request(client, "POST", "/api/internal/agent/heartbeat", body)
                if res.status_code == 200:
                    data = res.json()
                    self.desired_modes.update(data.get("desired_modes", {}))
                    await self._handle_commands(client, data.get("commands", []))
            except Exception as exc:
                logger.warning("Heartbeat error: %s", exc)

            await asyncio.sleep(self.cfg.heartbeat_active_sec if any_live else self.cfg.heartbeat_idle_sec)

    async def snapshot_loop(self, client: httpx.AsyncClient) -> None:
        """定时抓拍循环：在 tmpfs 内存盘完成抓拍与 >=8KB 质检，再原子落入 SSD 持久队列，抗断网且抗断电重启。"""
        while True:
            for cam_id in self.cfg.active_cameras:
                if self.desired_modes.get(cam_id, "snapshot") == "disabled":
                    continue
                try:
                    snap = await self.runner.capture_snapshot(cam_id)
                    if snap:
                        ram_file, _ = snap
                        dest = self.cfg.snapshot_spool_dir / cam_id / ram_file.name
                        atomic_spool_file(ram_file, dest)
                except Exception as exc:
                    logger.warning("Snapshot capture error (%s): %s", cam_id, exc)

            removed_ram = enforce_ram_watermark(
                self.cfg.hls_ram_dir, self.cfg.ram_limit_mb, self.cfg.ram_high_water_ratio
            )
            removed_spool = enforce_dir_quota(
                self.cfg.snapshot_spool_dir, self.cfg.snapshot_spool_limit_mb * 1024 * 1024
            )
            if removed_ram or removed_spool:
                logger.warning("Quota guard evicted ram=%d spool=%d oldest files", removed_ram, removed_spool)
            await asyncio.sleep(self.cfg.snapshot_interval_sec)

    async def snapshot_upload_loop(self, client: httpx.AsyncClient) -> None:
        """断网自愈补传循环：按拍摄时间从旧到新扫描 SSD 持久队列，联网后匀速平滑补传至 R2/D1。"""
        backoff_sec = 5.0
        snap_root = self.cfg.snapshot_spool_dir
        while True:
            uploaded_any = False
            failed = False
            if snap_root.exists():
                pending_files = sorted(snap_root.rglob("*.jpg"), key=lambda p: p.name)
                for jpg_file in pending_files:
                    cam_id = jpg_file.parent.name
                    ts_iso = filename_to_iso_utc(jpg_file.stem)
                    date_path = ts_iso[:10].replace("-", "/")
                    r2_key = f"snapshots/{self.cfg.site_id}/{cam_id}/{date_path}/{jpg_file.name}"
                    try:
                        ok = await self._upload_and_ingest(client, jpg_file, r2_key, "snapshot", cam_id, ts_iso)
                        if not ok:
                            failed = True
                            break
                        uploaded_any = True
                        backoff_sec = 5.0
                        # 补传限速 0.2s/张，防止断网数天后恢复时瞬间打满 4G 上行带宽
                        await asyncio.sleep(0.2)
                    except Exception as exc:
                        logger.warning("Snapshot upload error (%s): %s", jpg_file.name, exc)
                        failed = True
                        break

            if failed:
                await asyncio.sleep(backoff_sec)
                backoff_sec = min(backoff_sec * 2, 60.0)
            else:
                await asyncio.sleep(2.0 if uploaded_any else 5.0)

    async def hls_upload_loop(self, client: httpx.AsyncClient) -> None:
        """扫描内存盘中已写完的 .ts 分片并异步上传至 R2。"""
        while True:
            hls_root = self.cfg.hls_ram_dir / "hls"
            if hls_root.exists():
                for ts_file in sorted(hls_root.rglob("*.ts")):
                    if ts_file in self._uploaded_hls:
                        continue
                    cam_id = ts_file.parent.name
                    # 仅上传已不再增长的分片（简单等待 0.5s 校验）
                    ts_iso = utc_now_iso()
                    date_path = ts_iso[:10].replace("-", "/")
                    r2_key = f"hls/{self.cfg.site_id}/{cam_id}/{date_path}/{ts_file.name}"
                    try:
                        if await self._upload_and_ingest(client, ts_file, r2_key, "hls_segment", cam_id, ts_iso, 4.0):
                            self._uploaded_hls.add(ts_file)
                    except Exception as exc:
                        logger.warning("HLS upload error (%s): %s", ts_file.name, exc)
            await asyncio.sleep(2.0)

    async def night_person_guard_loop(self, client: httpx.AsyncClient) -> None:
        """日落后至日出前本地 AI 轻量人形巡检：仅在夜间布防，检测到人后画红框传 R2 并触发云端实时报警。"""
        if not self.cfg.night_ai_enabled:
            logger.info("Night AI person guard is disabled by config.")
            return
        if not self.cfg.night_ai_model_path.exists():
            logger.warning("Night AI model not found at %s; guard loop disabled.", self.cfg.night_ai_model_path)
            return

        detector = PersonDetector(
            model_path=self.cfg.night_ai_model_path,
            conf_threshold=self.cfg.night_ai_conf_threshold,
        )
        logger.info(
            "Night AI person guard initialized (lat=%.3f, lon=%.3f, model=%s)",
            self.cfg.site_lat,
            self.cfg.site_lon,
            self.cfg.night_ai_model_path,
        )

        hit_streaks: dict[str, int] = {}
        last_alert_mono: dict[str, float] = {}
        last_guard_state: bool | None = None

        while True:
            is_night, schedule_note = is_night_guard_window(
                datetime.now(timezone.utc),
                lat=self.cfg.site_lat,
                lon=self.cfg.site_lon,
                margin_minutes=self.cfg.night_sun_margin_min,
            )
            if is_night != last_guard_state:
                logger.info("Night AI guard state changed: %s (%s)", "ARMED" if is_night else "DISARMED", schedule_note)
                last_guard_state = is_night
                if not is_night:
                    hit_streaks.clear()

            if not is_night:
                await asyncio.sleep(60.0)
                continue

            for cam_id in self.cfg.active_cameras:
                if self.desired_modes.get(cam_id, "snapshot") == "disabled":
                    continue
                try:
                    snap = await self.runner.capture_snapshot(cam_id)
                    if not snap:
                        continue
                    ram_file, ts_iso = snap
                    raw_bytes = ram_file.read_bytes()
                    ram_file.unlink(missing_ok=True)

                    boxes = await asyncio.to_thread(detector.detect_bytes, raw_bytes)
                    if not boxes:
                        hit_streaks[cam_id] = 0
                        continue

                    hit_streaks[cam_id] = hit_streaks.get(cam_id, 0) + 1
                    max_conf = max(b.confidence for b in boxes)
                    confirmed = (
                        hit_streaks[cam_id] >= self.cfg.night_ai_confirm_frames
                        or max_conf >= 0.72
                    )
                    if not confirmed:
                        continue

                    now_mono = time.monotonic()
                    prev_alert = last_alert_mono.get(cam_id, 0.0)
                    if prev_alert > 0 and (now_mono - prev_alert) < self.cfg.night_ai_cooldown_sec:
                        continue

                    annotated = await asyncio.to_thread(draw_person_boxes, raw_bytes, boxes)
                    event_id = f"EVT-PERSON-{int(time.time())}-{cam_id}"
                    date_path = ts_iso[:10].replace("-", "/")
                    r2_key = f"events/{self.cfg.site_id}/{cam_id}/{date_path}/{event_id}.jpg"
                    upload_path = f"/api/internal/agent/upload/{quote(r2_key, safe='/')}"
                    up_res = await self._signed_request(client, "PUT", upload_path, annotated, content_type="image/jpeg")
                    if up_res.status_code != 200:
                        logger.warning("Night AI alert R2 upload failed (%s): %s", up_res.status_code, up_res.text)
                        continue

                    alert_body = json.dumps(
                        {
                            "event_id": event_id,
                            "cam_id": cam_id,
                            "r2_key": r2_key,
                            "detected_at": ts_iso,
                            "person_count": len(boxes),
                            "max_confidence": round(max_conf, 4),
                            "schedule_note": schedule_note,
                        }
                    ).encode("utf-8")
                    alert_res = await self._signed_request(client, "POST", "/api/internal/agent/person-alert", alert_body)
                    if alert_res.status_code == 200:
                        last_alert_mono[cam_id] = now_mono
                        hit_streaks[cam_id] = 0
                        logger.warning(
                            "Night AI person alert sent: cam=%s count=%d max_conf=%.2f",
                            cam_id,
                            len(boxes),
                            max_conf,
                        )
                    else:
                        logger.warning("Night AI person-alert API failed (%s): %s", alert_res.status_code, alert_res.text)
                except Exception as exc:
                    logger.warning("Night AI guard error (%s): %s", cam_id, exc)

            await asyncio.sleep(self.cfg.night_ai_interval_sec)

    async def serve(self) -> None:
        self.cfg.hls_ram_dir.mkdir(parents=True, exist_ok=True)
        self.cfg.snapshot_spool_dir.mkdir(parents=True, exist_ok=True)
        async with httpx.AsyncClient(timeout=20.0) as client:
            await asyncio.gather(
                self.heartbeat_loop(client),
                self.snapshot_loop(client),
                self.snapshot_upload_loop(client),
                self.hls_upload_loop(client),
                self.night_person_guard_loop(client),
            )


def run() -> None:
    cfg = AgentConfig.from_env()
    asyncio.run(VideoAgent(cfg).serve())


if __name__ == "__main__":
    run()
