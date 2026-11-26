import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Input,
  Separator,
  Tabs,
  TabsList,
  TabsTrigger,
} from "@aquaponics/ui";
import {
  BookOpen,
  CalendarClock,
  Database,
  ExternalLink,
  Factory,
  Newspaper,
  RefreshCw,
  Search,
  Sparkles,
  Star,
  Tag,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { type DailyIntelSummaryItem, IntelCalendar } from "./components/IntelCalendar";

interface IntelArticleMeta {
  platform?: string;
  modality?: string;
  task?: string;
  format?: string;
  license?: string;
  venue?: string;
  downloads?: number;
}

interface IntelArticleItem {
  url_hash: string;
  edition: "industry" | "academic" | "dataset";
  source_name: string;
  category: "industry_news" | "tech_breakthrough" | "research_paper" | "dataset_release" | "irrelevant";
  title_raw: string;
  title_zh: string | null;
  summary_zh: string | null;
  url: string;
  published_at: string;
  decision_relevant: number;
  decision_score: number;
  decision_confidence: number;
  sent_to_feishu_at: string | null;
  created_at: string;
  tags_json?: string | null;
  meta_json?: string | null;
}

interface IntelRunItem {
  run_key: string;
  edition: "industry" | "academic" | "dataset";
  fetched_count: number;
  new_count: number;
  selected_count: number;
  sent_count: number;
  status: string;
  detail: string | null;
  started_at: string;
  finished_at: string;
}

const CATEGORY_LABEL: Record<IntelArticleItem["category"], string> = {
  industry_news: "行业新闻",
  tech_breakthrough: "技术突破",
  research_paper: "学术论文",
  dataset_release: "开源数据集",
  irrelevant: "未入选",
};

const QUICK_TAGS = [
  "水产",
  "温室",
  "植物",
  "病虫害",
  "机器人",
  "视觉",
  "大模型",
];

function safeParseTags(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function safeParseMeta(raw: string | null | undefined): IntelArticleMeta | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as IntelArticleMeta) : null;
  } catch {
    return null;
  }
}

function getCurrentBjtMonth(): string {
  const bjt = new Date(Date.now() + 8 * 3600 * 1000);
  return bjt.toISOString().slice(0, 7);
}

