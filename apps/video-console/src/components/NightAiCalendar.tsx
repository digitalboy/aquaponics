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
 * shadcn/Tailwind v4 语义化月历视图：
 * - 按月展示每天的「熟人 / 未知人员」识别数量角标
 * - 点击某天可筛选右侧或下方的识别明细，再次点击可取消筛选
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
  // 周一作为每周第一天 (0=周一 ... 6=周日)
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
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold">
            {year} 年 {mon} 月
          </h3>
          {selectedDate && (
            <button
              type="button"
              onClick={() => onSelectDate(null)}
              className="rounded-md border border-border bg-background px-2 py-0.5 text-xs text-muted-foreground hover:text-foreground"
            >
              查看本月全部
            </button>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              const today = getTodayCstStr();
              onMonthChange(today.slice(0, 7));
              onSelectDate(today);
            }}
            className="rounded-md border border-border bg-background px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
          >
            今天
          </button>
          <button
            type="button"
            aria-label="上个月"
            onClick={() => onMonthChange(shiftMonth(month, -1))}
            className="inline-flex size-7 items-center justify-center rounded-md border border-border bg-background text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            aria-label="下个月"
            onClick={() => onMonthChange(shiftMonth(month, 1))}
            className="inline-flex size-7 items-center justify-center rounded-md border border-border bg-background text-muted-foreground hover:text-foreground"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

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
              className={`flex h-14 flex-col items-start justify-between rounded-lg border p-1.5 text-left transition ${
                isSelected
                  ? "border-primary bg-primary/15 ring-1 ring-primary"
                  : stat
                    ? "border-border bg-background/80 hover:border-primary/50"
                    : "border-transparent bg-background/30 text-muted-foreground hover:border-border"
              }`}
            >
              <span
                className={`text-xs font-medium leading-none ${
                  isToday ? "text-primary font-semibold" : ""
                }`}
              >
                {cell.day}
              </span>

              {stat ? (
                <div className="flex w-full flex-wrap items-center gap-1">
                  {stat.known > 0 && (
                    <span className="rounded bg-primary/20 px-1 py-0.2 text-[10px] font-medium leading-tight text-primary">
                      熟{stat.known}
                    </span>
                  )}
                  {stat.unknown > 0 && (
                    <span className="rounded bg-destructive/20 px-1 py-0.2 text-[10px] font-medium leading-tight text-destructive">
                      未{stat.unknown}
                    </span>
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
    </div>
  );
}
