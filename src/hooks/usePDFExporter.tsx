// src/hooks/usePDFExporter.ts
import ReactDOM from "react-dom/client";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import GoogleExportCard from "../components/export-pdf/GoogleExportCard";
import SocialMediaExportCard from "../components/export-pdf/SocialMediaExportCard";

import type { ExportCardSelection } from "../types/exportTypes";

/**
 * Wait for charts to fully render by checking if Recharts has finished
 */
async function waitForChartsToRender() {
  // Give React time to mount
  await new Promise((r) => setTimeout(r, 500));
  
  // Wait for Recharts to render (check for SVG elements)
  let attempts = 0;
  const maxAttempts = 20;
  
  while (attempts < maxAttempts) {
    const container = document.getElementById("pdf-export-container");
    if (!container) break;
    
    const svgs = container.querySelectorAll("svg");
    const hasValidCharts = Array.from(svgs).some(
      (svg) => svg.getBoundingClientRect().width > 0
    );
    
    if (hasValidCharts) {
      // Extra time to ensure everything is painted
      await new Promise((r) => setTimeout(r, 500));
      break;
    }
    
    await new Promise((r) => setTimeout(r, 100));
    attempts++;
  }
  
  // Final safety buffer
  await new Promise((r) => setTimeout(r, 500));
}

/**
 * Named export: can be called globally
 */
export async function exportCardsToPDF(
  selections: ExportCardSelection[],
  filename = "metrics.pdf"
) {
  const container = document.getElementById("pdf-export-container");
  if (!container) throw new Error("Missing #pdf-export-container");

  // Clear and render
  container.innerHTML = "";
  container.style.display = "block";
  container.style.position = "absolute";
  container.style.left = "0";
  container.style.top = "0";
  container.style.width = "1000px";
  container.style.minHeight = "900px";
  
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

  // Wait for everything to render properly
  await waitForChartsToRender();

  const pages = [...container.children] as HTMLElement[];
  const pdf = new jsPDF("p", "pt", "letter");

  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const margin = 24;

  let first = true;

  for (const el of pages) {
    if (!first) pdf.addPage();
    first = false;

    const canvas = await html2canvas(el, {
      scale: 2,
      useCORS: true,
      logging: false,
      allowTaint: true,
      backgroundColor: "#ffffff",
    });
    
    const img = canvas.toDataURL("image/png");

    const cw = canvas.width;
    const ch = canvas.height;
    const ratio = cw / ch;

    let w = cw;
    let h = ch;

    const maxW = pageW - margin * 2;
    const maxH = pageH - margin * 2;

    if (w > maxW) {
      w = maxW;
      h = w / ratio;
    }
    if (h > maxH) {
      h = maxH;
      w = h * ratio;
    }

    pdf.addImage(img, "PNG", margin, margin, w, h);
  }

  pdf.save(filename);
  
  // Cleanup
  root.unmount();
  container.innerHTML = "";
  container.style.display = "none";
}

/**
 * Hook export still works for components
 */
export function usePDFExporter() {
  return { exportCardsToPDF };
}