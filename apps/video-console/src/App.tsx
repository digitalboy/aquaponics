import { CameraMonitorGrid } from "@aquaponics/video-player";
import { KeyRound, ShieldCheck } from "lucide-react";
import { useState } from "react";

const DEFAULT_GATEWAY =
  import.meta.env.VITE_VIDEO_GATEWAY_URL || "https://video-gw.guoshu.dev";
const STORAGE_KEY = "aquaponics_video_key";

export function App() {
  const [draftKey, setDraftKey] = useState<string>(
    () => localStorage.getItem(STORAGE_KEY) || "",
  );
  const [authToken, setAuthToken] = useState<string>(
    () => localStorage.getItem(STORAGE_KEY) || "",
  );
  const [autoRefreshSec, setAutoRefreshSec] = useState<number>(15);

  function applyKey(e: React.FormEvent) {
    e.preventDefault();
    const cleaned = draftKey.trim();
    localStorage.setItem(STORAGE_KEY, cleaned);
    setAuthToken(cleaned);
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/70 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <div>
              <h1 className="text-sm font-semibold tracking-tight">
                数字化农业工厂 · 视频监控台
              </h1>
              <p className="text-xs text-muted-foreground">
                Monorepo SDK + shadcn/ui + Tailwind v4 · 无人看 10 分钟留档 / 观看时按需刷新
              </p>
            </div>
          </div>

          <form onSubmit={applyKey} className="flex flex-wrap items-center gap-2">
            <select
              value={autoRefreshSec}
              onChange={(e) => setAutoRefreshSec(Number(e.target.value))}
              className="h-8 rounded-md border border-input bg-background px-2.5 text-xs text-foreground focus:border-ring focus:outline-none"
            >
              <option value={15}>快照 15秒自动刷新</option>
              <option value={30}>快照 30秒自动刷新</option>
              <option value={0}>关闭自动刷新</option>
            </select>

            <div className="relative">
              <KeyRound className="pointer-events-none absolute top-2 left-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="password"
                value={draftKey}
                onChange={(e) => setDraftKey(e.target.value)}
                placeholder="输入 INTERNAL_API_KEY"
                className="h-8 w-56 rounded-md border border-input bg-background pr-2.5 pl-8 text-xs text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="h-8 cursor-pointer rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground hover:bg-primary/90"
            >
              加载机位
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto max-w-6xl p-4">
        <CameraMonitorGrid
          gatewayUrl={DEFAULT_GATEWAY}
          authToken={authToken || undefined}
          autoRefreshSec={autoRefreshSec}
          allowLive={false}
        />
      </main>
    </div>
  );
}
