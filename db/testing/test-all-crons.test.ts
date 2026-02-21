import refreshAllTokens from "../../scripts/token-refresh.js";
import { runDailyInstagramSync } from "../../scripts/cron-jobs/instagram-cron.js";
import { runDailyFacebookSync } from "../../scripts/cron-jobs/facebook-cron.js";
import { runDailyTwitterSync } from "../../scripts/cron-jobs/twitter-cron.js";
import { runDailyGoogleAnalyticsSync } from "../../scripts/cron-jobs/google-analytics-cron.js";

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
