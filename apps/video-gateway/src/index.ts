import { dispatchAlertNotifications, runHealthCheckAndAlert, runPeriodicFeishuDigest } from "./alerts";
import { handleAgentRoutes } from "./routes/agent";
import { handlePublicRoutes } from "./routes/public";
import { type Env, jsonResponse, nowIsoUtc } from "./types";

function isAuthorizedInternal(request: Request, env: Env): boolean {
  const expected = env.INTERNAL_API_KEY?.trim();
  if (!expected) return false;
  const auth = request.headers.get("Authorization") ?? "";
  return auth === `Bearer ${expected}`;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": env.ALLOWED_ORIGINS || "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
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
      if (url.pathname === "/api/internal/alerts/test" && request.method === "POST") {
        if (!isAuthorizedInternal(request, env)) {
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
        if (!isAuthorizedInternal(request, env)) {
          return jsonResponse({ error: "Unauthorized" }, 401, env.ALLOWED_ORIGINS);
        }
        const report = await runHealthCheckAndAlert(env);
        return jsonResponse({ ok: true, report }, 200, env.ALLOWED_ORIGINS);
      }

      if (url.pathname === "/api/internal/alerts/digest" && request.method === "POST") {
        if (!isAuthorizedInternal(request, env)) {
          return jsonResponse({ error: "Unauthorized" }, 401, env.ALLOWED_ORIGINS);
        }
        const digest = await runPeriodicFeishuDigest(env, true);
        return jsonResponse({ ok: digest.sent, digest }, digest.sent ? 200 : 500, env.ALLOWED_ORIGINS);
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
