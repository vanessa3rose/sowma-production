export type ChartType = "line" | "pie";

export interface ChartConfig {
  id: string;
  title: string;
  type: ChartType;
  metric: string;
}

/**
 * Central configuration for which charts exist per social platform.
 * Used by SocialMediaPage and PDF export.
 */
export const CHART_CONFIGS: Record<string, ChartConfig[]> = {
  instagram: [
    { id: "impressions", title: "Impressions", type: "line", metric: "VIEWS" },
    {
      id: "followers_count",
      title: "Followers",
      type: "line",
      metric: "FOLLOWERS",
    },
    { id: "total_likes", title: "Total Likes", type: "line", metric: "LIKES" },
    {
      id: "total_comments",
      title: "Total Comments",
      type: "line",
      metric: "COMMENTS",
    },
    {
      id: "media_count",
      title: "Media Reactions",
      type: "line",
      metric: "POSTS",
    },
  ],

  twitter: [
    {
      id: "followers_count",
      title: "Followers",
      type: "line",
      metric: "FOLLOWERS",
    },
    {
      id: "following_count",
      title: "Following",
      type: "line",
      metric: "LIKES",
    },
    { id: "tweet_count", title: "Tweet Count", type: "line", metric: "POSTS" },
    {
      id: "listed_count",
      title: "Listed Count",
      type: "line",
      metric: "SHARES",
    },
  ],

  facebook: [
    {
      id: "page_follows",
      title: "Page Follows",
      type: "line",
      metric: "FOLLOWERS",
    },
    {
      id: "page_actions_post_reactions_like_total",
      title: "Total reactions/likes",
      type: "line",
      metric: "LIKES",
    },
    {
      id: "page_media_view",
      title: "Page Views",
      type: "line",
      metric: "VIEWS",
    },
    {
      id: "total_comments",
      title: "Total Comments",
      type: "line",
      metric: "COMMENTS",
    },
    { id: "total_posts", title: "Total Posts", type: "line", metric: "POSTS" },
    {
      id: "total_shares",
      title: "Total Shares",
      type: "line",
      metric: "SHARES",
    },
  ],

  linkedin: [
    // LinkedIn charts mirror imported CSV-backed daily KPIs.
    {
      id: "new_followers",
      title: "New Followers",
      type: "line",
      metric: "FOLLOWERS",
    },
    {
      id: "views",
      title: "Views",
      type: "line",
      metric: "VIEWS",
    },
    {
      id: "likes",
      title: "Reactions",
      type: "line",
      metric: "LIKES",
    },
    {
      id: "comments",
      title: "Comments",
      type: "line",
      metric: "COMMENTS",
    },
    {
      id: "shares",
      title: "Reposts",
      type: "line",
      metric: "SHARES",
    },
    {
      id: "total_interactions",
      title: "Total Interactions",
      type: "line",
      metric: "TOTAL_INTERACTIONS",
    },
  ],

  google: [
    {
      id: "activeUsers",
      title: "Active Users",
      type: "line",
      metric: "ACTIVE_USERS",
    },
    {
      id: "screenPageViews",
      title: "Page Views",
      type: "line",
      metric: "SCREEN_PAGE_VIEWS",
    },
    {
      id: "active7DayUsers",
      title: "Active 7 Day Users",
      type: "line",
      metric: "ACTIVE_7_DAY_USERS",
    },
    {
      id: "engagementRate",
      title: "Engagement Rate",
      type: "line",
      metric: "ENGAGEMENT_RATE",
    },
    { id: "newUsers", title: "New Users", type: "line", metric: "NEW_USERS" },
  ],

  constantcontact: [
    {
      id: "emails_sent",
      title: "Emails Sent",
      type: "line",
      metric: "EMAILS_SENT",
    },
    {
      id: "emails_delivered",
      title: "Emails Delivered",
      type: "line",
      metric: "EMAILS_DELIVERED",
    },
    {
      id: "email_opened",
      title: "Emails Opened",
      type: "line",
      metric: "EMAIL_OPENED",
    },
    {
      id: "emails_clicked",
      title: "Emails Clicked",
      type: "line",
      metric: "EMAILS_CLICKED",
    },
    {
      id: "emails_unsubscribed",
      title: "Unsubscribed",
      type: "line",
      metric: "EMAILS_UNSUBSCRIBED",
    },
  ],
};

/**
 * Platform = union of all keys ("instagram" | "twitter" | "facebook" | "google")
 */
export type Platform = keyof typeof CHART_CONFIGS;

export const PLATFORM_LABELS: Record<Platform, string> = {
  instagram: "Instagram",
  twitter: "Twitter",
  facebook: "Facebook",
  linkedin: "LinkedIn",
  google: "Google Analytics",
  constantcontact: "Constant Contact",
};

export const buildChartDomId = (platform: Platform, chartId: string) =>
  `${platform}-${chartId}`;
