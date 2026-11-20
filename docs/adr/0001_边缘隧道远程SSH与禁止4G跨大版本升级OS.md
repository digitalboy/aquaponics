# ADR-0001：边缘隧道远程 SSH 与禁止 4G 跨大版本升级 OS

> **状态**：`Accepted` | **生效时间**：`2026-11-20T11:30:00.000Z`  
> **关联文档**：👉 [02_倍控N100工控机远程SSH与Cloudflare隧道运维SOP.md](../02_requirements_and_plans/04_operations_and_sops/02_%E5%80%8D%E6%8E%A7N100%E5%B7%A5%E6%8E%A7%E6%9C%BA%E8%BF%9C%E7%A8%8BSSH%E4%B8%8ECloudflare%E9%9A%A7%E9%81%93%E8%BF%90%E7%BB%B4SOP.md)

## 背景
基地一期通过 `TP-LINK TL-TR904` 4G 路由器接入公网，无固定公网 IP。同时 N100 边缘工控机（Ubuntu 22.04.5 LTS）出现系统提示升级至 Ubuntu 24.04，而业务代码需要 Python 3.12。

## 决策
1. **远程运维通道**：采用 Cloudflare Tunnel（`guangming-n100`，`ssh.guoshu.dev`）配合用户级 Crontab 保活，实现无公网 IP 下的稳定远程 SSH。
2. **OS 与 Python 解耦**：宿主机操作系统锁定 `Ubuntu 22.04.5 LTS` 长期不动；业务 Python 环境通过 `uv` 隔离升级到 `3.12.16`（`.venv`），保留 `.venv.bak310` 应急回滚。

## 被放弃的备选方案
* 在 4G 远程链路上执行 `do-release-upgrade` 升级到 Ubuntu 24.04（风险极高：一旦重启断网或 OpenSSH/systemd 变更卡住，现场无 KVM 只能人工跑基地接显示器抢救）。

## 后果与经验备注
* 自动化/非交互脚本调用 `ssh n100` 必须加 `-n -o BatchMode=yes`，否则 `ProxyCommand` 下的 `cloudflared.exe` 会阻塞等待 stdin。
* 切换 `.venv` 时不可直接 `mv` 重命名，否则入口脚本 shebang 写死旧路径会引发 systemd `203/EXEC`。
