import refreshAllTokens from "./refreshAllTokens";

export async function GET(req: Request) {
  // checks the cron secret
  if (req.headers.get("Authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  await refreshAllTokens();

  return new Response(JSON.stringify({ status: "ok" }), { status: 200 });
}