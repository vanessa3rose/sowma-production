import type { SocialExportBundle } from "../../src/types/exportTypes";
import { type Platform } from "../../src/config/chartConfigs";
import { fetchMetrics, SocialMediaMetric } from "../../src/utils/fetchMetrics";
import {
  computeRangeDates,
  type DateRangeValue,
} from "../../src/components/charts/DateButton";

import { EXPORT_PLATFORM_CONFIGS } from "./exportMetricsConfig";

type SocialPlatform = Exclude<Platform, "google">;

const PROVIDER_MAP: Record<SocialPlatform, string> = {
  instagram: "INSTAGRAM",
  twitter: "TWITTER",
  facebook: "FACEBOOK",
  // LinkedIn metrics are imported via CSV and stored in SocialMediaMetrics
  // with provider LINKEDIN, so export uses the same fetch pipeline.
  linkedin: "LINKEDIN",
  constantcontact: "CONSTANT_CONTACT",
};

function sortByDate(raw: SocialMediaMetric[]): SocialMediaMetric[] {
  return raw
    .slice()
    .sort((a, b) =>
      (a.metricDate ?? a.lastSynced ?? new Date().toISOString()).localeCompare(
        b.metricDate ?? b.lastSynced ?? new Date().toISOString(),
      ),
    );
}

function toLinePoints(
  raw: SocialMediaMetric[],
): { date: string; value: number }[] {
  return sortByDate(raw).map((m) => ({
    date: (m.metricDate ?? m.lastSynced ?? new Date().toISOString()).slice(
      0,
      10,
    ),
    value: m.metricValue,
  }));
}

function summarizeSeries(points: { value: number }[]): {
  current: number | null;
  prev: number | null;
} {
  if (points.length === 0) return { current: 0, prev: 0 };
  if (points.length === 1) return { current: points[0].value, prev: 0 };
  return {
    current: points[points.length - 1].value,
    prev: points[points.length - 2].value,
  };
}

function aggregateBreakdownTotals(
  rows: SocialMediaMetric[],
  breakdownKey: string,
): Record<string, number> {
  const totals: Record<string, number> = {};
  for (const row of rows) {
    if (row.breakdownKey !== breakdownKey || !row.breakdownValue) continue;
    totals[row.breakdownValue] =
      (totals[row.breakdownValue] ?? 0) + row.metricValue;
  }
  return totals;
}

export async function fetchSocialExportBundle(
  platform: Platform,
  range: DateRangeValue,
): Promise<SocialExportBundle> {
  if (platform === "google") {
    throw new Error(
      "fetchSocialExportBundle should not be called with 'google'",
    );
  }

  const provider = PROVIDER_MAP[platform];
  if (!provider) {
    throw new Error(`No provider mapping for platform: ${platform}`);
  }

  const config = EXPORT_PLATFORM_CONFIGS[platform];
  if (!config) {
    throw new Error(`No export config for platform: ${platform}`);
  }

  const maxDate = new Date();
  maxDate.setHours(0, 0, 0, 0);
  const { startDate, endDate } = computeRangeDates(
    range.id,
    maxDate,
    range.start,
    range.end,
  );
  const results = await Promise.all(
    config.metrics.map((metric) =>
      fetchMetrics({
        provider,
        metric: metric.id,
        startDate,
        endDate,
      }).then((rows) => ({ metricId: metric.id, rows })),
    ),
  );

  const chartDataMap: Record<string, { date: string; value: number }[]> = {};
  const metricSummaries: Record<
    string,
    { current: number | null; prev: number | null }
  > = {};

  for (const { metricId, rows } of results) {
    const pts = toLinePoints(rows.filter((row) => !row.breakdownKey));
    chartDataMap[metricId] = pts;
    metricSummaries[metricId] = summarizeSeries(pts);
  }

  const breakdownTotals: Record<string, Record<string, number>> = {};
  if (platform === "linkedin") {
    const totalUsersRows =
      results.find(({ metricId }) => metricId === "TOTAL_USERS")?.rows ?? [];
    const followerRows =
      results.find(({ metricId }) => metricId === "FOLLOWERS")?.rows ?? [];

    breakdownTotals.deviceType = aggregateBreakdownTotals(
      totalUsersRows,
      "deviceType",
    );
    breakdownTotals.pageType = aggregateBreakdownTotals(totalUsersRows, "pageType");
    breakdownTotals.visitorIndustry = aggregateBreakdownTotals(
      totalUsersRows,
      "industry",
    );
    breakdownTotals.followerIndustry = aggregateBreakdownTotals(
      followerRows,
      "industry",
    );
  }

  return {
    platform,
    chartDataMap,
    metricSummaries: Object.fromEntries(
      Object.entries(metricSummaries).map(([key, value]) => [
        key,
        { current: value.current ?? 0, prev: value.prev ?? 0 },
      ]),
    ),
    breakdownTotals,
  };
}
