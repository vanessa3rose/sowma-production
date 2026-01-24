import refreshAllTokens from "../../scripts/token-refresh.ts";

export async function GET(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    await refreshAllTokens();
    return new Response(JSON.stringify({ status: "ok" }), { status: 200 });
  } catch (err: any) {
    console.error("Token cron failed:", err);
    return new Response(JSON.stringify({ status: "error", message: err?.message }), { status: 500 });
  }
}