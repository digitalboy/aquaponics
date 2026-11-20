import {
  Badge,
  Button,
  cn,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Slider,
  ToggleGroup,
  ToggleGroupItem,
} from "@aquaponics/ui";
import { ChevronLeft, ChevronRight, Loader2, Pause, Play, Repeat } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { formatLocalTime, type SnapshotItem, VideoGatewayClient } from "../sdk/client";

export interface SnapshotTimelapseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gatewayUrl: string;
  camId: string;
  camName: string;
  siteId?: string;
  authToken?: string;
}

/**
 * 历史实景图片时序播放弹窗 (Dialog)：
 * 按采集时间从早到晚依次播放，支持播放/暂停、倍速切换、进度拖拽及“循环/单次”开关。
 */
export function SnapshotTimelapseDialog({
  open,
  onOpenChange,
  gatewayUrl,
  camId,
  camName,
  siteId = "guangming-01",
  authToken,
}: SnapshotTimelapseDialogProps) {
  const [frames, setFrames] = useState<SnapshotItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [index, setIndex] = useState<number>(0);
  const [playing, setPlaying] = useState<boolean>(false);
  const [loop, setLoop] = useState<boolean>(true);
  const [intervalMs, setIntervalMs] = useState<number>(800);
  const [hoursWindow, setHoursWindow] = useState<12 | 24>(24);

  const client = useMemo(
    () => new VideoGatewayClient({ gatewayUrl, siteId, authToken }),
    [gatewayUrl, siteId, authToken],
  );

  useEffect(() => {
    if (!open) {
      setPlaying(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError("");
    const end = new Date().toISOString();
    const start = new Date(Date.now() - hoursWindow * 3600 * 1000).toISOString();
    void client
      .getSnapshots(camId, { start, end, includeEvents: true, limit: 1000 })
      .then((res) => {
        if (cancelled) return;
        // 过滤无效灰图并按采集时间从早到晚排序（融合10分钟留档、15秒实况与夜间AI人形抓拍）
        const valid = res.snapshots
          .filter((s) => s.size_bytes >= 8192)
          .sort((a, b) => a.captured_at.localeCompare(b.captured_at));
        setFrames(valid);
        setIndex(0);
        if (valid.length > 1) setPlaying(true);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "历史画面加载失败");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, client, camId, hoursWindow]);

  useEffect(() => {
    if (!open || !playing || frames.length <= 1) return;

    const timer = window.setInterval(() => {
      setIndex((prev) => {
        const next = prev + 1;
        if (next >= frames.length) {
          if (loop) return 0;
          setPlaying(false);
          return prev;
        }
        return next;
      });
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [open, playing, frames.length, loop, intervalMs]);

  // 预加载后续 2 帧，保证大时间线切换流畅
  useEffect(() => {
    if (!open || frames.length <= 1) return;
    for (const offset of [1, 2]) {
      const preIdx = (index + offset) % frames.length;
      const pre = new Image();
      pre.src = frames[preIdx].url;
    }
  }, [open, index, frames]);

  const current = frames[index];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex flex-wrap items-center justify-between gap-2 pr-6">
            <div>
              <DialogTitle>{camName} · 历史画面回看</DialogTitle>
              <DialogDescription>
                {frames.length > 0
                  ? `最近 ${hoursWindow} 小时共 ${frames.length} 张实景与AI记录，按时间顺序播放`
                  : `查看最近 ${hoursWindow} 小时自动留档与识别记录`}
              </DialogDescription>
            </div>
            <ToggleGroup
              type="single"
              value={String(hoursWindow)}
              onValueChange={(val) => {
                if (val === "12" || val === "24") {
                  setPlaying(false);
                  setHoursWindow(Number(val) as 12 | 24);
                }
              }}
            >
              <ToggleGroupItem value="12">最近 12h</ToggleGroupItem>
              <ToggleGroupItem value="24">最近 24h</ToggleGroupItem>
            </ToggleGroup>
          </div>
        </DialogHeader>

        <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border bg-zinc-950">
          {loading && (
            <div className="flex h-full items-center justify-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span>正在加载时序画面...</span>
            </div>
          )}

          {!loading && error && (
            <div className="flex h-full items-center justify-center text-xs text-red-400">{error}</div>
          )}

          {!loading && !error && !current && (
            <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
              暂无可播放的历史画面
            </div>
          )}

          {!loading && current && (
            <>
              <img src={current.url} alt={camName} className="h-full w-full object-contain" />
              <div className="pointer-events-none absolute right-2.5 bottom-2.5 flex items-center gap-2 rounded bg-black/15 px-2.5 py-1 text-xs text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.95)]">
                {current.source === "night_person_ai" && (
                  <Badge variant="destructive" className="bg-destructive/80 text-destructive-foreground px-1.5 py-0 text-[10px]">
                    {current.label || "AI人形检测"}
                  </Badge>
                )}
                <span>
                  {formatLocalTime(current.captured_at)} · 第 {index + 1} / {frames.length} 张
                </span>
              </div>
            </>
          )}
        </div>

        {frames.length > 0 && (
          <div className="flex flex-col gap-2.5">
            <Slider
              min={0}
              max={Math.max(0, frames.length - 1)}
              step={1}
              value={[index]}
              onValueChange={([val]) => {
                if (typeof val === "number") {
                  setPlaying(false);
                  setIndex(val);
                }
              }}
            />

            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setPlaying(false);
                    setIndex((i) => Math.max(0, i - 1));
                  }}
                  disabled={index <= 0}
                >
                  <ChevronLeft />
                  上一张
                </Button>

                <Button
                  size="sm"
                  variant="default"
                  onClick={() => {
                    if (!playing && index >= frames.length - 1) setIndex(0);
                    setPlaying((p) => !p);
                  }}
                >
                  {playing ? <Pause /> : <Play />}
                  {playing ? "暂停" : "播放"}
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setPlaying(false);
                    setIndex((i) => Math.min(frames.length - 1, i + 1));
                  }}
                  disabled={index >= frames.length - 1}
                >
                  下一张
                  <ChevronRight />
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Select
                  value={String(intervalMs)}
                  onValueChange={(val) => setIntervalMs(Number(val))}
                >
                  <SelectTrigger className="w-[105px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="400">0.4秒 / 张</SelectItem>
                    <SelectItem value="800">0.8秒 / 张</SelectItem>
                    <SelectItem value="1500">1.5秒 / 张</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  size="sm"
                  variant={loop ? "default" : "outline"}
                  className={cn(!loop && "text-muted-foreground")}
                  onClick={() => setLoop((v) => !v)}
                >
                  <Repeat />
                  {loop ? "循环播放" : "单次播放"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
