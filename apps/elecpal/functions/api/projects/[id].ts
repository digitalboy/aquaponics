import {
  FunctionsEnv,
  buildCorsHeaders,
  jsonResponse,
  requireAuth
} from '../../_lib/auth';

export const onRequestOptions = async (context: { request: Request; env: FunctionsEnv }) => {
  return new Response(null, {
    headers: buildCorsHeaders(context.request, 'GET, DELETE, OPTIONS', context.env)
  });
};

/**
 * GET /api/projects/:id
 * 获取指定工程的完整拓扑详情（仅允许工程所有者访问）
 */
export const onRequestGet = async (context: { request: Request; env: FunctionsEnv; params: { id: string } }) => {
  const corsHeaders = buildCorsHeaders(context.request, 'GET, DELETE, OPTIONS', context.env);
  const authResult = await requireAuth(context.request, context.env, corsHeaders);
  if ('response' in authResult) return authResult.response;

  try {
    const projectId = context.params.id;
    const stmt = context.env.DB.prepare('SELECT * FROM projects WHERE id = ?');
    const project = await stmt.bind(projectId).first();

    if (!project) {
      return jsonResponse({ success: false, error: '工程不存在' }, 404, corsHeaders);
    }

    if (project.user_id !== authResult.user.uid) {
      return jsonResponse({ success: false, error: '无权访问该工程' }, 403, corsHeaders);
    }

    // 解析 topology json
    if (project.current_topology_json && typeof project.current_topology_json === 'string') {
      try {
        project.topology = JSON.parse(project.current_topology_json);
      } catch {
        project.topology = null;
      }
    }

    return jsonResponse({ success: true, data: project }, 200, corsHeaders);
  } catch (err: any) {
    return jsonResponse({ success: false, error: err.message }, 500, corsHeaders);
  }
};

/**
 * DELETE /api/projects/:id
 * 删除工程（仅允许工程所有者删除）
 */
export const onRequestDelete = async (context: { request: Request; env: FunctionsEnv; params: { id: string } }) => {
  const corsHeaders = buildCorsHeaders(context.request, 'GET, DELETE, OPTIONS', context.env);
  const authResult = await requireAuth(context.request, context.env, corsHeaders);
  if ('response' in authResult) return authResult.response;

  try {
    const projectId = context.params.id;
    const existing = await context.env.DB.prepare(
      'SELECT user_id FROM projects WHERE id = ?'
    ).bind(projectId).first();

    if (!existing) {
      return jsonResponse({ success: false, error: '工程不存在' }, 404, corsHeaders);
    }

    if (existing.user_id !== authResult.user.uid) {
      return jsonResponse({ success: false, error: '无权删除该工程' }, 403, corsHeaders);
    }

    const stmt = context.env.DB.prepare('DELETE FROM projects WHERE id = ? AND user_id = ?');
    const delResult = await stmt.bind(projectId, authResult.user.uid).run();

    if (!delResult.meta?.changes) {
      return jsonResponse({ success: false, error: '工程不存在或无权删除' }, 404, corsHeaders);
    }

    const nowIso = new Date().toISOString();
    await context.env.DB.prepare(
      `INSERT INTO system_audit_logs (id, project_id, user_id, action_type, detail_json, timestamp)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).bind(
      crypto.randomUUID(),
      projectId,
      authResult.user.uid,
      'DELETE_PROJECT',
      JSON.stringify({ projectId }),
      nowIso
    ).run();

    return jsonResponse({ success: true, message: '工程删除成功' }, 200, corsHeaders);
  } catch (err: any) {
    return jsonResponse({ success: false, error: err.message }, 500, corsHeaders);
  }
};
