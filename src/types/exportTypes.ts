// src/types/exportTypes.ts

// -------------------------------------------------------
// Shared Structures
// -------------------------------------------------------
export interface LinePoint {
  date: string;
  value: number;
}

// -------------------------------------------------------
// Social Media Export Types
// -------------------------------------------------------
export interface SocialMediaExportData {
  platform: string;

  followers: number;
  followersChangeLabel: string;

  comments: number;
  commentsChangeLabel: string;

  likes: number;
  likesChangeLabel: string;

  shared: number;
  sharedChangeLabel: string;

  impressions: { year: number; value: number }[];

  demographics: { label: string; value: number }[];

  reachSources: { label: string; value: number }[];

  daysPosted: {
    month: string;
    intensity: number[]; // 0 → 1 normalized heat values
  }[];
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
  | { type: "social"; data: SocialMediaExportData };