from datetime import datetime, timezone
import hashlib
import hmac
import os
from pathlib import Path
import shutil


def utc_now_iso() -> str:
    """返回严格 ISO 8601 UTC 字符串 (YYYY-MM-DDTHH:mm:ss.sssZ)。"""
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z"


def filename_to_iso_utc(stem: str) -> str:
    """将安全文件名 (2026-11-19T11-35-37.385Z) 还原为严格 ISO 8601 UTC，确保断网补传保留真实拍摄时刻。"""
    if "T" not in stem:
        return utc_now_iso()
    date_part, time_part = stem.split("T", 1)
    return f"{date_part}T{time_part.replace('-', ':')}"


def build_agent_headers(
    secret: str,
    site_id: str,
    method: str,
    path: str,
    body: bytes,
) -> dict[str, str]:
    """生成与 video-gateway/src/crypto.ts 完全对齐的 HMAC-SHA256 请求头。"""
    ts = utc_now_iso()
    body_hash = hashlib.sha256(body).hexdigest()
    canonical = f"{method.upper()}\n{path}\n{ts}\n{body_hash}"
    sig = hmac.new(secret.encode("utf-8"), canonical.encode("utf-8"), hashlib.sha256).hexdigest()
    return {
        "X-Site-Id": site_id,
        "X-Timestamp": ts,
        "X-Signature": sig,
    }


def get_dir_used_bytes(root: Path) -> int:
    """统计内存盘目录已用字节数。"""
    if not root.exists():
        return 0
    return sum(p.stat().st_size for p in root.rglob("*") if p.is_file())


def enforce_dir_quota(root: Path, max_bytes: int) -> int:
    """当目录体积超过上限时，按修改时间 FIFO 淘汰最旧文件以防爆盘或 OOM。"""
    if not root.exists():
        return 0
    files = [p for p in root.rglob("*") if p.is_file() and not p.name.endswith(".tmp")]
    total = sum(p.stat().st_size for p in files)
    if total <= max_bytes:
        return 0

    files.sort(key=lambda p: p.stat().st_mtime)
    removed = 0
    for f in files:
        if total <= max_bytes:
            break
        size = f.stat().st_size
        f.unlink(missing_ok=True)
        total -= size
        removed += 1
    return removed


def enforce_ram_watermark(root: Path, limit_mb: int, high_water_ratio: float) -> int:
    """当内存盘使用率超过阈值（默认 80%）时，按修改时间 FIFO 淘汰最旧文件以防 OOM。"""
    return enforce_dir_quota(root, int(limit_mb * 1024 * 1024 * high_water_ratio))


def atomic_spool_file(src_ram_file: Path, dest_file: Path) -> Path:
    """将内存盘中已校验的快照原子转存至 SSD 持久队列，防止断电产生半截坏文件。"""
    dest_file.parent.mkdir(parents=True, exist_ok=True)
    tmp_file = dest_file.with_suffix(".jpg.tmp")
    shutil.copyfile(src_ram_file, tmp_file)
    os.replace(tmp_file, dest_file)
    src_ram_file.unlink(missing_ok=True)
    return dest_file
