import { fileURLToPath } from "node:url";
import {
  PrismaClient,
  Metric,
  Provider,
} from "../../src/generated/prisma/index.js";
import "dotenv/config";
import fetch from "node-fetch";
import { startOfDay, formatISODate } from "../../src/utils/dates.js";

/* -------------------------------------------------
   Constants
-------------------------------------------------- */
const REQUIRED_CC_METRICS: Metric[] = [
  Metric.EMAILS_SENT,
  Metric.EMAILS_DELIVERED,
  Metric.EMAIL_OPENED,
  Metric.EMAILS_CLICKED,
  Metric.EMAILS_UNSUBSCRIBED,
  Metric.EMAIL_BOUNCED,
  Metric.EMAIL_FORWARDED,
  Metric.EMAIL_NOT_OPENED,
  Metric.EMAIL_ABUSE,
  Metric.EMAIL_UNIQUE_OPENS,
  Metric.EMAIL_UNIQUE_CLICKS,
  Metric.EMAIL_TOTAL_OPENS,
  Metric.EMAIL_TOTAL_CLICKS,
];

/* -------------------------------------------------
   Prisma Client
-------------------------------------------------- */
const prisma = new PrismaClient();

/* -------------------------------------------------
   Constant Contact API types
-------------------------------------------------- */
type CampaignSummary = {
  campaign_id: string;
  campaign_type: string;
  last_sent_date: string;
  unique_counts: {
    sends: number;
    opens: number;
    clicks: number;
    forwards: number;
    optouts: number;
    abuse: number;
    bounces: number;
    not_opened: number;
    [key: string]: number; // allow additional fields returned by API
  };
};

type SummaryResponse = {
  bulk_email_campaign_summaries: CampaignSummary[];
  _links?: { next?: { href: string } };
};

type CampaignDetailsResponse = {
  campaign_id: string;
  campaign_activities?: Array<{
    campaign_activity_id: string;
    role: string;
    current_status?: string;
  }>;
};

type ActivityReport = {
  campaign_id: string;
  campaign_activity_id: string;
  tracking_counts?: {
    opens?: number;
    clicks?: number;
  };
};

/* -------------------------------------------------
   Helpers
-------------------------------------------------- */
async function allMetricsStoredForDay(
  socialMediaId: string,
  date: Date,
): Promise<boolean> {
  const metricsForDay = await prisma.socialMediaMetrics.findMany({
    where: {
      socialMediaId,
      metricDate: {
        gte: startOfDay(date),
        lt: new Date(startOfDay(date).getTime() + 86400000),
      },
      breakdownKey: null,
      breakdownValue: null,
    },
    select: { metricName: true },
  });

  const existingMetricNames = new Set(
    metricsForDay.map((m: any) => m.metricName),
  );

  return REQUIRED_CC_METRICS.every((metric) => existingMetricNames.has(metric));
}

async function getConstantContactAccountOrThrow() {
  const count = await prisma.socialMedia.count({
    where: { provider: Provider.CONSTANT_CONTACT },
  });

  if (count !== 1) {
    throw new Error(
      `[CC] Expected exactly 1 Constant Contact account, found ${count}. ` +
        `Run scripts/social-media-setup.ts and ensure only one Provider.CONSTANT_CONTACT row exists.`,
    );
  }

  const account = await prisma.socialMedia.findFirst({
    where: { provider: Provider.CONSTANT_CONTACT },
    include: { SocialMediaAuth: true },
  });

  if (!account) {
    throw new Error(
      "[CC] No Constant Contact account found in SocialMedia. Run scripts/social-media-setup.ts.",
    );
  }

  return account;
}

/* -------------------------------------------------
   Token refresh (reuses existing CC OAuth logic)
-------------------------------------------------- */
// Token refresh is centralized in scripts/token-refresh.ts

/* -------------------------------------------------
   API helpers
-------------------------------------------------- */
function isSameDay(dateStr: string, target: Date): boolean {
  const d = new Date(dateStr);
  return (
    d.getUTCFullYear() === target.getUTCFullYear() &&
    d.getUTCMonth() === target.getUTCMonth() &&
    d.getUTCDate() === target.getUTCDate()
  );
}

async function fetchCampaignDetails(
  accessToken: string,
  campaignId: string,
): Promise<CampaignDetailsResponse> {
  const res = await fetch(`https://api.cc.email/v3/emails/${campaignId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    throw new Error(`[CC] campaign details failed: ${res.status} ${await res.text()}`);
  }
  return (await res.json()) as CampaignDetailsResponse;
}

async function fetchActivityReport(
  accessToken: string,
  activityId: string,
): Promise<ActivityReport> {
  const res = await fetch(
    `https://api.cc.email/v3/reports/email_reports/${activityId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    },
  );
  if (!res.ok) {
    throw new Error(`[CC] activity report failed: ${res.status} ${await res.text()}`);
  }
  return (await res.json()) as ActivityReport;
}

