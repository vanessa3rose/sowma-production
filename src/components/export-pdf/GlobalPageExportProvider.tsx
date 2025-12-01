// components/export-pdf/GlobalPageExportProvider.tsx
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { usePDFExporter } from "../../hooks/usePDFExporter";
import HiddenExportRoot, { PAGE_IDS } from "./HiddenExportRoot";
import type { Platform } from "../../config/chartConfigs";

type ExportContextValue = {
  exportByPlatforms: (platforms: Platform[]) => Promise<void>;
};

const ExportContext = createContext<ExportContextValue | null>(null);

export function GlobalPageExportProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { registerPage, exportPagesToPDF } = usePDFExporter();

  const exportByPlatforms = useCallback(
    async (platforms: Platform[]) => {
      // Map modal selection → full-page DOM IDs
      const pageIds = platforms
        .map((platform) => {
          switch (platform) {
            case "google":
              return PAGE_IDS.google;
            case "instagram":
              return PAGE_IDS.instagram;
            case "twitter":
              return PAGE_IDS.twitter;
            case "facebook":
              return PAGE_IDS.facebook;
            default:
              return null;
          }
        })
        .filter((id): id is NonNullable<(typeof PAGE_IDS)[keyof typeof PAGE_IDS]> => id !== null)

      if (pageIds.length === 0) return;

      const filename =
        platforms.length === 1
          ? `${platforms[0]}-fullpage.pdf`
          : `sowma-export-${Date.now()}.pdf`;

      await exportPagesToPDF(pageIds, filename);
    },
    [exportPagesToPDF],
  );

  const value = useMemo(
    () => ({
      exportByPlatforms,
    }),
    [exportByPlatforms],
  );

  return (
    <ExportContext.Provider value={value}>
      {children}
      {/* Off-screen hidden full-page export components */}
      <HiddenExportRoot registerPage={registerPage} />
    </ExportContext.Provider>
  );
}

export function useGlobalPageExporter() {
  const ctx = useContext(ExportContext);
  if (!ctx) {
    throw new Error(
      "useGlobalPageExporter must be used within GlobalPageExportProvider",
    );
  }
  return ctx;
}