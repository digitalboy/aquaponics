# 鱼菜共生数字化工厂：文档库导航地图 (Documentation Map)

欢迎来到**连锁数字化农业工厂（鱼菜共生系统）**的官方文档库。本库横跨水产养殖学、设施园艺学、IIoT 工业自动化、计算机视觉及具身智能等多个学科。为了降低开发与管理耦合度，文档库已完成“高内聚、低耦合、强因果对齐”的标准化重构。

请查阅下方导航图以快速定位您需要阅读的设计与规范文件（在 IDE 内支持直接点击跳转）：

---

## 🗺️ 文档目录结构树

```text
docs/
├── README.md                                          # 🗺️ 本导航地图 (文档总入口)
├── images/                                            # 统一静态图表与视觉资源
│   ├── 温室与设施构想01.png
│   └── 总体示意图.png
│
├── 01_introduction_and_glossary/                      # 📌 01. 企业宗旨、背景、认知与术语体系
│   ├── 01_企业使命愿景与核心价值观.md                 # 🌟 最高纲领：使命愿景、商业哲学与ESG社会责任
│   ├── 02_项目背景与技术团队分工.md                   # 👥 组织层：传统痛点、转型契机与各团队职责边界
│   ├── 03_多学科术语表.md                             # 📖 语言层：跨水产/农艺/IIoT/AI/财务核心术语表
│   └── 04_鱼菜共生数字工业化白皮书.md                 # 🧠 机理层：从“生物玄学”到“数字精密工业”顶层认知
│
├── 02_requirements_and_plans/                         # 📌 02. 需求分析、调研、实施规划与硬件工程
│   ├── 01_用户故事与需求矩阵.md                       # 基地与集团层典型生产运营场景与需求矩阵
│   ├── 02_全体系调研提纲.md                           # 一线踏勘与硬件/数据断层调研提纲
│   ├── 03_分期实施计划书.md                           # 三期投资计划书 (一期 5.80 万元闭环，含国数全金属DO/在线氨氮/双层桥架/人工)
│   ├── 04_第一期硬件采购BOM与工程施工清单.md          # 采购级完整物料清单、SKU、五金辅材与施工验收标准
│   └── 05_现场弱电线缆选型与布线施工规范.md           # 🔌 工业弱电线缆矩阵、超五类网线/RVSP4芯接线与低成本快拆施工标准
│
├── 03_system_architecture/                            # 📌 03. 宏观系统设计与基础规范
│   ├── 01_系统宏观架构设计.md                         # 连锁数字化工厂云边端协同架构
│   ├── 02_MVP物理与物联拓扑.md                        # 一期极简物联闭环与汇川 PLC 自治拓扑
│   ├── 03_接口与数据契约规范.md                       # 严格 ISO 8601 UTC 毫秒时间与 MQTT 契约
│   ├── 04_YOLO11活体生物数据集构建规范.md             # 📷 生物表型分类、D1/SQL Schema 与 YOLO11 标准
│   └── 05_设施与物联网资产编码规范.md                 # 🏷️ L1~L6 六级设施编码字典、浮板解耦模型与 SketchUp 契约
│
└── 04_subsystems/                                     # 📌 04. 八大自治子系统 (专属模块化目录体系)
    ├── 01_aquaculture/                                # 🐟 01. 水产养殖子系统
    │   └── README.md                                  # 荧光 DO 监测 (深圳国数质保3年)、24h在线氨氮反演、PLC 保命与 YOLO11 估重
    │
    ├── 02_hydroponics/                                # 🌱 02. 水培种植子系统
    │   ├── README.md                                  # VPD/PPFD 软反演、调理池脉冲加药与产量预测主设计
    │   ├── 01_调节池水力计算与加药自治规范.md         # 🧪 水力物料守恒、容积与流量计算推导及加药自治
    │   └── 02_大空间温室立体微气候感知与温控策略规范.md # 🌡️ 8.1米大空间垂直分层测温阵列、室外超声波气象站与三级温控策略
    │
    ├── 03_energy_optimization/                        # ⚡ 03. 能耗优化子系统
    │   └── README.md                                  # 分回路电表感知与 TOU 电价下的 MPC 避峰套利
    │
    ├── 04_robotics_and_dispatch/                      # 🤖 04. 智能调度与机器人
    │   └── README.md                                  # RCS 金字塔调度、VDA 5050 与力控具身收割
    │
    ├── 05_supply_chain_and_commerce/                  # 📊 05. 供应链与商贸协同子系统
    │   └── README.md                                  # 产供销一体化、四维选品、30天ATP、APS以销定产与COGS业财对冲
    │
    ├── 06_brand_traceability_crm/                     # 💼 06. 品牌溯源、客户运营与舆情感知子系统
    │   └── README.md                                  # 一物一码区块链防伪、B2B商超门户、B2C会员360°全息与全网社媒舆情AI大盘
    │
    ├── 07_quality_assurance_lab/                      # 🔬 07. 品质控制与实验室子系统
    │   ├── README.md                                  # IQC/IPQC/OQC三道防线、仪器台账与 e-COA 防伪存证
    │   └── 01_全球主要国家与地区农业食品安全标准比对规范.md # 🌍 欧盟EU/日本肯定列表/中国GB/美国FDA/德瑞私标全景对比与工厂内控SOP
    │
    └── 08_agronomy_knowledge_rnd/                     # 🧑‍🔬 08. 农艺机理与学术知识支持子系统
        ├── README.md                                  # Crop Ontology本体、FvCB光合模型、12座试验舱配方R&D与GraphRAG
        └── 01_温室作物蒸腾量估算与感知算法规范.md     # 🍃 Stanghellini 蒸腾模型、红外叶温感知与 Jarvis 气孔模型
```

