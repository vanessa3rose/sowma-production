import fs from "fs";
import "dotenv/config";
import { BetaAnalyticsDataClient } from "@google-analytics/data";
import { GoogleAuth } from "google-auth-library";
import {
  createSocialMediaMetric,
  updateSocialMediaMetric,
  getMetricsBySocialMediaId,
  closePrisma,
} from "../db/social-media-metrics";
import { PrismaClient, Provider, Metric } from "../src/generated/prisma";
import {
  startOfDay,
  endOfDay,
  formatISODate,
  metricsExistForDay,
} from "../src/utils/dates";

const prisma = new PrismaClient();

/* -------------------------------------------------
   GA client setup
-------------------------------------------------- */

// Load service account key
const jsonKey = JSON.parse(
  fs.readFileSync("service-account.json", "utf8"),
);

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
      `GA newVsReturning breakdown returned no rows for ${dateStr}`,
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
        `Failed saving TOTAL_SESSIONS (${label}) for ${dateStr}`,
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
      `GA sessionsBySource breakdown returned no rows for ${dateStr}`,
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
        `Failed saving SESSIONS_BY_SOURCE (${source}) for ${dateStr}`,
        err,
      );
    }
  }
}

/* -------------------------------------------------
   Daily GA sync
-------------------------------------------------- */

async function runDailyReport() {
  const metricDate = startOfDay(getYesterdayUTC());
  const dateStr = formatISODate(metricDate);

  try {
    const socialMediaId = await getSocialMediaIdByProvider();
    if (!socialMediaId) {
      console.error("Google Analytics SocialMedia entry not found.");
      return;
    }

    // ---- GLOBAL IDEMPOTENCY CHECK ----
    if (await metricsExistForDay(socialMediaId, metricDate)) {
      console.log(`[GA] already synced (${dateStr})`);
      return;
    }

    const existingMetrics = await getMetricsBySocialMediaId(
      socialMediaId,
    );

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
      console.error(`GA returned no rows for ${dateStr}`);
      return;
    }

    const values = response.rows[0].metricValues ?? [];

    const metricsToSave = [
      { metricName: Metric.ACTIVE_USERS, metricValue: Number(values[0]?.value ?? 0) },
      { metricName: Metric.SCREEN_PAGE_VIEWS, metricValue: Number(values[1]?.value ?? 0) },
      { metricName: Metric.ENGAGEMENT_RATE, metricValue: Number(values[2]?.value ?? 0) * 100 },
      { metricName: Metric.NEW_USERS, metricValue: Number(values[3]?.value ?? 0) },
      { metricName: Metric.BOUNCE_RATE, metricValue: Number(values[4]?.value ?? 0) * 100 },
      { metricName: Metric.AVG_SESSION_DURATION, metricValue: Number(values[5]?.value ?? 0) },
      { metricName: Metric.TOTAL_SESSIONS, metricValue: Number(values[6]?.value ?? 0) },
      { metricName: Metric.ENGAGED_SESSIONS, metricValue: Number(values[7]?.value ?? 0) },
      { metricName: Metric.PAGES_PER_SESSION, metricValue: Number(values[8]?.value ?? 0) },
      { metricName: Metric.ENGAGEMENT_TIME, metricValue: Number(values[9]?.value ?? 0) },
    ];

    for (const metric of metricsToSave) {
      const existing = existingMetrics.find(
        (m) =>
          m.metricName === metric.metricName &&
          m.metricDate?.getTime() === metricDate.getTime() &&
          !m.breakdownKey &&
          !m.breakdownValue,
      );

      if (existing) continue;

      await createSocialMediaMetric({
        socialMediaId,
        metricName: metric.metricName,
        metricValue: metric.metricValue,
        metricDate,
        lastSynced: new Date(),
      });
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
  } catch (err) {
    console.error(
      `[google-analytics-daily-sync] Failed for ${dateStr}`,
      err,
    );
    throw err;
  }
}

/* -------------------------------------------------
   Entrypoint
-------------------------------------------------- */

(async () => {
  try {
    await runDailyReport();
  } finally {
    await closePrisma();
  }
})();
