import { PrismaClient, Metric, Provider } from '../src/generated/prisma/index.js';

// Reuse Prisma client in serverless
const prisma = (globalThis as any).prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') (globalThis as any).prisma = prisma;

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { provider, metric, startDate, endDate } = req.query;

  if (!provider || !metric) {
    res.status(400).json({ error: 'Missing provider/metric' });
    return;
  }

  try {
    const metrics = await prisma.socialMediaMetrics.findMany({
      where: {
        metricName: metric as Metric,
        lastSynced: {
          gte: startDate ? new Date(startDate as string) : new Date('2000-01-01'),
          lte: endDate ? new Date(endDate as string) : new Date(),
        },
        SocialMedia: { provider: provider as Provider },
      },
      include: { SocialMedia: true },
    });

    res.setHeader('Access-Control-Allow-Origin', '*'); // allow frontend requests
    res.status(200).json(metrics);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}