import { fileURLToPath } from "node:url";
import { PrismaClient, Metric } from "../src/generated/prisma";

// Utility functions
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

const prisma = new PrismaClient();

const FACEBOOK_PAGE_ID = process.env.FACEBOOK_PAGE_ID!;
const FACEBOOK_PAGE_TOKEN = process.env.FACEBOOK_PAGE_TOKEN!;
const FB_API_VERSION = "v24.0";

type FacebookPublicMetrics = {
  page_follows: number;
  page_actions_post_reactions_like_total: number;
  page_media_view: number;
  total_comments: number;
  total_posts: number;
  total_shares: number;
};

// Fetch insights metrics (followers, likes, views) for a specific date
export async function fetchFacebookInsights(
  pageId: string,
  pageAccessToken: string,
  targetDate: Date,
): Promise<
  Omit<FacebookPublicMetrics, "total_posts" | "total_shares" | "total_comments">
> {
  const since = toUnixTimestamp(getStartOfDay(targetDate));
  const until = toUnixTimestamp(getEndOfDay(targetDate));

  const metricsConfig = [
    { name: "page_follows", period: "day" },
    { name: "page_actions_post_reactions_like_total", period: "day" },
    { name: "page_media_view", period: "day" },
  ];

  const insightsResults: any = {};

  for (const { name, period } of metricsConfig) {
    try {
      const insightsUrl = `https://graph.facebook.com/${FB_API_VERSION}/${pageId}/insights?metric=${name}&period=${period}&since=${since}&until=${until}&access_token=${pageAccessToken}`;

      const res = await fetch(insightsUrl);

      if (res.ok) {
        const data = await res.json();

        if (name === "page_follows") {
          const values = data.data[0]?.values || [];
          insightsResults[name] = values[values.length - 1]?.value || 0;
        } else {
          const values = data.data[0]?.values || [];
          insightsResults[name] = values.reduce(
            (sum: number, v: any) => sum + (v.value || 0),
            0,
          );
        }
      } else {
        insightsResults[name] = 0;
      }
    } catch (err) {
      insightsResults[name] = 0;
    }
  }

  return {
    page_follows: insightsResults.page_follows || 0,
    page_actions_post_reactions_like_total:
      insightsResults.page_actions_post_reactions_like_total || 0,
    page_media_view: insightsResults.page_media_view || 0,
  };
}

// Get posts CREATED on a specific day (for subtraction)
async function fetchDailyPostMetrics(
  pageId: string,
  pageAccessToken: string,
  targetDate: Date,
): Promise<{
  total_posts: number;
  total_shares: number;
  total_comments: number;
}> {
  const since = toUnixTimestamp(getStartOfDay(targetDate));
  const until = toUnixTimestamp(getEndOfDay(targetDate));

  let posts: any[] = [];
  let nextUrl: string | null =
    `https://graph.facebook.com/${FB_API_VERSION}/${pageId}/posts?fields=shares,comments.summary(true),created_time&since=${since}&until=${until}&access_token=${pageAccessToken}`;

  let pageCount = 0;

  while (nextUrl && pageCount < 10) {
    pageCount++;
    const postsRes = await fetch(nextUrl);

    if (!postsRes.ok) break;

    const postsData = await postsRes.json();

    if (!postsData.data || postsData.data.length === 0) break;

    posts.push(...postsData.data);
    nextUrl = postsData.paging?.next || null;
  }

  return {
    total_posts: posts.length,
    total_shares: posts.reduce(
      (sum, post) => sum + (post.shares?.count || 0),
      0,
    ),
    total_comments: posts.reduce(
      (sum, post) => sum + (post.comments?.summary?.total_count || 0),
      0,
    ),
  };
}

// Get current total posts/shares/comments (no date filter)
async function fetchCurrentTotals(
  pageId: string,
  pageAccessToken: string,
): Promise<{
  total_posts: number;
  total_shares: number;
  total_comments: number;
}> {
  let posts: any[] = [];
  let nextUrl: string | null =
    `https://graph.facebook.com/${FB_API_VERSION}/${pageId}/posts?fields=shares,comments.summary(true)&access_token=${pageAccessToken}`;

  let pageCount = 0;

  while (nextUrl && pageCount < 10) {
    pageCount++;
    const postsRes = await fetch(nextUrl);

    if (!postsRes.ok) break;

    const postsData = await postsRes.json();

    if (!postsData.data || postsData.data.length === 0) break;

    posts.push(...postsData.data);
    nextUrl = postsData.paging?.next || null;
  }

  return {
    total_posts: posts.length,
    total_shares: posts.reduce(
      (sum, post) => sum + (post.shares?.count || 0),
      0,
    ),
    total_comments: posts.reduce(
      (sum, post) => sum + (post.comments?.summary?.total_count || 0),
      0,
    ),
  };
}

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

