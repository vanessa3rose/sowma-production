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
import {
  toMassachusettsCountyFips,
  toMassachusettsCountyFipsFromCity,
} from "../../src/utils/massachusettsCounties.js";

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

function isoDateDaysBefore(date: Date, days: number): string {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() - days);
  return formatISODate(d);
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

  const response = await runGAReport(
    {
      property: "properties/393011442",
      dateRanges: [{ startDate: dateStr, endDate: dateStr }],
      dimensions: [{ name: "newVsReturning" }],
      metrics: [{ name: "sessions" }],
    },
    "newVsReturning report",
  );

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

  const response = await runGAReport(
    {
      property: "properties/393011442",
      dateRanges: [{ startDate: dateStr, endDate: dateStr }],
      dimensions: [{ name: "sessionSource" }],
      metrics: [{ name: "sessions" }],
    },
    "sessionSource report",
  );

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

async function syncSessionsByDeviceCategoryBreakdown(
  metricDate: Date,
  socialMediaId: string,
  existingMetrics: any[],
) {
  const dateStr = formatISODate(metricDate);

  const response = await runGAReport(
    {
      property: "properties/393011442",
      dateRanges: [{ startDate: dateStr, endDate: dateStr }],
      dimensions: [{ name: "deviceCategory" }],
      metrics: [{ name: "sessions" }],
    },
    "deviceCategory report",
  );

  if (!response.rows || response.rows.length === 0) {
    console.error(
      `[GA] deviceCategory breakdown returned no rows for ${dateStr}`,
    );
    return;
  }

  for (const row of response.rows) {
    const category = row.dimensionValues?.[0]?.value ?? "unknown";
    const sessions = Number(row.metricValues?.[0]?.value ?? 0);

    const existing = existingMetrics.find(
      (m) =>
        m.metricName === Metric.TOTAL_SESSIONS &&
        m.metricDate?.getTime() === metricDate.getTime() &&
        m.breakdownKey === "deviceCategory" &&
        m.breakdownValue === category,
    );

    try {
      if (existing) {
        await updateSocialMediaMetric(existing.id, {
          metricName: Metric.TOTAL_SESSIONS,
          metricValue: sessions,
          metricDate,
          breakdownKey: "deviceCategory",
          breakdownValue: category,
          lastSynced: new Date(),
        });
      } else {
        await createSocialMediaMetric({
          socialMediaId,
          metricName: Metric.TOTAL_SESSIONS,
          metricValue: sessions,
          metricDate,
          breakdownKey: "deviceCategory",
          breakdownValue: category,
          lastSynced: new Date(),
        });
      }
    } catch (err) {
      console.error(
        `[GA] Failed saving TOTAL_SESSIONS (deviceCategory=${category}) for ${dateStr}`,
        err,
      );
    }
  }
}

async function upsertCountySessions(
  metricDate: Date,
  socialMediaId: string,
  existingMetrics: any[],
  countySessions: Map<string, number>,
) {
  for (const [countyFips, sessions] of countySessions.entries()) {
    const existing = existingMetrics.find(
      (m) =>
        m.metricName === Metric.TOTAL_SESSIONS &&
        m.metricDate?.getTime() === metricDate.getTime() &&
        m.breakdownKey === "county" &&
        m.breakdownValue === countyFips,
    );

    if (existing) {
      await updateSocialMediaMetric(existing.id, {
        metricName: Metric.TOTAL_SESSIONS,
        metricValue: sessions,
        metricDate,
        breakdownKey: "county",
        breakdownValue: countyFips,
        lastSynced: new Date(),
      });
    } else {
      await createSocialMediaMetric({
        socialMediaId,
        metricName: Metric.TOTAL_SESSIONS,
        metricValue: sessions,
        metricDate,
        breakdownKey: "county",
        breakdownValue: countyFips,
        lastSynced: new Date(),
      });
    }
  }
}

/**
 * Helper: county breakdown via GA custom dimension `customEvent:county`.
 * If the property does not define this custom dimension, this function no-ops.
 */
