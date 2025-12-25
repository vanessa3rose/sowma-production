import fetch from "node-fetch";
import "dotenv/config";
import { PrismaClient, Metric } from "../src/generated/prisma";
import {
  startOfDay,
  formatISODate,
} from "../src/utils/dates";

const prisma = new PrismaClient();

const INSTAGRAM_USER_ID = process.env.INSTAGRAM_BUSINESS_PAGE_ID!;
const ACCESS_TOKEN = process.env.FACEBOOK_PAGE_TOKEN!;

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

/* -------------------------------------------------
   Fetch ALL Instagram media with pagination
-------------------------------------------------- */

async function fetchAllMedia(): Promise<MediaItem[]> {
  let url =
    `https://graph.facebook.com/v20.0/${INSTAGRAM_USER_ID}/media` +
    `?fields=id,like_count,comments_count,timestamp` +
    `&limit=50&access_token=${ACCESS_TOKEN}`;

  const all: MediaItem[] = [];

  while (url) {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Media fetch failed: ${await res.text()}`);
    }

    const json = await res.json();
    all.push(...(json.data ?? []));
    url = json.paging?.next ?? null;
  }

  return all;
}

/* -------------------------------------------------
   Group media → daily metrics
-------------------------------------------------- */

function buildDailyMetrics(
  media: MediaItem[],
): Map<string, DailyMetrics> {
  const map = new Map<string, DailyMetrics>();

  for (const m of media) {
    const day = formatISODate(new Date(m.timestamp));

    if (!map.has(day)) {
      map.set(day, { likes: 0, comments: 0, daysPosted: 0 });
    }

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

  if (!account) {
    throw new Error("No Instagram account found");
  }

  console.log("[IG] Fetching all media...");
  const media = await fetchAllMedia();
  console.log(`[IG] ${media.length} media items fetched`);

  const dailyMetrics = buildDailyMetrics(media);
  const days = Array.from(dailyMetrics.keys()).sort();

  for (const day of days) {
    const date = startOfDay(new Date(day));

    const exists = await prisma.socialMediaMetrics.findFirst({
      where: {
        socialMediaId: account.id,
        metricDate: date,
        metricName: Metric.LIKES,
      },
    });

    if (exists) {
      continue;
    }

    const metrics = dailyMetrics.get(day)!;

    await prisma.socialMediaMetrics.createMany({
      data: [
        {
          socialMediaId: account.id,
          metricName: Metric.LIKES,
          metricValue: metrics.likes,
          metricDate: date,
        },
        {
          socialMediaId: account.id,
          metricName: Metric.COMMENTS,
          metricValue: metrics.comments,
          metricDate: date,
        },
        {
          socialMediaId: account.id,
          metricName: Metric.DAYS_POSTED,
          metricValue: metrics.daysPosted,
          metricDate: date,
        },
      ],
    });

    console.log(`[IG] Backfilled ${day}`);
  }

  console.log("[IG] Backfill complete");
}

/* -------------------------------------------------
   Entrypoint
-------------------------------------------------- */

(async () => {
  try {
    await backfillInstagram();
  } catch (err) {
    console.error(err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
})();
