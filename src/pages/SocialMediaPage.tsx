import DateRangeButton from "../components/date-range/DateRangeButton";
import ExportButton from "../components/export-pdf/ExportButton";
import BigCard from "../components/cards/BigCard";
import SmallCard from "../components/cards/SmallCard";
import LineCharts from "../components/charts/LineCharts";
import PieCharts from "../components/charts/PieCharts";

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
          <h1 className="font-poppins font-semibold text-3xl lg:text-4xl">Instagram</h1>
        </div>
        <div className="flex space-x-2 mt-2 lg:mt-0">
          <DateRangeButton />
          <ExportButton />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-4 px-4 lg:h-full">
        {/* Sidebar Cards */}
        <div className="w-full lg:w-1/4 flex flex-col gap-4 lg:h-full">
          <SmallCard title="Followers" displayMode="both" className="w-full h-full" />
          <SmallCard title="Comments" displayMode="both" className="w-full h-full" />
          <SmallCard title="Likes" displayMode="both" className="w-full h-full" />
          <SmallCard title="Shared" displayMode="both" className="w-full h-full" />
        </div>

        {/* Chart Cards */}
        <div className="w-full lg:w-3/4 flex flex-col gap-4 lg:h-full">
          {/* First Row */}
          <div className="flex flex-col lg:flex-row gap-4 lg:h-full">
            <BigCard
              title="Impressions"
              chart={
                <div className="w-full h-[300px] lg:h-[500px]">
                  <LineCharts
                    data={lineTestData}
                    width="100%"
                    height="100%"
                    xAxisKey="date"
                    dataKeys={["likes"]}
                    showArea={true}
                  />
                </div>
              }
              displayMode="both"
              className="w-full h-full"
            />
            <BigCard
              title="Demographics - Gender"
              chart={
                <div className="w-full h-[400px] lg:h-[600px]">
                  <PieCharts
                    data={pieTestData}
                    width="100%"
                    height="100%"
                    dataKey="value"
                    nameKey="source"
                  />
                </div>
              }
              displayMode="both"
              className="w-full h-full"
            />
          </div>

          {/* Second Row */}
          <div className="flex flex-col lg:flex-row gap-4 lg:h-full">
            <BigCard
              title="Reach Sources"
              chart={
                <div className="w-full h-[400px] lg:h-[600px]">
                  <PieCharts
                    data={pieTestData}
                    width="100%"
                    height="100%"
                    dataKey="value"
                    nameKey="source"
                  />
                </div>
              }
              displayMode="both"
              className="w-full h-full"
            />
            <BigCard
              title="Days Posted"
              chart={
                <div className="w-full h-[300px] lg:h-[600px]" />
              }
              displayMode="both"
              className="w-full h-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}