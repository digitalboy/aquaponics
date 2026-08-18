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
* **边缘计算与缓存**：**研华 / 研祥智能工控机**（128G SSD 支持 13 年断网自愈缓存 / 5s 网关宽表聚合策略）。
* **视频监控与分析**：10 路 1080P PoE IP 摄像头 + 海康 16 路 NVR 录像机（本地 15 天循环录制）+ **Ultralytics YOLO11**。
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
│   └── 04_第一期硬件采购BOM与工程施工清单.md          # (第一期采购 SKU、五金辅材与施工验收清单)
│
├── 03_system_architecture/                            # 📌 03. 宏观系统架构与契约
│   ├── 01_系统宏观架构设计.md
│   ├── 02_MVP物理与物联拓扑.md
│   └── 03_接口与数据契约规范.md                       # (全局时间与 MQTT 数据宪法)
│
├── 04_subsystems/                                     # 📌 04. 子系统详细设计
│   ├── 01_水产养殖子系统.md
│   ├── 02_水培种植子系统.md
│   ├── 03_能耗优化子系统.md
│   ├── 04_智能调度与机器人.md
│   ├── 05_供应链与业务中台.md
│   └── 06_销售赋能与客户溯源子系统.md
│
└── 05_specifications/                                 # 📌 05. 专项工程技术规范 (Single Source of Truth)
    ├── 01_YOLO11活体生物数据集构建规范.md
    ├── 02_调节池水力计算与加药自治规范.md
    ├── 03_温室作物蒸腾量估算与感知算法规范.md
    ├── 04_大空间温室立体微气候感知与温控策略规范.md
    └── 05_现场弱电线缆选型与布线施工规范.md
```
