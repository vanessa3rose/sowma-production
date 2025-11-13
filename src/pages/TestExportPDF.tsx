import { usePDFExporter } from "../hooks/usePDFExporter";
import ExportableChartWrapper from "../components/export-pdf/ExportableChartWrapper";
import BigCard from "../components/cards/BigCard";
import LineCharts from "../components/charts/LineCharts";

export default function Homepage() {
  const { registerChart, exportChartsToPDF } = usePDFExporter();

  const mockData = [
    { day: "Mon", views: 100 },
    { day: "Tue", views: 200 },
    { day: "Wed", views: 150 },
  ];

  return (
    <div className="p-6 space-y-4">
      <button
        onClick={() => exportChartsToPDF(["Instagram"])}
        className="bg-blue-500 text-white px-4 py-2 rounded-lg"
      >
        Test Export
      </button>

      <BigCard
        title="Instagram Views"
        displayMode="chart-only"
        className="w-full h-[300px]"
        chart={
          <ExportableChartWrapper id="Instagram" register={registerChart}>
            <div className="w-full h-full">
              <LineCharts data={mockData} xAxisKey="day" dataKeys={["views"]} />
            </div>
          </ExportableChartWrapper>
        }
      />

    </div>
  );
}