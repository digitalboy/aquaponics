"""海康摄像机补光灯 ISAPI 控制模块（用于夜间陌生人威慑闪烁）。"""

import asyncio
import logging

import httpx

logger = logging.getLogger("video-agent.hik-light")

_ACTIVE_FLASH_CAMS: set[str] = set()

_EVENT_INTELLIGENCE_XML = """<?xml version="1.0" encoding="UTF-8"?>
<SupplementLight version="2.0" xmlns="http://www.hikvision.com/ver20/XMLSchema">
<supplementLightMode>eventIntelligence</supplementLightMode>
<mixedLightBrightnessRegulatMode>auto</mixedLightBrightnessRegulatMode>
<whiteLightBrightness>100</whiteLightBrightness>
<irLightBrightness>100</irLightBrightness>
<EventIntelligenceModeCfg>
<brightnessRegulatMode>auto</brightnessRegulatMode>
<whiteLightBrightness>100</whiteLightBrightness>
<irLightBrightness>100</irLightBrightness>
<associatedVMDHuman>true</associatedVMDHuman>
</EventIntelligenceModeCfg>
</SupplementLight>"""


def _manual_white_light_xml(brightness: int) -> str:
    val = max(0, min(100, int(brightness)))
    return (
        '<?xml version="1.0" encoding="UTF-8"?>'
        '<SupplementLight version="2.0" xmlns="http://www.hikvision.com/ver20/XMLSchema">'
        "<supplementLightMode>colorVuWhiteLight</supplementLightMode>"
        "<mixedLightBrightnessRegulatMode>manual</mixedLightBrightnessRegulatMode>"
        f"<whiteLightBrightness>{val}</whiteLightBrightness>"
        "<irLightBrightness>100</irLightBrightness>"
        "</SupplementLight>"
    )


async def flash_stranger_white_light(
    cam_id: str,
    cam_ip: str,
    user: str,
    password: str,
    cycles: int = 3,
    interval_sec: float = 1.0,
) -> None:
    """
    在白光模式下让 whiteLightBrightness 在 100 与 0 之间切换 N 次（每次间隔约 1 秒），
    最后恢复为 eventIntelligence 智能双光模式。
    """
    if not cam_ip or not password or cam_id in _ACTIVE_FLASH_CAMS:
        return

    _ACTIVE_FLASH_CAMS.add(cam_id)
    url = f"http://{cam_ip}/ISAPI/Image/channels/1/supplementLight"
    auth = httpx.DigestAuth(user, password)
    headers = {"Content-Type": "application/xml"}

    try:
        async with httpx.AsyncClient(timeout=5.0, auth=auth) as client:
            for i in range(cycles):
                res_on = await client.put(url, content=_manual_white_light_xml(100), headers=headers)
                res_on.raise_for_status()
                await asyncio.sleep(interval_sec)

                res_off = await client.put(url, content=_manual_white_light_xml(0), headers=headers)
                res_off.raise_for_status()
                if i < cycles - 1:
                    await asyncio.sleep(interval_sec)
        logger.info("Stranger deterrence white-light flash completed: cam=%s ip=%s cycles=%d", cam_id, cam_ip, cycles)
    except Exception as exc:
        logger.warning("Failed to flash white light on %s (%s): %s", cam_id, cam_ip, exc)
    finally:
        # 无论中途是否超时或异常，必须恢复 eventIntelligence，避免摄像头长期停留在白光常亮或熄灭状态
        try:
            async with httpx.AsyncClient(timeout=5.0, auth=auth) as client:
                await client.put(url, content=_EVENT_INTELLIGENCE_XML, headers=headers)
        except Exception as restore_exc:
            logger.warning("Failed to restore eventIntelligence on %s (%s): %s", cam_id, cam_ip, restore_exc)
        _ACTIVE_FLASH_CAMS.discard(cam_id)
