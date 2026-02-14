import "dotenv/config";
import { PrismaClient, Provider } from "../../src/generated/prisma/index.js";

const prisma = new PrismaClient();

async function migrateTwitterToken() {
  const twitterToken = process.env.TWITTER_BEARER_TOKEN;
  if (!twitterToken) {
    console.error("Missing TWITTER_BEARER_TOKEN in .env");
    process.exit(1);
  }

  // Find the SocialMedia row for TWITTER
  const twitterSocial = await prisma.socialMedia.findFirst({
    where: { provider: Provider.TWITTER },
  });

  if (!twitterSocial) {
    console.error(
      "No SocialMedia row found for provider=TWITTER. Create it first!",
    );
    process.exit(1);
  }

  // Upsert the SocialMediaAuth row
  const existingAuth = await prisma.socialMediaAuth.findUnique({
    where: { socialMediaId: twitterSocial.id },
  });

  if (existingAuth) {
    console.log(
      `Updating existing SocialMediaAuth for TWITTER (id=${existingAuth.id})`,
    );
    await prisma.socialMediaAuth.update({
      where: { id: existingAuth.id },
      data: {
        accessToken: twitterToken,
        lastRefreshed: new Date(),
      },
    });
  } else {
    console.log(`Creating new SocialMediaAuth for TWITTER`);
    await prisma.socialMediaAuth.create({
      data: {
        socialMediaId: twitterSocial.id,
        accessToken: twitterToken,
        lastRefreshed: new Date(),
      },
    });
  }

  console.log("Twitter bearer token migrated to DB successfully!");
  process.exit(0);
}

migrateTwitterToken().catch((e) => {
  console.error("Fatal error:", e);
  process.exit(1);
});
