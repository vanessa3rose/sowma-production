-- 20260205014605_add_constant_contact (fixed / idempotent)

-- 1) Ensure Role enum exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Role') THEN
    CREATE TYPE "Role" AS ENUM ('ADMIN', 'USER', 'VIEWER');
  END IF;
END $$;

-- 2) Add Metric enum values if they do not exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'Metric' AND e.enumlabel = 'BOUNCE_RATE'
  ) THEN
    ALTER TYPE "Metric" ADD VALUE 'BOUNCE_RATE';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'Metric' AND e.enumlabel = 'AVG_SESSION_DURATION'
  ) THEN
    ALTER TYPE "Metric" ADD VALUE 'AVG_SESSION_DURATION';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'Metric' AND e.enumlabel = 'PAGES_PER_SESSION'
  ) THEN
    ALTER TYPE "Metric" ADD VALUE 'PAGES_PER_SESSION';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'Metric' AND e.enumlabel = 'TOTAL_USERS'
  ) THEN
    ALTER TYPE "Metric" ADD VALUE 'TOTAL_USERS';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'Metric' AND e.enumlabel = 'DAYS_POSTED'
  ) THEN
    ALTER TYPE "Metric" ADD VALUE 'DAYS_POSTED';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'Metric' AND e.enumlabel = 'TOTAL_SESSIONS'
  ) THEN
    ALTER TYPE "Metric" ADD VALUE 'TOTAL_SESSIONS';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'Metric' AND e.enumlabel = 'ENGAGED_SESSIONS'
  ) THEN
    ALTER TYPE "Metric" ADD VALUE 'ENGAGED_SESSIONS';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'Metric' AND e.enumlabel = 'ENGAGEMENT_TIME'
  ) THEN
    ALTER TYPE "Metric" ADD VALUE 'ENGAGEMENT_TIME';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'Metric' AND e.enumlabel = 'SESSIONS_BY_SOURCE'
  ) THEN
    ALTER TYPE "Metric" ADD VALUE 'SESSIONS_BY_SOURCE';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'Metric' AND e.enumlabel = 'REACH'
  ) THEN
    ALTER TYPE "Metric" ADD VALUE 'REACH';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'Metric' AND e.enumlabel = 'TOTAL_INTERACTIONS'
  ) THEN
    ALTER TYPE "Metric" ADD VALUE 'TOTAL_INTERACTIONS';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'Metric' AND e.enumlabel = 'ENGAGED_DEMOGRAPHICS'
  ) THEN
    ALTER TYPE "Metric" ADD VALUE 'ENGAGED_DEMOGRAPHICS';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'Metric' AND e.enumlabel = 'EMAILS_SENT'
  ) THEN
    ALTER TYPE "Metric" ADD VALUE 'EMAILS_SENT';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'Metric' AND e.enumlabel = 'EMAILS_DELIVERED'
  ) THEN
    ALTER TYPE "Metric" ADD VALUE 'EMAILS_DELIVERED';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'Metric' AND e.enumlabel = 'EMAIL_OPENED'
  ) THEN
    ALTER TYPE "Metric" ADD VALUE 'EMAIL_OPENED';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'Metric' AND e.enumlabel = 'EMAILS_CLICKED'
  ) THEN
    ALTER TYPE "Metric" ADD VALUE 'EMAILS_CLICKED';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'Metric' AND e.enumlabel = 'EMAILS_UNSUBSCRIBED'
  ) THEN
    ALTER TYPE "Metric" ADD VALUE 'EMAILS_UNSUBSCRIBED';
  END IF;
END $$;

-- 3) Add Provider enum value if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'Provider' AND e.enumlabel = 'CONSTANT_CONTACT'
  ) THEN
    ALTER TYPE "Provider" ADD VALUE 'CONSTANT_CONTACT';
  END IF;
END $$;

-- 4) Add columns to SocialMediaMetrics if missing
ALTER TABLE "SocialMediaMetrics"
  ADD COLUMN IF NOT EXISTS "breakdownKey" TEXT,
  ADD COLUMN IF NOT EXISTS "breakdownValue" TEXT,
  ADD COLUMN IF NOT EXISTS "metricDate" TIMESTAMP(3);

-- 5) Create SocialMediaAuth table if missing
CREATE TABLE IF NOT EXISTS "SocialMediaAuth" (
  "id" TEXT NOT NULL,
  "socialMediaId" TEXT NOT NULL,
  "accessToken" TEXT NOT NULL,
  "refreshToken" TEXT,
  "expiresAt" TIMESTAMP(3),
  "refreshTokenExpiresAt" TIMESTAMP(3),
  "lastRefreshed" TIMESTAMP(3),
  CONSTRAINT "SocialMediaAuth_pkey" PRIMARY KEY ("id")
);

-- 6) Create User table if missing
CREATE TABLE IF NOT EXISTS "User" (
  "email" TEXT NOT NULL,
  "firstName" TEXT NOT NULL,
  "lastName" TEXT NOT NULL,
  "username" TEXT NOT NULL,
  "password" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "role" "Role" NOT NULL,
  "isWaitlisted" BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "User_pkey" PRIMARY KEY ("email")
);

-- 7) Create indexes if missing
CREATE UNIQUE INDEX IF NOT EXISTS "SocialMediaAuth_socialMediaId_key"
  ON "SocialMediaAuth"("socialMediaId");

CREATE UNIQUE INDEX IF NOT EXISTS "User_username_key"
  ON "User"("username");

-- 8) Add foreign key if missing (no IF NOT EXISTS support for ADD CONSTRAINT)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'SocialMediaAuth_socialMediaId_fkey'
  ) THEN
    ALTER TABLE "SocialMediaAuth"
      ADD CONSTRAINT "SocialMediaAuth_socialMediaId_fkey"
      FOREIGN KEY ("socialMediaId") REFERENCES "SocialMedia"("id")
      ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;
