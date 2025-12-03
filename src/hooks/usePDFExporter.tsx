// src/hooks/usePDFExporter.ts

import { useCallback } from "react";
import ReactDOM from "react-dom/client";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

import GoogleExportCard from "../components/export-pdf/GoogleExportCard";
import SocialMediaExportCard from "../components/export-pdf/SocialMediaExportCard";

import type { ExportCardSelection } from "../types/exportTypes";

export function usePDFExporter() {
  // Main export function
  const exportCardsToPDF = useCallback(
    async (
      selections: ExportCardSelection[],
      filename: string = "metrics.pdf"
    ) => {
      if (!selections || selections.length === 0) return;

      // Ensure container exists
      const container = document.getElementById("pdf-export-container");
      if (!container) {
        console.error("Missing #pdf-export-container");
        return;
      }

      // Reset container & mount rendering root
      container.innerHTML = "";
      const root = ReactDOM.createRoot(container);

      // Render all cards off-screen
      root.render(
        <>
          {selections.map((s, i) =>
            s.type === "google" ? (
              <GoogleExportCard key={i} data={s.data} />
            ) : (
              <SocialMediaExportCard key={i} data={s.data} />
            )
          )}
        </>
      );

      // Allow render + charts to stabilize
      await new Promise((res) => setTimeout(res, 450));

      const cardEls = Array.from(container.children) as HTMLElement[];
      if (cardEls.length === 0) {
        console.error("No cards available for PDF export.");
        root.unmount();
        return;
      }

      // Initialize PDF
      const pdf = new jsPDF("p", "pt", "letter");
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const halfH = pageH / 2;

      let y = 0;
      let isFirst = true;

      // Convert each card → image → insert into PDF
      for (const el of cardEls) {
        const canvas = await html2canvas(el, { scale: 2 });
        const img = canvas.toDataURL("image/png");

        if (!isFirst && y + halfH > pageH) {
          pdf.addPage();
          y = 0;
        }

        pdf.addImage(img, "PNG", 0, y, pageW, halfH);

        y += halfH;
        isFirst = false;
      }

      pdf.save(filename);

      // Clean up
      root.unmount();
      container.innerHTML = "";
    },
    []
  );

  return { exportCardsToPDF };
}