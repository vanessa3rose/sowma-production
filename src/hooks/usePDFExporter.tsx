// ------------------------------------------------------
// usePDFExporter.ts (now exports a named function)
// ------------------------------------------------------

import ReactDOM from "react-dom/client";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import GoogleExportCard from "../components/export-pdf/GoogleExportCard";
import SocialMediaExportCard from "../components/export-pdf/SocialMediaExportCard";

import type { ExportCardSelection } from "../types/exportTypes";

// ------------------------------------------------------
// Named export: can be called globally
// ------------------------------------------------------
export async function exportCardsToPDF(
  selections: ExportCardSelection[],
  filename = "metrics.pdf"
) {
  const container = document.getElementById("pdf-export-container");
  if (!container) throw new Error("Missing #pdf-export-container");

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

  await new Promise((r) => setTimeout(r, 1500));

  const pages = [...container.children] as HTMLElement[];
  const pdf = new jsPDF("p", "pt", "letter");

  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const margin = 24;

  let first = true;

  for (const el of pages) {
    if (!first) pdf.addPage();
    first = false;

    const canvas = await html2canvas(el, { scale: 2, useCORS: true });
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
  root.unmount();
  container.innerHTML = "";
}

// ------------------------------------------------------
// Hook export still works for components
// ------------------------------------------------------
export function usePDFExporter() {
  return { exportCardsToPDF };
}