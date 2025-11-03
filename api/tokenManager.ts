// apis: meta, instagram, tiktok, linkedin, twitter, google analytics
import cron from "node-cron";
import { PrismaClient } from "@prisma/client";
import fetch from "node-fetch";
import { updateSocialMediaAuth, getSocialMediaAuth} from "../db/social-media-auth";

const prisma = new PrismaClient();


export type Provider =
    | "GOOGLE_ANALYTICS"
    | "INSTAGRAM"
    | "FACEBOOK"
    | "TWITTER"
    | "LINKEDIN"
    | "TIKTOK";

export const REFRESH_STRATEGY: Record<Provider, "refresh" | "validate" | "static"> = {
  GOOGLE_ANALYTICS: "refresh",
  INSTAGRAM: "refresh",
  FACEBOOK: "validate", // non-expiring, but validate
  TWITTER: "refresh",
  LINKEDIN: "refresh",
  TIKTOK: "refresh",
};
//check these numbers 
const REFRESH_WINDOW_MS: Record<Provider, number> = {
  GOOGLE_ANALYTICS:   5  * 60 * 1000,        // 5 minutes before expiry (access ~1h)  ← GA/Google OAuth
  TWITTER:  10 * 60 * 1000,        // 10 minutes before expiry (access ~2h) ← X/Twitter
  TIKTOK:   60 * 60 * 1000,        // 1 hour before expiry (access ~24h)    ← TikTok
  INSTAGRAM:3  * 24 * 60 * 60 * 1000, // 3 days before expiry (60 days)     ← Instagram Graph long-lived
  LINKEDIN: 3  * 24 * 60 * 60 * 1000, // 3 days before expiry (60 days)     ← LinkedIn
  FACEBOOK: 7  * 24 * 60 * 60 * 1000, // validate weekly; many page tokens are non-expiring
};

type AuthRow = {
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
    
    for (const rec of rows){
        const provider = rec.socialMedia.provider as Provider;
        const strategy = REFRESH_STRATEGY[provider];
        const expiresAt = rec.expiresAt ? rec.expiresAt.getTime() : 1000000000000; //check this number
        const refreshWindow = REFRESH_WINDOW_MS[provider];
        const expiringSoon = expiresAt-now < refreshWindow;

        if(!expiringSoon) continue;
        try{
            const updated = await refreshDispatcher(provider, rec);
            if (!updated){
                console.error("Could not find new token for ", provider);
                continue;
            }else{
                await updateSocialMediaAuth(rec.socialMediaId, {
                    accessToken: updated.accessToken ?? rec.accessToken,
                    refreshToken: updated.refreshToken ?? rec.refreshToken,
                    expiresAt: updated.expiresAt ?? rec.expiresAt,
                    lastRefreshed: new Date(),
                    });
                }
        }
        catch(e: any){
            console.error(`fatal error in fetching a refresh/access token for ${provider}`, e);
        }
        

        //if 
    }

}


// these are NOT DONE. just did returns so everyhting would stop being red squiggly
async function refreshGoogle(rec: AuthRow) {
    return {AccessToken: "abc", refreshToken: rec.refreshToken, expiresAt: new Date() };
}

async function refreshInstagram(rec: AuthRow) {
    return {AccessToken: "abc", refreshToken: rec.refreshToken, expiresAt: new Date() };
}

async function validateFacebook(rec: AuthRow) {
    return {AccessToken: "abc", refreshToken: rec.refreshToken, expiresAt: new Date() };
}

async function refreshTwitter(rec: AuthRow) {
    return {AccessToken: "abc", refreshToken: rec.refreshToken, expiresAt: new Date() };
}

async function refreshLinkedIn(rec: AuthRow) {
    return {AccessToken: "abc", refreshToken: rec.refreshToken, expiresAt: new Date() };
}

async function refreshTikTok(rec: AuthRow) {
    return {AccessToken: "abc", refreshToken: rec.refreshToken, expiresAt: new Date() };
}


async function refreshDispatcher(
  provider: Provider,
  rec: AuthRow
): Promise<{ accessToken?: string; refreshToken?: string | null; expiresAt?: Date | null } | null> {
  switch (provider) {
    case "GOOGLE_ANALYTICS":   return refreshGoogle(rec);
    case "INSTAGRAM":return refreshInstagram(rec);
    case "FACEBOOK": return validateFacebook(rec);
    case "TWITTER":  return refreshTwitter(rec);
    case "LINKEDIN": return refreshLinkedIn(rec);
    case "TIKTOK":   return refreshTikTok(rec);
    default:         return null;
  }
}
