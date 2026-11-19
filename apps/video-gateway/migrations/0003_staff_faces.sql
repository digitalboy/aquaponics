-- 0003_staff_faces.sql
-- 员工人脸档案与特征向量表
-- 所有时间戳统一采用严格 ISO 8601 UTC (YYYY-MM-DDTHH:mm:ss.sssZ)

CREATE TABLE IF NOT EXISTS staff_faces (
  person_id TEXT PRIMARY KEY,
  site_id TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'staff',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_staff_faces_site_status ON staff_faces (site_id, status);

CREATE TABLE IF NOT EXISTS staff_face_samples (
  sample_id TEXT PRIMARY KEY,
  person_id TEXT NOT NULL,
  site_id TEXT NOT NULL,
  r2_key TEXT,
  embedding_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (person_id) REFERENCES staff_faces(person_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_staff_face_samples_person ON staff_face_samples (person_id);
