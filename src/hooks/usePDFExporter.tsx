// src/hooks/usePDFExporter.ts

import { useCallback } from "react";
import ReactDOM from "react-dom/client";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

import GoogleExportCard from "../components/export-pdf/GoogleExportCard";
import SocialMediaExportCard from "../components/export-pdf/SocialMediaExportCard";

import type { ExportCardSelection } from "../types/exportTypes";

export function usePDFExporter() {
  const exportCardsToPDF = useCallback(
    async (selections: ExportCardSelection[], filename = "metrics.pdf") => {
      if (!selections || selections.length === 0) return;

      const container = document.getElementById("pdf-export-container");
      if (!container) {
        console.error("Missing #pdf-export-container");
        return;
      }

      // Clear container and mount temporary React root
      container.innerHTML = "";
      const root = ReactDOM.createRoot(container);

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

      // Allow charts and layout to settle
      await new Promise((res) => setTimeout(res, 600));

      const cardEls = Array.from(container.children) as HTMLElement[];
      if (cardEls.length === 0) {
        console.error("No cards available for PDF export.");
        root.unmount();
        return;
      }

      // PDF setup
      const pdf = new jsPDF("p", "pt", "letter");
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();

      const margin = 24;
      let firstPage = true;

      for (const el of cardEls) {
        // Ensure each card gets its own page
        if (!firstPage) pdf.addPage();
        firstPage = false;

        const canvas = await html2canvas(el, {
          scale: 2,       // high resolution
          useCORS: true,
        });

        const imgData = canvas.toDataURL("image/png");
        const cardWidth = canvas.width;
        const cardHeight = canvas.height;

        const cardRatio = cardWidth / cardHeight;
        const maxW = pageW - margin * 2;
        const maxH = pageH - margin * 2;

        // Render at natural size unless it exceeds page bounds
        let renderW = cardWidth;
        let renderH = cardHeight;

        // If card is too wide → scale down
        if (renderW > maxW) {
          renderW = maxW;
          renderH = renderW / cardRatio;
        }

        // If card is still too tall → scale down
        if (renderH > maxH) {
          renderH = maxH;
          renderW = renderH * cardRatio;
        }

        // Place card at top of page with margin
        const x = margin;
        const y = margin;

        pdf.addImage(imgData, "PNG", x, y, renderW, renderH);
      }

      pdf.save(filename);

      root.unmount();
      container.innerHTML = "";
    },
    []
  );

  return { exportCardsToPDF };
}