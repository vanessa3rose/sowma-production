import refreshAllTokens from "../../scripts/token-refresh.js";
import { getSocialMediaAuth } from "../social-media-auth";
import fetch from "node-fetch";

async function runRefreshTest() {
  console.log("Starting refresh test...");

  const before = await getSocialMediaAuth();
  await refreshAllTokens();
  const after = await getSocialMediaAuth();

  for (const rec of after) {
    const beforeRec = before.find((b: any) => b.id === rec.id);
    if (!beforeRec) continue;

    const provider = rec.socialMedia.provider;
    const changedToken =
      beforeRec.accessToken !== rec.accessToken ? "changed" : "unchanged";
    const refreshed =
      new Date(rec.lastRefreshed || 0) > new Date(beforeRec.lastRefreshed || 0)
        ? "updated"
        : "same";

    console.log(
      `${provider.padEnd(15)} :: token ${changedToken}, lastRefreshed ${refreshed}`,
    );
  }

  // testing Twitter API with refreshed token
  const twitterRec = after.find(
    (r: any) => r.socialMedia.provider === "TWITTER",
  );
  if (twitterRec) {
    const res = await fetch("https://api.twitter.com/2/users/me", {
      headers: { Authorization: `Bearer ${twitterRec.accessToken}` },
    });
    const j = await res.json();
    if (res.ok) {
      console.log("Twitter API test success!", j);
    } else {
      console.error("Twitter API test failed :(", j);
    }
  } else {
    console.log("No Twitter record found");
  }
}

// Run the test
runRefreshTest().catch(console.error);
