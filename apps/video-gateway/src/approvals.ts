import {
  type ChannelResult,
  fetchFeishuTenantToken,
  getAlertState,
  hasFeishuTarget,
  sendFeishuAlert,
  upsertAlertState,
} from "./alerts";
import { type Env, nowIsoUtc } from "./types";

const DEFAULT_PURCHASE_APPROVAL_CODE = "53309C16-2FA4-4951-B62D-37E5C0ED8CD4";
const BJT_OFFSET_MS = 8 * 3600 * 1000;

export type ApprovalReportPeriod = "daily" | "weekly" | "monthly";

interface FeishuApprovalInstanceDetail {
  approval_code?: string;
  approval_name?: string;
  instance_code?: string;
  serial_number?: string;
  status?: "PENDING" | "APPROVED" | "REJECTED" | "CANCELED" | "DELETED" | string;
  start_time?: string;
  end_time?: string;
  user_id?: string;
  form?: string;
}

export interface ApprovalSummaryStats {
  period: ApprovalReportPeriod;
  periodLabel: string;
  rangeStartIso: string;
  rangeEndIso: string;
  totalCount: number;
  totalAmountCny: number;
  approvedCount: number;
  approvedAmountCny: number;
  rejectedCount: number;
  rejectedAmountCny: number;
  pendingCount: number;
  pendingAmountCny: number;
  canceledCount: number;
  canceledAmountCny: number;
  amountMissingCount: number;
}

export interface ApprovalReportResult {
  period: ApprovalReportPeriod;
  sent: boolean;
  skippedReason?: string;
  stats?: ApprovalSummaryStats;
  channel?: ChannelResult;
}

function getPurchaseApprovalCode(env: Env): string {
  return env.FEISHU_PURCHASE_APPROVAL_CODE?.trim() || DEFAULT_PURCHASE_APPROVAL_CODE;
}

