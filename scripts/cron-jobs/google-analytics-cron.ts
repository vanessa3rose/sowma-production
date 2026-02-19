import "dotenv/config";
import { BetaAnalyticsDataClient } from "@google-analytics/data";
import { GoogleAuth } from "google-auth-library";
import {
  PrismaClient,
  Provider,
  Metric,
} from "../../src/generated/prisma/index.js";
import { startOfDay, formatISODate } from "../../src/utils/dates.js";

/* -------------------------------------------------
   Prisma Client
-------------------------------------------------- */
const prisma = new PrismaClient();

/* -------------------------------------------------
   GA Client Setup
-------------------------------------------------- */

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

const GA_PROPERTY = "properties/393011442";

/* -------------------------------------------------
   Helpers
-------------------------------------------------- */

function getYesterdayUTC(): Date {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 1);
  return d;
}

/* -------------------------------------------------
   Daily Google Analytics Sync
-------------------------------------------------- */
export async function runDailyGoogleAnalyticsSync() {
  try {
    const metricDate = startOfDay(getYesterdayUTC());
    const dateStr = formatISODate(metricDate);

    console.log(`[GA] Starting daily sync for ${dateStr} (T-1 UTC)`);

    const account = await prisma.socialMedia.findFirst({
      where: { provider: Provider.GOOGLE_ANALYTICS },
    });

    if (!account) {
      console.error("[GA] No Google Analytics account found");
      return;
    }

    const [response] = await analyticsDataClient.runReport({
      property: GA_PROPERTY,
      dateRanges: [{ startDate: dateStr, endDate: dateStr }],
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

    if (!response.rows?.length) {
      console.error(`[GA] No rows returned for ${dateStr}`);
      return;
    }

    const values = response.rows[0].metricValues ?? [];

    const metricsToInsert = [
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
    ] as const;

    await prisma.$transaction(async (tx) => {
      await tx.socialMediaMetrics.deleteMany({
        where: {
          socialMediaId: account.id,
          metricDate,
          metricName: { in: metricsToInsert.map((m) => m.metricName) },
        },
      });

      await Promise.all(
        metricsToInsert.map((m) =>
          tx.socialMediaMetrics.create({
            data: {
              socialMediaId: account.id,
              metricName: m.metricName,
              metricValue: m.metricValue,
              metricDate,
              lastSynced: new Date(),
            },
          }),
        ),
      );
    });

    console.log(
      `[GA] OK: sessions=${values[6]?.value ?? 0} users=${values[0]?.value ?? 0}`,
    );

    console.log("[GA] Daily Google Analytics sync complete");
  } catch (err) {
    console.error("[GA] Daily Google Analytics sync failed", err);
    throw err;
  } finally {
    await prisma.$disconnect();
  }
}

/* -------------------------------------------------
   Entrypoint
-------------------------------------------------- */
runDailyGoogleAnalyticsSync().catch(console.error);
