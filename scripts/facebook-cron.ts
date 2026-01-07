import { PrismaClient, Metric } from "../src/generated/prisma";
import fetch from "node-fetch";
import "dotenv/config";
import {
  startOfDay,
  endOfDay,
  toUnixTimestamp,
  formatISODate,
  metricsExistForDay,
} from "../src/utils/dates";

const prisma = new PrismaClient();

const FB_PAGE_ID = process.env.FACEBOOK_PAGE_ID!;
const ACCESS_TOKEN = process.env.FACEBOOK_PAGE_TOKEN!;
const FB_API_VERSION = "v24.0";
const POSTS_LIMIT = 50;

/* -------------------------------------------------
   API helpers
-------------------------------------------------- */

async function fetchDailyInsights(date: Date) {
  const since = toUnixTimestamp(startOfDay(date));
  const until = toUnixTimestamp(endOfDay(date));

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

  const json = await res.json();
  const out: Record<string, number> = {};

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

  const json = await res.json();

  return (json.data ?? []).filter((p: any) => {
    const t = new Date(p.created_time).getTime();
    return (
      t >= startOfDay(date).getTime() &&
      t <= endOfDay(date).getTime()
    );
  });
}

/* -------------------------------------------------
   Daily cron
-------------------------------------------------- */

export async function runDailyFacebookSync() {
  // ---- T-1 (yesterday, UTC) ----
  const metricDate = startOfDay(
    new Date(Date.now() - 24 * 60 * 60 * 1000),
  );

  const accounts = await prisma.socialMedia.findMany({
    where: { provider: "FACEBOOK" },
  });

  for (const account of accounts) {
    if (await metricsExistForDay(account.id, metricDate)) {
      console.log(
        `[FB] ${account.username} already synced (${formatISODate(metricDate)})`,
      );
      continue;
    }

    console.log(
      `[FB] Syncing ${account.username} (${formatISODate(metricDate)})`,
    );

    try {
      const posts = await fetchPostsForDay(metricDate);

      const dailyComments = posts.reduce(
        (s: number, p: any) =>
          s + (p.comments?.summary?.total_count ?? 0),
        0,
      );

      const dailyShares = posts.reduce(
        (s: number, p: any) => s + (p.shares?.count ?? 0),
        0,
      );

      const daysPosted = posts.length > 0 ? 1 : 0;

      const insights = await fetchDailyInsights(metricDate);

      const metricsToInsert = [
        { metricName: Metric.FOLLOWERS, metricValue: insights.followers },
        { metricName: Metric.VIEWS, metricValue: insights.views },
        { metricName: Metric.LIKES, metricValue: insights.likes },
        { metricName: Metric.COMMENTS, metricValue: dailyComments },
        { metricName: Metric.SHARES, metricValue: dailyShares },
        { metricName: Metric.DAYS_POSTED, metricValue: daysPosted },
      ];

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
          }),
        ),
      );
    } catch (err) {
      console.error(
        `[FB] Sync failed for ${account.username} (${formatISODate(metricDate)})`,
        err,
      );
    }
  }

  console.log("[FB] Daily Facebook sync complete");
}

/* -------------------------------------------------
   Entrypoint
-------------------------------------------------- */

(async () => {
  try {
    await runDailyFacebookSync();
  } finally {
    await prisma.$disconnect();
  }
})();
