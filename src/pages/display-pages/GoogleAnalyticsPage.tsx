// Cards
import BigCard from "../../components/cards/BigCard";
import SmallCard from "../../components/cards/SmallCard";
// Charts
import LineCharts from "../../components/charts/LineCharts";
import PieCharts from "../../components/charts/PieCharts";
// Buttons
import DateRangeButton from "../../components/date-range/DateRangeButton";
import ExportButton from "../../components/export-pdf/ExportButton";

// ⭐ NEW: minimal import
import { useGlobalPageExporter } from "../../components/export-pdf/GlobalPageExportProvider";

// ---------------- Types ----------------
export type GAMetrics = {
  activeUsers: number;
  screenPageViews: number;
  active7DayUsers: number;
  engagementRate: number;
  newUsers: number;
};

export type TimePoint = {
  date: string;
  activeUsers?: number;
  screenPageViews?: number;
  active7DayUsers?: number;
};

export type GAData = {
  metrics: GAMetrics;
  usersOverTime: TimePoint[];
  pageviewsOverTime: TimePoint[];
};

// mock data …
const mock: GAData = {
  metrics: {
    activeUsers: 42873,
    screenPageViews: 138422,
    active7DayUsers: 19640,
    engagementRate: 0.653,
    newUsers: 19874,
  },

  usersOverTime: Array.from({ length: 30 }).map((_, i) => {
    const date = new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);

    const au = 1200 + Math.round(250 * Math.sin(i / 4) + Math.random() * 120);

    const a7 =
      7000 + Math.round(800 * Math.sin((i + 2) / 5) + Math.random() * 200);

    return { date, activeUsers: au, active7DayUsers: a7 };
  }),

  pageviewsOverTime: Array.from({ length: 30 }).map((_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10),
    screenPageViews:
      4000 + Math.round(600 * Math.cos(i / 5) + Math.random() * 200),
  })),
};

export default function GoogleAnalyticsPage() {
  const d = mock;

  const { exportByPlatforms } = useGlobalPageExporter();

  const returningUsers = Math.max(
    d.metrics.activeUsers - d.metrics.newUsers,
    0,
  );
  const returningVsNew = [
    { label: "New Users", value: d.metrics.newUsers },
    { label: "Returning Users", value: returningUsers },
  ];

  return (
    <div className="w-full min-h-screen lg:h-full bg-white flex flex-col gap-4">
      {/* Header */}
      <div className="w-full flex flex-col lg:flex-row justify-between items-center px-4 py-2">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => (window.location.href = "/")}
            className="w-[40px] h-[40px]"
          >
            <svg/>
          </button>
          <h1 className="font-poppins font-semibold text-3xl lg:text-4xl">
            Google
          </h1>
        </div>
        <div className="flex space-x-2 mt-2 lg:mt-0">
          <DateRangeButton />
          <ExportButton onExport={exportByPlatforms} />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col gap-4 px-4 lg:h-full">
        {/* Top Row Small Cards */}
        <div className="w-full flex flex-col lg:flex-row gap-4">
          <SmallCard
            title="Active Users"
            displayMode="metric-only"
            className="w-full h-full"
            metricValue={d.metrics.activeUsers}
            metricLabel="users"
            metricChange={"+3.1% vs. prev."}
          />
          <SmallCard
            title="Page Views"
            displayMode="metric-only"
            className="w-full h-full"
            metricValue={d.metrics.screenPageViews}
            metricLabel="views"
            metricChange={"+1.8% vs. prev."}
          />
          <SmallCard
            title="Active 7-Day Users"
            displayMode="metric-only"
            className="w-full h-full"
            metricValue={d.metrics.active7DayUsers}
            metricLabel="users (7D)"
            metricChange={"+0.9% vs. prev."}
          />
          <SmallCard
            title="Engagement Rate"
            displayMode="metric-only"
            className="w-full h-full"
            metricValue={Number((d.metrics.engagementRate * 100).toFixed(1))}
            metricLabel="% engaged"
            metricChange={"+0.4pp"}
          />
          <SmallCard
            title="New Users"
            displayMode="metric-only"
            className="w-full h-full"
            metricValue={Number(d.metrics.newUsers.toFixed(1))}
            metricLabel="new"
            metricChange={"+2.2% vs prev."}
          />
        </div>

        {/* Large Chart Cards */}
        <div className="w-full flex flex-col gap-4 lg:h-full">
          {/* First Row */}
          <div className="flex flex-col lg:flex-row gap-4 lg:h-full">
            <div className="lg:w-2/3">
              <BigCard
                title="Active Users"
                subtitle="Last 30 days"
                metricValue={d.metrics.activeUsers}
                metricLabel="total"
                metricChange={"+3.1% vs. prev."}
                chart={
                  <div className="w-full h-64">
                    <LineCharts
                      data={d.usersOverTime}
                      xAxisKey="date"
                      dataKeys={["activeUsers"]}
                      showArea
                    />
                  </div>
                }
                displayMode="both"
                className="w-full h-full"
              />
            </div>
            <div className="lg:w-1/3">
              <BigCard
                title="New vs Returning Users"
                chart={
                  <div className="w-full h-64">
                    <PieCharts
                      data={returningVsNew}
                      dataKey="value"
                      nameKey="label"
                    />
                  </div>
                }
                displayMode="both"
                className="w-full h-full"
              />
            </div>
          </div>

          {/* Second Row */}
          <div className="flex flex-col lg:flex-row gap-4 lg:h-full">
            <div className="lg:w-1/2">
              <BigCard
                title="Pageviews"
                subtitle="Last 30 days"
                metricValue={d.metrics.screenPageViews}
                metricLabel="total"
                metricChange={"+1.8% vs. prev."}
                chart={
                  <div className="w-full h-64">
                    <LineCharts
                      data={d.pageviewsOverTime}
                      xAxisKey="date"
                      dataKeys={["screenPageViews"]}
                    />
                  </div>
                }
                displayMode="both"
                className="w-full h-full"
              />
            </div>
            <div className="lg:w-1/2">
              <BigCard
                title="Active 7-Day Users (trend)"
                chart={
                  <div className="w-full h-64">
                    <LineCharts
                      data={d.usersOverTime}
                      xAxisKey="date"
                      dataKeys={["active7DayUsers"]}
                      showArea
                    />
                  </div>
                }
                displayMode="both"
                className="w-full h-full"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
