import asyncio
from datetime import datetime, timezone
import json
import logging
from pathlib import Path
import time
from urllib.parse import quote

import httpx

from .config import AgentConfig
from .face_recognizer import FaceRecognizer
from .ffmpeg_runner import FFmpegRunner
from .hik_light import flash_stranger_white_light
from .person_detector import MotionGateFilter, PersonDetector, draw_person_boxes
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
        self._faces_version: str = ""
        self.face_rec: FaceRecognizer | None = self._init_face_recognizer()

    def _init_face_recognizer(self) -> FaceRecognizer | None:
        if not (self.cfg.face_det_model_path.exists() and self.cfg.face_rec_model_path.exists()):
            return None
        try:
            rec = FaceRecognizer(
                det_model_path=self.cfg.face_det_model_path,
                rec_model_path=self.cfg.face_rec_model_path,
                gallery_path=self.cfg.face_gallery_path,
                cos_threshold=self.cfg.face_cos_threshold,
            )
            logger.info(
                "Face recognizer ready (%d local vectors)",
                sum(len(v) for v in rec.gallery.values()),
            )
            return rec
        except Exception as exc:
            logger.warning("Face recognizer init failed: %s", exc)
            return None

    async def _sync_faces_if_needed(self, client: httpx.AsyncClient, cloud_version: str | None) -> None:
        if not self.face_rec or not cloud_version or cloud_version == self._faces_version:
            return
        res = await self._signed_request(client, "GET", "/api/internal/agent/faces", b"")
        if res.status_code != 200:
            logger.warning("Face gallery sync failed (%s): %s", res.status_code, res.text)
            return
        payload = res.json()
        faces = payload.get("faces")
        if isinstance(faces, dict) and len(faces) > 0:
            count = await asyncio.to_thread(self.face_rec.update_gallery_dict, faces)
            self._faces_version = str(payload.get("faces_version") or cloud_version)
            logger.info("Synced face gallery from cloud: %d vectors (version=%s)", count, self._faces_version)
        elif isinstance(faces, dict):
            self._faces_version = str(payload.get("faces_version") or cloud_version)

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
        person_count: int | None = None,
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
        if person_count is not None:
            item["person_count"] = person_count

        ingest_body = json.dumps({"items": [item]}).encode("utf-8")
        ing = await self._signed_request(client, "POST", "/api/internal/agent/ingest", ingest_body)
        if ing.status_code != 200:
            logger.warning("D1 ingest failed (%s): %s", ing.status_code, ing.text)
            return False

        local_file.unlink(missing_ok=True)
        return True

    async def _capture_prefer_hd(self, cam_id: str, prefer_hd: bool) -> tuple[Path, str] | None:
        """
        优先从 `-HD` 主码流 (2560x1440) 抓帧；若 `-HD` 未配置或超时，自动降级到子码流 (768x432) 保底。
        注：一期 4G 阶段归档/AI 传 prefer_hd=True，实时网页刷新传 self.cfg.live_use_hd (默认 False)；
        未来拉通光纤宽带切换方案 B 时，将 .env 中 LIVE_USE_HD 设为 true 即可。
        """
        if prefer_hd:
            hd_snap = await self.runner.capture_snapshot(f"{cam_id}-HD")
            if hd_snap is not None:
                return hd_snap
        return await self.runner.capture_snapshot(cam_id)

    async def _handle_commands(self, client: httpx.AsyncClient, commands: list[dict]) -> None:
        for cmd in commands:
            cmd_id = cmd["cmd_id"]
            cam_id = cmd["cam_id"]
            action = cmd["action"]
            payload = cmd.get("payload") or {}
            logger.info("Executing command %s: %s on %s", cmd_id, action, cam_id)

            ok = True
            if action == "wake_live":
                live_stream = f"{cam_id}-HD" if self.cfg.live_use_hd else cam_id
                await self.runner.start_live_hls(live_stream, segment_sec=int(payload.get("segment_sec", 4)))
            elif action == "sleep_live":
                await self.runner.stop_live_hls(f"{cam_id}-HD" if self.cfg.live_use_hd else cam_id)
            elif action == "capture_now":
                # 网页 15s 实时刷屏按 live_use_hd 策略走（一期 4G 默认子码流秒开，宽带后可改 LIVE_USE_HD=true）
                snap = await self._capture_prefer_hd(cam_id, prefer_hd=self.cfg.live_use_hd)
                if snap:
                    f, ts = snap
                    date_path = ts[:10].replace("-", "/")
                    r2_key = f"snapshots/{self.cfg.site_id}/{cam_id}/{date_path}/{ts.replace(':', '-')}.jpg"
                    ok = await self._upload_and_ingest(client, f, r2_key, "snapshot", cam_id, ts)
                else:
                    ok = False
            elif action == "extract_face":
                ok = await self._handle_extract_face(client, payload)

            ack_body = json.dumps({"status": "completed" if ok else "failed"}).encode("utf-8")
            await self._signed_request(client, "POST", f"/api/internal/agent/commands/{cmd_id}/ack", ack_body)

    async def _handle_extract_face(self, client: httpx.AsyncClient, payload: dict) -> bool:
        sample_id = str(payload.get("sample_id") or "")
        person_id = str(payload.get("person_id") or "")
        r2_key = str(payload.get("r2_key") or "")
        if not sample_id or not person_id or not r2_key or not self.face_rec:
            return False

        dl_path = f"/api/internal/agent/download/{quote(r2_key, safe='/')}"
        dl_res = await self._signed_request(client, "GET", dl_path, b"")
        if dl_res.status_code != 200:
            err_body = json.dumps(
                {
                    "sample_id": sample_id,
                    "person_id": person_id,
                    "status": "failed",
                    "error_message": f"下载样本失败 ({dl_res.status_code})",
                }
            ).encode("utf-8")
            await self._signed_request(client, "POST", "/api/internal/agent/faces/sample-result", err_body)
            return False

        feat = await asyncio.to_thread(self.face_rec.extract_largest_feature, dl_res.content)
        if feat is None:
            err_body = json.dumps(
                {
                    "sample_id": sample_id,
                    "person_id": person_id,
                    "status": "failed",
                    "error_message": "未检测到清晰人脸，请换一张正面清晰照",
                }
            ).encode("utf-8")
            await self._signed_request(client, "POST", "/api/internal/agent/faces/sample-result", err_body)
            return False

        ok_body = json.dumps(
            {
                "sample_id": sample_id,
                "person_id": person_id,
                "status": "ready",
                "embedding": feat.flatten().tolist(),
            }
        ).encode("utf-8")
        res = await self._signed_request(client, "POST", "/api/internal/agent/faces/sample-result", ok_body)
        if res.status_code == 200:
            self._faces_version = ""  # 强制下次心跳刷新本地底库
            return True
        return False

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
                    await self._sync_faces_if_needed(client, data.get("faces_version"))
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
                    # 定时保底快照：方案 A 下优先取 -HD 主码流 (2560x1440) 归档与历史回看
                    snap = await self._capture_prefer_hd(cam_id, prefer_hd=self.cfg.snapshot_use_hd)
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
        face_rec = self.face_rec

        logger.info(
            "Night AI person guard initialized (lat=%.3f, lon=%.3f, model=%s)",
            self.cfg.site_lat,
            self.cfg.site_lon,
            self.cfg.night_ai_model_path,
        )

        hit_streaks: dict[str, int] = {}
        last_alert_mono: dict[str, float] = {}
        last_day_person_upload_mono: dict[str, float] = {}
        last_guard_state: bool | None = None
        motion_gate = MotionGateFilter()

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
                    motion_gate.reset()

            if not is_night:
                # 白天作业打标模式：不报警不闪灯、不做静态运动过滤（允许工人静止作业），每路最多 5 分钟上传 1 张清晰有人原图
                for cam_id in self.cfg.active_cameras:
                    if self.desired_modes.get(cam_id, "snapshot") == "disabled":
                        continue
                    ram_file: Path | None = None
                    try:
                        # 白天工人作业打标：优先取 -HD 主码流 (2560x1440)，既保证飞书简报极清晰，又大幅提升远景工人检出率
                        snap = await self._capture_prefer_hd(cam_id, prefer_hd=self.cfg.snapshot_use_hd)
                        if not snap:
                            continue
                        ram_file, ts_iso = snap
                        raw_bytes = ram_file.read_bytes()
                        raw_boxes = await asyncio.to_thread(detector.detect_bytes, raw_bytes)
                        day_boxes = [b for b in raw_boxes if b.confidence >= self.cfg.day_ai_conf_threshold]
                        now_mono = time.monotonic()
                        prev_day_up = last_day_person_upload_mono.get(cam_id, 0.0)
                        if day_boxes and (prev_day_up == 0.0 or (now_mono - prev_day_up) >= self.cfg.day_person_upload_cooldown_sec):
                            date_path = ts_iso[:10].replace("-", "/")
                            r2_key = f"snapshots/{self.cfg.site_id}/{cam_id}/{date_path}/{ram_file.name}"
                            ok = await self._upload_and_ingest(
                                client,
                                ram_file,
                                r2_key,
                                "snapshot",
                                cam_id,
                                ts_iso,
                                person_count=len(day_boxes),
                            )
                            if ok:
                                last_day_person_upload_mono[cam_id] = now_mono
                                logger.info("Day work snapshot tagged: cam=%s person_count=%d", cam_id, len(day_boxes))
                    except Exception as exc:
                        logger.warning("Day AI work scan error (%s): %s", cam_id, exc)
                    finally:
                        if ram_file is not None:
                            ram_file.unlink(missing_ok=True)
                await asyncio.sleep(self.cfg.day_ai_interval_sec)
                continue

            for cam_id in self.cfg.active_cameras:
                if self.desired_modes.get(cam_id, "snapshot") == "disabled":
                    continue
                try:
                    # 定时保底快照：方案 A 下优先取 -HD 主码流 (2560x1440) 归档与历史回看
                    snap = await self._capture_prefer_hd(cam_id, prefer_hd=self.cfg.snapshot_use_hd)
                    if not snap:
                        continue
                    ram_file, ts_iso = snap
                    raw_bytes = ram_file.read_bytes()
                    ram_file.unlink(missing_ok=True)

                    raw_boxes = await asyncio.to_thread(detector.detect_bytes, raw_bytes)
                    boxes = motion_gate.filter_moving_boxes(cam_id, raw_bytes, raw_boxes)
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

                    # 本地连抓 6 帧（间隔 1 秒，内存盘零 SSD 擦写），优选 3 张：初现 + 最佳全身 + 去向
                    burst: list[tuple[bytes, str, list]] = [(raw_bytes, ts_iso, boxes)]
                    for _ in range(5):
                        await asyncio.sleep(1.0)
                        next_snap = await self.runner.capture_snapshot(cam_id)
                        if not next_snap:
                            continue
                        next_file, next_ts = next_snap
                        next_bytes = next_file.read_bytes()
                        next_file.unlink(missing_ok=True)
                        next_boxes = await asyncio.to_thread(detector.detect_bytes, next_bytes)
                        burst.append((next_bytes, next_ts, next_boxes))

                    def _frame_score(frame_boxes: list) -> float:
                        return sum((b.x2 - b.x1) * (b.y2 - b.y1) * b.confidence for b in frame_boxes)

                    best_idx = max(range(len(burst)), key=lambda idx: _frame_score(burst[idx][2]))
                    last_idx = len(burst) - 1
                    chosen_indices: list[tuple[int, str]] = [
                        (0, "① 初现/最佳全身" if best_idx == 0 else "① 初现画面"),
                    ]
                    if best_idx not in (0, last_idx):
                        chosen_indices.append((best_idx, "② 最佳全身特写"))
                    if last_idx != 0:
                        last_label = "③ 去向画面" if len(chosen_indices) == 2 else "② 最佳/去向画面" if best_idx == last_idx else "② 去向画面"
                        chosen_indices.append((last_idx, last_label))

                    event_id = f"EVT-PERSON-{int(time.time())}-{cam_id}"
                    date_path = ts_iso[:10].replace("-", "/")
                    uploaded_frames: list[dict[str, str]] = []
                    primary_r2_key = ""

                    for seq, (idx, label) in enumerate(chosen_indices, start=1):
                        f_bytes, f_ts, f_boxes = burst[idx]
                        out_bytes = (
                            await asyncio.to_thread(draw_person_boxes, f_bytes, f_boxes)
                            if f_boxes
                            else f_bytes
                        )
                        f_key = f"events/{self.cfg.site_id}/{cam_id}/{date_path}/{event_id}-{seq}.jpg"
                        up_path = f"/api/internal/agent/upload/{quote(f_key, safe='/')}"
                        up_res = await self._signed_request(client, "PUT", up_path, out_bytes, content_type="image/jpeg")
                        if up_res.status_code == 200:
                            uploaded_frames.append({"label": label, "r2_key": f_key, "captured_at": f_ts})
                            if idx == best_idx or not primary_r2_key:
                                primary_r2_key = f_key

                    if not uploaded_frames or not primary_r2_key:
                        logger.warning("Night AI alert R2 upload failed for all frames (%s)", cam_id)
                        continue

                    best_boxes = burst[best_idx][2] or boxes
                    best_max_conf = max((b.confidence for b in best_boxes), default=max_conf)

                    recognized_names: list[str] = []
                    best_face_sim = 0.0
                    if face_rec is not None:
                        try:
                            hd_snap = await self.runner.capture_snapshot(f"{cam_id}-HD")
                            hd_bytes: bytes | None = None
                            if hd_snap:
                                hd_file, _ = hd_snap
                                hd_bytes = hd_file.read_bytes()
                                hd_file.unlink(missing_ok=True)
                            probe_list = [hd_bytes] if hd_bytes else []
                            probe_list.extend(burst[idx][0] for idx, _ in chosen_indices)
                            for probe in probe_list:
                                matches = await asyncio.to_thread(face_rec.identify_bytes, probe)
                                for m in matches:
                                    if m.name and m.name not in recognized_names:
                                        recognized_names.append(m.name)
                                    if m.name and m.similarity > best_face_sim:
                                        best_face_sim = m.similarity
                                if recognized_names:
                                    break
                        except Exception as exc:
                            logger.warning("Face recognition error (%s): %s", cam_id, exc)

                    alert_body = json.dumps(
                        {
                            "event_id": event_id,
                            "cam_id": cam_id,
                            "r2_key": primary_r2_key,
                            "detected_at": burst[best_idx][1],
                            "person_count": len(best_boxes),
                            "max_confidence": round(best_max_conf, 4),
                            "schedule_note": schedule_note,
                            "frames": uploaded_frames,
                            "recognized_names": recognized_names,
                            "face_similarity": round(best_face_sim, 4) if best_face_sim > 0 else None,
                        }
                    ).encode("utf-8")
                    alert_res = await self._signed_request(client, "POST", "/api/internal/agent/person-alert", alert_body)
                    if alert_res.status_code == 200:
                        last_alert_mono[cam_id] = now_mono
                        hit_streaks[cam_id] = 0
                        logger.warning(
                            "Night AI person alert sent: cam=%s frames=%d count=%d max_conf=%.2f",
                            cam_id,
                            len(uploaded_frames),
                            len(best_boxes),
                            best_max_conf,
                        )
                        if (
                            self.cfg.night_stranger_flash_enabled
                            and not recognized_names
                            and self.cfg.hik_pass
                            and cam_id in self.cfg.cam_ip_map
                        ):
                            asyncio.create_task(
                                flash_stranger_white_light(
                                    cam_id=cam_id,
                                    cam_ip=self.cfg.cam_ip_map[cam_id],
                                    user=self.cfg.hik_user,
                                    password=self.cfg.hik_pass,
                                    cycles=3,
                                    interval_sec=1.0,
                                )
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
