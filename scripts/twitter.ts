import { PrismaClient } from "../src/generated/prisma";
const prisma = new PrismaClient();

export async function fetchTwitterMetrics(username: string) {
  const res = await fetch(`https://api.twitter.com/2/users/by/username/${username}?user.fields=public_metrics`, {
    headers: { Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}` },
  });
  if (!res.ok) throw new Error("Twitter API failed");
  const data = await res.json();
  return data.data.public_metrics;
}

export async function syncTwitterMetrics() {
  const accounts = await prisma.socialMedia.findMany({ where: { provider: "TWITTER" } });

  for (const account of accounts) {
    try {
      const metrics = await fetchTwitterMetrics(account.username);
      await prisma.socialMediaMetrics.create({
        data: {
          socialMediaId: account.id,
          metricName: metrics.name,
          metric
          lastSynced: new Date(),
        },
      });
      console.log(`✅ Synced ${account.username}`);
    } catch (err) {
      console.error(`❌ Failed syncing ${account.username}`, err);
    }
  }

  await prisma.$disconnect();
}

if (require.main === module) {
  syncTwitterMetrics();
}