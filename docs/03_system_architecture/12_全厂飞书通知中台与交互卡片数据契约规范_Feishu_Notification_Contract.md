# 连锁数字化农业工厂：12_全厂飞书通知中台与交互卡片数据契约规范 (Feishu Notification Contract)

> **文档状态**：Active | **最后校准时间**：2026-11-25T06:16:00.000Z (ISO 8601 UTC)
>
> **核心定位**：本规范定义全厂（视频安防、门禁联动、PLC 水质与微气候传感器、智能电表电费、5S 资产维保）向飞书（Lark）推送消息、图片与交互式卡片的**唯一统一契约**。所有接入飞书通知能力的 Cloudflare Workers 与边缘节点均须遵守本规范。

---

## 1. 架构选型与路由原则

### 1.1 统一使用“企业自建应用机器人”直发（方案 B）
全厂统一通过飞书开放平台的**企业自建应用机器人**（当前应用名为 `AI视频应用`，后续可按需更名为通用农场助手）发送群消息，**不再为不同业务重复添加零散的“自定义 Webhook 机器人”**。

- **标准发送链路**：
  1. 使用 `FEISHU_APP_ID` + `FEISHU_APP_SECRET` 向 `POST /open-apis/auth/v3/tenant_access_token/internal` 换取 `tenant_access_token`；
  2. 若消息含现场实拍图或曲线图，先调用 `POST /open-apis/im/v1/images`（`image_type: "message"`）上传换取 `image_key`；
  3. 调用 `POST /open-apis/im/v1/messages?receive_id_type=chat_id`，将 `receive_id` 设为目标群的 `chat_id`（`oc_...`）、`msg_type` 设为 `interactive`，`content` 为序列化后的卡片 JSON 字符串。
- **历史兜底兼容**：仅当未配置 `FEISHU_CHAT_ID` 时，允许 `apps/video-gateway` 回退至旧版 `FEISHU_WEBHOOK_URL`（可选 HMAC-SHA256 `FEISHU_WEBHOOK_SECRET` 签名）。新接入业务严禁再依赖自定义 Webhook。

### 1.2 为什么禁止继续堆叠自定义 Webhook
1. **多群分流需要**：一个企业应用可同时加入多个专业群，仅靠配置不同的 `chat_id` 即可路由。
2. **富媒体与交互需要**：自定义 Webhook 无法上传图片（必须依赖应用身份换取 `image_key`），也无法响应卡片按钮回调（如远程开门 5 秒、确认告警）及群内 `@机器人` 查询实时参数。

---

## 2. 一应用多群职能路由表

为避免“视频抓拍、电费日报、设备维保、高频传感器告警”全部涌入同一个群导致重要告警被淹没，采用**一应用多群路由**：

| 路由键 (`routeKey`) | 目标群名称（示例） | 对应环境变量 | 承载业务范围 | 状态 |
| :--- | :--- | :--- | :--- | :--- |
| `monitoring` | **视频与参数监控** | `FEISHU_CHAT_ID` | 摄像头离线/恢复、定时实拍简报、夜间人形/熟人识别、门禁超时告警、PLC 水质（DO/pH/水温）与大棚温湿度越限告警 | **已上线**（视频/安防） / 传感器待接入 |
| `intel` | **全球农业 AI 情报** | `FEISHU_CHAT_ID_INTEL` | 每日 `08:00` 全球产业动态（`industry`）与 `20:00` 全球学术论文（`academic`），经 `gemini-decision-1` 筛选后由 `gemini-3.5-flash-lite` 译为 4~5 句中文简报（`apps/agri-intel`） | **已上线**（暂复用监控群） |
| `energy` | **能源与经营日报** | `FEISHU_CHAT_ID_ENERGY` | 每日/每月电费账单、峰平谷电量占比分析、水泵/风机异常高功率告警 | 规划中 |
| `ops` | **设备维保与 5S 群** | `FEISHU_CHAT_ID_OPS` | 设施定期保养提醒、低库存耗材补货、5S 点检异常、故障报修派单 | 规划中 |

---

## 3. 统一消息契约与分级规范

### 3.1 核心载荷 Schema（对齐 `apps/video-gateway/src/alerts.ts`）