function toBeijingDate(utcMs: number): Date {
  return new Date(utcMs + BJT_OFFSET_MS);
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function formatBjtDate(d: Date): string {
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`;
}

function formatBjtDateTime(utcMs: number): string {
  const d = toBeijingDate(utcMs);
  return `${formatBjtDate(d)} ${pad2(d.getUTCHours())}:${pad2(d.getUTCMinutes())}`;
}

function formatCny(amount: number): string {
  return `¥${amount.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** 计算给定北京时间对应的自然日 00:00:00 的 UTC 毫秒时间戳 */
function bjtDayStartUtcMs(bjtDate: Date): number {
  return Date.UTC(bjtDate.getUTCFullYear(), bjtDate.getUTCMonth(), bjtDate.getUTCDate(), 0, 0, 0, 0) - BJT_OFFSET_MS;
}

/** 计算周期的统计起止时间（UTC 毫秒）与去重 Key */
function computePeriodWindow(period: ApprovalReportPeriod, nowUtcMs: number): {
  startUtcMs: number;
  endUtcMs: number;
  dedupeKey: string;
  periodLabel: string;
} {
  const bjt = toBeijingDate(nowUtcMs);
  const todayStartMs = bjtDayStartUtcMs(bjt);

  if (period === "daily") {
    const dayStr = formatBjtDate(bjt);
    return {
      startUtcMs: todayStartMs,
      endUtcMs: nowUtcMs,
      dedupeKey: `approval_report:daily:${dayStr}`,
      periodLabel: `采购日报 · ${dayStr}`,
    };
  }

  if (period === "weekly") {
    // JS getUTCDay(): 0=周日, 1=周一 ... 5=周五, 6=周六
    const dayOfWeek = bjt.getUTCDay();
    const diffFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const mondayStartMs = todayStartMs - diffFromMonday * 24 * 3600 * 1000;
    const mondayStr = formatBjtDate(toBeijingDate(mondayStartMs));
    const endStr = formatBjtDate(bjt);
    return {
      startUtcMs: mondayStartMs,
      endUtcMs: nowUtcMs,
      dedupeKey: `approval_report:weekly:${mondayStr}`,
      periodLabel: `采购周报 · ${mondayStr} ~ ${endStr}`,
    };
  }

  // monthly: 本月 1 日 00:00:00 (北京时间) ~ 当前时间
  const monthStartMs = Date.UTC(bjt.getUTCFullYear(), bjt.getUTCMonth(), 1, 0, 0, 0, 0) - BJT_OFFSET_MS;
  const monthKey = `${bjt.getUTCFullYear()}-${pad2(bjt.getUTCMonth() + 1)}`;
  return {
    startUtcMs: monthStartMs,
    endUtcMs: nowUtcMs,
    dedupeKey: `approval_report:monthly:${monthKey}`,
    periodLabel: `采购月报 · ${monthKey}`,
  };
}

/** 飞书 GET JSON 通用封装 */
async function feishuGetJson<T>(tenantToken: string, url: string): Promise<T> {
  const res = await fetch(url, {
    method: "GET",
    headers: { Authorization: `Bearer ${tenantToken}` },
  });
  const json = (await res.json()) as { code?: number; msg?: string; data?: T; error?: unknown };
  if (!res.ok || json.code !== 0) {
    throw new Error(`Feishu API error (${json.code ?? res.status}): ${json.msg ?? "unknown"} | ${JSON.stringify(json.error ?? {})}`);
  }
  return json.data as T;
}

/** 拉取指定时间区间内的审批实例 code 列表（自动翻页） */
async function listApprovalInstanceCodes(
  tenantToken: string,
  approvalCode: string,
  startUtcMs: number,
  endUtcMs: number,
): Promise<string[]> {
  const codes: string[] = [];
  let pageToken = "";

  for (let page = 0; page < 30; page += 1) {
    const qs = new URLSearchParams({
      approval_code: approvalCode,
      start_time: String(startUtcMs),
      end_time: String(endUtcMs),
      page_size: "100",
    });
    if (pageToken) qs.set("page_token", pageToken);

    const data = await feishuGetJson<{
      instance_code_list?: string[];
      has_more?: boolean;
      page_token?: string;
    }>(tenantToken, `https://open.feishu.cn/open-apis/approval/v4/instances?${qs.toString()}`);

    if (Array.isArray(data?.instance_code_list)) {
      codes.push(...data.instance_code_list);
    }
    if (!data?.has_more || !data.page_token) break;
    pageToken = data.page_token;
  }

  return Array.from(new Set(codes));
}

async function getApprovalInstanceDetail(
  tenantToken: string,
  instanceCode: string,
): Promise<FeishuApprovalInstanceDetail> {
  return feishuGetJson<FeishuApprovalInstanceDetail>(
    tenantToken,
    `https://open.feishu.cn/open-apis/approval/v4/instances/${encodeURIComponent(instanceCode)}?locale=zh-CN`,
  );
}

function parseNumericValue(raw: unknown): number | null {
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  if (typeof raw === "string") {
    const cleaned = raw.replace(/[,，￥¥\s]/g, "").trim();
    if (!cleaned) return null;
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : null;
  }
  if (raw && typeof raw === "object") {
    const obj = raw as Record<string, unknown>;
    if (obj.amount !== undefined) return parseNumericValue(obj.amount);
    if (obj.value !== undefined) return parseNumericValue(obj.value);
  }
  return null;
}

/**
 * 从飞书审批实例 form JSON 中提取采购总金额（人民币）：
 * 1) 优先取顶层原生 amount 控件或名称含“总金额/合计/采购金额/总价/金额/费用”（且不含“单价”）的数值；
 * 2) 若顶层无总金额控件，则累加 fieldList 明细表内的小计/金额子控件。
 */
export function extractApprovalAmountCny(formRaw: string | undefined): number | null {
  if (!formRaw) return null;
  let widgets: unknown;
  try {
    widgets = JSON.parse(formRaw);
  } catch {
    return null;
  }
  if (!Array.isArray(widgets)) return null;

  // 第一轮：查找顶层汇总金额控件
  let topFallback: number | null = null;
  for (const w of widgets) {
    if (!w || typeof w !== "object") continue;
    const item = w as Record<string, unknown>;
    const type = String(item.type ?? "").toLowerCase();
    const name = String(item.name ?? "");
    if (type === "fieldlist") continue;

    if (type === "amount") {
      const val = parseNumericValue(item.value);
      if (val !== null) return val;
    }

    const looksLikeTotal =
      /总金额|合计|总价|采购金额|申请金额|费用总计|总额/.test(name) ||
      (/金额|费用/.test(name) && !/单价/.test(name));
    if (looksLikeTotal && topFallback === null) {
      const val = parseNumericValue(item.value);
      if (val !== null) topFallback = val;
    }
  }
  if (topFallback !== null) return topFallback;

  // 第二轮：遍历明细表格（fieldList）累加子项金额
  let detailSum = 0;
  let foundDetailAmount = false;
  for (const w of widgets) {
    if (!w || typeof w !== "object") continue;
    const item = w as Record<string, unknown>;
    if (String(item.type ?? "").toLowerCase() !== "fieldlist") continue;
    const rows = Array.isArray(item.value) ? item.value : [];
    for (const row of rows) {
      if (!Array.isArray(row)) continue;
      let rowPicked = false;
      for (const cell of row) {
        if (!cell || typeof cell !== "object") continue;
        const c = cell as Record<string, unknown>;
        const cType = String(c.type ?? "").toLowerCase();
        const cName = String(c.name ?? "");
        if (cType === "amount" || (/小计|总价|金额|费用/.test(cName) && !/单价/.test(cName))) {
          const val = parseNumericValue(c.value);
          if (val !== null) {
            detailSum += val;
            foundDetailAmount = true;
            rowPicked = true;
            break;
          }
        }
      }
      if (rowPicked) continue;
    }
  }

  return foundDetailAmount ? Math.round(detailSum * 100) / 100 : null;
}

/** 调试/体检接口：检查审批权限与采购申请表单结构样本 */
export async function inspectPurchaseApproval(env: Env, lookbackDays = 30): Promise<Record<string, unknown>> {
  const appId = env.FEISHU_APP_ID?.trim();
  const appSecret = env.FEISHU_APP_SECRET?.trim();
  if (!appId || !appSecret) {
    throw new Error("FEISHU_APP_ID or FEISHU_APP_SECRET not configured");
  }

  const approvalCode = getPurchaseApprovalCode(env);
  const token = await fetchFeishuTenantToken(appId, appSecret);
  const definition = await feishuGetJson<Record<string, unknown>>(
    token,
    `https://open.feishu.cn/open-apis/approval/v4/approvals/${encodeURIComponent(approvalCode)}?locale=zh-CN`,
  );

  const endUtcMs = Date.now();
  const startUtcMs = endUtcMs - Math.max(1, lookbackDays) * 24 * 3600 * 1000;
  const instanceCodes = await listApprovalInstanceCodes(token, approvalCode, startUtcMs, endUtcMs);

  const samples: Array<Record<string, unknown>> = [];
  for (const code of instanceCodes.slice(0, 5)) {
    const detail = await getApprovalInstanceDetail(token, code);
    let parsedForm: unknown = null;
    try {
      parsedForm = detail.form ? JSON.parse(detail.form) : null;
    } catch {
      parsedForm = detail.form;
    }
    samples.push({
      instanceCode: detail.instance_code,
      serialNumber: detail.serial_number,
      status: detail.status,
      startTime: detail.start_time,
      endTime: detail.end_time,
      extractedAmountCny: extractApprovalAmountCny(detail.form),
      form: parsedForm,
    });
  }

  return {
    approvalCode,
    approvalName: definition.approval_name ?? null,
    definitionForm: typeof definition.form === "string" ? JSON.parse(definition.form) : definition.form ?? null,
    recentInstanceCount: instanceCodes.length,
    samples,
  };
}

/** 拉取并生成采购审批周期汇总卡片，推送到飞书群 */
export async function runPurchaseApprovalReport(
  env: Env,
  period: ApprovalReportPeriod,
  force = false,
): Promise<ApprovalReportResult> {
  const appId = env.FEISHU_APP_ID?.trim();
  const appSecret = env.FEISHU_APP_SECRET?.trim();
  if (!appId || !appSecret || !hasFeishuTarget(env)) {
    return {
      period,
      sent: false,
      skippedReason: "FEISHU_APP_ID/FEISHU_APP_SECRET or target not configured",
    };
  }

  const nowIso = nowIsoUtc();
  const nowUtcMs = Date.parse(nowIso);
  const siteId = env.DEFAULT_SITE_ID || "guangming-01";
  const { startUtcMs, endUtcMs, dedupeKey, periodLabel } = computePeriodWindow(period, nowUtcMs);

  if (!force) {
    const prev = await getAlertState(env.VIDEO_DB, dedupeKey);
    if (prev?.last_notified_at) {
      return {
        period,
        sent: false,
        skippedReason: `already sent for ${dedupeKey} at ${prev.last_notified_at}`,
      };
    }
  }

  const approvalCode = getPurchaseApprovalCode(env);
  const token = await fetchFeishuTenantToken(appId, appSecret);
  const instanceCodes = await listApprovalInstanceCodes(token, approvalCode, startUtcMs, endUtcMs);

  const stats: ApprovalSummaryStats = {
    period,
    periodLabel,
    rangeStartIso: new Date(startUtcMs).toISOString(),
    rangeEndIso: new Date(endUtcMs).toISOString(),
    totalCount: 0,
    totalAmountCny: 0,
    approvedCount: 0,
    approvedAmountCny: 0,
    rejectedCount: 0,
    rejectedAmountCny: 0,
    pendingCount: 0,
    pendingAmountCny: 0,
    canceledCount: 0,
    canceledAmountCny: 0,
    amountMissingCount: 0,
  };

  // 分批并发拉取实例详情，避免瞬间并发过高触及限流
  const BATCH_SIZE = 10;
  for (let i = 0; i < instanceCodes.length; i += BATCH_SIZE) {
    const slice = instanceCodes.slice(i, i + BATCH_SIZE);
    const details = await Promise.all(slice.map((c) => getApprovalInstanceDetail(token, c)));
    for (const d of details) {
      const amount = extractApprovalAmountCny(d.form);
      const val = amount ?? 0;
      if (amount === null) stats.amountMissingCount += 1;

      stats.totalCount += 1;
      stats.totalAmountCny += val;

      if (d.status === "APPROVED") {
        stats.approvedCount += 1;
        stats.approvedAmountCny += val;
      } else if (d.status === "REJECTED") {
        stats.rejectedCount += 1;
        stats.rejectedAmountCny += val;
      } else if (d.status === "PENDING") {
        stats.pendingCount += 1;
        stats.pendingAmountCny += val;
      } else {
        stats.canceledCount += 1;
        stats.canceledAmountCny += val;
      }
    }
  }

  const summary =
    stats.totalCount === 0
      ? `本周期内暂无「采购申请」审批记录。`
      : `本周期共发起 ${stats.totalCount} 笔采购申请，累计金额 ${formatCny(stats.totalAmountCny)}。`;

  const detailsList: Array<{ label: string; value: string }> = [
    { label: "统计时段", value: `${formatBjtDateTime(startUtcMs)} ~ ${formatBjtDateTime(endUtcMs)}` },
    { label: "发起总数", value: `${stats.totalCount} 笔 · ${formatCny(stats.totalAmountCny)}` },
    { label: "审批通过", value: `${stats.approvedCount} 笔 · ${formatCny(stats.approvedAmountCny)}` },
    { label: "审批未通过", value: `${stats.rejectedCount} 笔 · ${formatCny(stats.rejectedAmountCny)}` },
    { label: "审批中", value: `${stats.pendingCount} 笔 · ${formatCny(stats.pendingAmountCny)}` },
  ];
  if (stats.canceledCount > 0) {
    detailsList.push({ label: "已撤回/作废", value: `${stats.canceledCount} 笔 · ${formatCny(stats.canceledAmountCny)}` });
  }
  if (stats.amountMissingCount > 0) {
    detailsList.push({ label: "未识别金额单据", value: `${stats.amountMissingCount} 笔（按 ¥0.00 计）` });
  }

  const channel = await sendFeishuAlert(env, {
    alertKey: dedupeKey,
    siteId,
    severity: "info",
    title: `🛒 ${periodLabel} 汇总简报`,
    summary,
    occurredAtUtc: nowIso,
    hideOccurredAt: true,
    details: detailsList,
  });

  // 仅定时任务自动发送时写入去重锁，避免手动测试（force=true）导致当晚/月底自动简报被跳过
  if (channel.ok && !force) {
    await upsertAlertState(env.VIDEO_DB, {
      alertKey: dedupeKey,
      siteId,
      alertType: `approval_${period}`,
      status: "ok",
      lastTriggeredAt: null,
      lastNotifiedAt: nowIso,
      lastResolvedAt: null,
      lastMessage: summary,
      updatedAt: nowIso,
    });
  }

  return {
    period,
    sent: channel.ok,
    stats,
    channel,
  };
}

/**
 * 在 Cloudflare Worker 每 2 分钟的 scheduled() 中执行：
 * - 日报：北京时间每日 20:00 ~ 20:09
 * - 周报：北京时间每周五 22:00 ~ 22:09
 * - 月报：北京时间每月最后一天 23:00 ~ 23:09
 */
export async function runScheduledApprovalReports(env: Env): Promise<ApprovalReportResult[]> {
  const nowUtcMs = Date.now();
  const bjt = toBeijingDate(nowUtcMs);
  const hour = bjt.getUTCHours();
  const minute = bjt.getUTCMinutes();
  const dayOfWeek = bjt.getUTCDay(); // 5 = 周五

  // 判断明天 (北京时间) 是否是 1 号，从而精准判断今天是否为本月最后一天
  const tomorrowBjt = new Date(bjt.getTime() + 24 * 3600 * 1000);
  const isLastDayOfMonth = tomorrowBjt.getUTCDate() === 1;

  const duePeriods: ApprovalReportPeriod[] = [];
  if (hour === 20 && minute < 10) duePeriods.push("daily");
  if (dayOfWeek === 5 && hour === 22 && minute < 10) duePeriods.push("weekly");
  if (isLastDayOfMonth && hour === 23 && minute < 10) duePeriods.push("monthly");

  const results: ApprovalReportResult[] = [];
  for (const period of duePeriods) {
    try {
      results.push(await runPurchaseApprovalReport(env, period, false));
    } catch (err) {
      results.push({
        period,
        sent: false,
        skippedReason: err instanceof Error ? err.message : String(err),
      });
    }
  }
  return results;
}
