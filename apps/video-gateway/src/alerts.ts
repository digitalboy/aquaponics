import { type CameraRow, type Env, nowIsoUtc } from "./types";

export type AlertSeverity = "critical" | "warning" | "resolved" | "info";

export interface AlertImageItem {
  label: string;
  imageKey: string;
  capturedAtUtc?: string;
}

export interface AlertPayload {
  alertKey: string;
  siteId: string;
  camId?: string;
  camName?: string;
  severity: AlertSeverity;
  title: string;
  summary: string;
  occurredAtUtc: string;
  details?: Array<{ label: string; value: string }>;
  images?: AlertImageItem[];
}

interface AlertStateRow {
  alert_key: string;
  status: "ok" | "firing";
  last_triggered_at: string | null;
  last_notified_at: string | null;
  last_resolved_at: string | null;
  last_message: string | null;
}

export interface ChannelResult {
  channel: "email" | "feishu" | "webhook";
  ok: boolean;
  skipped?: boolean;
  detail: string;
}

export interface HealthCheckReport {
  checkedAt: string;
  activeCameras: number;
  triggered: number;
  resolved: number;
  notificationsSent: number;
  results: Array<{ alertKey: string; action: string; channels: ChannelResult[] }>;
}

const DEFAULT_HEARTBEAT_TIMEOUT_SEC = 300;
const DEFAULT_SNAPSHOT_STALE_SEC = 1500;
const DEFAULT_COOLDOWN_SEC = 1800;
const DASHBOARD_URL = "https://video.guoshu.dev";

function parsePositiveInt(raw: string | undefined, fallback: number): number {
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

/** 将 ISO UTC 时间格式化为北京时间 (UTC+8) 便于告警阅读 */
function formatBeijingTime(isoUtc: string): string {
  const ms = Date.parse(isoUtc);
  if (Number.isNaN(ms)) return isoUtc;
  const cst = new Date(ms + 8 * 3600 * 1000);
  const pad = (v: number) => String(v).padStart(2, "0");
  return `${cst.getUTCFullYear()}-${pad(cst.getUTCMonth() + 1)}-${pad(cst.getUTCDate())} ${pad(cst.getUTCHours())}:${pad(cst.getUTCMinutes())}:${pad(cst.getUTCSeconds())} (北京时间)`;
}

function formatDurationSec(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)} 秒`;
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins} 分钟`;
  const hours = Math.floor(mins / 60);
  const remMins = mins % 60;
  return remMins > 0 ? `${hours} 小时 ${remMins} 分钟` : `${hours} 小时`;
}

function escapeHtml(raw: string): string {
  return raw
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** 飞书自定义机器人签名校验 (key = `${timestamp}\n${secret}`, message = "") */
async function signFeishuWebhook(secret: string, timestampSec: string): Promise<string> {
  const keyData = new TextEncoder().encode(`${timestampSec}\n${secret}`);
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", cryptoKey, new Uint8Array(0));
  const bytes = new Uint8Array(sig);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return btoa(binary);
}

function feishuTemplateBySeverity(severity: AlertSeverity): string {
  if (severity === "critical") return "red";
  if (severity === "warning") return "orange";
  if (severity === "resolved") return "green";
  return "blue";
}

/** 获取飞书自建应用 tenant_access_token */
async function fetchFeishuTenantToken(appId: string, appSecret: string): Promise<string> {
  const res = await fetch("https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ app_id: appId, app_secret: appSecret }),
  });
  const data = (await res.json()) as {
    code?: number;
    msg?: string;
    tenant_access_token?: string;
  };
  if (!res.ok || data.code !== 0 || !data.tenant_access_token) {
    throw new Error(`Feishu token error (${data.code ?? res.status}): ${data.msg ?? "unknown"}`);
  }
  return data.tenant_access_token;
}

