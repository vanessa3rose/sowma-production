import {
  PrismaClient,
  Metric,
  Provider,
} from "../../src/generated/prisma/index.js";
import fetch from "node-fetch";
import "dotenv/config";
import { startOfDay, endOfDay, formatISODate } from "../../src/utils/dates.js";

/* -------------------------------------------------
   Prisma Client
-------------------------------------------------- */
const prisma = new PrismaClient();

/* -------------------------------------------------
   Constant Contact API config
-------------------------------------------------- */
const BASE_URL = "https://api.cc.email/v3";
const PAGE_LIMIT = 500;

/* -------------------------------------------------
   Types: Bulk Email Campaign Summary Report
-------------------------------------------------- */
type CampaignSummary = {
  campaign_id: string;
  last_sent_date?: string; // ISO timestamp
  unique_counts?: {
    sends?: number;
    opens?: number;
    clicks?: number;
    optouts?: number; // unsubscribes
  };
};

type CampaignSummariesResponse = {
  bulk_email_campaign_summaries?: CampaignSummary[];
  _links?: {
    next?: { href?: string };
  };
};

/* -------------------------------------------------
   Helpers
-------------------------------------------------- */
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

function isWithinUtcDay(iso: string, day: Date) {
  const t = new Date(iso).getTime();
  return t >= startOfDay(day).getTime() && t <= endOfDay(day).getTime();
}

async function fetchSummariesPage(accessToken: string, nextHref?: string) {
  const url = nextHref
    ? nextHref.startsWith("http")
      ? nextHref
      : `${BASE_URL}${nextHref}`
    : `${BASE_URL}/reports/summary_reports/email_campaign_summaries?limit=${PAGE_LIMIT}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`[CC] summaries failed: ${res.status} ${await res.text()}`);
  }

  return (await res.json()) as CampaignSummariesResponse;
}

async function fetchAllSummariesForDay(accessToken: string, metricDate: Date) {
  const out: CampaignSummary[] = [];
  let next: string | undefined;

  // Safety cap to avoid infinite loops
  for (let i = 0; i < 25; i++) {
    const page = await fetchSummariesPage(accessToken, next);

    for (const row of page.bulk_email_campaign_summaries ?? []) {
      if (
        row.last_sent_date &&
        isWithinUtcDay(row.last_sent_date, metricDate)
      ) {
        out.push(row);
      }
    }

    const nextHref = page._links?.next?.href;
    if (!nextHref) break;
    next = nextHref;
  }

  return out;
}

/* -------------------------------------------------
   Daily Constant Contact Sync
-------------------------------------------------- */
export async function runDailyConstantContactSync() {
  try {
    // T-1 (yesterday UTC)
    const metricDate = startOfDay(new Date(Date.now() - 24 * 60 * 60 * 1000));
    console.log(
      `[CC] Starting daily sync for ${formatISODate(metricDate)} (T-1 UTC)`,
    );

    const account = await getConstantContactAccountOrThrow();
    const auth = account.SocialMediaAuth;

    if (!auth?.accessToken) {
      throw new Error("[CC] Missing access token. Run token-refresh.");
    }

    const accessToken = auth.accessToken;

    console.log(
      `[CC] Syncing ${account.username} (${formatISODate(metricDate)})`,
    );

    const summaries = await fetchAllSummariesForDay(accessToken, metricDate);

    // Aggregate across all campaigns sent that day
    let emailsSent = 0;
    let emailOpened = 0; // matches your Metric enum: EMAIL_OPENED
    let emailsClicked = 0;
    let emailsUnsubscribed = 0;

    for (const s of summaries) {
      const u = s.unique_counts ?? {};
      emailsSent += u.sends ?? 0;
      emailOpened += u.opens ?? 0;
      emailsClicked += u.clicks ?? 0;
      emailsUnsubscribed += u.optouts ?? 0;
    }

    // Delivered not guaranteed here; use simplest definition
    const emailsDelivered = emailsSent;

    const metricsToInsert = [
      { metricName: Metric.EMAILS_SENT, metricValue: emailsSent },
      { metricName: Metric.EMAILS_DELIVERED, metricValue: emailsDelivered },
      { metricName: Metric.EMAIL_OPENED, metricValue: emailOpened },
      { metricName: Metric.EMAILS_CLICKED, metricValue: emailsClicked },
      {
        metricName: Metric.EMAILS_UNSUBSCRIBED,
        metricValue: emailsUnsubscribed,
      },
    ] as const;

    // Idempotent: replace metrics for that day
    await prisma.$transaction(async (tx) => {
      await tx.socialMediaMetrics.deleteMany({
        where: {
          socialMediaId: account.id,
          metricDate,
          metricName: { in: metricsToInsert.map((m) => m.metricName) },
        },
      });

      await Promise.all(
        metricsToInsert.map((m) =>
          tx.socialMediaMetrics.create({
            data: {
              socialMediaId: account.id,
              metricName: m.metricName,
              metricValue: m.metricValue,
              metricDate,
              lastSynced: new Date(),
            },
          }),
        ),
      );
    });

    console.log(
      `[CC] OK: campaigns=${summaries.length} sent=${emailsSent} opened=${emailOpened} clicked=${emailsClicked} unsub=${emailsUnsubscribed}`,
    );
    console.log("[CC] Daily Constant Contact sync complete");
  } finally {
    await prisma.$disconnect();
  }
}

/* -------------------------------------------------
   Entrypoint
-------------------------------------------------- */
runDailyConstantContactSync().catch(console.error);