async function syncSessionsByCountyBreakdown(
  metricDate: Date,
  socialMediaId: string,
  existingMetrics: any[],
): Promise<number> {
  const dateStr = formatISODate(metricDate);

  try {
    const response = await runGAReport(
      {
        property: "properties/393011442",
        dateRanges: [{ startDate: dateStr, endDate: dateStr }],
        dimensions: [{ name: "customEvent:county" }],
        metrics: [{ name: "sessions" }],
      },
      "custom county report",
    );

    if (!response.rows || response.rows.length === 0) return 0;

    const countySessions = new Map<string, number>();

    for (const row of response.rows) {
      const rawCounty = row.dimensionValues?.[0]?.value ?? "";
      const countyFips = toMassachusettsCountyFips(rawCounty);
      if (!countyFips) continue;

      const sessions = Number(row.metricValues?.[0]?.value ?? 0);
      countySessions.set(
        countyFips,
        (countySessions.get(countyFips) ?? 0) + sessions,
      );
    }

    if (countySessions.size === 0) return 0;
    await upsertCountySessions(
      metricDate,
      socialMediaId,
      existingMetrics,
      countySessions,
    );
    return countySessions.size;
  } catch (err) {
    console.warn(
      `[GA] county custom dimension not available for ${dateStr}; skipping county sync.`,
    );
    if (process.env.DEBUG_METRICS === "1") {
      console.warn(err);
    }
    return 0;
  }
}

async function syncSessionsByCityFallback(
  metricDate: Date,
  socialMediaId: string,
  existingMetrics: any[],
): Promise<number> {
  const dateStr = formatISODate(metricDate);
  let response;
  try {
    response = await runGAReport(
      {
        property: "properties/393011442",
        dateRanges: [{ startDate: dateStr, endDate: dateStr }],
        dimensions: [{ name: "country" }, { name: "region" }, { name: "city" }],
        metrics: [{ name: "sessions" }],
      },
      "city fallback report",
    );
  } catch (err) {
    console.warn(`[GA] city fallback report failed for ${dateStr}; skipping.`);
    if (process.env.DEBUG_METRICS === "1") {
      console.warn(err);
    }
    return 0;
  }

  if (!response.rows || response.rows.length === 0) return 0;

  const countySessions = new Map<string, number>();
  for (const row of response.rows) {
    const country = row.dimensionValues?.[0]?.value ?? "";
    const region = row.dimensionValues?.[1]?.value ?? "";
    const city = row.dimensionValues?.[2]?.value ?? "";
    if (country !== "United States" || region !== "Massachusetts") continue;

    const countyFips = toMassachusettsCountyFipsFromCity(city);
    if (!countyFips) continue;

    const sessions = Number(row.metricValues?.[0]?.value ?? 0);
    countySessions.set(
      countyFips,
      (countySessions.get(countyFips) ?? 0) + sessions,
    );
  }

  if (countySessions.size === 0) return 0;
  await upsertCountySessions(
    metricDate,
    socialMediaId,
    existingMetrics,
    countySessions,
  );
  return countySessions.size;
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

    const response = await runGAReport(
      {
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
      },
      "daily core metrics report",
    );
    const active7WindowStart = isoDateDaysBefore(metricDate, 6);
    const active7Response = await runGAReport(
      {
        property: "properties/393011442",
        dateRanges: [{ startDate: active7WindowStart, endDate: dateStr }],
        metrics: [{ name: "activeUsers" }],
      },
      "daily rolling-7d active users report",
    );

    if (!response.rows || response.rows.length === 0) {
      console.error(`[GA] no rows returned for ${dateStr}`);
      return;
    }

    const values = response.rows[0].metricValues ?? [];
    const active7Values =
      active7Response.rows?.[0]?.metricValues ??
      active7Response.totals?.[0]?.metricValues ??
      [];

    const metricsToSave = [
      {
        metricName: Metric.ACTIVE_USERS,
        metricValue: Number(values[0]?.value ?? 0),
      },
      {
        metricName: Metric.ACTIVE_7_DAY_USERS,
        metricValue: Number(active7Values[0]?.value ?? 0),
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
    await syncSessionsByDeviceCategoryBreakdown(
      metricDate,
      socialMediaId,
      existingMetrics,
    );
    const countyRows = await syncSessionsByCountyBreakdown(
      metricDate,
      socialMediaId,
      existingMetrics,
    );
    if (countyRows === 0) {
      const fallbackRows = await syncSessionsByCityFallback(
        metricDate,
        socialMediaId,
        existingMetrics,
      );
      if (fallbackRows > 0) {
        console.log(
          `[GA] County fallback from city mapping wrote ${fallbackRows} rows for ${dateStr}`,
        );
      }
    }

    console.log(`[GA] Daily Google Analytics sync complete (${dateStr})`);
  } catch (err) {
    console.error(`[GA] Daily sync failed for ${dateStr}`, err);
    throw err;
  } finally {
    await prisma.$disconnect();
  }
}

/* -------------------------------------------------
   Entrypoint
-------------------------------------------------- */
runDailyGoogleAnalyticsSync().catch(console.error);
