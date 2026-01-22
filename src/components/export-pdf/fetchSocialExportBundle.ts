// src/components/export-pdf/fetchSocialExportBundle.ts

import type { SocialExportBundle } from "../../types/exportTypes";
import { CHART_CONFIGS, Platform } from "../../config/chartConfigs";
import { fetchMetrics, SocialMediaMetric } from "../../utils/fetchMetrics";
import { mapSocialToExportData } from "./mapSocialData";

const DEFAULT_START_DATE = "2024-01-01";
const DEFAULT_END_DATE = "3000-01-01";

const PROVIDER_MAP: Record<Platform, string> = {
  instagram: "INSTAGRAM",
  twitter: "TWITTER",
  facebook: "FACEBOOK",
  google: "GOOGLE_ANALYTICS",
};

function sortByDate(raw: SocialMediaMetric[]): SocialMediaMetric[] {
  return raw
    .filter((m) => m.metricDate || m.lastSynced)
    .slice()
    .sort((a, b) =>
      (a.metricDate ?? a.lastSynced)!.localeCompare(
        (b.metricDate ?? b.lastSynced)!
      )
    );
}

function toLinePoints(raw: SocialMediaMetric[]): { date: string; value: number }[] {
  return sortByDate(raw).map((m) => ({
    date: (m.metricDate ?? m.lastSynced)!.slice(0, 10),
    value: m.metricValue,
  }));
}

function summarizeSeries(points: { value: number }[]): { current: number | null; prev: number | null } {
  if (points.length === 0) return { current: 0, prev: 0 };
  if (points.length === 1) return { current: points[0].value, prev: 0 };
  return {
    current: points[points.length - 1].value,
    prev: points[points.length - 2].value,
  };
}

export async function fetchSocialExportBundle(
  platform: Platform
): Promise<SocialExportBundle> {
  if (platform === "google") {
    throw new Error("fetchSocialExportBundle should not be called with 'google'");
  }

  const configs = CHART_CONFIGS[platform];
  if (!configs) {
    throw new Error(`No CHART_CONFIGS entry for platform: ${platform}`);
  }

  const provider = PROVIDER_MAP[platform];
  if (!provider) {
    throw new Error(`No provider mapping for platform: ${platform}`);
  }

  const results = await Promise.all(
    configs.map((cfg) =>
      fetchMetrics({
        provider,
        metric: cfg.metric,
        startDate: DEFAULT_START_DATE,
        endDate: DEFAULT_END_DATE,
      }).then((rows) => ({ cfg, rows }))
    )
  );

  const chartDataMap: Record<string, { date: string; value: number }[]> = {};
  const metricSummaries: Record<string, { current: number | null; prev: number | null }> = {};

  for (const { cfg, rows } of results) {
    const pts = toLinePoints(rows);
    chartDataMap[cfg.id] = pts;
    metricSummaries[cfg.id] = summarizeSeries(pts);
  }

  const bundle = mapSocialToExportData(platform, chartDataMap, metricSummaries);
  return bundle;
}