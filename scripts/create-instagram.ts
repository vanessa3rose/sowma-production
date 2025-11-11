import { PrismaClient, Metric } from "../src/generated/prisma";

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
    return;
  }

  // Otherwise, create it
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

main()
  .catch((error) => {
    console.error("❌ Error creating Instagram entry:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
