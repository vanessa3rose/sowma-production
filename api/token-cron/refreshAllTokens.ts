import fetch from "node-fetch";
import { getSocialMediaAuth, updateSocialMediaAuth } from "../../db/social-media-auth";

export type Provider =
  | "GOOGLE_ANALYTICS"
  | "INSTAGRAM"
  | "FACEBOOK"
  | "TWITTER"
  // | "LINKEDIN"
  // | "TIKTOK";

export const REFRESH_STRATEGY: Record<Provider, "refresh" | "validate" | "static"> = {
  GOOGLE_ANALYTICS: "refresh",
  INSTAGRAM: "refresh",
  FACEBOOK: "validate",
  TWITTER: "refresh",
  // LINKEDIN: "refresh",
  // TIKTOK: "refresh",
};

const REFRESH_WINDOW_MS: Record<Provider, number> = {
  GOOGLE_ANALYTICS: 5 * 60 * 1000,       // 5 min
  TWITTER: 10 * 60 * 1000,               // 10 min
  // TIKTOK: 60 * 60 * 1000,                // 1h
  INSTAGRAM: 3 * 24 * 60 * 60 * 1000,    // 3 days
  // LINKEDIN: 3 * 24 * 60 * 60 * 1000,     // 3 days
  FACEBOOK: 7 * 24 * 60 * 60 * 1000,     // weekly
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

export default async function refreshAllTokens(): Promise<AuthRow[]> {
  const rows: AuthRow[] = await getSocialMediaAuth();
  const now = Date.now();

  for (const rec of rows) {
    const provider = rec.socialMedia.provider;
    const strategy = REFRESH_STRATEGY[provider];
    const refreshWindow = REFRESH_WINDOW_MS[provider];

    const expMs = rec.expiresAt?.getTime();
    const hasExpiry = typeof expMs === "number";
    const expiringSoon = hasExpiry ? expMs! - now <= refreshWindow : false;

    let shouldAct = false;
    if (strategy === "refresh") {
      shouldAct = (hasExpiry && expiringSoon) || (!hasExpiry && !rec.lastRefreshed);
    } else if (strategy === "validate") {
      const last = rec.lastRefreshed?.getTime() ?? 0;
      shouldAct = now - last >= refreshWindow;
    }

    if (!shouldAct) continue;

    try {
      const updated = await refreshDispatcher(provider, rec);
      if (!updated) {
        console.error(`[token] ${provider} ${rec.socialMediaId} :: no-change/needs-manual-auth`);
        continue;
      }

      await updateSocialMediaAuth(rec.id, {
        accessToken: updated.accessToken ?? rec.accessToken,
        refreshToken: updated.refreshToken ?? rec.refreshToken,
        expiresAt: updated.expiresAt ?? rec.expiresAt,
        lastRefreshed: new Date(),
      });

      console.log(`[token] ${provider} ${rec.socialMediaId.slice(0, 6)}… :: updated (expiresAt=${updated.expiresAt?.toISOString() ?? "n/a"})`);
    } catch (err: any) {
      console.error(`[token] ${provider} ${rec.socialMediaId.slice(0, 6)}… :: ERROR ${err?.message ?? err}`);
    }
  }

  return rows;
}

/* -------------------------------------------------
   Dispatcher
-------------------------------------------------- */
async function refreshDispatcher(provider: Provider, rec: AuthRow) {
  switch (provider) {
    case "GOOGLE_ANALYTICS": return refreshGoogleAnalytics(rec);
    case "INSTAGRAM": return refreshInstagram(rec);
    case "FACEBOOK": return validateFacebook(rec);
    case "TWITTER": return refreshTwitter(rec);
    // case "LINKEDIN": return refreshLinkedIn(rec);
    // case "TIKTOK": return refreshTikTok(rec);
    default: return null;
  }
}

/* -------------------------------------------------
   Provider Refresh / Validate Functions
   Each function now types the fetch response
-------------------------------------------------- */

async function refreshInstagram(rec: AuthRow) {
  const url = new URL("https://graph.instagram.com/refresh_access_token");
  url.searchParams.set("grant_type", "ig_refresh_token");
  url.searchParams.set("access_token", rec.accessToken);

  const res = await fetch(url.toString());
  const j = (await res.json()) as { access_token?: string; expires_in?: number };
  if (!res.ok) throw new Error(`Instagram refresh failed: ${res.status} ${JSON.stringify(j)}`);

  return {
    accessToken: j.access_token ?? rec.accessToken,
    refreshToken: rec.refreshToken,
    expiresAt: j.expires_in ? new Date(Date.now() + j.expires_in * 1000) : null,
  };
}

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

  const j = (await res.json()) as { access_token?: string; refresh_token?: string; expires_in?: number };
  if (!res.ok) throw new Error(`GA refresh failed: ${res.status} ${JSON.stringify(j)}`);

  return {
    accessToken: j.access_token ?? rec.accessToken,
    refreshToken: j.refresh_token ?? rec.refreshToken,
    expiresAt: j.expires_in ? new Date(Date.now() + j.expires_in * 1000) : null,
  };
}

