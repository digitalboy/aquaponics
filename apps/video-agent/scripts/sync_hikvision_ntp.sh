#!/usr/bin/env bash
# ==============================================================================
# 【经验教训备注：海康 NVR 与摄像头局域网统一授时脚本】
# 背景：现场海康 NVR (192.168.0.201) 与枪机 (192.168.0.x) 处于 192.168.0.x 网段，
#       无法穿透 192.168.1.1 路由器直接访问公网 NTP，长期运行会漂移数分钟。
# 解法：倍控 N100 启用 chrony 局域网 NTP Server（上游同步 ntp.aliyun.com，断网由 RTC 兜底），
#       新装任何海康摄像头或 NVR 后，执行本脚本将其 NTP 指向 192.168.0.50，
#       确保画面 OSD 水印、本地录像与云端 5s 传感器宽表时间严格对齐。
# 用法：HIK_PASS='你的密码' ./sync_hikvision_ntp.sh 192.168.0.214 192.168.0.217
# ==============================================================================
set -euo pipefail

HIK_USER="${HIK_USER:-admin}"
HIK_PASS="${HIK_PASS:?请先设置 HIK_PASS 环境变量}"
NTP_SERVER_IP="${NTP_SERVER_IP:-192.168.0.50}"

if [ "$#" -eq 0 ]; then
  echo "用法: HIK_PASS='密码' $0 <设备IP1> [设备IP2 ...]"
  exit 1
fi

for ip in "$@"; do
  echo ">>> 正在配置 $ip 授时 -> $NTP_SERVER_IP:123 (CST-8)"
  # 兼容海康 NVR (v1.0 hostName) 与枪机 (v2.0 ipAddress)
  if curl -fsS --digest -u "${HIK_USER}:${HIK_PASS}" "http://${ip}/ISAPI/System/time/ntpServers" | grep -q 'version="1.0"'; then
    curl -fsS --digest -u "${HIK_USER}:${HIK_PASS}" -X PUT -H "Content-Type: application/xml" \
      -d "<?xml version=\"1.0\" encoding=\"UTF-8\"?><NTPServer version=\"1.0\" xmlns=\"http://www.hikvision.com/ver20/XMLSchema\"><id>1</id><addressingFormatType>hostname</addressingFormatType><hostName>${NTP_SERVER_IP}</hostName><portNo>123</portNo><synchronizeInterval>60</synchronizeInterval><portType>auto</portType><devicePortNoValid>no</devicePortNoValid></NTPServer>" \
      "http://${ip}/ISAPI/System/time/ntpServers/1" >/dev/null
  else
    curl -fsS --digest -u "${HIK_USER}:${HIK_PASS}" -X PUT -H "Content-Type: application/xml" \
      -d "<?xml version=\"1.0\" encoding=\"UTF-8\"?><NTPServer version=\"2.0\" xmlns=\"http://www.hikvision.com/ver20/XMLSchema\"><id>1</id><addressingFormatType>ipaddress</addressingFormatType><ipAddress>${NTP_SERVER_IP}</ipAddress><portNo>123</portNo><synchronizeInterval>60</synchronizeInterval></NTPServer>" \
      "http://${ip}/ISAPI/System/time/ntpServers/1" >/dev/null
  fi

  curl -fsS --digest -u "${HIK_USER}:${HIK_PASS}" -X PUT -H "Content-Type: application/xml" \
    -d '<?xml version="1.0" encoding="UTF-8"?><Time version="2.0" xmlns="http://www.hikvision.com/ver20/XMLSchema"><timeMode>NTP</timeMode><timeZone>CST-8:00:00</timeZone></Time>' \
    "http://${ip}/ISAPI/System/time" >/dev/null

  curl -fsS --digest -u "${HIK_USER}:${HIK_PASS}" "http://${ip}/ISAPI/System/time" | grep -E "timeMode|localTime"
done
