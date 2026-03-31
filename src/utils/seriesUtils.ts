import { type DateRangeValue } from "../components/charts/DateButton";
import { type SocialMediaMetric } from "./fetchMetrics";

export type LinePoint = { date: string; value: number };
export type MetricSummary = { current: number | null; prev: number | null };

export function sortByDate(raw: SocialMediaMetric[]): SocialMediaMetric[] {
  return raw
    .filter((m) => m.metricDate || m.lastSynced)
    .slice()
    .sort((a, b) =>
      (a.metricDate ?? a.lastSynced)!.localeCompare(
        (b.metricDate ?? b.lastSynced)!,
      ),
    );
}

export function toLinePoints(raw: SocialMediaMetric[]): LinePoint[] {
  return sortByDate(raw).map((m) => {
    const ts = (m.metricDate ?? m.lastSynced)!;
    return { date: ts.slice(0, 10), value: m.metricValue };
  });
}

export function summarizeSeries(points: LinePoint[]): MetricSummary {
  if (!points.length) return { current: null, prev: null };
  if (points.length === 1) return { current: points[0].value, prev: null };
  return {
    current: points[points.length - 1].value,
    prev: points[points.length - 2].value,
  };
}

export function getBounds(pts: LinePoint[]) {
  if (!pts.length)
    return { min: null as Date | null, max: null as Date | null };
  const dates = pts.map((p) => p.date).slice().sort();
  return { min: new Date(dates[0]), max: new Date(dates[dates.length - 1]) };
}

/** Anchors range to the last data point in the series. */
export function filterByRange(
  pts: LinePoint[],
  range: DateRangeValue,
): LinePoint[] {
  if (!pts.length || range.id === "all") return pts;

  if (range.id === "custom" && range.start && range.end) {
    const startStr = range.start.toISOString().slice(0, 10);
    const endStr = range.end.toISOString().slice(0, 10);
    return pts.filter((p) => p.date >= startStr && p.date <= endStr);
  }

  const end = new Date(pts[pts.length - 1].date);
  const start = new Date(end);
  if (range.id === "7d") start.setDate(start.getDate() - 6);
  if (range.id === "30d") start.setDate(start.getDate() - 29);
  if (range.id === "1y") start.setFullYear(start.getFullYear() - 1);
  const startStr = start.toISOString().slice(0, 10);
  const endStr = end.toISOString().slice(0, 10);
  return pts.filter((p) => p.date >= startStr && p.date <= endStr);
}
