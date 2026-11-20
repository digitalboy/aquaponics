import { Badge, Button, Card, CardContent, CardHeader, CardTitle, cn } from "@aquaponics/ui";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface DailySummaryItem {
  total: number;
  known: number;
  unknown: number;
}

interface NightAiCalendarProps {
  month: string; // YYYY-MM
  selectedDate: string | null; // YYYY-MM-DD | null
  dailySummary: Record<string, DailySummaryItem>;
  onMonthChange: (nextMonth: string) => void;
  onSelectDate: (date: string | null) => void;
}

const WEEKDAYS = ["一", "二", "三", "四", "五", "六", "日"];

function shiftMonth(yyyyMm: string, delta: number): string {
  const [y, m] = yyyyMm.split("-").map(Number);
  const d = new Date(y!, m! - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function getTodayCstStr(): string {
  const cst = new Date(Date.now() + 8 * 3600 * 1000);
  return cst.toISOString().slice(0, 10);
}

/**
 * 基于 @aquaponics/ui Card / Button / Badge 组合的月历视图：
 * - 展示每天的「熟人 / 未知人员」识别数量角标
 * - 点击某天可筛选当天识别明细
 */
export function NightAiCalendar({
  month,
  selectedDate,
  dailySummary,
  onMonthChange,
  onSelectDate,
}: NightAiCalendarProps) {
  const [year, mon] = month.split("-").map(Number);
  const firstDay = new Date(year!, mon! - 1, 1);
  const daysInMonth = new Date(year!, mon!, 0).getDate();
  const startOffset = (firstDay.getDay() + 6) % 7;
  const todayStr = getTodayCstStr();

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
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle>
            {year} 年 {mon} 月
          </CardTitle>
          {selectedDate && (
            <Button size="sm" variant="ghost" onClick={() => onSelectDate(null)}>
              全部
            </Button>
          )}
        </div>

        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const today = getTodayCstStr();
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

      <CardContent className="p-3">
        <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
          {WEEKDAYS.map((w) => (
            <div key={w} className="py-1 font-medium">
              {w}
            </div>
          ))}
        </div>

        <div className="mt-1 grid grid-cols-7 gap-1">
          {cells.map((cell, idx) => {
            if (!cell.day || !cell.dateStr) {
              return <div key={`empty-${idx}`} className="h-14 rounded-lg" />;
            }
            const stat = dailySummary[cell.dateStr];
            const isSelected = selectedDate === cell.dateStr;
            const isToday = todayStr === cell.dateStr;

            return (
              <button
                key={cell.dateStr}
                type="button"
                onClick={() => onSelectDate(isSelected ? null : cell.dateStr)}
                className={cn(
                  "flex h-14 cursor-pointer flex-col items-start justify-between rounded-lg border p-1.5 text-left transition",
                  isSelected
                    ? "border-primary bg-primary/15 ring-1 ring-primary"
                    : stat
                      ? "border-border bg-background/80 hover:border-primary/50"
                      : "border-transparent bg-background/30 text-muted-foreground hover:border-border",
                )}
              >
                <span className={cn("text-xs font-medium leading-none", isToday && "font-semibold text-primary")}>
                  {cell.day}
                </span>

                {stat ? (
                  <div className="flex w-full flex-wrap items-center gap-1">
                    {stat.known > 0 && (
                      <Badge variant="default" className="px-1 py-0 text-[10px] leading-tight">
                        熟{stat.known}
                      </Badge>
                    )}
                    {stat.unknown > 0 && (
                      <Badge variant="destructive" className="px-1 py-0 text-[10px] leading-tight">
                        未{stat.unknown}
                      </Badge>
                    )}
                  </div>
                ) : (
                  <span className="text-[10px] text-muted-foreground/40">-</span>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-4 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <span className="size-2 rounded-full bg-primary" />
            熟：已识别员工/熟人
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="size-2 rounded-full bg-destructive" />
            未：未知人员告警
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
