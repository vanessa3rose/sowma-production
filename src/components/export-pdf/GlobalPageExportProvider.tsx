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

interface ProviderProps {
  children: React.ReactNode;
}

// -------------------------------------------------------
// Helper: Format platform display name for export headers
// -------------------------------------------------------
function toDisplayName(slug: string): string {
  return slug.charAt(0).toUpperCase() + slug.slice(1);
}

// -------------------------------------------------------

export function GlobalPageExportProvider({ children }: ProviderProps) {
  const googleRef = useRef<any>(null);

  // Stores data for Instagram, Twitter, Facebook, etc.
  const socialRef = useRef<Record<string, any>>({});

  const { exportCardsToPDF } = usePDFExporter();

  /* ---------------- REGISTER GOOGLE ---------------- */
  const registerGoogle = (payload: any) => {
    googleRef.current = payload;
  };

  /* ---------------- REGISTER SOCIAL ---------------- */
  const registerSocial = (platform: string, payload: any) => {
    socialRef.current[platform] = payload;
  };

  /* ---------------- EXPORT FUNCTION ---------------- */
  const exportByPlatforms = useCallback(
    async (platforms: Platform[]) => {
      const selections: ExportCardSelection[] = [];

      for (const platform of platforms) {
        /* -------- GOOGLE EXPORT -------- */
        if (platform === "google" && googleRef.current) {
          selections.push({
            type: "google",
            data: mapGoogleToExportData(googleRef.current),
          });
          continue;
        }

        /* -------- SOCIAL EXPORT -------- */
        const social = socialRef.current[platform];
        if (social) {
          const displayName = toDisplayName(platform);

          const {
            chartDataMap,
            metricSummaries,
            engagementBreakdown = [
              { label: "Likes", value: 0 },
              { label: "Comments", value: 0 },
              { label: "Shares", value: 0 },
            ],
          } = social;

          selections.push({
            type: "social",
            data: mapSocialToExportData(
              displayName,

              // KPI metrics
              metricSummaries.followers?.current ?? 0,
              metricSummaries.impressions?.current ?? 0,
              metricSummaries.posts?.current ?? 0,
              metricSummaries.engagements?.current ?? 0,

              // Timeseries sets
              chartDataMap.impressions ?? [],
              chartDataMap.posts ?? [],
              chartDataMap.followers ?? [],

              // Pie breakdown
              engagementBreakdown
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