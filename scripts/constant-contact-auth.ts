import "dotenv/config";
import { PrismaClient, Provider } from "../src/generated/prisma/index.js";
import fetch from "node-fetch";

const prisma = new PrismaClient();

async function refreshAccessToken(refreshToken: string) {
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });

  const clientId = process.env.CONSTANT_CONTACT_CLIENT_ID ?? "";
  const clientSecret = process.env.CONSTANT_CONTACT_CLIENT_SECRET ?? "";
  if (!clientId || !clientSecret) throw new Error("Missing CC client id/secret");

  const res = await fetch("https://authz.constantcontact.com/oauth2/default/v1/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body,
  });

  const j = (await res.json()) as { access_token?: string; refresh_token?: string; expires_in?: number };
  if (!res.ok) throw new Error(`CC token refresh failed: ${res.status} ${JSON.stringify(j)}`);

  return {
    accessToken: j.access_token!,
    refreshToken: j.refresh_token ?? refreshToken,
    expiresAt: j.expires_in ? new Date(Date.now() + j.expires_in * 1000) : null,
  };
}

async function main() {
  const refreshToken = process.env.CONSTANT_CONTACT_REFRESH_TOKEN;
  if (!refreshToken) throw new Error("Missing CONSTANT_CONTACT_REFRESH_TOKEN in .env");

  // Find the SINGLE Constant Contact SocialMedia row
  const sm = await prisma.socialMedia.findFirst({
    where: { provider: Provider.CONSTANT_CONTACT },
  });

  if (!sm) {
    throw new Error(
      "No SocialMedia row found for Provider.CONSTANT_CONTACT. Run: npx tsx scripts/social-media-setup.ts",
    );
  }

  const tokens = await refreshAccessToken(refreshToken);

  // Upsert SocialMediaAuth for this row
  await prisma.socialMediaAuth.upsert({
    where: { socialMediaId: sm.id },
    update: {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: tokens.expiresAt,
      lastRefreshed: new Date(),
    },
    create: {
      socialMediaId: sm.id,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: tokens.expiresAt,
      lastRefreshed: new Date(),
    },
  });

  console.log("[CC] Seeded SocialMediaAuth successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
