# 连锁数字化农业工厂：02_MVP物理与物联拓扑 (MVP Physical & IoT Topology)

这是一个最基础、最核心的 **第一期 MVP（最小可行性产品）物理与物联拓扑结构图**。

它抛弃了所有复杂的冗余设计，用最直观的层级结构，讲清楚数据是如何从物理世界的**原子（传感器）**，经过控制层的**转换（汇川 PLC）**，最终变成软件世界的**比特（边缘网关与 Cloudflare Serverless 数据湖）**。

```mermaid
flowchart TD
    %% 1. 物理层 (最前线)
    subgraph Layer1["1. 现场物理感知与视频层 (Field Layer)"]
        direction LR
        SensorA["水质传感器 (RS485)<br>(荧光法DO / 双盐桥pH / 四电极EC)"]
        SensorB["温室环境传感器 (RS485)<br>(冠层温湿度 / PAR光量子)"]
        Cams["10路 IP 摄像头<br>(H.265 RTSP 视频流)"]
    end

    %% 2. 边缘控制与本地存储层 (硬件保命与黑匣子)
    subgraph Layer2["2. 现场控制与本地存储中枢 (Edge Control Hub)"]
        direction TB
        PLC["🔌 汇川 Easy320-1614TN PLC<br>(24V DC / 0.1s 硬件保命硬互锁)"]
        NVR["📹 16路 NVR + 4TB 监控硬盘<br>(本地循环录制 15 天全量历史)"]
        Logic["本地硬核保命闭环<br>(DO<4.0 强开气泵 / DO<3.0 切断投喂)"]
        PLC --- Logic
    end

    %% 3. 数据传输与云端服务层 (IT/AI世界)
    subgraph Layer3["3. 边缘网关与 Cloudflare Serverless 数据中台"]
        direction TB
        Gateway["💻 智能边缘网关 (研华/研祥)<br>(5s 宽表快照 / 128G 断网自愈缓存)"]
        CloudAPI["⚡ Cloudflare Workers API<br>(防时钟漂移校验 + 三级告警引擎)"]
        DB["🗄️ Cloudflare D1 (5s 宽表 SQL)<br>📦 Cloudflare R2 (告警视频切片 & 快照)"]
        
        Gateway -->|"③ 5s 宽表 JSON (HTTPS 加密)"| CloudAPI
        CloudAPI --> DB
    end

    %% 数据流动与通讯协议原理
    SensorA -->|"① RS-485 (Modbus-RTU 协议)"| PLC
    SensorB -->|"① RS-485 (Modbus-RTU 协议)"| PLC
    Cams -->|"① 网线 RTSP 视频流"| NVR
    
    PLC <-->|"② 网线直连 (Modbus-TCP 协议)"| Gateway
    NVR <-->|"② 告警切片 MP4 抓取"| Gateway

    %% 样式美化
    style Layer1 fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    style Layer2 fill:#fff3e0,stroke:#e65100,stroke-width:2px
    style Layer3 fill:#e8f5e9,stroke:#1b5e20,stroke-width:2px
    style PLC fill:#ffcc80,stroke:#e65100,stroke-width:1px
    style Gateway fill:#a5d6a7,stroke:#1b5e20,stroke-width:1px
```

---

## 💡 MVP 拓扑结构的核心原理精解

这个 MVP 结构只讲透三个最根本的工业物联网（IIoT）数据流转原理：

### 原理一：物理信号的“数字量化与保命硬锁闭”（Layer 1 $\rightarrow$ Layer 2）

* **过程：** 现场的传感器把水质或光照的物理变化，通过工业标准的 RS-485 (Modbus-RTU) 信号发给汇川 Easy320 PLC（进阶多轴控制扩建时可选用汇川 AM400 系列）。
* **IT 负责人的安全防线：** 核心控制必须先过 PLC。这样即使后面的网关断网或服务器死机，PLC 依然能靠本地的梯形图硬核代码闭环保命（如发现严重缺氧，不经云端直接拉高液氧电磁阀继电器并切断投喂机电源）。

### 原理二：工业协议到 IT 协议的“翻译与脱水”（Layer 2 $\rightarrow$ Layer 3 网关）

* **过程：** PLC 把换算好的物理数值（如 `pH = 6.2`、`DO = 6.8 mg/L`）存放在内部保持寄存器（Holding Registers）里。
* **网关的角色：** 部署在现场的研华/研祥边缘工控机通过网线连接 PLC，利用 **Modbus-TCP 协议** 每秒轮询寄存器地址，将底层的工业字节数据解析出来。

### 原理三：数据资产的“规范化、5秒宽表打包与落湖”（网关 $\rightarrow$ Cloudflare Serverless）

* **过程：** 网关拿到原始数据并过滤噪点后，按 **5 秒一次** 聚合全厂点位，强制打包为带有 ISO 8601 UTC 毫秒时间戳的 JSON 宽表。
  1. 资产身份标识：`base_id`、`zone_id`、`device_id`。
  2. 物理采集时间：**严格遵循 ISO 8601 的 UTC 毫秒级时间戳**（如 `2026-07-12T16:56:18.000Z`）。
  3. **流体时空对齐标签**（依据《[03_接口与数据契约规范.md](./03_接口与数据契约规范.md)》，附加由流速算出的 `water_origin_timestamp` 和 `lag_seconds`）。
* **进入数据湖：** 最终，网关将带有高价值时空标签的 JSON 数据加密上传至 Cloudflare Workers，写入 Cloudflare D1 边缘数据库；告警视频切片则写入 Cloudflare R2 对象存储，将云端数据库与流量开支死锁在 **0 元/月**！

这就是最简单、绝对能跑通的工业数据闭环。未来的 YOLO11 训练模型、能耗 MPC 算法，全部都是在这个 MVP 拓扑结构稳定运行、源源不断产出干净数据之后，在云边协同端叠加的算力外挂！