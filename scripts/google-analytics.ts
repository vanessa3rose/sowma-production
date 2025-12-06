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

/**
 * Helper: breakdown for New vs Returning (pie chart)
 * Stores TOTAL_SESSIONS segmented by new/returning via breakdownKey/breakdownValue.
 */
async function syncNewVsReturningBreakdown(
  targetDate: string,
  socialMediaId: string,
  existingMetrics: any[],
) {
  console.log(`Starting newVsReturning breakdown for ${targetDate}...`);

  const [response] = await analyticsDataClient.runReport({
    property: "properties/393011442",
    dateRanges: [{ startDate: targetDate, endDate: targetDate }],
    dimensions: [{ name: "newVsReturning" }],
    metrics: [{ name: "sessions" }],
  });

  if (!response.rows || response.rows.length === 0) {
    console.error(
      `⚠️ GA newVsReturning breakdown returned 0 rows for ${targetDate}. ` +
        `No breakdown metrics will be stored for this date.`,
    );
    return;
  }

  const metricDate = new Date(targetDate);

  for (const row of response.rows ?? []) {
    const label = row.dimensionValues?.[0]?.value ?? "unknown"; // "new" | "returning"
    const sessions = Number(row.metricValues?.[0]?.value ?? 0);

    const existing = existingMetrics.find(
      (m) =>
        m.metricName === Metric.TOTAL_SESSIONS &&
        m.metricDate &&
        m.metricDate.getTime() === metricDate.getTime() &&
        m.breakdownKey === "newVsReturning" &&
        m.breakdownValue === label,
    );

    try {
      if (existing) {
        console.warn(
          `ℹ️ TOTAL_SESSIONS (${label}) for ${metricDate
            .toISOString()
            .slice(
              0,
              10,
            )} already exists (id=${existing.id}). Updating existing row instead of creating a new one.`,
        );
        await updateSocialMediaMetric(existing.id, {
          metricName: Metric.TOTAL_SESSIONS,
          metricValue: sessions,
          lastSynced: new Date(),
          metricDate,
          breakdownKey: "newVsReturning",
          breakdownValue: label,
        });
      } else {
        console.log(
          `Creating TOTAL_SESSIONS (${label}) for ${metricDate
            .toISOString()
            .slice(0, 10)}`,
        );
        await createSocialMediaMetric({
          socialMediaId,
          metricName: Metric.TOTAL_SESSIONS,
          metricValue: sessions,
          lastSynced: new Date(),
          metricDate,
          breakdownKey: "newVsReturning",
          breakdownValue: label,
        });
      }
    } catch (err) {
      console.error(`Error saving TOTAL_SESSIONS (${label}):`, err);
    }
  }
}

/**
 * Helper: breakdown for Sessions by Source (bar chart)
 * Stores SESSIONS_BY_SOURCE with breakdownKey="sessionSource".
 */
async function syncSessionsBySourceBreakdown(
  targetDate: string,
  socialMediaId: string,
  existingMetrics: any[],
) {
  console.log(`Starting sessionsBySource breakdown for ${targetDate}...`);

  const [response] = await analyticsDataClient.runReport({
    property: "properties/393011442",
    dateRanges: [{ startDate: targetDate, endDate: targetDate }],
    dimensions: [{ name: "sessionSource" }],
    metrics: [{ name: "sessions" }],
  });

  if (!response.rows || response.rows.length === 0) {
    console.error(
      `⚠️ GA sessionsBySource breakdown returned 0 rows for ${targetDate}. ` +
        `No source breakdown metrics will be stored for this date.`,
    );
    return;
  }

  const metricDate = new Date(targetDate);

  for (const row of response.rows ?? []) {
    const source = row.dimensionValues?.[0]?.value ?? "unknown";
    const sessions = Number(row.metricValues?.[0]?.value ?? 0);

    const existing = existingMetrics.find(
      (m) =>
        m.metricName === Metric.SESSIONS_BY_SOURCE &&
        m.metricDate &&
        m.metricDate.getTime() === metricDate.getTime() &&
        m.breakdownKey === "sessionSource" &&
        m.breakdownValue === source,
    );

    try {
      if (existing) {
        console.warn(
          `ℹ️ SESSIONS_BY_SOURCE (${source}) for ${metricDate
            .toISOString()
            .slice(
              0,
              10,
            )} already exists (id=${existing.id}). Updating existing row instead of creating a new one.`,
        );
        await updateSocialMediaMetric(existing.id, {
          metricName: Metric.SESSIONS_BY_SOURCE,
          metricValue: sessions,
          lastSynced: new Date(),
          metricDate,
          breakdownKey: "sessionSource",
          breakdownValue: source,
        });
      } else {
        console.log(
          `Creating SESSIONS_BY_SOURCE (${source}) for ${metricDate
            .toISOString()
            .slice(0, 10)}`,
        );
        await createSocialMediaMetric({
          socialMediaId,
          metricName: Metric.SESSIONS_BY_SOURCE,
          metricValue: sessions,
          lastSynced: new Date(),
          metricDate,
          breakdownKey: "sessionSource",
          breakdownValue: source,
        });
      }
    } catch (err) {
      console.error(`Error saving SESSIONS_BY_SOURCE (${source}):`, err);
    }
  }
}

/**
 * Run a GA report for a **single day** and persist metrics with metricDate.
 * This mirrors the backfill script’s logic but only for one date.
 */