export async function syncFacebookMetrics() {
  console.log("\n[syncFacebookMetrics] Starting Facebook metrics sync...");
  const accounts = await prisma.socialMedia.findMany({
    where: { provider: "FACEBOOK" },
  });
  console.log(`Found ${accounts.length} Facebook accounts to sync.`);

  const FACEBOOK_TO_PRISMA_METRIC: Partial<
    Record<keyof FacebookPublicMetrics, Metric>
  > = {
    page_follows: Metric.FOLLOWERS,
    page_actions_post_reactions_like_total: Metric.LIKES,
    page_media_view: Metric.VIEWS,
    total_posts: Metric.POSTS,
    total_shares: Metric.SHARES,
    total_comments: Metric.COMMENTS,
  };

  const today = new Date();

  for (const account of accounts) {
    console.log(`\nSyncing account: ${account.username} (${account.userId})`);
    try {
      // Get insights
      const insights = await fetchFacebookInsights(
        FACEBOOK_PAGE_ID,
        FACEBOOK_PAGE_TOKEN,
        today,
      );

      // Get current totals
      const totals = await fetchCurrentTotals(
        FACEBOOK_PAGE_ID,
        FACEBOOK_PAGE_TOKEN,
      );

      const metrics = {
        ...insights,
        ...totals,
      };

      console.log("Metrics fetched successfully, writing to DB...");

      for (const [metricName, metricVal] of Object.entries(metrics) as [
        keyof FacebookPublicMetrics,
        number,
      ][]) {
        const metricEnum = FACEBOOK_TO_PRISMA_METRIC[metricName];
        if (!metricEnum) continue;

        await prisma.socialMediaMetrics.create({
          data: {
            socialMediaId: account.id,
            metricName: metricEnum,
            metricValue: metricVal,
            lastSynced: new Date(),
            metricDate: today,
          },
        });
        console.log(`Saved metric: ${metricEnum} = ${metricVal}`);
      }

      console.log(`✅ Successfully synced ${account.username}`);
    } catch (err) {
      console.error(`❌ Failed syncing ${account.username}`, err);
    }
  }

  console.log("Sync process completed.");
}

