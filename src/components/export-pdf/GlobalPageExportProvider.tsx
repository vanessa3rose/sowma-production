// src/components/export-pdf/GlobalPageExportProvider.tsx

import React, { createContext, useContext, useRef, useCallback } from "react";
import { usePDFExporter } from "../../hooks/usePDFExporter";

import { mapGoogleToExportData } from "./mapGoogleData";
import { mapSocialToExportData } from "./mapSocialData";

import type { Platform } from "../../config/chartConfigs";
import type { ExportCardSelection } from "../../types/exportTypes";

// -----------------------------
// Context Types
// -----------------------------
interface ExportContextType {
  registerGoogle: (payload: any) => void;
  registerSocial: (platform: string, payload: any) => void;
  exportByPlatforms: (platforms: Platform[]) => Promise<void>;
}

const ExportContext = createContext<ExportContextType | null>(null);

// -----------------------------
interface ProviderProps {
  children: React.ReactNode;
}
// -----------------------------

export function GlobalPageExportProvider({ children }: ProviderProps) {
  const googleRef = useRef<any>(null);
  const socialRef = useRef<Record<string, any>>({});

  const { exportCardsToPDF } = usePDFExporter();

  // Save bundle from GoogleAnalyticsPage
  const registerGoogle = (payload: any) => {
    googleRef.current = payload;
  };

  // Save bundle from SocialMediaPage
  const registerSocial = (platform: string, payload: any) => {
    socialRef.current[platform] = payload;
  };

  // -----------------------------
  // MAIN EXPORT ENTRY POINT
  // -----------------------------
  const exportByPlatforms = useCallback(
    async (platforms: Platform[]) => {
      const selections: ExportCardSelection[] = [];

      for (const platform of platforms) {
        // GOOGLE EXPORT
        if (platform === "google" && googleRef.current) {
          selections.push({
            type: "google",
            data: mapGoogleToExportData(googleRef.current),
          });
        }

        // SOCIAL EXPORT
        const socialBundle = socialRef.current[platform];
        if (socialBundle) {
          selections.push({
            type: "social",
            data: mapSocialToExportData(
              platform,
              socialBundle.chartDataMap,
              socialBundle.metricSummaries
            ),
          });
        }
      }

      await exportCardsToPDF(selections);
    },
    [exportCardsToPDF]
  );

  return (
    <ExportContext.Provider
      value={{
        registerGoogle,
        registerSocial,
        exportByPlatforms,
      }}
    >
      {children}
    </ExportContext.Provider>
  );
}

export const useGlobalPageExporter = () => {
  const ctx = useContext(ExportContext);
  if (!ctx) throw new Error("useGlobalPageExporter must be inside provider");
  return ctx;
};