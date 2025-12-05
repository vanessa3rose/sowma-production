// src/components/export-pdf/fetchSocialExportBundle.ts

import type { SocialExportBundle } from "../../types/exportTypes";
import { CHART_CONFIGS, Platform } from "../../config/chartConfigs";
import { fetchMetrics, SocialMediaMetric } from "../../utils/fetchMetrics";
import { mapSocialToExportData } from "./mapSocialData";

// Same date window you’ve been using elsewhere
const DEFAULT_START_DATE = "2024-01-01";
const DEFAULT_END_DATE = "3000-01-01";

// Match the provider mapping you use in SocialMediaPage
const PROVIDER_MAP: Record<Platform, string> = {
  instagram: "INSTAGRAM",
  twitter: "TWITTER",
  facebook: "FACEBOOK",
  google: "GOOGLE_ANALYTICS", // we won't actually call this for social export
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
  if (points.length === 0) return { current: null, prev: null };
  if (points.length === 1) return { current: points[0].value, prev: null };
  return {
    current: points[points.length - 1].value,
    prev: points[points.length - 2].value,
  };
}

/**
 * Fetch ALL social metrics needed for export directly from the backend.
 * No dependency on SocialMediaPage state.
 */
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

  // Fetch all metrics defined for this platform in CHART_CONFIGS
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
  const metricSummaries: Record<string, { current: number | null; prev: number | null }> =
    {};

  for (const { cfg, rows } of results) {
    const pts = toLinePoints(rows);
    chartDataMap[cfg.id] = pts;
    metricSummaries[cfg.id] = summarizeSeries(pts);
  }

  console.log("📦 [fetchSocialExportBundle] chartDataMap keys:", Object.keys(chartDataMap));
  console.log("📦 [fetchSocialExportBundle] metricSummaries:", metricSummaries);

  const bundle = mapSocialToExportData(platform, chartDataMap, metricSummaries);

  console.log("✅ [fetchSocialExportBundle] FINAL SOCIAL EXPORT BUNDLE:", bundle);
  return bundle;
}