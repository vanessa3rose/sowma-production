//google-analytics-setup.ts

import { createSocialMedia, closePrisma } from "../db/social-media";
import { PrismaClient, Provider } from "../src/generated/prisma";

const prisma = new PrismaClient();

async function main(){
  await createSocialMedia({
    provider: Provider.GOOGLE_ANALYTICS,
    userId: "36325900",
    username: "SOWMA",
    displayName: "School on Wheels MA Analytics",
    profileUrl: "https://analytics.google.com/",
    email: "",
  });
  console.log("Added Google Analytics as Social Media provider")
  await closePrisma();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});

//npx tsx scripts/google-analytics-setup.ts
