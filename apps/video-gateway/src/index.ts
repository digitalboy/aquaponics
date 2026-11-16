import { handleAgentRoutes } from "./routes/agent";
import { handlePublicRoutes } from "./routes/public";
import { type Env, jsonResponse, nowIsoUtc } from "./types";

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
      if (url.pathname.startsWith("/api/internal/agent/")) {
        return await handleAgentRoutes(request, env, url.pathname);
      }
      return await handlePublicRoutes(request, env, url);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Internal Server Error";
      return jsonResponse({ error: message }, 500, env.ALLOWED_ORIGINS);
    }
  },
};
