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
        height: "550px",
        backgroundColor: "#F8FAFC",
        padding: "24px",
        borderRadius: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        boxSizing: "border-box",
      }}
      className="font-sans"
    >
      <div className="text-3xl font-bold text-black">Google</div>

      {/* ===== Top KPI Row ===== */}
      <div className="grid grid-cols-4 gap-4">
        <Tile
          label="Active Users"
          value={data.metrics.activeUsers}
          change={formatChange(data.metricSummaries.activeUsers)}
        />
        <Tile
          label="Page Views"
          value={data.metrics.screenPageViews}
          change={formatChange(data.metricSummaries.screenPageViews)}
        />
        <Tile
          label="7-Day Users"
          value={data.metrics.active7DayUsers}
          change={formatChange(data.metricSummaries.active7DayUsers)}
        />
        <Tile
          label="Engagement Rate"
          value={`${(data.metrics.engagementRate * 100).toFixed(1)}%`}
          change={formatEngagement(data.metricSummaries.engagementRate)}
        />
      </div>

      {/* ===== Middle Row ===== */}
      <div className="flex gap-4 flex-1">
        {/* New vs Returning */}
        <div className="bg-white rounded-xl shadow-sm p-4 flex-1 flex flex-col">
          <div className="text-sm font-semibold mb-2">New vs Returning Users</div>

          <div className="w-full h-full">
            <PieCharts
              data={data.returningVsNew}
              dataKey="value"
              nameKey="label"
            />
          </div>
        </div>

        {/* Active Users Trend */}
        <div className="bg-white rounded-xl shadow-sm p-4 flex-[2] flex flex-col">
          <div className="text-sm font-semibold mb-2">Active Users (trend)</div>

          <div className="w-full h-full">
            <LineCharts
              data={data.usersOverTime}
              xAxisKey="date"
              dataKeys={["activeUsers"]}
              showArea
            />
          </div>
        </div>
      </div>

      {/* ===== Bottom Row ===== */}
      <div className="flex gap-4 h-[150px]">
        {/* Pageviews Trend */}
        <div className="bg-white rounded-xl shadow-sm p-4 flex-1 flex flex-col">
          <div className="text-xs font-semibold mb-2">Pageviews</div>

          <div className="w-full h-full">
            <LineCharts
              data={data.pageviewsOverTime}
              xAxisKey="date"
              dataKeys={["screenPageViews"]}
            />
          </div>
        </div>

        {/* Engagement Rate Trend */}
        <div className="bg-white rounded-xl shadow-sm p-4 flex-1 flex flex-col">
          <div className="text-sm font-semibold mb-1">Engagement Rate</div>

          <div className="w-full h-full">
            <LineCharts
              data={data.usersOverTime}
              xAxisKey="date"
              dataKeys={["active7DayUsers"]}
              showArea
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Helpers ----------
function Tile({
  label,
  value,
  change,
}: {
  label: string;
  value: any;
  change: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-2xl font-semibold text-indigo-700">{value}</div>
      <div className="text-[10px] text-emerald-600 mt-1">{change}</div>
    </div>
  );
}

function formatChange(summary: { current: number | null; prev: number | null } | undefined) {
  if (!summary || summary.current == null || summary.prev == null) return "+0%";
  if (summary.prev === 0) return "+0%";

  const pct = ((summary.current - summary.prev) / summary.prev) * 100;
  const sign = pct >= 0 ? "+" : "";
  return `${sign}${pct.toFixed(1)}%`;
}

function formatEngagement(summary: { current: number | null; prev: number | null } | undefined) {
  if (!summary || summary.current == null || summary.prev == null) return "0";
  const delta = summary.current - summary.prev;
  const sign = delta >= 0 ? "+" : "";
  return `${sign}${delta.toFixed(1)}pp`;
}