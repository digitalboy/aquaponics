-- 为 snapshots 表增加人员数量标记，支持白天每小时工人作业简报精选有人画面
ALTER TABLE snapshots ADD COLUMN person_count INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_snapshots_site_cam_person_time
ON snapshots(site_id, cam_id, person_count, captured_at);
