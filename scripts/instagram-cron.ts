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

const IG_USER_ID = process.env.INSTAGRAM_BUSINESS_PAGE_ID!;
const ACCESS_TOKEN = process.env.FACEBOOK_PAGE_TOKEN!;
const MEDIA_LIMIT = 50;

/* -------------------------------------------------
   API helpers
-------------------------------------------------- */

async function fetchAccountTotals() {
  const url =
    `https://graph.facebook.com/v20.0/${IG_USER_ID}` +
    `?fields=followers_count,media_count` +
    `&access_token=${ACCESS_TOKEN}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function fetchDailyInsights(date: Date) {
  const since = toUnixTimestamp(startOfDay(date));
  const until = toUnixTimestamp(endOfDay(date));

  const url =
    `https://graph.facebook.com/v20.0/${IG_USER_ID}/insights` +
    `?metric=views,reach,total_interactions` +
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

  return out;
}

async function fetchMediaForDay(date: Date) {
  const url =
    `https://graph.facebook.com/v20.0/${IG_USER_ID}/media` +
    `?fields=like_count,comments_count,timestamp` +
    `&limit=${MEDIA_LIMIT}` +
    `&access_token=${ACCESS_TOKEN}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(await res.text());

  const json = await res.json();

  return (json.data ?? []).filter((m: any) => {
    const t = new Date(m.timestamp).getTime();
    return t >= startOfDay(date).getTime() &&
           t <= endOfDay(date).getTime();
  });
}

/* -------------------------------------------------
   Daily cron
-------------------------------------------------- */

export async function runDailyInstagramSync() {
  const today = startOfDay(new Date());

  const accounts = await prisma.socialMedia.findMany({
    where: { provider: "INSTAGRAM" },
  });

  for (const account of accounts) {
    if (await metricsExistForDay(account.id, today)) {
      console.log(`[IG] ${account.username} already synced`);
      continue;
    }

    console.log(`[IG] Syncing ${account.username} (${formatISODate(today)})`);

    /* ---- daily media metrics ---- */
    const media = await fetchMediaForDay(today);

    const dailyLikes = media.reduce(
      (s: number, m: any) => s + (m.like_count ?? 0),
      0,
    );
    const dailyComments = media.reduce(
      (s: number, m: any) => s + (m.comments_count ?? 0),
      0,
    );
    const daysPosted = media.length > 0 ? 1 : 0;

    /* ---- daily insights ---- */
    const insights = await fetchDailyInsights(today);

    /* ---- account snapshot ---- */
    const totals = await fetchAccountTotals();

    await prisma.socialMediaMetrics.createMany({
      data: [
        {
          socialMediaId: account.id,
          metricName: Metric.LIKES,
          metricValue: dailyLikes,
          metricDate: today,
        },
        {
          socialMediaId: account.id,
          metricName: Metric.COMMENTS,
          metricValue: dailyComments,
          metricDate: today,
        },
        {
          socialMediaId: account.id,
          metricName: Metric.DAYS_POSTED,
          metricValue: daysPosted,
          metricDate: today,
        },
        {
          socialMediaId: account.id,
          metricName: Metric.VIEWS,
          metricValue: insights.views ?? 0,
          metricDate: today,
        },
        {
          socialMediaId: account.id,
          metricName: Metric.REACH,
          metricValue: insights.reach ?? 0,
          metricDate: today,
        },
        {
          socialMediaId: account.id,
          metricName: Metric.TOTAL_INTERACTIONS,
          metricValue: insights.total_interactions ?? 0,
          metricDate: today,
        },
        {
          socialMediaId: account.id,
          metricName: Metric.FOLLOWERS,
          metricValue: totals.followers_count ?? 0,
          metricDate: today,
        },
        {
          socialMediaId: account.id,
          metricName: Metric.POSTS,
          metricValue: totals.media_count ?? 0,
          metricDate: today,
        },
      ],
    });
  }

  console.log("[IG] Daily Instagram sync complete");
}

/* -------------------------------------------------
   Entrypoint
-------------------------------------------------- */

(async () => {
  try {
    await runDailyInstagramSync();
  } catch (err) {
    console.error("Instagram cron failed:", err);
  } finally {
    await prisma.$disconnect();
  }
})();
