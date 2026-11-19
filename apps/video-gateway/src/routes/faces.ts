import { type Env, jsonResponse, nowIsoUtc } from "../types";

export interface StaffGalleryPayload {
  site_id: string;
  faces_version: string;
  faces: Record<string, number[][]>;
}

/** 计算当前站点活跃员工人脸底库的版本摘要（供边缘心跳比对增量同步） */
export async function getSiteFacesVersion(db: D1Database, siteId: string): Promise<string> {
  const row = await db
    .prepare(
      `SELECT
         COUNT(s.sample_id) AS sample_count,
         MAX(f.updated_at) AS max_face_updated,
         MAX(s.created_at) AS max_sample_created
       FROM staff_faces f
       LEFT JOIN staff_face_samples s ON s.person_id = f.person_id AND s.status = 'ready'
       WHERE f.site_id = ?1 AND f.status = 'active'`,
    )
    .bind(siteId)
    .first<{ sample_count: number; max_face_updated: string | null; max_sample_created: string | null }>();

  const count = row?.sample_count ?? 0;
  const fUp = row?.max_face_updated ?? "none";
  const sUp = row?.max_sample_created ?? "none";
  return `${count}:${fUp}:${sUp}`;
}

/** 导出站点下所有 active 员工姓名 -> 128维特征向量列表 */
export async function exportSiteFacesGallery(db: D1Database, siteId: string): Promise<StaffGalleryPayload> {
  const facesVersion = await getSiteFacesVersion(db, siteId);
  const { results } = await db
    .prepare(
      `SELECT f.name, s.embedding_json
       FROM staff_faces f
       INNER JOIN staff_face_samples s ON s.person_id = f.person_id
       WHERE f.site_id = ?1 AND f.status = 'active' AND s.status = 'ready'
       ORDER BY f.name ASC, s.created_at ASC`,
    )
    .bind(siteId)
    .all<{ name: string; embedding_json: string }>();

  const faces: Record<string, number[][]> = {};
  for (const row of results ?? []) {
    try {
      const vec = JSON.parse(row.embedding_json) as number[];
      if (!Array.isArray(vec) || vec.length === 0) continue;
      if (!faces[row.name]) faces[row.name] = [];
      faces[row.name]!.push(vec);
    } catch {
      // 跳过异常 JSON 记录
    }
  }

  return {
    site_id: siteId,
    faces_version: facesVersion,
    faces,
  };
}

