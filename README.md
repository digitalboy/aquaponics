# 连锁数字化农业工厂（鱼菜共生智能系统）
> **Aquaponics Smart Factory - Industrial IIoT & Embodied AI Engineering Platform**

[![ISO 8601](https://img.shields.io/badge/Time_Standard-ISO_8601_UTC_ms-blue.svg)](./docs/03_system_architecture/03_接口与数据契约规范.md)
[![Cloudflare D1 & R2](https://img.shields.io/badge/Cloud_Infra-Cloudflare_Serverless-orange.svg)](./docs/02_requirements_and_plans/03_分期实施计划书.md)
[![PLC Control](https://img.shields.io/badge/PLC-Inovance_Easy320-brightgreen.svg)](./docs/03_system_architecture/02_MVP物理与物联拓扑.md)
[![UI Stack](https://img.shields.io/badge/UI-Shadcn_UI_+_Tailwind_v4-purple.svg)](./docs/02_requirements_and_plans/03_分期实施计划书.md)

---

## 📖 项目简介

本项目是面向未来**多地连锁、集团化运营的现代化数字化农业工厂（鱼菜共生系统）**的软硬件全栈工程体系。

系统横跨**水产养殖学、设施园艺学、IIoT 控制工程、计算机视觉及具身智能**等多个领域，通过“**物理感知、边缘自治、云端统筹、云边协同**”的闭环架构，将传统依赖老师傅经验的“生物玄学”彻底转化为确定、可量化、可预测的“数字精密工业”。

---

## 🚀 核心技术栈与工程底座

* **底层控制与保命**：工业级 **汇川 Easy320-1614TN PLC**（0.1s 硬件保命硬互锁 / Modbus-TCP / RS-485 Modbus-RTU）。
* **边缘计算与自愈**：**研华 / 研祥智能工控机**（128G SSD 支持 13 年断网自愈缓存 / 5s 网关宽表聚合策略）。
* **视觉与具身智能**：10 路 1080P PoE IP 摄像头 + 海康 16 路 NVR 录像机（本地 15 天循环录制）+ **Ultralytics YOLO11**。
* **数字孪生与仿真**：**多尺度农业数字孪生中台**（Macro 设施三维映射 / Meso 3D 立体微气候与流体反演 / Micro 动植物 Bio-Twin 动力学生理代谢 / What-If 虚拟假设推演沙箱）。
* **AI 分层自主决策**：**L0 ~ L5 农业自主决策闭环**（0.1s PLC 硬件保命 $\rightarrow$ 秒级边缘视觉截断 $\rightarrow$ 小时级 MPC 峰谷套利 $\rightarrow$ 月度 APS 以销定产排程）。
* **云端 Serverless 中台**：**Cloudflare Workers API + Cloudflare D1 (SQL) + Cloudflare R2 (零出站流量费对象存储)**。
* **前端展示大屏**：**Shadcn UI + Tailwind CSS v4.xx** 响应式工业监控看板。
* **全局数据宪法**：全链路统一采用 **严格 ISO 8601 UTC 毫秒时间戳 (`YYYY-MM-DDTHH:mm:ss.000Z`)** 与流体时空对齐标签。

---

## 🗺️ 官方文档库总览 (Documentation)

全部详细设计、技术规范与实施计划书均收录于 [`docs/`](./docs/README.md) 目录。请直接点击下方链接查阅：

👉 **[前往阅读：文档库导航总地图 (Documentation Map)](./docs/README.md)**

```text
docs/
├── README.md                                          # 文档库导航总地图 (总入口)
├── images/                                            # 统一静态图表与图片资源
│
├── 01_introduction_and_glossary/                      # 📌 01. 企业宗旨、背景、认知与术语体系
│   ├── 01_企业使命愿景与核心价值观.md
│   ├── 02_项目背景与技术团队分工.md
│   ├── 03_多学科术语表.md
│   └── 04_鱼菜共生数字工业化白皮书.md
│
├── 02_requirements_and_plans/                         # 📌 02. 需求分析、调研与实施规划
│   ├── 01_用户故事与需求矩阵.md
│   ├── 02_全体系调研提纲.md
│   ├── 03_分期实施计划书.md                           # (第一期 5.80 万元高性价比落地实施计划，含国数全金属DO/在线氨氮/双层桥架/人工)
│   ├── 04_第一期硬件采购BOM与工程施工清单.md          # (第一期采购 SKU、五金辅材与施工验收清单)
│   └── 05_现场弱电线缆选型与布线施工规范.md           # (工业弱电线缆矩阵、超五类网线/RVSP4芯接线与快拆施工标准)
│
├── 03_system_architecture/                            # 📌 03. 宏观系统架构与契约
│   ├── 01_系统宏观架构设计.md
│   ├── 02_MVP物理与物联拓扑.md
│   ├── 03_接口与数据契约规范.md                       # (严格 ISO 8601 UTC 毫秒与 MQTT 数据宪法)
│   ├── 04_YOLO11活体生物数据集构建规范.md             # (生物表型、SQL Schema 与点云数据集标准)
│   ├── 05_设施与物联网资产编码规范.md                 # (L1~L6设施编码字典、浮板解耦模型与SketchUp契约)
│   ├── 06_农业数字孪生与多尺度仿真体系规范.md         # (Macro几何/Meso流体微气候/Micro活体 Bio-Twin 与 What-If 推演)
│   └── 07_AI分层自主决策与闭环控制规范.md             # (L0~L5 分级、多时间尺度闭环、P0~P3 仲裁与安全包络)
│
└── 04_subsystems/                                     # 📌 04. 八大自治子系统 (专属模块化目录体系)
    ├── 01_aquaculture/                                # 🐟 01. 水产养殖子系统 (DO监测/PLC保命/投喂)
    ├── 02_hydroponics/                                # 🌱 02. 水培种植子系统 (VPD反演/水力调节池/大空间温控)
    ├── 03_energy_optimization/                        # ⚡ 03. 能耗优化子系统 (分回路计量/TOU电价MPC套利/17座鱼池水动力能耗模型)
    ├── 04_robotics_and_dispatch/                      # 🤖 04. 智能调度与机器人 (RCS/VDA 5050/具身收割)
    ├── 05_supply_chain_and_commerce/                  # 📊 05. 供应链与商贸协同 (产供销一体化/四维选品/30天ATP/APS以销定产/COGS业财对冲)
    ├── 06_brand_traceability_crm/                     # 💼 06. 品牌溯源、客户运营与舆情感知 (一物一码/B2B门户/DTC会员360°/社媒舆情AI中枢)
    ├── 07_quality_assurance_lab/                      # 🔬 07. 品质控制与实验室 (IQC/IPQC/OQC/全球食品安全规范/e-COA)
    └── 08_agronomy_knowledge_rnd/                     # 🧑‍🔬 08. 农艺机理与学术知识 (Crop Ontology/12座试验舱/蒸腾机理)
```
