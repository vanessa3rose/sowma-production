import { checkAndRefreshTokens } from "../../api/tokenManager";
import { getSocialMediaAuth } from "../social-media-auth";
import fetch from "node-fetch";

async function runRefreshTest() {
    console.log("Starting refresh test...");

    const before = await getSocialMediaAuth();
    await checkAndRefreshTokens();
    const after = await getSocialMediaAuth();

    for (const rec of after) {
        const beforeRec = before.find(b => b.id === rec.id);
        if (!beforeRec) continue;

        const provider = rec.socialMedia.provider;
        const changedToken = 
            beforeRec.accessToken !== rec.accessToken ? "changed" : "unchanged";
        const refreshed = 
            new Date(rec.lastRefreshed || 0) > new Date(beforeRec.lastRefreshed || 0)
            ? "updated"
            : "same";
        
        console.log('${provider.padEnd(15)} :: token ${changedToken}, lastRefreshed ${refreshed}');
    }

    // testing twitter api with refreshed token
    const twitterRec = after.find(r => r.socialMedia.provider === "TWITTER");
    if (twitterRec) {
        const res = await fetch("https://api.twitter.com/2/users/me", {
            headers: {Authorization: 'Bearer ${twitterRec.accessToken}'},
        });
        const j = await res.json();
        if (res.ok) {
            console.log("Twitter API test success!");
        } else {
            console.error("Twitter API test failed :(");
        }
    } else {
        console.log("No twitter record found");
    }
}
