import { CameraMonitorGrid } from "@aquaponics/video-player";
import { ShieldCheck } from "lucide-react";

const DEFAULT_GATEWAY =
  import.meta.env.VITE_VIDEO_GATEWAY_URL || "https://video-gw.guoshu.dev";

export function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/70 px-4 py-3.5 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-6 w-6 shrink-0 text-primary" />
            <div>
              <h1 className="text-base font-semibold tracking-tight">国数AI农业</h1>
              <p className="text-xs text-muted-foreground">
                公开透明的生态生产现场，让每一位朋友亲眼见证安心食材的真实生长过程
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-3 py-1 text-xs text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span>每 15 秒自动更新现场画面</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl p-4">
        {/* 固定 15 秒前台自动刷新（切后台自动暂停）；一期演示阶段免鉴权、隐藏按需直播入口 */}
        <CameraMonitorGrid
          gatewayUrl={DEFAULT_GATEWAY}
          autoRefreshSec={15}
          allowLive={false}
        />
      </main>
    </div>
  );
}