/** 内部管理路由（受 INTERNAL_API_KEY Bearer 鉴权保护）：查询、录入与停用员工人脸档案 */
export async function handleInternalFacesRoutes(
  request: Request,
  env: Env,
  url: URL,
): Promise<Response> {
  const siteId = url.searchParams.get("site_id") || env.DEFAULT_SITE_ID || "guangming-01";

  if (url.pathname === "/api/internal/faces" && request.method === "GET") {
    const { results: staffRows } = await env.VIDEO_DB.prepare(
      `SELECT f.person_id, f.site_id, f.name, f.role, f.status, f.created_at, f.updated_at
       FROM staff_faces f
       WHERE f.site_id = ?1
       ORDER BY f.updated_at DESC`,
    )
      .bind(siteId)
      .all<{
        person_id: string;
        site_id: string;
        name: string;
        role: string;
        status: string;
        created_at: string;
        updated_at: string;
      }>();

    const { results: sampleRows } = await env.VIDEO_DB.prepare(
      `SELECT sample_id, person_id, r2_key, status, error_message, created_at
       FROM staff_face_samples
       WHERE site_id = ?1
       ORDER BY created_at DESC`,
    )
      .bind(siteId)
      .all<{
        sample_id: string;
        person_id: string;
        r2_key: string | null;
        status: string;
        error_message: string | null;
        created_at: string;
      }>();

    const sampleMap = new Map<string, typeof sampleRows>();
    for (const s of sampleRows ?? []) {
      const list = sampleMap.get(s.person_id) ?? [];
      list.push(s);
      sampleMap.set(s.person_id, list);
    }

    const staff = (staffRows ?? []).map((f) => {
      const samples = sampleMap.get(f.person_id) ?? [];
      return {
        ...f,
        sample_count: samples.filter((s) => s.status === "ready").length,
        samples,
      };
    });

    const version = await getSiteFacesVersion(env.VIDEO_DB, siteId);
    return jsonResponse({ site_id: siteId, faces_version: version, staff }, 200, env.ALLOWED_ORIGINS);
  }

  if (url.pathname === "/api/internal/faces/upload-sample" && request.method === "POST") {
    const form = await request.formData();
    const name = String(form.get("name") ?? "").trim();
    const role = String(form.get("role") ?? "staff").trim() || "staff";
    const rawPersonId = String(form.get("person_id") ?? "").trim();
    const file = form.get("file");

    if (!name || !(file instanceof File)) {
      return jsonResponse({ error: "name and photo file are required" }, 400, env.ALLOWED_ORIGINS);
    }
    if (file.size === 0 || file.size > 10 * 1024 * 1024) {
      return jsonResponse({ error: "Photo size must be between 1B and 10MB" }, 400, env.ALLOWED_ORIGINS);
    }

    const now = nowIsoUtc();
    const personId = rawPersonId || `STAFF-${Date.now()}`;
    const sampleId = `SMP-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const r2Key = `faces/${siteId}/${personId}/${sampleId}.jpg`;
    const bytes = await file.arrayBuffer();

    await env.VIDEO_R2.put(r2Key, bytes, {
      httpMetadata: { contentType: file.type || "image/jpeg" },
    });

    const cmdId = `CMD-FACE-${Date.now()}-${sampleId}`;
    const expiresAt = new Date(Date.now() + 10 * 60_000).toISOString();

    await env.VIDEO_DB.batch([
      env.VIDEO_DB.prepare(
        `INSERT INTO staff_faces (person_id, site_id, name, role, status, created_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, 'active', ?5, ?6)
         ON CONFLICT(person_id) DO UPDATE SET
           name = excluded.name,
           role = excluded.role,
           updated_at = excluded.updated_at`,
      ).bind(personId, siteId, name, role, now, now),
      env.VIDEO_DB.prepare(
        `INSERT INTO staff_face_samples (sample_id, person_id, site_id, r2_key, embedding_json, status, created_at)
         VALUES (?1, ?2, ?3, ?4, '[]', 'pending', ?5)`,
      ).bind(sampleId, personId, siteId, r2Key, now),
      env.VIDEO_DB.prepare(
        `INSERT INTO agent_commands (cmd_id, site_id, cam_id, action, payload_json, status, expires_at, created_at)
         VALUES (?1, ?2, 'SYSTEM', 'extract_face', ?3, 'pending', ?4, ?5)`,
      ).bind(
        cmdId,
        siteId,
        JSON.stringify({ person_id: personId, sample_id: sampleId, r2_key: r2Key }),
        expiresAt,
        now,
      ),
    ]);

    return jsonResponse(
      { ok: true, person_id: personId, sample_id: sampleId, r2_key: r2Key, status: "pending" },
      200,
      env.ALLOWED_ORIGINS,
    );
  }

  if (url.pathname === "/api/internal/faces/status" && request.method === "POST") {
    const body = (await request.json()) as { person_id?: string; status?: "active" | "disabled" };
    if (!body.person_id || (body.status !== "active" && body.status !== "disabled")) {
      return jsonResponse({ error: "Invalid person_id or status" }, 400, env.ALLOWED_ORIGINS);
    }
    const now = nowIsoUtc();
    await env.VIDEO_DB.prepare(
      `UPDATE staff_faces SET status = ?1, updated_at = ?2 WHERE person_id = ?3 AND site_id = ?4`,
    )
      .bind(body.status, now, body.person_id, siteId)
      .run();
    return jsonResponse({ ok: true, person_id: body.person_id, status: body.status }, 200, env.ALLOWED_ORIGINS);
  }

  if (url.pathname.startsWith("/api/internal/faces/") && request.method === "DELETE") {
    const personId = decodeURIComponent(url.pathname.slice("/api/internal/faces/".length));
    if (!personId || personId === "upsert" || personId === "media" || personId === "status") {
      return jsonResponse({ error: "Invalid person_id" }, 400, env.ALLOWED_ORIGINS);
    }
    await env.VIDEO_DB.batch([
      env.VIDEO_DB.prepare(`DELETE FROM staff_face_samples WHERE person_id = ?1 AND site_id = ?2`).bind(
        personId,
        siteId,
      ),
      env.VIDEO_DB.prepare(`DELETE FROM staff_faces WHERE person_id = ?1 AND site_id = ?2`).bind(
        personId,
        siteId,
      ),
    ]);
    return jsonResponse({ ok: true, deleted: personId }, 200, env.ALLOWED_ORIGINS);
  }

  if (url.pathname === "/api/internal/faces/media" && request.method === "GET") {
    const r2Key = url.searchParams.get("key") || "";
    if (!r2Key || r2Key.includes("..")) {
      return jsonResponse({ error: "Invalid key" }, 400, env.ALLOWED_ORIGINS);
    }
    const obj = await env.VIDEO_R2.get(r2Key);
    if (!obj) {
      return jsonResponse({ error: "Not Found" }, 404, env.ALLOWED_ORIGINS);
    }
    return new Response(obj.body, {
      status: 200,
      headers: {
        "Content-Type": obj.httpMetadata?.contentType || "image/jpeg",
        "Cache-Control": "private, max-age=300",
        "Access-Control-Allow-Origin": env.ALLOWED_ORIGINS || "*",
      },
    });
  }

  if (url.pathname === "/api/internal/events/night-ai" && request.method === "GET") {
    const limit = Math.min(Math.max(Number(url.searchParams.get("limit") || "100"), 1), 200);
    const dateParam = url.searchParams.get("date") ?? "";
    const monthParam = url.searchParams.get("month") ?? "";

    const cstDateRangeUtc = (yyyyMmDd: string): [string, string] | null => {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(yyyyMmDd)) return null;
      const startMs = Date.parse(`${yyyyMmDd}T00:00:00.000+08:00`);
      const endMs = Date.parse(`${yyyyMmDd}T23:59:59.999+08:00`);
      if (Number.isNaN(startMs) || Number.isNaN(endMs)) return null;
      return [new Date(startMs).toISOString(), new Date(endMs).toISOString()];
    };

    const cstMonthRangeUtc = (yyyyMm: string): [string, string] | null => {
      if (!/^\d{4}-\d{2}$/.test(yyyyMm)) return null;
      const [y, m] = yyyyMm.split("-").map(Number);
      const lastDay = new Date(y!, m!, 0).getDate();
      const startMs = Date.parse(`${yyyyMm}-01T00:00:00.000+08:00`);
      const endMs = Date.parse(`${yyyyMm}-${String(lastDay).padStart(2, "0")}T23:59:59.999+08:00`);
      if (Number.isNaN(startMs) || Number.isNaN(endMs)) return null;
      return [new Date(startMs).toISOString(), new Date(endMs).toISOString()];
    };

    const toCstDateStr = (isoUtc: string): string => {
      const ms = Date.parse(isoUtc);
      if (Number.isNaN(ms)) return isoUtc.slice(0, 10);
      const cst = new Date(ms + 8 * 3600 * 1000);
      return cst.toISOString().slice(0, 10);
    };

    const dateRange = dateParam ? cstDateRangeUtc(dateParam) : null;
    const eventsSql = dateRange
      ? `SELECT e.event_id, e.site_id, e.cam_id, COALESCE(c.name, e.cam_id) AS cam_name,
                e.trigger_at, e.r2_key, e.meta_json
         FROM video_events e
         LEFT JOIN cameras c ON c.cam_id = e.cam_id
         WHERE e.site_id = ?1 AND e.source_type = 'night_person_ai'
           AND e.trigger_at >= ?2 AND e.trigger_at <= ?3
         ORDER BY e.trigger_at DESC
         LIMIT ?4`
      : `SELECT e.event_id, e.site_id, e.cam_id, COALESCE(c.name, e.cam_id) AS cam_name,
                e.trigger_at, e.r2_key, e.meta_json
         FROM video_events e
         LEFT JOIN cameras c ON c.cam_id = e.cam_id
         WHERE e.site_id = ?1 AND e.source_type = 'night_person_ai'
         ORDER BY e.trigger_at DESC
         LIMIT ?2`;

    const eventsStmt = dateRange
      ? env.VIDEO_DB.prepare(eventsSql).bind(siteId, dateRange[0], dateRange[1], limit)
      : env.VIDEO_DB.prepare(eventsSql).bind(siteId, limit);

    const { results } = await eventsStmt.all<{
      event_id: string;
      site_id: string;
      cam_id: string;
      cam_name: string;
      trigger_at: string;
      r2_key: string | null;
      meta_json: string | null;
    }>();

    const dailySummary: Record<string, { total: number; known: number; unknown: number }> = {};
    const targetMonth = monthParam || toCstDateStr(nowIsoUtc()).slice(0, 7);
    const monthRange = cstMonthRangeUtc(targetMonth);
    if (monthRange) {
      const { results: monthRows } = await env.VIDEO_DB.prepare(
        `SELECT trigger_at, meta_json
         FROM video_events
         WHERE site_id = ?1 AND source_type = 'night_person_ai'
           AND trigger_at >= ?2 AND trigger_at <= ?3`,
      )
        .bind(siteId, monthRange[0], monthRange[1])
        .all<{ trigger_at: string; meta_json: string | null }>();

      for (const r of monthRows ?? []) {
        const day = toCstDateStr(r.trigger_at);
        if (!dailySummary[day]) dailySummary[day] = { total: 0, known: 0, unknown: 0 };
        dailySummary[day]!.total += 1;
        let isKnown = false;
        try {
          const meta = r.meta_json ? (JSON.parse(r.meta_json) as { recognized_names?: string[] }) : {};
          isKnown = Array.isArray(meta.recognized_names) && meta.recognized_names.length > 0;
        } catch {
          isKnown = false;
        }
        if (isKnown) dailySummary[day]!.known += 1;
        else dailySummary[day]!.unknown += 1;
      }
    }

    const events = (results ?? []).map((row) => {
      let meta: Record<string, unknown> = {};
      try {
        if (row.meta_json) meta = JSON.parse(row.meta_json) as Record<string, unknown>;
      } catch {
        meta = {};
      }
      return {
        event_id: row.event_id,
        cam_id: row.cam_id,
        cam_name: row.cam_name,
        trigger_at: row.trigger_at,
        r2_key: row.r2_key,
        recognized_names: Array.isArray(meta.recognized_names) ? meta.recognized_names : [],
        face_similarity: typeof meta.face_similarity === "number" ? meta.face_similarity : null,
        person_count: typeof meta.person_count === "number" ? meta.person_count : 1,
        max_confidence: typeof meta.max_confidence === "number" ? meta.max_confidence : null,
        frames: Array.isArray(meta.frames) ? meta.frames : [],
      };
    });

    return jsonResponse(
      { site_id: siteId, month: targetMonth, date: dateParam || null, daily_summary: dailySummary, events },
      200,
      env.ALLOWED_ORIGINS,
    );
  }

  if (url.pathname === "/api/internal/faces/upsert" && request.method === "POST") {
    const body = (await request.json()) as {
      person_id: string;
      site_id?: string;
      name: string;
      role?: string;
      status?: "active" | "disabled";
      samples?: Array<{ sample_id: string; r2_key?: string; embedding: number[] }>;
    };

    if (!body.person_id || !body.name) {
      return jsonResponse({ error: "person_id and name are required" }, 400, env.ALLOWED_ORIGINS);
    }

    const targetSite = body.site_id || siteId;
    const now = nowIsoUtc();
    const role = body.role || "staff";
    const status = body.status === "disabled" ? "disabled" : "active";

    await env.VIDEO_DB.prepare(
      `INSERT INTO staff_faces (person_id, site_id, name, role, status, created_at, updated_at)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)
       ON CONFLICT(person_id) DO UPDATE SET
         name = excluded.name,
         role = excluded.role,
         status = excluded.status,
         updated_at = excluded.updated_at`,
    )
      .bind(body.person_id, targetSite, body.name, role, status, now, now)
      .run();

    let insertedSamples = 0;
    if (Array.isArray(body.samples) && body.samples.length > 0) {
      const stmts = body.samples
        .filter((s) => s.sample_id && Array.isArray(s.embedding) && s.embedding.length > 0)
        .map((s) =>
          env.VIDEO_DB.prepare(
            `INSERT INTO staff_face_samples (sample_id, person_id, site_id, r2_key, embedding_json, created_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6)
             ON CONFLICT(sample_id) DO UPDATE SET
               r2_key = excluded.r2_key,
               embedding_json = excluded.embedding_json`,
          ).bind(
            s.sample_id,
            body.person_id,
            targetSite,
            s.r2_key ?? null,
            JSON.stringify(s.embedding),
            now,
          ),
        );
      if (stmts.length > 0) {
        await env.VIDEO_DB.batch(stmts);
        insertedSamples = stmts.length;
      }
    }

    const version = await getSiteFacesVersion(env.VIDEO_DB, targetSite);
    return jsonResponse(
      { ok: true, person_id: body.person_id, inserted_samples: insertedSamples, faces_version: version },
      200,
      env.ALLOWED_ORIGINS,
    );
  }

  return jsonResponse({ error: "Not Found" }, 404, env.ALLOWED_ORIGINS);
}