/** 调用 POST /open-apis/im/v1/images 上传图片换取 image_key */
async function uploadImageToFeishu(
  tenantToken: string,
  imageBytes: ArrayBuffer,
  filename: string,
): Promise<string> {
  const form = new FormData();
  form.append("image_type", "message");
  form.append("image", new Blob([imageBytes], { type: "image/jpeg" }), filename);

  const res = await fetch("https://open.feishu.cn/open-apis/im/v1/images", {
    method: "POST",
    headers: { Authorization: `Bearer ${tenantToken}` },
    body: form,
  });
  const data = (await res.json()) as {
    code?: number;
    msg?: string;
    data?: { image_key?: string };
  };
  if (!res.ok || data.code !== 0 || !data.data?.image_key) {
    throw new Error(`Feishu image upload error (${data.code ?? res.status}): ${data.msg ?? "unknown"}`);
  }
  return data.data.image_key;
}

/** 发送飞书群自定义机器人交互式卡片 */
async function sendFeishuAlert(env: Env, payload: AlertPayload): Promise<ChannelResult> {
  const webhookUrl = env.FEISHU_WEBHOOK_URL?.trim();
  if (!webhookUrl) {
    return { channel: "feishu", ok: false, skipped: true, detail: "FEISHU_WEBHOOK_URL not configured" };
  }

  const lines = [
    `**${payload.summary}**`,
    `- **基地**：${payload.siteId}`,
    ...(payload.camName ? [`- **机位**：${payload.camName} (${payload.camId ?? ""})`] : []),
    `- **时间**：${formatBeijingTime(payload.occurredAtUtc)}`,
    ...(payload.details ?? []).map((d) => `- **${d.label}**：${d.value}`),
  ];

  const elements: Array<Record<string, unknown>> = [
    { tag: "markdown", content: lines.join("\n") },
  ];

  if (payload.images && payload.images.length > 0) {
    for (const img of payload.images) {
      elements.push({
        tag: "markdown",
        content: `**${img.label}**${img.capturedAtUtc ? ` · 拍摄于 ${formatBeijingTime(img.capturedAtUtc)}` : ""}`,
      });
      elements.push({
        tag: "img",
        img_key: img.imageKey,
        alt: { tag: "plain_text", content: img.label },
        mode: "fit_horizontal",
        preview: true,
      });
    }
  }

  elements.push({
    tag: "action",
    actions: [
      {
        tag: "button",
        text: { tag: "plain_text", content: "查看实时监控页面" },
        type: "primary",
        url: DASHBOARD_URL,
      },
    ],
  });

  const body: Record<string, unknown> = {
    msg_type: "interactive",
    card: {
      config: { wide_screen_mode: true },
      header: {
        template: feishuTemplateBySeverity(payload.severity),
        title: { tag: "plain_text", content: payload.title },
      },
      elements,
    },
  };

  if (env.FEISHU_WEBHOOK_SECRET?.trim()) {
    const timestampSec = String(Math.floor(Date.now() / 1000));
    body.timestamp = timestampSec;
    body.sign = await signFeishuWebhook(env.FEISHU_WEBHOOK_SECRET.trim(), timestampSec);
  }

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(body),
    });
    const text = await res.text();
    if (!res.ok) {
      return { channel: "feishu", ok: false, detail: `HTTP ${res.status}: ${text}` };
    }
    // 飞书接口即使 HTTP 200 也可能返回 {"code": 19024, "msg": "..."}
    try {
      const parsed = JSON.parse(text) as { code?: number; msg?: string; StatusCode?: number };
      const code = parsed.code ?? parsed.StatusCode ?? 0;
      if (code !== 0) {
        return { channel: "feishu", ok: false, detail: `Feishu error ${code}: ${parsed.msg ?? text}` };
      }
    } catch {
      // 非 JSON 忽略
    }
    return { channel: "feishu", ok: true, detail: "sent" };
  } catch (err) {
    return { channel: "feishu", ok: false, detail: err instanceof Error ? err.message : String(err) };
  }
}

