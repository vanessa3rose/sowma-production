import { PrismaClient, Metric } from "../../generated/prisma";

const prisma = new PrismaClient();

/* CREATE: create one SocialMediaMetrics record */
export async function createSocialMediaMetric(input: {
  socialMediaId: string;
  metricName: Metric;
  metricValue: number;
  lastSynced?: Date | null;
}) {
  return prisma.socialMediaMetrics.create({ data: input });
}

/* READ ALL: return all SocialMediaMetrics records */
export async function getAllSocialMediaMetrics() {
  return prisma.socialMediaMetrics.findMany({
    include: { socialMedia: true }, // optional: includes linked social media info
  });
}

/* READ BY SOCIAL MEDIA ID: get all metrics for a specific social media record */
export async function getMetricsBySocialMediaId(socialMediaId: string) {
  return prisma.socialMediaMetrics.findMany({
    where: { socialMediaId },
    orderBy: { lastSynced: "desc" },
  });
}

/* UPDATE: update fields on a SocialMediaMetrics record by ID */
export async function updateSocialMediaMetric(
  id: string,
  data: Partial<{
    metricName: Metric;
    metricValue: number;
    lastSynced: Date | null;
  }>
) {
  return prisma.socialMediaMetrics.update({
    where: { id },
    data,
  });
}

/* DELETE: delete a SocialMediaMetrics record by ID */
export async function deleteSocialMediaMetric(id: string) {
  return prisma.socialMediaMetrics.delete({
    where: { id },
  });
}

/* Optional helper for test scripts */
export async function closePrisma() {
  await prisma.$disconnect();
}