---

## 🚀 核心文档快速跳转通道

### 1. 基础入门与认知 (Beginners Start Here)
* 研读 [01_企业使命愿景与核心价值观.md](./01_introduction_and_glossary/01_企业使命愿景与核心价值观.md) 了解最高行动宪章、三步走战略与四大核心价值观。
* 阅读 [02_项目背景与技术团队分工.md](./01_introduction_and_glossary/02_项目背景与技术团队分工.md) 了解项目发起契机、传统痛点与团队技术分工。
* 打开 [03_多学科术语表.md](./01_introduction_and_glossary/03_多学科术语表.md) 快速对齐跨学科名词（TAN、DO、FCR、VPD、PPFD、DLI、MPC、Cloudflare D1/R2、ISO 8601 等）。
* 精读 [04_鱼菜共生数字工业化白皮书.md](./01_introduction_and_glossary/04_鱼菜共生数字工业化白皮书.md) 树立系统的工程机理与 AI 决策心智模型。

### 2. 需求分析与实施规划 (Requirements & Plans)
* 查阅 [01_用户故事与需求矩阵.md](./02_requirements_and_plans/01_用户故事与需求矩阵.md) 了解养殖长、种植长、工程电工、销售经理、采购主管、终端消费者及集团高管的核心诉求与 KPI。
* 参考 [02_全体系调研提纲.md](./02_requirements_and_plans/02_全体系调研提纲.md) 执行基地一线硬件资产与数据断层的实地踏勘。
* 研读 [03_分期实施计划书.md](./02_requirements_and_plans/03_分期实施计划书.md) 掌握第一期 **¥ 5.80 万元** 高性价比落地路线与 8 周开发进度。
* 查阅 [04_第一期硬件采购BOM与工程施工清单.md](./02_requirements_and_plans/04_第一期硬件采购BOM与工程施工清单.md) 获取精准 SKU 订货号、小五金辅材包与通电验收 Checklist。
* 查阅 [05_现场弱电线缆选型与布线施工规范.md](./02_requirements_and_plans/05_现场弱电线缆选型与布线施工规范.md) 掌握弱电线缆选型、两级线号与快拆施工工艺标准。

### 3. 宏观架构与数据底座 (Global Architecture & Data Base)
* 查阅 [01_系统宏观架构设计.md](./03_system_architecture/01_系统宏观架构设计.md) 建立多基地连锁的云边端协同大局观。
* 参考 [02_MVP物理与物联拓扑.md](./03_system_architecture/02_MVP物理与物联拓扑.md) 掌握底层汇川 PLC、边缘网关与 Cloudflare Serverless 连通逻辑。
* **【核心数据红线】** [03_接口与数据契约规范.md](./03_system_architecture/03_接口与数据契约规范.md) 规定了所有 API 必须采用的 **严格 ISO 8601 UTC 毫秒时间格式 (`YYYY-MM-DDTHH:mm:ss.000Z`)** 与数据湖冷热分层架构。
* 查阅 [04_YOLO11活体生物数据集构建规范.md](./03_system_architecture/04_YOLO11活体生物数据集构建规范.md) 掌握生物表型、SQL Schema 与点云标注规范。
* **【空间与资产底座】** 查阅 [05_设施与物联网资产编码规范.md](./03_system_architecture/05_设施与物联网资产编码规范.md) 掌握 L1~L6 六级设施编码字典、浮板跨池解耦模型与 SketchUp / Three.js 命名契约。

