// Cards
import BigCard from "../components/cards/BigCard";
import SmallCard from "../components/cards/SmallCard";
// Charts
import LineCharts from "../components/charts/LineCharts";
import PieCharts from "../components/charts/PieCharts";

// ---------------- Types ----------------
export type GAMetrics = {
  activeUsers: number;
  screenPageViews: number;
  active7DayUsers: number;
  engagementRate: number; // 0-1 from GA; display as %
  newUsers: number;
};

export type TimePoint = {
  date: string;
  activeUsers?: number;
  screenPageViews?: number;
  active7DayUsers?: number;
};

// Data Structure for GA API
export type GAData = {
  metrics: GAMetrics;
  usersOverTime: TimePoint[];
  pageviewsOverTime: TimePoint[];
};

// Mock data ignore this code
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

// ---------------- Page ----------------
export default function GoogleAnalyticsPage({ data }: { data?: GAData }) {
  const d = data ?? mock;

  const returningUsers = Math.max(
    d.metrics.activeUsers - d.metrics.newUsers,
    0,
  );
  const returningVsNew = [
    { label: "New Users", value: d.metrics.newUsers },
    { label: "Returning Users", value: returningUsers },
  ];

  return (
    <div
      className="
        min-h-screen
        font-poppins
        bg-white text-gray-900

        p-4 md:p-6 lg:p-8
        md:ml-[290px]     /* leave space for sidebar */
        mt-[80px]         /* leave space under top navbar */
      "
    >
      {/* Header */}
      <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
            Google Analytics
          </h1>
          <p className="text-sm text-gray-500">
            Overview of site traffic and engagement
          </p>
        </div>
      </div>

      {/* ✅ KPI Row — FLEX, not grid */}
      <section className="flex flex-row flex-wrap gap-4 mb-8 justify-start">
        <SmallCard
          title="Active Users"
          displayMode="metric-only"
          className="flex-1 min-w-[200px] max-w-[250px]"
          metricValue={d.metrics.activeUsers}
          metricLabel="users"
          metricChange={"+3.1% vs. prev."}
        />

        <SmallCard
          title="Pageviews"
          displayMode="metric-only"
          className="flex-1 min-w-[200px] max-w-[250px]"
          metricValue={d.metrics.screenPageViews}
          metricLabel="views"
          metricChange={"+1.8% vs. prev."}
        />

        <SmallCard
          title="Active 7-Day Users"
          displayMode="metric-only"
          className="flex-1 min-w-[200px] max-w-[250px]"
          metricValue={d.metrics.active7DayUsers}
          metricLabel="users (7D)"
          metricChange={"+0.9% vs. prev."}
        />

        <SmallCard
          title="Engagement Rate"
          displayMode="metric-only"
          className="flex-1 min-w-[200px] max-w-[250px]"
          metricValue={Number((d.metrics.engagementRate * 100).toFixed(1))}
          metricLabel="% engaged"
          metricChange={"+0.4pp"}
        />

        <SmallCard
          title="New Users"
          displayMode="metric-only"
          className="flex-1 min-w-[200px] max-w-[250px]"
          metricValue={d.metrics.newUsers}
          metricLabel="new"
          metricChange={"+2.2% vs. prev."}
        />
      </section>

      {/* ✅ Charts Section — FLEX, WRAPS by row */}
      <section className="flex flex-wrap gap-6">
        <BigCard
          title="Active Users"
          subtitle="Last 30 days"
          displayMode="both"
          className="flex-3 min-w-[400px] max-w-[600px]"
          metricValue={d.metrics.activeUsers}
          metricLabel="total"
          metricChange={"+3.1% vs. prev."}
          chart={
            <LineCharts
              data={d.usersOverTime}
              width={500}
              height={260}
              xAxisKey="date"
              dataKeys={["activeUsers"]}
              showArea
            />
          }
        />

        <BigCard
          title="New vs Returning Users"
          displayMode="both"
          className="flex-1 min-w-[350px] max-w-[450px]"
          chart={
            <PieCharts
              data={returningVsNew}
              width={350}
              height={300}
              dataKey="value"
              nameKey="label"
            />
          }
        />

        <BigCard
          title="Pageviews"
          subtitle="Last 30 days"
          displayMode="both"
          className="flex-1 min-w-[450px] max-w-[500px]"
          metricValue={d.metrics.screenPageViews}
          metricLabel="total"
          metricChange={"+1.8% vs. prev."}
          chart={
            <LineCharts
              data={d.pageviewsOverTime}
              width={450}
              height={260}
              xAxisKey="date"
              dataKeys={["screenPageViews"]}
            />
          }
        />

        <BigCard
          title="Active 7-Day Users (trend)"
          displayMode="both"
          className="flex-1 min-w-[350px] max-w-[450px]"
          chart={
            <LineCharts
              data={d.usersOverTime}
              width={420}
              height={300}
              xAxisKey="date"
              dataKeys={["active7DayUsers"]}
              showArea
            />
          }
        />
      </section>
    </div>
  );
}