/** 发送通用 JSON Webhook（可选预留） */
async function sendGenericWebhook(env: Env, payload: AlertPayload): Promise<ChannelResult> {
  const url = env.ALERT_WEBHOOK_URL?.trim();
  if (!url) {
    return { channel: "webhook", ok: false, skipped: true, detail: "ALERT_WEBHOOK_URL not configured" };
  }
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        source: "aquaponics-video-gateway",
        ...payload,
        occurredAtBeijing: formatBeijingTime(payload.occurredAtUtc),
        dashboardUrl: DASHBOARD_URL,
      }),
    });
    return {
      channel: "webhook",
      ok: res.ok,
      detail: res.ok ? "sent" : `HTTP ${res.status}`,
    };
  } catch (err) {
    return { channel: "webhook", ok: false, detail: err instanceof Error ? err.message : String(err) };
  }
}

/** 通过 Cloudflare Email Service Binding 发送邮件告警 */
async function sendEmailAlert(env: Env, payload: AlertPayload): Promise<ChannelResult> {
  const to = env.ALERT_EMAIL_TO?.trim();
  if (!env.EMAIL || !to) {
    return { channel: "email", ok: false, skipped: true, detail: "EMAIL binding or ALERT_EMAIL_TO not configured" };
  }
  const fromEmail = env.ALERT_EMAIL_FROM?.trim() || "video-alert@guoshu.dev";
  const bjt = formatBeijingTime(payload.occurredAtUtc);
  const detailLines = (payload.details ?? []).map((d) => `${d.label}: ${d.value}`);

  const text = [
    payload.title,
    "",
    payload.summary,
    `基地: ${payload.siteId}`,
    ...(payload.camName ? [`机位: ${payload.camName} (${payload.camId ?? ""})`] : []),
    `时间: ${bjt} (UTC: ${payload.occurredAtUtc})`,
    ...detailLines,
    "",
    `查看监控: ${DASHBOARD_URL}`,
  ].join("\n");

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 10px;">
      <h2 style="margin: 0 0 12px; color: ${payload.severity === "resolved" ? "#15803d" : "#b91c1c"};">${escapeHtml(payload.title)}</h2>
      <p style="font-size: 15px; color: #111827; margin: 0 0 16px;">${escapeHtml(payload.summary)}</p>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #374151;">
        <tr><td style="padding: 6px 0; font-weight: 600; width: 110px;">基地</td><td>${escapeHtml(payload.siteId)}</td></tr>
        ${payload.camName ? `<tr><td style="padding: 6px 0; font-weight: 600;">机位</td><td>${escapeHtml(payload.camName)} (${escapeHtml(payload.camId ?? "")})</td></tr>` : ""}
        <tr><td style="padding: 6px 0; font-weight: 600;">发生时间</td><td>${escapeHtml(bjt)}<br><small style="color:#6b7280;">${escapeHtml(payload.occurredAtUtc)}</small></td></tr>
        ${(payload.details ?? []).map((d) => `<tr><td style="padding: 6px 0; font-weight: 600;">${escapeHtml(d.label)}</td><td>${escapeHtml(d.value)}</td></tr>`).join("")}
      </table>
      <div style="margin-top: 20px;">
        <a href="${DASHBOARD_URL}" style="display: inline-block; padding: 10px 18px; background: #059669; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600;">打开监控页面</a>
      </div>
    </div>
  `.trim();

  try {
    const result = await env.EMAIL.send({
      from: { email: fromEmail, name: "国数AI农业监控" },
      to,
      subject: `[国数AI农业] ${payload.title}`,
      html,
      text,
    });
    return { channel: "email", ok: true, detail: `messageId=${result.messageId}` };
  } catch (err) {
    return { channel: "email", ok: false, detail: err instanceof Error ? err.message : String(err) };
  }
}

/** 并发投递至已配置的所有告警通道 */
export async function dispatchAlertNotifications(
  env: Env,
  payload: AlertPayload,
): Promise<ChannelResult[]> {
  return Promise.all([
    sendFeishuAlert(env, payload),
    sendEmailAlert(env, payload),
    sendGenericWebhook(env, payload),
  ]);
}

async function getAlertState(db: D1Database, alertKey: string): Promise<AlertStateRow | null> {
  return db
    .prepare(
      `SELECT alert_key, status, last_triggered_at, last_notified_at, last_resolved_at, last_message
       FROM alert_states WHERE alert_key = ?1`,
    )
    .bind(alertKey)
    .first<AlertStateRow>();
}

async function upsertAlertState(
  db: D1Database,
  params: {
    alertKey: string;
    siteId: string;
    camId?: string;
    alertType: string;
    status: "ok" | "firing";
    lastTriggeredAt: string | null;
    lastNotifiedAt: string | null;
    lastResolvedAt: string | null;
    lastMessage: string;
    updatedAt: string;
  },
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO alert_states
       (alert_key, site_id, cam_id, alert_type, status, last_triggered_at, last_notified_at, last_resolved_at, last_message, updated_at)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)
       ON CONFLICT(alert_key) DO UPDATE SET
         status = excluded.status,
         last_triggered_at = excluded.last_triggered_at,
         last_notified_at = excluded.last_notified_at,
         last_resolved_at = excluded.last_resolved_at,
         last_message = excluded.last_message,
         updated_at = excluded.updated_at`,
    )
    .bind(
      params.alertKey,
      params.siteId,
      params.camId ?? null,
      params.alertType,
      params.status,
      params.lastTriggeredAt,
      params.lastNotifiedAt,
      params.lastResolvedAt,
      params.lastMessage,
      params.updatedAt,
    )
    .run();
}

