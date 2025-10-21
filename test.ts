import { PrismaClient } from "./generated/prisma/index.js";

const prisma = new PrismaClient();

async function main() {
  try {
    // Fetch all SocialMedia entries
    const socialMedia = await prisma.socialMedia.findMany({
      include: { metrics: true }, // include related metrics
    });
    console.log("SocialMedia entries:", socialMedia);

    // Fetch all SocialMediaMetrics entries
    const metrics = await prisma.socialMediaMetrics.findMany({
      include: { socialMedia: true }, // include related SocialMedia
    });
    console.log("SocialMediaMetrics entries:", metrics);

    // Fetch all DatabaseReport entries
    const databaseReport = await prisma.databaseReport.findMany({
      include: { counts: true }, // include related counts
    });
    console.log("DatabaseReport entries:", databaseReport);

    // Fetch all DatabaseReportCounts entries
    const counts = await prisma.databaseReportCount.findMany({
      include: { report: true }, // include related DatabaseReport
    });
    console.log("DatabaseReportCount entries:", counts);
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
