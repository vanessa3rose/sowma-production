import { fileURLToPath } from "node:url";
import { PrismaClient, Metric } from "../src/generated/prisma";
import "dotenv/config";
import fetch from "node-fetch";

const prisma = new PrismaClient();

const INSTAGRAM_BUSINESS_PAGE_ID = process.env.INSTAGRAM_BUSINESS_PAGE_ID!;
const INSTAGRAM_ACCESS_TOKEN = process.env.FACEBOOK_PAGE_TOKEN!;

// Mapping between raw Instagram metrics → Prisma Metric enum
const INSTAGRAM_TO_PRISMA_METRIC: Record<string, Metric> = {
  followers_count: Metric.FOLLOWERS,
  media_count: Metric.POSTS,
  total_likes: Metric.LIKES,
  total_comments: Metric.COMMENTS,
  total_shares: Metric.SHARES,
  impressions: Metric.VIEWS,
  days_posted: Metric.DAYS_POSTED,
};

type InstagramMetricKey =
  | "followers_count"
  | "media_count"
  | "total_likes"
  | "total_comments"
  | "total_shares"
  | "impressions"
  | "days_posted";

type InstagramMetrics = Partial<Record<InstagramMetricKey, number>>;

const DEFAULT_MEDIA_SAMPLE_SIZE = 25;

// 🕓 Utility functions
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

function toUnixTimestamp(date: Date): number {
  return Math.floor(date.getTime() / 1000);
}

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

// 📅 Fetch metrics for a single date
async function fetchInstagramMetricsForDate(
  userId: string,
  targetDate: Date,
): Promise<InstagramMetrics> {
  const since = toUnixTimestamp(getStartOfDay(targetDate));
  const until = toUnixTimestamp(getEndOfDay(targetDate));

  const metrics: InstagramMetrics = {};

  // 1️⃣ Account-level metrics (followers, posts count)
  try {
    const accountUrl = `https://graph.facebook.com/v20.0/${userId}?fields=followers_count,media_count&access_token=${INSTAGRAM_ACCESS_TOKEN}`;
    const accountRes = await fetch(accountUrl);

    if (accountRes.ok) {
      const accountData = await accountRes.json();
      metrics.followers_count = accountData.followers_count ?? 0;
      metrics.media_count = accountData.media_count ?? 0;
      console.log(
        `✅ Followers: ${metrics.followers_count}, Posts: ${metrics.media_count}`,
      );
    } else {
      const text = await accountRes.text();
      console.warn(`⚠️ Account data failed: ${accountRes.status} - ${text}`);
      metrics.followers_count = 0;
      metrics.media_count = 0;
    }
  } catch (e) {
    console.warn("⚠️ Account data error:", (e as Error).message);
    metrics.followers_count = 0;
    metrics.media_count = 0;
  }

  // 2️⃣ Daily impressions
  try {
    const insightsUrl = `https://graph.facebook.com/v20.0/${userId}/insights?metric=reach&period=day&since=${since}&until=${until}&access_token=${INSTAGRAM_ACCESS_TOKEN}`;
    const insightsRes = await fetch(insightsUrl);

    if (insightsRes.ok) {
      const insights = await insightsRes.json();
      const impressionInsight = insights.data?.find(
        (d: any) => d.name === "reach",
      );
      metrics.impressions = impressionInsight?.values?.[0]?.value ?? 0;
      console.log(`✅ Impressions: ${metrics.impressions}`);
    } else {
      const text = await insightsRes.text();
      console.warn(
        `⚠️ Impression data failed: ${insightsRes.status} - ${text}`,
      );
      metrics.impressions = 0;
    }
  } catch (e) {
    console.warn("⚠️ Impression data error:", (e as Error).message);
    metrics.impressions = 0;
  }

  // 3️⃣ Media likes/comments aggregation
  try {
    const mediaUrl = `https://graph.facebook.com/v20.0/${userId}/media?fields=id,like_count,comments_count,timestamp&limit=${DEFAULT_MEDIA_SAMPLE_SIZE}&access_token=${INSTAGRAM_ACCESS_TOKEN}`;
    const mediaRes = await fetch(mediaUrl);

    if (mediaRes.ok) {
      const media = await mediaRes.json();

      const filtered = (media.data ?? []).filter((m: any) => {
        if (!m.timestamp) return false;
        const created = new Date(m.timestamp);
        return (
          created >= getStartOfDay(targetDate) &&
          created <= getEndOfDay(targetDate)
        );
      });

      const totals = filtered.reduce(
        (acc: any, m: any) => {
          acc.likes += m.like_count ?? 0;
          acc.comments += m.comments_count ?? 0;
          acc.shares += m.shares_count ?? 0;
          return acc;
        },
        { likes: 0, comments: 0, shares: 0 },
      );

      metrics.total_likes = totals.likes;
      metrics.total_comments = totals.comments;
      metrics.total_shares = totals.shares;
      metrics.days_posted = filtered.length > 0 ? 1 : 0;
      console.log(
        `✅ Likes: ${metrics.total_likes}, Comments: ${metrics.total_comments}, Shares: ${metrics.total_shares}, Days Posted: ${metrics.days_posted}`,
      );
    } else {
      const text = await mediaRes.text();
      console.warn(`⚠️ Media aggregation failed: ${mediaRes.status} - ${text}`);
      metrics.total_likes = 0;
      metrics.total_comments = 0;
      metrics.total_shares = 0;
      metrics.days_posted = 0;
    }
  } catch (e) {
    console.warn("⚠️ Media aggregation error:", (e as Error).message);
    metrics.total_likes = 0;
    metrics.total_comments = 0;
    metrics.total_shares = 0;
    metrics.days_posted = 0;
  }

  return metrics;
}

