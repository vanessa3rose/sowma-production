export interface MetricConfig {
  id: string;
  title: string;
  metric: string;
  breakdownKeys?: Array<BreakdownKeyOption>;
}

export type Platform =
  | "instagram"
  | "twitter"
  | "facebook"
  | "linkedin"
  | "google"
  | "constantcontact";

export type BreakdownKeyId =
  | "sessionSource"
  | "deviceCategory"
  | "county"
  | "newVsReturning"
  | "location"
  | "jobFunction"
  | "seniority"
  | "industry"
  | "companySize"
  | "pageType"
  | "deviceType";

export const BREAKDOWN_KEY_LABELS: Record<BreakdownKeyId, string> = {
  sessionSource: "Session Source",
  deviceCategory: "Device Category",
  county: "County",
  newVsReturning: "New vs Returning",
  location: "Location",
  jobFunction: "Job Function",
  seniority: "Seniority",
  industry: "Industry",
  companySize: "Company Size",
  pageType: "Page Type",
  deviceType: "Device Type",
};

export type BreakdownKeyOption = {
  key: BreakdownKeyId;
  label: string;
};

export const PLATFORM_LABELS: Record<Platform, string> = {
  instagram: "Instagram",
  twitter: "Twitter",
  facebook: "Facebook",
  linkedin: "LinkedIn",
  google: "Google Analytics",
  constantcontact: "Constant Contact",
};

/**
 * Central configuration for which charts exist per social platform.
 * Used by SocialMediaPage and PDF export.
 */
export const PLATFORM_CONFIGS: Partial<Record<Platform, MetricConfig[]>> = {
  google: [
    { id: "active_users", title: "Active Users", metric: "ACTIVE_USERS" },
    {
      id: "active_7_day_users",
      title: "Active 7-Day Users",
      metric: "ACTIVE_7_DAY_USERS",
    },
    {
      id: "screen_page_views",
      title: "Page Views",
      metric: "SCREEN_PAGE_VIEWS",
    },
    { id: "new_users", title: "New Users", metric: "NEW_USERS" },
    {
      id: "sessions",
      title: "Sessions",
      metric: "TOTAL_SESSIONS",
      breakdownKeys: [
        { key: "county", label: "County" },
        { key: "deviceCategory", label: "Device Category" },
        { key: "newVsReturning", label: "New VS Returning" },
      ],
    },
    {
      id: "engaged_sessions",
      title: "Engaged Sessions",
      metric: "ENGAGED_SESSIONS",
    },
    {
      id: "sessions_by_source",
      title: "Sessions By Source",
      metric: "SESSIONS_BY_SOURCE",
      breakdownKeys: [{ key: "sessionSource", label: "Session Source" }],
    },
    {
      id: "engagement_rate",
      title: "Engagement Rate",
      metric: "ENGAGEMENT_RATE",
    },
    { id: "bounce_rate", title: "Bounce Rate", metric: "BOUNCE_RATE" },
    {
      id: "avg_session_duration",
      title: "Avg Session Duration",
      metric: "AVG_SESSION_DURATION",
    },
    {
      id: "pages_per_session",
      title: "Pages per Session",
      metric: "PAGES_PER_SESSION",
    },
    {
      id: "engagement_time",
      title: "Engagement Time",
      metric: "ENGAGEMENT_TIME",
    },
  ],

  constantcontact: [
    { id: "emails_sent", title: "Emails Sent", metric: "EMAILS_SENT" },
    {
      id: "emails_delivered",
      title: "Emails Delivered",
      metric: "EMAILS_DELIVERED",
    },
    { id: "email_opens", title: "Unique Opens", metric: "EMAIL_OPENED" },
    { id: "email_clicks", title: "Unique Clicks", metric: "EMAILS_CLICKED" },
    {
      id: "email_unsubscribed",
      title: "Unsubscribes",
      metric: "EMAILS_UNSUBSCRIBED",
    },
    { id: "email_bounced", title: "Bounces", metric: "EMAIL_BOUNCED" },
    { id: "email_forwarded", title: "Forwards", metric: "EMAIL_FORWARDED" },
    { id: "email_not_opened", title: "Not Opened", metric: "EMAIL_NOT_OPENED" },
    { id: "email_abuse", title: "Abuse Reports", metric: "EMAIL_ABUSE" },
    {
      id: "email_total_opens",
      title: "Total Opens",
      metric: "EMAIL_TOTAL_OPENS",
    },
    {
      id: "email_total_clicks",
      title: "Total Clicks",
      metric: "EMAIL_TOTAL_CLICKS",
    },
  ],

  facebook: [
    { id: "followers", title: "Followers", metric: "FOLLOWERS" },
    { id: "views", title: "Views", metric: "VIEWS" },
    { id: "video_views", title: "Video Views", metric: "VIDEO_VIEWS" },
    { id: "likes", title: "Likes", metric: "LIKES" },
    { id: "comments", title: "Comments", metric: "COMMENTS" },
    { id: "shares", title: "Shares", metric: "SHARES" },
    { id: "days_posted", title: "Days Posted", metric: "DAYS_POSTED" },
  ],

  instagram: [
    { id: "followers", title: "Followers", metric: "FOLLOWERS" },
    { id: "posts", title: "Posts", metric: "POSTS" },
    { id: "likes", title: "Likes", metric: "LIKES" },
    { id: "comments", title: "Comments", metric: "COMMENTS" },
    { id: "views", title: "Views", metric: "VIEWS" },
    { id: "reach", title: "Reach", metric: "REACH" },
    {
      id: "interactions",
      title: "Total Interactions",
      metric: "TOTAL_INTERACTIONS",
    },
    { id: "shares", title: "Shares", metric: "SHARES" },
    { id: "saves", title: "Saves", metric: "SAVES" },
    { id: "profile_views", title: "Profile Views", metric: "PROFILE_VIEWS" },
    { id: "website_clicks", title: "Website Clicks", metric: "WEBSITE_CLICKS" },
  ],

  linkedin: [
    {
      id: "followers",
      title: "Followers",
      metric: "FOLLOWERS",
      breakdownKeys: [
        { key: "companySize", label: "Company Size" },
        { key: "industry", label: "Industry" },
        { key: "jobFunction", label: "Job Function" },
        { key: "location", label: "Location" },
        { key: "seniority", label: "Seniority" },
      ],
    },
    { id: "likes", title: "Likes", metric: "LIKES" },
    { id: "comments", title: "Comments", metric: "COMMENTS" },
    { id: "shares", title: "Shares", metric: "SHARES" },
    { id: "views", title: "Views", metric: "VIEWS" },
    {
      id: "total_interactions",
      title: "Total Interactions",
      metric: "TOTAL_INTERACTIONS",
    },
    {
      id: "unique_visitors",
      title: "Unique Visitors",
      metric: "TOTAL_USERS",
      breakdownKeys: [
        { key: "companySize", label: "Company Size" },
        { key: "industry", label: "Industry" },
        { key: "jobFunction", label: "Job Function" },
        { key: "location", label: "Location" },
        { key: "seniority", label: "Seniority" },
        { key: "deviceType", label: "Device Type" },
        { key: "pageType", label: "Page Type" },
      ],
    },
    { id: "days_posted", title: "Days Posted", metric: "DAYS_POSTED" },
  ],

  twitter: [
    { id: "followers", title: "Followers", metric: "FOLLOWERS" },
    { id: "posts", title: "Posts (Tweets)", metric: "POSTS" },
  ],
};

export const buildChartDomId = (platform: Platform, chartId: string) =>
  `${platform}-${chartId}`;
