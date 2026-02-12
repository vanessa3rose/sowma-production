import { fileURLToPath } from "node:url";
import {
  PrismaClient,
  Metric,
  Provider,
} from "../src/generated/prisma/index.js";
import fetch from "node-fetch";
import "dotenv/config";
import {
  startOfDay,
  formatISODate,
  metricsExistForDay,
} from "../src/utils/dates";
import { ensureConstantContactAccessToken } from "./token-refresh";

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
  };
};

type SummaryResponse = {
  bulk_email_campaign_summaries: CampaignSummary[];
  _links?: { next?: { href: string } };
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

    // Results are sorted desc by last_sent_date -- stop if we've gone past target
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
      delivered:
        acc.delivered + (c.unique_counts.sends - c.unique_counts.bounces),
      opens: acc.opens + c.unique_counts.opens,
      clicks: acc.clicks + c.unique_counts.clicks,
      unsubscribes: acc.unsubscribes + c.unique_counts.optouts,
    }),
    { sends: 0, delivered: 0, opens: 0, clicks: 0, unsubscribes: 0 },
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

  const refreshed = await ensureConstantContactAccessToken({
    socialMediaId: account.id,
    auth: account.SocialMediaAuth,
    fallbackRefreshToken: process.env.CONSTANT_CONTACT_REFRESH_TOKEN ?? null,
    forceRefresh: true,
  });
  authId = refreshed.authId;
  accessToken = refreshed.accessToken;
  refreshToken = refreshed.refreshToken;
  expiresAt = refreshed.expiresAt;

  const current = new Date(rangeStart);
  while (current <= rangeEnd) {
    const metricDate = startOfDay(current);
    const dateStr = formatISODate(metricDate);

    if (await metricsExistForDay(account.id, metricDate)) {
      console.log(`  ${dateStr} -- already exists, skipping`);
      current.setUTCDate(current.getUTCDate() + 1);
      continue;
    }

    try {
      const campaigns = await fetchCampaignsSentOn(accessToken, metricDate);

      if (campaigns.length === 0) {
        console.log(`  ${dateStr} -- no campaigns sent`);
        current.setUTCDate(current.getUTCDate() + 1);
        continue;
      }

      const totals = aggregateCampaigns(campaigns);

      const metricsToInsert = [
        { metricName: Metric.EMAILS_SENT, metricValue: totals.sends },
        { metricName: Metric.EMAILS_DELIVERED, metricValue: totals.delivered },
        { metricName: Metric.EMAIL_OPENED, metricValue: totals.opens },
        { metricName: Metric.EMAILS_CLICKED, metricValue: totals.clicks },
        {
          metricName: Metric.EMAILS_UNSUBSCRIBED,
          metricValue: totals.unsubscribes,
        },
      ] as const;

      await prisma.$transaction(
        metricsToInsert.map((m) =>
          prisma.socialMediaMetrics.create({
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

      console.log(
        `  ${dateStr} -- ${campaigns.length} campaign(s): sent=${totals.sends} opened=${totals.opens} clicked=${totals.clicks} unsub=${totals.unsubscribes}`,
      );
    } catch (err: any) {
      if (err?.message?.includes("401")) {
        console.warn(`  ${dateStr} -- 401, refreshing token and retrying...`);
        const retry = await ensureConstantContactAccessToken({
          socialMediaId: account.id,
          auth: {
            id: authId ?? undefined,
            accessToken,
            refreshToken,
            expiresAt,
            lastRefreshed: new Date(),
          },
          fallbackRefreshToken:
            process.env.CONSTANT_CONTACT_REFRESH_TOKEN ?? null,
          forceRefresh: true,
        });
        authId = retry.authId;
        accessToken = retry.accessToken;
        refreshToken = retry.refreshToken;
        expiresAt = retry.expiresAt;
        continue; // retry same day
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
