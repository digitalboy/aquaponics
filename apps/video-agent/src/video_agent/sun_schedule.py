"""天文日出日落时间计算器（NOAA 太阳高度角公式）。

默认坐标为深圳市光明区迳口村 (22.765°N, 113.972°E)，
用于自动判定“天黑到天亮”夜间布防时段，无需任何外部 API。
"""

from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
import math


@dataclass(frozen=True)
class SunTimes:
    sunrise_utc: datetime
    sunset_utc: datetime


def _calc_sun_event_utc(year: int, month: int, day: int, lat: float, lon: float, is_sunrise: bool) -> datetime:
    """使用 NOAA 近似公式计算指定 UTC 日期的日出或日落时间 (UTC)。"""
    n1 = math.floor(275 * month / 9)
    n2 = math.floor((month + 9) / 12)
    n3 = 1 + math.floor((year - 4 * math.floor(year / 4) + 2) / 3)
    n = n1 - (n2 * n3) + day - 30

    lng_hour = lon / 15.0
    t = n + ((6.0 - lng_hour) / 24.0) if is_sunrise else n + ((18.0 - lng_hour) / 24.0)

    m = (0.9856 * t) - 3.289
    l_true = m + (1.916 * math.sin(math.radians(m))) + (0.020 * math.sin(math.radians(2 * m))) + 282.634
    l_true = l_true % 360.0

    ra = math.degrees(math.atan(0.91764 * math.tan(math.radians(l_true)))) % 360.0
    l_quad = math.floor(l_true / 90.0) * 90.0
    ra_quad = math.floor(ra / 90.0) * 90.0
    ra = (ra + (l_quad - ra_quad)) / 15.0

    sin_dec = 0.39782 * math.sin(math.radians(l_true))
    cos_dec = math.cos(math.asin(sin_dec))

    # 太阳天顶角 90.833° 对应太阳上边缘接触地平线（含大气折射）
    cos_h = (math.cos(math.radians(90.833)) - (sin_dec * math.sin(math.radians(lat)))) / (
        cos_dec * math.cos(math.radians(lat))
    )
    cos_h = max(-1.0, min(1.0, cos_h))

    h = 360.0 - math.degrees(math.acos(cos_h)) if is_sunrise else math.degrees(math.acos(cos_h))
    h = h / 15.0

    t_local = h + ra - (0.06571 * t) - 6.622
    ut = (t_local - lng_hour) % 24.0

    base = datetime(year, month, day, tzinfo=timezone.utc)
    return base + timedelta(hours=ut)


def get_sun_times_for_local_date(local_date: datetime, lat: float, lon: float) -> SunTimes:
    """返回指定本地日期（如北京时间）对应的当日日出与日落 UTC 时间。"""
    y, m, d = local_date.year, local_date.month, local_date.day
    sunrise = _calc_sun_event_utc(y, m, d, lat, lon, is_sunrise=True)
    sunset = _calc_sun_event_utc(y, m, d, lat, lon, is_sunrise=False)
    # 东八区日出 UTC 属于同一公历日（~22:00前一天UTC在数学上模24h后可能跨天，修正到与本地正午最近）
    local_noon_utc = datetime(y, m, d, 4, 0, tzinfo=timezone.utc)  # 北京时间 12:00 = UTC 04:00
    while sunrise > local_noon_utc:
        sunrise -= timedelta(days=1)
    while sunrise + timedelta(days=1) <= local_noon_utc:
        sunrise += timedelta(days=1)
    while sunset < local_noon_utc:
        sunset += timedelta(days=1)
    while sunset - timedelta(days=1) >= local_noon_utc:
        sunset -= timedelta(days=1)
    return SunTimes(sunrise_utc=sunrise, sunset_utc=sunset)


def is_night_guard_window(
    now_utc: datetime,
    lat: float = 22.765,
    lon: float = 113.972,
    margin_minutes: int = 15,
) -> tuple[bool, str]:
    """判断当前是否处于「天黑到天亮」布防时段，返回 (is_night, 说明文本)。"""
    cst = timezone(timedelta(hours=8))
    now_cst = now_utc.astimezone(cst)
    today_sun = get_sun_times_for_local_date(now_cst, lat, lon)
    margin = timedelta(minutes=margin_minutes)

    guard_end_today = today_sun.sunrise_utc + margin
    guard_start_today = today_sun.sunset_utc - margin

    if now_utc <= guard_end_today:
        sunrise_cst = today_sun.sunrise_utc.astimezone(cst).strftime("%H:%M")
        return True, f"夜间布防中（今日日出 {sunrise_cst}，延后 {margin_minutes} 分钟撤防）"

    if now_utc >= guard_start_today:
        sunset_cst = today_sun.sunset_utc.astimezone(cst).strftime("%H:%M")
        return True, f"夜间布防中（今日日落 {sunset_cst}，提前 {margin_minutes} 分钟布防）"

    sunset_cst = today_sun.sunset_utc.astimezone(cst).strftime("%H:%M")
    return False, f"日间休眠（今日日落 {sunset_cst} 前 {margin_minutes} 分钟自动布防）"
