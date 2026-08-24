# @aquaponics/elecpal (ElecPal 电气伴侣)

> **定位**：轻量级、AI 原生的声明式电气工程 CAD 与自动化设计平台 (Schema-Driven Electrical CAD & AI Copilot)。  
> **核心使命**：以全厂统一数据契约 `@aquaponics/schema` 为单一真实源，自动完成负荷计算与 ERC 规则校验，秒级生成符合 GB/T 18135 与 IEC 60617 标准的 3 大工程图卷，支持 Firebase Google 登录、Cloudflare D1 边缘云数据库与 AutoCAD DXF/BOM 导出。  
> **官方生产环境**：👉 **[https://elecpal.beikee.org](https://elecpal.beikee.org)** (备用: [https://aquaponics-elecpal.pages.dev](https://aquaponics-elecpal.pages.dev))

---

## 🏛️ Monorepo 架构与目录组织

本子工程隶属于 `@aquaponics/monorepo` 工作空间，所有全要素电气拓扑契约统一引用自 `packages/schema`。

```
apps/elecpal/
├── README.md                          # 本说明文档
├── package.json                       # @aquaponics/elecpal 模块配置
├── tsconfig.json                      # 继承自 @aquaponics/tsconfig/base.json
├── vite.config.ts                     # Vite 构建配置 (Cloudflare Pages 目标)
├── docs/                              # 📚 专属设计与规划文档库 (文档先行)
│   ├── 01_product_requirements_and_scope(PRD).md   # 产品需求与核心用例规范
│   ├── 02_technical_architecture_and_data_flow.md # 全栈技术架构、Firebase 鉴权与数据流设计
│   └── 03_open_discussion_topics.md               # 待深入讨论的工程与产品细节议题
├── examples/                          # 📁 示例车间拓扑资产库
│   └── workshop_01_sample.json        # 01号鱼菜共生综合车间真实全要素拓扑
├── src/
│   ├── config/                        # ⚙️ 全局配置 (Firebase SDK 初始化等)
│   ├── core/                          # 🧮 核心计算、ERC 规则引擎与正交排版算法
│   ├── services/                      # 💾 业务服务层 (Auth 认证、项目 CRUD、版本快照)
│   ├── renderers/                     # 📐 渲染与导出引擎 (AutoCAD DXF / 采购 BOM)
│   └── ai/                            # 🤖 AI Copilot 智能辅助推演模块
└── web/                               # 🖥️ 前端 Web CAD 单页应用源码
```

---

## 🚀 本地开发与构建指令

在 Monorepo 根目录下执行：

```bash
# 启动本地开发服务 (默认端口 3000)
pnpm run dev:elecpal

# 单独构建 ElecPal 产物 (输出至 apps/elecpal/dist)
pnpm run build:elecpal

# 全工作区 TypeScript 类型检查
pnpm run check
```

---

## ☁️ Cloudflare Pages 部署配置规范

在 Cloudflare Dashboard 创建 Pages 项目时配置：

| 配置项 | 推荐设定值 |
| :--- | :--- |
| **Framework preset** | `Vite` |
| **Build command** | `pnpm --filter @aquaponics/elecpal build` |
| **Build output directory** | `apps/elecpal/dist` |
| **Root directory** | `/` (Monorepo 根目录) |
| **Node.js Version** | `20.x` 或以上 (可通过环境变量 `NODE_VERSION=20` 指定) |
