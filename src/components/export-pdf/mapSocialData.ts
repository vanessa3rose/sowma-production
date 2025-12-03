// src/components/export-pdf/mapSocialData.ts

import { SocialMediaExportData } from "../../types/exportTypes";
import { CHART_CONFIGS, Platform } from "../../config/chartConfigs";

// Dummy gender + reach until backend supports them
const defaultDemo = [
  { label: "Men", value: 50 },
  { label: "Women", value: 35 },
  { label: "Not Specified", value: 15 },
];

const defaultReach = [
  { label: "Explore Page", value: 50 },
  { label: "Home", value: 35 },
  { label: "Hashtags", value: 15 },
];

// Creates fake 12-month heatmap based on random data
function generateHeatmap() {
  const months = ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  return months.map((m) => ({
    month: m,
    intensity: Array.from({ length: 20 }, () => Math.random()),
  }));
}

export function mapSocialToExportData(
  platform: Platform,
  chartDataMap: Record<string, { date: string; value: number }[]>,
  metricSummaries: Record<string, { current: number | null; prev: number | null }>
): SocialMediaExportData {
  const cfg = CHART_CONFIGS[platform];

  const getMetric = (metric: string) => {
    const config = cfg.find((c) => c.metric === metric);
    if (!config) return 0;
    return metricSummaries[config.id]?.current ?? 0;
  };

  const getChange = (metric: string) => {
    const config = cfg.find((c) => c.metric === metric);
    if (!config) return "+0%";
    const s = metricSummaries[config.id];
    if (!s || s.current == null || s.prev == null || s.prev === 0) return "+0%";
    const pct = ((s.current - s.prev) / s.prev) * 100;
    const sign = pct >= 0 ? "+" : "";
    return `${sign}${pct.toFixed(1)}% vs. prev.`;
  };

  const impressionsID = cfg[0].id; // first chart ≈ impressions
  const impressionsSeries = chartDataMap[impressionsID] ?? [];

  return {
    platform: platform[0].toUpperCase() + platform.slice(1),

    followers: getMetric("FOLLOWERS"),
    followersChangeLabel: getChange("FOLLOWERS"),

    comments: getMetric("COMMENTS"),
    commentsChangeLabel: getChange("COMMENTS"),

    likes: getMetric("LIKES"),
    likesChangeLabel: getChange("LIKES"),

    shared: getMetric("SHARES"),
    sharedChangeLabel: getChange("SHARES"),

    impressions: impressionsSeries.map((p) => ({
      year: Number(p.date.slice(0, 4)),
      value: p.value,
    })),

    demographics: defaultDemo,
    reachSources: defaultReach,
    daysPosted: generateHeatmap(),
  };
}