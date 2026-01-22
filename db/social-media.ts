import { PrismaClient, Provider } from "../src/generated/prisma/index.js";

/* Reuse Prisma client in serverless */
const prisma = (globalThis as any).prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") (globalThis as any).prisma = prisma;

/* CREATE: create one SocialMedia record */
export async function createSocialMedia(input: {
  provider: Provider;
  userId: string;
  username: string;
  displayName?: string | null;
  profileUrl?: string | null;
  email?: string | null;
}) {
  return prisma.socialMedia.create({ data: input });
}

/* READ ALL: return all SocialMedia records */
export async function getAllSocialMedia() {
  return prisma.socialMedia.findMany();
}

/* UPDATE a SocialMedia record by ID */
export async function updateSocialMedia(
  id: string,
  data: Partial<{
    provider: Provider;
    userId: string;
    username: string;
    displayName: string | null;
    profileUrl: string | null;
    email: string | null;
  }>,
) {
  return prisma.socialMedia.update({ where: { id }, data });
}

/* DELETE a SocialMedia record by ID */
export async function deleteSocialMedia(id: string) {
  return prisma.socialMedia.delete({ where: { id } });
}