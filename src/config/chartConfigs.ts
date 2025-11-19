/**
 * Central configuration for which charts exist per social platform.
 * This is used both by the SocialMediaPage (to render charts)
 * and the ExportModal (to know which platforms are exportable).
 */
export const CHART_CONFIGS = {
  instagram: [
    { id: "impressions", title: "Impressions", type: "line" },
    { id: "followers_count", title: "Followers", type: "line" },
    { id: "total_likes", title: "Total Likes", type: "line" },
    { id: "total_comments", title: "Total Comments", type: "line" },
    { id: "media_count", title: "Media Reactions", type: "line" },
  ],
  twitter: [
    { id: "followers_count", title: "Followers", type: "line" },
    { id: "following_count", title: "Following", type: "line" },
    { id: "tweet_count", title: "Tweet Count", type: "line" },
    { id: "listed_count", title: "Listed Count", type: "line" },
  ],
  facebook: [
    { id: "page_follows", title: "Page Follows", type: "line" },
    {
      id: "page_actions_post_reactions_like_total",
      title: "Total reactions/likes",
      type: "line",
    },
    { id: "page_media_view", title: "Page Views", type: "line" },
    { id: "total_comments", title: "Total Comments", type: "line" },
    { id: "total_posts", title: "Total Posts", type: "line" },
    { id: "total_shares", title: "Total Shares", type: "line" },
  ],
  google: [
    { id: "activeUsers", title: "Active Users", type: "line" },
    { id: "screenPageViews", title: "Page Views", type: "line" },
    { id: "active7DayUsers", title: "Active 7 Day Users", type: "line" },
    { id: "engagementRate", title: "Engagement Rate", type: "line" },
    { id: "newUsers", title: "New Users", type: "line" },
  ],
} as const;

/** All valid social platforms supported by the dashboard. */
export type Platform = keyof typeof CHART_CONFIGS;

/**
 * Human-readable labels for platforms, for use in the UI.
 * Keeps display names and internal keys in one place.
 */
export const PLATFORM_LABELS: Record<Platform, string> = {
  instagram: "Instagram",
  twitter: "Twitter",
  facebook: "Facebook",
  google: "Google Analytics",
};

/**
 * Helper to generate a stable DOM/chart ID for a platform + chart.
 * This MUST stay in sync with IDs used in ExportableChartWrapper.
 */
export const buildChartDomId = (platform: Platform, chartId: string) =>
  `${platform}-${chartId}`;
