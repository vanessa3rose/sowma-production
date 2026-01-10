import {
  createDatabaseReport,
  readDatabaseReport,
  updateDatabaseReport,
  deleteDatabaseReport,
} from "../database-report";
import { PrismaClient, Count } from "../../src/generated/prisma/index.js";
const prisma = new PrismaClient();

async function main() {
  const newReport = await createDatabaseReport(new Date(), [
    { count: Count.ATTENDED_EVENT, value: 10 },
    { count: Count.SOCIAL_MEDIA, value: 5 },
  ]);
  console.log("Created Report:\n", newReport);

  const allReports = await readDatabaseReport();
  console.log(`Read ${allReports.length} report(s)\n`, allReports);

  const updatedReport = await updateDatabaseReport(newReport.id, undefined, [
    { count: Count.ATTENDED_EVENT, value: 15 },
    { count: Count.SOCIAL_MEDIA, value: 8 },
  ]);
  console.log("Updated Report: \n", updatedReport);

  const deletedReport = await deleteDatabaseReport(newReport.id);
  console.log("Deleted Report:\n", deletedReport);
}

main().finally(async () => {
  await prisma.$disconnect();
});
