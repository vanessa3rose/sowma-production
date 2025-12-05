// src/types/exportTypes.ts

// -------------------------------------------------------
// Shared Structures
// -------------------------------------------------------
export interface LinePoint {
  date: string;
  value: number;
}

/* ============================================================
   SOCIAL MEDIA EXPORT TYPE
   ============================================================ */

export interface TimeSeriesPoint {
  date: string;
  value: number;
}

export interface SocialExportBundle {
  platform: string;

  // KPI metrics
  followers: number;
  followersDelta: string;

  impressions: number;
  impressionsDelta: string;

  posts: number;
  postsDelta: string;

  engagements: number;
  engagementsDelta: string;

  // Pie chart
  engagementBreakdown: { label: string; value: number }[];

  // Line charts
  impressionsOverTime: TimeSeriesPoint[];
  postsOverTime: TimeSeriesPoint[];
  followersOverTime: TimeSeriesPoint[];
}

// -------------------------------------------------------
// GOOGLE ANALYTICS PAGE EXPORT TYPE
// Mirrors GoogleAnalyticsPage live data exactly
// -------------------------------------------------------

export interface GoogleAnalyticsExportBundle {
  metrics: {
    activeUsers: number;
    screenPageViews: number;
    active7DayUsers: number;
    engagementRate: number;
    newUsers: number;
  };

  // Line chart data
  usersOverTime: {
    date: string;
    activeUsers?: number;
    active7DayUsers?: number;
  }[];

  pageviewsOverTime: {
    date: string;
    screenPageViews: number;
  }[];

  // Pie chart for New vs Returning
  returningVsNew: {
    label: string;
    value: number;
  }[];

  // Summary metrics used for percent change labels
  metricSummaries: Partial<
    Record<
      | "activeUsers"
      | "screenPageViews"
      | "active7DayUsers"
      | "engagementRate"
      | "newUsers",
      {
        current: number | null;
        prev: number | null;
      }
    >
  >;
}

// -------------------------------------------------------
// Export Card Selection Union
// (used by GlobalPageExportProvider + usePDFExporter)
// -------------------------------------------------------

export type ExportCardSelection =
  | { type: "google"; data: GoogleAnalyticsExportBundle }
  | { type: "social"; data: SocialExportBundle };