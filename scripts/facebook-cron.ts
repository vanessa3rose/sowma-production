import { PrismaClient, Metric } from "../src/generated/prisma/index.js";
import fetch from "node-fetch";
import "dotenv/config";
import {
  startOfDay,
  endOfDay,
  toUnixTimestamp,
  formatISODate,
  metricsExistForDay,
} from "../src/utils/dates";

/* -------------------------------------------------
   Prisma Client
-------------------------------------------------- */
const prisma = new PrismaClient();

/* -------------------------------------------------
   Config
-------------------------------------------------- */
const FB_PAGE_ID = process.env.FACEBOOK_PAGE_ID!;
const ACCESS_TOKEN = process.env.FACEBOOK_PAGE_TOKEN!;
const FB_API_VERSION = "v24.0";
const POSTS_LIMIT = 50;

/* -------------------------------------------------
   Type definitions for Facebook API
-------------------------------------------------- */
type InsightsResponse = {
  data?: Array<{
    name: string;
    values?: Array<{ value?: number }>;
  }>;
};

type PostsResponse = {
  data?: Array<{
    created_time: string;
    shares?: { count: number };
    comments?: { summary?: { total_count?: number } };
  }>;
};

/* -------------------------------------------------
   API helpers
-------------------------------------------------- */
async function fetchDailyInsights(date: Date) {
  const since = toUnixTimestamp(startOfDay(date));
  const until = toUnixTimestamp(endOfDay(date));

  // Metrics we want from Facebook Insights API
  const metrics = [
    "page_follows",
    "page_media_view",
    "page_actions_post_reactions_like_total",
  ];

  const url =
    `https://graph.facebook.com/${FB_API_VERSION}/${FB_PAGE_ID}/insights` +
    `?metric=${metrics.join(",")}` +
    `&period=day` +
    `&metric_type=total_value` +
    `&since=${since}&until=${until}` +
    `&access_token=${ACCESS_TOKEN}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(await res.text());

  const json = (await res.json()) as InsightsResponse;

  const out: Record<string, number> = {};

  // Loop over each metric returned
  for (const row of json.data ?? []) {
    out[row.name] = row.values?.[0]?.value ?? 0;
  }

  return {
    followers: out.page_follows ?? 0,
    views: out.page_media_view ?? 0,
    likes: out.page_actions_post_reactions_like_total ?? 0,
  };
}

async function fetchPostsForDay(date: Date) {
  const url =
    `https://graph.facebook.com/${FB_API_VERSION}/${FB_PAGE_ID}/posts` +
    `?fields=created_time,shares,comments.summary(true)` +
    `&limit=${POSTS_LIMIT}` +
    `&access_token=${ACCESS_TOKEN}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(await res.text());

  const json = (await res.json()) as PostsResponse;

  // Filter posts that were created on the target date
  return (json.data ?? []).filter((p) => {
    const t = new Date(p.created_time).getTime();
    return t >= startOfDay(date).getTime() && t <= endOfDay(date).getTime();
  });
}

/* -------------------------------------------------
   Daily Facebook Sync
-------------------------------------------------- */
export async function runDailyFacebookSync() {
  // T-1 (yesterday, UTC)
  const metricDate = startOfDay(new Date(Date.now() - 24 * 60 * 60 * 1000));

  const accounts = await prisma.socialMedia.findMany({
    where: { provider: "FACEBOOK" },
  });

  for (const account of accounts) {
    // Skip if metrics already exist for this day
    if (await metricsExistForDay(account.id, metricDate)) {
      console.log(`[FB] ${account.username} already synced (${formatISODate(metricDate)})`);
      continue;
    }

    console.log(`[FB] Syncing ${account.username} (${formatISODate(metricDate)})`);

    try {
      // Fetch all posts for the day
      const posts = await fetchPostsForDay(metricDate);

      // Aggregate comments, shares, and daysPosted
      const dailyComments = posts.reduce(
        (s, p) => s + (p.comments?.summary?.total_count ?? 0),
        0
      );
      const dailyShares = posts.reduce((s, p) => s + (p.shares?.count ?? 0), 0);
      const daysPosted = posts.length > 0 ? 1 : 0;

      // Fetch daily insights (followers, views, likes)
      const insights = await fetchDailyInsights(metricDate);

      // Prepare all metrics to insert into Prisma
      const metricsToInsert = [
        { metricName: Metric.FOLLOWERS, metricValue: insights.followers },
        { metricName: Metric.VIEWS, metricValue: insights.views },
        { metricName: Metric.LIKES, metricValue: insights.likes },
        { metricName: Metric.COMMENTS, metricValue: dailyComments },
        { metricName: Metric.SHARES, metricValue: dailyShares },
        { metricName: Metric.DAYS_POSTED, metricValue: daysPosted },
      ];

      // Insert all metrics in a single transaction
      await prisma.$transaction(
        metricsToInsert.map((m) =>
          prisma.socialMediaMetrics.create({
            data: {
              socialMediaId: account.id,
              metricName: m.metricName,
              metricValue: m.metricValue,
              metricDate,
              lastSynced: new Date(),
            },
          })
        )
      );
    } catch (err) {
      console.error(
        `[FB] Sync failed for ${account.username} (${formatISODate(metricDate)})`,
        err
      );
    }
  }

  console.log("[FB] Daily Facebook sync complete");

  // Disconnect Prisma
  await prisma.$disconnect();
}