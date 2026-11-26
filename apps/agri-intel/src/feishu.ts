import { type Env, type IntelCategory, type IntelEdition, type SummarizedIntelItem } from "./types";

function categoryLabel(cat: IntelCategory): string {
  switch (cat) {
    case "industry_news":
      return "产业动态";
    case "tech_breakthrough":
      return "技术突破";
    case "research_paper":
      return "前沿论文";
    case "dataset_release":
      return "开源数据";
    case "policy_regulation":
      return "农科政策";
    default:
      return "行业资讯";
  }
}

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

/**
 * 通过企业自建应用机器人向飞书群推送每日农业 AI 情报卡片
 */
export async function sendIntelCardToFeishu(
  env: Env,
  edition: IntelEdition,
  bjtDateStr: string,
  items: SummarizedIntelItem[],
): Promise<{ ok: boolean; detail: string }> {
  const appId = env.FEISHU_APP_ID?.trim();
  const appSecret = env.FEISHU_APP_SECRET?.trim();
  const chatId = env.FEISHU_CHAT_ID_INTEL?.trim();

  if (!appId || !appSecret || !chatId) {
    return {
      ok: false,
      detail: "FEISHU_APP_ID, FEISHU_APP_SECRET or FEISHU_CHAT_ID_INTEL not configured",
    };
  }

  const title =
    edition === "industry"
      ? `🌾 全球农业 AI 产业早报 · ${bjtDateStr}`
      : edition === "academic"
        ? `🎓 全球农业 AI 学术晚报 · ${bjtDateStr}`
        : edition === "dataset"
          ? `📦 全球农业 AI 开源数据集 · ${bjtDateStr}`
          : `🏛️ 全球高科技农业政策 · ${bjtDateStr}`;

  const intro =
    edition === "industry"
      ? `今日精选 **${items.length}** 条全球农业科技与产业动态：`
      : edition === "academic"
        ? `今晚精选 **${items.length}** 篇全球农业 AI 科研论文与技术进展：`
        : edition === "dataset"
          ? `今日新收录 **${items.length}** 个全球农业与水产 AI 公开数据集：`
          : `今日精选 **${items.length}** 项全球智慧农业与水产科技政策：`;

  const headerTemplate =
    edition === "industry"
      ? "blue"
      : edition === "academic"
        ? "indigo"
        : edition === "dataset"
          ? "purple"
          : "orange";

  const elements: Array<Record<string, unknown>> = [
    {
      tag: "markdown",
      content: `${intro}（完整归档见 [intel.guoshu.dev](https://intel.guoshu.dev)）`,
    },
  ];

  items.forEach((item, idx) => {
    elements.push({ tag: "hr" });
    const metaBadges = [
      item.meta?.country,
      item.meta?.agency,
      item.meta?.policyType,
      item.meta?.platform,
      item.meta?.modality,
      item.meta?.task,
      item.meta?.format,
    ]
      .filter(Boolean)
      .join(" / ");
    const tagLine = item.tags.length > 0 ? `标签：${item.tags.join(" · ")}` : "";
    elements.push({
      tag: "markdown",
      content: [
        `**${idx + 1}. 【${categoryLabel(item.category)}】${item.titleZh}**`,
        item.summaryZh,
        metaBadges ? `规格：${metaBadges}` : "",
        tagLine,
        `来源：${item.sourceName} · 重要度 ${item.score}/5 · [查看详情](${item.url})`,
      ]
        .filter(Boolean)
        .join("\n"),
    });
  });

  const card = {
    config: { wide_screen_mode: true },
    header: {
      template: headerTemplate,
      title: { tag: "plain_text", content: title },
    },
    elements,
  };

  const token = await fetchFeishuTenantToken(appId, appSecret);
  const res = await fetch("https://open.feishu.cn/open-apis/im/v1/messages?receive_id_type=chat_id", {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      receive_id: chatId,
      msg_type: "interactive",
      content: JSON.stringify(card),
    }),
  });

  const text = await res.text();
  if (!res.ok) {
    return { ok: false, detail: `HTTP ${res.status}: ${text}` };
  }
  try {
    const parsed = JSON.parse(text) as { code?: number; msg?: string };
    if ((parsed.code ?? 0) !== 0) {
      return { ok: false, detail: `Feishu error ${parsed.code}: ${parsed.msg ?? text}` };
    }
  } catch {
    // 忽略非 JSON
  }

  return { ok: true, detail: "sent" };
}
