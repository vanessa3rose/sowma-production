import { PrismaClient, Metric } from "../src/generated/prisma/index.js";
import fetch from "node-fetch";
import "dotenv/config";
import {
  startOfDay,
  endOfDay,
  toUnixTimestamp,
  formatISODate,
} from "../src/utils/dates";

/* -------------------------------------------------
   Prisma setup (serverless-friendly)
-------------------------------------------------- */
const prisma = (globalThis as any).prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") (globalThis as any).prisma = prisma;

/* -------------------------------------------------
   Constants
-------------------------------------------------- */
const FACEBOOK_PAGE_ID = process.env.FACEBOOK_PAGE_ID!;
const ACCESS_TOKEN = process.env.FACEBOOK_PAGE_TOKEN!;
const FB_API_VERSION = "v24.0";
const MAX_LOOKBACK_DAYS = 730;

/* -------------------------------------------------
   Helpers
-------------------------------------------------- */
async function metricsExistForDay(
  socialMediaId: string,
  date: Date,
): Promise<boolean> {
  const existing = await prisma.socialMediaMetrics.findFirst({
    where: {
      socialMediaId,
      metricDate: { gte: startOfDay(date), lt: endOfDay(date) },
    },
  });
  return existing !== null;
}

async function getEarliestStoredDate(
  socialMediaId: string,
): Promise<Date | null> {
  const row = await prisma.socialMediaMetrics.findFirst({
    where: { socialMediaId },
    orderBy: { metricDate: "asc" },
  });
  return row?.metricDate ?? null;
}

function getEarliestPossibleDate(): Date {
  const d = new Date();
  d.setDate(d.getDate() - MAX_LOOKBACK_DAYS);
  return startOfDay(d);
}

/* -------------------------------------------------
   Facebook API fetchers
-------------------------------------------------- */

type FBInsightResponse = {
  data?: { values?: { value?: number }[]; name?: string }[];
};

async function fetchDailyInsights(date: Date) {
  const since = toUnixTimestamp(startOfDay(date));
  const until = toUnixTimestamp(endOfDay(date));
  const metrics = [
    "page_follows",
    "page_actions_post_reactions_like_total",
    "page_media_view",
  ];
  const out: Record<string, number> = {};

  for (const metric of metrics) {
    const url =
      `https://graph.facebook.com/${FB_API_VERSION}/${FACEBOOK_PAGE_ID}/insights` +
      `?metric=${metric}&period=day&since=${since}&until=${until}` +
      `&access_token=${ACCESS_TOKEN}`;
    const res = await fetch(url);
    if (!res.ok) {
      out[metric] = 0;
      continue;
    }

    const json = (await res.json()) as FBInsightResponse;
    const values = json.data?.[0]?.values ?? [];
    out[metric] =
      metric === "page_follows"
        ? (values[values.length - 1]?.value ?? 0)
        : values.reduce((s, v) => s + (v.value ?? 0), 0);
  }

  return out;
}

type FBPostsResponse = {
  data?: {
    shares?: { count?: number };
    comments?: { summary?: { total_count?: number } };
    created_time?: string;
  }[];
  paging?: { next?: string };
};

async function fetchDailyPostMetrics(date: Date) {
  const since = toUnixTimestamp(startOfDay(date));
  const until = toUnixTimestamp(endOfDay(date));
  let url: string | null =
    `https://graph.facebook.com/${FB_API_VERSION}/${FACEBOOK_PAGE_ID}/posts?fields=shares,comments.summary(true),created_time&since=${since}&until=${until}&access_token=${ACCESS_TOKEN}`;
  let posts: FBPostsResponse["data"] = [];

  while (url) {
    const res = await fetch(url);
    if (!res.ok) break;

    const json = (await res.json()) as FBPostsResponse;
    posts.push(...(json.data ?? []));
    url = json.paging?.next ?? null;
  }

  return {
    posts: posts.length,
    shares: posts.reduce((s, p) => s + (p.shares?.count ?? 0), 0),
    comments: posts.reduce(
      (s, p) => s + (p.comments?.summary?.total_count ?? 0),
      0,
    ),
  };
}

/* -------------------------------------------------
   Main backfill
-------------------------------------------------- */
export async function runDailyFacebookSync() {
  console.log("[FB] Script starting");

  const account = await prisma.socialMedia.findFirst({
    where: { provider: "FACEBOOK" },
  });
  if (!account) {
    console.log("[FB] No Facebook account found");
    return;
  }

  const today = startOfDay(new Date());
  const earliestPossible = getEarliestPossibleDate();

  let currentDate = earliestPossible;
  console.log(
    `[FB] Backfilling from ${formatISODate(currentDate)} to ${formatISODate(today)}`,
  );

  while (currentDate <= today) {
    const dateStr = formatISODate(currentDate);
    console.log(`[FB] Processing ${dateStr}`);

    if (await metricsExistForDay(account.id, currentDate)) {
      currentDate.setDate(currentDate.getDate() + 1);
      continue;
    }

    try {
      const insights = await fetchDailyInsights(currentDate);
      const posts = await fetchDailyPostMetrics(currentDate);

      await prisma.socialMediaMetrics.createMany({
        data: [
          {
            socialMediaId: account.id,
            metricName: Metric.FOLLOWERS,
            metricValue: insights.page_follows ?? 0,
            metricDate: currentDate,
          },
          {
            socialMediaId: account.id,
            metricName: Metric.LIKES,
            metricValue: insights.page_actions_post_reactions_like_total ?? 0,
            metricDate: currentDate,
          },
          {
            socialMediaId: account.id,
            metricName: Metric.VIEWS,
            metricValue: insights.page_media_view ?? 0,
            metricDate: currentDate,
          },
          {
            socialMediaId: account.id,
            metricName: Metric.POSTS,
            metricValue: posts.posts,
            metricDate: currentDate,
          },
          {
            socialMediaId: account.id,
            metricName: Metric.SHARES,
            metricValue: posts.shares,
            metricDate: currentDate,
          },
          {
            socialMediaId: account.id,
            metricName: Metric.COMMENTS,
            metricValue: posts.comments,
            metricDate: currentDate,
          },
        ],
      });
    } catch (err) {
      console.error(`[FB] Failed for ${dateStr}`, err);
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  console.log("[FB] Facebook sync complete");
}

/* -------------------------------------------------
   Entrypoint (for standalone run)
-------------------------------------------------- */
(async () => {
  try {
    await runDailyFacebookSync();
  } catch (err) {
    console.error("Facebook backfill failed", err);
  } finally {
    await prisma.$disconnect();
  }
})();
