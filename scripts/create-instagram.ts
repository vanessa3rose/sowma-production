import { PrismaClient, Metric } from "../src/generated/prisma";

const prisma = new PrismaClient();

async function main() {
  // Determine if the entry already exists
  const existing = await prisma.socialMedia.findFirst({
    where: {
      provider: "INSTAGRAM",
      userId: "17841403650617063", // ← CHANGED to Business ID
    },
  });

  if (existing) {
    console.log("✅ Instagram entry already exists — skipping creation.");
    return;
  }

  // Otherwise, create it
  await prisma.socialMedia.create({
    data: {
      provider: "INSTAGRAM",
      userId: "17841403650617063", // ← CHANGED to Business ID
      username: "schoolonwheels",
      displayName: "School on Wheels (Est. 1993)",
      profileUrl: "https://www.instagram.com/schoolonwheels",
      email: null,
    },
  });
  console.log("✅ Instagram entry created successfully.");
}

main()
  .catch((error) => {
    console.error("❌ Error creating Instagram entry:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
