// Twitter setup. Note: will do nothing if Twitter already exists in the
// SocialMedia database - delete before running

import { createSocialMedia, closePrisma } from "../db/social-media";
import { PrismaClient } from "../src/generated/prisma";
const prisma = new PrismaClient();

async function main() {
  // Determine if the entry already exists
  const existing = await prisma.socialMedia.findFirst({
    where: {
      provider: "TWITTER",
      userId: "sowma",
    },
  });

  // If it exists, log to console
  if (existing) {
    console.log("✅ Twitter entry already exists — skipping creation.");
  }

  // Otherwise, create it
  else {
    await prisma.socialMedia.create({
      data: {
        provider: "TWITTER",
        userId: "sowma",
        username: "SOWMA",
        displayName: "School on Wheels",
        profileUrl: "https://x.com/sowma",
        email: "<optional-email>",
      },
    });
    console.log("🆕 Created new Twitter entry.");
  }
}

await main();
await prisma.$disconnect();