async function fetchTrackingCountsForCampaigns(
  accessToken: string,
  campaigns: CampaignSummary[],
  retries = 5,
  delayMs = 1000,
): Promise<{ totalOpens: number; totalClicks: number }> {
  let totalOpens = 0;
  let totalClicks = 0;

  for (const campaign of campaigns) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const details = await fetchCampaignDetails(accessToken, campaign.campaign_id);
        for (const activity of details.campaign_activities ?? []) {
          if (activity.current_status === "DONE") {
            const report = await fetchActivityReport(accessToken, activity.campaign_activity_id);
            totalOpens += report.tracking_counts?.opens ?? 0;
            totalClicks += report.tracking_counts?.clicks ?? 0;
          }
        }
        break;
      } catch (err: any) {
        if (err.message.includes("429") && attempt < retries) {
          const wait = delayMs * Math.pow(2, attempt - 1);
          console.warn(`[CC] Rate limited fetching tracking for ${campaign.campaign_id}, waiting ${wait}ms...`);
          await new Promise((r) => setTimeout(r, wait));
        } else {
          console.warn(`[CC] Could not fetch tracking counts for campaign ${campaign.campaign_id}:`, err);
          break;
        }
      }
    }
  }

  return { totalOpens, totalClicks };
}

// to deal with rate limiting
async function fetchCampaignsSentOnWithRetry(
  accessToken: string,
  targetDate: Date,
  retries = 5,
  delayMs = 1000,
): Promise<CampaignSummary[]> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fetchCampaignsSentOn(accessToken, targetDate);
    } catch (err: any) {
      if (err.message.includes("429")) {
        console.warn(
          `[CC] Rate limited on ${formatISODate(targetDate)}, attempt ${attempt}/${retries}. Waiting ${delayMs}ms...`,
        );
        await new Promise((r) => setTimeout(r, delayMs));
        delayMs *= 2; // exponential backoff
      } else {
        throw err;
      }
    }
  }
  throw new Error(
    `[CC] Failed to fetch campaigns for ${formatISODate(targetDate)} after retries`,
  );
}

async function fetchCampaignsSentOn(
  accessToken: string,
  targetDate: Date,
): Promise<CampaignSummary[]> {
  const results: CampaignSummary[] = [];
  let url: string | null =
    "https://api.cc.email/v3/reports/summary_reports/email_campaign_summaries?limit=50";

  while (url) {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      throw new Error(`[CC] API error: ${res.status} ${await res.text()}`);
    }

    const data = (await res.json()) as SummaryResponse;

    for (const campaign of data.bulk_email_campaign_summaries) {
      if (isSameDay(campaign.last_sent_date, targetDate)) {
        results.push(campaign);
      }
    }

    // Results are sorted desc by last_sent_date — stop if we've gone past target
    const last = data.bulk_email_campaign_summaries.at(-1);
    if (last && new Date(last.last_sent_date) < startOfDay(targetDate)) {
      break;
    }

    url = data._links?.next?.href
      ? `https://api.cc.email${data._links.next.href}`
      : null;
  }

  return results;
}

function aggregateCampaigns(campaigns: CampaignSummary[]) {
  return campaigns.reduce(
    (acc, c) => ({
      sends: acc.sends + c.unique_counts.sends,
      bounced: acc.bounced + c.unique_counts.bounces,
      delivered:
        acc.delivered +
        Math.max(0, c.unique_counts.sends - c.unique_counts.bounces),
      opens: acc.opens + c.unique_counts.opens,
      clicks: acc.clicks + c.unique_counts.clicks,
      unsubscribes: acc.unsubscribes + c.unique_counts.optouts,
      forwarded: acc.forwarded + c.unique_counts.forwards,
      notOpened: acc.notOpened + c.unique_counts.not_opened,
      abuse: acc.abuse + c.unique_counts.abuse,
    }),
    {
      sends: 0,
      bounced: 0,
      delivered: 0,
      opens: 0,
      clicks: 0,
      unsubscribes: 0,
      forwarded: 0,
      notOpened: 0,
      abuse: 0,
    },
  );
}