### 4. 八大自治子系统详细设计 (Subsystems Detailed Design)
* **🐟 01. 水产养殖子系统**：[04_subsystems/01_aquaculture/README.md](./04_subsystems/01_aquaculture/README.md)（荧光 DO 监测、PLC 0.1s 硬件保命、AI 抢食投喂）
* **🌱 02. 水培种植子系统**：[04_subsystems/02_hydroponics/README.md](./04_subsystems/02_hydroponics/README.md)（VPD/PPFD 软反演、调理池脉冲加药、立体微气候温控）
  - 细节规范：[01_调节池水力计算与加药自治规范.md](./04_subsystems/02_hydroponics/01_调节池水力计算与加药自治规范.md)
  - 细节规范：[02_大空间温室立体微气候感知与温控策略规范.md](./04_subsystems/02_hydroponics/02_大空间温室立体微气候感知与温控策略规范.md)
* **⚡ 03. 能耗优化子系统**：[04_subsystems/03_energy_optimization/README.md](./04_subsystems/03_energy_optimization/README.md)（分回路能耗计量、TOU 下的 MPC 热泵套利）
* **🤖 04. 智能调度与机器人**：[04_subsystems/04_robotics_and_dispatch/README.md](./04_subsystems/04_robotics_and_dispatch/README.md)（RCS 金字塔调度、VDA 5050 与力控具身收割）
* **📊 05. 供应链与商贸协同**：[04_subsystems/05_supply_chain_and_commerce/README.md](./04_subsystems/05_supply_chain_and_commerce/README.md)（产供销一体化、四维选品、30天ATP、APS以销定产、COGS业财对冲）
* **💼 06. 品牌溯源、客户运营与舆情感知**：[04_subsystems/06_brand_traceability_crm/README.md](./04_subsystems/06_brand_traceability_crm/README.md)（一物一码区块链溯源、B2B商超门户、B2C会员360°全息与全网社媒舆情AI大盘）
* **🔬 07. 品质控制与实验室**：[04_subsystems/07_quality_assurance_lab/README.md](./04_subsystems/07_quality_assurance_lab/README.md)（IQC/IPQC/OQC三道防线、普析仪器台账、4°C留样室与e-COA防伪存证）
  - 细节规范：[01_全球主要国家与地区农业食品安全标准比对规范.md](./04_subsystems/07_quality_assurance_lab/01_全球主要国家与地区农业食品安全标准比对规范.md)
* **🧑‍🔬 08. 农艺机理与学术支持**：[04_subsystems/08_agronomy_knowledge_rnd/README.md](./04_subsystems/08_agronomy_knowledge_rnd/README.md)（Crop Ontology本体、FvCB光合与Stanghellini模型、12座试验舱配方R&D与GraphRAG）
  - 细节规范：[01_温室作物蒸腾量估算与感知算法规范.md](./04_subsystems/08_agronomy_knowledge_rnd/01_温室作物蒸腾量估算与感知算法规范.md)

---

## 🛠️ 数据规范与安全红线（【全局防护墙】）

> [!IMPORTANT]
> 凡是向系统贡献代码或进行二次设计的开发者，必须遵循以下核心约束：
> 1. **时钟必须对齐**：所有现场的 PLC、边缘网关与传感器时钟，必须通过 NTP 每小时强制同步，时差超过 $100\,\text{ms}$ 将触发系统熔断并拒收数据（详见 [03_接口与数据契约规范.md](./03_system_architecture/03_接口与数据契约规范.md)）。
> 2. **网关宽表聚合**：全厂 120+ 监测点位必须由边缘网关按 5 秒 JSON 宽表打包上报，严禁单点高频写库，将 Cloudflare D1 数据库开支死锁在 0 元/月（详见 [03_分期实施计划书.md](./02_requirements_and_plans/03_分期实施计划书.md)）。
> 3. **人身与生物安全**：现场部署的 AMR 无人车必须配置超声波防撞与物理碰条；PLC 梯形图的“应急曝气与投喂熔断”硬件逻辑高于一切上层软件与云端 AI 指令（详见 [01_aquaculture/README.md](./04_subsystems/01_aquaculture/README.md) 与 [04_robotics_and_dispatch/README.md](./04_subsystems/04_robotics_and_dispatch/README.md)）。

