// apis: meta, instagram, tiktok, linkedin, twitter, google analytics
import cron from "node-cron";
import fetch from "node-fetch";
import {
  updateSocialMediaAuth,
  getSocialMediaAuth,
} from "../db/social-media-auth";

export type Provider =
  | "GOOGLE_ANALYTICS"
  | "INSTAGRAM"
  | "FACEBOOK"
  | "TWITTER"
  | "LINKEDIN"
  | "TIKTOK";

export const REFRESH_STRATEGY: Record<
  Provider,
  "refresh" | "validate" | "static"
> = {
  GOOGLE_ANALYTICS: "refresh",
  INSTAGRAM: "refresh",
  FACEBOOK: "validate", // non-expiring, but validate
  TWITTER: "refresh",
  LINKEDIN: "refresh",
  TIKTOK: "refresh",
};
//check these numbers
const REFRESH_WINDOW_MS: Record<Provider, number> = {
  GOOGLE_ANALYTICS: 5 * 60 * 1000, // 5 minutes before expiry (access ~1h)  ← GA/Google OAuth
  TWITTER: 10 * 60 * 1000, // 10 minutes before expiry (access ~2h) ← X/Twitter
  TIKTOK: 60 * 60 * 1000, // 1 hour before expiry (access ~24h)    ← TikTok
  INSTAGRAM: 3 * 24 * 60 * 60 * 1000, // 3 days before expiry (60 days)     ← Instagram Graph long-lived
  LINKEDIN: 3 * 24 * 60 * 60 * 1000, // 3 days before expiry (60 days)     ← LinkedIn
  FACEBOOK: 7 * 24 * 60 * 60 * 1000, // validate weekly; many page tokens are non-expiring
};

type AuthRow = {
  id: string;
  socialMediaId: string;
  accessToken: string;
  refreshToken: string | null;
  expiresAt: Date | null;
  lastRefreshed: Date | null;
  socialMedia: { provider: Provider };
};

export async function checkAndRefreshTokens() {
  const rows: AuthRow[] = await getSocialMediaAuth();
  const now = Date.now();

  for (const rec of rows) {
    const provider = rec.socialMedia.provider as Provider;
    const strategy = REFRESH_STRATEGY[provider];
    const refreshWindow = REFRESH_WINDOW_MS[provider];

    const expMs = rec.expiresAt?.getTime();
    const hasExpiry = typeof expMs === "number";

    const expiringSoon = hasExpiry ? expMs! - now <= refreshWindow : false;

    let shouldAct = false;
    if (strategy === "refresh") {
      shouldAct =
        (hasExpiry && expiringSoon) || (!hasExpiry && !rec.lastRefreshed);
    } else if (strategy === "validate") {
      // Validate on cadence using lastRefreshed + refreshWindow
      const last = rec.lastRefreshed?.getTime() ?? 0;
      shouldAct = now - last >= refreshWindow;
    } else {
      shouldAct = false;
    }
    if (!shouldAct) continue;

    try {
      const updated = await refreshDispatcher(provider, rec);
      if (!updated) {
        console.error(
          "[token]",
          provider,
          rec.socialMediaId,
          ":: no-change/needs-manual-auth",
        );
        continue;
      }

      await updateSocialMediaAuth(rec.id, {
        accessToken: updated.accessToken ?? rec.accessToken,
        refreshToken: updated.refreshToken ?? rec.refreshToken,
        expiresAt: updated.expiresAt ?? rec.expiresAt,
        lastRefreshed: new Date(),
      });

      console.log(
        `[token] ${provider} ${rec.socialMediaId.slice(0, 6)}… :: updated (expiresAt=${
          updated.expiresAt?.toISOString() ?? "n/a"
        })`,
      );
    } catch (e: any) {
      console.error(
        `[token] ${provider} ${rec.socialMediaId.slice(0, 6)}… :: ERROR ${e?.message ?? e}`,
      );
    }
  }
}

async function refreshInstagram(rec: AuthRow) {
  const url = new URL("https://graph.instagram.com/refresh_access_token");
  url.searchParams.set("grant_type", "ig_refresh_token");
  url.searchParams.set("access_token", rec.accessToken);

  const res = await fetch(url.toString());
  const j = await res.json();
  if (!res.ok) {
    throw new Error(
      `Instagram refresh failed: ${res.status} ${JSON.stringify(j)}`,
    );
  }

  const expiresAt = j.expires_in
    ? new Date(Date.now() + Number(j.expires_in) * 1000)
    : null;

  return {
    accessToken: j.access_token as string,
    refreshToken: rec.refreshToken, // IG long-lived flow typically doesn't return a refresh token
    expiresAt,
  };
}

