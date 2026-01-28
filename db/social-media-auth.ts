import { PrismaClient } from "../src/generated/prisma/index.js";

/* Reuse Prisma client in serverless */
const prisma = (globalThis as any).prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") (globalThis as any).prisma = prisma;

/* CREATE: create one SocialMediaAuth record */
export async function createSocialMediaAuth(input: {
  socialMediaId: string;
  accessToken: string;
  refreshToken: string | null;
  expiresAt: Date | null;
  lastRefreshed: Date | null;
}) {
  return prisma.socialMediaAuth.create({ data: input });
}

/* READ ALL: return specific SocialMediaAuth records */
export async function getSocialMediaAuthString(id: string) {
  return prisma.socialMediaAuth.findUnique({
    where: { id },
    include: { socialMedia: true },
  });
}

/* READ ALL: return all SocialMediaAuth records */
export async function getSocialMediaAuth() {
  return prisma.socialMediaAuth.findMany({
    include: { socialMedia: true },
  });
}

/* READ BY SOCIAL MEDIA ID: get a specific auth record */
export async function getAuthBySocialMediaId(socialMediaId: string) {
  return prisma.socialMediaAuth.findUnique({
    where: { socialMediaId },
    include: { socialMedia: true },
  });
}

/* UPDATE a SocialMediaAuth record by ID */
export async function updateSocialMediaAuth(
  id: string,
  data: Partial<{
    accessToken: string;
    refreshToken: string | null;
    expiresAt: Date | null;
    lastRefreshed: Date | null;
  }>,
) {
  return prisma.socialMediaAuth.update({ where: { id }, data });
}

/* DELETE a SocialMediaAuth record by ID */
export async function deleteSocialMediaAuth(id: string) {
  return prisma.socialMediaAuth.delete({ where: { id } });
}
