// db/testing/test-all-crons.ts
import refreshAllTokens from "../../api/token-cron/refreshAllTokens";
import { runDailyInstagramSync } from "../../scripts/instagram-cron";
import { runDailyFacebookSync } from "../../scripts/facebook-cron";
import { runDailyTwitterSync } from "../../scripts/twitter-cron";
import { runDailyGoogleAnalyticsSync } from "../../scripts/google-analytics-cron";

async function runAllCrons() {
  console.log("=== Starting Token Refresh ===");
  await refreshAllTokens();

  console.log("\n=== Starting Instagram Sync ===");
  await runDailyInstagramSync();

  console.log("\n=== Starting Facebook Sync ===");
  await runDailyFacebookSync();

  console.log("\n=== Starting Twitter Sync ===");
  await runDailyTwitterSync();

  console.log("\n=== Starting Google Analytics Sync ===");
  await runDailyGoogleAnalyticsSync();

  console.log("\nAll cron jobs executed successfully!");
}

runAllCrons().catch((err) => {
  console.error("Cron test failed:", err);
  process.exit(1);
});