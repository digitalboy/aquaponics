import { GoogleGenAI } from "@google/genai";
import { type Env, type IntelEdition, type RawIntelItem, normalizeIsoUtc, sha256Hex } from "./types";

interface RssSourceConfig {
  name: string;
  url: string;
}

// 全球垂直权威农业科技/设施温室媒体 RSS 源
const INDUSTRY_RSS_SOURCES: RssSourceConfig[] = [
  { name: "HortiDaily", url: "https://www.hortidaily.com/rss/" },
  { name: "AgFunderNews", url: "https://agfundernews.com/feed" },
  { name: "iGrowNews", url: "https://igrownews.com/feed/" },
  { name: "FutureFarming", url: "https://www.futurefarming.com/feed/" },
];

const ARXIV_QUERY =
  "all:(aquaponics OR hydroponics OR aquaculture OR greenhouse OR \"precision agriculture\" OR \"smart agriculture\" OR \"plant phenotyping\" OR \"fish detection\") AND (\"artificial intelligence\" OR \"deep learning\" OR \"computer vision\" OR YOLO OR \"large language model\" OR \"digital twin\" OR \"neural network\")";

function decodeXmlEntities(raw: string): string {
  return raw
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

function stripHtml(raw: string): string {
  return decodeXmlEntities(raw)
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractTagValue(block: string, tagName: string): string {
  const re = new RegExp(`<${tagName}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tagName}>`, "i");
  const m = block.match(re);
  return m?.[1] ? stripHtml(m[1]) : "";
}

function extractAtomLink(block: string): string {
  const alt = block.match(/<link[^>]*rel=["']alternate["'][^>]*href=["']([^"']+)["'][^>]*\/?>/i);
  if (alt?.[1]) return alt[1].trim();
  const anyHref = block.match(/<link[^>]*href=["']([^"']+)["'][^>]*\/?>/i);
  if (anyHref?.[1]) return anyHref[1].trim();
  return extractTagValue(block, "link");
}

/** 规范化文章 URL（去掉常见跟踪参数，提升去重命中率） */
export function canonicalizeUrl(rawUrl: string): string {
  try {
    const u = new URL(rawUrl.trim());
    for (const key of Array.from(u.searchParams.keys())) {
      if (key.startsWith("utm_") || key === "fbclid" || key === "gclid" || key === "ref") {
        u.searchParams.delete(key);
      }
    }
    return u.toString();
  } catch {
    return rawUrl.trim();
  }
}

async function fetchRssOrAtom(
  source: RssSourceConfig,
  edition: IntelEdition,
): Promise<RawIntelItem[]> {
  try {
    const res = await fetch(source.url, {
      headers: {
        "User-Agent": "GuoshuAgriIntelBot/1.0 (+https://guoshu.dev)",
        Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml",
      },
    });
    if (!res.ok) return [];
    const xml = await res.text();

    const items: RawIntelItem[] = [];
    const isAtom = /<entry[\s>]/i.test(xml) && !/<item[\s>]/i.test(xml);
    const pattern = isAtom ? /<entry[\s>][\s\S]*?<\/entry>/gi : /<item[\s>][\s\S]*?<\/item>/gi;
    const matches = xml.match(pattern) ?? [];

    for (const block of matches.slice(0, 20)) {
      const titleRaw = extractTagValue(block, "title");
      const url = canonicalizeUrl(isAtom ? extractAtomLink(block) : extractTagValue(block, "link"));
      const pubRaw =
        extractTagValue(block, "pubDate") ||
        extractTagValue(block, "published") ||
        extractTagValue(block, "updated") ||
        extractTagValue(block, "dc:date");
      const excerptRaw =
        extractTagValue(block, "description") ||
        extractTagValue(block, "summary") ||
        extractTagValue(block, "content");

      if (!titleRaw || !url || !url.startsWith("http")) continue;
      items.push({
        edition,
        sourceName: source.name,
        titleRaw,
        excerptRaw: excerptRaw.slice(0, 1200),
        url,
        publishedAtUtc: normalizeIsoUtc(pubRaw || undefined),
      });
    }
    return items;
  } catch {
    return [];
  }
}

async function fetchArxivPapers(): Promise<RawIntelItem[]> {
  const qs = new URLSearchParams({
    search_query: ARXIV_QUERY,
    start: "0",
    max_results: "25",
    sortBy: "submittedDate",
    sortOrder: "descending",
  });
  return fetchRssOrAtom(
    { name: "arXiv", url: `https://export.arxiv.org/api/query?${qs.toString()}` },
    "academic",
  );
}

/**
 * 使用 Gemini 3.5 Flash-Lite + Google Search Grounding 补搜近 48 小时全球农业 AI 动态
 * （受 Paid Tier 每月 5,000 次免费搜索额度保护，每轮仅调用 1 次）
 */
async function searchViaGeminiGrounding(
  env: Env,
  edition: IntelEdition,
): Promise<RawIntelItem[]> {
  const apiKey = env.GOOGLE_AI_STUDIO_API_KEY?.trim();
  if (!apiKey) return [];

  try {
    const baseUrl = `https://gateway.ai.cloudflare.com/v1/${env.CLOUDFLARE_ACCOUNT_ID}/${env.AI_GATEWAY_NAME}/google-ai-studio`;
    const ai = new GoogleGenAI({ apiKey, httpOptions: { baseUrl } });
    const today = new Date().toISOString().slice(0, 10);

    const prompt =
      edition === "industry"
        ? `Today is ${today}. Use Google Search to find 5 recent (past 48 hours) global agriculture AI, smart greenhouse, aquaponics/aquaculture automation, or agri-robotics industry news articles. Return ONLY a JSON array of objects with fields: title, url, source, published_date (ISO or YYYY-MM-DD), summary.`
        : `Today is ${today}. Use Google Search to find 5 recent (past 7 days) academic papers, open-source datasets, or technical breakthroughs in agricultural AI, plant phenotyping computer vision, fish biomass estimation, or smart greenhouse control. Return ONLY a JSON array of objects with fields: title, url, source, published_date (ISO or YYYY-MM-DD), summary.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = (response.text ?? "").trim();
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];
    const parsed = JSON.parse(jsonMatch[0]) as Array<{
      title?: string;
      url?: string;
      source?: string;
      published_date?: string;
      summary?: string;
    }>;
    if (!Array.isArray(parsed)) return [];

    const results: RawIntelItem[] = [];
    for (const row of parsed) {
      const titleRaw = String(row.title ?? "").trim();
      const url = canonicalizeUrl(String(row.url ?? ""));
      if (!titleRaw || !url.startsWith("http")) continue;
      results.push({
        edition,
        sourceName: String(row.source ?? "Google Search").trim() || "Google Search",
        titleRaw,
        excerptRaw: String(row.summary ?? "").trim().slice(0, 1000),
        url,
        publishedAtUtc: normalizeIsoUtc(row.published_date),
      });
    }
    return results;
  } catch {
    return [];
  }
}

/**
 * 抓取指定版次（industry / academic）的新文章，完成时间窗口过滤与 D1 去重
 */
export async function collectFreshArticles(
  env: Env,
  edition: IntelEdition,
): Promise<{ totalFetched: number; freshItems: Array<RawIntelItem & { urlHash: string }> }> {
  const rawBatches =
    edition === "industry"
      ? await Promise.all([
          ...INDUSTRY_RSS_SOURCES.map((s) => fetchRssOrAtom(s, "industry")),
          searchViaGeminiGrounding(env, "industry"),
        ])
      : await Promise.all([
          fetchArxivPapers(),
          searchViaGeminiGrounding(env, "academic"),
        ]);

  const flat = rawBatches.flat();
  const baseHours = Number(env.LOOKBACK_HOURS) || 48;
  // 学术论文发布节奏较慢，放宽至 14 天 (336h) 窗口并配合 D1 url_hash 永久去重
  const lookbackMs = (edition === "academic" ? Math.max(baseHours, 336) : baseHours) * 3600 * 1000;
  const cutoffMs = Date.now() - lookbackMs;

  const seenInBatch = new Map<string, RawIntelItem & { urlHash: string }>();
  for (const item of flat) {
    const pubMs = Date.parse(item.publishedAtUtc);
    if (!Number.isNaN(pubMs) && pubMs < cutoffMs) continue;

    const urlHash = await sha256Hex(item.url);
    if (!seenInBatch.has(urlHash)) {
      seenInBatch.set(urlHash, { ...item, urlHash });
    }
  }

  const candidates = Array.from(seenInBatch.values());
  if (candidates.length === 0) {
    return { totalFetched: flat.length, freshItems: [] };
  }

  // 查询 D1 排除已处理过的 URL
  const existingHashes = new Set<string>();
  const CHUNK = 40;
  for (let i = 0; i < candidates.length; i += CHUNK) {
    const slice = candidates.slice(i, i + CHUNK);
    const placeholders = slice.map((_, idx) => `?${idx + 1}`).join(",");
    const rows = await env.INTEL_DB.prepare(
      `SELECT url_hash FROM intel_articles WHERE url_hash IN (${placeholders})`,
    )
      .bind(...slice.map((c) => c.urlHash))
      .all<{ url_hash: string }>();
    for (const r of rows.results) {
      existingHashes.add(r.url_hash);
    }
  }

  return {
    totalFetched: flat.length,
    freshItems: candidates.filter((c) => !existingHashes.has(c.urlHash)),
  };
}
