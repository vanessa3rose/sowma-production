import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();

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
    include: { socialMedia: true }, // optional: includes linked social media info
  });
}

//return all the table
export async function getSocialMediaAuth() {
  return prisma.socialMediaAuth.findMany({
    include: { socialMedia: true }, // optional: includes linked social media info
  });
}

/* READ BY SOCIAL MEDIA ID: get all metrics for a specific social media record */
export async function getAuthBySocialMediaId(socialMediaId: string) {
  return prisma.socialMediaAuth.findUnique({
    where: { socialMediaId },
    include: { socialMedia: true },
  });
}

/* UPDATE: update fields on a SocialMediaAuth record by ID */
export async function updateSocialMediaAuth(
  id: string,
  data: Partial<{
    accessToken: string;
    refreshToken: string | null;
    expiresAt: Date | null;
    lastRefreshed: Date | null;
  }>,
) {
  return prisma.socialMediaAuth.update({
    where: { id },
    data,
  });
}

/* DELETE: delete a SocialMediaAuth record by ID */
export async function deleteSocialMediaAuth(id: string) {
  return prisma.socialMediaAuth.delete({
    where: { id },
  });
}

/* Optional helper for test scripts */
export async function closePrisma() {
  await prisma.$disconnect();
}