async function validateFacebook(rec: AuthRow) {
  const appId = process.env.FB_APP_ID;
  const appSecret = process.env.FB_APP_SECRET;
  if (!appId || !appSecret) return null;

  const url = new URL("https://graph.facebook.com/debug_token");
  url.searchParams.set("input_token", rec.accessToken);
  url.searchParams.set("access_token", `${appId}|${appSecret}`);

  const res = await fetch(url.toString());
  const j = (await res.json()) as { data?: { is_valid?: boolean; expires_at?: number } };
  if (!res.ok) throw new Error(`Facebook debug failed: ${res.status} ${JSON.stringify(j)}`);

  const isValid = j.data?.is_valid === true;
  const expSec = j.data?.expires_at;
  return isValid
    ? {
        accessToken: rec.accessToken,
        refreshToken: rec.refreshToken,
        expiresAt: expSec ? new Date(expSec * 1000) : rec.expiresAt,
      }
    : null;
}

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
      Authorization: `Basic ${Buffer.from(`${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`).toString("base64")}`,
    },
    body,
  });

  const j = (await res.json()) as { access_token?: string; refresh_token?: string; expires_in?: number };
  if (!res.ok) throw new Error(`Twitter refresh failed: ${res.status} ${JSON.stringify(j)}`);

  return {
    accessToken: j.access_token ?? rec.accessToken,
    refreshToken: j.refresh_token ?? rec.refreshToken,
    expiresAt: j.expires_in ? new Date(Date.now() + j.expires_in * 1000) : null,
  };
}

// async function refreshLinkedIn(rec: AuthRow) {
//   if (!rec.refreshToken) return null;

//   const body = new URLSearchParams({
//     grant_type: "refresh_token",
//     refresh_token: rec.refreshToken,
//     client_id: process.env.LINKEDIN_CLIENT_ID ?? "",
//     client_secret: process.env.LINKEDIN_CLIENT_SECRET ?? "",
//   });

//   const res = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
//     method: "POST",
//     headers: { "Content-Type": "application/x-www-form-urlencoded" },
//     body,
//   });

//   const j = (await res.json()) as { access_token?: string; refresh_token?: string; expires_in?: number };
//   if (!res.ok) throw new Error(`LinkedIn refresh failed: ${res.status} ${JSON.stringify(j)}`);

//   return {
//     accessToken: j.access_token ?? rec.accessToken,
//     refreshToken: j.refresh_token ?? rec.refreshToken,
//     expiresAt: j.expires_in ? new Date(Date.now() + j.expires_in * 1000) : null,
//   };
// }

// async function refreshTikTok(rec: AuthRow) {
//   if (!rec.refreshToken) return null;

//   const body = new URLSearchParams({
//     client_key: process.env.TIKTOK_CLIENT_KEY ?? "",
//     client_secret: process.env.TIKTOK_CLIENT_SECRET ?? "",
//     grant_type: "refresh_token",
//     refresh_token: rec.refreshToken,
//   });

//   const res = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
//     method: "POST",
//     headers: { "Content-Type": "application/x-www-form-urlencoded" },
//     body,
//   });

//   const j = (await res.json()) as { access_token?: string; refresh_token?: string; expires_in?: number };
//   if (!res.ok) throw new Error(`TikTok refresh failed: ${res.status} ${JSON.stringify(j)}`);

//   return {
//     accessToken: j.access_token ?? rec.accessToken,
//     refreshToken: j.refresh_token ?? rec.refreshToken,
//     expiresAt: j.expires_in ? new Date(Date.now() + j.expires_in * 1000) : null,
  // };
// }
