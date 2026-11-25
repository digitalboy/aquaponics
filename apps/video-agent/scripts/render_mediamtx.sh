#!/usr/bin/env bash
# ==============================================================================
# 【经验教训备注：MediaMTX 配置环境变量渲染脚本】
# 背景：MediaMTX 原生不会展开 YAML 中 paths.*.source 里的 ${HIK_USER}/${HIK_PASS}，
#       若直接把密码写进服务器 mediamtx.yml，后续从 Git 同步脱敏配置会覆盖密码导致
#       mediamtx 报 "not a valid URL" 循环重启崩溃。
#       同时注意：不能把 python -c '...${HIK_USER}...' 直接写在 systemd ExecStartPre 里，
#       因为 systemd 会提前吞掉或误解析 ${VAR} 语法。
# 解法：在 ExecStartPre 调用本独立脚本，读取 .env 中的 HIK_USER/HIK_PASS 渲染到
#       /tmp/mediamtx.runtime.yml (权限 600)，让 Git 仓库始终保持零明文凭据。
# ==============================================================================
set -euo pipefail

python3 - <<'PY'
import os
import pathlib

src = pathlib.Path("/opt/aquaponics/apps/video-agent/mediamtx.yml").read_text(encoding="utf-8")
rendered = src.replace("${HIK_USER}", os.environ["HIK_USER"]).replace("${HIK_PASS}", os.environ["HIK_PASS"])
out = pathlib.Path("/tmp/mediamtx.runtime.yml")
out.write_text(rendered, encoding="utf-8")
os.chmod(out, 0o600)
PY
