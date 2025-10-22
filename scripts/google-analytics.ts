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
import { Provider, Metric } from "../src/generated/prisma/index.js";
import { PrismaClient } from "../../generated/prisma";

const prisma = new PrismaClient();

console.log(Provider.GOOGLE_ANALYTICS);

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
    const [response] = await analyticsDataClient.runReport({
        property: 'properties/393011442',
        dateRanges: [{ startDate: '2020-03-31', endDate: 'today' }],
        dimensions: [{ name: 'city' }],
        metrics:    [{ name: 'activeUsers' }, 
                    { name: 'screenPageViews' }, 
                    { name: 'active7DayUsers' }, 
                    { name: 'engagementRate' }, 
                    { name: 'newUsers' }, ],
    });
    console.log('Report result:');
    response.rows?.forEach((row: any) => {
        console.log(row.dimensionValues[0].value, row.metricValues[0].value);
    });

    const socialMediaId = await getSocialMediaIdByProvider();
    if (!socialMediaId) {
        console.error("No Google Analytics socialMediaId found.");
        return;
    }

    for (const row of response.rows ?? []) {
    const city = row.dimensionValues?.[0]?.value ?? "Unknown";

    // Ensure metricValues is defined, fallback to zeros
    const metricValues = row.metricValues ?? [];
    const activeUsers = Number(metricValues[0]?.value ?? 0);
    const screenPageViews = Number(metricValues[1]?.value ?? 0);
    const active7DayUsers = Number(metricValues[2]?.value ?? 0);
    const engagementRate = Number(metricValues[3]?.value ?? 0);
    const newUsers = Number(metricValues[4]?.value ?? 0);

    console.log('Active Users:', activeUsers);


    // prepare metrics
    const metricsToSave = [
        { metricName: Metric.ACTIVE_USERS, metricValue: activeUsers },
        { metricName: Metric.SCREEN_PAGE_VIEWS, metricValue: screenPageViews },
        { metricName: Metric.ACTIVE_7_DAY_USERS, metricValue: active7DayUsers },
        { metricName: Metric.ENGAGEMENT_RATE, metricValue: engagementRate },
        { metricName: Metric.NEW_USERS, metricValue: newUsers },
    ];


    const existingMetrics = await getMetricsBySocialMediaId(socialMediaId);

    // save metrics using provided functions
    for (const metric of metricsToSave) {
      // check if metric already exists for this socialMediaId

      const existingMetric = existingMetrics.find(
      (m) => m.metricName === metric.metricName
      );

      if (existingMetric) {
        await updateSocialMediaMetric(existingMetric.id, {
          metricName: metric.metricName,
          metricValue: metric.metricValue, 
          lastSynced: new Date()
        });

        console.log("existing metric name is ", metric.metricName);

      }
      else {
        await createSocialMediaMetric(
        {
            socialMediaId,   
            metricName: metric.metricName,
            metricValue: metric.metricValue,
            lastSynced: new Date(),
      
        });
        console.log("metric name is ", metric.metricName);

      }

    console.log(`Metrics stored for city: ${city}`);
    }

  console.log("All metrics processed.");
  await closePrisma();
  }
}

runReport().catch(console.error);



// METRICS WE'RE USING: activeUsers, screenPageViews, active7DayUsers, engagementRate, newUsers