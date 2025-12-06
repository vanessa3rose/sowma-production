import { fileURLToPath } from "node:url";
import { PrismaClient, Metric } from "../src/generated/prisma";

const prisma = new PrismaClient();

// Links Twitter API's data names to our Prisma Enums
type TwitterPublicMetrics = {
  followers_count: number;
  following_count: number;
  tweet_count: number;
  listed_count: number;
};

// --- Date helpers (same style as FB/IG/GA) ---

function getStartOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getEndOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

// Check if we already have metrics for this account + date
async function metricsExistForDate(
  socialMediaId: string,
  targetDate: Date,
): Promise<boolean> {
  const existing = await prisma.socialMediaMetrics.findFirst({
    where: {
      socialMediaId,
      metricDate: {
        gte: getStartOfDay(targetDate),
        lt: getEndOfDay(targetDate),
      },
    },
  });
  return existing !== null;
}

// Fetches data from Twitter's API (snapshot only)
export async function fetchTwitterMetrics(username: string) {
  const res = await fetch(
    `https://api.twitter.com/2/users/by/username/${username}?user.fields=public_metrics`,
    {
      headers: { Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}` },
    },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Twitter API failed: ${res.status} — ${text}`);
  }

  const data = await res.json();
  return data.data.public_metrics as TwitterPublicMetrics;
}

export async function syncTwitterMetrics(targetDate: Date = new Date()) {
  console.log(
    `\n[syncTwitterMetrics] Starting Twitter metrics sync for ${formatDate(
      targetDate,
    )}...`,
  );

  // Get accounts from DB
  const accounts = await prisma.socialMedia.findMany({
    where: { provider: "TWITTER" },
  });

  // Map twitter's keys to our Enums defined in schema.prisma
  const TWITTER_TO_PRISMA_METRIC: Partial<
    Record<keyof TwitterPublicMetrics, Metric>
  > = {
    followers_count: Metric.FOLLOWERS,
    tweet_count: Metric.POSTS,
    // Add new enums here for following_count / listed_count if needed
  };

  // Determine if the parent (i.e. Twitter) already exists
  const parentexists = await prisma.socialMedia.findFirst({
    where: {
      provider: "TWITTER",
      userId: "sowma",
    },
  });

  if (!parentexists) {
    console.log(
      "❌ Failed syncing - TWITTER SocialMedia does not exist\n\tHint: Run twitter-setup.ts",
    );
    return;
  }

  if (accounts.length === 0) {
    console.log("No TWITTER socialMedia accounts found.");
    return;
  }

  // Iterate for each account being pulled
  for (const account of accounts) {
    console.log(`\nSyncing account: ${account.username}`);

    // Idempotent daily sync: skip if we already have metrics for this date
    const exists = await metricsExistForDate(account.id, targetDate);
    if (exists) {
      console.log(
        `⏭️  Metrics already exist for ${account.username} on ${formatDate(
          targetDate,
        )} — skipping`,
      );
      continue;
    }

    try {
      // Fetch metrics snapshot from Twitter
      const metrics = await fetchTwitterMetrics(account.username);

      // Convert the twitter-provided metric name to a Metric enum
      for (const [metricName, metricVal] of Object.entries(metrics) as [
        keyof TwitterPublicMetrics,
        number,
      ][]) {
        const metricEnum = TWITTER_TO_PRISMA_METRIC[metricName];
        if (!metricEnum) continue;

        // Post the data update, tagged with metricDate
        await prisma.socialMediaMetrics.create({
          data: {
            socialMediaId: account.id,
            metricName: metricEnum,
            metricValue: metricVal,
            lastSynced: new Date(),
            metricDate: getStartOfDay(targetDate),
          },
        });
        console.log(
          `   Saved ${metricEnum} = ${metricVal} for ${formatDate(targetDate)}`,
        );
      }

      console.log(
        `✅ Synced ${account.username} for ${formatDate(targetDate)}`,
      );
    } catch (err) {
      console.error(`❌ Failed syncing ${account.username}`, err);
    }
  }
}

async function main() {
  try {
    const args = process.argv.slice(2);

    let targetDate = new Date();
    if (args[0]) {
      const parsed = new Date(args[0]);
      if (Number.isNaN(parsed.getTime())) {
        throw new Error(
          `Invalid date argument "${args[0]}". Expected YYYY-MM-DD.`,
        );
      }
      targetDate = parsed;
    }

    // Note: Twitter doesn't support historical metrics.
    // Passing a past date still stores *current* values, just labeled with that metricDate.
    await syncTwitterMetrics(targetDate);
  } catch (err) {
    console.error(err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
    console.log("Prisma disconnected.");
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  void main();
}
