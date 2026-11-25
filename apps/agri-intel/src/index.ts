import { judgeIntelArticle, summarizeIntelArticle } from "./ai";
import { sendIntelCardToFeishu } from "./feishu";
import { collectFreshArticles } from "./sources";
import {
  type Env,
  type IntelEdition,
  type JudgedIntelItem,
  type SummarizedIntelItem,
  jsonResponse,
  nowIsoUtc,
} from "./types";

const BJT_OFFSET_MS = 8 * 3600 * 1000;

function getBeijingTimeParts(utcMs: number): { dateStr: string; hour: number; minute: number } {
  const bjt = new Date(utcMs + BJT_OFFSET_MS);
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    dateStr: `${bjt.getUTCFullYear()}-${pad(bjt.getUTCMonth() + 1)}-${pad(bjt.getUTCDate())}`,
    hour: bjt.getUTCHours(),
    minute: bjt.getUTCMinutes(),
  };
}

function isAuthorizedInternal(request: Request, env: Env): boolean {
  const expected = env.INTERNAL_API_KEY?.trim();
  if (!expected) return false;
  const auth = request.headers.get("Authorization") ?? "";
  return auth === `Bearer ${expected}`;
}

export async function runIntelPipeline(
  env: Env,
  edition: IntelEdition,
  force = false,
): Promise<Record<string, unknown>> {
  const startedAt = nowIsoUtc();
  const { dateStr } = getBeijingTimeParts(Date.parse(startedAt));
  const runKey = `${edition}:${dateStr}`;

  if (!force) {
    const existingRun = await env.INTEL_DB.prepare(
      `SELECT run_key, status FROM intel_runs WHERE run_key = ?1`,
    )
      .bind(runKey)
      .first<{ run_key: string; status: string }>();
    if (existingRun && existingRun.status === "ok") {
      return { ok: true, skipped: true, reason: `already completed ${runKey}` };
    }
  }

  const { totalFetched, freshItems } = await collectFreshArticles(env, edition);
  const minScore = Number(env.DECISION_MIN_SCORE) || 3.5;
  const maxItems = Math.min(Math.max(Number(env.MAX_DAILY_ITEMS) || 5, 1), 5);

  // Stage 2: 判定 AI（Decisions API），限制单轮最多评估 30 篇新文章控制延迟
  const toJudge = freshItems.slice(0, 30);
  const judged: JudgedIntelItem[] = [];
  const BATCH = 6;
  for (let i = 0; i < toJudge.length; i += BATCH) {
    const slice = toJudge.slice(i, i + BATCH);
    const res = await Promise.all(slice.map((item) => judgeIntelArticle(env, item)));
    judged.push(...res);
  }

  // 选出高分相关文章（按重要度降序取前 4~5 条）
  const passed = judged
    .filter((j) => j.relevant && j.category !== "irrelevant" && j.score >= minScore)
    .sort((a, b) => b.score - a.score || b.confidence - a.confidence)
    .slice(0, maxItems);
  const passedHashes = new Set(passed.map((p) => p.urlHash));

  // Stage 3: 仅对入选文章调用 gemini-3.5-flash-lite 翻译与 4~5 句摘要
  const summarized: SummarizedIntelItem[] = [];
  for (const item of passed) {
    summarized.push(await summarizeIntelArticle(env, item));
  }
  const summaryMap = new Map(summarized.map((s) => [s.urlHash, s]));

  // 推送飞书卡片（若当天无达标文章则静默跳过，避免水帖）
  let feishuResult: { ok: boolean; detail: string } = { ok: true, detail: "no_qualified_articles" };
  let sentAt: string | null = null;
  if (summarized.length > 0) {
    feishuResult = await sendIntelCardToFeishu(env, edition, dateStr, summarized);
    if (feishuResult.ok) {
      sentAt = nowIsoUtc();
    }
  }

  // 所有判定过的文章均写入 D1（用于永久去重），入选的附带中文摘要与推送时间
  const createdAt = nowIsoUtc();
  for (const j of judged) {
    const sum = summaryMap.get(j.urlHash);
    await env.INTEL_DB.prepare(
      `INSERT OR IGNORE INTO intel_articles (
        url_hash, edition, source_name, category, title_raw, title_zh, summary_zh,
        url, published_at, decision_relevant, decision_score, decision_confidence,
        sent_to_feishu_at, created_at
      ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14)`,
    )
      .bind(
        j.urlHash,
        j.edition,
        j.sourceName,
        j.category,
        j.titleRaw,
        sum?.titleZh ?? null,
        sum?.summaryZh ?? null,
        j.url,
        j.publishedAtUtc,
        j.relevant ? 1 : 0,
        j.score,
        j.confidence,
        passedHashes.has(j.urlHash) ? sentAt : null,
        createdAt,
      )
      .run();
  }

  const finishedAt = nowIsoUtc();
  const status = feishuResult.ok ? "ok" : "error";
  if (!force) {
    await env.INTEL_DB.prepare(
      `INSERT OR REPLACE INTO intel_runs (
        run_key, edition, fetched_count, new_count, selected_count, sent_count, status, detail, started_at, finished_at
      ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)`,
    )
      .bind(
        runKey,
        edition,
        totalFetched,
        judged.length,
        summarized.length,
        sentAt ? summarized.length : 0,
        status,
        feishuResult.detail,
        startedAt,
        finishedAt,
      )
      .run();
  }

  return {
    ok: feishuResult.ok,
    edition,
    runKey,
    totalFetched,
    freshEvaluated: judged.length,
    selectedCount: summarized.length,
    feishu: feishuResult,
    articles: summarized.map((s) => ({
      titleZh: s.titleZh,
      category: s.category,
      score: s.score,
      sourceName: s.sourceName,
      url: s.url,
    })),
  };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/health") {
      return jsonResponse({ ok: true, service: "aquaponics-agri-intel", time: nowIsoUtc() });
    }

    if (url.pathname === "/api/internal/run" && request.method === "POST") {
      if (!isAuthorizedInternal(request, env)) {
        return jsonResponse({ error: "Unauthorized" }, 401);
      }
      const rawEd = (url.searchParams.get("edition") ?? "industry").trim();
      const edition: IntelEdition = rawEd === "academic" ? "academic" : "industry";
      const result = await runIntelPipeline(env, edition, true);
      return jsonResponse(result, result.ok ? 200 : 500);
    }

    if (url.pathname === "/api/internal/articles" && request.method === "GET") {
      if (!isAuthorizedInternal(request, env)) {
        return jsonResponse({ error: "Unauthorized" }, 401);
      }
      const limit = Math.min(Math.max(Number(url.searchParams.get("limit") ?? "20"), 1), 100);
      const rows = await env.INTEL_DB.prepare(
        `SELECT edition, source_name, category, title_raw, title_zh, decision_relevant, decision_score, url, published_at, sent_to_feishu_at
         FROM intel_articles ORDER BY created_at DESC LIMIT ?1`,
      )
        .bind(limit)
        .all();
      return jsonResponse({ ok: true, count: rows.results.length, articles: rows.results });
    }

    return jsonResponse({ error: "Not Found" }, 404);
  },

  async scheduled(_event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    const { hour, minute } = getBeijingTimeParts(Date.now());
    const tasks: Array<Promise<unknown>> = [];

    // 早上 08:00 全球产业报道
    if (hour === 8 && minute < 20) {
      tasks.push(runIntelPipeline(env, "industry", false));
    }
    // 晚上 20:00 全球学术报道
    if (hour === 20 && minute < 20) {
      tasks.push(runIntelPipeline(env, "academic", false));
    }

    if (tasks.length > 0) {
      ctx.waitUntil(Promise.all(tasks));
    }
  },
};
