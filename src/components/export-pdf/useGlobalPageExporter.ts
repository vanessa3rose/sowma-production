import { useContext } from "react";
import { ExportContext } from "./GlobalPageExportProvider";

export function useGlobalPageExporter() {
  const ctx = useContext(ExportContext);
  if (!ctx) throw new Error("useGlobalPageExporter must be inside provider");
  return ctx;
}
