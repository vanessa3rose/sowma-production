import { fetchMetrics, SocialMediaMetric } from "../../utils/fetchMetrics";
import { GoogleAnalyticsExportBundle } from "../../types/exportTypes";
import { computeRangeDates, type DateRangeId } from "../charts/DateDropdown";
import { EXPORT_PLATFORM_CONFIGS } from "./exportMetricsConfig";

// ---------- Helpers ----------

function sortByDate(raw: SocialMediaMetric[]) {
  return raw
    .slice()
    .sort((a, b) =>
      (a.metricDate ?? a.lastSynced ?? new Date().toISOString()).localeCompare(
        b.metricDate ?? b.lastSynced ?? new Date().toISOString(),
      ),
    );
}

function toLinePoints(raw: SocialMediaMetric[]) {
  return sortByDate(raw).map((m) => ({
    date: (m.metricDate ?? m.lastSynced ?? new Date().toISOString()).slice(
      0,
      10,
    ),
    value: m.metricValue,
  }));
}

function summarizeSeries(series: { value: number }[]) {
  const len = series.length;
  if (len === 0) return { current: 0, prev: 0 };
  if (len === 1) return { current: series[0].value, prev: 0 };

  return {
    current: series[len - 1].value,
    prev: series[len - 2].value,
  };
}

// ========== FETCH GOOGLE ANALYTICS EXPORT DATA ==========

export async function fetchGoogleExportBundle(
  range: DateRangeId,
): Promise<GoogleAnalyticsExportBundle> {
  const provider = "GOOGLE_ANALYTICS";
  const maxDate = new Date();
  maxDate.setHours(0, 0, 0, 0);
  const { startDate, endDate } = computeRangeDates(range, maxDate);

  const metrics = EXPORT_PLATFORM_CONFIGS.google.metrics;

  const results = await Promise.all(
    metrics.map((metric) =>
      fetchMetrics({
        provider,
        metric: metric.id,
        startDate,
        endDate,
      }).then((rows) => ({
        metricId: metric.id,
        series: toLinePoints(rows),
      })),
    ),
  );

  const chartDataMap: Record<string, { date: string; value: number }[]> = {};
  const metricSummaries: Record<string, { current: number; prev: number }> = {};

  for (const { metricId, series } of results) {
    chartDataMap[metricId] = series;
    metricSummaries[metricId] = summarizeSeries(series);
  }

  return {
    chartDataMap,
    metricSummaries,
  };
}
