import { PrismaClient } from "../src/generated/prisma/index.js";
import "dotenv/config";

const prisma = new PrismaClient();

async function findDuplicateMetrics() {
  console.log("[DUPLICATE CHECK] Starting...");

  // fetch all metrics grouped by socialMediaId, metricDate, metricName
  const duplicates = await prisma.$queryRaw<
    {
      socialMediaId: string;
      metricName: string;
      metricDate: Date;
      breakdownValue: string | null;
      count: number;
    }[]
  >`
    SELECT 
      "socialMediaId", 
      "metricName", 
      "metricDate", 
      "breakdownValue",
      COUNT(*) as count
    FROM "SocialMediaMetrics"
    WHERE "metricDate" IS NOT NULL
    GROUP BY "socialMediaId", "metricName", "metricDate", "breakdownValue"
    HAVING COUNT(*) > 1
    ORDER BY "metricDate" DESC, "socialMediaId", "metricName", "breakdownValue"
  `;

  if (duplicates.length === 0) {
    console.log("[DUPLICATE CHECK] No duplicates found!");
    return;
  }

  console.log(
    `[DUPLICATE CHECK] Found ${duplicates.length} duplicate metric sets:\n`,
  );

  duplicates.forEach((dup: any) => {
    const dateStr = dup.metricDate ? dup.metricDate.toISOString() : "NULL";

    console.log(
      `SocialMediaId: ${dup.socialMediaId}, Metric: ${dup.metricName}, Date: ${dateStr}, Count: ${dup.count}`,
    );
  });
}

(async () => {
  try {
    await findDuplicateMetrics();
  } catch (err) {
    console.error("[DUPLICATE CHECK] Error:", err);
  } finally {
    await prisma.$disconnect();
  }
})();
