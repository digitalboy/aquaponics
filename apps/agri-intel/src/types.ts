export type IntelEdition = "industry" | "academic" | "dataset";

export type IntelCategory =
  | "industry_news"
  | "tech_breakthrough"
  | "research_paper"
  | "dataset_release"
  | "irrelevant";

export interface IntelArticleMeta {
  platform?: string;
  modality?: string;
  task?: string;
  format?: string;
  license?: string;
  venue?: string;
  downloads?: number;
}

export interface SourceFetchReport {
  source: string;
  fetched: number;
  error?: string;
}

export interface Env {
  INTEL_DB: D1Database;
  CLOUDFLARE_ACCOUNT_ID: string;
  AI_GATEWAY_NAME: string;
  DECISION_MIN_SCORE: string;
  MAX_DAILY_ITEMS: string;
  LOOKBACK_HOURS: string;
  FEISHU_CHAT_ID_INTEL?: string;
  FEISHU_APP_ID?: string;
  FEISHU_APP_SECRET?: string;
  GOOGLE_AI_STUDIO_API_KEY?: string;
  INTERNAL_API_KEY?: string;
}

export interface RawIntelItem {
  edition: IntelEdition;
  sourceName: string;
  titleRaw: string;
  excerptRaw: string;
  url: string;
  publishedAtUtc: string;
  meta?: IntelArticleMeta;
}

export interface JudgedIntelItem extends RawIntelItem {
  urlHash: string;
  relevant: boolean;
  category: IntelCategory;
  score: number;
  confidence: number;
}

export interface SummarizedIntelItem extends JudgedIntelItem {
  titleZh: string;
  summaryZh: string;
  tags: string[];
}

const STRICT_ISO_UTC_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

/** 返回当前严格 ISO 8601 UTC 时间字符串 (YYYY-MM-DDTHH:mm:ss.sssZ) */
export function nowIsoUtc(): string {
  return new Date().toISOString();
}

/** 将任意可解析时间规范化为严格 ISO 8601 UTC 毫秒字符串 */
export function normalizeIsoUtc(raw: string | undefined): string {
  if (!raw) return nowIsoUtc();
  if (STRICT_ISO_UTC_RE.test(raw) && !Number.isNaN(Date.parse(raw))) return raw;
  const ms = Date.parse(raw);
  if (Number.isNaN(ms)) return nowIsoUtc();
  return new Date(ms).toISOString();
}

/** 计算字符串 SHA-256 十六进制摘要，用于 URL 去重主键 */
export async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}
