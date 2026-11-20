import {
  FunctionsEnv,
  buildCorsHeaders,
  jsonResponse,
  requireAuth
} from '../../_lib/auth';

export const onRequestOptions = async (context: { request: Request; env: FunctionsEnv }) => {
  return new Response(null, {
    headers: buildCorsHeaders(context.request, 'GET, POST, OPTIONS', context.env)
  });
};

/**
 * GET /api/projects
 * 获取当前登录用户的工程项目列表（userId 严格取自已校验的 Firebase ID Token）
 */
export const onRequestGet = async (context: { request: Request; env: FunctionsEnv }) => {
  const corsHeaders = buildCorsHeaders(context.request, 'GET, POST, OPTIONS', context.env);
  const authResult = await requireAuth(context.request, context.env, corsHeaders);
  if ('response' in authResult) return authResult.response;

  try {
    const stmt = context.env.DB.prepare(
      `SELECT id, user_id, name, facility_name, workshop_code, current_topology_json, created_at, updated_at
       FROM projects
       WHERE user_id = ?
       ORDER BY updated_at DESC`
    );
    const { results } = await stmt.bind(authResult.user.uid).all();

    return jsonResponse({ success: true, data: results || [] }, 200, corsHeaders);
  } catch (err: any) {
    return jsonResponse({ success: false, error: err.message }, 500, corsHeaders);
  }
};

/**
 * POST /api/projects
 * 创建或全量保存工程拓扑（校验归属权，禁止覆盖他人工程）
 */
export const onRequestPost = async (context: { request: Request; env: FunctionsEnv }) => {
  const corsHeaders = buildCorsHeaders(context.request, 'GET, POST, OPTIONS', context.env);
  const authResult = await requireAuth(context.request, context.env, corsHeaders);
  if ('response' in authResult) return authResult.response;

  try {
    const body: any = await context.request.json();
    const {
      id,
      name = '未命名工程',
      facility_name = '基地车间',
      workshop_code = 'WS-01',
      current_topology_json
    } = body;

    if (!id || !current_topology_json) {
      return jsonResponse(
        { success: false, error: '缺少 id 或 current_topology_json 必填参数' },
        400,
        corsHeaders
      );
    }

    const uid = authResult.user.uid;

    // 校验是否尝试覆盖其他用户的工程
    const existing = await context.env.DB.prepare(
      'SELECT user_id FROM projects WHERE id = ?'
    ).bind(id).first();

    if (existing && existing.user_id !== uid) {
      return jsonResponse(
        { success: false, error: '无权修改其他用户的工程' },
        403,
        corsHeaders
      );
    }

    const nowIso = new Date().toISOString();
    const topologyStr = typeof current_topology_json === 'string'
      ? current_topology_json
      : JSON.stringify(current_topology_json);

    // UPSERT 语法（附加 user_id 校验作为纵深防御）
    const upsertStmt = context.env.DB.prepare(`
      INSERT INTO projects (id, user_id, name, facility_name, workshop_code, current_topology_json, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        facility_name = excluded.facility_name,
        workshop_code = excluded.workshop_code,
        current_topology_json = excluded.current_topology_json,
        updated_at = excluded.updated_at
      WHERE projects.user_id = excluded.user_id
    `);

    const upsertResult = await upsertStmt.bind(
      id,
      uid,
      name,
      facility_name,
      workshop_code,
      topologyStr,
      nowIso,
      nowIso
    ).run();

    if (!upsertResult.meta?.changes) {
      return jsonResponse(
        { success: false, error: '工程保存被拒绝：归属权校验未通过' },
        403,
        corsHeaders
      );
    }

    // 写入审计日志
    const auditStmt = context.env.DB.prepare(`
      INSERT INTO system_audit_logs (id, project_id, user_id, action_type, detail_json, timestamp)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    await auditStmt.bind(
      crypto.randomUUID(),
      id,
      uid,
      'SAVE_PROJECT',
      JSON.stringify({ name, workshop_code }),
      nowIso
    ).run();

    return jsonResponse(
      { success: true, message: '工程保存成功', updated_at: nowIso },
      200,
      corsHeaders
    );
  } catch (err: any) {
    return jsonResponse({ success: false, error: err.message }, 500, corsHeaders);
  }
};
