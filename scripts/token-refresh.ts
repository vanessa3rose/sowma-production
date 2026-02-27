import fetch from "node-fetch";
import {
  createSocialMediaAuth,
  getSocialMediaAuth,
  updateSocialMediaAuth,
} from "../db/social-media-auth.js";

/* -------------------------------------------------
   Supported social media providers
-------------------------------------------------- */
export type Provider =
  | "GOOGLE_ANALYTICS"
  | "INSTAGRAM"
  | "FACEBOOK"
  | "TWITTER"
  | "CONSTANT_CONTACT";
// | "LINKEDIN"
// | "TIKTOK";

/* -------------------------------------------------
   Refresh strategy per provider
-------------------------------------------------- */
export const REFRESH_STRATEGY: Record<
  Provider,
  "refresh" | "validate" | "static"
> = {
  GOOGLE_ANALYTICS: "validate",
  INSTAGRAM: "validate",
  FACEBOOK: "validate",
  TWITTER: "validate",
  CONSTANT_CONTACT: "refresh",
};

/* -------------------------------------------------
  Refresh window (how soon before expiry we refresh)
-------------------------------------------------- */
const REFRESH_WINDOW_MS: Record<Provider, number> = {
  GOOGLE_ANALYTICS: 5 * 60 * 1000, // 5 min
  TWITTER: 10 * 60 * 1000, // 10 min
  INSTAGRAM: 3 * 24 * 60 * 60 * 1000, // 3 days
  FACEBOOK: 7 * 24 * 60 * 60 * 1000, // 1 week
  CONSTANT_CONTACT: 150 * 24 * 60 * 60 * 1000, // 150 days
};

/* -------------------------------------------------
   Auth row type
-------------------------------------------------- */
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

/* -------------------------------------------------
   Refresh all tokens for all accounts
-------------------------------------------------- */
export default async function refreshAllTokens(): Promise<AuthRow[]> {
  console.log("[token] fetching social media auth rows...");
  const rows: AuthRow[] = await getSocialMediaAuth();
  console.log(`[token] fetched ${rows.length} auth rows`);

  if (rows.length === 0) {
    console.warn("[token] no auth rows found, nothing to refresh");
    return [];
  }

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
      shouldAct =
        (hasExpiry && expiringSoon) || (!hasExpiry && !rec.lastRefreshed);
    } else if (strategy === "validate") {
      const last = rec.lastRefreshed?.getTime() ?? 0;
      shouldAct = now - last >= refreshWindow;
    }

    if (!shouldAct) {
      console.log(
        `[token] ${provider} ${rec.socialMediaId.slice(0, 6)}… :: no action needed`,
      );
      continue;
    }

    console.log(
      `[token] ${provider} ${rec.socialMediaId.slice(0, 6)}… :: attempting refresh/validate`,
    );

    try {
      const updated = await refreshDispatcher(provider, rec);
      if (!updated) {
        console.error(
          `[token] ${provider} ${rec.socialMediaId.slice(0, 6)}… :: no-change / needs manual auth`,
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
        `[token] ${provider} ${rec.socialMediaId.slice(0, 6)}… :: updated successfully (expiresAt=${updated.expiresAt?.toISOString() ?? "n/a"})`,
      );
    } catch (err: any) {
      console.error(
        `[token] ${provider} ${rec.socialMediaId.slice(0, 6)}… :: ERROR ${err?.message ?? err}`,
      );
    }
  }

  return rows;
}

/* -------------------------------------------------
   Dispatcher: call correct refresh/validate function
-------------------------------------------------- */
async function refreshDispatcher(provider: Provider, rec: AuthRow) {
  switch (provider) {
    case "GOOGLE_ANALYTICS":
      return refreshGoogleAnalytics(rec);
    case "INSTAGRAM":
      return refreshInstagram(rec);
    case "FACEBOOK":
      return validateFacebook(rec);
    case "TWITTER":
      return refreshTwitter(rec);
    case "CONSTANT_CONTACT":
      return refreshConstantContact(rec);
    default:
      console.warn(`[token] unknown provider ${provider}`);
      return null;
  }
}

