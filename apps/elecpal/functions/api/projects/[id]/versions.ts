import {
  FunctionsEnv,
  buildCorsHeaders,
  jsonResponse,
  requireAuth
} from '../../../_lib/auth';

export const onRequestOptions = async (context: { request: Request; env: FunctionsEnv }) => {
  return new Response(null, {
    headers: buildCorsHeaders(context.request, 'GET, POST, OPTIONS', context.env)
  });
};

async function verifyProjectOwner(
  env: FunctionsEnv,
  projectId: string,
  uid: string,
  corsHeaders: Record<string, string>
): Promise<Response | null> {
  const project = await env.DB.prepare('SELECT user_id FROM projects WHERE id = ?')
    .bind(projectId)
    .first();

  if (!project) {
    return jsonResponse({ success: false, error: '工程不存在' }, 404, corsHeaders);
  }
  if (project.user_id !== uid) {
    return jsonResponse({ success: false, error: '无权访问该工程版本' }, 403, corsHeaders);
  }
  return null;
}

/**
 * GET /api/projects/:id/versions
 * 获取指定工程的历史版本快照列表（仅允许工程所有者）
 */
export const onRequestGet = async (context: { request: Request; env: FunctionsEnv; params: { id: string } }) => {
  const corsHeaders = buildCorsHeaders(context.request, 'GET, POST, OPTIONS', context.env);
  const authResult = await requireAuth(context.request, context.env, corsHeaders);
  if ('response' in authResult) return authResult.response;

  try {
    const projectId = context.params.id;
    const ownerError = await verifyProjectOwner(context.env, projectId, authResult.user.uid, corsHeaders);
    if (ownerError) return ownerError;

    const stmt = context.env.DB.prepare(
      `SELECT id, project_id, version_tag, commit_message, topology_snapshot_json, committed_by, committed_at
       FROM project_versions
       WHERE project_id = ?
       ORDER BY committed_at DESC`
    );
    const { results } = await stmt.bind(projectId).all();

    return jsonResponse({ success: true, data: results || [] }, 200, corsHeaders);
  } catch (err: any) {
    return jsonResponse({ success: false, error: err.message }, 500, corsHeaders);
  }
};

/**
 * POST /api/projects/:id/versions
 * 提交新的工程版本快照（仅允许工程所有者）
 */
export const onRequestPost = async (context: { request: Request; env: FunctionsEnv; params: { id: string } }) => {
  const corsHeaders = buildCorsHeaders(context.request, 'GET, POST, OPTIONS', context.env);
  const authResult = await requireAuth(context.request, context.env, corsHeaders);
  if ('response' in authResult) return authResult.response;

  try {
    const projectId = context.params.id;
    const ownerError = await verifyProjectOwner(context.env, projectId, authResult.user.uid, corsHeaders);
    if (ownerError) return ownerError;

    const body: any = await context.request.json();
    const {
      id = crypto.randomUUID(),
      version_tag = 'v1.0.0',
      commit_message = '快照提交',
      topology_snapshot_json
    } = body;

    if (!topology_snapshot_json) {
      return jsonResponse(
        { success: false, error: '缺少 topology_snapshot_json 快照数据' },
        400,
        corsHeaders
      );
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
      authResult.user.uid,
      nowIso
    ).run();

    return jsonResponse(
      { success: true, message: '版本快照提交成功', version_id: id, committed_at: nowIso },
      200,
      corsHeaders
    );
  } catch (err: any) {
    return jsonResponse({ success: false, error: err.message }, 500, corsHeaders);
  }
};
