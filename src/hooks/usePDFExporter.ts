<<<<<<< HEAD
import { useRef } from "react"; /* Stores references across renders, to prevent rerendering */
import html2canvas from "html2canvas"; /* Converts to canvas image */
import jsPDF from "jspdf"; /* Creates a pdf from images/text */

/**
 * Hook to register charts and export selected ones as a PDF.
 */
export function usePDFExporter() {
  const chartRefs = useRef<Record<string, HTMLElement | null>>({});

  /* Maps charts to specific keys (i.e. 'Twitter') */
=======
import { useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { ExportCardSelection } from "../types/exportTypes";

export function usePDFExporter() {
  const chartRefs = useRef<Record<string, HTMLElement | null>>({});

>>>>>>> 78166509fae2c72cdb48530bea1901c9689b2d52
  const registerChart = (key: string, ref: HTMLElement | null) => {
    chartRefs.current[key] = ref;
  };

<<<<<<< HEAD
  /* Exports the charts to a PDF */
=======
>>>>>>> 78166509fae2c72cdb48530bea1901c9689b2d52
  const exportChartsToPDF = async (chartKeys: string[]) => {
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();

    for (let i = 0; i < chartKeys.length; i++) {
      const element = chartRefs.current[chartKeys[i]];
      if (!element) continue;

<<<<<<< HEAD
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
      }); /* SUGGESTION: 3 scale?? */
=======
      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
>>>>>>> 78166509fae2c72cdb48530bea1901c9689b2d52
      const imgData = canvas.toDataURL("image/png");
      const imgHeight = (canvas.height * pageWidth) / canvas.width;

      if (i > 0) pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, 0, pageWidth, imgHeight);
    }

    pdf.save("selected-charts.pdf");
  };

<<<<<<< HEAD
  return { registerChart, exportChartsToPDF };
=======
  // NEW: exportCardsToPDF
  const exportCardsToPDF = async (selections: ExportCardSelection[]) => {
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();

    for (let i = 0; i < selections.length; i++) {
      const selection = selections[i];

      // Create a temporary element to render content
      const tempElement = document.createElement("div");
      tempElement.style.width = "800px"; // or your preferred width
      tempElement.style.padding = "20px";
      tempElement.innerHTML = JSON.stringify(selection.data, null, 2); // simple placeholder

      document.body.appendChild(tempElement);

      const canvas = await html2canvas(tempElement, {
        scale: 2,
        useCORS: true,
      });
      const imgData = canvas.toDataURL("image/png");
      const imgHeight = (canvas.height * pageWidth) / canvas.width;

      if (i > 0) pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, 0, pageWidth, imgHeight);

      document.body.removeChild(tempElement);
    }

    pdf.save("selected-cards.pdf");
  };

  return { registerChart, exportChartsToPDF, exportCardsToPDF };
>>>>>>> 78166509fae2c72cdb48530bea1901c9689b2d52
}
