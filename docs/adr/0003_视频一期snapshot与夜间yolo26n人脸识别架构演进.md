# ADR-0003：视频一期 snapshot 与夜间 yolo26n 人脸识别架构演进

> **状态**：`Accepted` | **生效时间**：`2026-11-20T12:00:00.000Z`  
> **关联文档**：👉 [09_video_streaming_service/README.md](../04_subsystems/09_video_streaming_service/README.md)

## 背景
早期一期仅计划做“每 10 分钟定时抓拍 + 180 秒按需直播唤醒（不跑 AI）”。但在实际运行中，夜间安防与门口人员到访识别需求强烈，同时用户需要更丰富连贯的历史回看画面。

## 决策
1. **多源时间线融合回看**：将 10 分钟定时快照、15 秒实时抓拍、夜间人体检测报警帧合并到最近 12h / 24h 统一时间线播放。
2. **边缘轻量化 AI 一期落地**：在 N100 上启用 `yolo26n.onnx` 做夜间人体检测，叠加 `YuNet` + `SFace` 识别员工人脸并同步云端 D1 `staff_faces`。
3. **正式域名与 UI 统一**：正式启用 `https://video.guoshu.dev`（弃用临时 `beikee.org` 规划），前端组件统一沉淀到 `@aquaponics/ui`（Shadcn UI + Tailwind v4）。

## 后果与经验备注
* AI 检测仅在设定夜间时段或重点门口机位运行，兼顾 4G 流量控制与 N100 CPU 负载余量。
