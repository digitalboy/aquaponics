import { RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AquaponicsVideoPlayer } from "./AquaponicsVideoPlayer";
import { Badge } from "./components/ui/badge";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { type CameraInfo, VideoGatewayClient } from "./sdk/client";

export interface CameraMonitorGridProps {
  gatewayUrl: string;
  siteId?: string;
  authToken?: string;
  autoRefreshSec?: number;
  /**
   * 是否在前端界面展示“按需直播”切换按钮。
   * 注意：后端 on-demand 按需直播逻辑完整保留；一期纯 4G 省流阶段默认设为 false，不在 UI 渲染该入口。
   */
  allowLive?: boolean;
}

/** 多机位标准监控网格组件 (基于 shadcn/ui Card + Tailwind v4) */
export function CameraMonitorGrid({
  gatewayUrl,
  siteId = "guangming-01",
  authToken,
  autoRefreshSec = 15,
  allowLive = false,
}: CameraMonitorGridProps) {
  const [cameras, setCameras] = useState<CameraInfo[]>([]);
  const [role, setRole] = useState<"internal" | "public">("public");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [refreshMap, setRefreshMap] = useState<Record<string, number>>({});
  const [liveSet, setLiveSet] = useState<Record<string, boolean>>({});

  const client = useMemo(
    () => new VideoGatewayClient({ gatewayUrl, siteId, authToken }),
    [gatewayUrl, siteId, authToken],
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    void client
      .listCameras()
      .then((res) => {
        if (cancelled) return;
        setRole(res.role);
        setCameras(res.cameras.filter((c) => c.stream_mode !== "disabled"));
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "机位列表加载失败");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [client]);

  if (loading) {
    return <div className="py-8 text-center text-xs text-muted-foreground">正在加载机位列表...</div>;
  }

  if (error) {
    return <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-xs text-red-400">{error}</div>;
  }

  if (cameras.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 text-center text-xs text-muted-foreground">
        当前身份（{role}）下暂无已启用机位，请填入内部访问密钥后重新加载。
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {cameras.map((cam) => {
        const isLive = allowLive && Boolean(liveSet[cam.cam_id]);
        return (
          <Card key={cam.cam_id}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle>{cam.name}</CardTitle>
                <Badge variant="outline">{cam.cam_id}</Badge>
              </div>
              <div className="flex items-center gap-1.5">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setLiveSet((prev) => ({ ...prev, [cam.cam_id]: false }));
                    setRefreshMap((prev) => ({ ...prev, [cam.cam_id]: (prev[cam.cam_id] ?? 0) + 1 }));
                  }}
                >
                  <RefreshCw className="h-3 w-3" />
                  最新快照
                </Button>
                {/* 后端 on-demand 直播能力已就绪；一期仅在 allowLive=true 时渲染该按钮 */}
                {allowLive && (
                  <Button
                    size="sm"
                    variant={isLive ? "default" : "outline"}
                    onClick={() => setLiveSet((prev) => ({ ...prev, [cam.cam_id]: !isLive }))}
                  >
                    {isLive ? "切回快照" : "4G按需直播"}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <AquaponicsVideoPlayer
                gatewayUrl={gatewayUrl}
                camId={cam.cam_id}
                siteId={siteId}
                authToken={authToken}
                mode={isLive ? "live" : "snapshot"}
                autoRefreshSec={autoRefreshSec}
                refreshNonce={refreshMap[cam.cam_id] ?? 0}
              />
              <div className="flex items-center justify-between border-t border-border px-4 py-1.5 text-[11px] text-muted-foreground">
                <span>
                  权限: {cam.visibility} · 通道: {cam.stream_mode}
                </span>
                <span>{role === "internal" ? "内部运维视图" : "公开溯源视图"}</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
