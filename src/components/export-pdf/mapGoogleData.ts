// src/components/export-pdf/mapGoogleData.ts

import { GoogleAnalyticsExportData } from "../../types/exportTypes";
import type {
  GAMetrics,
  TimePoint,
} from "../../pages/display-pages/GoogleAnalyticsPage";

export function mapGoogleToExportData(
  metrics: GAMetrics | null,
  usersOverTime: TimePoint[],
  pageviewsOverTime: { date: string; screenPageViews: number }[],
  returningVsNew: { label: string; value: number }[],
  metricSummaries: Record<string, { current: number | null; prev: number | null }>
): GoogleAnalyticsExportData {
  const safe = metrics ?? {
    activeUsers: 0,
    screenPageViews: 0,
    active7DayUsers: 0,
    engagementRate: 0,
    newUsers: 0,
  };

  const formatChange = (key: string) => {
    const s = metricSummaries[key];
    if (!s || s.current == null || s.prev == null || s.prev === 0) return "0%";
    const pct = ((s.current - s.prev) / s.prev) * 100;
    const sign = pct >= 0 ? "+" : "";
    return `${sign}${pct.toFixed(1)}%`;
  };

  const impressions = pageviewsOverTime.map((p) => ({
    year: Number(p.date.slice(0, 4)),
    value: p.screenPageViews,
  }));

  return {
    users: safe.activeUsers,
    usersChangeLabel: formatChange("activeUsers"),

    bounceRate: Math.round(safe.engagementRate * 100),
    bounceRateChangeLabel: formatChange("engagementRate"),

    sessionTimeMinutes: 15, // ❗ static — backend doesn’t provide it yet
    sessionTimeChangeLabel: "+0%",

    pagesPerSession: 4, // ❗ static — backend doesn’t provide it
    pagesPerSessionChangeLabel: "+0%",

    newUsersPct: Number(
      (
        (returningVsNew.find((p) => p.label === "New Users")?.value ?? 0) /
        Math.max(safe.activeUsers, 1)
      ).toFixed(2)
    ),

    returningUsersPct: Number(
      (
        (returningVsNew.find((p) => p.label === "Returning Users")?.value ?? 0) /
        Math.max(safe.activeUsers, 1)
      ).toFixed(2)
    ),

    trafficSources: [
      // ❗ static breakdown — GA API doesn't expose source breakdown yet
      { label: "Google Search", value: 30 },
      { label: "Social Media", value: 25 },
      { label: "Email", value: 20 },
      { label: "Youtube", value: 15 },
      { label: "Newsletter", value: 5 },
      { label: "Link", value: 8 },
      { label: "Other", value: 10 },
    ],

    topPages: pageviewsOverTime.slice(-7).map((p) => ({
      label: p.date,
      value: p.screenPageViews,
    })),

    impressions,
  };
}