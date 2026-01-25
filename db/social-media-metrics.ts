import { PrismaClient, Metric } from "../src/generated/prisma/index.js";

/* Reuse Prisma client in serverless */
const prisma = (globalThis as any).prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") (globalThis as any).prisma = prisma;

/* CREATE: create one SocialMediaMetrics record */
export async function createSocialMediaMetric(input: {
  socialMediaId: string;
  metricName: Metric;
  metricValue: number;
  lastSynced?: Date | null;
  metricDate: Date;
  breakdownKey?: string | null;
  breakdownValue?: string | null;
}) {
  return prisma.socialMediaMetrics.create({ data: input });
}

/* READ ALL: return all SocialMediaMetrics records */
export async function getAllSocialMediaMetrics() {
  return prisma.socialMediaMetrics.findMany({
    include: { socialMedia: true },
  });
}

/* READ BY SOCIAL MEDIA ID */
export async function getMetricsBySocialMediaId(socialMediaId: string) {
  return prisma.socialMediaMetrics.findMany({
    where: { socialMediaId },
    orderBy: { lastSynced: "desc" },
  });
}

/* UPDATE a SocialMediaMetrics record by ID */
export async function updateSocialMediaMetric(
  id: string,
  data: Partial<{
    metricName: Metric;
    metricValue: number;
    lastSynced: Date | null;
    metricDate: Date;
    breakdownKey?: string | null;
    breakdownValue?: string | null;
  }>,
) {
  return prisma.socialMediaMetrics.update({ where: { id }, data });
}

/* DELETE a SocialMediaMetrics record by ID */
export async function deleteSocialMediaMetric(id: string) {
  return prisma.socialMediaMetrics.delete({ where: { id } });
}
