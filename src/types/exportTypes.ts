export interface GoogleAnalyticsExportBundle {
  chartDataMap: Record<string, { date: string; value: number }[]>;
  metricSummaries: Record<
    string,
    { current: number | null; prev: number | null }
  >;
}

// ---------- Social Media ----------

export interface SocialExportBundle {
  platform: string;
  chartDataMap: Record<string, { date: string; value: number }[]>;
  metricSummaries: Record<string, { current: number; prev: number }>;
}

// ---------- Union used by PDF exporter ----------

export type ExportCardSelection =
  | { type: "google"; data: GoogleAnalyticsExportBundle }
  | { type: "social"; platform: string; data: SocialExportBundle };
