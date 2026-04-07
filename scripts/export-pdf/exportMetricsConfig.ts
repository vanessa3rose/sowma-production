import { PLATFORM_LABELS, type Platform } from "../../src/config/chartConfigs";

export type ExportMetricFormat = "number" | "percent" | "decimal" | "seconds";

export type ExportMetricDefinition = {
  id: string;
  label: string;
  format?: ExportMetricFormat;
};

export type ExportChartDefinition = {
  metricId: string;
  title?: string;
};

export type ExportPlatformConfig = {
  platform: Platform;
  label: string;
  metrics: ExportMetricDefinition[];
  charts: ExportChartDefinition[];
};

const GOOGLE_METRICS: ExportMetricDefinition[] = [
  { id: "ACTIVE_USERS", label: "Active Users" },
  { id: "SCREEN_PAGE_VIEWS", label: "Page Views" },
  { id: "ENGAGEMENT_RATE", label: "Engagement Rate", format: "percent" },
  { id: "NEW_USERS", label: "New Users" },
  { id: "BOUNCE_RATE", label: "Bounce Rate", format: "percent" },
  {
    id: "AVG_SESSION_DURATION",
    label: "Avg Session Duration",
    format: "seconds",
  },
  { id: "TOTAL_SESSIONS", label: "Total Sessions" },
  { id: "ENGAGED_SESSIONS", label: "Engaged Sessions" },
  { id: "PAGES_PER_SESSION", label: "Pages Per Session", format: "decimal" },
  { id: "ENGAGEMENT_TIME", label: "Engagement Time", format: "seconds" },
];

const INSTAGRAM_METRICS: ExportMetricDefinition[] = [
  { id: "LIKES", label: "Likes" },
  { id: "COMMENTS", label: "Comments" },
  { id: "FOLLOWERS", label: "Followers" },
];

const FACEBOOK_METRICS: ExportMetricDefinition[] = [
  { id: "LIKES", label: "Likes" },
  { id: "COMMENTS", label: "Comments" },
  { id: "VIEWS", label: "Views" },
  { id: "TOTAL_INTERACTIONS", label: "Total Interactions" },
  { id: "FOLLOWERS", label: "Followers" },
  { id: "VIDEO_VIEWS", label: "Video Views" },
  { id: "WEBSITE_CLICKS", label: "Website Clicks" },
];

const LINKEDIN_METRICS: ExportMetricDefinition[] = [
  { id: "FOLLOWERS", label: "New Followers" },
  { id: "VIEWS", label: "Views" },
  { id: "LIKES", label: "Reactions" },
  { id: "COMMENTS", label: "Comments" },
  { id: "SHARES", label: "Reposts" },
  { id: "TOTAL_INTERACTIONS", label: "Total Interactions" },
];

const TWITTER_METRICS: ExportMetricDefinition[] = [
  { id: "FOLLOWERS", label: "Followers" },
  { id: "POSTS", label: "Posts" },
];

const CONSTANT_CONTACT_METRICS: ExportMetricDefinition[] = [
  { id: "EMAILS_SENT", label: "Emails Sent" },
  { id: "EMAILS_DELIVERED", label: "Emails Delivered" },
  { id: "EMAIL_OPENED", label: "Emails Opened" },
  { id: "EMAILS_CLICKED", label: "Emails Clicked" },
  { id: "EMAILS_UNSUBSCRIBED", label: "Unsubscribed" },
  { id: "EMAIL_BOUNCED", label: "Bounced" },
  { id: "EMAIL_ABUSE", label: "Abuse / Spam" },
  { id: "EMAIL_NOT_OPENED", label: "Not Opened" },
  { id: "EMAIL_FORWARDED", label: "Forwarded" },
  { id: "EMAIL_UNIQUE_OPENS", label: "Unique Opens" },
  { id: "EMAIL_TOTAL_OPENS", label: "Total Opens" },
  { id: "EMAIL_UNIQUE_CLICKS", label: "Unique Clicks" },
  { id: "EMAIL_TOTAL_CLICKS", label: "Total Clicks" },
];

export const EXPORT_PLATFORM_CONFIGS: Record<Platform, ExportPlatformConfig> = {
  google: {
    platform: "google",
    label: PLATFORM_LABELS.google,
    metrics: GOOGLE_METRICS,
    charts: GOOGLE_METRICS.map((metric) => ({
      metricId: metric.id,
      title: metric.label,
    })),
  },
  instagram: {
    platform: "instagram",
    label: PLATFORM_LABELS.instagram,
    metrics: INSTAGRAM_METRICS,
    charts: INSTAGRAM_METRICS.map((metric) => ({
      metricId: metric.id,
      title: metric.label,
    })),
  },
  facebook: {
    platform: "facebook",
    label: PLATFORM_LABELS.facebook,
    metrics: FACEBOOK_METRICS,
    charts: FACEBOOK_METRICS.map((metric) => ({
      metricId: metric.id,
      title: metric.label,
    })),
  },
  linkedin: {
    platform: "linkedin",
    label: PLATFORM_LABELS.linkedin,
    metrics: LINKEDIN_METRICS,
    // Keep chart count/order aligned to the LinkedIn page (not one chart per KPI).
    charts: [
      { metricId: "FOLLOWERS", title: "New Followers" },
      { metricId: "VIEWS", title: "Views" },
      { metricId: "TOTAL_INTERACTIONS", title: "Total Interactions" },
    ],
  },
  twitter: {
    platform: "twitter",
    label: PLATFORM_LABELS.twitter,
    metrics: TWITTER_METRICS,
    charts: TWITTER_METRICS.map((metric) => ({
      metricId: metric.id,
      title: metric.label,
    })),
  },

  constantcontact: {
    platform: "constantcontact",
    label: PLATFORM_LABELS.constantcontact,
    metrics: CONSTANT_CONTACT_METRICS,
    charts: CONSTANT_CONTACT_METRICS.map((metric) => ({
      metricId: metric.id,
      title: metric.label,
    })),
  },
};