```ts
export type AlertDomain = "video" | "access" | "water" | "climate" | "energy" | "asset";
export type AlertSeverity = "critical" | "warning" | "resolved" | "info";
export type FeishuRouteKey = "monitoring" | "energy" | "ops";

export interface AlertImageItem {
  label: string;
  imageKey: string;          // 飞书 im/v1/images 返回的 image_key
  capturedAtUtc?: string;    // 严格 ISO 8601 UTC 毫秒格式
}

export interface AlertPayload {
  alertKey: string;          // 去重与冷却防抖唯一键，如 "cam_offline:CAM-FISH-PAN-01" 或 "water_do_low:TANK-01"
  domain?: AlertDomain;      // 业务域（缺省默认 video）
  routeKey?: FeishuRouteKey; // 目标群路由（缺省默认 monitoring）
  siteId: string;            // 基地编码，如 "guangming-01"
  camId?: string;
  camName?: string;
  severity: AlertSeverity;
  title: string;             // 卡片标题（建议带明确业务前缀与状态 Emoji）
  summary: string;           // 一句话核心结论
  occurredAtUtc: string;     // 严格 ISO 8601 UTC 毫秒格式：YYYY-MM-DDTHH:mm:ss.sssZ
  hideOccurredAt?: boolean;
  hideImageCaption?: boolean;
  details?: Array<{ label: string; value: string }>;
  images?: AlertImageItem[];
}
```

### 3.2 严重度分级与卡片色标

| 严重度 (`severity`) | 飞书卡片 `header.template` | 适用场景 | 联动要求 |
| :--- | :--- | :--- | :--- |
| `critical` | `red`（红色） | 生命线指标危机（如鱼池 `DO < 5.00 mg/L`、断电/跳闸）、夜间陌生人闯入、正门电磁锁超时未关（`> 30s`）、摄像头长期离线 | 必推飞书群 + 同步触发邮件兜底；后续可加群内 `@` 责任人 |
| `warning` | `orange`（橙色） | 大棚气温超限（`> 32℃` 或 `< 15℃`）、峰时异常高功率、传感器数据抖动/疑似漂移、快照陈旧 | 推送飞书群，受冷却窗口控制 |
| `resolved` | `green`（绿色） | 此前处于 `firing` 状态的告警恢复正常（如摄像头重连、门重新吸合、DO 回升至安全区） | 仅在 `firing -> ok` 状态跃迁时发送一次 |
| `info` | `blue`（蓝色） | 定时视频实拍简报、夜间熟人识别通行（如在职员工）、每日电费与能耗汇总日报 | 不发邮件，不触发声光报警 |

### 3.3 时间处理契约
- **后端存储与接口传输**：所有时间戳必须使用严格 **ISO 8601 UTC 毫秒格式**（如 `2026-11-25T05:36:00.000Z`）。
- **飞书卡片渲染层**：统一转换为**北京时间（UTC+8）**格式化展示（如 `2026-11-25 13:36:00 (北京时间)`），避免一线人员误读 UTC 时间。

---

## 4. 冷却防抖（Cooldown）与防轰炸规则

针对高频传感器（PLC 采样）或边缘网络抖动，禁止在每次采样周期直接发群消息，必须遵守以下状态机纪律：

1. **状态持久化**：以 `alertKey` 为主键在 D1（`alert_states`）记录 `status`（`ok` / `firing`）、`last_triggered_at`、`last_notified_at`、`last_resolved_at`。
2. **冷却抑制**：同一 `alertKey` 在 `firing` 期间，距离 `last_notified_at` 未满 `ALERT_COOLDOWN_SEC`（默认 `1800` 秒）时，抑制重复推送。
3. **恢复通知**：指标恢复正常且此前状态为 `firing` 时，将状态翻转为 `ok` 并立即发送一条 `resolved` 绿色恢复卡片，解除运维焦虑。
4. **周期简报独立节流**：定时视频简报、每日电费汇总等 `info` 类消息使用独立节流键（如 `feishu_digest:guangming-01`、`energy_daily:guangming-01`）。

---

## 5. 未来扩展接入规范

### 5.1 水质与环境传感器告警（PLC / 边缘网关）
- **生命线优先**：`DO < 5.00 mg/L`、`pH` 超出 `6.2 ~ 7.5`、循环泵/增氧机电流归零等直接映射为 `severity: "critical"`。
- **传感器漂移过滤**：结合相邻池体读数或连续 N 次采样去抖（如连续 3 个周期超限再触发），减少单帧毛刺误报。

