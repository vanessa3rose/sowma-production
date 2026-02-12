import ReactDOM from "react-dom/client";
import type { ExportCardSelection } from "../types/exportTypes";
import type { DateRangeId } from "../components/charts/DateDropdown";
import ExportReportView from "../components/export-pdf/ExportReportView";
import { exportPDF } from "../utils/exportPDF";

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
  range: DateRangeId,
  filename = "metrics.pdf",
) {
  const containerId = "export-root";
  let container = document.getElementById(containerId);
  let created = false;

  if (!container) {
    container = document.createElement("div");
    container.id = containerId;
    document.body.appendChild(container);
    created = true;
  }

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
  root.render(<ExportReportView selections={selections} range={range} />);

  await waitForFullRender(container);
  await exportPDF(containerId, filename, { scale: 1.25 });

  root.unmount();
  if (created) {
    container.remove();
  } else {
    container.innerHTML = "";
    container.style.display = "none";
    container.style.visibility = "hidden";
  }
}

export function usePDFExporter() {
  return { exportCardsToPDF };
}
