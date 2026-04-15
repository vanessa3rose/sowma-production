import { PrismaClient } from "../src/generated/prisma/index.js";

export function getDatabaseUrl(): string | null {
  const raw = String(process.env.DATABASE_URL ?? "").trim();
  if (!raw) return null;

  // Some local env loaders preserve wrapping quotes.
  const unwrapped = raw.replace(/^['"]|['"]$/g, "");
  return unwrapped || null;
}

export function hasValidDatabaseUrl() {
  const url = getDatabaseUrl();
  return !!url && /^(postgresql|postgres):\/\//i.test(url);
}

export function createPrismaClient() {
  return new PrismaClient(
    hasValidDatabaseUrl()
      ? {
          datasources: {
            db: { url: getDatabaseUrl() as string },
          },
        }
      : undefined,
  );
}
