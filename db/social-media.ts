import { PrismaClient, Provider } from "../src/generated/prisma";

const prisma = new PrismaClient();

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

/* UPDATE: update fields on a SocialMedia record by ID */
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
  return prisma.socialMedia.update({
    where: { id },
    data,
  });
}

/* DELETE: delete a SocialMedia record by ID */
export async function deleteSocialMedia(id: string) {
  return prisma.socialMedia.delete({ where: { id } });
}

/* Optional helper for test scripts */
export async function closePrisma() {
  await prisma.$disconnect();
}
