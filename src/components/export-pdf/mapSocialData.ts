// src/components/export-pdf/mapSocialData.ts

import { SocialMediaExportData } from "../../types/exportTypes";

export function mapSocialToExportData(
  platform: string,
  chartDataMap: any,
  metricSummaries: Record<string, { current: number | null; prev: number | null }>
): SocialMediaExportData {
  const safe = (key: string, fallback = 0) =>
    chartDataMap?.[key]?.current ?? fallback;

  const formatChange = (key: string): string => {
    const s = metricSummaries[key];
    if (!s || s.current == null || s.prev == null || s.prev === 0) return "+0%";
    const pct = ((s.current - s.prev) / s.prev) * 100;
    const sign = pct >= 0 ? "+" : "";
    return `${sign}${pct.toFixed(1)}%`;
  };

  return {
    platform,

    followers: safe("followers"),
    followersChangeLabel: formatChange("followers"),

    comments: safe("comments"),
    commentsChangeLabel: formatChange("comments"),

    likes: safe("likes"),
    likesChangeLabel: formatChange("likes"),

    shared: safe("shared"),
    sharedChangeLabel: formatChange("shared"),

    impressions:
      chartDataMap?.impressions?.map((p: any) => ({
        year: Number(p.date?.slice(0, 4)) || 2024,
        value: p.value ?? 0,
      })) ?? [],

    demographics:
      chartDataMap?.demographics?.map((d: any) => ({
        label: d.label,
        value: d.value,
      })) ?? [],

    reachSources:
      chartDataMap?.reachSources?.map((r: any) => ({
        label: r.label,
        value: r.value,
      })) ?? [],

    daysPosted:
      chartDataMap?.daysPosted?.map((m: any) => ({
        month: m.month,
        intensity: m.intensity ?? [],
      })) ?? [],
  };
}