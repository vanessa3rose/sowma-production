// apis: meta, instagram, tiktok, linkedin, twitter, google analytics
import cron from "node-cron";
import { PrismaClient } from "@prisma/client";
import fetch from "node-fetch";
import { C } from "react-router/dist/development/index-react-server-client-BbRcBjrA";

const prisma = new PrismaClient();


export type Provider =
    | "google"
    | "instagram"
    | "facebook"
    | "twitter"
    | "linkedin"
    | "tiktok";

export const REFRESH_STRATEGY: Record<Provider, "refresh" | "validate" | "static"> = {
  google: "refresh",
  instagram: "refresh",
  facebook: "validate", // non-expiring, but validate
  twitter: "refresh",
  linkedin: "refresh",
  tiktok: "refresh",
};
//check these numbers 
const REFRESH_WINDOW_MS: Record<Provider, number> = {
  google:   5  * 60 * 1000,        // 5 minutes before expiry (access ~1h)  ← GA/Google OAuth
  twitter:  10 * 60 * 1000,        // 10 minutes before expiry (access ~2h) ← X/Twitter
  tiktok:   60 * 60 * 1000,        // 1 hour before expiry (access ~24h)    ← TikTok
  instagram:3  * 24 * 60 * 60 * 1000, // 3 days before expiry (60 days)     ← Instagram Graph long-lived
  linkedin: 3  * 24 * 60 * 60 * 1000, // 3 days before expiry (60 days)     ← LinkedIn
  facebook: 7  * 24 * 60 * 60 * 1000, // validate weekly; many page tokens are non-expiring
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
    const rows: AuthRow[] = await prisma.socialMediaAuth.findMany({
        include: { socialMedia: true },
    });
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
            }
            await prisma.socialMediaAuth.update({
                where: { socialMediaId: rec.socialMediaId },
                data: {
                accessToken: updated.accessToken ?? rec.accessToken,
                refreshToken: updated.refreshToken ?? rec.refreshToken,
                // store provider-returned expiry if present
                expiresAt: updated.expiresAt ?? rec.expiresAt,
                lastRefreshed: new Date(),
                },
            });
        }
        catch(e: any){
            console.error(`fatal error in fetching a refersh/access token for ${provider}`, e);
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
    case "google":   return refreshGoogle(rec);
    case "instagram":return refreshInstagram(rec);
    case "facebook": return validateFacebook(rec);
    case "twitter":  return refreshTwitter(rec);
    case "linkedin": return refreshLinkedIn(rec);
    case "tiktok":   return refreshTikTok(rec);
    default:         return null;
  }
}
