import "dotenv/config";
import { PrismaClient, Provider } from "../../src/generated/prisma/index.js";

const prisma = new PrismaClient();

async function migrateFacebookToken() {
  const fbToken = process.env.FACEBOOK_PAGE_TOKEN;
  if (!fbToken) {
    console.error("Missing FACEBOOK_PAGE_TOKEN in .env");
    process.exit(1);
  }

  // Find the SocialMedia row for FACEBOOK
  const fbSocial = await prisma.socialMedia.findFirst({
    where: { provider: Provider.FACEBOOK },
  });

  if (!fbSocial) {
    console.error(
      "No SocialMedia row found for provider=FACEBOOK. Create it first!",
    );
    process.exit(1);
  }

  // Upsert the SocialMediaAuth row
  const existingAuth = await prisma.socialMediaAuth.findUnique({
    where: { socialMediaId: fbSocial.id },
  });

  if (existingAuth) {
    console.log(
      `Updating existing SocialMediaAuth for FACEBOOK (id=${existingAuth.id})`,
    );
    await prisma.socialMediaAuth.update({
      where: { id: existingAuth.id },
      data: {
        accessToken: fbToken,
        lastRefreshed: new Date(),
      },
    });
  } else {
    console.log(`Creating new SocialMediaAuth for FACEBOOK`);
    await prisma.socialMediaAuth.create({
      data: {
        socialMediaId: fbSocial.id,
        accessToken: fbToken,
        lastRefreshed: new Date(),
      },
    });
  }

  console.log("Facebook Page token migrated to DB successfully!");
  process.exit(0);
}

migrateFacebookToken().catch((e) => {
  console.error("Fatal error:", e);
  process.exit(1);
});
