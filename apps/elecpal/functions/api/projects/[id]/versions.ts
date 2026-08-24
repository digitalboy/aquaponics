interface Env {
  DB: any;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json'
};

export const onRequestOptions = async () => {
  return new Response(null, { headers: corsHeaders });
};

/**
 * GET /api/projects/:id/versions
 * 获取指定工程的历史版本快照列表
 */
export const onRequestGet = async (context: { request: Request; env: Env; params: { id: string } }) => {
  try {
    const projectId = context.params.id;
    const stmt = context.env.DB.prepare(
      'SELECT id, project_id, version_tag, commit_message, committed_by, committed_at FROM project_versions WHERE project_id = ? ORDER BY committed_at DESC'
    );
    const { results } = await stmt.bind(projectId).all();

    return new Response(JSON.stringify({ success: true, data: results || [] }), {
      headers: corsHeaders
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: corsHeaders
    });
  }
};

/**
 * POST /api/projects/:id/versions
 * 提交新的工程版本快照
 */
export const onRequestPost = async (context: { request: Request; env: Env; params: { id: string } }) => {
  try {
    const projectId = context.params.id;
    const body: any = await context.request.json();
    const {
      id = crypto.randomUUID(),
      version_tag = 'v1.0.0',
      commit_message = '快照提交',
      topology_snapshot_json,
      committed_by = 'guest-local-user'
    } = body;

    if (!topology_snapshot_json) {
      return new Response(JSON.stringify({ success: false, error: '缺少 topology_snapshot_json 快照数据' }), {
        status: 400,
        headers: corsHeaders
      });
    }

    const nowIso = new Date().toISOString();
    const snapshotStr = typeof topology_snapshot_json === 'string'
      ? topology_snapshot_json
      : JSON.stringify(topology_snapshot_json);

    const stmt = context.env.DB.prepare(`
      INSERT INTO project_versions (id, project_id, version_tag, commit_message, topology_snapshot_json, committed_by, committed_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    await stmt.bind(
      id,
      projectId,
      version_tag,
      commit_message,
      snapshotStr,
      committed_by,
      nowIso
    ).run();

    return new Response(JSON.stringify({ success: true, message: '版本快照提交成功', version_id: id, committed_at: nowIso }), {
      headers: corsHeaders
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: corsHeaders
    });
  }
};