// Google Analytics refresh
async function refreshGoogleAnalytics(rec: AuthRow) {
  if (!rec.refreshToken) return null;

  const body = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID ?? "",
    client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    grant_type: "refresh_token",
    refresh_token: rec.refreshToken,
  });

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  const j = await res.json();
  if (!res.ok) {
    throw new Error(
      `Google Analytics refresh failed: ${res.status} ${JSON.stringify(j)}`,
    );
  }

  const expiresAt = j.expires_in
    ? new Date(Date.now() + Number(j.expires_in) * 1000)
    : null;

  return {
    accessToken: j.access_token as string,
    refreshToken: (j.refresh_token as string) ?? rec.refreshToken,
    expiresAt,
  };
}

// FACEBOOK: validate (page tokens may be non-expiring)
async function validateFacebook(rec: AuthRow) {
  const appId = process.env.FB_APP_ID;
  const appSecret = process.env.FB_APP_SECRET;
  if (!appId || !appSecret) return null;

  const url = new URL("https://graph.facebook.com/debug_token");
  url.searchParams.set("input_token", rec.accessToken);
  url.searchParams.set("access_token", `${appId}|${appSecret}`);

  const res = await fetch(url.toString());
  const j = await res.json();
  if (!res.ok) {
    throw new Error(
      `Facebook debug failed: ${res.status} ${JSON.stringify(j)}`,
    );
  }

  const isValid = j?.data?.is_valid === true;
  const expSec = j?.data?.expires_at as number | undefined;
  const expiresAt = expSec ? new Date(expSec * 1000) : (rec.expiresAt ?? null);

  if (!isValid) {
    // invalid → require re-auth (no DB updates)
    return null;
  }

  // keep same token; update expiresAt if provided
  return {
    accessToken: rec.accessToken,
    refreshToken: rec.refreshToken,
    expiresAt,
  };
}

// TWITTER/X: OAuth2 refresh (~2h)
async function refreshTwitter(rec: AuthRow) {
  if (!rec.refreshToken) return null;

  const body = new URLSearchParams({
    client_id: process.env.TWITTER_CLIENT_ID ?? "",
    grant_type: "refresh_token",
    refresh_token: rec.refreshToken,
  });

  const res = await fetch("https://api.twitter.com/2/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(
        `${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`,
      ).toString("base64")}`,
    },
    body,
  });

  const j = await res.json();
  if (!res.ok) {
    throw new Error(
      `Twitter refresh failed: ${res.status} ${JSON.stringify(j)}`,
    );
  }

  const expiresAt = j.expires_in
    ? new Date(Date.now() + Number(j.expires_in) * 1000)
    : null;

  return {
    accessToken: j.access_token as string,
    refreshToken: (j.refresh_token as string) ?? rec.refreshToken,
    expiresAt,
  };
}

// LINKEDIN: refresh (~60 days)
async function refreshLinkedIn(rec: AuthRow) {
  if (!rec.refreshToken) return null;

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: rec.refreshToken,
    client_id: process.env.LINKEDIN_CLIENT_ID ?? "",
    client_secret: process.env.LINKEDIN_CLIENT_SECRET ?? "",
  });

  const res = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  const j = await res.json();
  if (!res.ok) {
    throw new Error(
      `LinkedIn refresh failed: ${res.status} ${JSON.stringify(j)}`,
    );
  }

  const expiresAt = j.expires_in
    ? new Date(Date.now() + Number(j.expires_in) * 1000)
    : null;

  return {
    accessToken: j.access_token as string,
    refreshToken: (j.refresh_token as string) ?? rec.refreshToken,
    expiresAt,
  };
}

// TIKTOK: refresh (~24h access tokens)
async function refreshTikTok(rec: AuthRow) {
  if (!rec.refreshToken) return null;

  const body = new URLSearchParams({
    client_key: process.env.TIKTOK_CLIENT_KEY ?? "",
    client_secret: process.env.TIKTOK_CLIENT_SECRET ?? "",
    grant_type: "refresh_token",
    refresh_token: rec.refreshToken,
  });

  const res = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  const j = await res.json();
  if (!res.ok) {
    throw new Error(
      `TikTok refresh failed: ${res.status} ${JSON.stringify(j)}`,
    );
  }

  const expiresAt = j.expires_in
    ? new Date(Date.now() + Number(j.expires_in) * 1000)
    : null;

  return {
    accessToken: j.access_token as string,
    refreshToken: (j.refresh_token as string) ?? rec.refreshToken,
    expiresAt,
  };
}

async function refreshDispatcher(
  provider: Provider,
  rec: AuthRow,
): Promise<{
  accessToken?: string;
  refreshToken?: string | null;
  expiresAt?: Date | null;
} | null> {
  switch (provider) {
    case "GOOGLE_ANALYTICS":
      return refreshGoogleAnalytics(rec);
    case "INSTAGRAM":
      return refreshInstagram(rec);
    case "FACEBOOK":
      return validateFacebook(rec);
    case "TWITTER":
      return refreshTwitter(rec);
    case "LINKEDIN":
      return refreshLinkedIn(rec);
    case "TIKTOK":
      return refreshTikTok(rec);
    default:
      return null;
  }
}
