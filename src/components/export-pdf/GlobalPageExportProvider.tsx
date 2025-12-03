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

// Properly typed context
const ExportContext = createContext<ExportContextType | null>(null);

// -----------------------------
// Provider Props
// -----------------------------
interface ProviderProps {
  children: React.ReactNode;
}

// -----------------------------
// Provider Component
// -----------------------------
export function GlobalPageExportProvider({ children }: ProviderProps) {
  const googleRef = useRef<any>(null);
  const socialRef = useRef<Record<string, any>>({});

  const { exportCardsToPDF } = usePDFExporter(); // <-- works properly now

  const registerGoogle = (payload: any) => {
    googleRef.current = payload;
  };

  const registerSocial = (platform: string, payload: any) => {
    socialRef.current[platform] = payload;
  };

  const exportByPlatforms = useCallback(
    async (platforms: Platform[]) => {
      const selections: ExportCardSelection[] = [];

      for (const platform of platforms) {
        // GOOGLE
        if (platform === "google" && googleRef.current) {
          const g = googleRef.current;
          selections.push({
            type: "google",
            data: mapGoogleToExportData(
              g.metrics,
              g.usersOverTime,
              g.pageviewsOverTime,
              g.returningVsNew,
              g.metricSummaries
            ),
          });
        }

        // SOCIAL MEDIA
        if (socialRef.current[platform]) {
          const s = socialRef.current[platform];
          selections.push({
            type: "social",
            data: mapSocialToExportData(
              platform,
              s.chartDataMap,
              s.metricSummaries
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

// -----------------------------
// Hook for consumers
// -----------------------------
export const useGlobalPageExporter = () => {
  const ctx = useContext(ExportContext);
  if (!ctx) throw new Error("useGlobalPageExporter must be inside provider");
  return ctx;
};