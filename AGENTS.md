# AGENTS.md — 仓库工程与文档协作规范

本文件面向所有在此仓库工作的 AI 编程助手与自动化代理。修改代码或文档时，必须严格遵守以下纪律：

## 1. 文档高频演进与关联同步纪律 (Living Docs & SSOT)
* **代码与文档同步**：修改数据库迁移/表结构（如 Cloudflare D1）、API 路由、边缘服务配置（如 `apps/video-agent`、`apps/video-gateway`）或前端核心组件后，必须检查并同步更新 `docs/` 下对应的设计规范与运维 SOP。
* **采购金额 SSOT 红线**：商业价格与预算**仅允许**在 `docs/02_requirements_and_plans/02_procurement_and_boms/` 维护。严禁在 `03_engineering_specs/`、`README.md` 或其他子系统文档中硬编码具体金额。
* **时间戳归一化**：所有活跃文档头部与数据协议必须使用严格 **ISO 8601 UTC 毫秒格式**（如 `2026-11-20T14:08:00.000Z`），每次实质性修订文档时同步更新其头部校准时间。
* **归档与决策留痕**：被取代的旧方案必须移入 `docs/99_archive/`（禁止留在活跃目录误导检索）；重大技术选型变更必须在 `docs/adr/` 补充简短 ADR。
* **命名规范**：`docs/` 下新建活跃 Markdown 文件**禁止**在文件名中使用半角括号 `(` `)` 或空格；**禁止**向 `docs/` 提交手工导出的 `.pdf` 文件。

## 2. Cloudflare CLI 工具纪律
* **优先使用 `cf` CLI**：对已迁移至 `cloudflare.config.ts` 的项目（如 `apps/video-gateway`、`apps/video-console`）以及 DNS/D1/R2/Zones 资源操作，统一使用 `cf` CLI（`cf dev`、`cf build`、`cf deploy`、`cf d1`）；仅在 `cf` 尚不支持的少数操作（如 `npx wrangler tail` 或单条 `npx wrangler secret put`）及尚未迁移的 Pages 项目（`apps/elecpal`）上使用 `wrangler`。

## 3. 安全红线
* **严禁明文凭据入库**：绝不可将 Cloudflare Tunnel Token（`eyJ...`）、N100 密码、路由器或海康摄像头密码写入任何 Git 跟踪文件。

## 4. 提交前必跑校验
* 修改任意 `.ts` / `.tsx` 代码后，执行类型检查（`npx tsc --noEmit`）。
* 修改、移动或新增任意文档后，执行全库文档门禁检查，确保 **0 Errors, 0 Warnings**：
  ```powershell
  pnpm docs:check
  ```
