// src/types/exportTypes.ts

export type SocialPlatform = "Instagram" | "Twitter" | "Facebook" | "Google"; // extend as needed

// Whatever you already have for Google Analytics.
// Adjust these fields to match your real data shape.
export interface GoogleAnalyticsExportData {
  users: number;
  usersChangeLabel: string;           // e.g. "2% increase from last year"
  bounceRate: number;                 // 0–100
  bounceRateChangeLabel: string;
  sessionTimeMinutes: number;
  sessionTimeChangeLabel: string;
  pagesPerSession: number;
  pagesPerSessionChangeLabel: string;

  newUsersPct: number;
  returningUsersPct: number;

  trafficSources: {
    label: string;
    value: number;
  }[];

  topPages: {
    label: string;
    value: number;
  }[];

  impressions: {
    year: number;
    value: number;
  }[];
}

// Generic “summary” for a social media platform.
// Again, wire this to whatever you already fetch.
export interface SocialMediaExportData {
  platform: Exclude<SocialPlatform, "Google">;

  // KPI tiles
  followers: number;
  followersChangeLabel: string;
  comments: number;
  commentsChangeLabel: string;
  likes: number;
  likesChangeLabel: string;
  shared: number;
  sharedChangeLabel: string;

  // Line chart for impressions
  impressions: {
    year: number;
    value: number;
  }[];

  // Donut for gender/demo
  demographics: {
    label: string; // "Men" | "Women" | "Not Specified"
    value: number; // percentage
  }[];

  // Donut for reach sources
  reachSources: {
    label: string; // "Explore Page" etc.
    value: number; // percentage
  }[];

  // Heatmap-ish calendar for days posted
  daysPosted: {
    month: string; // "Nov", "Dec", etc.
    intensity: number[]; // 30 or so entries, 0-1 scale for color
  }[];
}

export type ExportCardSelection =
  | { type: "google"; data: GoogleAnalyticsExportData }
  | { type: "social"; data: SocialMediaExportData };