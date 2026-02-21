// scripts/twitter-token-validate-db.ts
import "dotenv/config";
import fetch from "node-fetch";
import {
  getSocialMediaAuth,
  updateSocialMediaAuth,
} from "../../db/social-media-auth.js";

type Provider = "GOOGLE_ANALYTICS" | "INSTAGRAM" | "FACEBOOK" | "TWITTER";

type AuthRow = {
  id: string;
  socialMediaId: string;
  accessToken: string;
  refreshToken: string | null;
  expiresAt: Date | null;
  lastRefreshed: Date | null;
  socialMedia: { provider: Provider };
};

// How often to validate (health check cadence)
const VALIDATE_EVERY_MS = 7 * 24 * 60 * 60 * 1000; // weekly

function shouldValidate(rec: AuthRow, nowMs: number) {
  if (!rec.lastRefreshed) return true;
  return nowMs - rec.lastRefreshed.getTime() >= VALIDATE_EVERY_MS;
}

async function validateBearerToken(token: string, username: string) {
  const url = `https://api.twitter.com/2/users/by/username/${encodeURIComponent(
    username,
  )}?user.fields=public_metrics`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const text = await res.text();
  if (!res.ok) throw new Error(`Twitter API error ${res.status}: ${text}`);

  const json = JSON.parse(text);
  return {
    id: json?.data?.id as string | undefined,
    username: json?.data?.username as string | undefined,
  };
}

export default async function validateTwitterTokenDb(): Promise<number> {
  const rows: AuthRow[] = await getSocialMediaAuth();
  const twRows = rows.filter((r) => r.socialMedia.provider === "TWITTER");

  console.log(`[token][TW] found ${twRows.length} auth row(s)`);

  const username =
    process.env.TWITTER_VALIDATE_USERNAME?.trim() ||
    process.env.TWITTER_USERNAME?.trim() ||
    "TwitterDev"; // fallback

  const nowMs = Date.now();
  let validated = 0;

  for (const rec of twRows) {
    const shortId = rec.socialMediaId?.slice(0, 6) ?? "??????";
    if (!shouldValidate(rec, nowMs)) continue;

    if (!rec.accessToken) {
      console.warn(
        `[token][TW] ${shortId}… :: missing bearer token (needs manual set)`,
      );
      continue;
    }

    try {
      const info = await validateBearerToken(rec.accessToken, username);

      await updateSocialMediaAuth(rec.id, { lastRefreshed: new Date() });

      validated++;
      console.log(
        `[token][TW] ${shortId}… :: OK (validated via ${info.username ?? username}${info.id ? `, id=${info.id}` : ""})`,
      );
    } catch (err: any) {
      console.error(
        `[token][TW] ${shortId}… :: FAIL ${err?.message ?? String(err)}`,
      );

      // Optional: still update lastRefreshed to avoid spamming failures every run
      await updateSocialMediaAuth(rec.id, { lastRefreshed: new Date() });
    }
  }

  console.log(`[token][TW] validation complete (validated=${validated})`);
  return validated;
}

// CLI entrypoint
validateTwitterTokenDb().catch((e) => {
  console.error("[token][TW] fatal", e);
  process.exit(1);
});
