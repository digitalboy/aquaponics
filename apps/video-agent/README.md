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
2. 锁定系统 UTC 时钟与 `chrony` 校时：
   ```bash
   sudo timedatectl set-timezone UTC
   sudo apt update && sudo apt install -y ffmpeg chrony python3-venv
   ```
3. 安装并启动 `MediaMTX`（配合同目录 `mediamtx.yml`），随后安装本服务：
   ```bash
   python3 -m venv .venv
   .venv/bin/pip install -e .
   cp .env.example .env  # 填入实际 AGENT_SECRET 与 GATEWAY_URL
   ```
