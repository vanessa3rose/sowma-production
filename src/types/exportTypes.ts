export interface GoogleAnalyticsExportBundle {
  metrics: {
    activeUsers: number;
    screenPageViews: number;
    active7DayUsers: number;
    engagementRate: number; // 0–1 normalized
    newUsers: number;
  };

  usersOverTime: {
    date: string;
    activeUsers?: number;
    active7DayUsers?: number;
  }[];
  pageviewsOverTime: { date: string; screenPageViews: number }[];

  returningVsNew: { label: string; value: number }[];

  metricSummaries: Record<
    string,
    { current: number | null; prev: number | null }
  >;
}

// ---------- Social Media ----------

export interface SocialExportBundle {
  platform: string;

  followers: number;
  followersDelta: number;

  impressions: number;
  impressionsDelta: number;

  posts: number;
  postsDelta: number;

  engagements: number;
  engagementsDelta: number;

  followersOverTime: { date: string; value: number }[];
  impressionsOverTime: { date: string; value: number }[];
  postsOverTime: { date: string; value: number }[];
  engagementsOverTime: { date: string; value: number }[];

  engagementBreakdown: { label: string; value: number }[];

  chartDataMap: Record<string, { date: string; value: number }[]>;
  metricSummaries: Record<string, { current: number; prev: number }>;
}

// ---------- Union used by PDF exporter ----------

export type ExportCardSelection =
  | { type: "google"; data: GoogleAnalyticsExportBundle }
  | { type: "social"; platform: string; data: SocialExportBundle };
