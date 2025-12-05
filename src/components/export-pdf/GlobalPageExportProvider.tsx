// src/components/export-pdf/GlobalPageExportProvider.tsx

import React, { createContext, useContext } from "react";
import {
  ExportCardSelection,
  SocialExportBundle,
  GoogleAnalyticsExportBundle,
} from "../../types/exportTypes";

import {
  fetchGoogleExportBundle,
  fetchSocialExportBundle,
} from "./fetchExportData";

import { Platform } from "../../config/chartConfigs";
import { usePDFExporter } from "../../hooks/usePDFExporter";

interface ExportContextValue {
  exportByPlatforms: (platforms: Platform[]) => Promise<void>;
}

const ExportContext = createContext<ExportContextValue | null>(null);

export function GlobalPageExportProvider({ children }: { children: React.ReactNode }) {
  const { exportCardsToPDF } = usePDFExporter();

  async function exportByPlatforms(platforms: Platform[]) {
    const selections: ExportCardSelection[] = [];

    for (const platform of platforms) {
      if (platform === "google") {
        const bundle: GoogleAnalyticsExportBundle =
          await fetchGoogleExportBundle();

        selections.push({
          type: "google",
          data: bundle,
        });
      } else {
        const bundle: SocialExportBundle = await fetchSocialExportBundle(
          platform
        );

        selections.push({
          type: "social",
          platform,
          data: bundle,
        });
      }
    }

    await exportCardsToPDF(selections);
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