async function evaluateAlertCondition(
  env: Env,
  opts: {
    alertKey: string;
    siteId: string;
    camId: string;
    camName: string;
    alertType: string;
    isFiring: boolean;
    cooldownSec: number;
    nowIso: string;
    nowMs: number;
    firingPayload: () => AlertPayload;
    resolvedPayload: () => AlertPayload;
  },
): Promise<{ action: "none" | "fired" | "reminded" | "resolved"; channels: ChannelResult[] }> {
  const prev = await getAlertState(env.VIDEO_DB, opts.alertKey);

  if (opts.isFiring) {
    const isNew = !prev || prev.status === "ok";
    const lastNotifiedMs = prev?.last_notified_at ? Date.parse(prev.last_notified_at) : 0;
    const cooldownElapsed = !lastNotifiedMs || opts.nowMs - lastNotifiedMs >= opts.cooldownSec * 1000;

    if (isNew || cooldownElapsed) {
      const payload = opts.firingPayload();
      const channels = await dispatchAlertNotifications(env, payload);
      await upsertAlertState(env.VIDEO_DB, {
        alertKey: opts.alertKey,
        siteId: opts.siteId,
        camId: opts.camId,
        alertType: opts.alertType,
        status: "firing",
        lastTriggeredAt: isNew ? opts.nowIso : (prev?.last_triggered_at ?? opts.nowIso),
        lastNotifiedAt: opts.nowIso,
        lastResolvedAt: prev?.last_resolved_at ?? null,
        lastMessage: payload.summary,
        updatedAt: opts.nowIso,
      });
      return { action: isNew ? "fired" : "reminded", channels };
    }

    return { action: "none", channels: [] };
  }

  // 条件已恢复正常：只有之前是 firing 时才发送恢复通知
  if (prev && prev.status === "firing") {
    const payload = opts.resolvedPayload();
    const channels = await dispatchAlertNotifications(env, payload);
    await upsertAlertState(env.VIDEO_DB, {
      alertKey: opts.alertKey,
      siteId: opts.siteId,
      camId: opts.camId,
      alertType: opts.alertType,
      status: "ok",
      lastTriggeredAt: prev.last_triggered_at,
      lastNotifiedAt: opts.nowIso,
      lastResolvedAt: opts.nowIso,
      lastMessage: payload.summary,
      updatedAt: opts.nowIso,
    });
    return { action: "resolved", channels };
  }

  return { action: "none", channels: [] };
}

/**
 * 定时健康巡检（由 Cloudflare Worker Cron Trigger 每 2 分钟调用）：
 * 1. 检查所有非 disabled 机位的心跳是否超时（默认 5 分钟）
 * 2. 在机位在线前提下，检查最新快照是否超过阈值未更新（默认 25 分钟）
 * 3. 状态变更时写入 D1 alert_states 防抖并推送飞书 + 邮件
 */
