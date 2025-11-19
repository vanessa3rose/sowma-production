import { useRoute } from "wouter";
import DateRangeButton from "../components/date-range/DateRangeButton";
import ExportButton from "../components/export-pdf/ExportButton";
import BigCard from "../components/cards/BigCard";
import SmallCard from "../components/cards/SmallCard";
import LineCharts from "../components/charts/LineCharts";
import PieCharts from "../components/charts/PieCharts";

/* PDF Export imports */
import ExportableChartWrapper from "../components/export-pdf/ExportableChartWrapper";
import { usePDFExporter } from "../hooks/usePDFExporter";
import {
  CHART_CONFIGS,
  Platform,
  buildChartDomId,
} from "../config/chartConfigs";

const pieTestData = [
  { source: "Organic", value: 400 },
  { source: "Paid", value: 300 },
  { source: "Referral", value: 200 },
  { source: "Social", value: 100 },
];

const lineTestData = [
  { date: "01", followers: 100, likes: 20, comments: 5 },
  { date: "02", followers: 120, likes: 35, comments: 8 },
  { date: "03", followers: 140, likes: 50, comments: 10 },
  { date: "04", followers: 160, likes: 45, comments: 7 },
  { date: "05", followers: 180, likes: 60, comments: 12 },
];

export default function SocialMediaPage() {
  // ⭐ Using Wouter's dynamic route match
  // Don't use match, so override
  const [_, params] = useRoute("/social/:platform");
  const platform = (params?.platform as Platform) || null;

  const formattedPlatform = platform
    ? platform.charAt(0).toUpperCase() + platform.slice(1)
    : "Social Media";

  // PDF Exporter Hook
  const { registerChart, exportChartsToPDF } = usePDFExporter();

  /**
   * Export handler passed down to ExportButton / ExportModal.
   * Given an array of platforms, we construct the chart IDs
   * that match the IDs used in ExportableChartWrapper.
   *
   * NOTE: It's safe if some IDs don't exist on the current page;
   * exportChartsToPDF will simply skip any missing elements.
   */
  const handleExport = async (selectedPlatforms: Platform[]) => {
    const chartIds = selectedPlatforms.flatMap((platformKey) =>
      CHART_CONFIGS[platformKey].map((chart) =>
        buildChartDomId(platformKey, chart.id),
      ),
    );

    const filename =
      selectedPlatforms.length === 1
        ? `${selectedPlatforms[0]}-charts.pdf`
        : `social-charts-${Date.now()}.pdf`;

    await exportChartsToPDF(chartIds, filename);
  };

  return (
    <div className="w-full min-h-screen lg:h-full bg-white flex flex-col gap-4">
      {/* Header */}
      <div className="w-full flex flex-col lg:flex-row justify-between items-center px-4 py-2">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => (window.location.href = "/")}
            className="w-[40px] h-[40px]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="size-7"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5 8.25 12l7.5-7.5"
              />
            </svg>
          </button>
          <h1 className="font-poppins font-semibold text-3xl lg:text-4xl">
            {formattedPlatform}
          </h1>
        </div>
        <div className="flex space-x-2 mt-2 lg:mt-0">
          <DateRangeButton />
          {/* Export button now triggers export */}
          <ExportButton onExport={handleExport} />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-4 px-4 lg:h-full">
        {/* Sidebar Cards */}
        <div className="w-full lg:w-1/4 flex flex-col gap-4 lg:h-full">
          <SmallCard
            title="Followers"
            displayMode="both"
            className="w-full h-full"
          />
          <SmallCard
            title="Comments"
            displayMode="both"
            className="w-full h-full"
          />
          <SmallCard
            title="Likes"
            displayMode="both"
            className="w-full h-full"
          />
          <SmallCard
            title="Shared"
            displayMode="both"
            className="w-full h-full"
          />
        </div>

        {/* Chart Cards (Dynamic) */}
        <div className="w-full lg:w-3/4 flex flex-col gap-4 lg:h-full">
          {platform &&
            CHART_CONFIGS[platform].map((chart) => {
              const chartDomId = buildChartDomId(platform, chart.id);

              return (
                <ExportableChartWrapper
                  // React key attached to outermost mapped element
                  key={chartDomId}
                  // ID used by usePDFExporter to look up this chart's DOM node
                  id={chartDomId}
                  register={registerChart}
                >
                  <BigCard
                    title={chart.title}
                    displayMode="both"
                    className="w-full h-full"
                    chart={
                      <div className="w-full">
                        {chart.type === "line" ? (
                          <LineCharts
                            data={lineTestData}
                            xAxisKey="date"
                            dataKeys={["followers", "likes", "comments"]}
                            showArea={true}
                          />
                        ) : (
                          <PieCharts
                            data={pieTestData}
                            dataKey="value"
                            nameKey="source"
                          />
                        )}
                      </div>
                    }
                  />
                </ExportableChartWrapper>
              );
            })}
        </div>
      </div>
    </div>
  );
}
