-- Add firstName and lastName to Waitlist (from 20260226201500_add_waitlist_names)
ALTER TABLE "Waitlist" ADD COLUMN IF NOT EXISTS "firstName" TEXT;
ALTER TABLE "Waitlist" ADD COLUMN IF NOT EXISTS "lastName" TEXT;

-- Add VIDEO_VIEWS and WEBSITE_CLICKS to Metric enum (from 20260304222514_add_video_views_website_clicks)
ALTER TYPE "Metric" ADD VALUE IF NOT EXISTS 'VIDEO_VIEWS';
ALTER TYPE "Metric" ADD VALUE IF NOT EXISTS 'WEBSITE_CLICKS';
