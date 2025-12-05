import type { SocialExportBundle } from "../../types/exportTypes";

/**
 * Compute numeric percent delta (not formatted).
 */
function computeDeltaNumber(curr: number | null, prev: number | null): number {
  if (curr == null || prev == null || prev === 0) return 0;
  return ((curr - prev) / prev) * 100;
}

export function mapSocialToExportData(
  platform: string,
  chartDataMap: Record<string, { date: string; value: number }[]>,
  metricSummaries: Record<string, { current: number | null; prev: number | null }>
): SocialExportBundle {
  // ----------- ID AUTODETECTION -----------
  const followersId = Object.keys(chartDataMap).find((id) =>
    id.toLowerCase().includes("follower")
  );

  const impressionsId = Object.keys(chartDataMap).find((id) =>
    id.toLowerCase().includes("view") ||
    id.toLowerCase().includes("impression")
  );

  const postsId = Object.keys(chartDataMap).find((id) =>
    id.toLowerCase().includes("post")
  );

  const likesId = Object.keys(chartDataMap).find((id) =>
    id.toLowerCase().includes("like")
  );

  const commentsId = Object.keys(chartDataMap).find((id) =>
    id.toLowerCase().includes("comment")
  );

  const sharesId = Object.keys(chartDataMap).find((id) =>
    id.toLowerCase().includes("share")
  );

  // ----------- SERIES LOOKUP -----------
  const followersSeries = followersId ? chartDataMap[followersId] : [];
  const impressionsSeries = impressionsId ? chartDataMap[impressionsId] : [];
  const postsSeries = postsId ? chartDataMap[postsId] : [];

  // ----------- SUMMARY LOOKUP -----------
  const followersSummary = followersId ? metricSummaries[followersId] : null;
  const impressionsSummary = impressionsId ? metricSummaries[impressionsId] : null;
  const postsSummary = postsId ? metricSummaries[postsId] : null;

  const likesSummary = likesId ? metricSummaries[likesId] : null;
  const commentsSummary = commentsId ? metricSummaries[commentsId] : null;
  const sharesSummary = sharesId ? metricSummaries[sharesId] : null;

  // ----------- ENGAGEMENT METRICS -----------
  const engagementsCurrent =
    (likesSummary?.current ?? 0) +
    (commentsSummary?.current ?? 0) +
    (sharesSummary?.current ?? 0);

  const engagementsPrev =
    (likesSummary?.prev ?? 0) +
    (commentsSummary?.prev ?? 0) +
    (sharesSummary?.prev ?? 0);

  const engagementOverTime = chartDataMap[engagementsCurrent]
    ? chartDataMap[engagementsCurrent]
    : []; // SAFETY: not always present

  const engagementBreakdown = [
    { label: "Comments", value: commentsSummary?.current ?? 0 },
    { label: "Likes", value: likesSummary?.current ?? 0 },
    { label: "Shares", value: sharesSummary?.current ?? 0 },
  ];

  // ----------- RETURN FULL BUNDLE -----------
  return {
    platform,

    followers: followersSummary?.current ?? 0,
    followersDelta: computeDeltaNumber(
      followersSummary?.current ?? null,
      followersSummary?.prev ?? null
    ),

    impressions: impressionsSummary?.current ?? 0,
    impressionsDelta: computeDeltaNumber(
      impressionsSummary?.current ?? null,
      impressionsSummary?.prev ?? null
    ),

    posts: postsSummary?.current ?? 0,
    postsDelta: computeDeltaNumber(
      postsSummary?.current ?? null,
      postsSummary?.prev ?? null
    ),

    engagements: engagementsCurrent,
    engagementsDelta: computeDeltaNumber(engagementsCurrent, engagementsPrev),

    engagementBreakdown,

    impressionsOverTime: impressionsSeries,
    postsOverTime: postsSeries,
    followersOverTime: followersSeries,
    engagementsOverTime: engagementOverTime,

    chartDataMap,

    // ⭐ FIXED: Always return numbers, never null
    metricSummaries: normalizeSummaries(metricSummaries),
  };
}

function normalizeSummaries(
  metricSummaries: Record<string, { current: number | null; prev: number | null }>
): Record<string, { current: number; prev: number }> {
  const normalized: Record<string, { current: number; prev: number }> = {};

  for (const key of Object.keys(metricSummaries)) {
    const entry = metricSummaries[key];
    normalized[key] = {
      current: entry?.current ?? 0,
      prev: entry?.prev ?? 0,
    };
  }

  return normalized;
}