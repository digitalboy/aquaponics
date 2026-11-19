# Aquaponics Edge Video Agent (倍控 N100 Ubuntu)

部署在主控制柜倍控 N100 工控机上的边缘视频采集与推流守护服务：
* 从本地 `MediaMTX` 复用海康枪机 `720p / 5fps / H.264` 子码流；
* 全部临时快照与 HLS 分片写入 `/mnt/hls_ram`（`tmpfs` 内存盘），**0 写入 128G 系统 SSD**；
* 默认运行在 4G 省流 `snapshot` 模式（每 10 分钟抓拍 1 张传 R2），收到云端 `wake_live` 指令后按需推流。

## N100 现场初始化步骤 (M0/M1)

1. 挂载 `512M` 内存盘（写入 `/etc/fstab`）：
   ```bash
   sudo mkdir -p /mnt/hls_ram
   echo "tmpfs /mnt/hls_ram tmpfs defaults,noatime,nosuid,nodev,size=512M 0 0" | sudo tee -a /etc/fstab
   sudo mount -a
   ```
2. 锁定系统 UTC 时钟与 `chrony` 局域网授时中心（供 NVR/摄像头/PLC 对时）：
   ```bash
   sudo timedatectl set-timezone UTC
   sudo apt update && sudo apt install -y ffmpeg chrony python3-venv
   ```
   在 `/etc/chrony/chrony.conf` 追加阿里云 NTP 上游与局域网授时放行（`allow 192.168.0.0/22`、`allow 192.168.1.0/24`、`local stratum 10`）。  
   **每次新装海康摄像头或 NVR 后**，运行一键授时脚本指向 `192.168.0.50`：
   ```bash
   HIK_PASS='你的密码' ./scripts/sync_hikvision_ntp.sh 192.168.0.201 192.168.0.214 192.168.0.217
   ```
3. 安装并启动 `MediaMTX`（配合同目录 `mediamtx.yml`），随后安装本服务：
   ```bash
   python3 -m venv .venv
   .venv/bin/pip install -e .
   cp .env.example .env  # 填入实际 AGENT_SECRET 与 GATEWAY_URL
   ```
