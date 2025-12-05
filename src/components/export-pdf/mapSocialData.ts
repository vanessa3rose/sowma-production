// src/components/export-pdf/mapSocialData.ts

import type { SocialExportBundle } from "../../types/exportTypes";

function computeDelta(curr: number | null, prev: number | null): string {
  if (curr == null || prev == null || prev === 0) return "+ 0%";
  const pct = ((curr - prev) / prev) * 100;
  const sign = pct >= 0 ? "+" : "";
  return `${sign}${pct.toFixed(1)}%`;
}

export function mapSocialToExportData(
  platform: string,
  chartDataMap: Record<string, { date: string; value: number }[]>,
  metricSummaries: Record<string, { current: number | null; prev: number | null }>
): SocialExportBundle {
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

  const followersSeries = followersId ? chartDataMap[followersId] : [];
  const impressionsSeries = impressionsId ? chartDataMap[impressionsId] : [];
  const postsSeries = postsId ? chartDataMap[postsId] : [];

  const followersSummary = followersId ? metricSummaries[followersId] : null;
  const impressionsSummary = impressionsId ? metricSummaries[impressionsId] : null;
  const postsSummary = postsId ? metricSummaries[postsId] : null;

  const likesSummary = likesId ? metricSummaries[likesId] : null;
  const commentsSummary = commentsId ? metricSummaries[commentsId] : null;
  const sharesSummary = sharesId ? metricSummaries[sharesId] : null;

  const engagementsCurrent =
    (likesSummary?.current ?? 0) +
    (commentsSummary?.current ?? 0) +
    (sharesSummary?.current ?? 0);

  const engagementsPrev =
    (likesSummary?.prev ?? 0) +
    (commentsSummary?.prev ?? 0) +
    (sharesSummary?.prev ?? 0);

  const engagementBreakdown = [
    { label: "Comments", value: commentsSummary?.current ?? 0 },
    { label: "Likes", value: likesSummary?.current ?? 0 },
    { label: "Shares", value: sharesSummary?.current ?? 0 },
  ];

  return {
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

    impressionsOverTime: impressionsSeries,
    postsOverTime: postsSeries,
    followersOverTime: followersSeries,
  };
}