/*
  Warnings:

  - You are about to drop the `ReportCount` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."ReportCount" DROP CONSTRAINT "ReportCount_reportId_fkey";

-- DropTable
DROP TABLE "public"."ReportCount";

-- CreateTable
CREATE TABLE "public"."DatabaseReportCount" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "count" "public"."Count" NOT NULL,
    "value" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "DatabaseReportCount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DatabaseReportCount_reportId_count_key" ON "public"."DatabaseReportCount"("reportId", "count");

-- AddForeignKey
ALTER TABLE "public"."DatabaseReportCount" ADD CONSTRAINT "DatabaseReportCount_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "public"."DatabaseReport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
