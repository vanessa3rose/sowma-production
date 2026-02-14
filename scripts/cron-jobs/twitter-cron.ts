import { PrismaClient, Metric } from "../../src/generated/prisma/index.js";
import { getAuthBySocialMediaId } from "../../db/social-media-auth";
import "dotenv/config";
import {
  startOfDay,
  formatISODate,
  metricsExistForDay,
} from "../../src/utils/dates.js";

/* -------------------------------------------------
   Prisma Client
-------------------------------------------------- */
const prisma = new PrismaClient();

/**
 * Twitter public metrics available on the free API
 */
type TwitterPublicMetrics = {
  followers_count: number;
  following_count: number;
  tweet_count: number;
  listed_count: number;
};

/**
 * Fetch current snapshot of Twitter public metrics
 */
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
    throw new Error(`Twitter API error ${res.status}: ${text}`);
  }

  const json = await res.json();
  return json.data.public_metrics as TwitterPublicMetrics;
}

/* -------------------------------------------------
   Daily Twitter Sync
-------------------------------------------------- */
export async function runDailyTwitterSync() {
  const metricDate = startOfDay(new Date());

  const accounts = await prisma.socialMedia.findMany({
    where: { provider: "TWITTER" },
  });

  if (accounts.length === 0) return;

  const METRIC_MAP: Partial<Record<keyof TwitterPublicMetrics, Metric>> = {
    followers_count: Metric.FOLLOWERS,
    tweet_count: Metric.POSTS,
  };

  for (const account of accounts) {

    // gets TWITTER_BEARER_TOKEN
    const auth = await getAuthBySocialMediaId(account.id);
    if (!auth?.accessToken) {
      console.error(
        `[TW] No bearer token found in DB for account ${account.username}`,
      );
      continue;
    }
    const ACCESS_TOKEN = auth.accessToken;

    // Skip if metrics already exist for today
    if (await metricsExistForDay(account.id, metricDate)) {
      console.log(
        `[TW] ${account.username} already synced (${formatISODate(metricDate)})`,
      );
      continue;
    }

    try {
      const metrics = await fetchTwitterMetrics(account.username, ACCESS_TOKEN);

      const metricsToInsert = Object.entries(metrics)
        .map(([key, value]) => {
          const metricEnum = METRIC_MAP[key as keyof TwitterPublicMetrics];
          if (!metricEnum) return null;

          return {
            metricName: metricEnum,
            metricValue: Number(value ?? 0),
          };
        })
        .filter(Boolean) as { metricName: Metric; metricValue: number }[];

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
    } catch (error) {
      console.error(
        `[TW] Sync failed for ${account.username} (${formatISODate(metricDate)})`,
        error,
      );
    }
  }

  console.log("[TW] Daily Twitter sync complete");

  // Disconnect Prisma
  await prisma.$disconnect();
}

/* -------------------------------------------------
   CLI Entrypoint
-------------------------------------------------- */
if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    try {
      await runDailyTwitterSync();
    } catch (err) {
      console.error("[TW] Cron job failed", err);
      process.exit(1);
    } finally {
      await prisma.$disconnect();
    }
  })();
}