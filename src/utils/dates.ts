import { PrismaClient } from "../generated/prisma/index.js";

// Reuse Prisma client in serverless
const prisma = (globalThis as any).prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") (globalThis as any).prisma = prisma;

export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

export function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setUTCHours(23, 59, 59, 999);
  return d;
}

export function formatISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function toUnixTimestamp(date: Date): number {
  return Math.floor(date.getTime() / 1000);
}

export function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

// Check if metrics exist for a specific day
export async function metricsExistForDay(
  socialMediaId: string,
  date: Date,
): Promise<boolean> {
  const existing = await prisma.socialMediaMetrics.findFirst({
    where: {
      socialMediaId,
      metricDate: {
        gte: startOfDay(date),
        lt: endOfDay(date),
      },
    },
  });

  return existing !== null;
}
