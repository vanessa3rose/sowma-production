import { PrismaClient, Metric, Provider } from "../src/generated/prisma/index.js";
import fetch from "node-fetch";
import "dotenv/config";
import { startOfDay, endOfDay, formatISODate } from "../src/utils/dates";

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
function isWithinUtcDay(iso: string, day: Date) {
  const t = new Date(iso).getTime();
  return t >= startOfDay(day).getTime() && t <= endOfDay(day).getTime();
}

async function fetchSummariesPage(accessToken: string, nextHref?: string) {
  // next.href from CC is usually a relative link; normalize it
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
      if (row.last_sent_date && isWithinUtcDay(row.last_sent_date, metricDate)) {
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
  // T-1 (yesterday UTC)
  const metricDate = startOfDay(new Date(Date.now() - 24 * 60 * 60 * 1000));
  console.log(`[CC] Starting daily sync for ${formatISODate(metricDate)} (T-1 UTC)`);

  const accounts = await prisma.socialMedia.findMany({
    where: { provider: Provider.CONSTANT_CONTACT },
    include: { SocialMediaAuth: true },
  });

  for (const account of accounts) {
    const accessToken = account.SocialMediaAuth?.accessToken;

    if (!accessToken) {
      console.warn(`[CC] ${account.username}: missing access token (need initial OAuth)`);
      continue;
    }

    console.log(`[CC] Syncing ${account.username} (${formatISODate(metricDate)})`);

    try {
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

      // Delivered is not guaranteed as a field in this summary response.
      // If you want to store it anyway, use the simplest definition:
      // delivered = sends (since bounces not available in your Metric enum anyway)
      const emailsDelivered = emailsSent;

      const metricsToInsert = [
        { metricName: Metric.EMAILS_SENT, metricValue: emailsSent },
        { metricName: Metric.EMAILS_DELIVERED, metricValue: emailsDelivered },
        { metricName: Metric.EMAIL_OPENED, metricValue: emailOpened },
        { metricName: Metric.EMAILS_CLICKED, metricValue: emailsClicked },
        { metricName: Metric.EMAILS_UNSUBSCRIBED, metricValue: emailsUnsubscribed },
      ];

      // Idempotency (stronger than metricsExistForDay):
      // delete rows for that day/provider/account, then insert fresh
      await prisma.$transaction(async (tx) => {
        await tx.socialMediaMetrics.deleteMany({
          where: {
            socialMediaId: account.id,
            metricDate,
            metricName: {
              in: [
                Metric.EMAILS_SENT,
                Metric.EMAILS_DELIVERED,
                Metric.EMAIL_OPENED,
                Metric.EMAILS_CLICKED,
                Metric.EMAILS_UNSUBSCRIBED,
              ],
            },
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
        `[CC] ${account.username} OK: campaigns=${summaries.length} sent=${emailsSent} opened=${emailOpened} clicked=${emailsClicked} unsub=${emailsUnsubscribed}`,
      );
    } catch (err) {
      console.error(`[CC] Sync failed for ${account.username} (${formatISODate(metricDate)})`, err);
    }
  }

  console.log("[CC] Daily Constant Contact sync complete");
  await prisma.$disconnect();
}

