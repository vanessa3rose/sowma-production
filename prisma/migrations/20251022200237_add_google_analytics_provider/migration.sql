-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


--ALTER TYPE "public"."Metric" ADD VALUE 'POSTS';
ALTER TYPE "public"."Metric" ADD VALUE 'ACTIVE_USERS';
ALTER TYPE "public"."Metric" ADD VALUE 'SCREEN_PAGE_VIEWS';
ALTER TYPE "public"."Metric" ADD VALUE 'ACTIVE_7_DAY_USERS';
ALTER TYPE "public"."Metric" ADD VALUE 'ENGAGEMENT_RATE';
ALTER TYPE "public"."Metric" ADD VALUE 'NEW_USERS';

-- AlterEnum
ALTER TYPE "public"."Provider" ADD VALUE 'GOOGLE_ANALYTICS';
