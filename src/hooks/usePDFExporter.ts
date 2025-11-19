import { useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

/**
 * Hook to register charts AND full pages and export them as a PDF.
 */
export function usePDFExporter() {
  const chartRefs = useRef<Record<string, HTMLElement | null>>({});
  const pageRefs = useRef<Record<string, HTMLElement | null>>({});

  /* Maps charts to specific keys (i.e. 'Twitter') */
  const registerChart = (key: string, ref: HTMLElement | null) => {
    chartRefs.current[key] = ref;
  };

<<<<<<< HEAD
  /* Register a full-page container by ID */
  const registerPage = (id: string, ref: HTMLElement | null) => {
    pageRefs.current[id] = ref;
  };

  const exportElementsToPDF = async (
    refs: Record<string, HTMLElement | null>,
    keys: string[],
    filename = "export.pdf",
  ) => {
=======
  /* Exports the charts to a PDF */
  const exportChartsToPDF = async (chartKeys: string[], filename = "selected-charts.pdf") => {
>>>>>>> 0eb8d39 (Initial Proposal)
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    let firstPage = true;

    for (const key of keys) {
      const element = refs[key];
      if (!element) continue;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
      });
      const imgData = canvas.toDataURL("image/png");
      const imgHeight = (canvas.height * pageWidth) / canvas.width;

      if (!firstPage) {
        pdf.addPage();
      } else {
        firstPage = false;
      }

      pdf.addImage(imgData, "PNG", 0, 0, pageWidth, imgHeight);
    }

    pdf.save(filename);
  };

  /* Existing chart-based export (still available if you want it) */
  const exportChartsToPDF = async (
    chartKeys: string[],
    filename = "selected-charts.pdf",
  ) => exportElementsToPDF(chartRefs.current, chartKeys, filename);

  /* NEW: page-level export */
  const exportPagesToPDF = async (
    pageIds: string[],
    filename = "pages-export.pdf",
  ) => exportElementsToPDF(pageRefs.current, pageIds, filename);

  return { registerChart, exportChartsToPDF, registerPage, exportPagesToPDF };
}