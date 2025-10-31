import { fileURLToPath } from "node:url";
import { PrismaClient, Metric } from "../src/generated/prisma";
import {
  createSocialMediaMetric,
  getMetricsBySocialMediaId,
  updateSocialMediaMetric,
  closePrisma as closeMetricsPrisma,
} from "../db/social-media-metrics";

import "dotenv/config";
import fetch from "node-fetch";

const prisma = new PrismaClient();

const GRAPH_API_BASE =
  process.env.INSTAGRAM_GRAPH_API_BASE ?? "https://graph.facebook.com";
const GRAPH_API_VERSION = process.env.INSTAGRAM_GRAPH_API_VERSION ?? "v18.0";
const INSTAGRAM_ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;
const DEFAULT_MEDIA_SAMPLE_SIZE =
  Number(process.env.INSTAGRAM_MEDIA_SAMPLE_SIZE) || 25;

const INSTAGRAM_BUSINESS_PAGE_ID = process.env.INSTAGRAM_BUSINESS_PAGE_ID;
const INSTAGRAM_USER_ID = process.env.INSTAGRAM_USER_ID;
const ACCESS_TOKEN = process.env.FACEBOOK_PAGE_TOKEN; // or process.env.INSTAGRAM_ACCESS_TOKEN

type InstagramMetricKey =
  | "followers_count"
  | "media_count"
  | "impressions"
  | "total_likes"
  | "total_comments";

type InstagramMetrics = Partial<Record<InstagramMetricKey, number>>;

const INSTAGRAM_TO_PRISMA_METRIC: Partial<Record<InstagramMetricKey, Metric>> =
  {
    followers_count: Metric.FOLLOWERS,
    media_count: Metric.POSTS,
    impressions: Metric.VIEWS,
    total_likes: Metric.LIKES,
    total_comments: Metric.COMMENTS,
  };

function requireAccessToken() {
  if (!INSTAGRAM_ACCESS_TOKEN) {
    throw new Error("Missing INSTAGRAM_ACCESS_TOKEN environment variable");
  }
}

function buildGraphUrl(path: string, params: URLSearchParams) {
  requireAccessToken();
  const normalizedBase = GRAPH_API_BASE.replace(/\/+$/, "");
  const normalizedVersion = GRAPH_API_VERSION.replace(/^\/+/, "");
  const normalizedPath = path.replace(/^\/+/, "");
  params.set("access_token", INSTAGRAM_ACCESS_TOKEN as string);
  return `${normalizedBase}/${normalizedVersion}/${normalizedPath}?${params.toString()}`;
}

async function fetchFromGraph<T>(
  path: string,
  params: URLSearchParams,
): Promise<T> {
  const url = buildGraphUrl(path, params);
  const res = await fetch(url);

  if (!res.ok) {
    const body = await res.text();
    throw new Error(
      `Instagram API request failed (${res.status} ${res.statusText}): ${body}`,
    );
  }

  return (await res.json()) as T;
}

export async function fetchInstagramMetrics(
  userId: string,
): Promise<InstagramMetrics> {
  requireAccessToken();

  const metrics: InstagramMetrics = {};

  // Pull account-level metrics (followers, posts)
  const accountData = await fetchFromGraph<{
    followers_count?: number;
    media_count?: number;
  }>(
    userId,
    new URLSearchParams({
      fields: ["followers_count", "media_count"].join(","),
    }),
  );

  if (typeof accountData.followers_count === "number") {
    metrics.followers_count = accountData.followers_count;
  }
  if (typeof accountData.media_count === "number") {
    metrics.media_count = accountData.media_count;
  }

  // Pull daily insights (impressions)
  try {
    const insights = await fetchFromGraph<{
      data?: Array<{
        name?: string;
        values?: Array<{ value?: number }>;
      }>;
    }>(
      `${userId}/insights`,
      new URLSearchParams({
        metric: "impressions",
        period: "day",
      }),
    );

    const impressionInsight = insights.data?.find(
      (entry) => entry.name === "impressions",
    );
    const latestImpressions = impressionInsight?.values?.[0]?.value;
    if (typeof latestImpressions === "number") {
      metrics.impressions = latestImpressions;
    }
  } catch (error) {
    console.warn(
      `⚠️ Unable to pull Instagram impressions for user ${userId}: ${(error as Error).message}`,
    );
  }

  // Aggregate media engagement (likes, comments) across recent posts to map to our Prisma metrics.
  try {
    const media = await fetchFromGraph<{
      data?: Array<{ like_count?: number; comments_count?: number }>;
    }>(
      `${userId}/media`,
      new URLSearchParams({
        fields: ["id", "like_count", "comments_count"].join(","),
        limit: String(DEFAULT_MEDIA_SAMPLE_SIZE),
      }),
    );

    const { totalLikes, totalComments } = (media.data ?? []).reduce(
      (acc, item) => {
        if (typeof item.like_count === "number")
          acc.totalLikes += item.like_count;
        if (typeof item.comments_count === "number")
          acc.totalComments += item.comments_count;
        return acc;
      },
      { totalLikes: 0, totalComments: 0 },
    );

    if (totalLikes > 0) metrics.total_likes = totalLikes;
    if (totalComments > 0) metrics.total_comments = totalComments;
  } catch (error) {
    console.warn(
      `⚠️ Unable to aggregate Instagram media metrics for user ${userId}: ${(error as Error).message}`,
    );
  }

  return metrics;
}