/* -------------------------------------------------
   Backfill logic
-------------------------------------------------- */
async function backfillConstantContact() {
  const rangeEnd = startOfDay(new Date(Date.now() - 24 * 60 * 60 * 1000)); // yesterday
  const rangeStart = startOfDay(
    new Date(Date.now() - 5 * 365 * 24 * 60 * 60 * 1000),
  ); // 5 years

  console.log(
    `[CC] Starting backfill: ${formatISODate(rangeStart)} -> ${formatISODate(rangeEnd)}`,
  );

  const account = await getConstantContactAccountOrThrow();

  console.log(`\n[CC] Backfilling: ${account.username}`);

  // Refresh token once at the start (good for ~24h)
  let authId = account.SocialMediaAuth?.id ?? null;
  let accessToken = account.SocialMediaAuth?.accessToken ?? null;
  let refreshToken = account.SocialMediaAuth?.refreshToken ?? null;
  let expiresAt = account.SocialMediaAuth?.expiresAt ?? null;

  if (!accessToken) {
    throw new Error("[CC] No access token available after refresh.");
  }
  const validAccessToken: string = accessToken;

  const current = new Date(rangeStart);
  while (current <= rangeEnd) {
    const metricDate = startOfDay(current);
    const dateStr = formatISODate(metricDate);

    if (await allMetricsStoredForDay(account.id, metricDate)) {
      console.log(`  ${dateStr} -- already exists, skipping`);
      current.setUTCDate(current.getUTCDate() + 1);
      continue;
    }

    try {
      const campaigns = await fetchCampaignsSentOnWithRetry(
        validAccessToken,
        metricDate,
      );

      if (campaigns.length === 0) {
        console.log(`  ${dateStr} -- no campaigns sent`);
        current.setUTCDate(current.getUTCDate() + 1);
        continue;
      }

      const totals = aggregateCampaigns(campaigns);
      const tracking = await fetchTrackingCountsForCampaigns(validAccessToken, campaigns);

      const metricsToInsert = [
        { metricName: Metric.EMAILS_SENT, metricValue: totals.sends },
        { metricName: Metric.EMAILS_DELIVERED, metricValue: totals.delivered },
        { metricName: Metric.EMAIL_OPENED, metricValue: totals.opens },
        { metricName: Metric.EMAILS_CLICKED, metricValue: totals.clicks },
        {
          metricName: Metric.EMAILS_UNSUBSCRIBED,
          metricValue: totals.unsubscribes,
        },
        { metricName: Metric.EMAIL_BOUNCED, metricValue: totals.bounced },
        { metricName: Metric.EMAIL_FORWARDED, metricValue: totals.forwarded },
        { metricName: Metric.EMAIL_NOT_OPENED, metricValue: totals.notOpened },
        { metricName: Metric.EMAIL_ABUSE, metricValue: totals.abuse },
        { metricName: Metric.EMAIL_UNIQUE_OPENS, metricValue: totals.opens },
        { metricName: Metric.EMAIL_UNIQUE_CLICKS, metricValue: totals.clicks },
        { metricName: Metric.EMAIL_TOTAL_OPENS, metricValue: tracking.totalOpens },
        { metricName: Metric.EMAIL_TOTAL_CLICKS, metricValue: tracking.totalClicks },
      ] as const;

      for (const m of metricsToInsert) {
        const existing = await prisma.socialMediaMetrics.findFirst({
          where: {
            socialMediaId: account.id,
            metricName: m.metricName,
            metricDate: {
              gte: startOfDay(metricDate),
              lt: new Date(startOfDay(metricDate).getTime() + 86400000),
            },
            breakdownKey: null,
            breakdownValue: null,
          },
        });

        if (!existing) {
          await prisma.socialMediaMetrics.create({
            data: {
              socialMediaId: account.id,
              metricName: m.metricName,
              metricValue: m.metricValue,
              metricDate,
              lastSynced: new Date(),
              breakdownKey: null,
              breakdownValue: null,
            },
          });
        }
      }

      console.log(
        `  ${dateStr} -- ${campaigns.length} campaign(s): sent=${totals.sends} delivered=${totals.delivered} opened=${totals.opens} clicked=${totals.clicks} bounced=${totals.bounced} forwarded=${totals.forwarded} not_opened=${totals.notOpened} abuse=${totals.abuse} unsub=${totals.unsubscribes}`,
      );
    } catch (err: any) {
      if (err?.message?.includes("401")) {
        console.warn(
          `  ${dateStr} -- 401 Unauthorized. Access token may be expired. Skipping this day.`,
        );
        current.setUTCDate(current.getUTCDate() + 1);
        continue;
      }
      console.error(`  ${dateStr} -- failed:`, err);
    }

    current.setUTCDate(current.getUTCDate() + 1);
  }

  console.log("\n[CC] Backfill complete");
}

async function main() {
  try {
    await backfillConstantContact();
  } catch (err) {
    console.error("[CC] Backfill failed:", err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  void main();
}
