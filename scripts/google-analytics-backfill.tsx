import fs from "fs";
import { BetaAnalyticsDataClient } from "@google-analytics/data";
import { fileURLToPath } from "node:url";
import "dotenv/config";
import { GoogleAuth } from "google-auth-library";
import {
  createSocialMediaMetric,
  updateSocialMediaMetric,
  getMetricsBySocialMediaId,
  closePrisma,
} from "../db/social-media-metrics";
import { PrismaClient, Provider, Metric } from "../src/generated/prisma";

const prisma = new PrismaClient();

// Load service account key
const jsonKey = JSON.parse(fs.readFileSync("service-account.json", "utf8"));

// Create a GoogleAuth instance using the credentials
const auth = new GoogleAuth({
  credentials: jsonKey,
  scopes: ["https://www.googleapis.com/auth/analytics.readonly"],
});

async function getSocialMediaIdByProvider(): Promise<string | null> {
  const record = await prisma.socialMedia.findFirst({
    where: { provider: Provider.GOOGLE_ANALYTICS },
    select: { id: true },
  });
  return record?.id || null;
}

// Initialize the Analytics Data API client
const analyticsDataClient = new BetaAnalyticsDataClient({ auth });
async function runReport(startDate: string, endDate: string) { //changed to accept date range
  console.log("Starting GA API request...");
  const [response] = await analyticsDataClient.runReport({
    property: "properties/393011442",
    dateRanges: [{ startDate, endDate }], //changed to not initialize with fixed dates
    dimensions: [{ name: "date" }], //changed to accept days for date range
    metrics: [
      { name: "activeUsers" },
      { name: "screenPageViews" },
      { name: "active7DayUsers" },
      { name: "engagementRate" },
      { name: "newUsers" },
    ],
  });

  console.log(`Report result: ${response.rows?.length ?? 0} rows`);
  console.log("Fetching socialMediaId...");

  const socialMediaId = await getSocialMediaIdByProvider();
  if (!socialMediaId) {
    console.error("No Google Analytics socialMediaId found.");
    return;
  }

  console.log(`socialMediaId = ${socialMediaId}`);

  const existingMetrics = await getMetricsBySocialMediaId(socialMediaId);
  console.log(`Found ${existingMetrics.length} existing metrics`);

  // track progress every few rows instead of each one
  let processed = 0;

  for (const row of response.rows ?? []) {
    const metricValues = row.metricValues ?? [];

    // GA "date" dimension comes back as 'YYYYMMDD'
    const dateStr = row.dimensionValues?.[0]?.value;
    let metricDate: Date;
    if (dateStr && dateStr.length === 8) {
      const year = Number(dateStr.slice(0, 4));
      const month = Number(dateStr.slice(4, 6)) - 1; // JS months are 0-based
      const day = Number(dateStr.slice(6, 8));
      metricDate = new Date(year, month, day);
    } else {
      // Fallback: use the startDate we requested
      metricDate = new Date(startDate);
    }

    const metricsToSave = [
      {
        metricName: Metric.ACTIVE_USERS,
        metricValue: Number(metricValues[0]?.value ?? 0),
      },
      {
        metricName: Metric.SCREEN_PAGE_VIEWS,
        metricValue: Number(metricValues[1]?.value ?? 0),
      },
      {
        metricName: Metric.ACTIVE_7_DAY_USERS,
        metricValue: Number(metricValues[2]?.value ?? 0),
      },
      {
        metricName: Metric.ENGAGEMENT_RATE,
        metricValue: Number(metricValues[3]?.value ?? 0),
      },
      {
        metricName: Metric.NEW_USERS,
        metricValue: Number(metricValues[4]?.value ?? 0),
      },
    ];

    // Log every 10 rows only
    if (processed % 10 === 0) console.log(`Processing row ${processed}`);

    for (const metric of metricsToSave) {
      // Optionally de-duplicate by metricName + metricDate (similar to per-day history)
      const existing = existingMetrics.find(
        (m) =>
          m.metricName === metric.metricName &&
          m.metricDate &&
          m.metricDate.getTime() === metricDate.getTime(),
      );

      try {
        if (existing) {
          console.log(`Updating ${metric.metricName}`);
          await updateSocialMediaMetric(existing.id, {
            metricName: metric.metricName,
            metricValue: metric.metricValue,
            lastSynced: new Date(),
            metricDate,
          });
        } else {
          console.log(`Creating ${metric.metricName}`);
          await createSocialMediaMetric({
            socialMediaId,
            metricName: metric.metricName,
            metricValue: metric.metricValue,
            lastSynced: new Date(),
            metricDate,
          });
        }
      } catch (err) {
        console.error(`Error saving ${metric.metricName}:`, err);
      }
    }

    processed++;
  }

  console.log("Finished processing metrics, closing Prisma...");
  await closePrisma();
  console.log("Prisma closed. Done.");
  process.exit(0);
}

async function main() {
  try {
    const args = process.argv.slice(2);

    if (args[0] === "backfill") {
      // Usage: npx tsx scripts/google-analytics.ts backfill 2025-09-21 2025-11-05
      const start = args[1];
      const end = args[2];

      if (!start || !end) {
        throw new Error(
          'Usage: npx tsx scripts/google-analytics.ts backfill YYYY-MM-DD YYYY-MM-DD',
        );
      }

      console.log(`🔄 Backfilling GA data from ${start} to ${end}...`);
      await runReport(start, end);
    } else {
      // Default: behave like "sync" – get today's data only
      const today = new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'
      console.log(`📅 Syncing GA data for ${today}...`);
      await runReport(today, today);
    }

    console.log("✅ GA script finished.");
  } catch (err) {
    console.error("❌ Error in GA script:", err);
    process.exitCode = 1;
  } finally {
    await closePrisma();
  }
}

// Only run main() when this file is executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  void main();
}