async function persistInstagramMetrics(
  accountId: string,
  metrics: InstagramMetrics,
) {
  if (!Object.keys(metrics).length) return;

  const existingMetrics = await getMetricsBySocialMediaId(accountId);
  const latestMetricsByName = new Map<
    Metric,
    Awaited<ReturnType<typeof getMetricsBySocialMediaId>>[number]
  >();

  for (const record of existingMetrics) {
    if (!latestMetricsByName.has(record.metricName)) {
      latestMetricsByName.set(record.metricName, record);
    }
  }

  for (const [metricName, metricVal] of Object.entries(metrics) as [
    InstagramMetricKey,
    number,
  ][]) {
    if (!Number.isFinite(metricVal)) continue;
    const metricEnum = INSTAGRAM_TO_PRISMA_METRIC[metricName];
    if (!metricEnum) continue;

    const payload = {
      socialMediaId: accountId,
      metricName: metricEnum,
      metricValue: Math.round(metricVal),
      lastSynced: new Date(),
    };

    const existingRecord = latestMetricsByName.get(metricEnum);

    if (existingRecord) {
      const updated = await updateSocialMediaMetric(existingRecord.id, {
        metricValue: payload.metricValue,
        lastSynced: payload.lastSynced,
      });
      latestMetricsByName.set(metricEnum, updated);
    } else {
      const created = await createSocialMediaMetric(payload);
      latestMetricsByName.set(metricEnum, created);
    }
  }
}

export async function syncInstagramMetrics() {
  const accounts = await prisma.socialMedia.findMany({
    where: { provider: "INSTAGRAM" },
  });

  for (const account of accounts) {
    try {
      const metrics = await fetchInstagramMetrics(account.userId);
      await persistInstagramMetrics(account.id, metrics);
      console.log(`✅ Synced Instagram metrics for ${account.username}`);
    } catch (error) {
      console.error(
        `❌ Failed syncing Instagram metrics for ${account.username}`,
        error,
      );
    }
  }
}

async function fetchInstagramData() {
  const url = `https://graph.facebook.com/v20.0/${INSTAGRAM_BUSINESS_PAGE_ID}?fields=followers_count&access_token=${ACCESS_TOKEN}`;

  try {
    console.log(`Fetching data from: ${url}`);
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error. Status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Instagram Data:", data);

    const socialMediaMetrics: InstagramMetrics = {};
    if (typeof data.followers_count === "number") {
      socialMediaMetrics.followers_count = data.followers_count;
    }

    if (!Object.keys(socialMediaMetrics).length) {
      console.warn("⚠️ No Instagram metrics found in API response.");
      return;
    }

    let socialMediaAccount = INSTAGRAM_BUSINESS_PAGE_ID
      ? await prisma.socialMedia.findFirst({
          where: {
            provider: "INSTAGRAM",
            userId: INSTAGRAM_BUSINESS_PAGE_ID,
          },
        })
      : null;

    if (!socialMediaAccount && INSTAGRAM_USER_ID) {
      socialMediaAccount = await prisma.socialMedia.findFirst({
        where: {
          provider: "INSTAGRAM",
          userId: INSTAGRAM_USER_ID,
        },
      });
    }

    if (!socialMediaAccount) {
      console.warn(
        "⚠️ No Instagram social media record found to persist metrics.",
      );
      return;
    }

    await persistInstagramMetrics(socialMediaAccount.id, socialMediaMetrics);
    console.log(
      `✅ Persisted Instagram metrics for ${socialMediaAccount.username}`,
    );
  } catch (error) {
    console.error("Error fetching Instagram data:", error);
  }
}

async function main() {
  try {
    await fetchInstagramData();
    await syncInstagramMetrics();
  } catch (err) {
    console.error(err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
    await closeMetricsPrisma();
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  void main();
}
