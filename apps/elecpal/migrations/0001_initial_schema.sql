-- =============================================================================
-- 数字化农业工厂 · Cloudflare D1 边缘关系数据库初始化迁移脚本
-- 0001_initial_schema.sql
-- 时间戳统一存储为严格 ISO 8601 UTC 毫秒字符串 (YYYY-MM-DDTHH:mm:ss.sssZ)
-- =============================================================================

-- 1. 车间工程拓扑主表 (Projects)
CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    facility_name TEXT NOT NULL,
    workshop_code TEXT NOT NULL,
    current_topology_json TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_updated_at ON projects(updated_at DESC);

-- 2. 拓扑工程版本快照表 (Project Version Snapshots)
CREATE TABLE IF NOT EXISTS project_versions (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    version_tag TEXT NOT NULL,
    commit_message TEXT NOT NULL,
    topology_snapshot_json TEXT NOT NULL,
    committed_by TEXT NOT NULL,
    committed_at TEXT NOT NULL,
    FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_project_versions_project_id ON project_versions(project_id);
CREATE INDEX IF NOT EXISTS idx_project_versions_committed_at ON project_versions(committed_at DESC);

-- 3. 全厂系统操作审计日志表 (System Audit Logs)
CREATE TABLE IF NOT EXISTS system_audit_logs (
    id TEXT PRIMARY KEY,
    project_id TEXT,
    user_id TEXT NOT NULL,
    action_type TEXT NOT NULL,
    detail_json TEXT,
    timestamp TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_project_id ON system_audit_logs(project_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON system_audit_logs(timestamp DESC);
