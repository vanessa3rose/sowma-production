import { fileURLToPath } from "node:url";
import { getAuthBySocialMediaId } from "../../db/social-media-auth.js";
import fetch from "node-fetch";
import "dotenv/config";
import { PrismaClient, Metric } from "../../src/generated/prisma/index.js";
import {
  startOfDay,
  endOfDay,
  toUnixTimestamp,
  formatISODate,
} from "../../src/utils/dates.js";

/* -------------------------------------------------
   Prisma setup
-------------------------------------------------- */
const prisma = new PrismaClient();

/* -------------------------------------------------
   Constants
-------------------------------------------------- */
const INSTAGRAM_USER_ID = process.env.INSTAGRAM_BUSINESS_PAGE_ID!;
const FB_GRAPH_VERSION = "v24.0";
const INSIGHTS_WINDOW_DAYS = 30;

type MediaItem = {
  id: string;
  timestamp: string;
  like_count?: number;
  comments_count?: number;
};

type IGApiResponse = {
  data?: MediaItem[];
  paging?: { next?: string };
};

/* -------------------------------------------------
   Helpers
-------------------------------------------------- */
function isWithinInsightsWindow(date: Date) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - INSIGHTS_WINDOW_DAYS);
  return date >= cutoff;
}

/* -------------------------------------------------
   Fetch ALL Instagram media with pagination
-------------------------------------------------- */
async function fetchAllMedia(accessToken: string): Promise<MediaItem[]> {
  let url: string | null =
    `https://graph.facebook.com/${FB_GRAPH_VERSION}/${INSTAGRAM_USER_ID}/media` +
    `?fields=id,like_count,comments_count,timestamp` +
    `&limit=50&access_token=${accessToken}`;

  const all: MediaItem[] = [];

  while (url) {
    const res = await fetch(url);
    if (!res.ok)
      throw new Error(`[IG] media fetch failed: ${await res.text()}`);

    const json = (await res.json()) as IGApiResponse;

    all.push(...(json.data ?? []));
    url = json.paging?.next ?? null;
  }

  return all;
}

/* -------------------------------------------------
   Fetch daily insights for a single day
-------------------------------------------------- */
async function fetchDailyInsights(
  date: Date,
  accessToken: string,
): Promise<Record<string, number>> {
  const since = toUnixTimestamp(startOfDay(date));
  const until = toUnixTimestamp(endOfDay(date));

  const url =
    `https://graph.facebook.com/${FB_GRAPH_VERSION}/${INSTAGRAM_USER_ID}/insights` +
    `?metric=views,reach,total_interactions,shares,saves,profile_views,website_clicks` +
    `&period=day` +
    `&metric_type=total_value` +
    `&since=${since}&until=${until}` +
    `&access_token=${accessToken}`;

  const res = await fetch(url);

  if (!res.ok) {
    console.warn(
      `[IG] insights unavailable for ${formatISODate(date)}: ${res.status}`,
    );
    return {};
  }

  const json = (await res.json()) as {
    data?: Array<{ name: string; total_value?: { value?: number } }>;
  };

  if (!json.data || json.data.length === 0) {
    return {};
  }

  const out: Record<string, number> = {};

  for (const row of json.data) {
    out[row.name] = row.total_value?.value ?? 0;
  }

  return out;
}

/* -------------------------------------------------
   Fetch current account totals (snapshot only)
-------------------------------------------------- */
async function fetchAccountTotals(
  accessToken: string,
): Promise<{ followers_count?: number; media_count?: number }> {
  const url =
    `https://graph.facebook.com/${FB_GRAPH_VERSION}/${INSTAGRAM_USER_ID}` +
    `?fields=followers_count,media_count` +
    `&access_token=${accessToken}`;

  const res = await fetch(url);

  if (!res.ok) {
    console.warn(`[IG] account totals failed: ${res.status}`);
    return {};
  }

  return (await res.json()) as {
    followers_count?: number;
    media_count?: number;
  };
}

/* -------------------------------------------------
   Upsert helper — skip if already stored
-------------------------------------------------- */
async function upsertMetric(
  socialMediaId: string,
  metricName: Metric,
  metricValue: number,
  metricDate: Date,
) {
  const existing = await prisma.socialMediaMetrics.findFirst({
    where: {
      socialMediaId,
      metricName,
      metricDate: {
        gte: startOfDay(metricDate),
        lt: endOfDay(metricDate),
      },
      breakdownKey: null,
      breakdownValue: null,
    },
  });

  if (existing) return;

  await prisma.socialMediaMetrics.create({
    data: {
      socialMediaId,
      metricName,
      metricValue,
      metricDate,
      breakdownKey: null,
      breakdownValue: null,
    },
  });
}

