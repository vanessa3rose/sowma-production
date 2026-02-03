import "dotenv/config";
import fetch from "node-fetch";
import {
  getSocialMediaAuth,
  updateSocialMediaAuth,
} from "../../db/social-media-auth";

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

// GA refresh window: refresh if expiring in <= 5 minutes
const GA_REFRESH_WINDOW_MS = 5 * 60 * 1000;

// Fallback if expiresAt is missing: don’t refresh more often than every 30 minutes.
// (Prevents the “expiresAt=null but lastRefreshed set => never refresh again” dead zone.)
const GA_FALLBACK_REFRESH_EVERY_MS = 30 * 60 * 1000;

export default async function refreshGoogleTokens(): Promise<number> {
  const rows: AuthRow[] = await getSocialMediaAuth();
  const gaRows = rows.filter((r) => r.socialMedia.provider === "GOOGLE_ANALYTICS");

  console.log(`[token][GA] found ${gaRows.length} auth row(s)`);

  const nowMs = Date.now();
  let updatedCount = 0;

  for (const rec of gaRows) {
    const shortId = rec.socialMediaId?.slice(0, 6) ?? "??????";

    // ----- Decide if we should refresh -----
    const expMs = rec.expiresAt?.getTime();
    const hasExpiry = typeof expMs === "number";
    const expiringSoon = hasExpiry ? expMs - nowMs <= GA_REFRESH_WINDOW_MS : false;

    const lastMs = rec.lastRefreshed?.getTime() ?? 0;
    const dueByFallback = !hasExpiry && (nowMs - lastMs >= GA_FALLBACK_REFRESH_EVERY_MS);

    const shouldRefresh = (hasExpiry && expiringSoon) || (!hasExpiry && (rec.lastRefreshed == null || dueByFallback));

    if (!shouldRefresh) {
      // Optional: keep this log if you want high observability during manual tests
      // console.log(`[token][GA] ${shortId}… :: skip (expiresAt=${rec.expiresAt?.toISOString() ?? "n/a"})`);
      continue;
    }

    // ----- Pre-flight checks -----
    if (!rec.refreshToken) {
      console.warn(`[token][GA] ${shortId}… :: missing refresh token (needs manual auth)`);
      continue;
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      console.warn(
        `[token][GA] ${shortId}… :: missing GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET (skip)`,
      );
      continue;
    }

    // ----- Refresh -----
    try {
      const updated = await refreshGoogleAnalytics(rec, clientId, clientSecret);
      if (!updated) {
        console.warn(`[token][GA] ${shortId}… :: no-change/needs-manual-auth`);
        continue;
      }

      await updateSocialMediaAuth(rec.id, {
        accessToken: updated.accessToken ?? rec.accessToken,
        refreshToken: updated.refreshToken ?? rec.refreshToken,
        expiresAt: updated.expiresAt ?? rec.expiresAt,
        lastRefreshed: new Date(),
      });

      updatedCount++;
      console.log(
        `[token][GA] ${shortId}… :: updated (expiresAt=${(updated.expiresAt ?? rec.expiresAt)?.toISOString() ?? "n/a"})`,
      );
    } catch (err: any) {
      console.error(
        `[token][GA] ${shortId}… :: ERROR ${err?.message ?? String(err)}`,
      );
    }
  }

  console.log(`[token][GA] refresh run complete (updated=${updatedCount})`);
  return updatedCount;
}

async function refreshGoogleAnalytics(
  rec: AuthRow,
  clientId: string,
  clientSecret: string,
) {
  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "refresh_token",
    refresh_token: rec.refreshToken ?? "",
  });

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  const j = (await res.json()) as {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
    error?: string;
    error_description?: string;
  };

  if (!res.ok) {
    throw new Error(`GA refresh failed: ${res.status} ${JSON.stringify(j)}`);
  }

  return {
    accessToken: j.access_token ?? rec.accessToken,
    refreshToken: j.refresh_token ?? rec.refreshToken,
    expiresAt: j.expires_in ? new Date(Date.now() + j.expires_in * 1000) : rec.expiresAt,
  };
}

/**
 * CLI entrypoint:
 *   npx tsx -r dotenv/config scripts/google-token-refresh.ts
 */
if (process.argv[1]?.includes("google-token-refresh")) {
  refreshGoogleTokens()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("[token][GA] fatal", err);
      process.exit(1);
    });
}