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

// Fetches data from Twitter's API
export async function fetchTwitterMetrics(username: string) {
  const res = await fetch(
    `https://api.twitter.com/2/users/by/username/${username}?user.fields=public_metrics`,
    {
      headers: { Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}` },
    },
  );
  if (!res.ok) throw new Error("Twitter API failed");
  const data = await res.json();
  return data.data.public_metrics;
}

export async function syncTwitterMetrics() {
  // Get accounts from twitter's API
  const accounts = await prisma.socialMedia.findMany({
    where: { provider: "TWITTER" },
  });

  // Map twitter's keys to our Enums defined in schema.prisma
  const TWITTER_TO_PRISMA_METRIC: Partial<
    Record<keyof TwitterPublicMetrics, Metric>
  > = {
    followers_count: Metric.FOLLOWERS,
    tweet_count: Metric.POSTS,
    // Add new enums here
  };

  // Iterate for each account being pulled
  for (const account of accounts) {
    try {
      // Fetch metrics from the account
      const metrics = await fetchTwitterMetrics(account.username);

      // Convert the twitter-provided metric name to a Metric enum
      for (const [metricName, metricVal] of Object.entries(metrics) as [
        keyof TwitterPublicMetrics,
        number,
      ][]) {
        const metricEnum = TWITTER_TO_PRISMA_METRIC[metricName];
        if (!metricEnum) continue;

        // Post the data update
        await prisma.socialMediaMetrics.create({
          data: {
            socialMediaId: account.id,
            metricName: metricEnum,
            metricValue: metricVal,
            lastSynced: new Date(),
          },
        });
      }
      console.log(`✅ Synced ${account.username}`);
    } catch (err) {
      console.error(`❌ Failed syncing ${account.username}`, err);
    }
  }

  await prisma.$disconnect();
}

async function main() {
  try {
    await syncTwitterMetrics();
  } catch (err) {
    console.error(err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  void main();
}
