import { GoogleGenAI } from "@google/genai";
import {
  type Env,
  type IntelEdition,
  type RawIntelItem,
  type SourceFetchReport,
  normalizeIsoUtc,
  sha256Hex,
} from "./types";

interface RssSourceConfig {
  name: string;
  url: string;
}

interface SourceBatchResult {
  items: RawIntelItem[];
  report: SourceFetchReport;
}

// 全球垂直权威农业科技/设施温室媒体 RSS 源
const INDUSTRY_RSS_SOURCES: RssSourceConfig[] = [
  { name: "HortiDaily", url: "https://www.hortidaily.com/rss/" },
  { name: "AgFunderNews", url: "https://agfundernews.com/feed" },
  { name: "iGrowNews", url: "https://igrownews.com/feed/" },
  { name: "FutureFarming", url: "https://www.futurefarming.com/feed/" },
];

const ARXIV_QUERY =
  'all:(aquaponics OR hydroponics OR aquaculture OR greenhouse OR "precision agriculture" OR "smart agriculture" OR "plant phenotyping" OR "fish detection") AND ("artificial intelligence" OR "deep learning" OR "computer vision" OR YOLO OR "large language model" OR "digital twin" OR "neural network")';

const HF_DATASET_KEYWORDS = [
  "agriculture",
  "aquaculture",
  "plant disease",
  "fish",
  "crop",
  "greenhouse",
];

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

