import {
  PrismaClient,
  Metric,
  Provider,
} from "../src/generated/prisma/index.js";

// Reuse Prisma client in serverless
const prisma = (globalThis as any).prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") (globalThis as any).prisma = prisma;

export default async function handler(req: any, res: any) {
  const debug = process.env.DEBUG_METRICS === "1";
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { provider, metric, startDate, endDate } = req.query;

  if (!provider || !metric) {
    res.status(400).json({ error: "Missing provider/metric" });
    return;
  }

  try {
    const start = startDate ? new Date(startDate as string) : new Date('2000-01-01');
    const end = endDate ? new Date(endDate as string) : new Date('3000-01-01');

    if (debug) {
      const dbHost = process.env.DATABASE_URL?.split("@")?.[1]?.split("?")?.[0];
      console.log("[/api/metrics] DB host:", dbHost);
      console.log("[/api/metrics] query:", { provider, metric, start: start.toISOString(), end: end.toISOString() });
      const smCount = await prisma.socialMedia.count({ where: { provider: provider as Provider } });
      console.log("[/api/metrics] socialMedia count for provider:", provider, smCount);
    }

    const metrics = await prisma.socialMediaMetrics.findMany({
      where: {
        metricName: metric as Metric,
        OR: [
          {
            metricDate: { gte: start, lte: end },
          },
          {
            metricDate: null,
            lastSynced: { gte: start, lte: end },
          },
        ],
        // Relation filter by provider
        SocialMedia: { provider: provider as Provider },
      },
      include: { SocialMedia: true },
    });

    if (debug) console.log("[/api/metrics] rows:", metrics.length);

    res.setHeader('Access-Control-Allow-Origin', '*'); // allow frontend requests
    res.status(200).json(metrics);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}
