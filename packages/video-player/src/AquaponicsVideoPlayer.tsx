import Hls from "hls.js";
import { useEffect, useRef, useState } from "react";

export type VideoPlayerMode = "live" | "playback" | "snapshot";

export interface AquaponicsVideoPlayerProps {
  /** Video Gateway 基础地址，如 https://video-gw.example.com */
  gatewayUrl: string;
  /** 机位 ID，如 CAM-FISH-PAN-01 */
  camId: string;
  siteId?: string;
  mode?: VideoPlayerMode;
  /** 内部运维系统传入的 Bearer Token；C 端公开溯源机位可留空 */
  authToken?: string;
  /** 回放起始时间（严格 ISO 8601 UTC） */
  playbackStart?: string;
  /** 回放结束时间（严格 ISO 8601 UTC） */
  playbackEnd?: string;
  /** 可选右下角溯源/站点水印文本 */
  watermark?: string;
  className?: string;
}

interface LiveResponse {
  cam_id: string;
  status: "ready" | "waking";
  playback_url: string;
}

interface SnapshotResponse {
  snapshots: Array<{ captured_at: string; url: string }>;
}

/**
 * 鱼菜共生全厂视频微服务统一前端嵌入播放器：
 * 支持 live (含 on-demand 4G 按需唤醒轮询)、playback (UTC 区间回放) 与 snapshot (4G 省流最新快照)。
 */
export function AquaponicsVideoPlayer({
  gatewayUrl,
  camId,
  siteId = "guangming-01",
  mode = "live",
  authToken,
  playbackStart,
  playbackEnd,
  watermark,
  className = "",
}: AquaponicsVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [status, setStatus] = useState<"loading" | "waking" | "ready" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [streamUrl, setStreamUrl] = useState<string>("");
  const [snapshotUrl, setSnapshotUrl] = useState<string>("");
  const [capturedAt, setCapturedAt] = useState<string>("");

  const base = gatewayUrl.replace(/\/+$/, "");

  useEffect(() => {
    let cancelled = false;
    let pollTimer: number | undefined;

    const headers: Record<string, string> = {};
    if (authToken) headers.Authorization = `Bearer ${authToken}`;

    async function load() {
      setStatus("loading");
      setErrorMsg("");

      try {
        if (mode === "snapshot") {
          const res = await fetch(
            `${base}/api/v1/snapshots/${encodeURIComponent(camId)}?site_id=${encodeURIComponent(siteId)}`,
            { headers },
          );
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data = (await res.json()) as SnapshotResponse;
          if (cancelled) return;
          if (data.snapshots.length === 0) {
            setErrorMsg("暂无快照数据");
            setStatus("error");
            return;
          }
          setSnapshotUrl(data.snapshots[0].url);
          setCapturedAt(data.snapshots[0].captured_at);
          setStatus("ready");
          return;
        }

        if (mode === "playback") {
          if (!playbackStart || !playbackEnd) {
            throw new Error("回放模式必须提供 playbackStart 与 playbackEnd (ISO 8601 UTC)");
          }
          const res = await fetch(
            `${base}/api/v1/streams/${encodeURIComponent(camId)}/playback?site_id=${encodeURIComponent(siteId)}&start=${encodeURIComponent(playbackStart)}&end=${encodeURIComponent(playbackEnd)}`,
            { headers },
          );
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data = (await res.json()) as { playback_url: string };
          if (cancelled) return;
          setStreamUrl(data.playback_url);
          setStatus("ready");
          return;
        }

        // live 模式：若处于 on-demand 休眠则每 2s 轮询唤醒状态
        const res = await fetch(
          `${base}/api/v1/streams/${encodeURIComponent(camId)}/live?site_id=${encodeURIComponent(siteId)}`,
          { headers },
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as LiveResponse;
        if (cancelled) return;

        if (data.status === "waking") {
          setStatus("waking");
          pollTimer = window.setTimeout(load, 2000);
          return;
        }
        setStreamUrl(data.playback_url);
        setStatus("ready");
      } catch (err) {
        if (cancelled) return;
        setErrorMsg(err instanceof Error ? err.message : "加载失败");
        setStatus("error");
      }
    }

    load();
    return () => {
      cancelled = true;
      if (pollTimer !== undefined) window.clearTimeout(pollTimer);
    };
  }, [base, camId, siteId, mode, authToken, playbackStart, playbackEnd]);

  useEffect(() => {
    if (mode === "snapshot" || status !== "ready" || !streamUrl || !videoRef.current) return;
    const video = videoRef.current;

    if (Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      return () => hls.destroy();
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
    }
  }, [mode, status, streamUrl]);

  return (
    <div
      className={`relative aspect-video w-full overflow-hidden rounded-lg border border-border bg-zinc-950 text-zinc-100 ${className}`}
    >
      {mode === "snapshot" && snapshotUrl ? (
        <img src={snapshotUrl} alt={camId} className="h-full w-full object-cover" />
      ) : (
        <video ref={videoRef} controls autoPlay muted playsInline className="h-full w-full object-cover" />
      )}

      {(status === "loading" || status === "waking") && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/75 text-xs">
          <span className="font-medium">
            {status === "waking" ? "正在唤醒 4G 边缘推流..." : "正在加载视频通道..."}
          </span>
          <span className="mt-1 text-zinc-400">{camId}</span>
        </div>
      )}

      {status === "error" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/85 p-4 text-center text-xs">
          <span className="font-medium text-red-400">通道不可用：{errorMsg}</span>
          <span className="mt-1 text-zinc-400">{camId}</span>
        </div>
      )}

      {(watermark || capturedAt) && (
        <div className="pointer-events-none absolute right-2 bottom-2 rounded bg-black/60 px-2 py-0.5 text-[11px] text-zinc-200">
          {watermark ? `${watermark} · ` : ""}
          {capturedAt || camId}
        </div>
      )}
    </div>
  );
}
