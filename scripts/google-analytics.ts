//google-analytics.ts
import fs from 'fs';
import { BetaAnalyticsDataClient } from '@google-analytics/data';
import 'dotenv/config';
import { GoogleAuth } from 'google-auth-library';
import {
  createSocialMediaMetric,
  updateSocialMediaMetric,
  getMetricsBySocialMediaId,
  closePrisma,
} from "../db/social-media-metrics"
import { PrismaClient, Provider, Metric } from "../src/generated/prisma";

const prisma = new PrismaClient();

// Load service account key
const jsonKey = JSON.parse(fs.readFileSync('service-account.json', 'utf8'));

// Create a GoogleAuth instance using the credentials
const auth = new GoogleAuth({
  credentials: jsonKey,
  scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
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
async function runReport() {
  console.log("Starting GA API request...");
  const [response] = await analyticsDataClient.runReport({
    property: "properties/393011442",
    dateRanges: [{ startDate: "yesterday", endDate: "today" }],
    dimensions: [{ name: "yearMonth" }],
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

    const metricsToSave = [
      { metricName: Metric.ACTIVE_USERS, metricValue: Number(metricValues[0]?.value ?? 0) },
      { metricName: Metric.SCREEN_PAGE_VIEWS, metricValue: Number(metricValues[1]?.value ?? 0) },
      { metricName: Metric.ACTIVE_7_DAY_USERS, metricValue: Number(metricValues[2]?.value ?? 0) },
      { metricName: Metric.ENGAGEMENT_RATE, metricValue: Number(metricValues[3]?.value ?? 0) },
      { metricName: Metric.NEW_USERS, metricValue: Number(metricValues[4]?.value ?? 0) },
    ];

    // Log every 10 rows only
    if (processed % 10 === 0) console.log(`Processing row ${processed}`);

    for (const metric of metricsToSave) {
      const existing = existingMetrics.find((m) => m.metricName === metric.metricName);

      try {
        if (existing) {
          console.log(`Updating ${metric.metricName}`);
          await updateSocialMediaMetric(existing.id, {
            metricName: metric.metricName,
            metricValue: metric.metricValue,
            lastSynced: new Date(),
          });
        } else {
          console.log(`Creating ${metric.metricName}`);
          await createSocialMediaMetric({
            socialMediaId,
            metricName: metric.metricName,
            metricValue: metric.metricValue,
            lastSynced: new Date(),
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

runReport()