/* -------------------------------------------------
   Provider Refresh / Validate Functions
-------------------------------------------------- */
// Instagram
async function refreshInstagram(rec: AuthRow) {
  console.log(`[IG] refreshing token for ${rec.socialMediaId.slice(0, 6)}…`);
  const url = new URL("https://graph.instagram.com/refresh_access_token");
  url.searchParams.set("grant_type", "ig_refresh_token");
  url.searchParams.set("access_token", rec.accessToken);

  const res = await fetch(url.toString());
  const j = (await res.json()) as {
    access_token?: string;
    expires_in?: number;
  };
  if (!res.ok)
    throw new Error(`[IG] refresh failed: ${res.status} ${JSON.stringify(j)}`);

  return {
    accessToken: j.access_token ?? rec.accessToken,
    refreshToken: rec.refreshToken,
    expiresAt: j.expires_in ? new Date(Date.now() + j.expires_in * 1000) : null,
  };
}

// Google Analytics
async function refreshGoogleAnalytics(rec: AuthRow) {
  console.log(`[GA] refreshing token for ${rec.socialMediaId.slice(0, 6)}…`);
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

  const j = (await res.json()) as {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
  };
  if (!res.ok)
    throw new Error(`[GA] refresh failed: ${res.status} ${JSON.stringify(j)}`);

  return {
    accessToken: j.access_token ?? rec.accessToken,
    refreshToken: j.refresh_token ?? rec.refreshToken,
    expiresAt: j.expires_in ? new Date(Date.now() + j.expires_in * 1000) : null,
  };
}

