interface Env {
  DB: any;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json'
};

export const onRequestOptions = async () => {
  return new Response(null, { headers: corsHeaders });
};

/**
 * GET /api/projects/:id
 * 获取指定工程的完整拓扑详情
 */
export const onRequestGet = async (context: { request: Request; env: Env; params: { id: string } }) => {
  try {
    const projectId = context.params.id;
    const stmt = context.env.DB.prepare('SELECT * FROM projects WHERE id = ?');
    const project = await stmt.bind(projectId).first();

    if (!project) {
      return new Response(JSON.stringify({ success: false, error: '工程不存在' }), {
        status: 404,
        headers: corsHeaders
      });
    }

    // 解析 topology json
    if (project.current_topology_json && typeof project.current_topology_json === 'string') {
      try {
        project.topology = JSON.parse(project.current_topology_json);
      } catch (e) {
        project.topology = null;
      }
    }

    return new Response(JSON.stringify({ success: true, data: project }), {
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
 * DELETE /api/projects/:id
 * 删除工程
 */
export const onRequestDelete = async (context: { request: Request; env: Env; params: { id: string } }) => {
  try {
    const projectId = context.params.id;
    const stmt = context.env.DB.prepare('DELETE FROM projects WHERE id = ?');
    await stmt.bind(projectId).run();

    return new Response(JSON.stringify({ success: true, message: '工程删除成功' }), {
      headers: corsHeaders
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: corsHeaders
    });
  }
};
