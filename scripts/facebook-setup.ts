// Facebook setup. Note: will do nothing if Facebook already exists in the
// SocialMedia database - delete before running

import { createSocialMedia, closePrisma } from "../db/social-media";
import { PrismaClient } from "../src/generated/prisma";
const prisma = new PrismaClient();

async function main() {
  // Determine if the entry already exists
  const existing = await prisma.socialMedia.findFirst({
    where: {
      provider: "FACEBOOK",
      userId: "sowma",
    },
  });

  // If it exists, log to console
  if (existing) {
    console.log("✅ Facebook entry already exists — skipping creation.");
  }

  // Otherwise, create it
  else {
    await prisma.socialMedia.create({
      data: {
        provider: "FACEBOOK",
        userId: "219353138086907",
        username: "Schoolsonwheels",
        displayName: "School on Wheels of Massachusetts",
        profileUrl: "https://www.facebook.com/schoolonwheels/",
        email: "<optional-email>",
      },
    });
    console.log("🆕 Created new Facebook entry.");
  }
}

await main();
await prisma.$disconnect();
