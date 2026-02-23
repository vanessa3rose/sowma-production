import { fetchMetrics, SocialMediaMetric } from "../../src/utils/fetchMetrics";
import { GoogleAnalyticsExportBundle } from "../../src/types/exportTypes";
import {
  computeRangeDates,
  type DateRangeId,
} from "../../src/components/charts/DateDropdown";
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

function toPrimarySeriesRows(raw: SocialMediaMetric[]) {
  return raw.filter((m) => !m.breakdownKey && !m.breakdownValue);
}

function aggregateBreakdownTotals(
  rows: SocialMediaMetric[],
  breakdownKey: string,
) {
  const totals: Record<string, number> = {};
  for (const row of rows) {
    if (row.breakdownKey !== breakdownKey || !row.breakdownValue) continue;
    totals[row.breakdownValue] = (totals[row.breakdownValue] ?? 0) + row.metricValue;
  }
  return totals;
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
        series: toLinePoints(toPrimarySeriesRows(rows)),
      })),
    ),
  );

  const [totalSessionsRows, sessionsBySourceRows] = await Promise.all([
    fetchMetrics({
      provider,
      metric: "TOTAL_SESSIONS",
      startDate,
      endDate,
    }),
    fetchMetrics({
      provider,
      metric: "SESSIONS_BY_SOURCE",
      startDate,
      endDate,
    }),
  ]);

  const chartDataMap: Record<string, { date: string; value: number }[]> = {};
  const metricSummaries: Record<string, { current: number; prev: number }> = {};

  for (const { metricId, series } of results) {
    chartDataMap[metricId] = series;
    metricSummaries[metricId] = summarizeSeries(series);
  }

  const countyTotals = aggregateBreakdownTotals(totalSessionsRows, "county");
  const deviceTotals = aggregateBreakdownTotals(
    totalSessionsRows,
    "deviceCategory",
  );
  const sourceTotals = aggregateBreakdownTotals(
    sessionsBySourceRows,
    "sessionSource",
  );
  const newVsReturningTotals = aggregateBreakdownTotals(
    totalSessionsRows,
    "newVsReturning",
  );
  const newFromBreakdown =
    newVsReturningTotals.New ?? newVsReturningTotals.new ?? 0;
  const returningFromBreakdown =
    newVsReturningTotals.Returning ?? newVsReturningTotals.returning ?? 0;
  const newUsersCurrent = metricSummaries.NEW_USERS?.current ?? 0;
  const activeUsersCurrent = metricSummaries.ACTIVE_USERS?.current ?? 0;
  const pageViewsSeries = chartDataMap.SCREEN_PAGE_VIEWS ?? [];
  const pageViewsAsOf =
    pageViewsSeries.length > 0
      ? pageViewsSeries[pageViewsSeries.length - 1].date
      : null;

  return {
    chartDataMap,
    metricSummaries,
    countyTotals,
    sourceTotals,
    deviceTotals,
    newVsReturning: {
      newUsers: newFromBreakdown > 0 ? newFromBreakdown : newUsersCurrent,
      returningUsers:
        returningFromBreakdown > 0
          ? returningFromBreakdown
          : Math.max(activeUsersCurrent - newUsersCurrent, 0),
    },
    pageViewsAsOf,
  };
}
