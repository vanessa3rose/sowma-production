import { useMemo } from "react";

type LinePoint = { date: string; value: number };

function buildPostingActivity(points: LinePoint[]): Map<string, number> {
  if (points.length < 2) return new Map();
  const activity = new Map<string, number>();
  for (let i = 1; i < points.length; i++) {
    const delta = points[i].value - points[i - 1].value;
    activity.set(points[i].date, Math.max(0, delta));
  }
  return activity;
}

function heatColor(level: number): { bg: string; text: string } {
  if (level <= 0) return { bg: "#989b9f", text: "#ffffff" };
  if (level === 1) return { bg: "#90B4D8", text: "#ffffff" };
  if (level === 2) return { bg: "#4781C2", text: "#ffffff" };
  return { bg: "#2D5A8A", text: "#ffffff" };
}

function activityToLevel(value: number, allValues: number[]): number {
  if (value <= 0) return 0;
  const nonZero = allValues.filter((v) => v > 0).sort((a, b) => a - b);
  if (!nonZero.length) return 1;
  const q1 = nonZero[Math.floor(nonZero.length * 0.33)];
  const q2 = nonZero[Math.floor(nonZero.length * 0.66)];
  if (value <= q1) return 1;
  if (value <= q2) return 2;
  return 3;
}

interface CalendarHeatmapProps {
  points: LinePoint[];
  offset: number;
  onOffsetChange: (offset: number) => void;
  minOffset: number;
}

export function CalendarHeatmap({
  points,
  offset,
  onOffsetChange,
  minOffset,
}: CalendarHeatmapProps) {
  const today = new Date();

  const activity = useMemo(() => buildPostingActivity(points), [points]);
  const allActivityValues = useMemo(
    () => Array.from(activity.values()),
    [activity],
  );

  const viewDate = new Date(today.getFullYear(), today.getMonth() + offset, 1);

  const viewYear = viewDate.getFullYear();
  const viewMonth = viewDate.getMonth();

  const firstDay = new Date(viewYear, viewMonth, 1);
  const lastDay = new Date(viewYear, viewMonth + 1, 0);
  const totalDays = lastDay.getDate();
  const monthName = firstDay.toLocaleString("default", { month: "long" });

  const squares = Array.from({ length: totalDays }, (_, i) => {
    const date = new Date(viewYear, viewMonth, i + 1);
    const dateStr = date.toISOString().slice(0, 10);
    const value = activity.get(dateStr) ?? 0;
    const isFuture = date > today;
    const level = isFuture ? -1 : activityToLevel(value, allActivityValues);
    return { day: i + 1, level, isFuture };
  });

  const padded = Array(firstDay.getDay())
    .fill({ day: null, level: -2, isFuture: false })
    .concat(squares);

  const weeks: (typeof padded)[] = [];
  for (let i = 0; i < padded.length; i += 7) {
    weeks.push(padded.slice(i, i + 7));
  }

  return (
    <div className="flex flex-col gap-[6px] h-full w-full">
      {/* Month nav */}
      <div className="flex items-center justify-between px-1">
        <button
          onClick={() => onOffsetChange(Math.max(minOffset, offset - 1))}
          disabled={offset <= minOffset}
          className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100 disabled:opacity-30"
        >
          ‹
        </button>

        <span className="text-xs font-semibold text-gray-700">
          {monthName} {viewYear}
        </span>

        <button
          onClick={() => onOffsetChange(Math.min(0, offset + 1))}
          disabled={offset >= 0}
          className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100 disabled:opacity-30"
        >
          ›
        </button>
      </div>

      {/* Calendar Grid */}
      {weeks.map((week, wi) => (
        <div key={wi} className="grid grid-cols-7 gap-[3px]">
          {week.map((sq, di) => {
            if (sq.level === -2) return <div key={di} />;

            const colors = sq.isFuture
              ? { bg: "#f0f0f0", text: "#b0b0b0" }
              : heatColor(sq.level);

            return (
              <div
                key={di}
                className="rounded flex items-center justify-center text-[11px]"
                style={{
                  aspectRatio: "1",
                  backgroundColor: colors.bg,
                  color: colors.text,
                }}
              >
                {sq.day ?? ""}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

export function HeatmapLegend() {
  return (
    <div className="flex items-center gap-1">
      <span className="text-[9px] text-gray-400">Less</span>
      {[0, 1, 2, 3].map((l) => (
        <div
          key={l}
          className="rounded-sm"
          style={{
            width: 11,
            height: 11,
            backgroundColor: heatColor(l).bg,
          }}
        />
      ))}
      <span className="text-[9px] text-gray-400">More</span>
    </div>
  );
}
