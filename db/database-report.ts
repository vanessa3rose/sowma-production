// CREATE for DatabaseReport
import { PrismaClient, Count } from "../src/generated/prisma";

const prisma = new PrismaClient();

export async function createDatabaseReport(reportDate: Date, counts: { count: Count; value: number }[]) {
  try {  
  const report = await prisma.databaseReport.create({
      data: {
        reportDate,
        counts: {
          create: counts.map((c) => ({
            count: c.count,
            value: c.value,
          })),
        },
      },
      include: { counts: true },
    });
    return report;
  }
  catch (error){
    console.log("Error:", error);
    throw error;
  }
  
}

// READ for DatabaseReport function
export async function readDatabaseReport() {
  try {
    const reports = await prisma.databaseReport.findMany({
      include: { counts: true },
      orderBy: { reportDate: 'desc'},
    });
    return reports;
  }
  catch (error){
    console.log("Error:", error);
    throw error;
  }
}

//UPDATE for DatabaseReport
export async function updateDatabaseReport(id: string, reportDate?: Date, counts?: {count: Count; value: number}[]){
  try {
    const updateReport = await prisma.databaseReport.update({
      where: {id},
      data: {
        ...(reportDate ? {reportDate} : {}),
        ...(counts
          ? {
            counts: {
              upsert: counts.map((c)=>({
                where: { reportId_count: {reportId: id, count: c.count}},
                update: { value: c.value }, 
                create: { count: c.count, value : c.value},
              })),
            },
          }
          : {}),
        },
        include: {counts: true},
    });
    return updateReport;
  }
  catch (error) {
    console.log("Error:", error);
    throw error;
  }
}

// DELETE for DatabaseReport
export async function deleteDatabaseReport(id: string) {
  try {
    await prisma.databaseReportCount.deleteMany({
      where: { reportId: id },
    });
    const deletedReport = prisma.databaseReport.delete({where: {id}});
    return deletedReport;
  }
  catch (error) {
    console.log("Error:", error);
    throw error;
  }
}
