// src/pages/TestExportPDF.tsx
import { usePDFExporter } from "../hooks/usePDFExporter";
import ExportableChartWrapper from "../components/export-pdf/ExportableChartWrapper";

export default function TestExportPDF() {
  const { registerChart, exportChartsToPDF } = usePDFExporter();

  return (
    <div className="p-6 space-y-4 border-2 border-dashed border-red-400">
      <h1 className="text-black text-xl">Test Export Page</h1>

      <button
        onClick={() => exportChartsToPDF(["box1"])}
        className="bg-blue-500 text-white px-4 py-2 rounded-lg"
      >
        Test Export
      </button>

      <ExportableChartWrapper id="box1" register={registerChart}>
        <div className="w-full max-w-xl h-48 bg-white text-black grid place-items-center shadow">
          <p>Simple box to snapshot</p>
        </div>
      </ExportableChartWrapper>
    </div>
  );
}