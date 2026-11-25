export interface SendEmailAddress {
  email: string;
  name: string;
}

export interface SendEmailMessage {
  from: string | SendEmailAddress;
  to?: string | SendEmailAddress | (string | SendEmailAddress)[];
  subject: string;
  html?: string;
  text?: string;
}

export interface SendEmailBinding {
  send(message: SendEmailMessage): Promise<{ messageId: string }>;
}

export interface Env {
  VIDEO_DB: D1Database;
  VIDEO_R2: R2Bucket;
  DEFAULT_SITE_ID: string;
  WAKE_TTL_SEC: string;
  TOKEN_TTL_SEC: string;
  ALLOWED_ORIGINS: string;
  AGENT_SECRET?: string;
  SIGNING_SECRET?: string;
  INTERNAL_API_KEY?: string;
  ADMIN_PASSWORD?: string;
  ADMIN_FEISHU_OPEN_IDS?: string;
  EMAIL?: SendEmailBinding;
  ALERT_EMAIL_TO?: string;
  ALERT_EMAIL_FROM?: string;
  FEISHU_WEBHOOK_URL?: string;
  FEISHU_WEBHOOK_SECRET?: string;
  FEISHU_APP_ID?: string;
  FEISHU_APP_SECRET?: string;
  FEISHU_CHAT_ID?: string;
  ALERT_WEBHOOK_URL?: string;
  HEARTBEAT_TIMEOUT_SEC?: string;
  SNAPSHOT_STALE_SEC?: string;
  ALERT_COOLDOWN_SEC?: string;
  DIGEST_INTERVAL_SEC?: string;
}

export type CameraVisibility = "internal_ops" | "public_trace";
export type StreamMode = "snapshot" | "on-demand" | "continuous-hls" | "disabled";
export type OnlineStatus = "online" | "offline" | "degraded" | "unknown";

export interface CameraRow {
  cam_id: string;
  site_id: string;
  name: string;
  zone: string;
  visibility: CameraVisibility;
  ip_address: string;
  rtsp_channel: number;
  stream_mode: StreamMode;
  audio_enabled: number;
  online_status: OnlineStatus;
  last_seen_at: string | null;
  last_viewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PlaybackTokenPayload {
  cam_id: string;
  site_id: string;
  scope: "live" | "playback" | "snapshot";
  exp: number;
}

const STRICT_ISO_UTC_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

/** 返回当前严格 ISO 8601 UTC 时间字符串 (YYYY-MM-DDTHH:mm:ss.sssZ) */
export function nowIsoUtc(): string {
  return new Date().toISOString();
}

/** 校验时间字符串是否为严格 ISO 8601 UTC 格式 */
export function isStrictIsoUtc(value: string): boolean {
  if (!STRICT_ISO_UTC_RE.test(value)) return false;
  return !Number.isNaN(Date.parse(value));
}

/** 构建带 CORS 头的 JSON 响应 */
export function jsonResponse(
  data: unknown,
  status = 200,
  corsOrigin = "*",
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": corsOrigin,
      "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
      "Access-Control-Allow-Headers":
        "Content-Type, Authorization, X-Site-Id, X-Timestamp, X-Signature",
    },
  });
}