// 🔎 Check if data already exists
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

// 📈 Sync the latest metrics (current day)
async function syncInstagramMetrics() {
  console.log("\n🔄 [syncInstagramMetrics] Starting sync...");

  const accounts = await prisma.socialMedia.findMany({
    where: { provider: "INSTAGRAM" },
  });

  console.log(`\n📸 Found ${accounts.length} Instagram accounts.`);

  for (const account of accounts) {
    console.log(`\n📊 Syncing: ${account.username}`);

    // keep DB userId in sync with the business page id
    if (account.userId !== INSTAGRAM_BUSINESS_PAGE_ID) {
      await prisma.socialMedia.update({
        where: { id: account.id },
        data: { userId: INSTAGRAM_BUSINESS_PAGE_ID },
      });
      console.log(
        `ℹ️ Updated socialMedia.userId for ${account.username} to INSTAGRAM_BUSINESS_PAGE_ID`,
      );
    }

    const metrics = await fetchInstagramMetricsForDate(
      INSTAGRAM_BUSINESS_PAGE_ID,
      new Date(),
    );

    for (const [key, value] of Object.entries(metrics) as [
      InstagramMetricKey,
      number,
    ][]) {
      const metricEnum = INSTAGRAM_TO_PRISMA_METRIC[key];
      if (!metricEnum) continue;

      await prisma.socialMediaMetrics.create({
        data: {
          socialMediaId: account.id,
          metricName: metricEnum,
          metricValue: Math.round(value),
          lastSynced: new Date(),
          metricDate: new Date(),
        },
      });
    }

    console.log(`✅ Synced latest metrics for ${account.username}`);
  }

  console.log("\n✅ Sync completed!");
}

// 🔁 Backfill between start and end dates
export async function backfillInstagramMetrics(startDate: Date, endDate: Date) {
  console.log("\n🔄 [backfillInstagramMetrics] Starting backfill...");
  console.log(
    `📅 Date range: ${formatDate(startDate)} → ${formatDate(endDate)}\n`,
  );

  const accounts = await prisma.socialMedia.findMany({
    where: { provider: "INSTAGRAM" },
  });

  if (accounts.length === 0) {
    console.log("No Instagram accounts found.");
    return;
  }

  for (const account of accounts) {
    console.log(`\n📊 Backfilling: ${account.username}`);

    // keep DB userId in sync with the business page id
    if (account.userId !== INSTAGRAM_BUSINESS_PAGE_ID) {
      await prisma.socialMedia.update({
        where: { id: account.id },
        data: { userId: INSTAGRAM_BUSINESS_PAGE_ID },
      });
      console.log(
        `ℹ️ Updated socialMedia.userId for ${account.username} to INSTAGRAM_BUSINESS_PAGE_ID`,
      );
    }

    const currentDate = new Date(endDate);
    while (currentDate >= startDate) {
      const dateStr = formatDate(currentDate);
      console.log(`\n📅 Processing ${dateStr}`);

      if (await metricsExistForDate(account.id, currentDate)) {
        console.log(`⏭️  Already exists, skipping`);
        currentDate.setDate(currentDate.getDate() - 1);
        continue;
      }

      try {
        const metrics = await fetchInstagramMetricsForDate(
          INSTAGRAM_BUSINESS_PAGE_ID,
          new Date(currentDate),
        );

        for (const [key, val] of Object.entries(metrics) as [
          InstagramMetricKey,
          number,
        ][]) {
          const metricEnum = INSTAGRAM_TO_PRISMA_METRIC[key];
          if (!metricEnum) continue;

          await prisma.socialMediaMetrics.create({
            data: {
              socialMediaId: account.id,
              metricName: metricEnum,
              metricValue: Math.round(val),
              lastSynced: new Date(),
              metricDate: new Date(currentDate),
            },
          });
        }

        console.log(`✅ Saved metrics for ${dateStr}`);
      } catch (err) {
        console.error(`❌ Failed for ${dateStr}:`, err);
      }

      currentDate.setDate(currentDate.getDate() - 1);
    }

    console.log(`\n✅ Completed backfill for ${account.username}`);
  }

  console.log("\n✅ Backfill completed!");
}

// 🚀 Entry point
async function main() {
  try {
    const args = process.argv.slice(2);

    if (args[0] === "backfill") {
      await backfillInstagramMetrics(new Date(args[1]), new Date(args[2]));
    } else {
      await syncInstagramMetrics();
    }

    console.log("✅ Done");
  } catch (err) {
    console.error("❌ Error:", err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  void main();
}
