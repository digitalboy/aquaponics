# 连锁数字化农业工厂：02_倍控 N100 工控机远程 SSH 与 Cloudflare 隧道运维 SOP

> **版本与状态**：`Version 1.0.0` | **适用对象**：系统架构师、后端/边缘开发工程师、现场运维人员  
> **生效时间**：`2026-11-20T11:30:00.000Z` (严格遵循 ISO 8601 UTC)  
> **关联架构文档**：👉 [09_视频监控与流媒体微服务架构设计规范](../../04_subsystems/09_video_streaming_service/README.md) · [09_全厂视频监控PoE网络布线与交换机端口线号施工规范](../03_engineering_specs/09_全厂视频监控PoE网络布线与交换机端口线号施工规范.md)

> [!CAUTION]
> **【安全红线：严禁明文凭据入库】**  
> Cloudflare Tunnel Token（`eyJ...`）、N100 登录密码、海康摄像机/NVR 密码等敏感凭据**严禁**写入任何 Git 仓库文件、Markdown 文档或前端代码中。  
> 本文档仅记录路径与操作规范；真实 Tunnel Token 仅存放在 N100 本地 `/home/abc/.local/bin/run_cloudflared.sh`（以及 Cloudflare One 控制台）中。

---

## 一、 双通道连接方式速查

基地一期采用 **TP-LINK TL-TR904 4G 路由器**，无公网固定 IP，因此同时配置了**局域网直连**与 **Cloudflare Tunnel 公网穿透**两条 SSH 通道：

| 场景 | 命令 | 底层链路 | 说明 |
| :--- | :--- | :--- | :--- |
| **外出 / 远程办公（推荐日常）** | `ssh n100` | Windows `cloudflared` → Cloudflare Edge → N100 `cloudflared` → `localhost:22` | 无需公网 IP，支持 4G/宽带任意网络环境 |
| **现场同一局域网直连** | `ssh n100-lan` | 本机 → `192.168.1.50:22` | 局域网内零外部依赖，适合现场大文件拷贝或隧道排障 |
| **自动化脚本 / 非交互命令** | `ssh -n -o BatchMode=yes n100 "<cmd>"` | 同 `ssh n100` | **必须加 `-n -o BatchMode=yes`**，防止 stdin 阻塞挂死 |

> [!TIP]
> **关于代理（中国大陆网络环境）**：  
> 本机通过 `cloudflared access ssh` 连接 `ssh.guoshu.dev` 时，支持直连，也兼容本地代理（如 `HTTP_PROXY=http://127.0.0.1:7890` / `HTTPS_PROXY=http://127.0.0.1:7890`）。若遇到某条链路偶发超时，可切换“直连 / 代理”快速对比排查。

---

## 二、 Windows 控制端配置（开发者本机）

### 2.1 安装 `cloudflared` 客户端
* 本地可执行文件路径：`C:\Users\<User>\.local\bin\cloudflared.exe`（当前验证版本：`2026.11.1`）。
* 确认版本命令（PowerShell）：
  ```powershell
  C:\Users\David\.local\bin\cloudflared.exe --version
  ```

### 2.2 配置 `~/.ssh/config` 与密钥免密
1. 使用 Ed25519 公钥（`~/.ssh/id_ed25519.pub`）写入 N100 的 `/home/abc/.ssh/authorized_keys`，实现免密码登录。
2. 在 `C:\Users\David\.ssh\config` 中维护如下配置：

```sshconfig
Host n100-lan
  HostName 192.168.1.50
  User abc

Host ssh.guoshu.dev n100
  HostName ssh.guoshu.dev
  User abc
  ProxyCommand C:\Users\David\.local\bin\cloudflared.exe access ssh --hostname %h
```

---

## 三、 N100 边缘端配置与断线自愈机制

### 3.1 基础主机与隧道资产信息
* **宿主机系统**：Ubuntu 22.04.5 LTS（系统自带 Python `3.10.12`，保持不动）
* **边缘局域网 IP**：`192.168.1.50`（PoE 交换机 Port 13）
* **SSH 运维账号**：`abc`
* **N100 `cloudflared` 路径**：`/home/abc/.local/bin/cloudflared`（`2026.11.1`）
* **Cloudflare Tunnel 名称**：`guangming-n100`
* **Cloudflare Tunnel ID**：`c1500a11-26fc-4f1b-9e80-bbe5ca213d62`
* **Public Hostname 映射**：`ssh.guoshu.dev` $\rightarrow$ `ssh://localhost:22`

### 3.2 启动脚本与 Crontab 保活（无需 root 密码）
为避免 4G 网络抖动或工控机重启后隧道失联，N100 上采用用户级脚本 + Crontab 每分钟巡检自愈：

1. **启动脚本**：`/home/abc/.local/bin/run_cloudflared.sh`
   * 负责以后台方式启动 `/home/abc/.local/bin/cloudflared tunnel run --token <REDACTED>`，并将运行日志输出到 `/home/abc/cloudflared.log`。
   * 若需要轮换 Token，在 Cloudflare One 控制台重新生成后，仅需更新该脚本中的 Token 并重启 `cloudflared` 进程即可。