/** 将 OpenAlex 的倒排索引摘要还原为连续文本 */
function reconstructOpenAlexAbstract(index: Record<string, number[]> | null | undefined): string {
  if (!index || typeof index !== "object") return "";
  const pairs: Array<[number, string]> = [];
  for (const [word, positions] of Object.entries(index)) {
    if (!Array.isArray(positions)) continue;
    for (const pos of positions) {
      pairs.push([pos, word]);
    }
  }
  pairs.sort((a, b) => a[0] - b[0]);
  return pairs
    .map((p) => p[1])
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchRssOrAtom(
  source: RssSourceConfig,
  edition: IntelEdition,
): Promise<SourceBatchResult> {
  try {
    const res = await fetch(source.url, {
      headers: {
        "User-Agent": "GuoshuAgriIntelBot/1.0 (+https://news.guoshu.dev)",
        Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml",
      },
    });
    if (!res.ok) {
      return { items: [], report: { source: source.name, fetched: 0, error: `HTTP ${res.status}` } };
    }
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
    return { items, report: { source: source.name, fetched: items.length } };
  } catch (err) {
    return {
      items: [],
      report: {
        source: source.name,
        fetched: 0,
        error: err instanceof Error ? err.message : "fetch_error",
      },
    };
  }
}

async function fetchArxivPapers(): Promise<SourceBatchResult> {
  const qs = new URLSearchParams({
    search_query: ARXIV_QUERY,
    start: "0",
    max_results: "20",
    sortBy: "submittedDate",
    sortOrder: "descending",
  });
  return fetchRssOrAtom(
    { name: "arXiv", url: `https://export.arxiv.org/api/query?${qs.toString()}` },
    "academic",
  );
}

/**
 * 直连 OpenAlex 免费开放学术 API：弥补 arXiv 在农工与水产顶刊的盲区
 */
async function fetchOpenAlexPapers(): Promise<SourceBatchResult> {
  try {
    const fromDate = new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString().slice(0, 10);
    const qs = new URLSearchParams({
      search:
        "aquaponics OR hydroponics OR aquaculture OR greenhouse OR plant phenotyping OR fish detection",
      filter: `from_publication_date:${fromDate},type:article`,
      sort: "publication_date:desc",
      "per-page": "18",
      mailto: "intel@guoshu.dev",
    });
    const res = await fetch(`https://api.openalex.org/works?${qs.toString()}`, {
      headers: {
        "User-Agent": "GuoshuAgriIntelBot/1.0 (+https://news.guoshu.dev)",
        Accept: "application/json",
      },
    });
    if (!res.ok) {
      return { items: [], report: { source: "OpenAlex", fetched: 0, error: `HTTP ${res.status}` } };
    }
    const data = (await res.json()) as {
      results?: Array<{
        title?: string;
        doi?: string;
        id?: string;
        publication_date?: string;
        primary_location?: {
          landing_page_url?: string;
          source?: { display_name?: string };
        };
        abstract_inverted_index?: Record<string, number[]>;
      }>;
    };

    const items: RawIntelItem[] = [];
    for (const w of data.results ?? []) {
      const titleRaw = (w.title ?? "").trim();
      const rawUrl = w.primary_location?.landing_page_url || w.doi || w.id || "";
      const url = canonicalizeUrl(rawUrl);
      if (!titleRaw || !url.startsWith("http")) continue;
      const venue = w.primary_location?.source?.display_name?.trim();
      const abstract = reconstructOpenAlexAbstract(w.abstract_inverted_index);
      items.push({
        edition: "academic",
        sourceName: venue ? `OpenAlex · ${venue}` : "OpenAlex",
        titleRaw,
        excerptRaw: abstract.slice(0, 1200),
        url,
        publishedAtUtc: normalizeIsoUtc(w.publication_date),
        meta: {
          platform: "OpenAlex",
          venue,
        },
      });
    }
    return { items, report: { source: "OpenAlex", fetched: items.length } };
  } catch (err) {
    return {
      items: [],
      report: {
        source: "OpenAlex",
        fetched: 0,
        error: err instanceof Error ? err.message : "fetch_error",
      },
    };
  }
}

/**
 * 直连 Hugging Face Datasets Hub 公开 API（免鉴权），按农业/水产/温室关键词拉取最新公开数据集
 */
async function fetchHuggingFaceDatasets(): Promise<SourceBatchResult> {
  try {
    const batches = await Promise.all(
      HF_DATASET_KEYWORDS.map(async (kw) => {
        const qs = new URLSearchParams({
          search: kw,
          sort: "lastModified",
          direction: "-1",
          limit: "6",
        });
        const res = await fetch(`https://huggingface.co/api/datasets?${qs.toString()}`, {
          headers: {
            "User-Agent": "GuoshuAgriIntelBot/1.0 (+https://news.guoshu.dev)",
            Accept: "application/json",
          },
        });
        if (!res.ok) return [];
        return (await res.json()) as Array<{
          id?: string;
          lastModified?: string;
          createdAt?: string;
          description?: string;
          downloads?: number;
          tags?: string[];
          private?: boolean;
          gated?: boolean | string;
        }>;
      }),
    );

    const seen = new Set<string>();
    const items: RawIntelItem[] = [];
    for (const ds of batches.flat()) {
      if (!ds.id || ds.private || seen.has(ds.id)) continue;
      seen.add(ds.id);
      const url = canonicalizeUrl(`https://huggingface.co/datasets/${ds.id}`);
      const tags = (ds.tags ?? []).filter((t) => !t.startsWith("region:") && !t.startsWith("arxiv:")).slice(0, 8);
      const licenseTag = (ds.tags ?? []).find((t) => t.startsWith("license:"))?.replace("license:", "");
      const modalityTag = (ds.tags ?? []).find((t) => t.startsWith("modality:"))?.replace("modality:", "");
      const desc = (ds.description ?? "").trim();
      const excerpt = [
        desc,
        tags.length > 0 ? `Tags: ${tags.join(", ")}` : "",
        typeof ds.downloads === "number" ? `Downloads: ${ds.downloads}` : "",
      ]
        .filter(Boolean)
        .join(" | ");

      items.push({
        edition: "dataset",
        sourceName: "Hugging Face Datasets",
        titleRaw: ds.id,
        excerptRaw: excerpt.slice(0, 1200),
        url,
        publishedAtUtc: normalizeIsoUtc(ds.lastModified || ds.createdAt),
        meta: {
          platform: "HuggingFace",
          modality: modalityTag,
          license: licenseTag,
          downloads: ds.downloads,
        },
      });
    }
    return { items, report: { source: "HuggingFace", fetched: items.length } };
  } catch (err) {
    return {
      items: [],
      report: {
        source: "HuggingFace",
        fetched: 0,
        error: err instanceof Error ? err.message : "fetch_error",
      },
    };
  }
}

/**
 * 直连 Zenodo Open API（免鉴权），抓取带 DOI 的农业/水产/表型科研公开数据集
 */
async function fetchZenodoDatasets(): Promise<SourceBatchResult> {
  try {
    const qs = new URLSearchParams({
      q: '(agriculture OR aquaculture OR hydroponics OR aquaponics OR greenhouse OR "plant disease" OR "fish detection" OR crop) AND (dataset OR image OR YOLO OR segmentation OR sensor)',
      type: "dataset",
      sort: "mostrecent",
      size: "15",
    });
    const res = await fetch(`https://zenodo.org/api/records?${qs.toString()}`, {
      headers: {
        "User-Agent": "GuoshuAgriIntelBot/1.0 (+https://news.guoshu.dev)",
        Accept: "application/json",
      },
    });
    if (!res.ok) {
      return { items: [], report: { source: "Zenodo", fetched: 0, error: `HTTP ${res.status}` } };
    }
    const data = (await res.json()) as {
      hits?: {
        hits?: Array<{
          created?: string;
          doi_url?: string;
          links?: { self_html?: string };
          metadata?: {
            title?: string;
            description?: string;
            publication_date?: string;
            license?: { id?: string };
          };
        }>;
      };
    };

    const items: RawIntelItem[] = [];
    for (const hit of data.hits?.hits ?? []) {
      const titleRaw = (hit.metadata?.title ?? "").trim();
      const rawUrl = hit.links?.self_html || hit.doi_url || "";
      const url = canonicalizeUrl(rawUrl);
      if (!titleRaw || !url.startsWith("http")) continue;
      items.push({
        edition: "dataset",
        sourceName: "Zenodo",
        titleRaw,
        excerptRaw: stripHtml(hit.metadata?.description ?? "").slice(0, 1200),
        url,
        publishedAtUtc: normalizeIsoUtc(hit.created || hit.metadata?.publication_date),
        meta: {
          platform: "Zenodo",
          license: hit.metadata?.license?.id,
        },
      });
    }
    return { items, report: { source: "Zenodo", fetched: items.length } };
  } catch (err) {
    return {
      items: [],
      report: {
        source: "Zenodo",
        fetched: 0,
        error: err instanceof Error ? err.message : "fetch_error",
      },
    };
  }
}

/**
 * 使用 Gemini 3.5 Flash-Lite + Google Search Grounding 定向补搜
 * - 优先结合 groundingMetadata.groundingChunks 校验真实检索链接
 * - 不再静默吞掉异常，异常信息写入 SourceFetchReport 供 intel_runs 追溯
 */
async function searchViaGeminiGrounding(
  env: Env,
  edition: IntelEdition,
): Promise<SourceBatchResult> {
  const sourceLabel = `GeminiSearch(${edition})`;
  const apiKey = env.GOOGLE_AI_STUDIO_API_KEY?.trim();
  if (!apiKey) {
    return { items: [], report: { source: sourceLabel, fetched: 0, error: "missing_api_key" } };
  }

  try {
    const baseUrl = `https://gateway.ai.cloudflare.com/v1/${env.CLOUDFLARE_ACCOUNT_ID}/${env.AI_GATEWAY_NAME}/google-ai-studio`;
    const ai = new GoogleGenAI({ apiKey, httpOptions: { baseUrl } });
    const today = new Date().toISOString().slice(0, 10);

    const prompt =
      edition === "industry"
        ? `Today is ${today}. Use Google Search to find 5 recent (past 48 hours) global agriculture AI, smart greenhouse, aquaponics/aquaculture automation, or agri-robotics industry news articles. Return ONLY a JSON array of objects with fields: title, url, source, published_date (ISO or YYYY-MM-DD), summary.`
        : edition === "academic"
          ? `Today is ${today}. Use Google Search to find 5 recent (past 14 days) academic papers or technical breakthroughs in agricultural AI, plant phenotyping computer vision, fish biomass estimation, aquaculture AI, or smart greenhouse MPC/LLM control. Return ONLY a JSON array of objects with fields: title, url, source, published_date (ISO or YYYY-MM-DD), summary.`
          : `Today is ${today}. Use Google Search (especially site:kaggle.com/datasets OR site:universe.roboflow.com OR site:github.com OR site:zenodo.org) to find 5 recent open-source datasets for agriculture AI, plant disease/weed/crop vision, fish detection/aquaculture, or greenhouse sensor time-series. Return ONLY a JSON array of objects with fields: title, url, source, published_date (ISO or YYYY-MM-DD), summary, platform.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    // 提取 groundingMetadata 中的真实检索 URL 作为参考池
    const chunks =
      (
        response.candidates?.[0] as
          | {
              groundingMetadata?: {
                groundingChunks?: Array<{ web?: { uri?: string; title?: string } }>;
              };
            }
          | undefined
      )?.groundingMetadata?.groundingChunks ?? [];
    const groundedUris = chunks
      .map((c) => c.web?.uri?.trim())
      .filter((u): u is string => Boolean(u && u.startsWith("http")));

    const text = (response.text ?? "").trim();
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return {
        items: [],
        report: { source: sourceLabel, fetched: 0, error: "non_json_response" },
      };
    }

    const parsed = JSON.parse(jsonMatch[0]) as Array<{
      title?: string;
      url?: string;
      source?: string;
      published_date?: string;
      summary?: string;
      platform?: string;
    }>;
    if (!Array.isArray(parsed)) {
      return {
        items: [],
        report: { source: sourceLabel, fetched: 0, error: "invalid_array" },
      };
    }

    const results: RawIntelItem[] = [];
    parsed.forEach((row, idx) => {
      const titleRaw = String(row.title ?? "").trim();
      const rawUrl = String(row.url ?? "").trim();
      const fallbackUrl = groundedUris[idx] ?? "";
      const url = canonicalizeUrl(rawUrl.startsWith("http") ? rawUrl : fallbackUrl);
      if (!titleRaw || !url.startsWith("http")) return;

      const sourceName = String(row.source ?? "Google Search").trim() || "Google Search";
      results.push({
        edition,
        sourceName,
        titleRaw,
        excerptRaw: String(row.summary ?? "").trim().slice(0, 1000),
        url,
        publishedAtUtc: normalizeIsoUtc(row.published_date),
        meta: edition === "dataset" ? { platform: row.platform || sourceName } : undefined,
      });
    });

    return { items: results, report: { source: sourceLabel, fetched: results.length } };
  } catch (err) {
    return {
      items: [],
      report: {
        source: sourceLabel,
        fetched: 0,
        error: err instanceof Error ? err.message : "grounding_error",
      },
    };
  }
}

/**
 * 抓取指定版次（industry / academic / dataset）的新条目，完成时间窗口过滤、D1 去重与源健康汇总
 */
export async function collectFreshArticles(
  env: Env,
  edition: IntelEdition,
): Promise<{
  totalFetched: number;
  freshItems: Array<RawIntelItem & { urlHash: string }>;
  sourceReports: SourceFetchReport[];
}> {
  const batchResults: SourceBatchResult[] =
    edition === "industry"
      ? await Promise.all([
          ...INDUSTRY_RSS_SOURCES.map((s) => fetchRssOrAtom(s, "industry")),
          searchViaGeminiGrounding(env, "industry"),
        ])
      : edition === "academic"
        ? await Promise.all([
            fetchArxivPapers(),
            fetchOpenAlexPapers(),
            searchViaGeminiGrounding(env, "academic"),
          ])
        : await Promise.all([
            fetchHuggingFaceDatasets(),
            fetchZenodoDatasets(),
            searchViaGeminiGrounding(env, "dataset"),
          ]);

  const sourceReports = batchResults.map((b) => b.report);
  const flat = batchResults.flatMap((b) => b.items);
  const baseHours = Number(env.LOOKBACK_HOURS) || 48;
  // 学术论文放宽至 14 天，公开数据集放宽至 30 天，配合 D1 url_hash 永久去重
  const lookbackHours =
    edition === "dataset"
      ? Math.max(baseHours, 720)
      : edition === "academic"
        ? Math.max(baseHours, 336)
        : baseHours;
  const cutoffMs = Date.now() - lookbackHours * 3600 * 1000;

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
    return { totalFetched: flat.length, freshItems: [], sourceReports };
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
    sourceReports,
  };
}
