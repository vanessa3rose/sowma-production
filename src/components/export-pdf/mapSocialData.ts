// src/components/export-pdf/mapSocialData.ts
import type { SocialExportBundle } from "../../types/exportTypes";

/**
 * Compute a numeric delta (percentage change).
 * If prev is null or 0, returns 0.
 */
function computeDelta(curr: number | null, prev: number | null): number {
  if (curr == null || prev == null || prev === 0) return 0;
  const pct = ((curr - prev) / prev) * 100;
  return Number(pct.toFixed(1));
}

/**
 * Platform-specific ID mapping.
 */
const PLATFORM_MAP = {
  instagram: {
    followersId: "followers",
    impressionsId: "impressions",
    postsId: "media_count",
    likesId: "likes",
    commentsId: "comments",
    sharesId: null,
  },
  twitter: {
    followersId: "followers",
    impressionsId: "tweet_impressions",
    postsId: "tweets",
    likesId: "favorites",
    commentsId: "replies",
    sharesId: "retweets",
  },
  facebook: {
    followersId: "page_follows",
    impressionsId: "page_media_view",
    postsId: "total_posts",
    likesId: "page_actions_post_reactions_like_total",
    commentsId: "total_comments",
    sharesId: "total_shares",
  },
} as const;

type Point = { date: string; value: number };

export function mapSocialToExportData(
  platform: string,
  chartDataMap: Record<string, Point[]>,
  metricSummaries: Record<string, { current: number | null; prev: number | null }>
): SocialExportBundle {
  const map = PLATFORM_MAP[platform as keyof typeof PLATFORM_MAP];
  if (!map) throw new Error(`Unsupported platform: ${platform}`);

  console.log("🔍 EXPORT DEBUG — Platform =", platform);
  console.log("📌 chartDataMap keys:", Object.keys(chartDataMap));
  console.log("📌 metricSummaries:", metricSummaries);

  const followersSeries = chartDataMap[map.followersId] ?? [];
  const impressionsSeries = chartDataMap[map.impressionsId] ?? [];
  const postsSeries = chartDataMap[map.postsId] ?? [];

  const followersSummary = metricSummaries[map.followersId];
  const impressionsSummary = metricSummaries[map.impressionsId];
  const postsSummary = metricSummaries[map.postsId];

  const likesSummary = map.likesId ? metricSummaries[map.likesId] : null;
  const commentsSummary = map.commentsId ? metricSummaries[map.commentsId] : null;
  const sharesSummary = map.sharesId ? metricSummaries[map.sharesId] : null;

  const engagementsCurrent =
    (likesSummary?.current ?? 0) +
    (commentsSummary?.current ?? 0) +
    (sharesSummary?.current ?? 0);

  const engagementsPrev =
    (likesSummary?.prev ?? 0) +
    (commentsSummary?.prev ?? 0) +
    (sharesSummary?.prev ?? 0);

  const engagementBreakdown = [
    { label: "Likes", value: likesSummary?.current ?? 0 },
    { label: "Comments", value: commentsSummary?.current ?? 0 },
    { label: "Shares", value: sharesSummary?.current ?? 0 },
  ];

  // 🔧 normalize metricSummaries to match SocialExportBundle type
  const normalizedSummaries: Record<string, { current: number; prev: number }> = {};
  Object.entries(metricSummaries).forEach(([key, s]) => {
    normalizedSummaries[key] = {
      current: s.current ?? 0,
      prev: s.prev ?? 0,
    };
  });

  // ✅ engagementsOverTime with null-safe IDs and typed callbacks
  const engagementsOverTime = (() => {
    const dates = new Set<string>();

    const addDatesFrom = (id: string | null) => {
      if (!id) return;
      (chartDataMap[id] ?? []).forEach((p: Point) => {
        dates.add(p.date);
      });
    };

    addDatesFrom(map.likesId);
    addDatesFrom(map.commentsId);
    addDatesFrom(map.sharesId);

    const sumSeriesForDate = (id: string | null, date: string): number => {
      if (!id) return 0;
      const arr = chartDataMap[id] ?? [];
      const found = arr.find((p: Point) => p.date === date);
      return found ? found.value : 0;
    };

    return Array.from(dates)
      .sort()
      .map((date) => ({
        date,
        value:
          sumSeriesForDate(map.likesId, date) +
          sumSeriesForDate(map.commentsId, date) +
          sumSeriesForDate(map.sharesId, date),
      }));
  })();

  const bundle: SocialExportBundle = {
    platform,

    followers: followersSummary?.current ?? 0,
    followersDelta: computeDelta(
      followersSummary?.current ?? null,
      followersSummary?.prev ?? null
    ),

    impressions: impressionsSummary?.current ?? 0,
    impressionsDelta: computeDelta(
      impressionsSummary?.current ?? null,
      impressionsSummary?.prev ?? null
    ),

    posts: postsSummary?.current ?? 0,
    postsDelta: computeDelta(
      postsSummary?.current ?? null,
      postsSummary?.prev ?? null
    ),

    engagements: engagementsCurrent,
    engagementsDelta: computeDelta(engagementsCurrent, engagementsPrev),

    engagementBreakdown,
    engagementsOverTime,

    impressionsOverTime: impressionsSeries,
    postsOverTime: postsSeries,
    followersOverTime: followersSeries,

    chartDataMap,
    metricSummaries: normalizedSummaries,
  };

  return bundle;
}