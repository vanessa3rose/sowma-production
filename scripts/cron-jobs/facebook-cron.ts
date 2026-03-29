import { getAuthBySocialMediaId } from "../../db/social-media-auth.js";
import {
  PrismaClient,
  Metric,
  Provider,
} from "../../src/generated/prisma/index.js";
import fetch from "node-fetch";
import "dotenv/config";
import {
  startOfDay,
  endOfDay,
  toUnixTimestamp,
  formatISODate,
  metricsExistForDay,
} from "../../src/utils/dates.js";

/* -------------------------------------------------
   Prisma Client
-------------------------------------------------- */
const prisma = new PrismaClient();

/* -------------------------------------------------
   Facebook API Config
-------------------------------------------------- */
const FB_PAGE_ID = process.env.FACEBOOK_PAGE_ID!;
const FB_API_VERSION = "v24.0";
const POSTS_LIMIT = 50;

/* -------------------------------------------------
   Types
-------------------------------------------------- */
type InsightsResponse = {
  data?: Array<{
    name: string;
    total_value?: { value?: number };
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
   Helpers
-------------------------------------------------- */
async function fetchDailyInsights(date: Date, accessToken: string) {
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
    `&access_token=${accessToken}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`[FB] insights failed: ${res.status} ${await res.text()}`);
  }

  const json = (await res.json()) as InsightsResponse;
  const out: Record<string, number> = {};

  for (const row of json.data ?? []) {
    out[row.name] = row.total_value?.value ?? 0;
  }

  return {
    followers: out.page_follows ?? 0,
    views: out.page_media_view ?? 0,
    likes: out.page_actions_post_reactions_like_total ?? 0,
  };
}

async function fetchPostsForDay(date: Date, accessToken: string) {
  const url =
    `https://graph.facebook.com/${FB_API_VERSION}/${FB_PAGE_ID}/posts` +
    `?fields=created_time,shares,comments.summary(true)` +
    `&limit=${POSTS_LIMIT}` +
    `&access_token=${accessToken}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`[FB] posts failed: ${res.status} ${await res.text()}`);
  }

  const json = (await res.json()) as PostsResponse;

  return (json.data ?? []).filter((p) => {
    const t = new Date(p.created_time).getTime();
    return t >= startOfDay(date).getTime() && t <= endOfDay(date).getTime();
  });
}

/* -------------------------------------------------
   Daily Facebook Sync
-------------------------------------------------- */
export async function runDailyFacebookSync() {
  try {
    // T-1 (yesterday UTC)
    const metricDate = startOfDay(new Date(Date.now() - 24 * 60 * 60 * 1000));

    console.log(
      `[FB] Starting daily sync for ${formatISODate(metricDate)} (T-1 UTC)`,
    );

    const accounts = await prisma.socialMedia.findMany({
      where: { provider: Provider.FACEBOOK },
    });

    for (const account of accounts) {
      const fbAuth = await getAuthBySocialMediaId(account.id);

      if (!fbAuth?.accessToken) {
        console.error(`[FB] No access token found for ${account.username}`);
        continue;
      }

      if (await metricsExistForDay(account.id, metricDate)) {
        console.log(
          `[FB] ${account.username} already synced (${formatISODate(metricDate)})`,
        );
        continue;
      }

      console.log(
        `[FB] Syncing ${account.username} (${formatISODate(metricDate)})`,
      );

      const ACCESS_TOKEN = fbAuth.accessToken;

      const posts = await fetchPostsForDay(metricDate, ACCESS_TOKEN);

      const dailyComments = posts.reduce(
        (s, p) => s + (p.comments?.summary?.total_count ?? 0),
        0,
      );

      const dailyShares = posts.reduce((s, p) => s + (p.shares?.count ?? 0), 0);

      const daysPosted = posts.length > 0 ? 1 : 0;

      const insights = await fetchDailyInsights(metricDate, ACCESS_TOKEN);

      const metricsToInsert = [
        { metricName: Metric.FOLLOWERS, metricValue: insights.followers },
        { metricName: Metric.VIEWS, metricValue: insights.views },
        { metricName: Metric.LIKES, metricValue: insights.likes },
        { metricName: Metric.COMMENTS, metricValue: dailyComments },
        { metricName: Metric.SHARES, metricValue: dailyShares },
        { metricName: Metric.DAYS_POSTED, metricValue: daysPosted },
      ] as const;

      await prisma.$transaction(async (tx) => {
        await tx.socialMediaMetrics.deleteMany({
          where: {
            socialMediaId: account.id,
            metricDate,
            metricName: { in: metricsToInsert.map((m) => m.metricName) },
          },
        });

        await Promise.all(
          metricsToInsert.map((m) =>
            tx.socialMediaMetrics.create({
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
      });

      console.log(
        `[FB] OK: posts=${posts.length} comments=${dailyComments} shares=${dailyShares}`,
      );
    }

    console.log("[FB] Daily Facebook sync complete");
  } catch (err) {
    console.error("[FB] Daily Facebook sync failed", err);
    throw err;
  } finally {
    await prisma.$disconnect();
  }
}

/* -------------------------------------------------
   Entrypoint
-------------------------------------------------- */
runDailyFacebookSync().catch(console.error);
