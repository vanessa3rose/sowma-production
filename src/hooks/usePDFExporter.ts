// src/hooks/usePDFExporter.ts
import { useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

/**
 * A generic exporter that registers PAGE containers (not individual charts),
 * then exports selected pages as PDF images.
 */
export function usePDFExporter() {
  // Map of pageId → HTMLElement
  const pageRefs = useRef<Record<string, HTMLElement | null>>({});

  /**
   * Called by HiddenExportRoot to register each hidden export page.
   */
  const registerPage = (pageId: string, el: HTMLElement | null) => {
    pageRefs.current[pageId] = el;
  };

  /**
   * Given a list of page IDs, capture each one and build a multipage PDF.
   */
  const exportPagesToPDF = async (
    pageIds: string[],
    filename: string = "export.pdf"
  ) => {
    if (!pageIds.length) return;

    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();

    let isFirst = true;

    for (const pageId of pageIds) {
      const el = pageRefs.current[pageId];
      if (!el) continue;

      // Render DOM → canvas
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const imgHeight = (canvas.height * pageWidth) / canvas.width;

      if (!isFirst) pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, 0, pageWidth, imgHeight);

      isFirst = false;
    }

    pdf.save(filename);
  };

  return {
    registerPage,
    exportPagesToPDF,
  };
}