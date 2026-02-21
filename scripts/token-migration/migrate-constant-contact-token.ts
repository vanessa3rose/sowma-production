import "dotenv/config";
import { PrismaClient, Provider } from "../../src/generated/prisma/index.js";
import refreshConstantContactTokens from "../token-refresh/constant-contact-refresh.js";

const prisma = new PrismaClient();

async function migrateConstantContactToken() {
  const ccToken = process.env.CONSTANT_CONTACT_REFRESH_TOKEN;
  if (!ccToken) {
    console.error("Missing CONSTANT_CONTACT_REFRESH_TOKEN in .env");
    process.exit(1);
  }

  // Find the SocialMedia row for CONSTANT_CONTACT
  const ccSocial = await prisma.socialMedia.findFirst({
    where: { provider: Provider.CONSTANT_CONTACT },
  });

  if (!ccSocial) {
    console.error(
      "No SocialMedia row found for provider=CONSTANT_CONTACT. Create it first!",
    );
    process.exit(1);
  }

  // Upsert the SocialMediaAuth row
  const existingAuth = await prisma.socialMediaAuth.findUnique({
    where: { socialMediaId: ccSocial.id },
  });

  if (existingAuth) {
    console.log(
      `Updating existing SocialMediaAuth for CONSTANT_CONTACT (id=${existingAuth.id})`,
    );
    await prisma.socialMediaAuth.update({
      where: { id: existingAuth.id },
      data: {
        accessToken: existingAuth.accessToken ?? "", // required field
        refreshToken: ccToken,
        lastRefreshed: new Date(),
      },
    });
  } else {
    console.log(`Creating new SocialMediaAuth for CONSTANT_CONTACT`);
    await prisma.socialMediaAuth.create({
      data: {
        socialMediaId: ccSocial.id,
        accessToken: "", // placeholder so Prisma is happy
        refreshToken: ccToken,
        lastRefreshed: new Date(),
      },
    });
  }

  console.log("Constant Contact refresh token migrated to DB successfully!");

  // Immediately refresh to generate a new access token
  console.log("[CC] Refreshing access token...");
  const refreshedCount = await refreshConstantContactTokens();
  console.log(`[CC] Refresh complete. Tokens refreshed: ${refreshedCount}`);

  await prisma.$disconnect();
  process.exit(0);
}

migrateConstantContactToken().catch(async (e) => {
  console.error("Fatal error:", e);
  await prisma.$disconnect();
  process.exit(1);
});
