import { PrismaClient, Provider } from "../src/generated/prisma/index.js";

/**
 * Use globalThis to reuse Prisma in serverless environments
 */
const prisma = (globalThis as any).prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") (globalThis as any).prisma = prisma;

/**
 * Define all social media providers in ONE place
 */
const SOCIAL_MEDIA_CONFIG = [
  {
    provider: Provider.FACEBOOK,
    userId: "219353138086907",
    username: "Schoolsonwheels",
    displayName: "School on Wheels of Massachusetts",
    profileUrl: "https://www.facebook.com/schoolonwheels/",
    email: null,
  },
  {
    provider: Provider.INSTAGRAM,
    userId: "341520375",
    username: "schoolonwheels",
    displayName: "School on Wheels (Est. 1993)",
    profileUrl: null,
    email: null,
  },
  {
    provider: Provider.TWITTER,
    userId: "sowma",
    username: "SOWMA",
    displayName: "School on Wheels",
    profileUrl: "https://x.com/sowma",
    email: null,
  },
  {
    provider: Provider.GOOGLE_ANALYTICS,
    userId: "36325900",
    username: "SOWMA",
    displayName: "School on Wheels MA Analytics",
    profileUrl: "https://analytics.google.com/",
    email: null,
  },
  {
    provider: Provider.CONSTANT_CONTACT,
    userId: "123",
    username: "schoolonwheels",
    displayName: "School on Wheels Constant Contact",
    profileUrl: "https://www.constantcontact.com/",
    email: null,
  },
  {
    provider: Provider.LINKEDIN,
    userId: "1640840",
    username: "schoolonwheelsofmasschusetts",
    displayName: "School on Wheels of Massachusetts",
    profileUrl:
      "https://www.linkedin.com/company/schoolonwheelsofmasschusettss/",
    email: null,
  },
];

/**
 * Ensure a social media entry exists
 */
async function ensureSocialMediaExists(
  config: (typeof SOCIAL_MEDIA_CONFIG)[number],
) {
  const existing = await prisma.socialMedia.findFirst({
    where: {
      provider: config.provider,
      userId: config.userId,
    },
  });

  if (existing) {
    console.log(`${config.provider} already exists — skipping`);
    return;
  }

  await prisma.socialMedia.create({
    data: {
      provider: config.provider,
      userId: config.userId,
      username: config.username,
      displayName: config.displayName,
      profileUrl: config.profileUrl,
      email: config.email,
    },
  });

  console.log(`Created ${config.provider} entry`);
}

/**
 * Main runner
 */
async function main() {
  console.log("Syncing social media providers...\n");

  for (const config of SOCIAL_MEDIA_CONFIG) {
    await ensureSocialMediaExists(config);
  }

  console.log("\nSocial media setup complete");
}

main().catch((e) => {
  console.error("Error during social media setup:", e);
  process.exit(1);
});
