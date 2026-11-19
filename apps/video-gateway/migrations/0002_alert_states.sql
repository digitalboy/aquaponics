-- 0002_alert_states.sql
-- 异常告警防抖与状态追踪表
-- 所有时间戳统一采用严格 ISO 8601 UTC (YYYY-MM-DDTHH:mm:ss.sssZ)

CREATE TABLE IF NOT EXISTS alert_states (
  alert_key TEXT PRIMARY KEY,
  site_id TEXT NOT NULL,
  cam_id TEXT,
  alert_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ok' CHECK (status IN ('ok', 'firing')),
  last_triggered_at TEXT,
  last_notified_at TEXT,
  last_resolved_at TEXT,
  last_message TEXT,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_alert_states_site ON alert_states (site_id, status);
