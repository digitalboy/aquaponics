import { Button, Card, CardContent, CardHeader, CardTitle, cn } from "@aquaponics/ui";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface DailyIntelSummaryItem {
  total: number;
  industry: number;
  academic: number;
  maxScore: number;
}

interface IntelCalendarProps {
  month: string; // YYYY-MM
  selectedDate: string | null; // YYYY-MM-DD | null
  dailySummary: Record<string, DailyIntelSummaryItem>;
  onMonthChange: (nextMonth: string) => void;
  onSelectDate: (date: string | null) => void;
}

const WEEKDAYS = ["一", "二", "三", "四", "五", "六", "日"];

function shiftMonth(yyyyMm: string, delta: number): string {
  const [y, m] = yyyyMm.split("-").map(Number);
  const d = new Date(y!, m! - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function getTodayBjtStr(): string {
  const bjt = new Date(Date.now() + 8 * 3600 * 1000);
  return bjt.toISOString().slice(0, 10);
}

/**
 * 全球农业 AI 情报月历组件：
 * - 日历格内以双色进度条（绿：产业 / 蓝：学术）直观呈现每日情报分布
 * - 鼠标悬停或键盘聚焦日期格时显示具体篇数（最小字号 13px）
 */
export function IntelCalendar({
  month,
  selectedDate,
  dailySummary,
  onMonthChange,
  onSelectDate,
}: IntelCalendarProps) {
  const [year, mon] = month.split("-").map(Number);
  const firstDay = new Date(year!, mon! - 1, 1);
  const daysInMonth = new Date(year!, mon!, 0).getDate();
  const startOffset = (firstDay.getDay() + 6) % 7;
  const todayStr = getTodayBjtStr();

  const cells: Array<{ day: number | null; dateStr: string | null }> = [];
  for (let i = 0; i < startOffset; i += 1) {
    cells.push({ day: null, dateStr: null });
  }
  for (let d = 1; d <= daysInMonth; d += 1) {
    cells.push({
      day: d,
      dateStr: `${month}-${String(d).padStart(2, "0")}`,
    });
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <CardTitle className="text-lg font-semibold">
            {year} 年 {mon} 月
          </CardTitle>
          {selectedDate && (
            <Button size="sm" variant="ghost" className="text-[13px]" onClick={() => onSelectDate(null)}>
              全部
            </Button>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            size="sm"
            variant="outline"
            className="text-[13px]"
            onClick={() => {
              const today = getTodayBjtStr();
              onMonthChange(today.slice(0, 7));
              onSelectDate(today);
            }}
          >
            今天
          </Button>
          <Button
            size="icon"
            variant="outline"
            aria-label="上个月"
            onClick={() => onMonthChange(shiftMonth(month, -1))}
          >
            <ChevronLeft />
          </Button>
          <Button
            size="icon"
            variant="outline"
            aria-label="下个月"
            onClick={() => onMonthChange(shiftMonth(month, 1))}
          >
            <ChevronRight />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-3.5 pt-0">
        <div className="grid grid-cols-7 gap-1.5 text-center text-sm text-muted-foreground">
          {WEEKDAYS.map((w) => (
            <div key={w} className="py-1.5 font-medium">
              {w}
            </div>
          ))}
        </div>

        <div className="mt-1 grid grid-cols-7 gap-1.5">
          {cells.map((cell, idx) => {
            if (!cell.day || !cell.dateStr) {
              return <div key={`empty-${idx}`} className="h-14 rounded-lg" />;
            }
            const stat = dailySummary[cell.dateStr];
            const isSelected = selectedDate === cell.dateStr;
            const isToday = todayStr === cell.dateStr;
            const colIdx = idx % 7;

            const tooltipPos =
              colIdx === 0
                ? "left-0 translate-x-0"
                : colIdx === 6
                  ? "right-0 left-auto translate-x-0"
                  : "left-1/2 -translate-x-1/2";

            const tooltipLabel = stat
              ? `${mon}月${cell.day}日 · 产业 ${stat.industry} 篇 · 学术 ${stat.academic} 篇`
              : undefined;

            return (
              <div key={cell.dateStr} className="group relative">
                <button
                  type="button"
                  aria-pressed={isSelected}
                  title={tooltipLabel}
                  onClick={() => onSelectDate(isSelected ? null : cell.dateStr)}
                  className={cn(
                    "flex h-14 w-full cursor-pointer flex-col items-start justify-between rounded-lg border p-2 text-left transition",
                    isSelected
                      ? "border-primary bg-primary/15 ring-1 ring-primary"
                      : stat
                        ? "border-border bg-background/85 hover:border-primary/60 hover:bg-background"
                        : "border-transparent bg-background/30 text-muted-foreground hover:border-border/70",
                  )}
                >
                  <span
                    className={cn(
                      "text-sm font-semibold leading-none",
                      isToday &&
                        "inline-flex size-6 items-center justify-center rounded-full bg-primary/20 text-primary",
                    )}
                  >
                    {cell.day}
                  </span>

                  {stat && stat.total > 0 && (
                    <div
                      aria-hidden="true"
                      className="flex h-1.5 w-full overflow-hidden rounded-full bg-secondary"
                    >
                      {stat.industry > 0 && (
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${(stat.industry / stat.total) * 100}%` }}
                        />
                      )}
                      {stat.academic > 0 && (
                        <div
                          className="h-full bg-sky-400 transition-all"
                          style={{ width: `${(stat.academic / stat.total) * 100}%` }}
                        />
                      )}
                    </div>
                  )}
                </button>

                {stat && (
                  <div
                    role="tooltip"
                    className={cn(
                      "pointer-events-none absolute bottom-full z-20 mb-2 hidden whitespace-nowrap rounded-lg border border-border bg-popover px-3 py-1.5 text-[13px] font-medium text-popover-foreground shadow-lg group-hover:flex group-focus-within:flex items-center gap-2.5",
                      tooltipPos,
                    )}
                  >
                    <span className="text-muted-foreground">
                      {mon}月{cell.day}日
                    </span>
                    <span className="inline-flex items-center gap-1 text-primary">
                      <span className="size-2 rounded-full bg-primary" />
                      产业 {stat.industry}
                    </span>
                    <span className="inline-flex items-center gap-1 text-sky-300">
                      <span className="size-2 rounded-full bg-sky-400" />
                      学术 {stat.academic}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-border/60 pt-3 text-[13px] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-4 rounded-full bg-primary" />
            产业动态
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-4 rounded-full bg-sky-400" />
            学术前沿
          </span>
          <span className="text-muted-foreground/80">悬停日期查看篇数</span>
        </div>
      </CardContent>
    </Card>
  );
}
