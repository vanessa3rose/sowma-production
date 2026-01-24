import "dotenv/config";
import { BetaAnalyticsDataClient } from "@google-analytics/data";
import { GoogleAuth } from "google-auth-library";
import {
  createSocialMediaMetric,
  updateSocialMediaMetric,
  getMetricsBySocialMediaId,
} from "../db/social-media-metrics";
import { startOfDay, endOfDay } from "../src/utils/dates";
import {
  PrismaClient,
  Provider,
  Metric,
} from "../src/generated/prisma/index.js";

console.log("[GA] Script loaded");

// -------------------------------
// Prisma setup (serverless-friendly)
// -------------------------------
const prisma = (globalThis as any).prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") (globalThis as any).prisma = prisma;

// -------------------------------
// GA client setup
// -------------------------------

const jsonKey = {
  type: process.env.GA_TYPE,
  project_id: process.env.GA_PROJECT_ID,
  private_key_id: process.env.GA_PRIVATE_KEY_ID,
  private_key: process.env.GA_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  client_email: process.env.GA_CLIENT_EMAIL,
  client_id: process.env.GA_CLIENT_ID,
  auth_uri: process.env.GA_AUTH_URI,
  token_uri: process.env.GA_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.GA_AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.GA_CLIENT_X509_CERT_URL,
  universe_domain: process.env.GA_UNIVERSE_DOMAIN,
};

if (!jsonKey.private_key || !jsonKey.client_email) {
  throw new Error("Missing Google Analytics service account credentials");
}

const auth = new GoogleAuth({
  credentials: jsonKey,
  scopes: ["https://www.googleapis.com/auth/analytics.readonly"],
});

const analyticsDataClient = new BetaAnalyticsDataClient({ auth });
console.log("[GA] Analytics client initialized");

// -------------------------------
// Helpers
// -------------------------------

// Get socialMediaId for GA
async function getSocialMediaId(): Promise<string | null> {
  const record = await prisma.socialMedia.findFirst({
    where: { provider: Provider.GOOGLE_ANALYTICS },
    select: { id: true },
  });
  if (!record) {
    console.error("[GA] No GA SocialMedia entry found");
    return null;
  }
  return record.id;
}

// Check if metrics exist for a day
async function metricsExistForDay(socialMediaId: string, date: Date) {
  const existing = await prisma.socialMediaMetrics.findFirst({
    where: {
      socialMediaId,
      metricDate: { gte: startOfDay(date), lt: endOfDay(date) },
    },
  });
  return existing !== null;
}

// Earliest possible date (2 years back)
function getEarliestPossibleDate(): Date {
  const d = new Date();
  d.setUTCFullYear(d.getUTCFullYear() - 2);
  return d;
}

// -------------------------------
// Run GA report for a single day
// -------------------------------
async function runReportForDay(date: Date) {
  const isoDate = date.toISOString().slice(0, 10);

  const [response] = await analyticsDataClient.runReport({
    property: "properties/393011442",
    dateRanges: [{ startDate: isoDate, endDate: isoDate }],
    dimensions: [{ name: "date" }],
    metrics: [
      { name: "activeUsers" },
      { name: "screenPageViews" },
      { name: "engagementRate" },
      { name: "newUsers" },
      { name: "bounceRate" },
      { name: "averageSessionDuration" },
      { name: "sessions" },
      { name: "engagedSessions" },
      { name: "screenPageViewsPerSession" },
      { name: "userEngagementDuration" },
    ],
  });

  if (!response.rows || response.rows.length === 0) {
    console.warn(`[GA] No rows returned for ${isoDate}`);
    return;
  }

  const socialMediaId = await getSocialMediaId();
  if (!socialMediaId) return;

  const existingMetrics = await getMetricsBySocialMediaId(socialMediaId);

  const values = response.rows[0].metricValues ?? [];
  const metricsToSave = [
    {
      metricName: Metric.ACTIVE_USERS,
      metricValue: Number(values[0]?.value ?? 0),
    },
    {
      metricName: Metric.SCREEN_PAGE_VIEWS,
      metricValue: Number(values[1]?.value ?? 0),
    },
    {
      metricName: Metric.ENGAGEMENT_RATE,
      metricValue: Number(values[2]?.value ?? 0) * 100,
    },
    {
      metricName: Metric.NEW_USERS,
      metricValue: Number(values[3]?.value ?? 0),
    },
    {
      metricName: Metric.BOUNCE_RATE,
      metricValue: Number(values[4]?.value ?? 0) * 100,
    },
    {
      metricName: Metric.AVG_SESSION_DURATION,
      metricValue: Number(values[5]?.value ?? 0),
    },
    {
      metricName: Metric.TOTAL_SESSIONS,
      metricValue: Number(values[6]?.value ?? 0),
    },
    {
      metricName: Metric.ENGAGED_SESSIONS,
      metricValue: Number(values[7]?.value ?? 0),
    },
    {
      metricName: Metric.PAGES_PER_SESSION,
      metricValue: Number(values[8]?.value ?? 0),
    },
    {
      metricName: Metric.ENGAGEMENT_TIME,
      metricValue: Number(values[9]?.value ?? 0),
    },
  ];

  for (const metric of metricsToSave) {
    const existing = existingMetrics.find(
      (m: any) =>
        m.metricName === metric.metricName &&
        m.metricDate?.getTime() === date.getTime() &&
        !m.breakdownKey &&
        !m.breakdownValue,
    );

    if (existing) {
      await updateSocialMediaMetric(existing.id, {
        metricName: metric.metricName,
        metricValue: metric.metricValue,
        metricDate: date,
        lastSynced: new Date(),
      });
    } else {
      await createSocialMediaMetric({
        socialMediaId,
        metricName: metric.metricName,
        metricValue: metric.metricValue,
        metricDate: date,
        lastSynced: new Date(),
      });
    }
  }

  console.log(`[GA] Metrics written for ${isoDate}`);
}

// -------------------------------
// Main backfill
// -------------------------------
export async function runDailyGASync() {
  const socialMediaId = await getSocialMediaId();
  if (!socialMediaId) return;

  const today = new Date();
  const earliestPossible = getEarliestPossibleDate();

  let currentDate = startOfDay(earliestPossible);
  console.log(
    `[GA] Backfilling from ${currentDate.toISOString().slice(0, 10)} to ${today.toISOString().slice(0, 10)}`,
  );

  while (currentDate <= today) {
    if (!(await metricsExistForDay(socialMediaId, currentDate))) {
      await runReportForDay(currentDate);
    }

    // move to next day
    currentDate.setUTCDate(currentDate.getUTCDate() + 1);
  }

  console.log("[GA] GA sync complete");
}

// -------------------------------
// Standalone run
// -------------------------------
(async () => {
  try {
    await runDailyGASync();
  } catch (err) {
    console.error("Google Analytics cron failed", err);
  }
})();
