import { GoogleGenAI } from "@google/genai";
import {
  type Env,
  type IntelArticleMeta,
  type IntelCategory,
  type IntelEdition,
  type JudgedIntelItem,
  type RawIntelItem,
  type SummarizedIntelItem,
} from "./types";

function buildGatewayBaseUrl(env: Env): string {
  return `https://gateway.ai.cloudflare.com/v1/${env.CLOUDFLARE_ACCOUNT_ID}/${env.AI_GATEWAY_NAME}/google-ai-studio`;
}

function normalizeCategory(raw: unknown, edition: IntelEdition): IntelCategory {
  const s = String(raw ?? "").trim().toLowerCase();
  if (
    s === "industry_news" ||
    s === "tech_breakthrough" ||
    s === "research_paper" ||
    s === "dataset_release"
  ) {
    return s;
  }
  if (s === "irrelevant") return "irrelevant";
  if (edition === "dataset") return "dataset_release";
  return edition === "academic" ? "research_paper" : "industry_news";
}

/**
 * 调用 Google AI Studio Decisions API (gemini-decision-1) 进行 0-output-token 快速判定；
 * 若网关或端点暂不可用，自动降级为 gemini-3.5-flash-lite 结构化 JSON 判定。
 */
export async function judgeIntelArticle(
  env: Env,
  item: RawIntelItem & { urlHash: string },
): Promise<JudgedIntelItem> {
  const apiKey = env.GOOGLE_AI_STUDIO_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("GOOGLE_AI_STUDIO_API_KEY is not configured");
  }

  const docInput = [
    `Edition Target: ${item.edition}`,
    `Source: ${item.sourceName}`,
    `Published: ${item.publishedAtUtc}`,
    `Title: ${item.titleRaw}`,
    `Summary: ${item.excerptRaw || "(no excerpt)"}`,
  ].join("\n");

  const editionFocus =
    item.edition === "industry"
      ? "commercial controlled-environment agriculture, aquaponics, hydroponics, aquaculture automation, ag-robotics, AI farm deployment, or major agtech funding/products"
      : item.edition === "academic"
        ? "academic papers, computer vision (YOLO/segmentation/biomass estimation for fish or plants), greenhouse environmental MPC/RL/LLM control, or aquaculture/hydroponics AI research"
        : "open-source downloadable datasets (images, videos, sensor time-series, spectral/remote sensing) genuinely useful for agriculture AI, plant disease/phenotyping, fish/aquaculture vision, or greenhouse automation; exclude toy/empty repos or unrelated generic datasets";

  // 1) 优先尝试 Decisions API (gemini-decision-1)
  try {
    const decisionPayload = {
      model: "gemini-decision-1",
      input: docInput,
      questions: {
        is_relevant: {
          type: "noul",
          instructions: `Is this item genuinely focused on ${editionFocus}? Prioritize aquaponics, aquaculture, smart greenhouse, and agri-vision relevance. Exclude generic lifestyle food stories, unrelated crypto/finance, or empty/noise entries.`,
        },
        category: {
          type: "choice",
          options: [
            "industry_news",
            "tech_breakthrough",
            "research_paper",
            "dataset_release",
            "irrelevant",
          ],
          instructions: "Pick the single best category for this item.",
        },
        importance: {
          type: "score",
          scale: [1, 2, 3, 4, 5],
          instructions:
            "Rate its practical importance (1=trivial/noise, 3=useful update, 5=major breakthrough, high-value open agricultural/aquaculture dataset with clear annotations, or key industry shift).",
        },
      },
    };

    // 统一通过 Cloudflare AI Gateway 转发 v1beta Decisions 端点，避免边缘节点地区限制
    const res = await fetch(`${buildGatewayBaseUrl(env)}/v1beta/decisions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify(decisionPayload),
    });

    if (res.ok) {
      const data = (await res.json()) as {
        decisions?: {
          is_relevant?: { answer?: boolean | string; confidence?: number };
          category?: { answer?: string; confidence?: number };
          importance?: { answer?: number; expected_value?: number; confidence?: number };
        };
      };
      const d = data.decisions;
      if (d?.is_relevant !== undefined) {
        const relevant =
          d.is_relevant.answer === true || String(d.is_relevant.answer).toLowerCase() === "yes";
        const score = Number(d.importance?.expected_value ?? d.importance?.answer ?? 0);
        const confidence = Number(d.is_relevant.confidence ?? d.importance?.confidence ?? 0.8);
        return {
          ...item,
          relevant,
          category: normalizeCategory(d.category?.answer, item.edition),
          score: Number.isFinite(score) ? Math.round(score * 100) / 100 : 0,
          confidence: Number.isFinite(confidence) ? Math.round(confidence * 1000) / 1000 : 0.8,
        };
      }
    }
  } catch {
    // 降级到 gemini-3.5-flash-lite
  }

  // 2) 降级兜底：通过 AI Gateway 调用 gemini-3.5-flash-lite 输出紧凑 JSON
  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: { baseUrl: buildGatewayBaseUrl(env) },
  });
  const resp = await ai.models.generateContent({
    model: "gemini-3.5-flash-lite",
    contents: `Evaluate this item for ${editionFocus}.\nReturn ONLY JSON: {"relevant": boolean, "category": "industry_news"|"tech_breakthrough"|"research_paper"|"dataset_release"|"irrelevant", "score": 1..5, "confidence": 0..1}\n\n${docInput}`,
    config: {
      responseMimeType: "application/json",
      temperature: 0.1,
    },
  });

  const parsed = JSON.parse((resp.text ?? "{}").trim()) as {
    relevant?: boolean;
    category?: string;
    score?: number;
    confidence?: number;
  };
  return {
    ...item,
    relevant: Boolean(parsed.relevant),
    category: normalizeCategory(parsed.category, item.edition),
    score: Number.isFinite(Number(parsed.score)) ? Number(parsed.score) : 0,
    confidence: Number.isFinite(Number(parsed.confidence)) ? Number(parsed.confidence) : 0.7,
  };
}

/**
 * 仅对高分通过的条目调用 gemini-3.5-flash-lite：
 * 一次调用同步生成中文标题、4~5 句中文摘要、2~4 个领域标签，以及数据集结构化元数据。
 */
export async function summarizeIntelArticle(
  env: Env,
  item: JudgedIntelItem,
): Promise<SummarizedIntelItem> {
  const apiKey = env.GOOGLE_AI_STUDIO_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("GOOGLE_AI_STUDIO_API_KEY is not configured");
  }

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: { baseUrl: buildGatewayBaseUrl(env) },
  });

  const isDataset = item.edition === "dataset" || item.category === "dataset_release";
  const schemaHint = isDataset
    ? `{"titleZh": "...", "summaryZh": "...", "tags": ["标签1", "标签2"], "datasetMeta": {"modality": "图像/视频/时序/多光谱/文本", "task": "目标检测/语义分割/分类/生物量估计/环控预测", "format": "YOLO/COCO/CSV/Parquet等(未知留空)"}}`
    : `{"titleZh": "...", "summaryZh": "...", "tags": ["标签1", "标签2"]}`;

  const prompt = [
    `你是一位服务于现代化鱼菜共生与设施农业研发团队的资深情报编辑。`,
    `请将下面这篇资料翻译并提炼为中文简报，严格返回 JSON：${schemaHint}。`,
    `要求：`,
    `1. titleZh：准确、简洁的中文标题（不超过 36 个汉字）。`,
    `2. summaryZh：严格控制在 4 到 5 句话之间（约 140~220 字），涵盖：核心内容/方法或数据集构成、关键指标或标注特点、以及对智慧温室/水产养殖/农业 AI 研发的参考价值。`,
    `3. tags：给出 2 到 4 个简洁中文领域标签，优先从以下规范标签中选用（也可补充精准词）：水产养殖、温室环控、植物表型、病虫害识别、农业机器人、视觉检测、大模型决策、开源数据集。`,
    `4. 严禁编造原文未提供的数字或结论。`,
    ``,
    `版块：${item.edition}`,
    `来源：${item.sourceName}`,
    `类别：${item.category}`,
    `原标题：${item.titleRaw}`,
    `原文摘要：${item.excerptRaw || "(无摘要，请仅基于标题谨慎概括，不脑补细节)"}`,
  ].join("\n");

  const resp = await ai.models.generateContent({
    model: "gemini-3.5-flash-lite",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      temperature: 0.2,
    },
  });

  const parsed = JSON.parse((resp.text ?? "{}").trim()) as {
    titleZh?: string;
    summaryZh?: string;
    tags?: unknown;
    datasetMeta?: {
      modality?: string;
      task?: string;
      format?: string;
    };
  };

  const tags = Array.isArray(parsed.tags)
    ? parsed.tags
        .map((t) => String(t ?? "").trim())
        .filter((t) => t.length > 0 && t.length <= 16)
        .slice(0, 4)
    : [];

  const mergedMeta: IntelArticleMeta | undefined =
    item.meta || parsed.datasetMeta
      ? {
          ...item.meta,
          ...(parsed.datasetMeta?.modality ? { modality: parsed.datasetMeta.modality.trim() } : {}),
          ...(parsed.datasetMeta?.task ? { task: parsed.datasetMeta.task.trim() } : {}),
          ...(parsed.datasetMeta?.format ? { format: parsed.datasetMeta.format.trim() } : {}),
        }
      : undefined;

  return {
    ...item,
    titleZh: (parsed.titleZh || item.titleRaw).trim(),
    summaryZh: (parsed.summaryZh || item.excerptRaw || item.titleRaw).trim(),
    tags,
    meta: mergedMeta,
  };
}
