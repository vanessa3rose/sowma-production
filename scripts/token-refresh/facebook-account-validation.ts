// scripts/meta-page-token-validate.ts
import "dotenv/config";
import fetch from "node-fetch";
import { getSocialMediaAuth, updateSocialMediaAuth } from "../../db/social-media-auth";

/**
 * Meta (Facebook Page Token) validation script — Setup A
 *
 * Setup A:
 * - We store ONE shared Meta Page token in the DB under the FACEBOOK provider row
 *   because SocialMediaAuth.accessToken is unique (so we cannot duplicate the same token
 *   across both FACEBOOK and INSTAGRAM rows).
 * - Instagram Business/Graph + Facebook Graph calls both use this same Page token.
 *
 * What this script does:
 * - Finds the FACEBOOK SocialMediaAuth row
 * - Validates its accessToken using Graph API debug_token
 * - Writes expiresAt (if provided) + lastRefreshed back to DB
 *
 * Run:
 *   npx tsx -r dotenv/config scripts/meta-page-token-validate.ts
 */

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

const VALIDATE_EVERY_MS = 7 * 24 * 60 * 60 * 1000; // weekly

function getFacebookAppCreds() {
  // Support both naming schemes
  const appId = process.env.FACEBOOK_APP_ID ?? process.env.FB_APP_ID;
  const appSecret = process.env.FACEBOOK_APP_SECRET ?? process.env.FB_APP_SECRET;
  return { appId, appSecret };
}

async function debugToken(inputToken: string, appId: string, appSecret: string) {
  const url = new URL("https://graph.facebook.com/debug_token");
  url.searchParams.set("input_token", inputToken);
  url.searchParams.set("access_token", `${appId}|${appSecret}`);

  const res = await fetch(url.toString());
  const j = (await res.json()) as {
    data?: {
      is_valid?: boolean;
      expires_at?: number;
      type?: string;
      scopes?: string[];
    };
    error?: any;
  };

  if (!res.ok) {
    throw new Error(`debug_token failed: ${res.status} ${JSON.stringify(j)}`);
  }

  const isValid = j.data?.is_valid === true;
  const expSec = j.data?.expires_at;

  return {
    isValid,
    expiresAt: expSec ? new Date(expSec * 1000) : null,
    tokenType: j.data?.type ?? null,
    scopes: j.data?.scopes ?? null,
  };
}

function shouldValidate(rec: AuthRow, nowMs: number) {
  if (!rec.lastRefreshed) return true;
  return nowMs - rec.lastRefreshed.getTime() >= VALIDATE_EVERY_MS;
}

export default async function validateMetaPageToken(): Promise<number> {
  const { appId, appSecret } = getFacebookAppCreds();
  if (!appId || !appSecret) {
    console.warn(
      `[token][META] missing FACEBOOK_APP_ID/FACEBOOK_APP_SECRET (or FB_APP_ID/FB_APP_SECRET). Skipping.`,
    );
    return 0;
  }

  const rows: AuthRow[] = await getSocialMediaAuth();
  const fbRows = rows.filter((r) => r.socialMedia.provider === "FACEBOOK");

  console.log(`[token][META] found ${fbRows.length} FACEBOOK auth row(s)`);

  const nowMs = Date.now();
  let validated = 0;

  for (const rec of fbRows) {
    const shortId = rec.socialMediaId?.slice(0, 6) ?? "??????";

    if (!shouldValidate(rec, nowMs)) continue;

    if (!rec.accessToken) {
      console.warn(`[token][META] ${shortId}… :: missing page token (needs manual auth)`);
      continue;
    }

    try {
      const info = await debugToken(rec.accessToken, appId, appSecret);

      if (!info.isValid) {
        console.error(`[token][META] ${shortId}… :: token INVALID (needs manual re-auth)`);
        // still update lastRefreshed to avoid spamming
        await updateSocialMediaAuth(rec.id, { lastRefreshed: new Date() });
        continue;
      }

      await updateSocialMediaAuth(rec.id, {
        expiresAt: info.expiresAt ?? rec.expiresAt,
        lastRefreshed: new Date(),
      });

      validated++;
      console.log(
        `[token][META] ${shortId}… :: valid (covers FB + IG) (expiresAt=${(info.expiresAt ?? rec.expiresAt)?.toISOString() ?? "n/a"})`,
      );
    } catch (err: any) {
      console.error(`[token][META] ${shortId}… :: ERROR ${err?.message ?? String(err)}`);
    }
  }

  console.log(`[token][META] validation complete (validated=${validated})`);
  return validated;
}

// CLI entrypoint (no fragile guard)
validateMetaPageToken().catch((e) => {
  console.error("[token][META] fatal", e);
  process.exit(1);
});