-- CreateEnum
CREATE TYPE "public"."Provider" AS ENUM ('FACEBOOK', 'INSTAGRAM', 'TIKTOK', 'LINKEDIN', 'TWITTER');

-- CreateEnum
CREATE TYPE "public"."Metric" AS ENUM ('FOLLOWERS', 'LIKES', 'SHARES', 'COMMENTS', 'VIEWS');

-- CreateTable
CREATE TABLE "public"."SocialMedia" (
    "id" TEXT NOT NULL,
    "provider" "public"."Provider" NOT NULL,
    "userId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "displayName" TEXT,
    "profileUrl" TEXT,
    "email" TEXT,

    CONSTRAINT "SocialMedia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SocialMediaMetrics" (
    "id" TEXT NOT NULL,
    "socialMediaId" TEXT NOT NULL,
    "metricName" "public"."Metric" NOT NULL,
    "metricValue" INTEGER NOT NULL,
    "lastSynced" TIMESTAMP(3),

    CONSTRAINT "SocialMediaMetrics_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."SocialMediaMetrics" ADD CONSTRAINT "SocialMediaMetrics_socialMediaId_fkey" FOREIGN KEY ("socialMediaId") REFERENCES "public"."SocialMedia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
