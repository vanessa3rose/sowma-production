import ReactDOM from "react-dom/client";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import GoogleExportCard from "../components/export-pdf/GoogleExportCard";
import SocialMediaExportCard from "../components/export-pdf/SocialMediaExportCard";

import type { ExportCardSelection } from "../types/exportTypes";

async function waitForFullRender(container: HTMLElement) {
  await new Promise((r) => setTimeout(r, 800));

  const images = container.querySelectorAll("img");
  if (images.length > 0) {
    await Promise.all(
      Array.from(images).map(
        (img) =>
          new Promise((resolve) => {
            if (img.complete) resolve(true);
            else {
              img.onload = () => resolve(true);
              img.onerror = () => resolve(true);
            }
          }),
      ),
    );
  }

  let attempts = 0;
  const maxAttempts = 30;

  while (attempts < maxAttempts) {
    const svgs = container.querySelectorAll("svg");

    if (svgs.length === 0) {
      await new Promise((r) => setTimeout(r, 200));
      attempts++;
      continue;
    }

    const allValid = Array.from(svgs).every((svg) => {
      const rect = svg.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    });

    if (allValid) break;

    await new Promise((r) => setTimeout(r, 200));
    attempts++;
  }

  await new Promise((r) => setTimeout(r, 1000));
}

export async function exportCardsToPDF(
  selections: ExportCardSelection[],
  filename = "metrics.pdf",
) {
  const container = document.getElementById("pdf-export-container");
  if (!container) throw new Error("Missing #pdf-export-container");

  container.innerHTML = "";
  container.style.display = "block";
  container.style.visibility = "visible";
  container.style.position = "fixed";
  container.style.left = "-9999px";
  container.style.top = "0";
  container.style.width = "1000px";
  container.style.minHeight = "900px";
  container.style.zIndex = "-1";
  container.style.background = "white";
  container.style.overflow = "hidden";

  const root = ReactDOM.createRoot(container);

  root.render(
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      {selections.map((s, i) =>
        s.type === "google" ? (
          <GoogleExportCard key={i} data={s.data} />
        ) : (
          <SocialMediaExportCard key={i} data={s.data} />
        ),
      )}
    </div>,
  );

  await waitForFullRender(container);

  const pages = [...container.querySelectorAll(".font-sans")] as HTMLElement[];

  if (pages.length === 0) {
    root.unmount();
    container.innerHTML = "";
    container.style.display = "none";
    return;
  }

  const pdf = new jsPDF("p", "pt", "letter");
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const margin = 24;

  let first = true;

  for (let i = 0; i < pages.length; i++) {
    const el = pages[i];

    if (!first) pdf.addPage();
    first = false;

    const canvas = await html2canvas(el, {
      scale: 2,
      useCORS: true,
      logging: false,
      allowTaint: false,
      backgroundColor: "#ffffff",
      windowWidth: 1000,
      windowHeight: el.scrollHeight,
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

  root.unmount();
  container.innerHTML = "";
  container.style.display = "none";
  container.style.visibility = "hidden";
}

export function usePDFExporter() {
  return { exportCardsToPDF };
}
