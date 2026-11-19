import { dispatchAlertNotifications, runHealthCheckAndAlert, runPeriodicFeishuDigest } from "./alerts";
import { decodeAdminToken, signAdminToken, verifyAdminToken } from "./crypto";
import { handleAgentRoutes } from "./routes/agent";
import { handleInternalFacesRoutes } from "./routes/faces";
import { handlePublicRoutes } from "./routes/public";
import { type Env, jsonResponse, nowIsoUtc } from "./types";

async function isAuthorizedInternal(request: Request, env: Env, url?: URL): Promise<boolean> {
  const auth = request.headers.get("Authorization") ?? "";
  const bearer = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  const token = bearer || (url?.searchParams.get("token") ?? "").trim();
  if (!token) return false;

  const expectedKey = env.INTERNAL_API_KEY?.trim();
  if (expectedKey && token === expectedKey) return true;

  const signingSecret = (env.SIGNING_SECRET || expectedKey || "").trim();
  if (signingSecret) {
    return verifyAdminToken(token, signingSecret);
  }
  return false;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": env.ALLOWED_ORIGINS || "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers":
            "Content-Type, Authorization, X-Site-Id, X-Timestamp, X-Signature",
        },
      });
    }

    const url = new URL(request.url);

    if (url.pathname === "/health" && request.method === "GET") {
      return jsonResponse(
        {
          service: "aquaponics-video-gateway",
          status: "ok",
          time: nowIsoUtc(),
        },
        200,
        env.ALLOWED_ORIGINS,
      );
    }

    try {
      if (url.pathname === "/api/auth/feishu/login" && request.method === "GET") {
        const appId = env.FEISHU_APP_ID?.trim();
        if (!appId) {
          return jsonResponse({ error: "FEISHU_APP_ID is not configured" }, 500, env.ALLOWED_ORIGINS);
        }
        const callbackUrl = `${url.origin}/api/auth/feishu/callback`;
        const redirectTarget = url.searchParams.get("redirect") || "https://video.guoshu.dev";
        const signingSecret = (env.SIGNING_SECRET || env.INTERNAL_API_KEY || appId).trim();
        const stateToken = await signAdminToken(signingSecret, 600, {
          open_id: redirectTarget,
          name: "oauth_state",
        });
        const authUrl = new URL("https://accounts.feishu.cn/open-apis/authen/v1/authorize");
        authUrl.searchParams.set("client_id", appId);
        authUrl.searchParams.set("response_type", "code");
        authUrl.searchParams.set("redirect_uri", callbackUrl);
        authUrl.searchParams.set("state", stateToken);
        return Response.redirect(authUrl.toString(), 302);
      }

      if (url.pathname === "/api/auth/feishu/callback" && request.method === "GET") {
        const code = url.searchParams.get("code") ?? "";
        const state = url.searchParams.get("state") ?? "";
        const errParam = url.searchParams.get("error") ?? "";
        const appId = env.FEISHU_APP_ID?.trim() ?? "";
        const appSecret = env.FEISHU_APP_SECRET?.trim() ?? "";
        const signingSecret = (env.SIGNING_SECRET || env.INTERNAL_API_KEY || appId).trim();

        const statePayload = state ? await decodeAdminToken(state, signingSecret) : null;
        const frontendOrigin = statePayload?.open_id?.startsWith("http")
          ? statePayload.open_id
          : "https://video.guoshu.dev";

        if (errParam || !code || !statePayload || statePayload.name !== "oauth_state") {
          return Response.redirect(
            `${frontendOrigin}/?auth_error=${encodeURIComponent(errParam || "飞书授权已取消或状态已过期")}#admin`,
            302,
          );
        }

        const callbackUrl = `${url.origin}/api/auth/feishu/callback`;
        const tokenRes = await fetch("https://accounts.feishu.cn/oauth/v3/token", {
          method: "POST",
          headers: { "Content-Type": "application/json; charset=utf-8" },
          body: JSON.stringify({
            grant_type: "authorization_code",
            client_id: appId,
            client_secret: appSecret,
            code,
            redirect_uri: callbackUrl,
          }),
        });
        const tokenJson = (await tokenRes.json()) as {
          code?: number;
          access_token?: string;
          error_description?: string;
          msg?: string;
        };
        if (!tokenRes.ok || !tokenJson.access_token) {
          return Response.redirect(
            `${frontendOrigin}/?auth_error=${encodeURIComponent(tokenJson.error_description || tokenJson.msg || "换取飞书用户令牌失败")}#admin`,
            302,
          );
        }

        const userRes = await fetch("https://open.feishu.cn/open-apis/authen/v1/user_info", {
          headers: { Authorization: `Bearer ${tokenJson.access_token}` },
        });
        const userJson = (await userRes.json()) as {
          code?: number;
          msg?: string;
          data?: { open_id?: string; name?: string; avatar_url?: string };
        };
        const user = userJson.data;
        if (!userRes.ok || userJson.code !== 0 || !user?.open_id) {
          return Response.redirect(
            `${frontendOrigin}/?auth_error=${encodeURIComponent(userJson.msg || "获取飞书用户信息失败")}#admin`,
            302,
          );
        }

        const allowList = (env.ADMIN_FEISHU_OPEN_IDS ?? "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        if (allowList.length > 0 && !allowList.includes(user.open_id)) {
          return Response.redirect(
            `${frontendOrigin}/?auth_error=${encodeURIComponent(`账号「${user.name ?? user.open_id}」无后台管理权限`)}#admin`,
            302,
          );
        }

        const adminToken = await signAdminToken(signingSecret, 30 * 86400, {
          open_id: user.open_id,
          name: user.name || "飞书管理员",
          avatar_url: user.avatar_url,
        });
        return Response.redirect(
          `${frontendOrigin}/?feishu_token=${encodeURIComponent(adminToken)}#admin`,
          302,
        );
      }

      if (url.pathname === "/api/internal/admin/me" && request.method === "GET") {
        if (!(await isAuthorizedInternal(request, env, url))) {
          return jsonResponse({ error: "Unauthorized" }, 401, env.ALLOWED_ORIGINS);
        }
        const auth = request.headers.get("Authorization") ?? "";
        const bearer = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
        const signingSecret = (env.SIGNING_SECRET || env.INTERNAL_API_KEY || "").trim();
        const payload = bearer && signingSecret ? await decodeAdminToken(bearer, signingSecret) : null;
        return jsonResponse(
          {
            ok: true,
            user: payload
              ? { name: payload.name || "管理员", open_id: payload.open_id, avatar_url: payload.avatar_url, exp: payload.exp }
              : { name: "管理员" },
          },
          200,
          env.ALLOWED_ORIGINS,
        );
      }

      if (url.pathname === "/api/internal/admin/login" && request.method === "POST") {
        const body = (await request.json().catch(() => ({}))) as { password?: string };
        const expectedPass = (env.ADMIN_PASSWORD || env.INTERNAL_API_KEY || "").trim();
        if (!expectedPass || !body.password || body.password !== expectedPass) {
          return jsonResponse({ error: "口令错误" }, 401, env.ALLOWED_ORIGINS);
        }
        const signingSecret = (env.SIGNING_SECRET || env.INTERNAL_API_KEY || expectedPass).trim();
        const token = await signAdminToken(signingSecret, 30 * 86400, {
          open_id: "password",
          name: "口令管理员",
        });
        return jsonResponse({ ok: true, token, expires_in: 30 * 86400 }, 200, env.ALLOWED_ORIGINS);
      }

      if (url.pathname === "/api/internal/alerts/test" && request.method === "POST") {
        if (!(await isAuthorizedInternal(request, env, url))) {
          return jsonResponse({ error: "Unauthorized" }, 401, env.ALLOWED_ORIGINS);
        }
        const now = nowIsoUtc();
        const channels = await dispatchAlertNotifications(env, {
          alertKey: `manual_test:${now}`,
          siteId: env.DEFAULT_SITE_ID || "guangming-01",
          severity: "info",
          title: "🔔 监控告警通道测试通知",
          summary: "这是一条来自国数AI农业视频网关的测试消息，用于验证飞书群机器人与邮件告警通道。",
          occurredAtUtc: now,
          details: [
            { label: "触发方式", value: "管理员手动测试" },
            { label: "巡检周期", value: "每 2 分钟自动检查一次" },
          ],
        });
        return jsonResponse({ ok: true, testedAt: now, channels }, 200, env.ALLOWED_ORIGINS);
      }

      if (url.pathname === "/api/internal/alerts/check" && request.method === "POST") {
        if (!(await isAuthorizedInternal(request, env, url))) {
          return jsonResponse({ error: "Unauthorized" }, 401, env.ALLOWED_ORIGINS);
        }
        const report = await runHealthCheckAndAlert(env);
        return jsonResponse({ ok: true, report }, 200, env.ALLOWED_ORIGINS);
      }

      if (url.pathname === "/api/internal/alerts/digest" && request.method === "POST") {
        if (!(await isAuthorizedInternal(request, env, url))) {
          return jsonResponse({ error: "Unauthorized" }, 401, env.ALLOWED_ORIGINS);
        }
        const digest = await runPeriodicFeishuDigest(env, true);
        return jsonResponse({ ok: digest.sent, digest }, digest.sent ? 200 : 500, env.ALLOWED_ORIGINS);
      }

      if (url.pathname.startsWith("/api/internal/faces") || url.pathname === "/api/internal/events/night-ai") {
        if (!(await isAuthorizedInternal(request, env, url))) {
          return jsonResponse({ error: "Unauthorized" }, 401, env.ALLOWED_ORIGINS);
        }
        return await handleInternalFacesRoutes(request, env, url);
      }

      if (url.pathname.startsWith("/api/internal/agent/")) {
        return await handleAgentRoutes(request, env, url.pathname);
      }
      return await handlePublicRoutes(request, env, url);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Internal Server Error";
      return jsonResponse({ error: message }, 500, env.ALLOWED_ORIGINS);
    }
  },

  async scheduled(_event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(
      Promise.all([
        runHealthCheckAndAlert(env),
        runPeriodicFeishuDigest(env),
      ]),
    );
  },
};
