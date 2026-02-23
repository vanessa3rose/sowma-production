import "dotenv/config";
import { BetaAnalyticsDataClient } from "@google-analytics/data";
import { GoogleAuth } from "google-auth-library";
import {
  createSocialMediaMetric,
  updateSocialMediaMetric,
  getMetricsBySocialMediaId,
} from "../../db/social-media-metrics.js";
import { startOfDay, endOfDay } from "../../src/utils/dates.js";
import {
  PrismaClient,
  Provider,
  Metric,
} from "../../src/generated/prisma/index.js";
import {
  toMassachusettsCountyFips,
  toMassachusettsCountyFipsFromCity,
} from "../../src/utils/massachusettsCounties.js";

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

const RETRYABLE_GA_CODES = new Set([4, 14]);

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runGAReport(
  request: Parameters<typeof analyticsDataClient.runReport>[0],
  label: string,
  maxAttempts = 3,
) {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const [response] = await analyticsDataClient.runReport(request, {
        timeout: 60_000,
      });
      return response;
    } catch (error: unknown) {
      lastError = error;
      const code =
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        typeof (error as { code?: unknown }).code === "number"
          ? (error as { code: number }).code
          : undefined;

      const retryable = code != null && RETRYABLE_GA_CODES.has(code);
      if (!retryable || attempt === maxAttempts) {
        break;
      }

      const backoffMs = 1000 * 2 ** (attempt - 1);
      console.warn(
        `[GA] ${label} timed out/unavailable (attempt ${attempt}/${maxAttempts}), retrying in ${backoffMs}ms`,
      );
      await sleep(backoffMs);
    }
  }

  throw lastError;
}

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

  const response = await runGAReport(
    {
      property: "properties/393011442",
      dateRanges: [{ startDate: isoDate, endDate: isoDate }],
      dimensions: [{ name: "date" }],
      metrics: [
        { name: "activeUsers" },
        { name: "active7DayUsers" },
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
    },
    "backfill core metrics report",
  );

  if (!response.rows || response.rows.length === 0) {
    console.warn(`[GA] No rows returned for ${isoDate}`);
    return;
  }

  const socialMediaIdMaybe = await getSocialMediaId();
  if (!socialMediaIdMaybe) return;

  const socialMediaId: string = socialMediaIdMaybe;

  const existingMetrics = await getMetricsBySocialMediaId(socialMediaId);

  const values = response.rows[0].metricValues ?? [];
  const metricsToSave = [
    {
      metricName: Metric.ACTIVE_USERS,
      metricValue: Number(values[0]?.value ?? 0),
    },
    {
      metricName: Metric.ACTIVE_7_DAY_USERS,
      metricValue: Number(values[1]?.value ?? 0),
    },
    {
      metricName: Metric.SCREEN_PAGE_VIEWS,
      metricValue: Number(values[2]?.value ?? 0),
    },
    {
      metricName: Metric.ENGAGEMENT_RATE,
      metricValue: Number(values[3]?.value ?? 0) * 100,
    },
    {
      metricName: Metric.NEW_USERS,
      metricValue: Number(values[4]?.value ?? 0),
    },
    {
      metricName: Metric.BOUNCE_RATE,
      metricValue: Number(values[5]?.value ?? 0) * 100,
    },
    {
      metricName: Metric.AVG_SESSION_DURATION,
      metricValue: Number(values[6]?.value ?? 0),
    },
    {
      metricName: Metric.TOTAL_SESSIONS,
      metricValue: Number(values[7]?.value ?? 0),
    },
    {
      metricName: Metric.ENGAGED_SESSIONS,
      metricValue: Number(values[8]?.value ?? 0),
    },
    {
      metricName: Metric.PAGES_PER_SESSION,
      metricValue: Number(values[9]?.value ?? 0),
    },
    {
      metricName: Metric.ENGAGEMENT_TIME,
      metricValue: Number(values[10]?.value ?? 0),
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

  async function upsertBreakdownMetric(
    metricName: Metric,
    breakdownKey: string,
    breakdownValue: string,
    metricValue: number,
  ) {
    const existing = existingMetrics.find(
      (m: any) =>
        m.metricName === metricName &&
        m.metricDate?.getTime() === date.getTime() &&
        m.breakdownKey === breakdownKey &&
        m.breakdownValue === breakdownValue,
    );

    if (existing) {
      await updateSocialMediaMetric(existing.id, {
        metricName,
        metricValue,
        metricDate: date,
        breakdownKey,
        breakdownValue,
        lastSynced: new Date(),
      });
      return;
    }

    await createSocialMediaMetric({
      socialMediaId,
      metricName,
      metricValue,
      metricDate: date,
      breakdownKey,
      breakdownValue,
      lastSynced: new Date(),
    });
  }

  try {
    const sourceResponse = await runGAReport(
      {
        property: "properties/393011442",
        dateRanges: [{ startDate: isoDate, endDate: isoDate }],
        dimensions: [{ name: "sessionSource" }],
        metrics: [{ name: "sessions" }],
      },
      "backfill sessionSource report",
    );

    for (const row of sourceResponse.rows ?? []) {
      const source = row.dimensionValues?.[0]?.value ?? "unknown";
      const sessions = Number(row.metricValues?.[0]?.value ?? 0);
      await upsertBreakdownMetric(
        Metric.SESSIONS_BY_SOURCE,
        "sessionSource",
        source,
        sessions,
      );
    }
  } catch {
    // Keep core backfill running even if this breakdown is unavailable.
  }

  try {
    const deviceResponse = await runGAReport(
      {
        property: "properties/393011442",
        dateRanges: [{ startDate: isoDate, endDate: isoDate }],
        dimensions: [{ name: "deviceCategory" }],
        metrics: [{ name: "sessions" }],
      },
      "backfill deviceCategory report",
    );

    for (const row of deviceResponse.rows ?? []) {
      const category = row.dimensionValues?.[0]?.value ?? "unknown";
      const sessions = Number(row.metricValues?.[0]?.value ?? 0);
      await upsertBreakdownMetric(
        Metric.TOTAL_SESSIONS,
        "deviceCategory",
        category,
        sessions,
      );
    }
  } catch {
    // Keep core backfill running even if this breakdown is unavailable.
  }

  async function upsertCountySessions(countySessions: Map<string, number>) {
    for (const [countyFips, sessions] of countySessions.entries()) {
      const existing = existingMetrics.find(
        (m: any) =>
          m.metricName === Metric.TOTAL_SESSIONS &&
          m.metricDate?.getTime() === date.getTime() &&
          m.breakdownKey === "county" &&
          m.breakdownValue === countyFips,
      );

      if (existing) {
        await updateSocialMediaMetric(existing.id, {
          metricName: Metric.TOTAL_SESSIONS,
          metricValue: sessions,
          metricDate: date,
          breakdownKey: "county",
          breakdownValue: countyFips,
          lastSynced: new Date(),
        });
      } else {
        await createSocialMediaMetric({
          socialMediaId,
          metricName: Metric.TOTAL_SESSIONS,
          metricValue: sessions,
          metricDate: date,
          breakdownKey: "county",
          breakdownValue: countyFips,
          lastSynced: new Date(),
        });
      }
    }
  }

  let countyRowsWritten = 0;
  try {
    const isoDate = date.toISOString().slice(0, 10);
    const countyResponse = await runGAReport(
      {
        property: "properties/393011442",
        dateRanges: [{ startDate: isoDate, endDate: isoDate }],
        dimensions: [{ name: "customEvent:county" }],
        metrics: [{ name: "sessions" }],
      },
      "backfill custom county report",
    );

    const countySessions = new Map<string, number>();
    for (const row of countyResponse.rows ?? []) {
      const rawCounty = row.dimensionValues?.[0]?.value ?? "";
      const countyFips = toMassachusettsCountyFips(rawCounty);
      if (!countyFips) continue;

      const sessions = Number(row.metricValues?.[0]?.value ?? 0);
      countySessions.set(countyFips, (countySessions.get(countyFips) ?? 0) + sessions);
    }

    if (countySessions.size > 0) {
      await upsertCountySessions(countySessions);
      countyRowsWritten = countySessions.size;
    }
  } catch {
    // Custom county dimension may not exist in GA property yet.
  }

  if (countyRowsWritten === 0) {
    let cityResponse;
    try {
      cityResponse = await runGAReport(
        {
          property: "properties/393011442",
          dateRanges: [{ startDate: isoDate, endDate: isoDate }],
          dimensions: [{ name: "country" }, { name: "region" }, { name: "city" }],
          metrics: [{ name: "sessions" }],
        },
        "backfill city fallback report",
      );
    } catch (err) {
      console.warn(`[GA] city fallback report failed for ${isoDate}; skipping.`);
      if (process.env.DEBUG_METRICS === "1") {
        console.warn(err);
      }
      cityResponse = { rows: [] };
    }

    const countySessions = new Map<string, number>();
    for (const row of cityResponse.rows ?? []) {
      const country = row.dimensionValues?.[0]?.value ?? "";
      const region = row.dimensionValues?.[1]?.value ?? "";
      const city = row.dimensionValues?.[2]?.value ?? "";
      if (country !== "United States" || region !== "Massachusetts") continue;

      const countyFips = toMassachusettsCountyFipsFromCity(city);
      if (!countyFips) continue;

      const sessions = Number(row.metricValues?.[0]?.value ?? 0);
      countySessions.set(countyFips, (countySessions.get(countyFips) ?? 0) + sessions);
    }

    if (countySessions.size > 0) {
      await upsertCountySessions(countySessions);
      countyRowsWritten = countySessions.size;
      console.log(`[GA] County fallback from city mapping wrote ${countyRowsWritten} rows for ${isoDate}`);
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