async function runDailyReport(targetDate: string) {
  console.log(`Starting GA API request for ${targetDate}...`);

  const [response] = await analyticsDataClient.runReport({
    property: "properties/393011442",
    dateRanges: [{ startDate: targetDate, endDate: targetDate }],
    dimensions: [{ name: "date" }], // per-day
    metrics: [
      { name: "activeUsers" }, // 0
      { name: "screenPageViews" }, // 1
      { name: "engagementRate" }, // 3
      { name: "newUsers" }, // 4
      { name: "bounceRate" }, // 5
      { name: "averageSessionDuration" }, // 6
      { name: "sessions" }, // 7
      { name: "engagedSessions" }, // 8
      { name: "screenPageViewsPerSession" }, // 9
      { name: "userEngagementDuration" }, // 10
    ],
  });

  const rowCount = response.rows?.length ?? 0;
  console.log(`Report result: ${rowCount} rows`);

  if (!response.rows || response.rows.length === 0) {
    console.error(
      `❌ GA API returned 0 rows for ${targetDate}. ` +
        `This usually means no data for that date or a query mismatch. ` +
        `Skipping metric save for this date.`,
    );
    return;
  }

  console.log("Fetching socialMediaId...");

  const socialMediaId = await getSocialMediaIdByProvider();
  if (!socialMediaId) {
    console.error("❌ No Google Analytics socialMediaId found. Aborting sync.");
    return;
  }

  console.log(`socialMediaId = ${socialMediaId}`);

  const existingMetrics = await getMetricsBySocialMediaId(socialMediaId);
  console.log(`Found ${existingMetrics.length} existing metrics`);

  let processed = 0;

  for (const row of response.rows ?? []) {
    const metricValues = row.metricValues ?? [];

    // GA "date" dimension comes back as 'YYYYMMDD'
    const dateStr = row.dimensionValues?.[0]?.value;
    let metricDate: Date;
    if (dateStr && dateStr.length === 8) {
      const year = Number(dateStr.slice(0, 4));
      const month = Number(dateStr.slice(4, 6)) - 1; // JS months 0-based
      const day = Number(dateStr.slice(6, 8));
      metricDate = new Date(year, month, day);
    } else {
      // Fallback: use the targetDate we requested
      metricDate = new Date(targetDate);
      console.warn(
        `⚠️ Unexpected date format from GA for ${targetDate}. ` +
          `Using requested targetDate as metricDate.`,
      );
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
        metricName: Metric.ENGAGEMENT_RATE,
        metricValue: Number(metricValues[3]?.value ?? 0),
      },
      {
        metricName: Metric.NEW_USERS,
        metricValue: Number(metricValues[4]?.value ?? 0),
      },
      {
        metricName: Metric.BOUNCE_RATE,
        metricValue: Number(metricValues[5]?.value ?? 0),
      },
      {
        metricName: Metric.AVG_SESSION_DURATION,
        metricValue: Number(metricValues[6]?.value ?? 0),
      },
      {
        metricName: Metric.TOTAL_SESSIONS,
        metricValue: Number(metricValues[7]?.value ?? 0),
      },
      {
        metricName: Metric.ENGAGED_SESSIONS,
        metricValue: Number(metricValues[8]?.value ?? 0),
      },
      {
        metricName: Metric.PAGES_PER_SESSION,
        metricValue: Number(metricValues[9]?.value ?? 0),
      },
      {
        metricName: Metric.ENGAGEMENT_TIME,
        metricValue: Number(metricValues[10]?.value ?? 0),
      },
    ];

    if (processed % 10 === 0) {
      console.log(`Processing row ${processed} for ${targetDate}`);
    }

    for (const metric of metricsToSave) {
      // De-dupe by metricName + metricDate (same idea as backfill)
      const existing = existingMetrics.find(
        (m) =>
          m.metricName === metric.metricName &&
          m.metricDate &&
          // compare by day; to be safe, compare time value
          m.metricDate.getTime() === metricDate.getTime() &&
          (m.breakdownKey == null || m.breakdownKey === "") && // only the aggregate rows
          (m.breakdownValue == null || m.breakdownValue === ""),
      );

      try {
        if (existing) {
          console.warn(
            `ℹ️ Metric ${metric.metricName} for ${metricDate
              .toISOString()
              .slice(
                0,
                10,
              )} already exists (id=${existing.id}). Updating existing row instead of creating a new one.`,
          );
          await updateSocialMediaMetric(existing.id, {
            metricName: metric.metricName,
            metricValue: metric.metricValue,
            lastSynced: new Date(),
            metricDate,
          });
        } else {
          console.log(
            `Creating ${metric.metricName} for ${metricDate
              .toISOString()
              .slice(0, 10)}`,
          );
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

  // After aggregate metrics, sync breakdown metrics used for charts
  await syncNewVsReturningBreakdown(targetDate, socialMediaId, existingMetrics);
  await syncSessionsBySourceBreakdown(
    targetDate,
    socialMediaId,
    existingMetrics,
  );

  console.log(`Finished processing GA metrics for ${targetDate}`);
}

async function main() {
  try {
    const args = process.argv.slice(2);

    // If a date arg is passed, use it; otherwise default to today
    const target = args[0] ?? new Date().toISOString().slice(0, 10);

    // Here we ONLY do single-day sync.
    // For real backfill ranges, keep using your separate backfill script.
    console.log(`📅 Syncing GA data for ${target}...`);
    await runDailyReport(target);

    console.log("✅ GA daily script finished.");
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
