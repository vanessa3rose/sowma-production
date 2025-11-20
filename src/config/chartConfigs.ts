/**
 * Central configuration for which charts exist per social platform.
 * This is used both by the SocialMediaPage (to render charts)
 * and the ExportModal / export system.
 *
 * ⚠ Each config MUST include `metric` so SocialMediaPage
 *    can fetch backend data correctly.
 */
export const CHART_CONFIGS = {
  instagram: [
    { id: "impressions",       title: "Impressions",      type: "line", metric: "VIEWS" },
    { id: "followers_count",   title: "Followers",        type: "line", metric: "FOLLOWERS" },
    { id: "total_likes",       title: "Total Likes",      type: "line", metric: "LIKES" },
    { id: "total_comments",    title: "Total Comments",   type: "line", metric: "COMMENTS" },
    { id: "media_count",       title: "Media Reactions",  type: "line", metric: "POSTS" },
  ],

  twitter: [
    { id: "followers_count",   title: "Followers",        type: "line", metric: "FOLLOWERS" },
    { id: "following_count",   title: "Following",        type: "line", metric: "LIKES" },     // adjust if backend differs
    { id: "tweet_count",       title: "Tweet Count",      type: "line", metric: "POSTS" },
    { id: "listed_count",      title: "Listed Count",     type: "line", metric: "SHARES" },    // adjust if needed
  ],

  facebook: [
    { id: "page_follows",                            title: "Page Follows",         type: "line", metric: "FOLLOWERS" },
    { id: "page_actions_post_reactions_like_total",  title: "Total reactions/likes", type: "line", metric: "LIKES" },
    { id: "page_media_view",                         title: "Page Views",           type: "line", metric: "VIEWS" },
    { id: "total_comments",                          title: "Total Comments",       type: "line", metric: "COMMENTS" },
    { id: "total_posts",                             title: "Total Posts",          type: "line", metric: "POSTS" },
    { id: "total_shares",                            title: "Total Shares",         type: "line", metric: "SHARES" },
  ],

  google: [
    { id: "activeUsers",       title: "Active Users",        type: "line", metric: "ACTIVE_USERS" },
    { id: "screenPageViews",   title: "Page Views",          type: "line", metric: "SCREEN_PAGE_VIEWS" },
    { id: "active7DayUsers",   title: "Active 7 Day Users",  type: "line", metric: "ACTIVE_7_DAY_USERS" },
    { id: "engagementRate",    title: "Engagement Rate",     type: "line", metric: "ENGAGEMENT_RATE" },
    { id: "newUsers",          title: "New Users",           type: "line", metric: "NEW_USERS" },
  ],
} as const;

/** All valid social platforms supported by the dashboard. */
export type Platform = keyof typeof CHART_CONFIGS;

/**
 * Human-readable labels for platforms, for use in the UI.
 */
export const PLATFORM_LABELS: Record<Platform, string> = {
  instagram: "Instagram",
  twitter: "Twitter",
  facebook: "Facebook",
  google: "Google Analytics",
};

/**
 * Helper to generate a stable DOM/chart ID.
 */
export const buildChartDomId = (platform: Platform, chartId: string) =>
  `${platform}-${chartId}`;