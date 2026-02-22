import React, { createContext, useContext } from "react";
import {
  ExportCardSelection,
  SocialExportBundle,
  GoogleAnalyticsExportBundle,
} from "../../types/exportTypes";
import type { DateRangeId } from "../charts/DateDropdown";

import { fetchGoogleExportBundle } from "../../../scripts/export-pdf/fetchExportData.js";
import { fetchSocialExportBundle } from "../../../scripts/export-pdf/fetchSocialExportBundle.js";

import { Platform } from "../../config/chartConfigs";
import { usePDFExporter } from "../../hooks/usePDFExporter";

interface ExportContextValue {
  exportByPlatforms: (
    platforms: Platform[],
    range: DateRangeId,
  ) => Promise<void>;
}

const ExportContext = createContext<ExportContextValue | null>(null);

export function GlobalPageExportProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { exportCardsToPDF } = usePDFExporter();

  async function exportByPlatforms(platforms: Platform[], range: DateRangeId) {
    const selections: ExportCardSelection[] = [];

    for (const platform of platforms) {
      if (platform === "google") {
        // ✅ leave GA path exactly as-is
        const bundle: GoogleAnalyticsExportBundle =
          await fetchGoogleExportBundle(range);

        selections.push({
          type: "google",
          data: bundle,
        });
      } else {
        // ⭐ NEW: independent social export path
        const bundle: SocialExportBundle = await fetchSocialExportBundle(
          platform,
          range,
        );

        selections.push({
          type: "social",
          platform,
          data: bundle,
        });
      }
    }

    await exportCardsToPDF(selections, range, "metrics.pdf");
  }

  return (
    <ExportContext.Provider value={{ exportByPlatforms }}>
      {children}
    </ExportContext.Provider>
  );
}

export function useGlobalPageExporter() {
  const ctx = useContext(ExportContext);
  if (!ctx) throw new Error("useGlobalPageExporter must be inside provider");
  return ctx;
}
