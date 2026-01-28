import { GoogleAnalyticsExportBundle } from "../../types/exportTypes";

/**
 * This function now simply returns the full GoogleAnalyticsExportBundle
 * already prepared inside GoogleAnalyticsPage and stored in googleRef.
 *
 * It expects ONE argument and returns ONE value.
 */
export function mapGoogleToExportData(
  bundle: GoogleAnalyticsExportBundle,
): GoogleAnalyticsExportBundle {
  return bundle;
}
