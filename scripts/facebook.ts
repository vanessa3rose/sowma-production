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

export async function fetchFacebookMetrics(
  pageId: string = FACEBOOK_PAGE_ID,
  pageAccessToken: string = FACEBOOK_PAGE_TOKEN,
) {
  console.log(
    `\n🔍 [fetchFacebookMetrics] Fetching insights for page ${pageId}`,
  );

  const metricsConfig = [
    { name: "page_follows", period: "day" },
    { name: "page_actions_post_reactions_like_total", period: "days_28" },
    { name: "page_media_view", period: "days_28" },
  ];

  const insightsResults: any = {};

  for (const { name, period } of metricsConfig) {
    try {
      const insightsUrl = `https://graph.facebook.com/${FB_API_VERSION}/${pageId}/insights?metric=${name}&period=${period}&access_token=${pageAccessToken}`;
      console.log(`\nFetching metric: ${name} (period: ${period})`);

      const res = await fetch(insightsUrl);
      console.log(`📡 Status for ${name}: ${res.status}`);

      if (res.ok) {
        const data = await res.json();

        // For cumulative metrics like page_follows, use the latest value
        // For aggregate metrics, sum all values in the period
        if (name === "page_follows") {
          // Use the most recent day's follower count
          const values = data.data[0]?.values || [];
          insightsResults[name] = values[values.length - 1]?.value || 0;
        } else {
          // Sum all values for metrics like reactions and views over the period
          const values = data.data[0]?.values || [];
          insightsResults[name] = values.reduce(
            (sum: number, v: any) => sum + (v.value || 0),
            0,
          );
        }

        console.log(`✅ ${name}: ${insightsResults[name]}`);
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

  // Pagination for posts
  let posts: any[] = [];
  let nextUrl: string | null =
    `https://graph.facebook.com/${FB_API_VERSION}/${pageId}/posts?fields=shares,comments.summary(true)&access_token=${pageAccessToken}`;
  let pageCount = 0;

  console.log("Starting to fetch posts...");

  while (nextUrl) {
    pageCount++;
    console.log(`Fetching posts page ${pageCount}`);
    const postsRes: Response = await fetch(nextUrl);
    console.log(`Posts response status: ${postsRes.status}`);

    if (!postsRes.ok) {
      const text = await postsRes.text();
      throw new Error(
        `Facebook Posts API failed: ${postsRes.status} — ${text}`,
      );
    }

    const postsData = await postsRes.json();
    const batchCount = postsData?.data?.length || 0;
    console.log(`Received ${batchCount} posts on this page.`);

    if (!postsData.data || postsData.data.length === 0) {
      console.log("No posts found — stopping pagination.");
      break;
    }

    posts.push(...postsData.data);
    nextUrl = postsData.paging?.next || null;

    if (!nextUrl) console.log("No next page — reached end.");
    if (pageCount > 10) {
      console.warn("Hit pagination safety cap (10 pages) — breaking.");
      break;
    }
  }

  console.log(`Finished fetching posts — total posts: ${posts.length}`);

  return {
    page_follows: insightsResults.page_follows || 0,
    page_actions_post_reactions_like_total:
      insightsResults.page_actions_post_reactions_like_total || 0,
    page_media_view: insightsResults.page_media_view || 0,
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

  for (const account of accounts) {
    console.log(`\nSyncing account: ${account.username} (${account.userId})`);
    try {
      const metrics = await fetchFacebookMetrics(
        FACEBOOK_PAGE_ID,
        FACEBOOK_PAGE_TOKEN,
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
          },
        });
        console.log(`Saved metric: ${metricEnum} = ${metricVal}`);
      }

      console.log(`✅ Successfully synced ${account.username}`);
    } catch (err) {
      console.error(`❌ Failed syncing ${account.username}`, err);
    }
  }

  console.log("Sync process completed. Disconnecting Prisma...");
  await prisma.$disconnect();
}

async function main() {
  try {
    await syncFacebookMetrics();
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
