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

console.log("[GA] Script loaded");

const prisma = new PrismaClient();

// -------------------------------
// Cadence configuration
// -------------------------------
// Change this to control cadence
// "monthly" | "weekly" | "daily"
const CADENCE: "monthly" | "weekly" | "daily" = "daily";

// -------------------------------

console.log("[GA] Script starting");

// Load service account key
const jsonKey = JSON.parse(
  fs.readFileSync("service-account.json", "utf8"),
);

console.log("[GA] Service account key loaded");

// Auth
const auth = new GoogleAuth({
  credentials: jsonKey,
  scopes: ["https://www.googleapis.com/auth/analytics.readonly"],
});

// GA client
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
 * Run GA report and persist aggregate metrics on a fixed cadence
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
    console.warn(`[GA] No rows returned for ${startDate} → ${endDate}`);
    return;
  }

  console.log(`[GA] ${response.rows.length} day rows returned`);

  const socialMediaId = await getSocialMediaIdByProvider();
  if (!socialMediaId) return;

  const existingMetrics = await getMetricsBySocialMediaId(socialMediaId);
  console.log(`[GA] Loaded ${existingMetrics.length} existing metrics`);

  // Ensure deterministic ordering
  const sortedRows = [...response.rows].sort((a, b) => {
    const da = a.dimensionValues?.[0]?.value ?? "";
    const db = b.dimensionValues?.[0]?.value ?? "";
    return da.localeCompare(db);
  });

  const writtenKeys = new Set<string>();
  let writtenCount = 0;

  for (const row of sortedRows) {
    const dateStr = row.dimensionValues?.[0]?.value;
    if (!dateStr || dateStr.length !== 8) continue;

    const metricDate = new Date(
      Number(dateStr.slice(0, 4)),
      Number(dateStr.slice(4, 6)) - 1,
      Number(dateStr.slice(6, 8)),
    );

    // -------------------------------
    // Cadence gating
    // -------------------------------
    let cadenceKey: string;

    if (CADENCE === "monthly") {
      // First of each month
      if (metricDate.getDate() !== 1) continue;
      cadenceKey = `${metricDate.getFullYear()}-${metricDate.getMonth() + 1}`;
    } else if (CADENCE === "weekly") {
      cadenceKey = `${metricDate.getFullYear()}-W${Math.floor(
        metricDate.getDate() / 7,
      )}`;
    } else {
      cadenceKey = metricDate.toISOString().slice(0, 10);
    }

    if (writtenKeys.has(cadenceKey)) continue;
    writtenKeys.add(cadenceKey);
    writtenCount++;
    // -------------------------------

    const isoDate = metricDate.toISOString().slice(0, 10);
    console.log(`[GA] Writing metrics for ${isoDate}`);

    const values = row.metricValues ?? [];

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
  }

  console.log(
    `[GA] Completed ${CADENCE} sync: ${writtenCount} records written (${startDate} → ${endDate})`,
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