/* -------------------------------------------------
   Phase 1: Media-based metrics (likes, comments)
-------------------------------------------------- */
async function backfillMediaMetrics(
  accountId: string,
  accessToken: string,
): Promise<Date[]> {
  console.log("[IG] Fetching all media...");

  const media = await fetchAllMedia(accessToken);

  console.log(`[IG] ${media.length} media items fetched`);

  const byDay = new Map<string, { likes: number; comments: number }>();

  for (const m of media) {
    const day = formatISODate(new Date(m.timestamp));

    const entry = byDay.get(day) ?? { likes: 0, comments: 0 };

    entry.likes += m.like_count ?? 0;
    entry.comments += m.comments_count ?? 0;

    byDay.set(day, entry);
  }

  const days = Array.from(byDay.keys()).sort();

  console.log(`[IG] Backfilling media for ${days.length} days...`);

  const dates: Date[] = [];

  for (const day of days) {
    const date = startOfDay(new Date(day));
    const { likes, comments } = byDay.get(day)!;

    await upsertMetric(accountId, Metric.LIKES, likes, date);
    await upsertMetric(accountId, Metric.COMMENTS, comments, date);

    dates.push(date);

    console.log(
      `[IG][MEDIA] ${day} — likes=${likes} comments=${comments}`,
    );
  }

  return dates;
}

/* -------------------------------------------------
   Phase 2: Insights metrics (recent window only)
-------------------------------------------------- */
async function backfillInsightsMetrics(
  accountId: string,
  accessToken: string,
  dates: Date[],
) {
  const filteredDates = dates.filter(isWithinInsightsWindow);

  console.log(
    `[IG] Backfilling insights for ${filteredDates.length} recent days...`,
  );

  for (const date of filteredDates) {
    const day = formatISODate(date);

    const insights = await fetchDailyInsights(date, accessToken);

    if (!insights || Object.keys(insights).length === 0) {
      console.warn(`[IG][INSIGHTS] No data for ${day}`);
      continue;
    }

    if (insights.views !== undefined)
      await upsertMetric(accountId, Metric.VIEWS, insights.views, date);

    if (insights.reach !== undefined)
      await upsertMetric(accountId, Metric.REACH, insights.reach, date);

    if (insights.total_interactions !== undefined)
      await upsertMetric(
        accountId,
        Metric.TOTAL_INTERACTIONS,
        insights.total_interactions,
        date,
      );

    if (insights.shares !== undefined)
      await upsertMetric(accountId, Metric.SHARES, insights.shares, date);

    if (insights.saves !== undefined)
      await upsertMetric(accountId, Metric.SAVES, insights.saves, date);

    if (insights.profile_views !== undefined)
      await upsertMetric(
        accountId,
        Metric.PROFILE_VIEWS,
        insights.profile_views,
        date,
      );

    if (insights.website_clicks !== undefined)
      await upsertMetric(
        accountId,
        Metric.WEBSITE_CLICKS,
        insights.website_clicks,
        date,
      );

    console.log(
      `[IG][INSIGHTS] ${day} — reach=${insights.reach ?? "?"} views=${insights.views ?? "?"}`,
    );
  }
}

/* -------------------------------------------------
   Backfill
-------------------------------------------------- */
export async function backfillInstagram() {
  const account = await prisma.socialMedia.findFirst({
    where: { provider: "INSTAGRAM" },
  });

  if (!account) throw new Error("[IG] No Instagram account found");

  const fbAccount = await prisma.socialMedia.findFirst({
    where: { provider: "FACEBOOK" },
  });

  const fbAuth = fbAccount
    ? await getAuthBySocialMediaId(fbAccount.id)
    : null;

  if (!fbAuth?.accessToken) {
    throw new Error("[IG] No Facebook access token found in DB");
  }

  const ACCESS_TOKEN = fbAuth.accessToken;

  const dates = await backfillMediaMetrics(account.id, ACCESS_TOKEN);

  await backfillInsightsMetrics(account.id, ACCESS_TOKEN, dates);

  const totals = await fetchAccountTotals(ACCESS_TOKEN);

  const today = startOfDay(new Date());

  if (totals.followers_count !== undefined)
    await upsertMetric(
      account.id,
      Metric.FOLLOWERS,
      totals.followers_count,
      today,
    );

  if (totals.media_count !== undefined)
    await upsertMetric(account.id, Metric.POSTS, totals.media_count, today);

  console.log("[IG] Backfill complete");
}

/* -------------------------------------------------
   Entrypoint
-------------------------------------------------- */
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  backfillInstagram()
    .catch((err) => {
      console.error(err);
      process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());
}