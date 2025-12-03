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

      // Clear and mount root
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

      // Let React + charts render
      await new Promise((res) => setTimeout(res, 450));

      const cardEls = Array.from(container.children) as HTMLElement[];
      if (cardEls.length === 0) {
        console.error("No cards available for PDF export.");
        root.unmount();
        return;
      }

      const pdf = new jsPDF("p", "pt", "letter");
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const halfH = pageH / 2;

      const horizontalMargin = 24; // outer margin inside page
      const verticalMargin = 24; // margin inside each half

      let slotIndex = 0; // 0 = top half, 1 = bottom half

      for (const el of cardEls) {
        // New page if we’ve already used both slots
        if (slotIndex === 2) {
          pdf.addPage();
          slotIndex = 0;
        }

        const canvas = await html2canvas(el, { scale: 2 });
        const imgData = canvas.toDataURL("image/png");

        const slotTop = slotIndex * halfH;

        // Max drawable area inside this half-page “slot”
        const maxWidth = pageW - horizontalMargin * 2;
        const maxHeight = halfH - verticalMargin * 2;

        const imgRatio = canvas.width / canvas.height;

        // Start with max width, then clamp by height if needed
        let renderW = maxWidth;
        let renderH = renderW / imgRatio;

        if (renderH > maxHeight) {
          renderH = maxHeight;
          renderW = renderH * imgRatio;
        }

        // Center within the slot
        const x = (pageW - renderW) / 2;
        const y = slotTop + (halfH - renderH) / 2;

        pdf.addImage(imgData, "PNG", x, y, renderW, renderH);

        slotIndex += 1;
      }

      pdf.save(filename);

      root.unmount();
      container.innerHTML = "";
    },
    []
  );

  return { exportCardsToPDF };
}