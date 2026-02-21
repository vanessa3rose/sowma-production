// scripts/token-refresh/constant-contact-refresh.ts
import "dotenv/config";
import fetch from "node-fetch";
import {
  getSocialMediaAuth,
  updateSocialMediaAuth,
} from "../../db/social-media-auth";

/**
 * Constant Contact refresh-token rotation script
 *
 * Refresh tokens expire every ~180 days.
 * We refresh on a slightly faster cadence to avoid expiration.
 *
 * Run:
 *   npx tsx -r dotenv/config scripts/token-refresh/constant-contact-refresh.ts
 */

type Provider =
  | "GOOGLE_ANALYTICS"
  | "INSTAGRAM"
  | "FACEBOOK"
  | "TWITTER"
  | "CONSTANT_CONTACT";

type AuthRow = {
  id: string;
  socialMediaId: string;
  accessToken: string;
  refreshToken: string | null;
  expiresAt: Date | null;
  refreshTokenExpiresAt: Date | null;
  lastRefreshed: Date | null;
  socialMedia: { provider: Provider };
};

const REFRESH_EVERY_MS = 150 * 24 * 60 * 60 * 1000; // 150 days
const EXPIRY_SOON_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function shouldRefresh(rec: AuthRow, nowMs: number) {
  if (!rec.refreshToken) return false;

  if (rec.accessToken === "" || !rec.expiresAt || !rec.refreshTokenExpiresAt)
    return true;

  const last = rec.lastRefreshed?.getTime() ?? 0;
  if (!last) return true;

  const refreshAgeMs = nowMs - last;
  if (refreshAgeMs >= REFRESH_EVERY_MS) return true;

  const expMs = rec.refreshTokenExpiresAt?.getTime();
  if (typeof expMs === "number" && expMs - nowMs <= EXPIRY_SOON_MS) {
    return true;
  }

  return false;
}

async function refreshConstantContact(rec: AuthRow) {
  if (!rec.refreshToken) return null;

  const clientId = process.env.CONSTANT_CONTACT_CLIENT_ID ?? "";
  const clientSecret = process.env.CONSTANT_CONTACT_CLIENT_SECRET ?? "";

  if (!clientId || !clientSecret) {
    throw new Error(
      "Missing CONSTANT_CONTACT_CLIENT_ID or CONSTANT_CONTACT_CLIENT_SECRET",
    );
  }

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: rec.refreshToken,
  });

  const res = await fetch(
    "https://authz.constantcontact.com/oauth2/default/v1/token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(
          `${clientId}:${clientSecret}`,
        ).toString("base64")}`,
      },
      body,
    },
  );

  const j = (await res.json()) as {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
    refresh_token_expires_in?: number;
  };

  if (!res.ok) {
    throw new Error(`[CC] refresh failed: ${res.status} ${JSON.stringify(j)}`);
  }

  const nowMs = Date.now();
  const accessToken = j.access_token ?? rec.accessToken;
  const refreshToken = j.refresh_token ?? rec.refreshToken;
  const expiresAt = j.expires_in
    ? new Date(nowMs + j.expires_in * 1000)
    : rec.expiresAt;

  let refreshTokenExpiresAt = rec.refreshTokenExpiresAt;
  if (j.refresh_token_expires_in) {
    refreshTokenExpiresAt = new Date(nowMs + j.refresh_token_expires_in * 1000);
  } else if (j.refresh_token) {
    // If server returns a new refresh token without expiry info, assume 180 days.
    refreshTokenExpiresAt = new Date(nowMs + 180 * 24 * 60 * 60 * 1000);
  }

  return { accessToken, refreshToken, expiresAt, refreshTokenExpiresAt };
}

export default async function refreshConstantContactRefreshTokens() {
  const rows: AuthRow[] = await getSocialMediaAuth();
  const ccRows = rows.filter(
    (r) => r.socialMedia.provider === "CONSTANT_CONTACT",
  );

  console.log(`[token][CC] found ${ccRows.length} auth row(s)`);

  const nowMs = Date.now();
  let refreshed = 0;

  for (const rec of ccRows) {
    const shortId = rec.socialMediaId?.slice(0, 6) ?? "??????";

    if (!rec.refreshToken) {
      console.warn(
        `[token][CC] ${shortId}... :: missing refresh token (needs manual OAuth)`,
      );
      continue;
    }

    if (!shouldRefresh(rec, nowMs)) continue;

    try {
      const updated = await refreshConstantContact(rec);
      if (!updated) continue;

      await updateSocialMediaAuth(rec.id, {
        accessToken: updated.accessToken,
        refreshToken: updated.refreshToken,
        expiresAt: updated.expiresAt ?? rec.expiresAt,
        refreshTokenExpiresAt:
          updated.refreshTokenExpiresAt ?? rec.refreshTokenExpiresAt,
        lastRefreshed: new Date(),
      });

      refreshed++;
      console.log(
        `[token][CC] ${shortId}... :: refreshed (refreshTokenExpiresAt=${updated.refreshTokenExpiresAt?.toISOString() ?? "n/a"})`,
      );
    } catch (err: any) {
      console.error(
        `[token][CC] ${shortId}... :: ERROR ${err?.message ?? String(err)}`,
      );
    }
  }

  console.log(`[token][CC] refresh complete (refreshed=${refreshed})`);
  return refreshed;
}

// CLI entrypoint (no fragile guard)
refreshConstantContactRefreshTokens().catch((e) => {
  console.error("[token][CC] fatal", e);
  process.exit(1);
});
