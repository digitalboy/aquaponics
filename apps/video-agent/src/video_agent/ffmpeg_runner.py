import asyncio
from pathlib import Path

from .utils import utc_now_iso


class FFmpegRunner:
    """封装 MediaMTX 本地子码流的快照抓取与按需 HLS 切片，强制剥离音轨 (-an)。"""

    def __init__(self, rtsp_base: str, ram_dir: Path) -> None:
        self.rtsp_base = rtsp_base
        self.ram_dir = ram_dir
        self._live_procs: dict[str, asyncio.subprocess.Process] = {}

    def is_live_active(self, cam_id: str) -> bool:
        proc = self._live_procs.get(cam_id)
        return proc is not None and proc.returncode is None

    async def capture_snapshot(self, cam_id: str) -> tuple[Path, str] | None:
        """从本地 MediaMTX 抓取 1 帧 720p JPG 到内存盘。"""
        out_dir = self.ram_dir / "snapshots" / cam_id
        out_dir.mkdir(parents=True, exist_ok=True)
        ts = utc_now_iso()
        safe_ts = ts.replace(":", "-")
        out_file = out_dir / f"{safe_ts}.jpg"

        cmd = [
            "ffmpeg",
            "-y",
            "-rtsp_transport",
            "tcp",
            "-i",
            f"{self.rtsp_base}/{cam_id}",
            "-an",
            "-frames:v",
            "1",
            "-vf",
            "scale=1280:-2",
            "-q:v",
            "4",
            str(out_file),
        ]
        proc = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=asyncio.subprocess.DEVNULL,
            stderr=asyncio.subprocess.DEVNULL,
        )
        try:
            await asyncio.wait_for(proc.wait(), timeout=15.0)
        except asyncio.TimeoutError:
            proc.kill()
            return None

        if proc.returncode != 0 or not out_file.exists():
            return None
        return out_file, ts

    async def start_live_hls(self, cam_id: str, segment_sec: int = 4) -> None:
        """启动按需 HLS 切片进程（将海康 H.265 子码流转为浏览器兼容 H.264 5fps，强制 -an）。"""
        if self.is_live_active(cam_id):
            return

        hls_dir = self.ram_dir / "hls" / cam_id
        hls_dir.mkdir(parents=True, exist_ok=True)
        playlist = hls_dir / "live.m3u8"
        seg_pattern = str(hls_dir / "%Y%m%dT%H%M%SZ.ts")

        cmd = [
            "ffmpeg",
            "-y",
            "-rtsp_transport",
            "tcp",
            "-i",
            f"{self.rtsp_base}/{cam_id}",
            "-an",
            "-c:v",
            "libx264",
            "-preset",
            "ultrafast",
            "-tune",
            "zerolatency",
            "-r",
            "5",
            "-g",
            "10",
            "-f",
            "hls",
            "-hls_time",
            str(segment_sec),
            "-hls_list_size",
            "6",
            "-hls_flags",
            "delete_segments+append_list+temp_file",
            "-strftime",
            "1",
            "-hls_segment_filename",
            seg_pattern,
            str(playlist),
        ]
        proc = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=asyncio.subprocess.DEVNULL,
            stderr=asyncio.subprocess.DEVNULL,
        )
        self._live_procs[cam_id] = proc

    async def stop_live_hls(self, cam_id: str) -> None:
        """停止按需 HLS 切片进程并清理内存盘临时清单。"""
        proc = self._live_procs.pop(cam_id, None)
        if proc and proc.returncode is None:
            proc.terminate()
            try:
                await asyncio.wait_for(proc.wait(), timeout=5.0)
            except asyncio.TimeoutError:
                proc.kill()
