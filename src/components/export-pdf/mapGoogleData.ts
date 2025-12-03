// src/components/export-pdf/mapGoogleData.ts

import { GoogleAnalyticsExportBundle } from "../../types/exportTypes";

/**
 * GoogleAnalyticsExportBundle ALREADY matches the shape
 * that GoogleExportCard expects.
 *
 * Therefore, we do NOT transform it.
 */
export function mapGoogleToExportData(
  bundle: GoogleAnalyticsExportBundle
): GoogleAnalyticsExportBundle {
  return bundle;
}