export async function runHealthCheckAndAlert(env: Env): Promise<HealthCheckReport> {
  const nowIso = nowIsoUtc();
  const nowMs = Date.parse(nowIso);
  const heartbeatTimeoutSec = parsePositiveInt(env.HEARTBEAT_TIMEOUT_SEC, DEFAULT_HEARTBEAT_TIMEOUT_SEC);
  const snapshotStaleSec = parsePositiveInt(env.SNAPSHOT_STALE_SEC, DEFAULT_SNAPSHOT_STALE_SEC);
  const cooldownSec = parsePositiveInt(env.ALERT_COOLDOWN_SEC, DEFAULT_COOLDOWN_SEC);

  const camerasRes = await env.VIDEO_DB.prepare(
    `SELECT cam_id, site_id, name, zone, visibility, ip_address, rtsp_channel,
            stream_mode, audio_enabled, online_status, last_seen_at, last_viewed_at, created_at, updated_at
     FROM cameras
     WHERE stream_mode != 'disabled'
     ORDER BY cam_id ASC`,
  ).all<CameraRow>();

  const cameras = camerasRes.results ?? [];
  const report: HealthCheckReport = {
    checkedAt: nowIso,
    activeCameras: cameras.length,
    triggered: 0,
    resolved: 0,
    notificationsSent: 0,
    results: [],
  };

  for (const cam of cameras) {
    const lastSeenMs = cam.last_seen_at ? Date.parse(cam.last_seen_at) : 0;
    const offlineSec = lastSeenMs > 0 ? Math.max(0, (nowMs - lastSeenMs) / 1000) : Number.POSITIVE_INFINITY;
    const isOffline = !lastSeenMs || offlineSec > heartbeatTimeoutSec;

    if (isOffline && cam.online_status !== "offline") {
      await env.VIDEO_DB.prepare(
        `UPDATE cameras SET online_status = 'offline', updated_at = ?1 WHERE cam_id = ?2`,
      )
        .bind(nowIso, cam.cam_id)
        .run();
    }

    const offlineKey = `camera_offline:${cam.site_id}:${cam.cam_id}`;
    const offlineEval = await evaluateAlertCondition(env, {
      alertKey: offlineKey,
      siteId: cam.site_id,
      camId: cam.cam_id,
      camName: cam.name,
      alertType: "camera_offline",
      isFiring: isOffline,
      cooldownSec,
      nowIso,
      nowMs,
      firingPayload: () => ({
        alertKey: offlineKey,
        siteId: cam.site_id,
        camId: cam.cam_id,
        camName: cam.name,
        severity: "critical",
        title: `🚨 监控机位失联：${cam.name}`,
        summary: `机位「${cam.name}」心跳已超时（可能工控机断网、停电或摄像头离线）。`,
        occurredAtUtc: nowIso,
        details: [
          {
            label: "失联时长",
            value: Number.isFinite(offlineSec) ? formatDurationSec(offlineSec) : "从未上报心跳",
          },
          {
            label: "最后在线",
            value: cam.last_seen_at ? formatBeijingTime(cam.last_seen_at) : "无记录",
          },
          { label: "告警阈值", value: `${formatDurationSec(heartbeatTimeoutSec)}无心跳` },
        ],
      }),
      resolvedPayload: () => ({
        alertKey: offlineKey,
        siteId: cam.site_id,
        camId: cam.cam_id,
        camName: cam.name,
        severity: "resolved",
        title: `✅ 监控机位已恢复：${cam.name}`,
        summary: `机位「${cam.name}」已重新恢复心跳与在线状态。`,
        occurredAtUtc: nowIso,
        details: [
          { label: "恢复时间", value: formatBeijingTime(nowIso) },
        ],
      }),
    });

    if (offlineEval.action !== "none") {
      if (offlineEval.action === "resolved") report.resolved += 1;
      else report.triggered += 1;
      report.notificationsSent += offlineEval.channels.filter((c) => c.ok).length;
      report.results.push({ alertKey: offlineKey, action: offlineEval.action, channels: offlineEval.channels });
    }

    // 仅在机位心跳正常时检查快照抓拍是否停滞，避免断网时双倍刷屏
    const latestSnap = await env.VIDEO_DB.prepare(
      `SELECT captured_at FROM snapshots WHERE site_id = ?1 AND cam_id = ?2 ORDER BY captured_at DESC LIMIT 1`,
    )
      .bind(cam.site_id, cam.cam_id)
      .first<{ captured_at: string }>();

    const snapMs = latestSnap?.captured_at ? Date.parse(latestSnap.captured_at) : 0;
    const snapAgeSec = snapMs > 0 ? Math.max(0, (nowMs - snapMs) / 1000) : Number.POSITIVE_INFINITY;
    const isSnapshotStale = !isOffline && snapMs > 0 && snapAgeSec > snapshotStaleSec;

    const snapKey = `snapshot_stale:${cam.site_id}:${cam.cam_id}`;
    const snapEval = await evaluateAlertCondition(env, {
      alertKey: snapKey,
      siteId: cam.site_id,
      camId: cam.cam_id,
      camName: cam.name,
      alertType: "snapshot_stale",
      isFiring: isSnapshotStale,
      cooldownSec,
      nowIso,
      nowMs,
      firingPayload: () => ({
        alertKey: snapKey,
        siteId: cam.site_id,
        camId: cam.cam_id,
        camName: cam.name,
        severity: "warning",
        title: `⚠️ 画面抓拍停滞：${cam.name}`,
        summary: `工控机在线，但机位「${cam.name}」已超过 ${formatDurationSec(snapAgeSec)} 未上传新画面（可能摄像头断流或连续灰屏被过滤）。`,
        occurredAtUtc: nowIso,
        details: [
          {
            label: "最后画面",
            value: latestSnap?.captured_at ? formatBeijingTime(latestSnap.captured_at) : "无记录",
          },
          { label: "告警阈值", value: `${formatDurationSec(snapshotStaleSec)}无新画面` },
        ],
      }),
      resolvedPayload: () => ({
        alertKey: snapKey,
        siteId: cam.site_id,
        camId: cam.cam_id,
        camName: cam.name,
        severity: "resolved",
        title: `✅ 画面抓拍已恢复：${cam.name}`,
        summary: `机位「${cam.name}」已恢复正常快照上传。`,
        occurredAtUtc: nowIso,
      }),
    });

    if (snapEval.action !== "none") {
      if (snapEval.action === "resolved") report.resolved += 1;
      else report.triggered += 1;
      report.notificationsSent += snapEval.channels.filter((c) => c.ok).length;
      report.results.push({ alertKey: snapKey, action: snapEval.action, channels: snapEval.channels });
    }
  }

  return report;
}

