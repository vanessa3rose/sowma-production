import { PrismaClient } from "../src/generated/prisma/index.js";
import { PLATFORM_TO_PROVIDER } from "../src/config/platformConfigs.js";

const prisma = (globalThis as any).prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") {
  (globalThis as any).prisma = prisma;
}

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { platform, metric, breakdownKey } = req.query;

    if (!platform || !metric || !breakdownKey) {
      return res.status(400).json({ error: "Missing params" });
    }

    const provider = PLATFORM_TO_PROVIDER[String(platform).toLowerCase()];
    if (!provider) {
      return res.status(400).json({ error: "Invalid platform" });
    }

    const metricName = String(metric).toUpperCase();
    const account = await prisma.socialMedia.findFirst({
      where: { provider },
    });

    if (!account) {
      return res.status(404).json({ error: "Account not found" });
    }

    const rows = await prisma.socialMediaMetrics.findMany({
      where: {
        socialMediaId: account.id,
        metricName,
        breakdownKey,
        breakdownValue: { not: null },
      },
      select: {
        breakdownValue: true,
      },
    });

    const values = [
      ...new Set(rows.map((r: any) => r.breakdownValue).filter(Boolean)),
    ];

    return res.status(200).json({ values });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
