import "dotenv/config";
import { BetaAnalyticsDataClient } from "@google-analytics/data";
import { GoogleAuth } from "google-auth-library";
import {
  createSocialMediaMetric,
  updateSocialMediaMetric,
  getMetricsBySocialMediaId,
} from "../../db/social-media-metrics.js";
import {
  PrismaClient,
  Provider,
  Metric,
} from "../../src/generated/prisma/index.js";
import {
  startOfDay,
  formatISODate,
  metricsExistForDay,
} from "../../src/utils/dates.js";

/* -------------------------------------------------
   Prisma Client
-------------------------------------------------- */
const prisma = new PrismaClient();

/* -------------------------------------------------
   GA client setup
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

// Create a GoogleAuth instance using the credentials
const auth = new GoogleAuth({
  credentials: jsonKey,
  scopes: ["https://www.googleapis.com/auth/analytics.readonly"],
});

// Initialize the Analytics Data API client
const analyticsDataClient = new BetaAnalyticsDataClient({ auth });

/* -------------------------------------------------
   Helpers
-------------------------------------------------- */

async function getSocialMediaIdByProvider(): Promise<string | null> {
  const record = await prisma.socialMedia.findFirst({
    where: { provider: Provider.GOOGLE_ANALYTICS },
    select: { id: true },
  });
  return record?.id || null;
}

function getYesterdayUTC(): Date {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 1);
  return d;
}

/**
 * Helper: breakdown for New vs Returning (pie chart)
 */
async function syncNewVsReturningBreakdown(
  metricDate: Date,
  socialMediaId: string,
  existingMetrics: any[],
) {
  const dateStr = formatISODate(metricDate);

  const [response] = await analyticsDataClient.runReport({
    property: "properties/393011442",
    dateRanges: [{ startDate: dateStr, endDate: dateStr }],
    dimensions: [{ name: "newVsReturning" }],
    metrics: [{ name: "sessions" }],
  });

  if (!response.rows || response.rows.length === 0) {
    console.error(
      `[GA] newVsReturning breakdown returned no rows for ${dateStr}`,
    );
    return;
  }

  for (const row of response.rows) {
    const label = row.dimensionValues?.[0]?.value ?? "unknown";
    const sessions = Number(row.metricValues?.[0]?.value ?? 0);

    const existing = existingMetrics.find(
      (m) =>
        m.metricName === Metric.TOTAL_SESSIONS &&
        m.metricDate?.getTime() === metricDate.getTime() &&
        m.breakdownKey === "newVsReturning" &&
        m.breakdownValue === label,
    );

    try {
      if (existing) {
        await updateSocialMediaMetric(existing.id, {
          metricName: Metric.TOTAL_SESSIONS,
          metricValue: sessions,
          metricDate,
          breakdownKey: "newVsReturning",
          breakdownValue: label,
          lastSynced: new Date(),
        });
      } else {
        await createSocialMediaMetric({
          socialMediaId,
          metricName: Metric.TOTAL_SESSIONS,
          metricValue: sessions,
          metricDate,
          breakdownKey: "newVsReturning",
          breakdownValue: label,
          lastSynced: new Date(),
        });
      }
    } catch (err) {
      console.error(
        `[GA] Failed saving TOTAL_SESSIONS (${label}) for ${dateStr}`,
        err,
      );
    }
  }
}

/**
 * Helper: breakdown for Sessions by Source (bar chart)
 */
async function syncSessionsBySourceBreakdown(
  metricDate: Date,
  socialMediaId: string,
  existingMetrics: any[],
) {
  const dateStr = formatISODate(metricDate);

  const [response] = await analyticsDataClient.runReport({
    property: "properties/393011442",
    dateRanges: [{ startDate: dateStr, endDate: dateStr }],
    dimensions: [{ name: "sessionSource" }],
    metrics: [{ name: "sessions" }],
  });

  if (!response.rows || response.rows.length === 0) {
    console.error(
      `[GA] sessionsBySource breakdown returned no rows for ${dateStr}`,
    );
    return;
  }

  for (const row of response.rows) {
    const source = row.dimensionValues?.[0]?.value ?? "unknown";
    const sessions = Number(row.metricValues?.[0]?.value ?? 0);

    const existing = existingMetrics.find(
      (m) =>
        m.metricName === Metric.SESSIONS_BY_SOURCE &&
        m.metricDate?.getTime() === metricDate.getTime() &&
        m.breakdownKey === "sessionSource" &&
        m.breakdownValue === source,
    );

    try {
      if (existing) {
        await updateSocialMediaMetric(existing.id, {
          metricName: Metric.SESSIONS_BY_SOURCE,
          metricValue: sessions,
          metricDate,
          breakdownKey: "sessionSource",
          breakdownValue: source,
          lastSynced: new Date(),
        });
      } else {
        await createSocialMediaMetric({
          socialMediaId,
          metricName: Metric.SESSIONS_BY_SOURCE,
          metricValue: sessions,
          metricDate,
          breakdownKey: "sessionSource",
          breakdownValue: source,
          lastSynced: new Date(),
        });
      }
    } catch (err) {
      console.error(
        `[GA] Failed saving SESSIONS_BY_SOURCE (${source}) for ${dateStr}`,
        err,
      );
    }
  }
}

/* -------------------------------------------------
   Daily GA sync
-------------------------------------------------- */
export async function runDailyGoogleAnalyticsSync() {
  const metricDate = startOfDay(getYesterdayUTC());
  const dateStr = formatISODate(metricDate);

  try {
    const socialMediaId = await getSocialMediaIdByProvider();
    if (!socialMediaId) {
      console.error("[GA] SocialMedia entry not found.");
      return;
    }

    // ---- GLOBAL IDEMPOTENCY CHECK ----
    if (await metricsExistForDay(socialMediaId, metricDate)) {
      console.log(`[GA] already synced (${dateStr})`);
      return;
    }

    const existingMetrics = await getMetricsBySocialMediaId(socialMediaId);

    const [response] = await analyticsDataClient.runReport({
      property: "properties/393011442",
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

    if (!response.rows || response.rows.length === 0) {
      console.error(`[GA] no rows returned for ${dateStr}`);
      return;
    }

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
          m.metricDate?.getTime() === metricDate.getTime() &&
          !m.breakdownKey &&
          !m.breakdownValue,
      );

      if (!existing) {
        await createSocialMediaMetric({
          socialMediaId,
          metricName: metric.metricName,
          metricValue: metric.metricValue,
          metricDate,
          lastSynced: new Date(),
        });
      }
    }

    await syncNewVsReturningBreakdown(
      metricDate,
      socialMediaId,
      existingMetrics,
    );
    await syncSessionsBySourceBreakdown(
      metricDate,
      socialMediaId,
      existingMetrics,
    );

    console.log(`[GA] Daily Google Analytics sync complete (${dateStr})`);
  } catch (err) {
    console.error(`[GA] Daily sync failed for ${dateStr}`, err);
    throw err;
  } finally {
    await prisma.$disconnect();
  }
}

/* -------------------------------------------------
   CLI Entrypoint
-------------------------------------------------- */
if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    try {
      await runDailyGoogleAnalyticsSync();
    } catch (err) {
      console.error("[GA] Cron job failed", err);
      process.exit(1);
    } finally {
      await prisma.$disconnect();
    }
  })();
}