export async function backfillFacebookMetrics(startDate: Date, endDate: Date) {
  console.log("\n🔄 [backfillFacebookMetrics] Starting BACKWARDS backfill...");
  console.log(
    `📅 Date range: ${formatDate(startDate)} to ${formatDate(endDate)}`,
  );
  console.log(
    `⚠️  Working BACKWARDS from ${formatDate(endDate)} to ${formatDate(startDate)}\n`,
  );

  const accounts = await prisma.socialMedia.findMany({
    where: { provider: "FACEBOOK" },
  });

  if (accounts.length === 0) {
    console.log("No Facebook accounts found.");
    return;
  }

  const FACEBOOK_TO_PRISMA_METRIC: Partial<
    Record<keyof FacebookPublicMetrics, Metric>
  > = {
    page_follows: Metric.FOLLOWERS,
    page_actions_post_reactions_like_total: Metric.LIKES,
    page_media_view: Metric.VIEWS,
    total_posts: Metric.POSTS,
    total_shares: Metric.SHARES,
    total_comments: Metric.COMMENTS,
  };

  for (const account of accounts) {
    console.log(`\n📊 Processing account: ${account.username}`);

    // Get baseline (current totals as of today)
    console.log("Getting baseline totals...");
    const baseline = await fetchCurrentTotals(
      FACEBOOK_PAGE_ID,
      FACEBOOK_PAGE_TOKEN,
    );

    console.log(
      `📈 Baseline: ${baseline.total_posts} posts, ${baseline.total_shares} shares, ${baseline.total_comments} comments\n`,
    );

    // Start from END date and work backwards
    const currentDate = new Date(endDate);
    let cumulativePosts = baseline.total_posts;
    let cumulativeShares = baseline.total_shares;
    let cumulativeComments = baseline.total_comments;

    // If endDate is today, use baseline directly for today
    // Otherwise, we need to calculate what the totals were on endDate
    const today = new Date();
    if (formatDate(currentDate) !== formatDate(today)) {
      // Calculate backwards from today to endDate
      const tempDate = new Date(today);
      while (formatDate(tempDate) !== formatDate(currentDate)) {
        const dailyMetrics = await fetchDailyPostMetrics(
          FACEBOOK_PAGE_ID,
          FACEBOOK_PAGE_TOKEN,
          tempDate,
        );
        cumulativePosts -= dailyMetrics.total_posts;
        cumulativeShares -= dailyMetrics.total_shares;
        cumulativeComments -= dailyMetrics.total_comments;
        tempDate.setDate(tempDate.getDate() - 1);
      }
      console.log(
        `📊 Adjusted baseline for ${formatDate(endDate)}: ${cumulativePosts} posts\n`,
      );
    }

    while (currentDate >= startDate) {
      const dateStr = formatDate(currentDate);
      console.log(`📅 Backfilling ${dateStr}`);

      try {
        // Skip if exists
        if (await metricsExistForDate(account.id, currentDate)) {
          console.log(`⏭️  Already exists, skipping`);

          // Still need to subtract this day's posts for accurate calculation
          const dailyMetrics = await fetchDailyPostMetrics(
            FACEBOOK_PAGE_ID,
            FACEBOOK_PAGE_TOKEN,
            new Date(currentDate),
          );
          cumulativePosts -= dailyMetrics.total_posts;
          cumulativeShares -= dailyMetrics.total_shares;
          cumulativeComments -= dailyMetrics.total_comments;

          currentDate.setDate(currentDate.getDate() - 1);
          continue;
        }

        // Get insights for this specific date
        const insights = await fetchFacebookInsights(
          FACEBOOK_PAGE_ID,
          FACEBOOK_PAGE_TOKEN,
          new Date(currentDate),
        );

        // Use cumulative totals (what existed at END of this day)
        const metricsForDate = {
          page_follows: insights.page_follows,
          page_actions_post_reactions_like_total:
            insights.page_actions_post_reactions_like_total,
          page_media_view: insights.page_media_view,
          total_posts: cumulativePosts,
          total_shares: cumulativeShares,
          total_comments: cumulativeComments,
        };

        // Save metrics
        for (const [metricName, metricVal] of Object.entries(
          metricsForDate,
        ) as [keyof FacebookPublicMetrics, number][]) {
          const metricEnum = FACEBOOK_TO_PRISMA_METRIC[metricName];
          if (!metricEnum) continue;

          await prisma.socialMediaMetrics.create({
            data: {
              socialMediaId: account.id,
              metricName: metricEnum,
              metricValue: metricVal,
              lastSynced: new Date(),
              metricDate: new Date(currentDate),
            },
          });
        }

        console.log(
          `   Saved: ${cumulativePosts} posts, ${cumulativeShares} shares, ${cumulativeComments} comments`,
        );

        // Get posts created THIS day to subtract for previous day
        const dailyMetrics = await fetchDailyPostMetrics(
          FACEBOOK_PAGE_ID,
          FACEBOOK_PAGE_TOKEN,
          new Date(currentDate),
        );

        console.log(
          `   Posts created on ${dateStr}: ${dailyMetrics.total_posts}`,
        );

        // Subtract for next iteration (previous day)
        cumulativePosts -= dailyMetrics.total_posts;
        cumulativeShares -= dailyMetrics.total_shares;
        cumulativeComments -= dailyMetrics.total_comments;

        console.log(`   Previous day will have: ${cumulativePosts} posts\n`);
      } catch (err) {
        console.error(`❌ Failed for ${dateStr}:`, err);
      }

      // Move to previous day
      currentDate.setDate(currentDate.getDate() - 1);
    }

    console.log(`✅ Completed backfill for ${account.username}`);
  }

  console.log("\n✅ Backfill completed!");
}

async function main() {
  try {
    const args = process.argv.slice(2);

    if (args[0] === "backfill") {
      await backfillFacebookMetrics(new Date(args[1]), new Date(args[2]));
    } else {
      await syncFacebookMetrics();
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
