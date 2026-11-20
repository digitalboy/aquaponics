import Hls from "hls.js";
import { Loader2, VideoOff } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@aquaponics/ui";
import { formatLocalTime, VideoGatewayClient } from "./sdk/client";

export type VideoPlayerMode = "live" | "playback" | "snapshot";

export interface AquaponicsVideoPlayerProps {
  /** Video Gateway 基础地址，如 https://video-gw.guoshu.dev */
  gatewayUrl: string;
  /** 机位 ID，如 CAM-GATE-IN-01 */
  camId: string;
  siteId?: string;
  mode?: VideoPlayerMode;
  /** 内部运维系统传入的 Bearer Token；C 端公开溯源机位可留空 */
  authToken?: string;
  /** 快照自动刷新周期（秒），0 表示关闭自动刷新；切后台时自动暂停以省 4G 流量 */
  autoRefreshSec?: number;
  /** 回放起始时间（严格 ISO 8601 UTC） */
  playbackStart?: string;
  /** 回放结束时间（严格 ISO 8601 UTC） */
  playbackEnd?: string;
  /** 可选右下角溯源/站点水印文本 */
  watermark?: string;
  /** 手动刷新触发计数器，外部按钮递增即可立即抓拍刷新 */
  refreshNonce?: number;
  /** 点击画面区域回调（如打开历史图片时序播放弹窗） */
  onClick?: () => void;
  className?: string;
}

/**
 * 鱼菜共生全厂视频微服务统一前端嵌入播放器 (Tailwind CSS v4 + shadcn/ui 风格)：
 * - snapshot 模式：默认 15s 前台自动抓拍刷新，左下角展示旋转倒计时圆环，时间自动转为浏览器本地时间；
 * - live / playback 模式：完整保留 HLS.js 与 on-demand 4G 按需唤醒轮询能力。
 */