// Facebook
async function validateFacebook(rec: AuthRow) {
  console.log(`[FB] validating token for ${rec.socialMediaId.slice(0, 6)}…`);
  const appId = process.env.FB_APP_ID;
  const appSecret = process.env.FB_APP_SECRET;
  if (!appId || !appSecret) return null;

  const url = new URL("https://graph.facebook.com/debug_token");
  url.searchParams.set("input_token", rec.accessToken);
  url.searchParams.set("access_token", `${appId}|${appSecret}`);

  const res = await fetch(url.toString());
  const j = (await res.json()) as {
    data?: { is_valid?: boolean; expires_at?: number };
  };
  if (!res.ok)
    throw new Error(`[FB] debug failed: ${res.status} ${JSON.stringify(j)}`);

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

// Twitter
async function refreshTwitter(rec: AuthRow) {
  console.log(`[TW] refreshing token for ${rec.socialMediaId.slice(0, 6)}…`);
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

  const j = (await res.json()) as {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
  };
  if (!res.ok)
    throw new Error(`[TW] refresh failed: ${res.status} ${JSON.stringify(j)}`);

  return {
    accessToken: j.access_token ?? rec.accessToken,
    refreshToken: j.refresh_token ?? rec.refreshToken,
    expiresAt: j.expires_in ? new Date(Date.now() + j.expires_in * 1000) : null,
  };
}

// Constant Contact
async function refreshConstantContact(rec: AuthRow) {
  console.log(`[CC] refreshing token for ${rec.socialMediaId.slice(0, 6)}…`);
  if (!rec.refreshToken) return null;

  const clientId = process.env.CONSTANT_CONTACT_CLIENT_ID ?? "";
  const clientSecret = process.env.CONSTANT_CONTACT_CLIENT_SECRET ?? "";
  if (!clientId || !clientSecret) {
    throw new Error("[CC] missing client ID or secret in .env");
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
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
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
  if (!res.ok)
    throw new Error(`[CC] refresh failed: ${res.status} ${JSON.stringify(j)}`);

  const nowMs = Date.now();
  let refreshTokenExpiresAt = rec.refreshTokenExpiresAt ?? null;
  if (j.refresh_token_expires_in)
    refreshTokenExpiresAt = new Date(nowMs + j.refresh_token_expires_in * 1000);
  else if (j.refresh_token)
    refreshTokenExpiresAt = new Date(nowMs + 180 * 24 * 60 * 60 * 1000);

  return {
    accessToken: j.access_token ?? rec.accessToken,
    refreshToken: j.refresh_token ?? rec.refreshToken,
    expiresAt: j.expires_in ? new Date(Date.now() + j.expires_in * 1000) : null,
    refreshTokenExpiresAt,
  };
}

/* -------------------------------------------------
   Ensure Constant Contact access token
-------------------------------------------------- */
type ConstantContactAuthInput = {
  id?: string;
  accessToken?: string | null;
  refreshToken?: string | null;
  expiresAt?: Date | null;
  lastRefreshed?: Date | null;
};

export async function ensureConstantContactAccessToken(params: {
  socialMediaId: string;
  auth: ConstantContactAuthInput | null;
  fallbackRefreshToken?: string | null;
  forceRefresh?: boolean;
}) {
  const { socialMediaId, auth, fallbackRefreshToken, forceRefresh } = params;
  const now = Date.now();
  const refreshWindow = REFRESH_WINDOW_MS.CONSTANT_CONTACT;

  const accessToken = auth?.accessToken ?? null;
  const expiresAt = auth?.expiresAt ?? null;
  const authId = auth?.id ?? null;

  const expMs = expiresAt?.getTime();
  const hasExpiry = typeof expMs === "number";
  const expiringSoon = hasExpiry ? expMs! - now <= refreshWindow : true;

  const needsRefresh =
    forceRefresh === true || !accessToken || !expiresAt || expiringSoon;

  if (!needsRefresh) {
    if (!accessToken || !authId) {
      throw new Error("[CC] auth missing; cannot proceed without refresh.");
    }
    return {
      accessToken,
      refreshToken: auth?.refreshToken ?? null,
      expiresAt,
      authId,
    };
  }

  const refreshToken = auth?.refreshToken ?? fallbackRefreshToken ?? null;
  if (!refreshToken) {
    throw new Error(
      "[CC] missing refresh token; provide CONSTANT_CONTACT_REFRESH_TOKEN or complete OAuth.",
    );
  }

  const updated = await refreshConstantContact({
    id: authId ?? "",
    socialMediaId,
    accessToken: accessToken ?? "",
    refreshToken,
    expiresAt,
    refreshTokenExpiresAt: null,
    lastRefreshed: auth?.lastRefreshed ?? null,
    socialMedia: { provider: "CONSTANT_CONTACT" },
  });

  if (!updated?.accessToken) {
    throw new Error("[CC] refresh returned no access token.");
  }

  if (authId) {
    await updateSocialMediaAuth(authId, {
      accessToken: updated.accessToken ?? accessToken ?? "",
      refreshToken: updated.refreshToken ?? refreshToken,
      expiresAt: updated.expiresAt ?? expiresAt,
      lastRefreshed: new Date(),
    });

    return {
      accessToken: updated.accessToken ?? accessToken ?? "",
      refreshToken: updated.refreshToken ?? refreshToken,
      expiresAt: updated.expiresAt ?? expiresAt,
      authId,
    };
  }

  const created = await createSocialMediaAuth({
    socialMediaId,
    accessToken: updated.accessToken ?? "",
    refreshToken: updated.refreshToken ?? refreshToken,
    expiresAt: updated.expiresAt ?? null,
    lastRefreshed: new Date(),
  });

  return {
    accessToken: created.accessToken,
    refreshToken: created.refreshToken,
    expiresAt: created.expiresAt,
    authId: created.id,
  };
}

/* -------------------------------------------------
   Entrypoint / cron runner
-------------------------------------------------- */
async function runTokenRefresh() {
  try {
    console.log("[token cron] starting...");
    await refreshAllTokens();
    console.log("[token cron] completed successfully");
  } catch (err: any) {
    console.error("[token cron] failed", err);
    throw err;
  }
}

// run directly when executed
runTokenRefresh().catch(console.error);
