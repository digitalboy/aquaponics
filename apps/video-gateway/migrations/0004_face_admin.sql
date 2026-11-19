-- 0004_face_admin.sql
-- 扩展人脸样本提取状态、识别事件元数据，以及 agent_commands 的 extract_face 指令支持

ALTER TABLE staff_face_samples ADD COLUMN status TEXT NOT NULL DEFAULT 'ready';
ALTER TABLE staff_face_samples ADD COLUMN error_message TEXT;
ALTER TABLE video_events ADD COLUMN meta_json TEXT;

CREATE TABLE IF NOT EXISTS agent_commands_new (
  cmd_id TEXT PRIMARY KEY,
  site_id TEXT NOT NULL,
  cam_id TEXT NOT NULL,
  action TEXT NOT NULL
    CHECK (action IN ('wake_live', 'sleep_live', 'capture_now', 'clip_event', 'reload_config', 'extract_face')),
  payload_json TEXT NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'acked', 'completed', 'expired', 'failed')),
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  acked_at TEXT
);

INSERT INTO agent_commands_new
  (cmd_id, site_id, cam_id, action, payload_json, status, expires_at, created_at, acked_at)
SELECT cmd_id, site_id, cam_id, action, payload_json, status, expires_at, created_at, acked_at
FROM agent_commands;

DROP TABLE agent_commands;
ALTER TABLE agent_commands_new RENAME TO agent_commands;
CREATE INDEX IF NOT EXISTS idx_commands_poll ON agent_commands (site_id, status, expires_at);
