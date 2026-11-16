import type { PlaybackTokenPayload } from "./types";

const encoder = new TextEncoder();

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function toBase64Url(input: Uint8Array): string {
  let str = "";
  for (const byte of input) str += String.fromCharCode(byte);
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(input: string): Uint8Array {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/") +
    "===".slice((input.length + 3) % 4);
  const bin = atob(padded);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

/** 常量时间字符串比对，防止时序侧信道攻击 */
function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

async function importHmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

/** 计算文本的 SHA-256 十六进制摘要 */
export async function sha256Hex(data: ArrayBuffer | string): Promise<string> {
  const buf = typeof data === "string" ? encoder.encode(data) : data;
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return toHex(hash);
}

/** 校验边缘 Agent 请求头中的 HMAC-SHA256 签名与时间窗 (±60s) */
export async function verifyAgentRequest(
  request: Request,
  secret: string,
  bodyHashHex: string,
): Promise<{ ok: true; siteId: string } | { ok: false; reason: string }> {
  const siteId = request.headers.get("X-Site-Id");
  const timestamp = request.headers.get("X-Timestamp");
  const signature = request.headers.get("X-Signature");

  if (!siteId || !timestamp || !signature) {
    return { ok: false, reason: "Missing X-Site-Id, X-Timestamp, or X-Signature" };
  }

  const tsMs = Date.parse(timestamp);
  if (Number.isNaN(tsMs) || Math.abs(Date.now() - tsMs) > 60_000) {
    return { ok: false, reason: "Timestamp expired or invalid" };
  }

  const url = new URL(request.url);
  const canonical = `${request.method.toUpperCase()}\n${url.pathname}\n${timestamp}\n${bodyHashHex}`;
  const key = await importHmacKey(secret);
  const expected = toHex(await crypto.subtle.sign("HMAC", key, encoder.encode(canonical)));

  if (!constantTimeEqual(expected, signature.toLowerCase())) {
    return { ok: false, reason: "Invalid HMAC signature" };
  }
  return { ok: true, siteId };
}

/** 签发短时效播放 Token */
export async function signPlaybackToken(
  payload: PlaybackTokenPayload,
  secret: string,
): Promise<string> {
  const bodyB64 = toBase64Url(encoder.encode(JSON.stringify(payload)));
  const key = await importHmacKey(secret);
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(bodyB64));
  return `${bodyB64}.${toBase64Url(new Uint8Array(sig))}`;
}

/** 验证短时效播放 Token 并返回载荷 */
export async function verifyPlaybackToken(
  token: string,
  secret: string,
): Promise<PlaybackTokenPayload | null> {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [bodyB64, sigB64] = parts;

  const key = await importHmacKey(secret);
  const expectedSig = toBase64Url(
    new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(bodyB64))),
  );
  if (!constantTimeEqual(expectedSig, sigB64)) return null;

  try {
    const parsed = JSON.parse(new TextDecoder().decode(fromBase64Url(bodyB64))) as PlaybackTokenPayload;
    if (typeof parsed.exp !== "number" || Date.now() / 1000 > parsed.exp) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}
