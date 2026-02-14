import { runDailyFacebookSync } from "../../scripts/cron-jobs/facebook-cron.js";
import { runDailyGoogleAnalyticsSync } from "../../scripts/cron-jobs/google-analytics-cron.js";
import { runDailyInstagramSync } from "../../scripts/cron-jobs/instagram-cron.js";
import { runDailyTwitterSync } from "../../scripts/cron-jobs/twitter-cron.js";

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
    results.facebook = `error: ${err?.message}`;
  }

  try {
    await runDailyGoogleAnalyticsSync();
    results.googleAnalytics = "ok";
  } catch (err: any) {
    results.googleAnalytics = `error: ${err?.message}`;
  }

  try {
    await runDailyInstagramSync();
    results.instagram = "ok";
  } catch (err: any) {
    results.instagram = `error: ${err?.message}`;
  }

  try {
    await runDailyTwitterSync();
    results.twitter = "ok";
  } catch (err: any) {
    results.twitter = `error: ${err?.message}`;
  }

  return new Response(JSON.stringify(results), { status: 200 });
}