export interface FeishuDigestResult {
  sent: boolean;
  skippedReason?: string;
  imagesCount: number;
  channel?: ChannelResult;
}

/**
 * 每 30 分钟向飞书群 Webhook 发送带实拍图片的监控简报（仅推送飞书，不发邮件）
 * 需配置 FEISHU_WEBHOOK_URL + FEISHU_APP_ID + FEISHU_APP_SECRET
 */
export async function runPeriodicFeishuDigest(
  env: Env,
  force = false,
): Promise<FeishuDigestResult> {
  const webhookUrl = env.FEISHU_WEBHOOK_URL?.trim();
  const appId = env.FEISHU_APP_ID?.trim();
  const appSecret = env.FEISHU_APP_SECRET?.trim();
  if (!webhookUrl || !appId || !appSecret) {
    return {
      sent: false,
      skippedReason: "FEISHU_WEBHOOK_URL, FEISHU_APP_ID or FEISHU_APP_SECRET not configured",
      imagesCount: 0,
    };
  }

  const nowIso = nowIsoUtc();
  const nowMs = Date.parse(nowIso);
  const siteId = env.DEFAULT_SITE_ID || "guangming-01";
  const digestIntervalSec = parsePositiveInt(env.DIGEST_INTERVAL_SEC, DEFAULT_COOLDOWN_SEC);
  const digestKey = `feishu_digest:${siteId}`;

  if (!force) {
    const prev = await getAlertState(env.VIDEO_DB, digestKey);
    const lastMs = prev?.last_notified_at ? Date.parse(prev.last_notified_at) : 0;
    if (lastMs > 0 && nowMs - lastMs < digestIntervalSec * 1000) {
      return {
        sent: false,
        skippedReason: `cooldown active (${Math.round((nowMs - lastMs) / 1000)}s < ${digestIntervalSec}s)`,
        imagesCount: 0,
      };
    }
  }

  const camerasRes = await env.VIDEO_DB.prepare(
    `SELECT cam_id, site_id, name, online_status, last_seen_at
     FROM cameras
     WHERE site_id = ?1 AND stream_mode != 'disabled'
     ORDER BY cam_id ASC`,
  )
    .bind(siteId)
    .all<Pick<CameraRow, "cam_id" | "site_id" | "name" | "online_status" | "last_seen_at">>();

  const cameras = camerasRes.results ?? [];
  if (cameras.length === 0) {
    return { sent: false, skippedReason: "no active cameras", imagesCount: 0 };
  }

  const tenantToken = await fetchFeishuTenantToken(appId, appSecret);
  const images: AlertImageItem[] = [];
  const statusLines: Array<{ label: string; value: string }> = [];

  for (const cam of cameras) {
    const snap = await env.VIDEO_DB.prepare(
      `SELECT r2_key, captured_at, size_bytes
       FROM snapshots
       WHERE site_id = ?1 AND cam_id = ?2
       ORDER BY captured_at DESC
       LIMIT 1`,
    )
      .bind(cam.site_id, cam.cam_id)
      .first<{ r2_key: string; captured_at: string; size_bytes: number }>();

    if (!snap) {
      statusLines.push({ label: cam.name, value: "暂无快照" });
      continue;
    }

    const r2Obj = await env.VIDEO_R2.get(snap.r2_key);
    if (!r2Obj) {
      statusLines.push({ label: cam.name, value: "快照文件缺失" });
      continue;
    }

    const bytes = await r2Obj.arrayBuffer();
    const imageKey = await uploadImageToFeishu(tenantToken, bytes, `${cam.cam_id}.jpg`);
    images.push({
      label: cam.name,
      imageKey,
      capturedAtUtc: snap.captured_at,
    });
    statusLines.push({
      label: cam.name,
      value: `${cam.online_status === "online" ? "在线" : cam.online_status} · ${Math.round(snap.size_bytes / 1024)} KB`,
    });
  }

  if (images.length === 0) {
    return { sent: false, skippedReason: "no snapshot images available in R2", imagesCount: 0 };
  }

  const channel = await sendFeishuAlert(env, {
    alertKey: digestKey,
    siteId,
    severity: "resolved",
    title: "📸 国数AI农业 · 现场实时画面简报",
    summary: `为您同步 ${images.length} 路监控机位最新实拍画面（每 ${Math.round(digestIntervalSec / 60)} 分钟自动推送）。`,
    occurredAtUtc: nowIso,
    details: statusLines,
    images,
  });

  if (channel.ok) {
    await upsertAlertState(env.VIDEO_DB, {
      alertKey: digestKey,
      siteId,
      alertType: "feishu_digest",
      status: "ok",
      lastTriggeredAt: nowIso,
      lastNotifiedAt: nowIso,
      lastResolvedAt: nowIso,
      lastMessage: `sent ${images.length} images`,
      updatedAt: nowIso,
    });
  }

  return {
    sent: channel.ok,
    imagesCount: images.length,
    channel,
  };
}

