/**
 * Cloudflare Pages Functions 统一鉴权与 CORS 辅助模块
 * 基于 Web Crypto API + Google JWKS 公钥校验 Firebase ID Token
 */

export interface FunctionsEnv {
  DB: D1Database;
  FIREBASE_PROJECT_ID?: string;
  ALLOWED_ORIGIN?: string;
}

export interface AuthenticatedUser {
  uid: string;
  email?: string;
}

interface GoogleJwk extends JsonWebKey {
  kid: string;
  alg?: string;
  use?: string;
}

const DEFAULT_FIREBASE_PROJECT_ID = 'beike-e6301';
const GOOGLE_JWK_URL =
  'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com';

const DEFAULT_ALLOWED_ORIGINS = new Set([
  'https://elecpal.beikee.org',
  'https://aquaponics-elecpal.pages.dev'
]);

let cachedJwks: { keys: GoogleJwk[]; expiresAt: number } | null = null;

function isAllowedOrigin(origin: string, env?: FunctionsEnv): boolean {
  if (DEFAULT_ALLOWED_ORIGINS.has(origin)) return true;
  if (env?.ALLOWED_ORIGIN) {
    const customOrigins = env.ALLOWED_ORIGIN.split(',').map(s => s.trim()).filter(Boolean);
    if (customOrigins.includes(origin)) return true;
  }
  // 允许本地开发服务器 (localhost / 127.0.0.1)
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
}

export function buildCorsHeaders(
  request: Request,
  methods: string,
  env?: FunctionsEnv
): Record<string, string> {
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': methods,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
    Vary: 'Origin'
  };

  const origin = request.headers.get('Origin');
  if (origin && isAllowedOrigin(origin, env)) {
    headers['Access-Control-Allow-Origin'] = origin;
  }

  return headers;
}

export function jsonResponse(
  payload: unknown,
  status: number,
  corsHeaders: Record<string, string>
): Response {
  return new Response(JSON.stringify(payload), { status, headers: corsHeaders });
}

function base64UrlToUint8Array(input: string): Uint8Array {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  const padding = '='.repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(normalized + padding);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function decodeJwtPart<T>(segment: string): T {
  const bytes = base64UrlToUint8Array(segment);
  const json = new TextDecoder().decode(bytes);
  return JSON.parse(json) as T;
}

async function getGoogleJwks(forceRefresh = false): Promise<GoogleJwk[]> {
  const now = Date.now();
  if (!forceRefresh && cachedJwks && cachedJwks.expiresAt > now) {
    return cachedJwks.keys;
  }

  const res = await fetch(GOOGLE_JWK_URL);
  if (!res.ok) {
    throw new Error(`无法获取 Google JWK 公钥: HTTP ${res.status}`);
  }

  const cacheControl = res.headers.get('Cache-Control') || '';
  const maxAgeMatch = cacheControl.match(/max-age=(\d+)/i);
  const ttlMs = maxAgeMatch ? Number(maxAgeMatch[1]) * 1000 : 3600 * 1000;

  const data = (await res.json()) as { keys?: GoogleJwk[] };
  if (!Array.isArray(data.keys) || data.keys.length === 0) {
    throw new Error('Google JWK 响应格式无效');
  }

  cachedJwks = {
    keys: data.keys,
    expiresAt: now + ttlMs
  };
  return data.keys;
}

/**
 * 校验 Authorization: Bearer <Firebase ID Token>
 * 验证成功返回 { uid, email }，失败返回 null
 */
export async function verifyFirebaseToken(
  request: Request,
  env?: FunctionsEnv
): Promise<AuthenticatedUser | null> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.slice('Bearer '.length).trim();
  const parts = token.split('.');
  if (parts.length !== 3) {
    return null;
  }

  try {
    const [headerSeg, payloadSeg, sigSeg] = parts;
    const header = decodeJwtPart<{ alg?: string; kid?: string }>(headerSeg);
    if (header.alg !== 'RS256' || !header.kid) {
      return null;
    }

    const payload = decodeJwtPart<{
      aud?: string;
      iss?: string;
      sub?: string;
      email?: string;
      exp?: number;
      iat?: number;
    }>(payloadSeg);

    const projectId = env?.FIREBASE_PROJECT_ID || DEFAULT_FIREBASE_PROJECT_ID;
    const nowSec = Math.floor(Date.now() / 1000);

    if (
      payload.aud !== projectId ||
      payload.iss !== `https://securetoken.google.com/${projectId}` ||
      typeof payload.sub !== 'string' ||
      payload.sub.length === 0 ||
      typeof payload.exp !== 'number' ||
      payload.exp <= nowSec - 30 ||
      typeof payload.iat !== 'number' ||
      payload.iat > nowSec + 60
    ) {
      return null;
    }

    let keys = await getGoogleJwks();
    let jwk = keys.find(k => k.kid === header.kid);
    if (!jwk) {
      // Google 密钥轮换时强制刷新一次公钥缓存
      keys = await getGoogleJwks(true);
      jwk = keys.find(k => k.kid === header.kid);
      if (!jwk) {
        return null;
      }
    }

    const cryptoKey = await crypto.subtle.importKey(
      'jwk',
      jwk,
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const signingInput = new TextEncoder().encode(`${headerSeg}.${payloadSeg}`);
    const signature = base64UrlToUint8Array(sigSeg);

    const valid = await crypto.subtle.verify(
      'RSASSA-PKCS1-v1_5',
      cryptoKey,
      signature as BufferSource,
      signingInput as BufferSource
    );

    if (!valid) {
      return null;
    }

    return {
      uid: payload.sub,
      email: payload.email
    };
  } catch {
    return null;
  }
}

/**
 * 统一鉴权守卫：未通过时直接返回 401 Response
 */
export async function requireAuth(
  request: Request,
  env: FunctionsEnv,
  corsHeaders: Record<string, string>
): Promise<{ user: AuthenticatedUser } | { response: Response }> {
  const user = await verifyFirebaseToken(request, env);
  if (!user) {
    return {
      response: jsonResponse(
        { success: false, error: '未授权访问：请先登录 Firebase 账号' },
        401,
        corsHeaders
      )
    };
  }
  return { user };
}
