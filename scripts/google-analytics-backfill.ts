import fs from "fs";
import "dotenv/config";
import { BetaAnalyticsDataClient } from "@google-analytics/data";
import { fileURLToPath } from "node:url";
import { GoogleAuth } from "google-auth-library";
import {
  createSocialMediaMetric,
  updateSocialMediaMetric,
  getMetricsBySocialMediaId,
  closePrisma,
} from "../db/social-media-metrics";
import { PrismaClient, Provider, Metric } from "../src/generated/prisma";

console.log("[GA] Script loaded");

const prisma = new PrismaClient();

console.log("[GA] Script starting");

// Load service account key
const jsonKey = JSON.parse(
  fs.readFileSync("service-account.json", "utf8"),
); 

console.log("[GA] Service account key loaded");

// Create a GoogleAuth instance using the credentials
const auth = new GoogleAuth({
  credentials: jsonKey,
  scopes: ["https://www.googleapis.com/auth/analytics.readonly"],
});

// Initialize the Analytics Data API client
const analyticsDataClient = new BetaAnalyticsDataClient({ auth });

console.log("[GA] Analytics client initialized");

async function getSocialMediaIdByProvider(): Promise<string | null> {
  const record = await prisma.socialMedia.findFirst({
    where: { provider: Provider.GOOGLE_ANALYTICS },
    select: { id: true },
  });

  if (!record) {
    console.error("[GA] Google Analytics SocialMedia entry not found");
    return null;
  }

  console.log(`[GA] Using socialMediaId=${record.id}`);
  return record.id;
}

/**
 * Helper: breakdown for New vs Returning (pie chart)
 */
async function syncNewVsReturningBreakdown(
  targetDate: string,
  socialMediaId: string,
  existingMetrics: any[],
) {
  console.log(`[GA] Syncing newVsReturning for ${targetDate}`);

  const [response] = await analyticsDataClient.runReport({
    property: "properties/393011442",
    dateRanges: [{ startDate: targetDate, endDate: targetDate }],
    dimensions: [{ name: "newVsReturning" }],
    metrics: [{ name: "sessions" }],
  });

  if (!response.rows || response.rows.length === 0) {
    console.warn(
      `[GA] No newVsReturning rows returned for ${targetDate}`,
    );
    return;
  }

  const metricDate = new Date(targetDate);
  let created = 0;
  let updated = 0;

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
        updated++;
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
        created++;
      }
    } catch (err) {
      console.error(
        `[GA] Failed saving newVsReturning (${label}) for ${targetDate}`,
        err,
      );
    }
  }

  console.log(
    `[GA] newVsReturning ${targetDate}: created=${created}, updated=${updated}`,
  );
}

/**
 * Helper: breakdown for Sessions by Source (bar chart)
 */
async function syncSessionsBySourceBreakdown(
  targetDate: string,
  socialMediaId: string,
  existingMetrics: any[],
) {
  console.log(`[GA] Syncing sessionsBySource for ${targetDate}`);

  const [response] = await analyticsDataClient.runReport({
    property: "properties/393011442",
    dateRanges: [{ startDate: targetDate, endDate: targetDate }],
    dimensions: [{ name: "sessionSource" }],
    metrics: [{ name: "sessions" }],
  });

  if (!response.rows || response.rows.length === 0) {
    console.warn(
      `[GA] No sessionsBySource rows returned for ${targetDate}`,
    );
    return;
  }

  const metricDate = new Date(targetDate);
  let created = 0;
  let updated = 0;

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
        updated++;
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
        created++;
      }
    } catch (err) {
      console.error(
        `[GA] Failed saving sessionsBySource (${source}) for ${targetDate}`,
        err,
      );
    }
  }

  console.log(
    `[GA] sessionsBySource ${targetDate}: created=${created}, updated=${updated}`,
  );
}

/**
 * Run a GA report over a date range and persist metrics per day.
 */
async function runReport(startDate: string, endDate: string) {
  console.log(`[GA] Running report ${startDate} → ${endDate}`);

  const [response] = await analyticsDataClient.runReport({
    property: "properties/393011442",
    dateRanges: [{ startDate, endDate }],
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
    console.warn(
      `[GA] No rows returned for ${startDate} → ${endDate}`,
    );
    return;
  }

  console.log(`[GA] ${response.rows.length} day rows returned`);

  const socialMediaId = await getSocialMediaIdByProvider();
  if (!socialMediaId) return;

  const existingMetrics = await getMetricsBySocialMediaId(
    socialMediaId,
  );
  console.log(
    `[GA] Loaded ${existingMetrics.length} existing metrics`,
  );

  let dayIndex = 0;

  for (const row of response.rows) {
    const dateStr = row.dimensionValues?.[0]?.value;
    if (!dateStr || dateStr.length !== 8) continue;

    const metricDate = new Date(
      Number(dateStr.slice(0, 4)),
      Number(dateStr.slice(4, 6)) - 1,
      Number(dateStr.slice(6, 8)),
    );

    const isoDate = metricDate.toISOString().slice(0, 10);
    const values = row.metricValues ?? [];

    if (dayIndex % 10 === 0) {
      console.log(`[GA] Processing day ${isoDate}`);
    }

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

      try {
        if (existing) {
          await updateSocialMediaMetric(existing.id, {
            metricName: metric.metricName,
            metricValue: metric.metricValue,
            metricDate,
            lastSynced: new Date(),
          });
        } else {
          await createSocialMediaMetric({
            socialMediaId,
            metricName: metric.metricName,
            metricValue: metric.metricValue,
            metricDate,
            lastSynced: new Date(),
          });
        }
      } catch (err) {
        console.error(
          `[GA] Failed saving ${metric.metricName} for ${isoDate}`,
          err,
        );
      }
    }

    await syncNewVsReturningBreakdown(
      isoDate,
      socialMediaId,
      existingMetrics,
    );
    await syncSessionsBySourceBreakdown(
      isoDate,
      socialMediaId,
      existingMetrics,
    );

    dayIndex++;
  }

  console.log(
    `[GA] Completed processing ${dayIndex} days (${startDate} → ${endDate})`,
  );
}

async function main() {
  try {
    const args = process.argv.slice(2);

    if (args[0] === "backfill") {
      const start = args[1];
      const end = args[2];
      if (!start || !end) {
        throw new Error(
          "Usage: npx tsx scripts/google-analytics.ts backfill YYYY-MM-DD YYYY-MM-DD",
        );
      }
      await runReport(start, end);
    } else {
      const today = new Date().toISOString().slice(0, 10);
      await runReport(today, today);
    }
  } catch (err) {
    console.error("[GA] Script failed", err);
    process.exitCode = 1;
  } finally {
    await closePrisma();
    console.log("[GA] Prisma disconnected, script finished");
  }
}

(async () => {
  try {
    await main();
  } catch (err) {
    console.error("[GA] Unhandled error", err);
    process.exit(1);
  }
})();