### 5.2 电费与能耗日报推送（智能电表 / `elecpal`）
- **每日定时日报（`info`）**：每日上午固定时段（建议北京时间 `08:30`）汇总前一日总电量（kWh）、峰/平/谷分段电量与估算电费（元）、单位产能能耗指标。
- **异常电费/功率预警（`warning`）**：当夜间非生产时段出现异常持续基荷，或单日用电环比突增超出阈值时，推送橙色预警卡片并附带主要回路明细。

### 5.3 采购申请定时汇总简报（已上线：`apps/video-gateway/src/approvals.ts`）
- **绑定模板**：飞书原生审批「采购申请」（`approval_code`: `53309C16-2FA4-4951-B62D-37E5C0ED8CD4`，支持 `FEISHU_PURCHASE_APPROVAL_CODE` 覆盖）。
- **定时推送窗口（北京时间 UTC+8）**：
  - **日报**：每日 `20:00`（统计当日 `00:00` 至推送时刻）；
  - **周报**：每周五 `22:00`（统计本周一 `00:00` 至推送时刻）；
  - **月报**：每月最后一天 `23:00`（统计本月 1 日 `00:00` 至推送时刻）。
- **统计口径与金额提取**：汇总发起总数/金额、审批通过（`APPROVED`）、审批未通过（`REJECTED`）、审批中（`PENDING`）及已撤回（`CANCELED`）；从 `费用明细`（`fieldList`）内的原生 `amount` 控件精确累加人民币金额，并借助 D1 `alert_states` 去重锁保证每周期只发 1 次。

### 5.4 交互式卡片回调（Phase 2 演进）
- 后续在飞书开放平台配置“请求网址（Card Action Callback）”指向 Cloudflare Worker 专用回调路由；
- 必须校验飞书回调签名（`Verification Token` / 加密签名）及操作人 `open_id` 权限白名单（`ADMIN_FEISHU_OPEN_IDS`）；
- 所有卡片动作（如【远程开门 5 秒】、【确认已知晓】）必须写入 D1 审计日志。

---

## 6. 凭据、权限与安全红线

### 6.1 Cloudflare Worker Secrets 清单
所有密钥与群 ID 均通过 `npx wrangler secret put <NAME> --name <WORKER>` 注入，**严禁明文写入 Git 跟踪文件**：
- `FEISHU_APP_ID`：飞书企业自建应用 App ID
- `FEISHU_APP_SECRET`：飞书企业自建应用 App Secret
- `FEISHU_CHAT_ID`：默认「视频与参数监控」群会话 ID（`oc_...`）
- `FEISHU_CHAT_ID_ENERGY` / `FEISHU_CHAT_ID_OPS`：未来分流群会话 ID（按需启用）
- `FEISHU_WEBHOOK_URL`：仅作未配置 `FEISHU_CHAT_ID` 时的历史兼容兜底

### 6.2 飞书开放平台最小应用权限
每次权限变更后，必须在飞书开放平台**创建版本并发布上线**方可生效：
- `im:message:send_as_bot`：以应用身份向所在群组发送卡片消息（必需）
- `im:resource`（应用身份）：上传现场实拍图与统计图表换取 `image_key`（必需）
- `im:chat:readonly`：查询机器人所在群组列表与基础信息（建议开通）
- `approval:approval:readonly`：读取「采购申请」审批定义及实例汇总详情（已开通，采购简报必需）

---

## 7. 关联文档
- 视频流服务子系统：[09_video_streaming_service/README.md](../04_subsystems/09_video_streaming_service/README.md)
- 正门电磁门禁与云边联动规范：[10_正门PoE电磁门禁控制接线与云边联动技术规范.md](../02_requirements_and_plans/03_engineering_specs/10_正门PoE电磁门禁控制接线与云边联动技术规范.md)
- 过渡期环境与水质飞书多维表格规范：[06_过渡期环境与水质飞书多维表格数据模型及人机双轨校准规范.md](../04_subsystems/02_hydroponics/06_过渡期环境与水质飞书多维表格数据模型及人机双轨校准规范.md)
- 全厂实物资产台账与 5S 契约：[10_全厂实物资产台账与5S定置管理数据契约规范_Asset_and_5S_Ledger_Schema.md](./10_全厂实物资产台账与5S定置管理数据契约规范_Asset_and_5S_Ledger_Schema.md)
