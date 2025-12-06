import { fileURLToPath } from "node:url";
import { PrismaClient, Metric } from "../src/generated/prisma";

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

// ---------- Core fetchers: copied from backfill style ----------

// Fetch insights metrics (followers, likes, views) for a specific day
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

      console.log(
        `Fetching insight metric: ${name} (${formatDate(targetDate)})`,
      );
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
        const text = await res.text();
        console.warn(`⚠️  ${name} failed: ${res.status} — ${text}`);
        insightsResults[name] = 0;
      }
    } catch (err) {
      console.warn(`⚠️  ${name} error:`, err);
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

// Get current total posts/shares/comments (no date filter), same as backfill
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

  console.log("Fetching current totals (posts/shares/comments)...");

  while (nextUrl && pageCount < 10) {
    pageCount++;
    const postsRes = await fetch(nextUrl);

    if (!postsRes.ok) {
      const text = await postsRes.text();
      console.warn(
        `⚠️  Posts API failed while fetching totals: ${postsRes.status} — ${text}`,
      );
      break;
    }

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

// Convenience wrapper: same overall shape as your old fetchFacebookMetrics,
// but using the *exact* day-based logic from the backfill helpers.
export async function fetchFacebookMetrics(
  pageId: string = FACEBOOK_PAGE_ID,
  pageAccessToken: string = FACEBOOK_PAGE_TOKEN,
  targetDate: Date = new Date(),
): Promise<FacebookPublicMetrics> {
  console.log(
    `\n🔍 [fetchFacebookMetrics] Fetching day metrics for ${pageId} on ${formatDate(targetDate)}`,
  );

  const insights = await fetchFacebookInsights(
    pageId,
    pageAccessToken,
    targetDate,
  );
  const totals = await fetchCurrentTotals(pageId, pageAccessToken);

  return {
    ...insights,
    ...totals,
  };
}

export async function syncFacebookMetrics(targetDate: Date = new Date()) {
  console.log(
    `\n[syncFacebookMetrics] Starting Facebook metrics sync for ${formatDate(
      targetDate,
    )}...`,
  );
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

  for (const account of accounts) {
    console.log(`\nSyncing account: ${account.username} (${account.userId})`);

    // optional: avoid dup rows for same day
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
      const metrics = await fetchFacebookMetrics(
        FACEBOOK_PAGE_ID,
        FACEBOOK_PAGE_TOKEN,
        targetDate,
      );
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
            metricDate: getStartOfDay(targetDate),
          },
        });
        console.log(`Saved metric: ${metricEnum} = ${metricVal}`);
      }

      console.log(
        `✅ Successfully synced ${account.username} for ${formatDate(
          targetDate,
        )}`,
      );
    } catch (err) {
      console.error(
        `❌ Failed syncing ${account.username} for ${formatDate(targetDate)}`,
        err,
      );
    }
  }

  console.log("Sync process completed. Disconnecting Prisma...");
  await prisma.$disconnect();
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

    await syncFacebookMetrics(targetDate);
    console.log("Script finished successfully.");
  } catch (err) {
    console.error("Unhandled error in main()", err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
    console.log("Prisma disconnected.");
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  void main();
}
