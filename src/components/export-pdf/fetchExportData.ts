// src/components/export-pdf/fetchExportData.ts

import { fetchMetrics, SocialMediaMetric } from "../../utils/fetchMetrics";
import { CHART_CONFIGS, Platform } from "../../config/chartConfigs";
import {
  SocialExportBundle,
  GoogleAnalyticsExportBundle,
} from "../../types/exportTypes";

// ---------- Helpers ----------

function sortByDate(raw: SocialMediaMetric[]) {
  return raw
    .filter((m) => m.metricDate || m.lastSynced)
    .slice()
    .sort((a, b) =>
      (a.metricDate ?? a.lastSynced)!.localeCompare(
        (b.metricDate ?? b.lastSynced)!,
      ),
    );
}

function toLinePoints(raw: SocialMediaMetric[]) {
  return sortByDate(raw).map((m) => ({
    date: (m.metricDate ?? m.lastSynced)!.slice(0, 10),
    value: m.metricValue,
  }));
}

function summarizeSeries(series: { value: number }[]) {
  const len = series.length;
  if (len === 0) return { current: 0, prev: 0 };
  if (len === 1) return { current: series[0].value, prev: 0 };

  return {
    current: series[len - 1].value,
    prev: series[len - 2].value,
  };
}

// ---------- Provider Enum Mapping ----------

function providerFromPlatform(platform: Platform): string {
  switch (platform) {
    case "instagram":
      return "INSTAGRAM";
    case "twitter":
      return "TWITTER";
    case "facebook":
      return "FACEBOOK";
    case "google":
      return "GOOGLE_ANALYTICS";
    default:
      // Fallback – should never happen if Platform is kept in sync
      return "INSTAGRAM";
  }
}

// ========== FETCH GOOGLE ANALYTICS EXPORT DATA ==========

export async function fetchGoogleExportBundle(): Promise<GoogleAnalyticsExportBundle> {
  const provider = "GOOGLE_ANALYTICS";
  const startDate = "2024-01-01";
  const endDate = "3000-01-01";

  const [activeUsersRaw, pvRaw, active7Raw, engagementRaw, newUsersRaw] =
    await Promise.all([
      fetchMetrics({ provider, metric: "ACTIVE_USERS", startDate, endDate }),
      fetchMetrics({
        provider,
        metric: "SCREEN_PAGE_VIEWS",
        startDate,
        endDate,
      }),
      fetchMetrics({
        provider,
        metric: "ACTIVE_7_DAY_USERS",
        startDate,
        endDate,
      }),
      fetchMetrics({
        provider,
        metric: "ENGAGEMENT_RATE",
        startDate,
        endDate,
      }),
      fetchMetrics({ provider, metric: "NEW_USERS", startDate, endDate }),
    ]);

  const active = toLinePoints(activeUsersRaw);
  const pageviews = toLinePoints(pvRaw);
  const active7 = toLinePoints(active7Raw);
  const engagement = toLinePoints(engagementRaw);
  const newUsers = toLinePoints(newUsersRaw);

  const summaries = {
    activeUsers: summarizeSeries(active),
    screenPageViews: summarizeSeries(pageviews),
    active7DayUsers: summarizeSeries(active7),
    engagementRate: summarizeSeries(engagement),
    newUsers: summarizeSeries(newUsers),
  };

  const mergedUsers = (() => {
    const map: Record<
      string,
      { date: string; activeUsers?: number; active7DayUsers?: number }
    > = {};

    active.forEach((p) => {
      if (!map[p.date]) map[p.date] = { date: p.date };
      map[p.date].activeUsers = p.value;
    });

    active7.forEach((p) => {
      if (!map[p.date]) map[p.date] = { date: p.date };
      map[p.date].active7DayUsers = p.value;
    });

    return Object.values(map).sort((a, b) => a.date.localeCompare(b.date));
  })();

  const pageSeries = pageviews.map((p) => ({
    date: p.date,
    screenPageViews: p.value,
  }));

  return {
    metrics: {
      activeUsers: summaries.activeUsers.current,
      screenPageViews: summaries.screenPageViews.current,
      active7DayUsers: summaries.active7DayUsers.current,
      engagementRate:
        summaries.engagementRate.current != null
          ? summaries.engagementRate.current / 100
          : 0,
      newUsers: summaries.newUsers.current,
    },

    usersOverTime: mergedUsers,
    pageviewsOverTime: pageSeries,

    returningVsNew: [
      { label: "New Users", value: summaries.newUsers.current },
      {
        label: "Returning Users",
        value: Math.max(
          summaries.activeUsers.current - summaries.newUsers.current,
          0,
        ),
      },
    ],

    metricSummaries: summaries,
  };
}

// ========== FETCH SOCIAL PLATFORM EXPORT DATA ==========

export async function fetchSocialExportBundle(
  platform: Platform,
): Promise<SocialExportBundle> {
  const provider = providerFromPlatform(platform);
  const startDate = "2024-01-01";
  const endDate = "3000-01-01";

  const configs = CHART_CONFIGS[platform];

  const results = await Promise.all(
    configs.map((cfg) =>
      fetchMetrics({
        provider,
        metric: cfg.metric,
        startDate,
        endDate,
      }).then((rows) => ({
        cfg,
        series: toLinePoints(rows),
      })),
    ),
  );

  // bucket data
  const chartDataMap: Record<string, { date: string; value: number }[]> = {};
  const metricSummaries: Record<string, { current: number; prev: number }> = {};

  for (const { cfg, series } of results) {
    chartDataMap[cfg.id] = series;
    metricSummaries[cfg.id] = summarizeSeries(series);
  }

  const followersSeries = chartDataMap["followers_count"] ?? [];
  const impressionsSeries = chartDataMap["impressions"] ?? [];
  const postsSeries = chartDataMap["media_count"] ?? [];
  const engagementsSeries = chartDataMap["total_likes"] ?? [];

  return {
    platform,

    followers: metricSummaries["followers_count"]?.current ?? 0,
    followersDelta:
      metricSummaries["followers_count"]?.current -
      (metricSummaries["followers_count"]?.prev ?? 0),

    impressions: metricSummaries["impressions"]?.current ?? 0,
    impressionsDelta:
      metricSummaries["impressions"]?.current -
      (metricSummaries["impressions"]?.prev ?? 0),

    posts: metricSummaries["media_count"]?.current ?? 0,
    postsDelta:
      metricSummaries["media_count"]?.current -
      (metricSummaries["media_count"]?.prev ?? 0),

    engagements: metricSummaries["total_likes"]?.current ?? 0,
    engagementsDelta:
      metricSummaries["total_likes"]?.current -
      (metricSummaries["total_likes"]?.prev ?? 0),

    followersOverTime: followersSeries,
    impressionsOverTime: impressionsSeries,
    postsOverTime: postsSeries,
    engagementsOverTime: engagementsSeries,

    engagementBreakdown: [
      { label: "Likes", value: metricSummaries["total_likes"]?.current ?? 0 },
      {
        label: "Comments",
        value: metricSummaries["total_comments"]?.current ?? 0,
      },
      { label: "Shares", value: metricSummaries["total_shares"]?.current ?? 0 },
    ],

    chartDataMap,
    metricSummaries,
  };
}
