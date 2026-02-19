import { runDailyFacebookSync } from "../../scripts/cron-jobs/facebook-cron.js";
import { runDailyGoogleAnalyticsSync } from "../../scripts/cron-jobs/google-analytics-cron.js";
import { runDailyInstagramSync } from "../../scripts/cron-jobs/instagram-cron.js";
import { runDailyTwitterSync } from "../../scripts/cron-jobs/twitter-cron.js";
import { runDailyConstantContactSync } from "../../scripts/cron-jobs/constant-contact-cron.js";

const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const results: Record<string, string> = {};
  console.log("beginning");

  try {
    console.log("1");
    await runDailyFacebookSync();
    results.facebook = "ok";
  } catch (err: any) {
    results.facebook = `error: ${err?.message}`;
  }

  try {
    console.log("2");
    await runDailyGoogleAnalyticsSync();
    results.googleAnalytics = "ok";
  } catch (err: any) {
    results.googleAnalytics = `error: ${err?.message}`;
  }

  try {
    console.log("3");
    await runDailyInstagramSync();
    results.instagram = "ok";
  } catch (err: any) {
    results.instagram = `error: ${err?.message}`;
  }

  try {
    console.log("4");
    await runDailyTwitterSync();
    results.twitter = "ok";
  } catch (err: any) {
    results.twitter = `error: ${err?.message}`;
  }

  try {
    console.log("5");
    await runDailyConstantContactSync();
    results.constantContact = "ok";
  } catch (err: any) {
    results.constantContact = `error: ${err?.message}`;
  }

  return new Response(JSON.stringify(results), { status: 200 });
}
