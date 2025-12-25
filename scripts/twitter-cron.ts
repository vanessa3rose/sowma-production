import { PrismaClient, Metric } from "../src/generated/prisma";

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
 * Date helpers
 */
function getStartOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function getEndOfToday(): Date {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}

/**
 * Check whether today's metrics already exist for an account
 */
async function metricsExistForToday(
  socialMediaId: string,
): Promise<boolean> {
  const existing = await prisma.socialMediaMetrics.findFirst({
    where: {
      socialMediaId,
      metricDate: {
        gte: getStartOfToday(),
        lt: getEndOfToday(),
      },
    },
  });

  return existing !== null;
}

/**
 * Fetch current snapshot of Twitter public metrics
 */
async function fetchTwitterMetrics(
  username: string,
): Promise<TwitterPublicMetrics> {
  const res = await fetch(
    `https://api.twitter.com/2/users/by/username/${username}?user.fields=public_metrics`,
    {
      headers: {
        Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
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

/**
 * Daily cron job entrypoint
 */
export async function runDailyTwitterSync() {
  const metricDate = getStartOfToday();

  const accounts = await prisma.socialMedia.findMany({
    where: { provider: "TWITTER" },
  });

  if (accounts.length === 0) {
    return;
  }

  const METRIC_MAP: Partial<Record<keyof TwitterPublicMetrics, Metric>> = {
    followers_count: Metric.FOLLOWERS,
    tweet_count: Metric.POSTS,
  };

  for (const account of accounts) {
    const alreadySynced = await metricsExistForToday(account.id);
    if (alreadySynced) continue;

    try {
      const metrics = await fetchTwitterMetrics(account.username);

      for (const [key, value] of Object.entries(metrics) as [
        keyof TwitterPublicMetrics,
        number,
      ][]) {
        const metricEnum = METRIC_MAP[key];
        if (!metricEnum) continue;

        await prisma.socialMediaMetrics.create({
          data: {
            socialMediaId: account.id,
            metricName: metricEnum,
            metricValue: value,
            metricDate,
            lastSynced: new Date(),
          },
        });
      }
    } catch (error) {
      console.error(
        `Twitter sync failed for ${account.username}:`,
        error,
      );
    }
  }
}

/**
 * Auto-run when executed by cron / scheduler
 */
(async () => {
  try {
    await runDailyTwitterSync();
  } finally {
    await prisma.$disconnect();
  }
})();
