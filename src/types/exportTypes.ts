export interface GoogleAnalyticsExportBundle {
  chartDataMap: Record<string, { date: string; value: number }[]>;
  metricSummaries: Record<
    string,
    { current: number | null; prev: number | null }
  >;
  countyTotals?: Record<string, number>;
  sourceTotals?: Record<string, number>;
  deviceTotals?: Record<string, number>;
  newVsReturning?: {
    newUsers: number;
    returningUsers: number;
  };
  pageViewsAsOf?: string | null;
}

// ---------- Social Media ----------

export interface SocialExportBundle {
  platform: string;
  chartDataMap: Record<string, { date: string; value: number }[]>;
  metricSummaries: Record<string, { current: number; prev: number }>;
  breakdownTotals?: Record<string, Record<string, number>>;
}

// ---------- Union used by PDF exporter ----------

export type ExportCardSelection =
  | { type: "google"; data: GoogleAnalyticsExportBundle }
  | { type: "social"; platform: string; data: SocialExportBundle };
