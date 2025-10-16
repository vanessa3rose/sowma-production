import {
  createSocialMediaMetric,
  getAllSocialMediaMetrics,
  getMetricsBySocialMediaId,
  updateSocialMediaMetric,
  deleteSocialMediaMetric,
  closePrisma,
} from "../social-media-metrics"; // adjust path as needed
import { Metric } from "../../generated/prisma";

async function testCRUD() {
  try {
    console.log("----CREATE----");

    // Replace this ID with a valid socialMediaId from your database
    const testSocialMediaId = "replace-with-valid-socialMediaId";

    const created = await createSocialMediaMetric({
      socialMediaId: testSocialMediaId,
      metricName: Metric.FOLLOWERS,
      metricValue: 123,
      lastSynced: new Date(),
    });
    console.log("Created:", created);

    console.log("\n----GET ALL----");
    const all = await getAllSocialMediaMetrics();
    console.log("Get all:", all);

    console.log("\n----GET BY SOCIAL MEDIA ID----");
    const bySocialMediaId = await getMetricsBySocialMediaId(testSocialMediaId);
    console.log("Metrics for socialMediaId:", bySocialMediaId);

    console.log("\n----UPDATE----");
    const updated = await updateSocialMediaMetric(created.id, {
      metricValue: 456,
    });
    console.log("Updated:", updated);

    console.log("\n----DELETE----");
    const deleted = await deleteSocialMediaMetric(created.id);
    console.log("Deleted:", deleted);

    console.log("\n----FINAL----");
    const final = await getAllSocialMediaMetrics();
    console.log("Final:", final);
  } catch (error) {
    console.error("CRUD test error:", error);
  } finally {
    await closePrisma();
  }
}

testCRUD();
