import express from "express";
import { Metric, PrismaClient, Provider } from "../src/generated/prisma";

const router = express.Router();
const prisma = new PrismaClient();

router.get("/", async (req, res) => {
  try {
    const { provider, metric, startDate, endDate } = req.query;

    if (!provider || !metric) {
      return res
        .status(400)
        .json({ error: "Missing required parameters: provider and metric" });
    }

    const metrics = await prisma.socialMediaMetrics.findMany({
      where: {
        metricName: metric as Metric,
        lastSynced: {
          gte: startDate
            ? new Date(startDate as string)
            : new Date("2000-01-01"),
          lte: endDate ? new Date(endDate as string) : new Date(),
        },
        socialMedia: {
          provider: provider as Provider,
        },
      },
      include: {
        socialMedia: true,
      },
    });

    return res.status(200).json(metrics);
  } catch (error) {
    console.error("Error fetching metrics:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
