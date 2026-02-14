
// Usage:
//   npx tsx scripts/constant_contact_backfill.ts 2025-01-01 2025-01-31


import { fileURLToPath } from "node:url";
import { PrismaClient, Metric, Provider } from "../../src/generated/prisma/index.js";
import fetch from "node-fetch";
import "dotenv/config";
import {
  startOfDay,
  endOfDay,
  formatISODate,
  metricsExistForDay,
} from "../../src/utils/dates.js";

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
   CC email metrics we track (must match cron)
-------------------------------------------------- */
const CC_METRICS = [
  Metric.EMAILS_SENT,
  Metric.EMAILS_DELIVERED,
  Metric.EMAIL_OPENED,
  Metric.EMAILS_CLICKED,
  Metric.EMAILS_UNSUBSCRIBED,
] as const;

/* -------------------------------------------------
   Token refresh (reuses existing CC OAuth logic)
-------------------------------------------------- */
async function refreshAccessToken(auth: {
  accessToken: string;
  refreshToken: string | null;
  id: string;
}): Promise<string> {
  if (!auth.refreshToken) {
    console.warn(`[CC] No refresh token for auth ${auth.id}, using existing access token`);
    return auth.accessToken;
  }

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: auth.refreshToken,
  });

  const res = await fetch(
    "https://authz.constantcontact.com/oauth2/default/v1/token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(
          `${process.env.CONSTANT_CONTACT_CLIENT_ID}:${process.env.CONSTANT_CONTACT_CLIENT_SECRET}`
        ).toString("base64")}`,
      },
      body,
    }
  );

  const j = (await res.json()) as {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
  };

  if (!res.ok) {
    throw new Error(
      `[CC] Token refresh failed: ${res.status} ${JSON.stringify(j)}`
    );
  }

  // Persist the new tokens back to the database
  await prisma.socialMediaAuth.update({
    where: { id: auth.id },
    data: {
      accessToken: j.access_token ?? auth.accessToken,
      refreshToken: j.refresh_token ?? auth.refreshToken,
      expiresAt: j.expires_in
        ? new Date(Date.now() + j.expires_in * 1000)
        : undefined,
    },
  });

  console.log(`[CC] Access token refreshed`);
  return j.access_token ?? auth.accessToken;
}

/* -------------------------------------------------
   API helpers (same logic as cron)
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
  targetDate: Date
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
      delivered:
        acc.delivered +
        (c.unique_counts.sends - c.unique_counts.bounces),
      opens: acc.opens + c.unique_counts.opens,
      clicks: acc.clicks + c.unique_counts.clicks,
      unsubscribes: acc.unsubscribes + c.unique_counts.optouts,
    }),
    { sends: 0, delivered: 0, opens: 0, clicks: 0, unsubscribes: 0 }
  );
}

/* -------------------------------------------------
   Backfill logic
-------------------------------------------------- */
async function backfillConstantContact(
  rangeStart: Date,
  rangeEnd: Date
) {
  console.log(
    `[CC] Starting backfill: ${formatISODate(rangeStart)} → ${formatISODate(rangeEnd)}`
  );

  const accounts = await prisma.socialMedia.findMany({
    where: { provider: Provider.CONSTANT_CONTACT },
    include: { SocialMediaAuth: true },
  });

  if (accounts.length === 0) {
    console.log("[CC] No Constant Contact accounts found.");
    return;
  }

  for (const account of accounts) {
    const auth = account.SocialMediaAuth;
    if (!auth || !auth.refreshToken) {
      console.warn(
        `[CC] ${account.username}: missing auth/refresh token, skipping`
      );
      continue;
    }

    console.log(`\n[CC] Backfilling: ${account.username}`);

    // Refresh token once at the start (good for 24h)
    let accessToken: string;
    try {
      accessToken = await refreshAccessToken(auth);
    } catch (err) {
      console.error(`[CC] Token refresh failed for ${account.username}:`, err);
      continue;
    }

    // Walk forward through the date range day by day
    const current = new Date(rangeStart);
    while (current <= rangeEnd) {
      const metricDate = startOfDay(current);
      const dateStr = formatISODate(metricDate);

      // Skip if data already exists (idempotent, don't overwrite)
      if (await metricsExistForDay(account.id, metricDate)) {
        console.log(`  ${dateStr} — already exists, skipping`);
        current.setUTCDate(current.getUTCDate() + 1);
        continue;
      }

      try {
        const campaigns = await fetchCampaignsSentOn(accessToken, metricDate);

        if (campaigns.length === 0) {
          console.log(`  ${dateStr} — no campaigns sent`);
          current.setUTCDate(current.getUTCDate() + 1);
          continue;
        }

        const totals = aggregateCampaigns(campaigns);

        const metricsToInsert = [
          { metricName: Metric.EMAILS_SENT, metricValue: totals.sends },
          { metricName: Metric.EMAILS_DELIVERED, metricValue: totals.delivered },
          { metricName: Metric.EMAIL_OPENED, metricValue: totals.opens },
          { metricName: Metric.EMAILS_CLICKED, metricValue: totals.clicks },
          { metricName: Metric.EMAILS_UNSUBSCRIBED, metricValue: totals.unsubscribes },
        ];

        // Insert all metrics in a single transaction
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
            })
          )
        );

        console.log(
          `  ${dateStr} — ${campaigns.length} campaign(s): sent=${totals.sends} opened=${totals.opens} clicked=${totals.clicks} unsub=${totals.unsubscribes}`
        );
      } catch (err: any) {
        // If we get a 401, try refreshing the token once
        if (err?.message?.includes("401")) {
          console.warn(`  ${dateStr} — 401, refreshing token and retrying…`);
          try {
            accessToken = await refreshAccessToken(auth);
            // Don't increment — retry this day
            continue;
          } catch (refreshErr) {
            console.error(`[CC] Token re-refresh failed, stopping backfill for ${account.username}`);
            break;
          }
        }

        console.error(`  ${dateStr} — failed:`, err);
      }

      current.setUTCDate(current.getUTCDate() + 1);
    }

    console.log(`[CC] Completed backfill for ${account.username}`);
  }

  console.log("\n[CC] Backfill complete");
}

/* -------------------------------------------------
   CLI entrypoint
-------------------------------------------------- */
function parseArgs(): { startDate: Date; endDate: Date } {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.error("Usage: npx tsx scripts/constant_contact_backfill.ts <start-date> <end-date>");
    console.error("Example: npx tsx scripts/constant_contact_backfill.ts 2025-01-01 2025-01-31");
    process.exit(1);
  }

  const startDate = new Date(args[0]);
  const endDate = new Date(args[1]);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    console.error("Error: Invalid date format. Use YYYY-MM-DD");
    process.exit(1);
  }

  if (startDate > endDate) {
    console.error("Error: Start date must be before end date");
    process.exit(1);
  }

  return { startDate: startOfDay(startDate), endDate: startOfDay(endDate) };
}

async function main() {
  try {
    const { startDate, endDate } = parseArgs();
    await backfillConstantContact(startDate, endDate);
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