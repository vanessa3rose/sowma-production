import {
  PrismaClient,
  Metric,
  Provider,
} from "../../src/generated/prisma/index.js";
import { getAuthBySocialMediaId } from "../../db/social-media-auth";
import fetch from "node-fetch";
import "dotenv/config";
import { startOfDay, formatISODate } from "../../src/utils/dates.js";

/* -------------------------------------------------
   Prisma Client
-------------------------------------------------- */
const prisma = new PrismaClient();

/* -------------------------------------------------
   Types
-------------------------------------------------- */
type TwitterPublicMetrics = {
  followers_count: number;
  following_count: number;
  tweet_count: number;
  listed_count: number;
};

/* -------------------------------------------------
   Helpers
-------------------------------------------------- */
async function fetchTwitterMetrics(
  username: string,
  accessToken: string,
): Promise<TwitterPublicMetrics> {
  const res = await fetch(
    `https://api.twitter.com/2/users/by/username/${username}?user.fields=public_metrics`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`[TW] API error ${res.status}: ${text}`);
  }

  const json = (await res.json()) as {
    data: {
      public_metrics: TwitterPublicMetrics;
    };
  };

  return json.data.public_metrics;
}

/* -------------------------------------------------
   Daily Twitter Sync
-------------------------------------------------- */
export async function runDailyTwitterSync() {
  try {
    const metricDate = startOfDay(new Date());

    console.log(`[TW] Starting daily sync for ${formatISODate(metricDate)}`);

    const accounts = await prisma.socialMedia.findMany({
      where: { provider: Provider.TWITTER },
    });

    if (accounts.length === 0) {
      console.log("[TW] No Twitter accounts found");
      return;
    }

    const METRIC_MAP: Partial<Record<keyof TwitterPublicMetrics, Metric>> = {
      followers_count: Metric.FOLLOWERS,
      tweet_count: Metric.POSTS,
    };

    for (const account of accounts) {
      const auth = await getAuthBySocialMediaId(account.id);

      if (!auth?.accessToken) {
        console.error(`[TW] No bearer token found for ${account.username}`);
        continue;
      }

      console.log(
        `[TW] Syncing ${account.username} (${formatISODate(metricDate)})`,
      );

      const metrics = await fetchTwitterMetrics(
        account.username,
        auth.accessToken,
      );

      const metricsToInsert = Object.entries(metrics)
        .map(([key, value]) => {
          const metricEnum = METRIC_MAP[key as keyof TwitterPublicMetrics];
          if (!metricEnum) return null;

          return {
            metricName: metricEnum,
            metricValue: Number(value ?? 0),
          };
        })
        .filter(Boolean) as {
        metricName: Metric;
        metricValue: number;
      }[];

      if (metricsToInsert.length === 0) {
        console.log(`[TW] No mapped metrics for ${account.username}`);
        continue;
      }

      await prisma.$transaction(async (tx) => {
        await tx.socialMediaMetrics.deleteMany({
          where: {
            socialMediaId: account.id,
            metricDate,
            metricName: {
              in: metricsToInsert.map((m) => m.metricName),
            },
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
        `[TW] OK: followers=${metrics.followers_count} tweets=${metrics.tweet_count}`,
      );
    }

    console.log("[TW] Daily Twitter sync complete");
  } catch (err) {
    console.error("[TW] Daily Twitter sync failed", err);
    throw err;
  } finally {
    await prisma.$disconnect();
  }
}

/* -------------------------------------------------
   Entrypoint
-------------------------------------------------- */
runDailyTwitterSync().catch(console.error);
