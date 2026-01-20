import { runDailyFacebookSync } from "../../scripts/facebook-cron";
import { runDailyGoogleAnalyticsSync } from "../../scripts/google-analytics-cron";
import { runDailyInstagramSync } from "../../scripts/instagram-cron";
import { runDailyTwitterSync } from "../../scripts/twitter-cron";

// secures the route with a CRON_SECRET
const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const results: Record<string, string> = {};

  try {
    await runDailyFacebookSync();
    results.facebook = "ok";
  } catch (err: any) {
    console.error("Facebook cron failed:", err);
    results.facebook = `error: ${err?.message || err}`;
  }

  try {
    await runDailyGoogleAnalyticsSync();
    results.googleAnalytics = "ok";
  } catch (err: any) {
    console.error("Google Analytics cron failed:", err);
    results.googleAnalytics = `error: ${err?.message || err}`;
  }

  try {
    await runDailyInstagramSync();
    results.instagram = "ok";
  } catch (err: any) {
    console.error("Instagram cron failed:", err);
    results.instagram = `error: ${err?.message || err}`;
  }

  try {
    await runDailyTwitterSync();
    results.twitter = "ok";
  } catch (err: any) {
    console.error("Twitter cron failed:", err);
    results.twitter = `error: ${err?.message || err}`;
  }

  return new Response(JSON.stringify(results), { status: 200 });
}