export function AquaponicsVideoPlayer({
  gatewayUrl,
  camId,
  siteId = "guangming-01",
  mode = "snapshot",
  authToken,
  autoRefreshSec = 15,
  playbackStart,
  playbackEnd,
  watermark,
  refreshNonce = 0,
  onClick,
  className = "",
}: AquaponicsVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const lastCapturedRef = useRef<string>("");

  const [status, setStatus] = useState<"loading" | "waking" | "ready" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [streamUrl, setStreamUrl] = useState<string>("");
  const [snapshotUrl, setSnapshotUrl] = useState<string>("");
  const [capturedAt, setCapturedAt] = useState<string>("");
  const [sizeKb, setSizeKb] = useState<number>(0);
  const [remainingSec, setRemainingSec] = useState<number>(autoRefreshSec);

  const client = useMemo(
    () => new VideoGatewayClient({ gatewayUrl, siteId, authToken }),
    [gatewayUrl, siteId, authToken],
  );

  useEffect(() => {
    let cancelled = false;
    let pollTimer: number | undefined;

    async function fetchSnapshot(silent: boolean) {
      if (!silent && !lastCapturedRef.current) {
        setStatus("loading");
      }
      try {
        const data = await client.getSnapshots(camId, { refresh: true });
        if (cancelled) return;
        if (data.snapshots.length === 0) {
          if (!lastCapturedRef.current) {
            setErrorMsg("等待刷新...");
            setStatus("error");
          }
          return;
        }
        const latest = data.snapshots.find((s) => s.size_bytes >= 8192);
        if (!latest) {
          if (!lastCapturedRef.current) {
            setErrorMsg("等待刷新...");
            setStatus("error");
          }
          return;
        }
        if (latest.captured_at !== lastCapturedRef.current) {
          // 预加载新图片后再切换，避免页面闪烁
          const pre = new Image();
          pre.onload = () => {
            if (cancelled) return;
            lastCapturedRef.current = latest.captured_at;
            setSnapshotUrl(latest.url);
            setCapturedAt(latest.captured_at);
            setSizeKb(Math.round(latest.size_bytes / 1024));
            setStatus("ready");
          };
          pre.src = latest.url;
        } else {
          setStatus("ready");
        }
      } catch (err) {
        if (cancelled) return;
        if (!lastCapturedRef.current) {
          setErrorMsg(err instanceof Error ? err.message : "加载失败");
          setStatus("error");
        }
      }
    }

    async function loadStream() {
      setStatus("loading");
      setErrorMsg("");
      try {
        if (mode === "playback") {
          if (!playbackStart || !playbackEnd) {
            throw new Error("回放模式必须提供 playbackStart 与 playbackEnd (ISO 8601 UTC)");
          }
          const data = await client.getPlaybackStream(camId, playbackStart, playbackEnd);
          if (cancelled) return;
          setStreamUrl(data.playback_url);
          setStatus("ready");
          return;
        }

        const data = await client.getLiveStream(camId);
        if (cancelled) return;
        if (data.status === "waking") {
          setStatus("waking");
          pollTimer = window.setTimeout(loadStream, 2000);
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

    if (mode === "snapshot") {
      fetchSnapshot(false);
    } else {
      loadStream();
    }

    return () => {
      cancelled = true;
      if (pollTimer !== undefined) window.clearTimeout(pollTimer);
    };
  }, [client, camId, mode, playbackStart, playbackEnd, refreshNonce]);

  // 快照模式：每秒更新左下角旋转倒计时，归零且处于前台时抓拍；切回前台/获得焦点时立即刷新并重置周期
  useEffect(() => {
    if (mode !== "snapshot" || autoRefreshSec <= 0) {
      setRemainingSec(0);
      return;
    }

    let cancelled = false;
    let rem = autoRefreshSec;
    let lastResumeAt = 0;
    let followUpTimer: number | undefined;
    setRemainingSec(rem);

    function pullLatest() {
      void client
        .getSnapshots(camId, { refresh: true })
        .then((data) => {
          if (cancelled) return;
          const latest = data.snapshots.find((s) => s.size_bytes >= 8192);
          if (!latest || latest.captured_at === lastCapturedRef.current) return;
          const pre = new Image();
          pre.onload = () => {
            if (cancelled) return;
            lastCapturedRef.current = latest.captured_at;
            setSnapshotUrl(latest.url);
            setCapturedAt(latest.captured_at);
            setSizeKb(Math.round(latest.size_bytes / 1024));
            setStatus("ready");
          };
          pre.src = latest.url;
        })
        .catch(() => undefined);
    }

    function onResume() {
      if (document.hidden) return;
      const now = Date.now();
      // 防止 visibilitychange 与 focus 在同一毫秒重复触发
      if (now - lastResumeAt < 3000) return;
      lastResumeAt = now;

      setRemainingSec(0);
      pullLatest();
      // 工控机空闲心跳 5s，6s 后顺带回捞一次刚抓拍上传的新图
      if (followUpTimer !== undefined) window.clearTimeout(followUpTimer);
      followUpTimer = window.setTimeout(() => {
        if (!cancelled && !document.hidden) pullLatest();
      }, 6000);
      rem = autoRefreshSec;
      setRemainingSec(rem);
    }

    const timer = window.setInterval(() => {
      if (document.hidden) return;
      rem -= 1;
      if (rem <= 0) {
        setRemainingSec(0);
        pullLatest();
        rem = autoRefreshSec;
      } else {
        setRemainingSec(rem);
      }
    }, 1000);

    document.addEventListener("visibilitychange", onResume);
    window.addEventListener("focus", onResume);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
      if (followUpTimer !== undefined) window.clearTimeout(followUpTimer);
      document.removeEventListener("visibilitychange", onResume);
      window.removeEventListener("focus", onResume);
    };
  }, [client, camId, mode, autoRefreshSec]);

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

  const circumference = 43.98;
  const strokeOffset =
    autoRefreshSec > 0 ? circumference * (1 - Math.max(0, remainingSec) / autoRefreshSec) : circumference;

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative aspect-video w-full overflow-hidden bg-zinc-950 text-zinc-100",
        onClick && "cursor-pointer",
        className,
      )}
    >
      {mode === "snapshot" && snapshotUrl ? (
        <img src={snapshotUrl} alt={camId} className="h-full w-full object-cover" />
      ) : (
        <video ref={videoRef} controls autoPlay muted playsInline className="h-full w-full object-cover" />
      )}

      {mode === "snapshot" && autoRefreshSec > 0 && (
        <div className="pointer-events-none absolute bottom-2.5 left-2.5 flex items-center gap-1.5 rounded-full bg-black/15 px-2 py-1 text-[11px] text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.95)]">
          <svg className="h-4 w-4 -rotate-90" viewBox="0 0 20 20" aria-hidden="true">
            <circle cx="10" cy="10" r="7" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2.5" />
            <circle
              cx="10"
              cy="10"
              r="7"
              fill="none"
              stroke="#10b981"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeOffset.toFixed(2)}
              className="transition-all duration-700"
            />
          </svg>
          <span className="tabular-nums">{remainingSec <= 0 ? "刷新中" : `${remainingSec}s`}</span>
        </div>
      )}

      {(status === "loading" || status === "waking") && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-zinc-950/75 text-xs">
          <Loader2 className="h-5 w-5 animate-spin text-emerald-400" />
          <span className="font-medium">
            {status === "waking" ? "正在唤醒 4G 边缘推流..." : "正在加载视频通道..."}
          </span>
          <span className="text-zinc-400">{camId}</span>
        </div>
      )}

      {status === "error" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-zinc-950/85 p-4 text-center text-xs">
          <VideoOff className="h-5 w-5 text-zinc-400" />
          <span className="font-medium text-zinc-200">{errorMsg || "等待刷新..."}</span>
        </div>
      )}

      {(watermark || capturedAt) && (
        <div
          title={capturedAt || undefined}
          className="pointer-events-none absolute right-2.5 bottom-2.5 rounded bg-black/15 px-2 py-0.5 text-[11px] text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.95)]"
        >
          {watermark ? `${watermark} · ` : ""}
          {capturedAt ? `${formatLocalTime(capturedAt)}${sizeKb ? ` (${sizeKb} KB)` : ""}` : camId}
        </div>
      )}
    </div>
  );
}
