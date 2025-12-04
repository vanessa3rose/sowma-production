// src/types/exportTypes.ts

// -------------------------------------------------------
// Shared Structures
// -------------------------------------------------------
export interface LinePoint {
  date: string;
  value: number;
}

/* -----------------------------------------------------------
   SOCIAL MEDIA EXPORT BUNDLE
   Used by SocialMediaExportCard + PDF exporter
----------------------------------------------------------- */

export interface SocialMediaExportBundle {
  platformName: string;

  followers: number;
  impressions: number;
  posts: number;
  engagements: number;

  engagementBreakdown: { label: string; value: number }[];

  impressionsOverTime: { date: string; impressions: number }[];
  postsOverTime: { date: string; posts: number }[];
  followersOverTime: { date: string; followers: number }[];
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
  | { type: "social"; data: SocialMediaExportBundle };