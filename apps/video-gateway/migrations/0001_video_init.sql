-- 0001_video_init.sql
-- 所有时间戳统一采用严格 ISO 8601 UTC (YYYY-MM-DDTHH:mm:ss.sssZ)

CREATE TABLE IF NOT EXISTS cameras (
  cam_id TEXT PRIMARY KEY,
  site_id TEXT NOT NULL,
  name TEXT NOT NULL,
  zone TEXT NOT NULL CHECK (zone IN ('gate', 'fish', 'hydro', 'equip', 'lab', 'pack')),
  visibility TEXT NOT NULL CHECK (visibility IN ('internal_ops', 'public_trace')),
  ip_address TEXT NOT NULL,
  rtsp_channel INTEGER NOT NULL DEFAULT 102,
  stream_mode TEXT NOT NULL DEFAULT 'snapshot'
    CHECK (stream_mode IN ('snapshot', 'on-demand', 'continuous-hls', 'disabled')),
  audio_enabled INTEGER NOT NULL DEFAULT 0,
  online_status TEXT NOT NULL DEFAULT 'unknown'
    CHECK (online_status IN ('online', 'offline', 'degraded', 'unknown')),
  last_seen_at TEXT,
  last_viewed_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_cameras_site_vis ON cameras (site_id, visibility);

CREATE TABLE IF NOT EXISTS snapshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  site_id TEXT NOT NULL,
  cam_id TEXT NOT NULL,
  r2_key TEXT NOT NULL UNIQUE,
  captured_at TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  width INTEGER NOT NULL DEFAULT 1280,
  height INTEGER NOT NULL DEFAULT 720,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_snapshots_query ON snapshots (site_id, cam_id, captured_at DESC);

CREATE TABLE IF NOT EXISTS hls_segments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  site_id TEXT NOT NULL,
  cam_id TEXT NOT NULL,
  r2_key TEXT NOT NULL UNIQUE,
  start_at TEXT NOT NULL,
  duration_sec REAL NOT NULL,
  size_bytes INTEGER NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_hls_query ON hls_segments (site_id, cam_id, start_at DESC);

CREATE TABLE IF NOT EXISTS video_events (
  event_id TEXT PRIMARY KEY,
  site_id TEXT NOT NULL,
  cam_id TEXT NOT NULL,
  source_type TEXT NOT NULL,
  trigger_at TEXT NOT NULL,
  start_at TEXT NOT NULL,
  end_at TEXT NOT NULL,
  r2_key TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'uploading', 'ready', 'failed')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_events_query ON video_events (site_id, cam_id, trigger_at DESC);

CREATE TABLE IF NOT EXISTS agent_commands (
  cmd_id TEXT PRIMARY KEY,
  site_id TEXT NOT NULL,
  cam_id TEXT NOT NULL,
  action TEXT NOT NULL
    CHECK (action IN ('wake_live', 'sleep_live', 'capture_now', 'clip_event', 'reload_config')),
  payload_json TEXT NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'acked', 'completed', 'expired', 'failed')),
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  acked_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_commands_poll ON agent_commands (site_id, status, expires_at);
