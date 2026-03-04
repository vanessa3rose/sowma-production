import {
  PrismaClient,
  Metric,
  Provider,
} from "../src/generated/prisma/index.js";
import "dotenv/config";

// Reuse Prisma client in serverless
const prisma = (globalThis as any).prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") (globalThis as any).prisma = prisma;

export default async function handler(req: any, res: any) {
  const debug = process.env.DEBUG_METRICS === "1";
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { provider, metric, startDate, endDate } = req.query;

  if (!provider || !metric) {
    res.status(400).json({ error: "Missing provider/metric" });
    return;
  }

  try {
    const startDay = startDate
      ? String(startDate).slice(0, 10)
      : "2000-01-01";
    const endDay = endDate ? String(endDate).slice(0, 10) : "3000-01-01";

    const start = new Date(`${startDay}T00:00:00.000Z`);
    const end = new Date(`${endDay}T23:59:59.999Z`);

    if (debug) {
      const dbHost = process.env.DATABASE_URL?.split("@")?.[1]?.split("?")?.[0];
      console.log("[/api/metrics] DB host:", dbHost);
      console.log("[/api/metrics] query:", {
        provider,
        metric,
        start: start.toISOString(),
        end: end.toISOString(),
      });
      const smCount = await prisma.socialMedia.count({
        where: { provider: provider as Provider },
      });
      console.log(
        "[/api/metrics] socialMedia count for provider:",
        provider,
        smCount,
      );
    }

    // New filtering logic: prioritize metricDate, fallback to lastSynced only if metricDate is missing
    const metrics = await prisma.socialMediaMetrics.findMany({
      where: {
        metricName: metric as Metric,
        SocialMedia: { provider: provider as Provider },
        OR: [
          {
            metricDate: { gte: start, lte: end },
          },
          {
            metricDate: null,
            lastSynced: { gte: start, lte: end },
          },
        ],
      },
      include: { SocialMedia: true },
    });

    const toIsoDay = (value: Date | string) =>
      new Date(value).toISOString().slice(0, 10);

    // Final day-level filter to avoid timezone edge cases on custom ranges.
    const filteredMetrics = metrics.filter((m: any) => {
      if (m.metricDate) {
        const day = toIsoDay(m.metricDate);
        return day >= startDay && day <= endDay;
      }
      // Only fallback to lastSynced if metricDate is missing
      if (!m.metricDate && m.lastSynced) {
        const day = toIsoDay(m.lastSynced);
        return day >= startDay && day <= endDay;
      }
      return false;
    });

    if (debug) console.log("[/api/metrics] rows:", filteredMetrics.length);

    res.setHeader("Access-Control-Allow-Origin", "*"); // allow frontend requests
    res.status(200).json(filteredMetrics);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}
