import { getAuthBySocialMediaId } from "../../db/social-media-auth.js";
import fetch from "node-fetch";
import "dotenv/config";
import { PrismaClient, Metric } from "../../src/generated/prisma/index.js";
import { startOfDay, endOfDay, formatISODate } from "../../src/utils/dates.js";

/* -------------------------------------------------
   Prisma setup (serverless-friendly)
-------------------------------------------------- */
const prisma = (globalThis as any).prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") (globalThis as any).prisma = prisma;

/* -------------------------------------------------
   Constants
-------------------------------------------------- */
const INSTAGRAM_USER_ID = process.env.INSTAGRAM_BUSINESS_PAGE_ID!;

const REQUIRED_IG_METRICS: Metric[] = [
  Metric.LIKES,
  Metric.COMMENTS,
  Metric.DAYS_POSTED,
];

type MediaItem = {
  id: string;
  timestamp: string;
  like_count?: number;
  comments_count?: number;
};

type DailyMetrics = {
  likes: number;
  comments: number;
  daysPosted: number;
};

type IGApiResponse = {
  data?: MediaItem[];
  paging?: { next?: string };
};

/* -------------------------------------------------
   Helpers
-------------------------------------------------- */
async function allMetricsStoredForDay(socialMediaId: string, date: Date) {
  const metricsForDay = await prisma.socialMediaMetrics.findMany({
    where: {
      socialMediaId,
      metricDate: date,
      breakdownKey: null,
      breakdownValue: null,
    },
    select: { metricName: true },
  });

  const existingMetricNames = new Set(
    metricsForDay.map((m: any) => m.metricName),
  );

  return REQUIRED_IG_METRICS.every((metric) => existingMetricNames.has(metric));
}

/* -------------------------------------------------
   Fetch ALL Instagram media with pagination
-------------------------------------------------- */
async function fetchAllMedia(accessToken: string): Promise<MediaItem[]> {
  let url: string | null =
    `https://graph.facebook.com/v20.0/${INSTAGRAM_USER_ID}/media` +
    `?fields=id,like_count,comments_count,timestamp` +
    `&limit=50&access_token=${accessToken}`;
  const all: MediaItem[] = [];

  while (url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Media fetch failed: ${await res.text()}`);

    // cast json to a typed interface
    const json = (await res.json()) as IGApiResponse;

    all.push(...(json.data ?? []));
    url = json.paging?.next ?? null; // string | null ✅
  }

  return all;
}

/* -------------------------------------------------
   Group media → daily metrics
-------------------------------------------------- */
function buildDailyMetrics(media: MediaItem[]): Map<string, DailyMetrics> {
  const map = new Map<string, DailyMetrics>();

  for (const m of media) {
    const day = formatISODate(new Date(m.timestamp));
    if (!map.has(day)) map.set(day, { likes: 0, comments: 0, daysPosted: 0 });

    const entry = map.get(day)!;
    entry.likes += m.like_count ?? 0;
    entry.comments += m.comments_count ?? 0;
    entry.daysPosted = 1;
  }

  return map;
}

/* -------------------------------------------------
   Backfill (DAY-BY-DAY ONLY)
-------------------------------------------------- */
export async function backfillInstagram() {
  const account = await prisma.socialMedia.findFirst({
    where: { provider: "INSTAGRAM" },
  });

  if (!account) throw new Error("No Instagram account found");

  // gets FACEBOOK_PAGE_TOKEN
  const fbAccount = await prisma.socialMedia.findFirst({
    where: { provider: "FACEBOOK" },
  });
  const fbAuth = fbAccount ? await getAuthBySocialMediaId(fbAccount.id) : null;

  // Instagram can share Facebook Page token (Setup A)
  if (!fbAuth || !fbAuth.accessToken) {
    console.error(
      "[IG] No access token found in DB for this Instagram account",
    );
    return;
  }

  const ACCESS_TOKEN = fbAuth.accessToken;

  console.log("[IG] Fetching all media...");
  const media = await fetchAllMedia(ACCESS_TOKEN);
  console.log(`[IG] ${media.length} media items fetched`);

  const dailyMetrics = buildDailyMetrics(media);
  const days = Array.from(dailyMetrics.keys()).sort();

  for (const day of days) {
    const date = startOfDay(new Date(day));

    if (await allMetricsStoredForDay(account.id, date)) {
      continue;
    }

    const metrics = dailyMetrics.get(day)!;

    const metricsToInsert = [
      { metricName: Metric.LIKES, metricValue: metrics.likes },
      { metricName: Metric.COMMENTS, metricValue: metrics.comments },
      { metricName: Metric.DAYS_POSTED, metricValue: metrics.daysPosted },
    ];

    for (const m of metricsToInsert) {
      const existing = await prisma.socialMediaMetrics.findFirst({
        where: {
          socialMediaId: account.id,
          metricName: m.metricName,
          metricDate: {
            gte: startOfDay(date),
            lt: endOfDay(date),
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
            metricDate: date,
            breakdownKey: null,
            breakdownValue: null,
          },
        });
      }
    }

    console.log(`[IG] Backfilled ${day}`);
  }

  console.log("[IG] Backfill complete");
}

/* -------------------------------------------------
   Entrypoint for standalone run
-------------------------------------------------- */
(async () => {
  try {
    await backfillInstagram();
  } catch (err) {
    console.error(err);
    process.exitCode = 1;
  }
})();
