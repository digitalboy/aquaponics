-- 全球农业 + AI 情报中心 Phase 1 增量迁移
-- 新增中文主题标签 (tags_json) 与数据集/论文结构化元数据 (meta_json)，以及分类索引

ALTER TABLE intel_articles ADD COLUMN tags_json TEXT;
ALTER TABLE intel_articles ADD COLUMN meta_json TEXT;

CREATE INDEX IF NOT EXISTS idx_intel_articles_category_created
  ON intel_articles (category, created_at DESC);
