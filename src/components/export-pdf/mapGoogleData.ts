// src/components/export-pdf/mapGoogleData.ts

import { GoogleAnalyticsExportBundle } from "../../types/exportTypes";
import type {
  GAMetrics,
  TimePoint,
} from "../../pages/display-pages/GoogleAnalyticsPage";

// ======================================================
// MOCK DATA (used ONLY for PDF export)
// ======================================================
const MOCK: GoogleAnalyticsExportBundle = {
  metrics: {
    activeUsers: 5423,
    screenPageViews: 18290,
    active7DayUsers: 1234,
    engagementRate: 0.67,
    newUsers: 840,
  },

  usersOverTime: Array.from({ length: 50 }).map((_, i) => ({
    date: `2024-01-${String(i + 1).padStart(2, "0")}`,
    activeUsers: Math.round(4000 + Math.sin(i / 3) * 1200 + Math.random() * 500),
    active7DayUsers: Math.round(900 + Math.cos(i / 4) * 300),
  })),

  pageviewsOverTime: Array.from({ length: 50 }).map((_, i) => ({
    date: `2024-01-${String(i + 1).padStart(2, "0")}`,
    screenPageViews: Math.round(15000 + Math.sin(i / 5) * 4000),
  })),

  returningVsNew: [
    { label: "New Users", value: 840 },
    { label: "Returning Users", value: 4583 },
  ],

  metricSummaries: {
    activeUsers: { current: 5423, prev: 5100 },
    screenPageViews: { current: 18290, prev: 17800 },
    active7DayUsers: { current: 1234, prev: 1200 },
    engagementRate: { current: 0.67, prev: 0.65 },
    newUsers: { current: 840, prev: 780 },
  },
};

// ======================================================
// EXPORT FUNCTION — but always returns the MOCK data
// ======================================================
export function mapGoogleToExportData(
  _metrics: GAMetrics | null,
  _usersOverTime: TimePoint[],
  _pageviewsOverTime: { date: string; screenPageViews: number }[],
  _returningVsNew: { label: string; value: number }[],
  _metricSummaries: Record<string, { current: number | null; prev: number | null }>
): GoogleAnalyticsExportBundle {
  // 👇 ALWAYS return mock — real data is ignored for now
  return MOCK;
}