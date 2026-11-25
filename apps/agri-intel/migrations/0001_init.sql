-- 全球农业 AI 情报微服务初始表结构
-- 时间字段统一采用严格 ISO 8601 UTC 毫秒格式 (YYYY-MM-DDTHH:mm:ss.sssZ)

CREATE TABLE IF NOT EXISTS intel_articles (
  url_hash TEXT PRIMARY KEY,
  edition TEXT NOT NULL,              -- 'industry' | 'academic'
  source_name TEXT NOT NULL,
  category TEXT NOT NULL,             -- 'industry_news' | 'tech_breakthrough' | 'research_paper' | 'dataset_release' | 'irrelevant'
  title_raw TEXT NOT NULL,
  title_zh TEXT,
  summary_zh TEXT,
  url TEXT NOT NULL,
  published_at TEXT NOT NULL,
  decision_relevant INTEGER NOT NULL DEFAULT 0,
  decision_score REAL NOT NULL DEFAULT 0,
  decision_confidence REAL NOT NULL DEFAULT 0,
  sent_to_feishu_at TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_intel_articles_edition_created
  ON intel_articles (edition, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_intel_articles_sent
  ON intel_articles (sent_to_feishu_at);

CREATE TABLE IF NOT EXISTS intel_runs (
  run_key TEXT PRIMARY KEY,           -- 例如 'industry:2026-11-25' 或 'academic:2026-11-25'
  edition TEXT NOT NULL,
  fetched_count INTEGER NOT NULL DEFAULT 0,
  new_count INTEGER NOT NULL DEFAULT 0,
  selected_count INTEGER NOT NULL DEFAULT 0,
  sent_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL,               -- 'ok' | 'skipped' | 'error'
  detail TEXT,
  started_at TEXT NOT NULL,
  finished_at TEXT NOT NULL
);
