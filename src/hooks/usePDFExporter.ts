import { useRef } from "react"; /* Stores references across renders, to prevent rerendering */
import html2canvas from "html2canvas"; /* Converts to canvas image */
import jsPDF from "jspdf"; /* Creates a pdf from images/text */

/**
 * Hook to register charts and export selected ones as a PDF.
 */
export function usePDFExporter() {
  const chartRefs = useRef<Record<string, HTMLElement | null>>({});

  /* Maps charts to specific keys (i.e. 'Twitter') */
  const registerChart = (key: string, ref: HTMLElement | null) => {
    chartRefs.current[key] = ref;
  };

  /* Exports the charts to a PDF */
  const exportChartsToPDF = async (chartKeys: string[]) => {
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();

    for (let i = 0; i < chartKeys.length; i++) {
      const element = chartRefs.current[chartKeys[i]];
      if (!element) continue;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
      }); /* SUGGESTION: 3 scale?? */
      const imgData = canvas.toDataURL("image/png");
      const imgHeight = (canvas.height * pageWidth) / canvas.width;

      if (i > 0) pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, 0, pageWidth, imgHeight);
    }

    pdf.save("selected-charts.pdf");
  };

  return { registerChart, exportChartsToPDF };
}
