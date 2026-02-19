import {
  PrismaClient,
  Metric,
  Provider,
} from "../../src/generated/prisma/index.js";
import { getAuthBySocialMediaId } from "../../db/social-media-auth";
import fetch from "node-fetch";
import "dotenv/config";
import {
  startOfDay,
  endOfDay,
  toUnixTimestamp,
  formatISODate,
} from "../../src/utils/dates.js";

/* -------------------------------------------------
   Prisma Client
-------------------------------------------------- */
const prisma = new PrismaClient();

/* -------------------------------------------------
   Config
-------------------------------------------------- */
const IG_USER_ID = process.env.INSTAGRAM_BUSINESS_PAGE_ID!;
const MEDIA_LIMIT = 50;
const FB_GRAPH_VERSION = "v20.0";

/* -------------------------------------------------
   Types
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
   Helpers
-------------------------------------------------- */
async function fetchAccountTotals(accessToken: string): Promise<AccountTotals> {
  const url =
    `https://graph.facebook.com/${FB_GRAPH_VERSION}/${IG_USER_ID}` +
    `?fields=followers_count,media_count` +
    `&access_token=${accessToken}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(
      `[IG] account totals failed: ${res.status} ${await res.text()}`,
    );
  }

  return (await res.json()) as AccountTotals;
}

async function fetchDailyInsights(
  date: Date,
  accessToken: string,
): Promise<DailyInsights> {
  const since = toUnixTimestamp(startOfDay(date));
  const until = toUnixTimestamp(endOfDay(date));

  const url =
    `https://graph.facebook.com/${FB_GRAPH_VERSION}/${IG_USER_ID}/insights` +
    `?metric=views,reach,total_interactions` +
    `&period=day` +
    `&metric_type=total_value` +
    `&since=${since}&until=${until}` +
    `&access_token=${accessToken}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`[IG] insights failed: ${res.status} ${await res.text()}`);
  }

  const json = (await res.json()) as {
    data?: Array<{ name: string; values?: Array<{ value?: number }> }>;
  };

  const out: Record<string, number> = {};

  for (const row of json.data ?? []) {
    out[row.name] = row.values?.[0]?.value ?? 0;
  }

  return out;
}

async function fetchMediaForDay(
  date: Date,
  accessToken: string,
): Promise<MediaItem[]> {
  const url =
    `https://graph.facebook.com/${FB_GRAPH_VERSION}/${IG_USER_ID}/media` +
    `?fields=id,like_count,comments_count,timestamp` +
    `&limit=${MEDIA_LIMIT}` +
    `&access_token=${accessToken}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`[IG] media failed: ${res.status} ${await res.text()}`);
  }

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
  try {
    // T-1 (yesterday UTC)
    const metricDate = startOfDay(new Date(Date.now() - 24 * 60 * 60 * 1000));

    console.log(
      `[IG] Starting daily sync for ${formatISODate(metricDate)} (T-1 UTC)`,
    );

    const accounts = await prisma.socialMedia.findMany({
      where: { provider: Provider.INSTAGRAM },
    });

    if (accounts.length === 0) {
      console.log("[IG] No Instagram accounts found");
      return;
    }

    // Instagram uses Facebook Page token
    const fbAccount = await prisma.socialMedia.findFirst({
      where: { provider: Provider.FACEBOOK },
    });

    if (!fbAccount) {
      throw new Error("[IG] No Facebook account found (required for IG token)");
    }

    const fbAuth = await getAuthBySocialMediaId(fbAccount.id);

    if (!fbAuth?.accessToken) {
      throw new Error("[IG] No Facebook access token found in DB");
    }

    const ACCESS_TOKEN = fbAuth.accessToken;

    for (const account of accounts) {
      console.log(
        `[IG] Syncing ${account.username} (${formatISODate(metricDate)})`,
      );

      const media = await fetchMediaForDay(metricDate, ACCESS_TOKEN);

      const dailyLikes = media.reduce((sum, m) => sum + (m.like_count ?? 0), 0);

      const dailyComments = media.reduce(
        (sum, m) => sum + (m.comments_count ?? 0),
        0,
      );

      const daysPosted = media.length > 0 ? 1 : 0;

      const insights = await fetchDailyInsights(metricDate, ACCESS_TOKEN);

      const totals = await fetchAccountTotals(ACCESS_TOKEN);

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
        {
          metricName: Metric.POSTS,
          metricValue: totals.media_count ?? 0,
        },
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
        `[IG] OK: posts=${media.length} likes=${dailyLikes} comments=${dailyComments}`,
      );
    }

    console.log("[IG] Daily Instagram sync complete");
  } catch (err) {
    console.error("[IG] Daily Instagram sync failed", err);
    throw err;
  } finally {
    await prisma.$disconnect();
  }
}

/* -------------------------------------------------
   Entrypoint
-------------------------------------------------- */
runDailyInstagramSync().catch(console.error);
