// test.js
import { PrismaClient } from './src/generated/prisma/index.js';

const prisma = new PrismaClient();

async function main() {
  try {
    // Fetch all SocialMedia entries
    const socialMedia = await prisma.socialMedia.findMany({
      include: { metrics: true }, // include related metrics
    });
    console.log('SocialMedia entries:', socialMedia);

    // Fetch all SocialMediaMetrics entries
    const metrics = await prisma.socialMediaMetrics.findMany({
      include: { socialMedia: true }, // include related SocialMedia
    });
    console.log('SocialMediaMetrics entries:', metrics);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();