import {
  PrismaClient,
  Provider,
  Metric,
} from "../src/generated/prisma/index.js";
import { createSocialMediaMetric } from "../db/social-media-metrics.js";

const prisma = (globalThis as any).prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") {
  (globalThis as any).prisma = prisma;
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { platform, metric, value, date, breakdownKey, breakdownValue } =
      req.body;

    if (!platform || !metric || value == null || !date) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const provider = String(platform).toUpperCase() as Provider;
    const metricName = String(metric).toUpperCase() as Metric;

    // finds social media account
    const account = await prisma.socialMedia.findFirst({
      where: { provider },
    });

    if (!account) {
      return res.status(404).json({
        error: `No social media account found for provider: ${platform}`,
      });
    }

    const metricDate = new Date(date);

    // use the DB layer
    await createSocialMediaMetric({
      socialMediaId: account.id,
      metricName,
      metricValue: Number(value),
      metricDate,
      breakdownKey: breakdownKey ?? null,
      breakdownValue: breakdownValue ?? null,
      lastSynced: new Date(),
    });

    return res.status(200).json({ ok: true });
  } catch (err: any) {
    console.error("manual metric entry error:", err);
    return res.status(500).json({ error: err.message || "Internal error" });
  }
}
