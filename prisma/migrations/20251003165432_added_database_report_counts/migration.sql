-- CreateEnum
CREATE TYPE "public"."Count" AS ENUM ('ATTENDED_EVENT', 'COMMUNITY_VOLUNTEER', 'CORPORATE_VOLUNTEER', 'GOOGLE_SEARCH', 'HEARD_SOWMA_SPEAKER', 'NEWS_MEDIA', 'OTHER', 'REFERRAL', 'SCHOOL_VOLUNTEER', 'SOCIAL_MEDIA', 'WEBSITE');

-- CreateTable
CREATE TABLE "public"."DatabaseReport" (
    "id" TEXT NOT NULL,
    "reportDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DatabaseReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ReportCount" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "count" "public"."Count" NOT NULL,
    "value" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ReportCount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ReportCount_reportId_count_key" ON "public"."ReportCount"("reportId", "count");

-- AddForeignKey
ALTER TABLE "public"."ReportCount" ADD CONSTRAINT "ReportCount_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "public"."DatabaseReport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
