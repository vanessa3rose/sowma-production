import { useEffect, useMemo, useState } from "react";

type LinePoint = { date: string; value: number };
type Cell = { day: number | null; level: number; isFuture: boolean };

type LinkedInCalendarHeatmapProps = {
  points: LinePoint[];
  compact?: boolean;
  disableNavigation?: boolean;
  anchorDate?: string | Date | null;
  onWeeksChange?: (weeks: number) => void;
};

const EMPTY_CELL: Cell = { day: null, level: -2, isFuture: false };

import { COLORS } from "../../data/colors.js";
function heatColor(level: number): { bg: string; text: string } {
  if (level <= 0) return { bg: COLORS.SOWMA_GRAY, text: "black" };
  if (level === 1) return { bg: COLORS.SOWMA_LIGHTER_BLUE, text: "black" };
  if (level === 2) return { bg: COLORS.SOWMA_BLUE, text: "black" };
  return { bg: COLORS.SOWMA_DARKER_BLUE, text: "black" };
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

function buildActivity(points: LinePoint[]): Map<string, number> {
  const activity = new Map<string, number>();
  for (const point of points) {
    activity.set(point.date, Math.max(0, point.value));
  }
  return activity;
}

function getReferenceDate(
  points: LinePoint[],
  anchorDate?: string | Date | null,
): Date {
  if (anchorDate) {
    const parsed =
      anchorDate instanceof Date ? new Date(anchorDate) : new Date(anchorDate);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }

  if (!points.length) return new Date();
  const sorted = points
    .map((p) => p.date)
    .slice()
    .sort();
  const latest = sorted[sorted.length - 1];
  const parsed = new Date(latest);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

export function LinkedInCalendarHeatmap({
  points,
  compact = false,
  disableNavigation = false,
  anchorDate,
  onWeeksChange,
}: LinkedInCalendarHeatmapProps) {
  // Use the latest imported day as the anchor month so exported PDFs
  // consistently show the month the data came from.
  const referenceDate = useMemo(
    () => getReferenceDate(points, anchorDate),
    [points, anchorDate],
  );
  const today = new Date(referenceDate);
  today.setHours(23, 59, 59, 999);
  const [offset, setOffset] = useState(0);

  const activity = useMemo(() => buildActivity(points), [points]);
  const allActivityValues = useMemo(
    () => Array.from(activity.values()),
    [activity],
  );

  const minOffset = useMemo(() => {
    if (!points.length) return -12;
    const earliest = points[0].date.slice(0, 7);
    const eYear = parseInt(earliest.slice(0, 4));
    const eMonth = parseInt(earliest.slice(5, 7)) - 1;
    const monthsDiff =
      (today.getFullYear() - eYear) * 12 + (today.getMonth() - eMonth);
    return -monthsDiff;
  }, [points, today]);

  const viewDate = new Date(today.getFullYear(), today.getMonth() + offset, 1);
  const viewYear = viewDate.getFullYear();
  const viewMonth = viewDate.getMonth();

  const firstDay = new Date(viewYear, viewMonth, 1);
  const lastDay = new Date(viewYear, viewMonth + 1, 0);
  const totalDays = lastDay.getDate();
  const monthName = firstDay.toLocaleString("default", { month: "long" });
  const weeksNeeded = Math.ceil((firstDay.getDay() + totalDays) / 7);

  useEffect(() => {
    onWeeksChange?.(weeksNeeded);
  }, [onWeeksChange, weeksNeeded]);

  const squares = Array.from({ length: totalDays }, (_, i) => {
    const date = new Date(viewYear, viewMonth, i + 1);
    const dateStr = date.toISOString().slice(0, 10);
    const value = activity.get(dateStr) ?? 0;
    const isFuture = date > today;
    const level = isFuture ? -1 : activityToLevel(value, allActivityValues);
    return { day: i + 1, level, isFuture };
  });

  const padded: Cell[] = Array(firstDay.getDay())
    .fill(EMPTY_CELL)
    .concat(squares);
  while (padded.length < 42) {
    padded.push(EMPTY_CELL);
  }
  if (padded.length > 42) {
    padded.length = 42;
  }

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex items-center justify-between px-1 shrink-0">
        {disableNavigation ? (
          <span className="w-6 h-6" />
        ) : (
          <button
            onClick={() => setOffset((o) => Math.max(minOffset, o - 1))}
            disabled={offset <= minOffset}
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100 disabled:opacity-30"
          >
            ‹
          </button>
        )}

        <span className="text-xs font-semibold text-gray-700">
          {monthName} {viewYear}
        </span>

        {disableNavigation ? (
          <span className="w-6 h-6" />
        ) : (
          <button
            onClick={() => setOffset((o) => Math.min(0, o + 1))}
            disabled={offset >= 0}
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100 disabled:opacity-30"
          >
            ›
          </button>
        )}
      </div>

      <div
        className={`grid grid-cols-7 px-1 shrink-0 ${compact ? "text-[9px]" : "text-[10px]"} text-gray-400`}
      >
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="text-center">
            {d}
          </div>
        ))}
      </div>

      <div
        className={`grid grid-cols-7 min-h-0 ${compact ? "gap-1 justify-center" : "gap-1"}`}
      >
        {padded.map((sq, idx) => {
          if (sq.level === -2) {
            return (
              <div
                key={idx}
                className={
                  compact
                    ? "rounded-md bg-transparent"
                    : "rounded-md bg-transparent aspect-square"
                }
                style={compact ? { width: 24, height: 18 } : undefined}
              />
            );
          }

          const colors = sq.isFuture
            ? { bg: COLORS.SOWMA_LIGHTEST_GRAY, text: COLORS.SOWMA_GRAY }
            : heatColor(sq.level);

          return (
            <div
              key={idx}
              className={`rounded-md flex items-center justify-center text-xs md:text-sm overflow-hidden ${compact ? "" : "aspect-square"}`}
              style={{
                backgroundColor: colors.bg,
                color: colors.text,
                ...(compact ? { width: 24, height: 18, fontSize: 9 } : {}),
              }}
              title={
                sq.day != null
                  ? `${viewYear}-${viewMonth + 1}-${sq.day}`
                  : undefined
              }
            >
              {compact ? "" : (sq.day ?? "")}
            </div>
          );
        })}
      </div>
    </div>
  );
}