export interface PersonAlertFrame {
  label: string;
  r2Key: string;
  capturedAtUtc: string;
}

export interface PersonAlertInput {
  eventId: string;
  siteId: string;
  camId: string;
  camName: string;
  r2Key: string;
  detectedAtUtc: string;
  personCount: number;
  maxConfidence: number;
  scheduleNote?: string;
  frames?: PersonAlertFrame[];
  recognizedNames?: string[];
  faceSimilarity?: number;
}

/**
 * 处理边缘 N100 上报的夜间人形检测事件：
 * - 若匹配到本地人脸底库（如“张扬”）：飞书推送蓝色熟人识别卡片（直接标出姓名），不发警告邮件
 * - 若未匹配到已知人脸：飞书推送红色未知人员告警卡片 + 发送告警邮件
 */
export async function handlePersonDetectionAlert(
  env: Env,
  input: PersonAlertInput,
): Promise<ChannelResult[]> {
  const images: AlertImageItem[] = [];
  const appId = env.FEISHU_APP_ID?.trim();
  const appSecret = env.FEISHU_APP_SECRET?.trim();
  const frameList: PersonAlertFrame[] =
    input.frames && input.frames.length > 0
      ? input.frames.slice(0, 3)
      : [{ label: `${input.camName} · 现场抓拍`, r2Key: input.r2Key, capturedAtUtc: input.detectedAtUtc }];

  if (appId && appSecret && env.FEISHU_WEBHOOK_URL?.trim()) {
    try {
      const token = await fetchFeishuTenantToken(appId, appSecret);
      for (let i = 0; i < frameList.length; i += 1) {
        const frame = frameList[i]!;
        const obj = await env.VIDEO_R2.get(frame.r2Key);
        if (!obj) continue;
        const bytes = await obj.arrayBuffer();
        const imageKey = await uploadImageToFeishu(token, bytes, `${input.eventId}-${i + 1}.jpg`);
        images.push({
          label: `${input.camName} · ${frame.label}`,
          imageKey,
          capturedAtUtc: frame.capturedAtUtc,
        });
      }
    } catch {
      // 图片上传失败时不阻塞文字告警和邮件通知
    }
  }

  const confidencePct = `${Math.round(input.maxConfidence * 100)}%`;
  const knownNames = (input.recognizedNames ?? []).filter((n) => n.trim().length > 0);
  const isKnown = knownNames.length > 0;
  const simPct = input.faceSimilarity ? `${Math.round(input.faceSimilarity * 100)}%` : undefined;

  const basePayload: AlertPayload = isKnown
    ? {
        alertKey: `person_alert:${input.eventId}`,
        siteId: input.siteId,
        camId: input.camId,
        camName: input.camName,
        severity: "info",
        title: `👋 夜间识别到熟人：${knownNames.join("、")}（${input.camName}）`,
        summary: `夜间在「${input.camName}」画面中识别到已登记人员：**${knownNames.join("、")}**${simPct ? `（人脸相似度 ${simPct}）` : ""}。`,
        occurredAtUtc: input.detectedAtUtc,
        details: [
          { label: "识别身份", value: knownNames.join("、") },
          ...(simPct ? [{ label: "人脸相似度", value: simPct }] : []),
          { label: "人体置信度", value: confidencePct },
          ...(input.scheduleNote ? [{ label: "布防时段", value: input.scheduleNote }] : []),
        ],
      }
    : {
        alertKey: `person_alert:${input.eventId}`,
        siteId: input.siteId,
        camId: input.camId,
        camName: input.camName,
        severity: "critical",
        title: `🚨 夜间未知人员告警：${input.camName}`,
        summary: `夜间布防期间在「${input.camName}」画面中检测到 ${input.personCount} 名未知人员（最高置信度 ${confidencePct}）。`,
        occurredAtUtc: input.detectedAtUtc,
        details: [
          { label: "检测人数", value: `${input.personCount} 人` },
          { label: "最高置信度", value: confidencePct },
          ...(input.scheduleNote ? [{ label: "布防时段", value: input.scheduleNote }] : []),
        ],
      };

  if (isKnown) {
    return Promise.all([
      sendFeishuAlert(env, { ...basePayload, images }),
      sendGenericWebhook(env, basePayload),
    ]);
  }

  return Promise.all([
    sendFeishuAlert(env, { ...basePayload, images }),
    sendEmailAlert(env, basePayload),
    sendGenericWebhook(env, basePayload),
  ]);
}
