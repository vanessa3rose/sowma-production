// import { PrismaClient } from "../src/generated/prisma/";
import { PrismaClient, Metric } from "../src/generated/prisma";
import { createSocialMedia, closePrisma } from "../db/social-media";

const prisma = new PrismaClient();
async function main() {
  // Determine if the entry already exists

  const existing = await prisma.socialMedia.findFirst({
    where: {
      provider: "INSTAGRAM",
      userId: "341520375",
    },
  });

  if (existing) {
    console.log("✅ Instagram entry already exists — skipping creation.");
  }

  // Otherwise, create it
  else {
    await prisma.socialMedia.create({
      data: {
        provider: "INSTAGRAM",
        userId: "341520375",
        username: "schoolonwheels",
        displayName: "School on Wheels (Est. 1993)",
        profileUrl: null,
        email: null,
      },
    });
    console.log("✅ Instagram entry created successfully.");
  }
}
await main();
await prisma.$disconnect();
