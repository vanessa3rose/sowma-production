import { PrismaClient, Provider } from "./src/generated/prisma/index.js";
import "dotenv/config";

const prisma = new PrismaClient();

async function main() {
  // Get the last 3 dates for unique opens and total opens to compare
  const metrics = await prisma.socialMediaMetrics.findMany({
    where: {
      metricName: { in: ["EMAIL_UNIQUE_OPENS", "EMAIL_TOTAL_OPENS", "EMAIL_UNIQUE_CLICKS", "EMAIL_TOTAL_CLICKS"] },
      SocialMedia: { provider: Provider.CONSTANT_CONTACT },
    },
    orderBy: { metricDate: "desc" },
    take: 20,
    select: { metricName: true, metricValue: true, metricDate: true, lastSynced: true },
  });

  for (const m of metrics) {
    console.log(`${m.metricName}: metricDate=${m.metricDate?.toISOString()} lastSynced=${m.lastSynced?.toISOString()} value=${m.metricValue}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
