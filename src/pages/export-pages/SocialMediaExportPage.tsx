// pages/export-pages/SocialMediaExportPage.tsx
import BigCard from "../../components/cards/BigCard";
import SmallCard from "../../components/cards/SmallCard";
import LineCharts from "../../components/charts/LineCharts";
import PieCharts from "../../components/charts/PieCharts";
import {
  CHART_CONFIGS,
  type Platform,
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

interface SocialMediaExportPageProps {
  platform: Platform;
  domId: string;
  registerPage: (id: string, el: HTMLElement | null) => void;
}

export default function SocialMediaExportPage({
  platform,
  domId,
  registerPage,
}: SocialMediaExportPageProps) {
  const formattedPlatform =
    platform.charAt(0).toUpperCase() + platform.slice(1);

  return (
    <div
      id={domId}
      ref={(el) => registerPage(domId, el)}
      className="w-full min-h-screen bg-white flex flex-col gap-4 px-4 py-4"
    >
      {/* Header title only */}
      <div className="w-full flex items-center mb-2">
        <h1 className="font-poppins font-semibold text-3xl lg:text-4xl">
          {formattedPlatform}
        </h1>
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-4 lg:h-full">
        {/* Sidebar small cards */}
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

        {/* Chart cards (same CHART_CONFIGS as visible page) */}
        <div className="w-full lg:w-3/4 flex flex-col gap-4 lg:h-full">
          {CHART_CONFIGS[platform].map((chart) => (
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
                      showArea
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