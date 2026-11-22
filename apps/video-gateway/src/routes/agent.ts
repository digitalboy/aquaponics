import { handlePersonDetectionAlert } from "../alerts";
import { sha256Hex, verifyAgentRequest } from "../crypto";
import { type CameraRow, type Env, isStrictIsoUtc, jsonResponse, nowIsoUtc } from "../types";
import { exportSiteFacesGallery, getSiteFacesVersion } from "./faces";

interface HeartbeatBody {
  agent_version?: string;
  sent_at: string;
  ram_disk?: { mount: string; used_mb: number; limit_mb: number };
  cameras?: Array<{ cam_id: string; status: "online" | "offline" | "degraded"; active_live?: boolean }>;
}

interface IngestItem {
  kind: "snapshot" | "hls_segment" | "event";
  cam_id: string;
  r2_key: string;
  timestamp: string;
  size_bytes: number;
  duration_sec?: number;
  width?: number;
  height?: number;
  person_count?: number;
  event_id?: string;
}

/** 处理边缘倍控 N100 的所有内部信令、上传与元数据入库请求 */
export async function handleAgentRoutes(
  request: Request,
  env: Env,
  pathname: string,
): Promise<Response> {
  const secret = env.AGENT_SECRET;
  if (!secret) {
    return jsonResponse({ error: "AGENT_SECRET is not configured" }, 500, env.ALLOWED_ORIGINS);
  }

  // R2 直传接口：使用空串摘要或路径校验避免在内存缓冲大文件，生产中建议分片 <= 10MB
  const rawBody = request.method === "PUT" ? await request.arrayBuffer() : await request.text();
  const bodyHash = await sha256Hex(rawBody);
  const auth = await verifyAgentRequest(request, secret, bodyHash);
  if (!auth.ok) {
    return jsonResponse({ error: auth.reason }, 401, env.ALLOWED_ORIGINS);
  }

  const now = nowIsoUtc();

  if (pathname === "/api/internal/agent/heartbeat" && request.method === "POST") {
    const body = JSON.parse(rawBody as string) as HeartbeatBody;
    if (Array.isArray(body.cameras)) {
      const stmts = body.cameras.map((cam) =>
        env.VIDEO_DB.prepare(
          "UPDATE cameras SET online_status = ?, last_seen_at = ?, updated_at = ? WHERE cam_id = ? AND site_id = ?",
        ).bind(cam.status, now, now, cam.cam_id, auth.siteId),
      );
      if (stmts.length > 0) await env.VIDEO_DB.batch(stmts);
    }

    // 清理已过期指令
    await env.VIDEO_DB.prepare(
      "UPDATE agent_commands SET status = 'expired' WHERE site_id = ? AND status = 'pending' AND expires_at < ?",
    )
      .bind(auth.siteId, now)
      .run();

    // 若 on-demand 机位超过 WAKE_TTL_SEC 无人观看，自动追加一条 sleep_live 指令
    const wakeTtlMs = Number(env.WAKE_TTL_SEC || "180") * 1000;
    const staleCutoff = new Date(Date.now() - wakeTtlMs).toISOString();
    const activeLiveCams = new Set(
      (body.cameras ?? []).filter((c) => c.active_live).map((c) => c.cam_id),
    );
    if (activeLiveCams.size > 0) {
      const { results: camRows } = await env.VIDEO_DB.prepare(
        "SELECT cam_id, stream_mode, last_viewed_at FROM cameras WHERE site_id = ? AND stream_mode = 'on-demand'",
      )
        .bind(auth.siteId)
        .all<Pick<CameraRow, "cam_id" | "stream_mode" | "last_viewed_at">>();

      for (const row of camRows) {
        if (activeLiveCams.has(row.cam_id) && (!row.last_viewed_at || row.last_viewed_at < staleCutoff)) {
          const cmdId = `CMD-SLEEP-${Date.now()}-${row.cam_id}`;
          const expires = new Date(Date.now() + 60_000).toISOString();
          await env.VIDEO_DB.prepare(
            "INSERT OR IGNORE INTO agent_commands (cmd_id, site_id, cam_id, action, payload_json, status, expires_at, created_at) VALUES (?, ?, ?, 'sleep_live', '{}', 'pending', ?, ?)",
          )
            .bind(cmdId, auth.siteId, row.cam_id, expires, now)
            .run();
        }
      }
    }

    const { results: commands } = await env.VIDEO_DB.prepare(
      "SELECT cmd_id, cam_id, action, payload_json, expires_at FROM agent_commands WHERE site_id = ? AND status = 'pending' ORDER BY created_at ASC LIMIT 20",
    )
      .bind(auth.siteId)
      .all<{ cmd_id: string; cam_id: string; action: string; payload_json: string; expires_at: string }>();

    const { results: modeRows } = await env.VIDEO_DB.prepare(
      "SELECT cam_id, stream_mode, audio_enabled, ip_address, rtsp_channel FROM cameras WHERE site_id = ?",
    )
      .bind(auth.siteId)
      .all<Pick<CameraRow, "cam_id" | "stream_mode" | "audio_enabled" | "ip_address" | "rtsp_channel">>();

    const desiredModes: Record<string, string> = {};
    for (const r of modeRows) desiredModes[r.cam_id] = r.stream_mode;

    const facesVersion = await getSiteFacesVersion(env.VIDEO_DB, auth.siteId);

    return jsonResponse(
      {
        server_time: now,
        faces_version: facesVersion,
        commands: commands.map((c) => ({
          cmd_id: c.cmd_id,
          cam_id: c.cam_id,
          action: c.action,
          payload: JSON.parse(c.payload_json || "{}"),
          expires_at: c.expires_at,
        })),
        desired_modes: desiredModes,
      },
      200,
      env.ALLOWED_ORIGINS,
    );
  }

  if (pathname.startsWith("/api/internal/agent/download/") && request.method === "GET") {
    const r2Key = decodeURIComponent(pathname.slice("/api/internal/agent/download/".length));
    if (!r2Key || r2Key.includes("..")) {
      return jsonResponse({ error: "Invalid R2 key" }, 400, env.ALLOWED_ORIGINS);
    }
    const obj = await env.VIDEO_R2.get(r2Key);
    if (!obj) {
      return jsonResponse({ error: "Object not found" }, 404, env.ALLOWED_ORIGINS);
    }
    return new Response(obj.body, {
      status: 200,
      headers: {
        "Content-Type": obj.httpMetadata?.contentType || "application/octet-stream",
        "Cache-Control": "no-store",
      },
    });
  }

  if (pathname === "/api/internal/agent/faces" && request.method === "GET") {
    const gallery = await exportSiteFacesGallery(env.VIDEO_DB, auth.siteId);
    return jsonResponse(gallery, 200, env.ALLOWED_ORIGINS);
  }

  if (pathname === "/api/internal/agent/faces/sample-result" && request.method === "POST") {
    const body = JSON.parse(rawBody as string) as {
      sample_id: string;
      person_id: string;
      status: "ready" | "failed";
      embedding?: number[];
      error_message?: string;
    };
    if (!body.sample_id || !body.person_id) {
      return jsonResponse({ error: "sample_id and person_id are required" }, 400, env.ALLOWED_ORIGINS);
    }
    if (body.status === "ready" && Array.isArray(body.embedding) && body.embedding.length > 0) {
      await env.VIDEO_DB.batch([
        env.VIDEO_DB.prepare(
          `UPDATE staff_face_samples SET status = 'ready', embedding_json = ?1, error_message = NULL
           WHERE sample_id = ?2 AND site_id = ?3`,
        ).bind(JSON.stringify(body.embedding), body.sample_id, auth.siteId),
        env.VIDEO_DB.prepare(
          `UPDATE staff_faces SET updated_at = ?1 WHERE person_id = ?2 AND site_id = ?3`,
        ).bind(now, body.person_id, auth.siteId),
      ]);
    } else {
      await env.VIDEO_DB.prepare(
        `UPDATE staff_face_samples SET status = 'failed', error_message = ?1
         WHERE sample_id = ?2 AND site_id = ?3`,
      )
        .bind(body.error_message || "未检测到清晰人脸", body.sample_id, auth.siteId)
        .run();
    }
    return jsonResponse({ ok: true, sample_id: body.sample_id }, 200, env.ALLOWED_ORIGINS);
  }

  const ackMatch = pathname.match(/^\/api\/internal\/agent\/commands\/([^/]+)\/ack$/);
  if (ackMatch && request.method === "POST") {
    const cmdId = decodeURIComponent(ackMatch[1]);
    const body = JSON.parse(rawBody as string) as { status: "acked" | "completed" | "failed" };
    await env.VIDEO_DB.prepare(
      "UPDATE agent_commands SET status = ?, acked_at = ? WHERE cmd_id = ? AND site_id = ?",
    )
      .bind(body.status, now, cmdId, auth.siteId)
      .run();
    return jsonResponse({ ok: true, cmd_id: cmdId }, 200, env.ALLOWED_ORIGINS);
  }

  if (pathname.startsWith("/api/internal/agent/upload/") && request.method === "PUT") {
    const r2Key = decodeURIComponent(pathname.slice("/api/internal/agent/upload/".length));
    if (!r2Key || r2Key.includes("..")) {
      return jsonResponse({ error: "Invalid R2 key" }, 400, env.ALLOWED_ORIGINS);
    }
    const contentType = request.headers.get("Content-Type") || "application/octet-stream";
    await env.VIDEO_R2.put(r2Key, rawBody as ArrayBuffer, {
      httpMetadata: { contentType },
    });
    return jsonResponse({ ok: true, r2_key: r2Key }, 200, env.ALLOWED_ORIGINS);
  }

  if (pathname === "/api/internal/agent/ingest" && request.method === "POST") {
    const body = JSON.parse(rawBody as string) as { items: IngestItem[] };
    if (!Array.isArray(body.items)) {
      return jsonResponse({ error: "items must be an array" }, 400, env.ALLOWED_ORIGINS);
    }

    const stmts: D1PreparedStatement[] = [];
    for (const item of body.items) {
      if (!isStrictIsoUtc(item.timestamp)) {
        return jsonResponse(
          { error: `Invalid strict ISO 8601 UTC timestamp: ${item.timestamp}` },
          400,
          env.ALLOWED_ORIGINS,
        );
      }
      if (item.kind === "snapshot") {
        const personCount = Math.max(0, Math.round(item.person_count ?? 0));
        stmts.push(
          env.VIDEO_DB.prepare(
            "INSERT OR IGNORE INTO snapshots (site_id, cam_id, r2_key, captured_at, size_bytes, width, height, person_count, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
          ).bind(
            auth.siteId,
            item.cam_id,
            item.r2_key,
            item.timestamp,
            item.size_bytes,
            item.width ?? 1280,
            item.height ?? 720,
            personCount,
            now,
          ),
        );
      } else if (item.kind === "hls_segment") {
        stmts.push(
          env.VIDEO_DB.prepare(
            "INSERT OR IGNORE INTO hls_segments (site_id, cam_id, r2_key, start_at, duration_sec, size_bytes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
          ).bind(
            auth.siteId,
            item.cam_id,
            item.r2_key,
            item.timestamp,
            item.duration_sec ?? 4.0,
            item.size_bytes,
            now,
          ),
        );
      } else if (item.kind === "event" && item.event_id) {
        stmts.push(
          env.VIDEO_DB.prepare(
            "UPDATE video_events SET r2_key = ?, status = 'ready', updated_at = ? WHERE event_id = ? AND site_id = ?",
          ).bind(item.r2_key, now, item.event_id, auth.siteId),
        );
      }
    }

    if (stmts.length > 0) await env.VIDEO_DB.batch(stmts);
    return jsonResponse({ ok: true, ingested: stmts.length }, 200, env.ALLOWED_ORIGINS);
  }

  if (pathname === "/api/internal/agent/person-alert" && request.method === "POST") {
    const body = JSON.parse(rawBody as string) as {
      event_id: string;
      cam_id: string;
      r2_key: string;
      detected_at: string;
      person_count: number;
      max_confidence: number;
      schedule_note?: string;
      frames?: Array<{ label: string; r2_key: string; captured_at: string }>;
      recognized_names?: string[];
      face_similarity?: number;
    };
    if (!body.event_id || !body.cam_id || !body.r2_key || !isStrictIsoUtc(body.detected_at)) {
      return jsonResponse({ error: "Invalid person-alert payload" }, 400, env.ALLOWED_ORIGINS);
    }

    const metaJson = JSON.stringify({
      person_count: Math.max(1, Number(body.person_count || 1)),
      max_confidence: Number(body.max_confidence || 0),
      recognized_names: Array.isArray(body.recognized_names) ? body.recognized_names : [],
      face_similarity: typeof body.face_similarity === "number" ? body.face_similarity : null,
      frames: Array.isArray(body.frames) ? body.frames : [],
    });

    await env.VIDEO_DB.prepare(
      `INSERT OR IGNORE INTO video_events
       (event_id, site_id, cam_id, source_type, trigger_at, start_at, end_at, r2_key, status, meta_json, created_at, updated_at)
       VALUES (?, ?, ?, 'night_person_ai', ?, ?, ?, ?, 'ready', ?, ?, ?)`,
    )
      .bind(
        body.event_id,
        auth.siteId,
        body.cam_id,
        body.detected_at,
        body.detected_at,
        body.detected_at,
        body.r2_key,
        metaJson,
        now,
        now,
      )
      .run();

    const camRow = await env.VIDEO_DB.prepare("SELECT name FROM cameras WHERE cam_id = ?1 AND site_id = ?2")
      .bind(body.cam_id, auth.siteId)
      .first<{ name: string }>();

    const frames = Array.isArray(body.frames)
      ? body.frames
          .filter((f) => f && f.r2_key && isStrictIsoUtc(f.captured_at))
          .map((f) => ({
            label: f.label || "现场抓拍",
            r2Key: f.r2_key,
            capturedAtUtc: f.captured_at,
          }))
      : undefined;

    const channels = await handlePersonDetectionAlert(env, {
      eventId: body.event_id,
      siteId: auth.siteId,
      camId: body.cam_id,
      camName: camRow?.name ?? body.cam_id,
      r2Key: body.r2_key,
      detectedAtUtc: body.detected_at,
      personCount: Math.max(1, Number(body.person_count || 1)),
      maxConfidence: Number(body.max_confidence || 0),
      scheduleNote: body.schedule_note,
      frames,
      recognizedNames: Array.isArray(body.recognized_names) ? body.recognized_names : undefined,
      faceSimilarity: typeof body.face_similarity === "number" ? body.face_similarity : undefined,
    });

    return jsonResponse({ ok: true, event_id: body.event_id, channels }, 200, env.ALLOWED_ORIGINS);
  }

  return jsonResponse({ error: "Not Found" }, 404, env.ALLOWED_ORIGINS);
}
