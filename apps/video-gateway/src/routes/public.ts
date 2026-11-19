import { signPlaybackToken, verifyPlaybackToken } from "../crypto";
import { renderMonitorHtml } from "../monitorHtml";
import { type CameraRow, type Env, isStrictIsoUtc, jsonResponse, nowIsoUtc } from "../types";

function getCallerRole(request: Request, env: Env): "internal" | "public" {
  const auth = request.headers.get("Authorization") || "";
  if (env.INTERNAL_API_KEY && auth === `Bearer ${env.INTERNAL_API_KEY}`) {
    return "internal";
  }
  return "public";
}

function buildContentType(key: string): string {
  if (key.endsWith(".ts")) return "video/mp2t";
  if (key.endsWith(".jpg") || key.endsWith(".jpeg")) return "image/jpeg";
  if (key.endsWith(".mp4")) return "video/mp4";
  return "application/octet-stream";
}

/** 处理多系统嵌入对外 API 与短时效签名媒体代理 */
export async function handlePublicRoutes(
  request: Request,
  env: Env,
  url: URL,
): Promise<Response> {
  const pathname = url.pathname;
  if ((pathname === "/monitor" || pathname === "/") && request.method === "GET") {
    return new Response(renderMonitorHtml(), {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  const role = getCallerRole(request, env);
  const siteId = url.searchParams.get("site_id") || env.DEFAULT_SITE_ID || "guangming-01";
  const signingSecret = env.SIGNING_SECRET || "dev-insecure-signing-secret";
  const tokenTtlSec = Number(env.TOKEN_TTL_SEC || "600");

  // 1. 机位目录查询
  // 【一期免鉴权说明】当前调试/演示阶段暂不强制拦截 internal_ops 机位，任何人打开网页即可查看已启用机位；
  // 未来正式面向 C 端开放公网溯源时，恢复下方 `role === "public" ? "public_trace" : requestedVis` 过滤即可。
  if (pathname === "/api/v1/cameras" && request.method === "GET") {
    const requestedVis = url.searchParams.get("visibility");
    const effectiveVis = requestedVis;

    const query = effectiveVis
      ? env.VIDEO_DB.prepare(
          "SELECT cam_id, site_id, name, zone, visibility, stream_mode, online_status, last_seen_at FROM cameras WHERE site_id = ? AND visibility = ? ORDER BY cam_id",
        ).bind(siteId, effectiveVis)
      : env.VIDEO_DB.prepare(
          "SELECT cam_id, site_id, name, zone, visibility, stream_mode, online_status, last_seen_at FROM cameras WHERE site_id = ? ORDER BY cam_id",
        ).bind(siteId);

    const { results } = await query.all();
    return jsonResponse({ site_id: siteId, role, cameras: results }, 200, env.ALLOWED_ORIGINS);
  }

  // 2. 实时流/按需唤醒播放接口
  const liveMatch = pathname.match(/^\/api\/v1\/streams\/([^/]+)\/live$/);
  if (liveMatch && request.method === "GET") {
    const camId = decodeURIComponent(liveMatch[1]);
    const cam = await env.VIDEO_DB.prepare(
      "SELECT * FROM cameras WHERE cam_id = ? AND site_id = ?",
    )
      .bind(camId, siteId)
      .first<CameraRow>();

    if (!cam) return jsonResponse({ error: "Camera not found" }, 404, env.ALLOWED_ORIGINS);
    // 【一期免鉴权说明】正式上线 C 端权限隔离时取消下方注释：
    // if (role === "public" && cam.visibility !== "public_trace") {
    //   return jsonResponse({ error: "Forbidden: internal_ops camera" }, 403, env.ALLOWED_ORIGINS);
    // }
    if (cam.stream_mode === "disabled") {
      return jsonResponse({ error: "Camera stream is disabled" }, 409, env.ALLOWED_ORIGINS);
    }

    const now = nowIsoUtc();
    await env.VIDEO_DB.prepare("UPDATE cameras SET last_viewed_at = ? WHERE cam_id = ?")
      .bind(now, camId)
      .run();

    let status: "ready" | "waking" = "ready";
    if (cam.stream_mode === "on-demand") {
      const recentCutoff = new Date(Date.now() - 20_000).toISOString();
      const recentSeg = await env.VIDEO_DB.prepare(
        "SELECT id FROM hls_segments WHERE site_id = ? AND cam_id = ? AND start_at >= ? LIMIT 1",
      )
        .bind(siteId, camId, recentCutoff)
        .first();

      if (!recentSeg) {
        status = "waking";
        const cmdId = `CMD-WAKE-${Date.now()}-${camId}`;
        const expires = new Date(Date.now() + 60_000).toISOString();
        await env.VIDEO_DB.prepare(
          "INSERT OR IGNORE INTO agent_commands (cmd_id, site_id, cam_id, action, payload_json, status, expires_at, created_at) VALUES (?, ?, ?, 'wake_live', ?, 'pending', ?, ?)",
        )
          .bind(
            cmdId,
            siteId,
            camId,
            JSON.stringify({ ttl_sec: Number(env.WAKE_TTL_SEC || "180"), segment_sec: 4 }),
            expires,
            now,
          )
          .run();
      }
    }

    const exp = Math.floor(Date.now() / 1000) + tokenTtlSec;
    const token = await signPlaybackToken({ cam_id: camId, site_id: siteId, scope: "live", exp }, signingSecret);
    return jsonResponse(
      {
        cam_id: camId,
        status,
        protocol: "hls",
        playback_url: `${url.origin}/sign/${token}/hls/${encodeURIComponent(camId)}/live.m3u8`,
        expires_at: new Date(exp * 1000).toISOString(),
      },
      200,
      env.ALLOWED_ORIGINS,
    );
  }

  // 3. 历史回放接口 (严格校验 ISO 8601 UTC)
  const playbackMatch = pathname.match(/^\/api\/v1\/streams\/([^/]+)\/playback$/);
  if (playbackMatch && request.method === "GET") {
    const camId = decodeURIComponent(playbackMatch[1]);
    const start = url.searchParams.get("start") || "";
    const end = url.searchParams.get("end") || "";
    if (!isStrictIsoUtc(start) || !isStrictIsoUtc(end)) {
      return jsonResponse({ error: "start and end must be strict ISO 8601 UTC" }, 400, env.ALLOWED_ORIGINS);
    }

    const cam = await env.VIDEO_DB.prepare("SELECT visibility FROM cameras WHERE cam_id = ? AND site_id = ?")
      .bind(camId, siteId)
      .first<Pick<CameraRow, "visibility">>();
    if (!cam) return jsonResponse({ error: "Camera not found" }, 404, env.ALLOWED_ORIGINS);
    // 【一期免鉴权说明】正式上线 C 端权限隔离时恢复此校验：
    // if (role === "public" && cam.visibility !== "public_trace") {
    //   return jsonResponse({ error: "Forbidden: internal_ops camera" }, 403, env.ALLOWED_ORIGINS);
    // }

    const exp = Math.floor(Date.now() / 1000) + tokenTtlSec;
    const token = await signPlaybackToken({ cam_id: camId, site_id: siteId, scope: "playback", exp }, signingSecret);
    return jsonResponse(
      {
        cam_id: camId,
        playback_url: `${url.origin}/sign/${token}/hls/${encodeURIComponent(camId)}/playback.m3u8?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`,
        expires_at: new Date(exp * 1000).toISOString(),
      },
      200,
      env.ALLOWED_ORIGINS,
    );
  }

  // 4. 延时快照列表查询
  const snapMatch = pathname.match(/^\/api\/v1\/snapshots\/([^/]+)$/);
  if (snapMatch && request.method === "GET") {
    const camId = decodeURIComponent(snapMatch[1]);
    const cam = await env.VIDEO_DB.prepare("SELECT visibility FROM cameras WHERE cam_id = ? AND site_id = ?")
      .bind(camId, siteId)
      .first<Pick<CameraRow, "visibility">>();
    if (!cam) return jsonResponse({ error: "Camera not found" }, 404, env.ALLOWED_ORIGINS);
    // 【一期免鉴权说明】正式上线 C 端权限隔离时恢复此校验：
    // if (role === "public" && cam.visibility !== "public_trace") {
    //   return jsonResponse({ error: "Forbidden: internal_ops camera" }, 403, env.ALLOWED_ORIGINS);
    // }

    const start = url.searchParams.get("start") || "1970-01-01T00:00:00.000Z";
    const end = url.searchParams.get("end") || nowIsoUtc();
    if (!isStrictIsoUtc(start) || !isStrictIsoUtc(end)) {
      return jsonResponse({ error: "start and end must be strict ISO 8601 UTC" }, 400, env.ALLOWED_ORIGINS);
    }

    // 过滤 <8KB 的灰屏无效帧（如 RTSP 首帧未等来完整 I 帧导致的 2KB 灰图）
    const { results } = await env.VIDEO_DB.prepare(
      "SELECT r2_key, captured_at, size_bytes, width, height FROM snapshots WHERE site_id = ? AND cam_id = ? AND size_bytes >= 8192 AND captured_at BETWEEN ? AND ? ORDER BY captured_at DESC LIMIT 100",
    )
      .bind(siteId, camId, start, end)
      .all<{ r2_key: string; captured_at: string; size_bytes: number; width: number; height: number }>();

    // 若前端浏览携带 refresh=1，则按 12 秒防抖下发一次 capture_now 指令，实现“看时 15s 刷新、不看不费流量”
    if (url.searchParams.get("refresh") === "1") {
      const debounceCutoff = new Date(Date.now() - 12_000).toISOString();
      const latestCaptured = results[0]?.captured_at || "";
      if (latestCaptured < debounceCutoff) {
        const recentCmd = await env.VIDEO_DB.prepare(
          "SELECT cmd_id FROM agent_commands WHERE site_id = ? AND cam_id = ? AND action = 'capture_now' AND created_at >= ? LIMIT 1",
        )
          .bind(siteId, camId, debounceCutoff)
          .first();
        if (!recentCmd) {
          const now = nowIsoUtc();
          const cmdId = `CMD-CAP-${Date.now()}-${camId}`;
          const expires = new Date(Date.now() + 30_000).toISOString();
          await env.VIDEO_DB.prepare(
            "INSERT OR IGNORE INTO agent_commands (cmd_id, site_id, cam_id, action, payload_json, status, expires_at, created_at) VALUES (?, ?, ?, 'capture_now', '{}', 'pending', ?, ?)",
          )
            .bind(cmdId, siteId, camId, expires, now)
            .run();
        }
      }
    }

    const exp = Math.floor(Date.now() / 1000) + tokenTtlSec;
    const token = await signPlaybackToken({ cam_id: camId, site_id: siteId, scope: "snapshot", exp }, signingSecret);

    return jsonResponse(
      {
        cam_id: camId,
        snapshots: results.map((s) => ({
          captured_at: s.captured_at,
          size_bytes: s.size_bytes,
          width: s.width,
          height: s.height,
          url: `${url.origin}/sign/${token}/raw/${s.r2_key}`,
        })),
      },
      200,
      env.ALLOWED_ORIGINS,
    );
  }

  // 5. 签名媒体代理与动态 .m3u8 拼接
  const signMatch = pathname.match(/^\/sign\/([^/]+)\/(.+)$/);
  if (signMatch && request.method === "GET") {
    const token = signMatch[1];
    const restPath = signMatch[2];
    const payload = await verifyPlaybackToken(token, signingSecret);
    if (!payload) return jsonResponse({ error: "Invalid or expired playback token" }, 403, env.ALLOWED_ORIGINS);

    if (restPath.endsWith("/live.m3u8")) {
      await env.VIDEO_DB.prepare("UPDATE cameras SET last_viewed_at = ? WHERE cam_id = ?")
        .bind(nowIsoUtc(), payload.cam_id)
        .run();

      const { results: segs } = await env.VIDEO_DB.prepare(
        "SELECT id, r2_key, duration_sec FROM hls_segments WHERE site_id = ? AND cam_id = ? ORDER BY start_at DESC LIMIT 6",
      )
        .bind(payload.site_id, payload.cam_id)
        .all<{ id: number; r2_key: string; duration_sec: number }>();

      const ordered = segs.reverse();
      const firstSeq = ordered[0]?.id ?? 1;
      const lines = [
        "#EXTM3U",
        "#EXT-X-VERSION:3",
        "#EXT-X-TARGETDURATION:10",
        `#EXT-X-MEDIA-SEQUENCE:${firstSeq}`,
      ];
      for (const seg of ordered) {
        lines.push(`#EXTINF:${seg.duration_sec.toFixed(3)},`);
        lines.push(`${url.origin}/sign/${token}/raw/${seg.r2_key}`);
      }
      return new Response(lines.join("\n") + "\n", {
        status: 200,
        headers: {
          "Content-Type": "application/vnd.apple.mpegurl; charset=utf-8",
          "Cache-Control": "no-store",
          "Access-Control-Allow-Origin": env.ALLOWED_ORIGINS,
        },
      });
    }

    if (restPath.endsWith("/playback.m3u8")) {
      const start = url.searchParams.get("start") || "";
      const end = url.searchParams.get("end") || "";
      if (!isStrictIsoUtc(start) || !isStrictIsoUtc(end)) {
        return jsonResponse({ error: "Invalid start/end" }, 400, env.ALLOWED_ORIGINS);
      }

      const { results: segs } = await env.VIDEO_DB.prepare(
        "SELECT r2_key, duration_sec FROM hls_segments WHERE site_id = ? AND cam_id = ? AND start_at BETWEEN ? AND ? ORDER BY start_at ASC LIMIT 300",
      )
        .bind(payload.site_id, payload.cam_id, start, end)
        .all<{ r2_key: string; duration_sec: number }>();

      const lines = [
        "#EXTM3U",
        "#EXT-X-VERSION:3",
        "#EXT-X-TARGETDURATION:30",
        "#EXT-X-PLAYLIST-TYPE:VOD",
      ];
      for (const seg of segs) {
        lines.push(`#EXTINF:${seg.duration_sec.toFixed(3)},`);
        lines.push(`${url.origin}/sign/${token}/raw/${seg.r2_key}`);
      }
      lines.push("#EXT-X-ENDLIST");
      return new Response(lines.join("\n") + "\n", {
        status: 200,
        headers: {
          "Content-Type": "application/vnd.apple.mpegurl; charset=utf-8",
          "Access-Control-Allow-Origin": env.ALLOWED_ORIGINS,
        },
      });
    }

    if (restPath.startsWith("raw/")) {
      const r2Key = restPath.slice("raw/".length);
      if (!r2Key.includes(`/${payload.cam_id}/`)) {
        return jsonResponse({ error: "Token scope mismatch" }, 403, env.ALLOWED_ORIGINS);
      }
      const obj = await env.VIDEO_R2.get(r2Key);
      if (!obj) return jsonResponse({ error: "Media object not found" }, 404, env.ALLOWED_ORIGINS);

      return new Response(obj.body, {
        status: 200,
        headers: {
          "Content-Type": buildContentType(r2Key),
          "Cache-Control": "public, max-age=300",
          "Access-Control-Allow-Origin": env.ALLOWED_ORIGINS,
        },
      });
    }
  }

  return jsonResponse({ error: "Not Found" }, 404, env.ALLOWED_ORIGINS);
}
