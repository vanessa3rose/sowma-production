import { fileURLToPath } from "node:url";
import { PrismaClient, Metric } from "../src/generated/prisma";

const prisma = new PrismaClient();

const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID;
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET;
const FACEBOOK_SHORT_TOKEN = process.env.FACEBOOK_SHORT_TOKEN;

// Links Facebook API's data names to our Prisma Enums
type FacebookPublicMetrics = {
  page_follows: number;
  page_fans: number;
  page_impressions_unique: number;
  
  total_comments: number
  total_posts: number;
  total_shares: number;

};

// Step 1: Exchange short-lived token for long-lived token
export async function exchangeForLongLivedToken(shortLivedToken: string = FACEBOOK_SHORT_TOKEN!): Promise<string> {
    const url = `https://graph.facebook.com/v20.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${FACEBOOK_APP_ID}&client_secret=${FACEBOOK_APP_SECRET}&fb_exchange_token=${shortLivedToken}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
        throw new Error(`Token exchange failed: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.access_token;
}

// Step 2: Get page access token using long-lived token
export async function getPageAccessToken(longLivedToken: string, pageId: string): Promise<string> {
    const url = `https://graph.facebook.com/v20.0/${pageId}?fields=access_token&access_token=${longLivedToken}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
        throw new Error(`Failed to get page access token: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.access_token;
}

// Step 3: Complete flow - short token → long token → page token
export async function getCompleteTokenFlow(pageId: string): Promise<string> {
    try {
        // Convert short-lived to long-lived token
        const longLivedToken = await exchangeForLongLivedToken();
        console.log('✅ Got long-lived token');
        
        // Get page access token
        const pageAccessToken = await getPageAccessToken(longLivedToken, pageId);
        console.log('✅ Got page access token');
        
        return pageAccessToken;
    } catch (error) {
        console.error('❌ Token flow failed:', error);
        throw error;
    }
}

// Fetches data from Facebook's API
export async function fetchFacebookMetrics(pageId: string, pageAccessToken: string) {

  //going to have to change lots of code here. instead of returning data
  //need to reurn facebook array, find the stuff in it, and calculate the last
  //3 enums to return
const res = await fetch(
  `https://graph.facebook.com/v20.0/${pageId}/insights?metric=page_follows,page_fans,page_impressions_unique&period=lifetime&access_token=${pageAccessToken}`
);

  
  if (!res.ok) throw new Error("Facebook API failed");
  const insightsData = await res.json();

  let posts: any[] = [];
  let nextUrl: string | null = `https://graph.facebook.com/v20.0/${pageId}/posts?fields=shares,comments.summary(true)&access_token=${pageAccessToken}`;

  while (nextUrl) {
    const postsRes = await fetch(nextUrl);
    if (!postsRes.ok) throw new Error("Facebook Posts API failed");
    
    const postsData = await postsRes.json();
    
    //this ... operator combines the arrays instead of creating inner nested arrays
    posts.push(...postsData.data);

    // If there’s another page, follow it
    nextUrl = postsData.paging?.next || null;
  }


  return {
  //RETURN FACEBOOK DATA

    page_follows: 
        insightsData.data.find(m => m.name === "page_follows")?.values[0]?.value || 0,
    page_fans: 
        insightsData.data.find(m => m.name === "page_fans")?.values[0]?.value || 0,
    page_impressions_unique: 
        insightsData.data.find(m => m.name === "page_impressions_unique")?.values[0]?.value || 0,

    total_posts: posts.length,
    total_shares: posts.reduce((sum, post) => sum + (post.shares?.count || 0), 0),
    total_comments: posts.reduce((sum, post) => sum + (post.comments?.summary?.total_count || 0), 0),
  }
}

export async function syncFacebookMetrics() {
  // Get accounts from facebook's API
  const accounts = await prisma.socialMedia.findMany({
    where: { provider: "FACEBOOK" },
  });

  // Map facebook's keys to our Enums defined in schema.prisma
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

  // Iterate for each account being pulled
  for (const account of accounts) {
    try {
    const pageToken = await getCompleteTokenFlow(account.userId);
    
      // Fetch metrics from the account MIGHT CHANGE BECAUSE OF FACEBOOK
      const metrics = await fetchFacebookMetrics(account.userId, pageToken);

      // Convert the twitter-provided metric name to a Metric enum
      for (const [metricName, metricVal] of Object.entries(metrics) as [
        keyof FacebookPublicMetrics,
        number,
      ][]) {
        const metricEnum = FACEBOOK_TO_PRISMA_METRIC[metricName];
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
    await syncFacebookMetrics();
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
