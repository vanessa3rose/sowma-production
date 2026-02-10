import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export type ExportPDFOptions = {
  scale?: number;
};

export async function exportPDF(
  elementId: string,
  fileName = "export.pdf",
  options: ExportPDFOptions = {},
) {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id "${elementId}" not found.`);
    return;
  }

  const renderScale = options.scale ?? 1.25;

  const pageElements = Array.from(
    element.querySelectorAll<HTMLElement>("[data-export-page]"),
  );

  // Create the PDF
  const pdf = new jsPDF("p", "pt", "letter");
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  const margin = 24;
  const maxW = pdfWidth - margin * 2;
  const maxH = pdfHeight - margin * 2;

  if (pageElements.length > 0) {
    for (let i = 0; i < pageElements.length; i++) {
      const pageEl = pageElements[i];
      const canvas = await html2canvas(pageEl, {
        scale: renderScale,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const fitScale = Math.min(maxW / canvas.width, maxH / canvas.height, 1);
      const imgWidth = canvas.width * fitScale;
      const imgHeight = canvas.height * fitScale;

      if (i > 0) pdf.addPage();
      pdf.addImage(
        canvas.toDataURL("image/png"),
        "PNG",
        margin,
        margin,
        imgWidth,
        imgHeight,
      );
    }

    pdf.save(fileName);
    return;
  }

  // Render the component to a high-quality canvas
  const canvas = await html2canvas(element, {
    scale: renderScale,
    useCORS: true,
    backgroundColor: "#ffffff",
  });
  const imgData = canvas.toDataURL("image/png");

  const imgWidth = pdfWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  if (imgHeight <= pdfHeight) {
    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
    pdf.save(fileName);
    return;
  }

  const pageCanvas = document.createElement("canvas");
  const pageCtx = pageCanvas.getContext("2d");

  const sliceScale = imgWidth / canvas.width;
  const pageHeightPx = Math.floor(pdfHeight / sliceScale);

  let renderedHeight = 0;
  let page = 0;

  while (renderedHeight < canvas.height) {
    const sliceHeight = Math.min(pageHeightPx, canvas.height - renderedHeight);
    pageCanvas.width = canvas.width;
    pageCanvas.height = sliceHeight;

    if (pageCtx) {
      pageCtx.clearRect(0, 0, pageCanvas.width, pageCanvas.height);
      pageCtx.drawImage(
        canvas,
        0,
        renderedHeight,
        canvas.width,
        sliceHeight,
        0,
        0,
        canvas.width,
        sliceHeight,
      );
    }

    const pageData = pageCanvas.toDataURL("image/png");
    const pageImgHeight = (sliceHeight * imgWidth) / canvas.width;

    if (page > 0) pdf.addPage();
    pdf.addImage(pageData, "PNG", 0, 0, imgWidth, pageImgHeight);

    renderedHeight += sliceHeight;
    page++;
  }

  pdf.save(fileName);
}
