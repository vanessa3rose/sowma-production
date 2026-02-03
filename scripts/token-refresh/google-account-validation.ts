// scripts/google-analytics-validate.ts
import "dotenv/config";
import { BetaAnalyticsDataClient } from "@google-analytics/data";
import { GoogleAuth } from "google-auth-library";

/**
 * Google Analytics (Service Account) validation script
 *
 * What it does:
 *  1) Confirms required GA_* service account env vars exist
 *  2) Builds GoogleAuth + BetaAnalyticsDataClient (same as cron)
 *  3) Runs a tiny canary runReport call to verify credentials + permissions
 *
 * Run:
 *   npx tsx -r dotenv/config scripts/google-analytics-validate.ts
 */

// Prefer making this configurable instead of hardcoding.
const GA_PROPERTY_ID =
  process.env.GA_PROPERTY_ID?.trim() ||
  process.env.GOOGLE_ANALYTICS_PROPERTY_ID?.trim() ||
  "393011442"; // fallback to the value currently hardcoded in your cron

function getYesterdayUTCISO(): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

function requiredEnv(name: string): string | null {
  const v = process.env[name];
  return v && v.trim() ? v : null;
}

function formatAuthHint(status?: number, msg?: string) {
  // Friendly guidance for common failure modes
  if (status === 401) {
    return "401 (unauthorized): service account key/email invalid, key formatting issue (\\n), or clock skew.";
  }
  if (status === 403) {
    return "403 (forbidden): service account likely not added as a user to the GA property (missing permissions).";
  }
  if (status === 404) {
    return "404 (not found): GA property id may be wrong or inaccessible.";
  }
  if (msg?.toLowerCase().includes("invalid_grant")) {
    return "invalid_grant: usually key/email mismatch, revoked key, or system clock skew.";
  }
  return "Unknown error; check credentials, property id, and GA permissions.";
}

async function validateGoogleAnalyticsServiceAccount() {
  const missing: string[] = [];
  const gaType = requiredEnv("GA_TYPE");
  const projectId = requiredEnv("GA_PROJECT_ID");
  const privateKeyId = requiredEnv("GA_PRIVATE_KEY_ID");
  const privateKeyRaw = requiredEnv("GA_PRIVATE_KEY");
  const clientEmail = requiredEnv("GA_CLIENT_EMAIL");

  if (!gaType) missing.push("GA_TYPE");
  if (!projectId) missing.push("GA_PROJECT_ID");
  if (!privateKeyId) missing.push("GA_PRIVATE_KEY_ID");
  if (!privateKeyRaw) missing.push("GA_PRIVATE_KEY");
  if (!clientEmail) missing.push("GA_CLIENT_EMAIL");

  if (missing.length) {
    console.error(
      `[GA][validate] missing required env var(s): ${missing.join(", ")}`,
    );
    process.exit(1);
  }

  const jsonKey = {
    type: gaType!,
    project_id: projectId!,
    private_key_id: privateKeyId!,
    private_key: privateKeyRaw!.replace(/\\n/g, "\n"),
    client_email: clientEmail!,
    // These are often present in the JSON; optional for auth but harmless:
    client_id: process.env.GA_CLIENT_ID,
    auth_uri: process.env.GA_AUTH_URI,
    token_uri: process.env.GA_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.GA_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.GA_CLIENT_X509_CERT_URL,
    universe_domain: process.env.GA_UNIVERSE_DOMAIN,
  };

  console.log(
    `[GA][validate] env ok; property=${GA_PROPERTY_ID} (set GA_PROPERTY_ID to override)`,
  );

  const auth = new GoogleAuth({
    credentials: jsonKey,
    scopes: ["https://www.googleapis.com/auth/analytics.readonly"],
  });

  const analyticsDataClient = new BetaAnalyticsDataClient({ auth });

  const dateStr = getYesterdayUTCISO();
  const property = `properties/${GA_PROPERTY_ID}`;

  console.log(`[GA][validate] running canary report for ${dateStr}...`);

  try {
    const [response] = await analyticsDataClient.runReport({
      property,
      dateRanges: [{ startDate: dateStr, endDate: dateStr }],
      metrics: [{ name: "activeUsers" }],
    });

    const value = response.rows?.[0]?.metricValues?.[0]?.value ?? "0";
    console.log(
      `[GA][validate] OK: runReport succeeded (activeUsers=${value}, date=${dateStr})`,
    );
    process.exit(0);
  } catch (err: any) {
    const status =
      err?.code ?? err?.response?.status ?? err?.status ?? err?.statusCode;

    const msg = err?.message ?? String(err);
    console.error(`[GA][validate] FAIL: ${msg}`);

    const hint = formatAuthHint(typeof status === "number" ? status : undefined, msg);
    console.error(
      `[GA][validate] hint: ${hint} (status=${status ?? "n/a"})`,
    );

    process.exit(1);
  }
}

validateGoogleAnalyticsServiceAccount().catch((e) => {
  console.error("[GA][validate] fatal", e);
  process.exit(1);
});

export default validateGoogleAnalyticsServiceAccount;