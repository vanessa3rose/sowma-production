import { PrismaClient, Metric } from "../src/generated/prisma/index.js";
import fetch from "node-fetch";
import "dotenv/config";
import {
  startOfDay,
  endOfDay,
  toUnixTimestamp,
  formatISODate,
  metricsExistForDay,
} from "../src/utils/dates.js";

/* -------------------------------------------------
   Prisma Client
-------------------------------------------------- */
const prisma = new PrismaClient();

/* -------------------------------------------------
   Config
-------------------------------------------------- */
const IG_USER_ID = process.env.INSTAGRAM_BUSINESS_PAGE_ID!;
const ACCESS_TOKEN = process.env.FACEBOOK_PAGE_TOKEN!; // IG token often same as FB
const MEDIA_LIMIT = 50;

/* -------------------------------------------------
   Type definitions for Instagram API
-------------------------------------------------- */
type MediaItem = {
  id: string;
  timestamp: string;
  like_count?: number;
  comments_count?: number;
};

type DailyInsights = {
  views?: number;
  reach?: number;
  total_interactions?: number;
};

type AccountTotals = {
  followers_count?: number;
  media_count?: number;
};

/* -------------------------------------------------
   API helpers
-------------------------------------------------- */
async function fetchAccountTotals(): Promise<AccountTotals> {
  const url =
    `https://graph.facebook.com/v20.0/${IG_USER_ID}` +
    `?fields=followers_count,media_count` +
    `&access_token=${ACCESS_TOKEN}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(await res.text());
  return (await res.json()) as AccountTotals;
}

async function fetchDailyInsights(date: Date): Promise<DailyInsights> {
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

  const json = (await res.json()) as {
    data?: Array<{ name: string; values?: Array<{ value?: number }> }>;
  };
  const out: Record<string, number> = {};

  for (const row of json.data ?? []) {
    out[row.name] = row.values?.[0]?.value ?? 0;
  }

  return out;
}

async function fetchMediaForDay(date: Date): Promise<MediaItem[]> {
  const url =
    `https://graph.facebook.com/v20.0/${IG_USER_ID}/media` +
    `?fields=id,like_count,comments_count,timestamp` +
    `&limit=${MEDIA_LIMIT}` +
    `&access_token=${ACCESS_TOKEN}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(await res.text());

  const json = (await res.json()) as { data?: MediaItem[] };
  return (json.data ?? []).filter((m) => {
    const t = new Date(m.timestamp).getTime();
    return t >= startOfDay(date).getTime() && t <= endOfDay(date).getTime();
  });
}

/* -------------------------------------------------
   Daily Instagram Sync
-------------------------------------------------- */
export async function runDailyInstagramSync() {
  // T-1 (yesterday UTC)
  const metricDate = startOfDay(new Date(Date.now() - 24 * 60 * 60 * 1000));

  const accounts = await prisma.socialMedia.findMany({
    where: { provider: "INSTAGRAM" },
  });

  for (const account of accounts) {
    if (await metricsExistForDay(account.id, metricDate)) {
      console.log(
        `[IG] ${account.username} already synced (${formatISODate(metricDate)})`,
      );
      continue;
    }

    console.log(
      `[IG] Syncing ${account.username} (${formatISODate(metricDate)})`,
    );

    try {
      const media = await fetchMediaForDay(metricDate);

      const dailyLikes = media.reduce((sum, m) => sum + (m.like_count ?? 0), 0);
      const dailyComments = media.reduce(
        (sum, m) => sum + (m.comments_count ?? 0),
        0,
      );
      const daysPosted = media.length > 0 ? 1 : 0;

      const insights = await fetchDailyInsights(metricDate);
      const totals = await fetchAccountTotals();

      const metricsToInsert = [
        { metricName: Metric.LIKES, metricValue: dailyLikes },
        { metricName: Metric.COMMENTS, metricValue: dailyComments },
        { metricName: Metric.DAYS_POSTED, metricValue: daysPosted },
        { metricName: Metric.VIEWS, metricValue: insights.views ?? 0 },
        { metricName: Metric.REACH, metricValue: insights.reach ?? 0 },
        {
          metricName: Metric.TOTAL_INTERACTIONS,
          metricValue: insights.total_interactions ?? 0,
        },
        {
          metricName: Metric.FOLLOWERS,
          metricValue: totals.followers_count ?? 0,
        },
        { metricName: Metric.POSTS, metricValue: totals.media_count ?? 0 },
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
        `[IG] Sync failed for ${account.username} (${formatISODate(metricDate)})`,
        err,
      );
    }
  }

  console.log("[IG] Daily Instagram sync complete");

  // Disconnect Prisma
  await prisma.$disconnect();
}
