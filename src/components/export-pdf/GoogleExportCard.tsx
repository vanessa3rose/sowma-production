// src/components/export-pdf/GoogleExportCard.tsx
import { GoogleAnalyticsExportBundle } from "../../types/exportTypes";
import LineCharts from "../charts/LineCharts";
import PieCharts from "../charts/PieCharts";

interface Props {
  data: GoogleAnalyticsExportBundle;
}

export default function GoogleExportCard({ data }: Props) {
  return (
    <div
      style={{
        width: "1000px",
        minHeight: "900px",
        background: "#F8FAFC",
        padding: "24px",
        borderRadius: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        boxSizing: "border-box",
      }}
      className="font-sans"
    >
      <h1 className="text-4xl font-bold">Google</h1>

      {/* KPI ROW */}
      <div className="grid grid-cols-4 gap-4">
        <Tile label="Active Users" value={data.metrics.activeUsers} />
        <Tile label="Page Views" value={data.metrics.screenPageViews} />
        <Tile label="7-Day Users" value={data.metrics.active7DayUsers} />
        <Tile
          label="Engagement Rate"
          value={`${(data.metrics.engagementRate * 100).toFixed(1)}%`}
        />
      </div>

      {/* MIDDLE ROW */}
      <div className="flex gap-4 h-[350px]">
        {/* Pie: New vs Returning */}
        <div className="bg-white rounded-xl shadow-sm p-4 w-1/3 flex flex-col">
          <div className="text-sm font-semibold mb-2">New vs Returning Users</div>
          <PieCharts
            data={data.returningVsNew}
            dataKey="value"
            nameKey="label"
          />
        </div>

        {/* Line: Active Users */}
        <div className="bg-white rounded-xl shadow-sm p-4 w-2/3 flex flex-col">
          <div className="text-sm font-semibold mb-2">Active Users (trend)</div>
          <LineCharts
            data={data.usersOverTime}
            xAxisKey="date"
            dataKeys={["activeUsers"]}
            showArea
          />
        </div>
      </div>

      {/* BOTTOM ROW */}
      <div className="flex gap-4 h-[350px]">
        <div className="bg-white rounded-xl shadow-sm p-4 w-1/2 flex flex-col">
          <div className="text-sm font-semibold mb-2">Pageviews</div>
          <LineCharts
            data={data.pageviewsOverTime}
            xAxisKey="date"
            dataKeys={["screenPageViews"]}
            showArea
          />
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 w-1/2 flex flex-col">
          <div className="text-sm font-semibold mb-2">7-Day Users Trend</div>
          <LineCharts
            data={data.usersOverTime}
            xAxisKey="date"
            dataKeys={["active7DayUsers"]}
            showArea
          />
        </div>
      </div>
    </div>
  );
}

function Tile({ label, value }: { label: string; value: any }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-2xl font-semibold text-indigo-700">{value}</div>
    </div>
  );
}