2. **Crontab 守护规则**（`crontab -l` 查看）：
   * `@reboot`：工控机上电/重启后自动拉起 `run_cloudflared.sh`。
   * `* * * * *`：每分钟检查 `cloudflared` 进程是否存在，若意外退出则自动拉起。

### 3.3 零信任访问控制（可选加固）
如需限制公网可访问人员，可在 **Cloudflare One $\rightarrow$ Access $\rightarrow$ Applications** 中为 `ssh.guoshu.dev` 添加自托管应用策略，绑定管理员邮箱白名单（OTP 一次性验证码）。

---

## 四、 N100 核心目录与日常服务运维命令

### 4.1 关键路径清单

| 用途 | 路径 | 说明 |
| :--- | :--- | :--- |
| **边缘 Agent 仓库** | `/opt/aquaponics/apps/video-agent/` | 视频抓拍、夜间 AI 人体检测、人脸识别与上传服务源码 |
| **Python 虚拟环境** | `/opt/aquaponics/apps/video-agent/.venv` | **Python 3.12.16**（由 `uv 0.13.9` 管理） |
| **应急回滚环境** | `/opt/aquaponics/apps/video-agent/.venv.bak310` | 原 Python 3.10 环境备份，非必要勿删 |
| **AI 模型目录** | `/opt/aquaponics/models/` | `yolo26n.onnx`、`face_detection_yunet_2023mar.onnx`、`face_recognition_sface_2021dec.onnx` |
| **人脸特征库** | `/opt/aquaponics/faces/` | `gallery.json` 及从云端同步的员工特征向量 |
| **离线补传队列** | `/var/spool/aquaponics/snapshots` | 断网暂存快照目录 |
| **内存切片盘** | `/mnt/hls_ram` | `tmpfs` 内存盘，防止高频视频切片写爆 SSD |
| **隧道运行日志** | `/home/abc/cloudflared.log` | `cloudflared` 连接与重连日志 |

### 4.2 高频排障与服务控制命令

```bash
# 1. 查看视频采集与 AI 服务状态
sudo systemctl status video-agent mediamtx --no-pager

# 2. 查看最近 50 行实时日志
sudo journalctl -u video-agent -n 50 --no-pager

# 3. 重启视频 Agent（更新代码或模型后）
sudo systemctl restart video-agent

# 4. 检查 Cloudflare Tunnel 进程与最近日志
pgrep -af cloudflared && tail -n 30 /home/abc/cloudflared.log

# 5. 检查内存盘与系统盘剩余空间
df -h /mnt/hls_ram /
```

---

## 五、 经验教训与避坑备注（反复调试沉淀）

> [!WARNING]
> **【经验教训 1】非交互脚本调用 `ssh n100` 必须加 `-n -o BatchMode=yes`**  
> 在 PowerShell 脚本、自动化任务或 AI Agent 工具链中直接执行 `ssh n100 "..."` 时，由于底层走了 `ProxyCommand cloudflared.exe access ssh`，`ssh` 会尝试从标准输入读取数据，导致命令长时间阻塞无响应。  
> **正确写法**：始终使用 `ssh -n -o BatchMode=yes n100 "<command>"`。

> [!WARNING]
> **【经验教训 2】切勿直接重命名 Python `.venv` 目录导致 systemd 报 `203/EXEC`**  
> 通过 `mv .venv312 .venv` 方式切换虚拟环境时，`.venv/bin/video-agent` 首行 shebang 仍写死旧路径 `/opt/.../.venv312/bin/python`，会导致 `video-agent.service` 启动报 `status=203/EXEC`。  
> **正确做法**：直接使用 `uv venv --python 3.12 .venv` 原位创建环境并执行 `uv pip install -e .`，或重建后核对 `head -n 1 .venv/bin/video-agent` 的解释器路径。

> [!CAUTION]
> **【经验教训 3】严禁在 4G 远程链路下对生产工控机执行跨大版本系统升级**  
> Ubuntu 系统提示升级到 `24.04`（`do-release-upgrade`）时，**禁止远程执行**。4G 链路下升级内核、systemd、openssh 与系统 Python 极易引发网络中断或重启卡死，且现场无硬件 KVM 时必须人工跑一趟基地插显示器抢救。  
> **长期策略**：宿主机维持 `Ubuntu 22.04.5 LTS` 稳定底座，业务运行环境统一通过 `uv` 在 `.venv` 中独立升级 Python 版本。

> [!NOTE]
> **【经验教训 4】Tunnel Token 泄露应急处置**  
> 若不慎将 `run_cloudflared.sh` 中的 Token 暴露在终端截图或聊天记录中，应立即登录 Cloudflare One 控制台删除并重建/轮换该 Tunnel Token，随后更新 N100 本地脚本并重启 `cloudflared` 进程。
