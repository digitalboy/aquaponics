interface Env {
  DB: any;
}

// 跨域 CORS 辅助头
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
 * GET /api/projects?userId=xxx
 * 获取指定用户的工程项目列表
 */
export const onRequestGet = async (context: { request: Request; env: Env }) => {
  try {
    const url = new URL(context.request.url);
    const userId = url.searchParams.get('userId') || 'guest-local-user';

    const stmt = context.env.DB.prepare(
      'SELECT id, user_id, name, facility_name, workshop_code, created_at, updated_at FROM projects WHERE user_id = ? ORDER BY updated_at DESC'
    );
    const { results } = await stmt.bind(userId).all();

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
 * POST /api/projects
 * 创建或全量保存工程拓扑
 */
export const onRequestPost = async (context: { request: Request; env: Env }) => {
  try {
    const body: any = await context.request.json();
    const {
      id,
      user_id = 'guest-local-user',
      name = '未命名工程',
      facility_name = '基地车间',
      workshop_code = 'WS-01',
      current_topology_json
    } = body;

    if (!id || !current_topology_json) {
      return new Response(
        JSON.stringify({ success: false, error: '缺少 id 或 current_topology_json 必填参数' }),
        { status: 400, headers: corsHeaders }
      );
    }

    const nowIso = new Date().toISOString();
    const topologyStr = typeof current_topology_json === 'string'
      ? current_topology_json
      : JSON.stringify(current_topology_json);

    // UPSERT 语法
    const upsertStmt = context.env.DB.prepare(`
      INSERT INTO projects (id, user_id, name, facility_name, workshop_code, current_topology_json, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        facility_name = excluded.facility_name,
        workshop_code = excluded.workshop_code,
        current_topology_json = excluded.current_topology_json,
        updated_at = excluded.updated_at
    `);

    await upsertStmt.bind(
      id,
      user_id,
      name,
      facility_name,
      workshop_code,
      topologyStr,
      nowIso,
      nowIso
    ).run();

    // 写入审计日志
    const auditStmt = context.env.DB.prepare(`
      INSERT INTO system_audit_logs (id, project_id, user_id, action_type, detail_json, timestamp)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    await auditStmt.bind(
      crypto.randomUUID(),
      id,
      user_id,
      'SAVE_PROJECT',
      JSON.stringify({ name, workshop_code }),
      nowIso
    ).run();

    return new Response(JSON.stringify({ success: true, message: '工程保存成功', updated_at: nowIso }), {
      headers: corsHeaders
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: corsHeaders
    });
  }
};
