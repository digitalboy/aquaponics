import { CameraMonitorGrid } from "@aquaponics/video-player";
import { Lock, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { AdminFacePanel } from "./components/AdminFacePanel";

const DEFAULT_GATEWAY =
  import.meta.env.VITE_VIDEO_GATEWAY_URL || "https://video-gw.guoshu.dev";

export function App() {
  const [isAdmin, setIsAdmin] = useState(() => window.location.hash === "#admin");

  useEffect(() => {
    const onHash = () => setIsAdmin(window.location.hash === "#admin");
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const enterAdmin = () => {
    window.location.hash = "#admin";
    setIsAdmin(true);
  };

  const exitAdmin = () => {
    window.location.hash = "";
    setIsAdmin(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/70 px-4 py-3.5 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-6 w-6 shrink-0 text-primary" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-semibold tracking-tight">国数AI农业</h1>
                <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                  光明 B3
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                公开透明的生态生产现场，让每一位朋友亲眼见证安心食材的真实生长过程
              </p>
            </div>
          </div>

          {!isAdmin && (
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-3 py-1 text-xs text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span>每 15 秒自动更新现场画面</span>
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-6xl p-4">
        {isAdmin ? (
          <AdminFacePanel gatewayUrl={DEFAULT_GATEWAY} onBack={exitAdmin} />
        ) : (
          <>
            {/* 固定 15 秒前台自动刷新（切后台自动暂停）；一期演示阶段免鉴权、隐藏按需直播入口 */}
            <CameraMonitorGrid
              gatewayUrl={DEFAULT_GATEWAY}
              autoRefreshSec={15}
              allowLive={false}
            />
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={enterAdmin}
                className="inline-flex items-center gap-1 text-[11px] text-muted-foreground/50 hover:text-muted-foreground"
              >
                <Lock className="h-3 w-3" />
                管理入口
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