function formatBjtTime(isoUtc: string | null): string {
  if (!isoUtc) return "未推送";
  const d = new Date(isoUtc);
  if (Number.isNaN(d.getTime())) return isoUtc;
  return d.toLocaleString("zh-CN", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function editionBadgeMeta(edition: IntelArticleItem["edition"], category?: IntelArticleItem["category"]) {
  if (edition === "dataset" || category === "dataset_release") {
    return {
      label: "开源数据集",
      shortLabel: "数据",
      className: "border-violet-500/30 bg-violet-500/15 text-violet-300",
    };
  }
  if (edition === "academic") {
    return {
      label: "学术前沿",
      shortLabel: "学术",
      className: "border-sky-500/30 bg-sky-500/15 text-sky-300",
    };
  }
  return {
    label: "产业动态",
    shortLabel: "产业",
    className: "",
  };
}

export function App() {
  const [calendarMonth, setCalendarMonth] = useState<string>(getCurrentBjtMonth);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [edition, setEdition] = useState<"all" | "industry" | "academic" | "dataset">("all");
  const [activeTag, setActiveTag] = useState<string>("");
  const [onlySelected, setOnlySelected] = useState<boolean>(true);
  const [searchInput, setSearchInput] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [dailySummary, setDailySummary] = useState<Record<string, DailyIntelSummaryItem>>({});
  const [articles, setArticles] = useState<IntelArticleItem[]>([]);
  const [runs, setRuns] = useState<IntelRunItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [detailArticle, setDetailArticle] = useState<IntelArticleItem | null>(null);

  // 搜索框防抖
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearchQuery(searchInput.trim());
    }, 260);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const fetchSummaryAndRuns = useCallback(async () => {
    try {
      const [sumRes, runRes] = await Promise.all([
        fetch(
          `/api/public/summary?month=${encodeURIComponent(calendarMonth)}&onlySelected=${onlySelected ? "1" : "0"}`,
        ),
        fetch("/api/public/runs?limit=8"),
      ]);
      if (sumRes.ok) {
        const sumData = (await sumRes.json()) as {
          ok?: boolean;
          days?: Record<string, DailyIntelSummaryItem>;
        };
        if (sumData.ok && sumData.days) {
          setDailySummary(sumData.days);
        }
      }
      if (runRes.ok) {
        const runData = (await runRes.json()) as { ok?: boolean; runs?: IntelRunItem[] };
        if (runData.ok && runData.runs) {
          setRuns(runData.runs);
        }
      }
    } catch {
      // 汇总失败由列表请求统一提示
    }
  }, [calendarMonth, onlySelected]);

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const params = new URLSearchParams({
        month: calendarMonth,
        edition,
        onlySelected: onlySelected ? "1" : "0",
        limit: "80",
      });
      if (selectedDate) params.set("date", selectedDate);
      if (activeTag) params.set("tag", activeTag);
      if (searchQuery) params.set("q", searchQuery);

      const res = await fetch(`/api/public/articles?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`请求失败 (${res.status})`);
      }
      const data = (await res.json()) as {
        ok?: boolean;
        articles?: IntelArticleItem[];
        error?: string;
      };
      if (!data.ok) {
        throw new Error(data.error || "加载情报失败");
      }
      setArticles(data.articles ?? []);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "加载情报失败");
    } finally {
      setLoading(false);
    }
  }, [calendarMonth, selectedDate, edition, activeTag, onlySelected, searchQuery]);

  useEffect(() => {
    void fetchSummaryAndRuns();
  }, [fetchSummaryAndRuns]);

  useEffect(() => {
    void fetchArticles();
  }, [fetchArticles]);

  const monthTotalCount = useMemo(
    () => Object.values(dailySummary).reduce((acc, item) => acc + item.total, 0),
    [dailySummary],
  );

  const handleRefresh = () => {
    void fetchSummaryAndRuns();
    void fetchArticles();
  };

  const detailMeta = detailArticle ? safeParseMeta(detailArticle.meta_json) : null;
  const detailTags = detailArticle ? safeParseTags(detailArticle.tags_json) : [];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/80 px-4 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-primary/30 bg-primary/10">
              <Newspaper className="size-5 text-primary" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-lg font-bold tracking-tight sm:text-xl">国数AI农业 · 全球情报中心</h1>
                <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[13px] font-medium text-primary">
                  news.guoshu.dev
                </span>
              </div>
              <p className="mt-0.5 text-sm text-muted-foreground">
                早 08:00 产业动态 · 午 12:30 开源数据集 · 晚 20:00 学术前沿 · AI 筛选与中文摘要归档
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="hidden items-center gap-2 rounded-full border border-border bg-background/80 px-3.5 py-1.5 text-sm text-muted-foreground sm:inline-flex">
              <span className="size-2 rounded-full bg-primary" />
              <span>本月已归档 {monthTotalCount} 篇</span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 px-3.5 text-sm"
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw className={loading ? "animate-spin" : ""} />
              刷新
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-4 sm:p-6">
        <div className="grid gap-6 lg:grid-cols-[380px_1fr] lg:items-start">
          {/* 左侧：月历 + 最近调度状态 */}
          <aside className="flex flex-col gap-5">
            <IntelCalendar
              month={calendarMonth}
              selectedDate={selectedDate}
              dailySummary={dailySummary}
              onMonthChange={(nextMonth) => {
                setCalendarMonth(nextMonth);
                setSelectedDate(null);
              }}
              onSelectDate={(date) => setSelectedDate(date)}
            />

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                  <CalendarClock className="size-4 text-primary" />
                  近期采集任务
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2.5 pt-0">
                {runs.length === 0 ? (
                  <p className="text-sm text-muted-foreground">暂无采集运行记录</p>
                ) : (
                  runs.slice(0, 6).map((run) => {
                    const ed = editionBadgeMeta(run.edition);
                    return (
                      <div
                        key={run.run_key}
                        className="flex items-center justify-between gap-2 rounded-lg border border-border/70 bg-background/60 px-3 py-2.5 text-[13px]"
                      >
                        <div className="flex min-w-0 items-center gap-2">
                          <Badge
                            variant={run.edition === "industry" ? "default" : "secondary"}
                            className={`shrink-0 px-2 py-0.5 text-xs ${ed.className}`}
                          >
                            {ed.shortLabel}
                          </Badge>
                          <span className="truncate font-mono text-[13px] text-foreground">
                            {run.run_key.split(":")[1] ?? run.run_key}
                          </span>
                        </div>
                        <div className="flex shrink-0 items-center gap-2.5 text-[13px] text-muted-foreground">
                          <span>入选 {run.selected_count}</span>
                          <span
                            className={
                              run.status === "ok"
                                ? "font-medium text-primary"
                                : run.status === "error"
                                  ? "font-medium text-destructive"
                                  : "text-muted-foreground"
                            }
                          >
                            {run.status === "ok" ? "成功" : run.status === "error" ? "异常" : run.status}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </aside>

          {/* 右侧：筛选栏 + 标签条 + 情报列表 */}
          <section className="flex min-w-0 flex-col gap-4">
            <Card>
              <CardContent className="flex flex-col gap-3 px-4 py-3.5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <Tabs
                    value={edition}
                    onValueChange={(v) =>
                      setEdition(v as "all" | "industry" | "academic" | "dataset")
                    }
                  >
                    <TabsList className="h-10 p-1">
                      <TabsTrigger value="all" className="px-3 text-sm">
                        全部
                      </TabsTrigger>
                      <TabsTrigger value="industry" className="px-3 text-sm">
                        <Factory className="size-4" />
                        产业动态
                      </TabsTrigger>
                      <TabsTrigger value="academic" className="px-3 text-sm">
                        <BookOpen className="size-4" />
                        学术前沿
                      </TabsTrigger>
                      <TabsTrigger value="dataset" className="px-3 text-sm">
                        <Database className="size-4" />
                        开源数据集
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>

                  <div className="flex flex-1 flex-wrap items-center justify-end gap-2.5">
                    <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
                      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="搜索标题、摘要、标签或来源..."
                        className="h-10 pl-9 text-sm"
                      />
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      className="h-10 px-3.5 text-sm"
                      variant={onlySelected ? "default" : "outline"}
                      onClick={() => setOnlySelected((prev) => !prev)}
                    >
                      <Sparkles className="size-4" />
                      {onlySelected ? "仅看 AI 精选" : "含未入选"}
                    </Button>
                  </div>
                </div>

                {/* 主题领域快捷筛选 */}
                <div className="flex flex-wrap items-center gap-2 border-t border-border/50 pt-3">
                  <span className="inline-flex items-center gap-1 text-[13px] text-muted-foreground">
                    <Tag className="size-3.5" />
                    领域：
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveTag("")}
                    className={`cursor-pointer rounded-full border px-3 py-1 text-[13px] transition ${
                      activeTag === ""
                        ? "border-primary bg-primary/15 font-medium text-primary"
                        : "border-border bg-background/60 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                    }`}
                  >
                    全部领域
                  </button>
                  {QUICK_TAGS.map((tag) => {
                    const active = activeTag === tag;
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setActiveTag(active ? "" : tag)}
                        className={`cursor-pointer rounded-full border px-3 py-1 text-[13px] transition ${
                          active
                            ? "border-primary bg-primary/15 font-medium text-primary"
                            : "border-border bg-background/60 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span className="font-medium text-foreground/90">
                {selectedDate
                  ? `${selectedDate} 情报列表（共 ${articles.length} 篇）`
                  : `${calendarMonth} 月份情报（共 ${articles.length} 篇）`}
                {activeTag ? ` · 领域：${activeTag}` : ""}
              </span>
              {(selectedDate || activeTag) && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-sm"
                  onClick={() => {
                    setSelectedDate(null);
                    setActiveTag("");
                  }}
                >
                  清除筛选
                </Button>
              )}
            </div>

            {errorMsg && (
              <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {errorMsg}
              </div>
            )}

            <div className="flex flex-col gap-4">
              {loading && articles.length === 0 ? (
                <Card>
                  <CardContent className="p-10 text-center text-[15px] text-muted-foreground">
                    正在加载情报数据...
                  </CardContent>
                </Card>
              ) : articles.length === 0 ? (
                <Card>
                  <CardContent className="p-10 text-center text-[15px] text-muted-foreground">
                    {selectedDate
                      ? `${selectedDate} 暂无符合条件的情报记录`
                      : `${calendarMonth} 暂无符合条件的情报记录`}
                  </CardContent>
                </Card>
              ) : (
                articles.map((item) => {
                  const ed = editionBadgeMeta(item.edition, item.category);
                  const tags = safeParseTags(item.tags_json);
                  const meta = safeParseMeta(item.meta_json);
                  const isDataset =
                    item.edition === "dataset" || item.category === "dataset_release";
                  const specChips = [
                    meta?.platform,
                    meta?.modality,
                    meta?.task,
                    meta?.format,
                    meta?.license,
                  ].filter(Boolean) as string[];

                  return (
                    <Card
                      key={item.url_hash}
                      className="transition hover:border-primary/50 hover:bg-card/95"
                    >
                      <CardContent className="p-5">
                        <article className="flex min-w-0 flex-col gap-3">
                          <header className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge
                                variant={
                                  item.edition === "industry" && !isDataset
                                    ? "default"
                                    : "secondary"
                                }
                                className={`px-2.5 py-0.5 text-xs font-medium ${ed.className}`}
                              >
                                {ed.label}
                              </Badge>
                              {!isDataset && (
                                <Badge variant="outline" className="px-2.5 py-0.5 text-xs">
                                  {CATEGORY_LABEL[item.category] ?? item.category}
                                </Badge>
                              )}
                              <span className="text-[13px] font-medium text-muted-foreground">
                                {item.source_name}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
                              <span className="inline-flex items-center gap-1 font-semibold text-amber-400">
                                <Star className="size-3.5 fill-amber-400" />
                                {item.decision_score.toFixed(1)}
                              </span>
                              <span>·</span>
                              <time dateTime={item.created_at}>
                                {formatBjtTime(item.created_at)}
                              </time>
                            </div>
                          </header>

                          <div className="min-w-0">
                            <h2 className="text-base font-semibold leading-snug text-foreground sm:text-lg">
                              {item.title_zh || item.title_raw}
                            </h2>
                            {item.title_zh && (
                              <p
                                className="mt-1 truncate text-[13px] text-muted-foreground"
                                title={item.title_raw}
                              >
                                {item.title_raw}
                              </p>
                            )}
                          </div>

                          {isDataset && specChips.length > 0 && (
                            <div className="flex flex-wrap items-center gap-2 rounded-lg border border-violet-500/20 bg-violet-500/5 px-3 py-2 text-[13px] text-violet-200">
                              <Database className="size-3.5 shrink-0 text-violet-400" />
                              {specChips.map((chip, idx) => (
                                <span key={`${chip}-${idx}`} className="inline-flex items-center gap-2">
                                  {idx > 0 && <span className="text-violet-400/40">·</span>}
                                  <span>{chip}</span>
                                </span>
                              ))}
                            </div>
                          )}

                          {item.summary_zh ? (
                            <p className="text-[15px] leading-7 text-foreground/90">
                              {item.summary_zh}
                            </p>
                          ) : (
                            <p className="text-sm italic text-muted-foreground">
                              该条目未进入当日精选推送，未生成中文摘要。
                            </p>
                          )}

                          {tags.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1.5">
                              {tags.map((t) => (
                                <button
                                  key={t}
                                  type="button"
                                  onClick={() => setActiveTag(activeTag === t ? "" : t)}
                                  className="cursor-pointer rounded-md border border-border/80 bg-background/60 px-2 py-0.5 text-xs text-muted-foreground transition hover:border-primary/50 hover:text-primary"
                                >
                                  #{t}
                                </button>
                              ))}
                            </div>
                          )}

                          <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-border/50 pt-3">
                            <div className="text-[13px] text-muted-foreground">
                              {item.sent_to_feishu_at
                                ? `已推送飞书：${formatBjtTime(item.sent_to_feishu_at)}`
                                : "仅本地归档"}
                            </div>

                            <div className="flex items-center gap-2.5">
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                className="h-8 px-3 text-[13px]"
                                onClick={() => setDetailArticle(item)}
                              >
                                详情
                              </Button>
                              <a
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-background px-3 text-[13px] font-medium text-foreground transition hover:border-primary/60 hover:text-primary"
                              >
                                {isDataset ? "直达数据集" : "阅读原文"}
                                <ExternalLink className="size-3.5" />
                              </a>
                            </div>
                          </footer>
                        </article>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </section>
        </div>
      </main>

      <Dialog open={Boolean(detailArticle)} onOpenChange={(open) => !open && setDetailArticle(null)}>
        <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-xl">
          {detailArticle && (
            <>
              <DialogHeader>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant={detailArticle.edition === "industry" ? "default" : "secondary"}
                    className={`px-2.5 py-0.5 text-xs ${
                      editionBadgeMeta(detailArticle.edition, detailArticle.category).className
                    }`}
                  >
                    {editionBadgeMeta(detailArticle.edition, detailArticle.category).label}
                  </Badge>
                  <Badge variant="outline" className="px-2.5 py-0.5 text-xs">
                    {CATEGORY_LABEL[detailArticle.category] ?? detailArticle.category}
                  </Badge>
                  <span className="text-[13px] text-muted-foreground">
                    {detailArticle.source_name}
                  </span>
                </div>
                <DialogTitle className="pt-2 text-lg leading-snug">
                  {detailArticle.title_zh || detailArticle.title_raw}
                </DialogTitle>
                <DialogDescription className="text-[13px] break-words">
                  {detailArticle.title_raw}
                </DialogDescription>
              </DialogHeader>

              <Separator />

              <div className="flex flex-col gap-4 text-[15px]">
                {detailArticle.summary_zh ? (
                  <p className="leading-7 text-foreground/90">{detailArticle.summary_zh}</p>
                ) : (
                  <p className="text-sm italic text-muted-foreground">暂无中文摘要</p>
                )}

                {detailTags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    {detailTags.map((t) => (
                      <Badge key={t} variant="outline" className="px-2.5 py-0.5 text-xs">
                        #{t}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-1 gap-2.5 rounded-lg border border-border bg-background/60 p-3.5 text-[13px] sm:grid-cols-2">
                  <div>
                    <span className="text-muted-foreground">AI 重要度评分：</span>
                    <span className="font-semibold text-amber-400">
                      {detailArticle.decision_score.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">判定置信度：</span>
                    <span className="font-semibold">
                      {Math.round(detailArticle.decision_confidence * 100)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">原文发布时间：</span>
                    <span>{formatBjtTime(detailArticle.published_at)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">系统入库时间：</span>
                    <span>{formatBjtTime(detailArticle.created_at)}</span>
                  </div>
                  {detailMeta?.platform && (
                    <div>
                      <span className="text-muted-foreground">发布平台：</span>
                      <span>{detailMeta.platform}</span>
                    </div>
                  )}
                  {detailMeta?.modality && (
                    <div>
                      <span className="text-muted-foreground">数据模态：</span>
                      <span>{detailMeta.modality}</span>
                    </div>
                  )}
                  {detailMeta?.task && (
                    <div>
                      <span className="text-muted-foreground">适用任务：</span>
                      <span>{detailMeta.task}</span>
                    </div>
                  )}
                  {detailMeta?.format && (
                    <div>
                      <span className="text-muted-foreground">数据格式：</span>
                      <span>{detailMeta.format}</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-end">
                  <a
                    href={detailArticle.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
                  >
                    {detailArticle.edition === "dataset" ||
                    detailArticle.category === "dataset_release"
                      ? "前往开源数据集"
                      : "前往原文链接"}
                    <ExternalLink className="size-4" />
                  </a>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
