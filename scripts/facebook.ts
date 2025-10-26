import { fileURLToPath } from "node:url";
import { PrismaClient, Metric } from "../src/generated/prisma";

const prisma = new PrismaClient();

const FACEBOOK_PAGE_ID = process.env.FACEBOOK_PAGE_ID!;
const FACEBOOK_PAGE_TOKEN = process.env.FACEBOOK_PAGE_TOKEN!;
const FB_API_VERSION = "v24.0";

type FacebookPublicMetrics = {
  page_follows: number;
  page_fans: number;
  page_impressions_unique: number;
  total_comments: number;
  total_posts: number;
  total_shares: number;
};

export async function fetchFacebookMetrics(
  pageId: string = FACEBOOK_PAGE_ID,
  pageAccessToken: string = FACEBOOK_PAGE_TOKEN
) {
  console.log(`\n🔍 [fetchFacebookMetrics] Fetching insights for page ${pageId}`);

  const insightsUrl = `https://graph.facebook.com/${FB_API_VERSION}/${pageId}/insights?metric=page_follows,page_fans,page_impressions_unique&period=lifetime&access_token=${pageAccessToken}`;
  console.log(`➡️  Insights URL: ${insightsUrl}`);

  const res = await fetch(insightsUrl);
  console.log(`📡 Insights response status: ${res.status}`);

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Facebook Insights API failed: ${res.status} — ${text}`);
  }

  const insightsData = await res.json();
  console.log(
    `Insights fetched: ${insightsData?.data?.length || 0} metrics returned`
  );

  // Pagination for posts
  let posts: any[] = [];
  let nextUrl: string | null = `https://graph.facebook.com/${FB_API_VERSION}/${pageId}/posts?fields=shares,comments.summary(true)&access_token=${pageAccessToken}`;
  let pageCount = 0;

  console.log("Starting to fetch posts...");

  while (nextUrl) {
    pageCount++;
    console.log(`Fetching posts page ${pageCount}`);
    const postsRes: Response = await fetch(nextUrl);
    console.log(`Posts response status: ${postsRes.status}`);

    if (!postsRes.ok) {
      const text = await postsRes.text();
      throw new Error(`Facebook Posts API failed: ${postsRes.status} — ${text}`);
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

  // Compute aggregate metrics
  const page_follows =
    insightsData.data.find((m: { name: string }) => m.name === "page_follows")?.values[0]?.value || 0;
  const page_fans =
    insightsData.data.find((m: { name: string }) => m.name === "page_fans")?.values[0]?.value || 0;
  const page_impressions_unique =
    insightsData.data.find((m: { name: string }) => m.name === "page_impressions_unique")?.values[0]?.value || 0;
  return {
    page_follows,
    page_fans,
    page_impressions_unique,
    total_posts: posts.length,
    total_shares: posts.reduce((sum, post) => sum + (post.shares?.count || 0), 0),
    total_comments: posts.reduce(
      (sum, post) => sum + (post.comments?.summary?.total_count || 0),
      0
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
    page_fans: Metric.LIKES,
    page_impressions_unique: Metric.VIEWS,
    total_posts: Metric.POSTS,
    total_shares: Metric.SHARES,
    total_comments: Metric.COMMENTS,
  };

  for (const account of accounts) {
    console.log(`\nSyncing account: ${account.username} (${account.userId})`);
    try {
      const metrics = await fetchFacebookMetrics(FACEBOOK_PAGE_ID, FACEBOOK_PAGE_TOKEN);
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
