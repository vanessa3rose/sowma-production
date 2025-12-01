// pages/SocialMediaPage.tsx
import { useRoute } from "wouter";
import DateRangeButton from "../../components/date-range/DateRangeButton";
import ExportButton from "../../components/export-pdf/ExportButton";
import BigCard from "../../components/cards/BigCard";
import SmallCard from "../../components/cards/SmallCard";
import LineCharts from "../../components/charts/LineCharts";
import PieCharts from "../../components/charts/PieCharts";
import { useGlobalPageExporter } from "../../components/export-pdf/GlobalPageExportProvider";
import {
  CHART_CONFIGS,
  Platform,
} from "../../config/chartConfigs";

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
  const [_, params] = useRoute("/social/:platform");
  const platform = (params?.platform as Platform) || null;

  const formattedPlatform = platform
    ? platform.charAt(0).toUpperCase() + platform.slice(1)
    : "Social Media";

  const { exportByPlatforms } = useGlobalPageExporter();

  const handleExport = (selectedPlatforms: Platform[]) =>
    exportByPlatforms(selectedPlatforms);

  return (
    <div className="w-full min-h-screen lg:h-full bg-white flex flex-col gap-4">
      {/* Header */}
      <div className="w-full flex flex-col lg:flex-row justify-between items-center px-4 py-2">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => (window.location.href = "/")}
            className="w-[40px] h-[40px]"
          >
            {/* back arrow svg */}
          </button>
          <h1 className="font-poppins font-semibold text-3xl lg:text-4xl">
            {formattedPlatform}
          </h1>
        </div>
        <div className="flex space-x-2 mt-2 lg:mt-0">
          <DateRangeButton />
          <ExportButton onExport={handleExport} />
        </div>
      </div>

      {/* Main Content (unchanged, but no ExportableChartWrapper now) */}
      <div className="flex flex-col lg:flex-row gap-4 px-4 lg:h-full">
        {/* Sidebar cards */}
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

        {/* Chart cards */}
        <div className="w-full lg:w-3/4 flex flex-col gap-4 lg:h-full">
          {platform &&
            CHART_CONFIGS[platform].map((chart) => (
              <BigCard
                key={`${platform}-${chart.id}`}
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
            ))}
        </div>
      </div>
    </div>
  );
}