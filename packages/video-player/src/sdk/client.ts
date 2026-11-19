export type CameraVisibility = "internal_ops" | "public_trace";
export type StreamMode = "snapshot" | "on-demand" | "continuous-hls" | "disabled";

export interface CameraInfo {
  cam_id: string;
  site_id: string;
  name: string;
  zone: string;
  visibility: CameraVisibility;
  stream_mode: StreamMode;
  online_status: string;
  last_seen_at: string | null;
}

export interface SnapshotItem {
  captured_at: string;
  size_bytes: number;
  width: number;
  height: number;
  url: string;
}

export interface LiveStreamResult {
  cam_id: string;
  status: "ready" | "waking";
  protocol: "hls";
  playback_url: string;
  expires_at: string;
}

export interface VideoGatewayClientOptions {
  gatewayUrl: string;
  siteId?: string;
  authToken?: string;
}

const STRICT_ISO_UTC_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

/** 将后端严格 ISO 8601 UTC 字符串格式化为浏览器本地时间 */
export function formatLocalTime(isoUtc: string | null | undefined): string {
  if (!isoUtc) return "";
  const d = new Date(isoUtc);
  return Number.isNaN(d.getTime()) ? isoUtc : d.toLocaleString("zh-CN", { hour12: false });
}

/** 校验时间字符串是否为严格 ISO 8601 UTC */
export function isStrictIsoUtc(value: string): boolean {
  return STRICT_ISO_UTC_RE.test(value) && !Number.isNaN(Date.parse(value));
}

/**
 * 纯无框架 Video Gateway SDK 客户端：
 * 可在 React、Vue、小程序或 Node/Workers 中直接复用，不耦合任何 UI 框架。
 */
export class VideoGatewayClient {
  private readonly baseUrl: string;
  private readonly siteId: string;
  private authToken?: string;

  constructor(options: VideoGatewayClientOptions) {
    this.baseUrl = options.gatewayUrl.replace(/\/+$/, "");
    this.siteId = options.siteId ?? "guangming-01";
    this.authToken = options.authToken;
  }

  setAuthToken(token?: string): void {
    this.authToken = token;
  }

  private getHeaders(): Record<string, string> {
    return this.authToken ? { Authorization: `Bearer ${this.authToken}` } : {};
  }

  async listCameras(): Promise<{ site_id: string; role: "internal" | "public"; cameras: CameraInfo[] }> {
    const res = await fetch(
      `${this.baseUrl}/api/v1/cameras?site_id=${encodeURIComponent(this.siteId)}`,
      { headers: this.getHeaders() },
    );
    if (!res.ok) throw new Error(`listCameras failed: HTTP ${res.status}`);
    return (await res.json()) as { site_id: string; role: "internal" | "public"; cameras: CameraInfo[] };
  }

  async getSnapshots(
    camId: string,
    opts?: { refresh?: boolean; start?: string; end?: string },
  ): Promise<{ cam_id: string; snapshots: SnapshotItem[] }> {
    const params = new URLSearchParams({ site_id: this.siteId });
    if (opts?.refresh) params.set("refresh", "1");
    if (opts?.start) params.set("start", opts.start);
    if (opts?.end) params.set("end", opts.end);

    const res = await fetch(
      `${this.baseUrl}/api/v1/snapshots/${encodeURIComponent(camId)}?${params.toString()}`,
      { headers: this.getHeaders() },
    );
    if (!res.ok) throw new Error(`getSnapshots failed: HTTP ${res.status}`);
    return (await res.json()) as { cam_id: string; snapshots: SnapshotItem[] };
  }

  async getLiveStream(camId: string): Promise<LiveStreamResult> {
    const res = await fetch(
      `${this.baseUrl}/api/v1/streams/${encodeURIComponent(camId)}/live?site_id=${encodeURIComponent(this.siteId)}`,
      { headers: this.getHeaders() },
    );
    if (!res.ok) throw new Error(`getLiveStream failed: HTTP ${res.status}`);
    return (await res.json()) as LiveStreamResult;
  }

  async getPlaybackStream(camId: string, start: string, end: string): Promise<{ playback_url: string }> {
    if (!isStrictIsoUtc(start) || !isStrictIsoUtc(end)) {
      throw new Error("start and end must be strict ISO 8601 UTC");
    }
    const params = new URLSearchParams({ site_id: this.siteId, start, end });
    const res = await fetch(
      `${this.baseUrl}/api/v1/streams/${encodeURIComponent(camId)}/playback?${params.toString()}`,
      { headers: this.getHeaders() },
    );
    if (!res.ok) throw new Error(`getPlaybackStream failed: HTTP ${res.status}`);
    return (await res.json()) as { playback_url: string };
  }
}
