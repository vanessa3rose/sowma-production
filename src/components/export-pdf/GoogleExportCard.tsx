// src/components/export-pdf/GoogleExportCard.tsx
import { GoogleAnalyticsExportBundle } from "../../types/exportTypes";
import LineCharts from "../charts/LineCharts";
import ExportDonut from "./ExportDonut"; // your custom SVG donut

interface Props {
  data: GoogleAnalyticsExportBundle;
}

export default function GoogleExportCard({ data }: Props) {
  return (
    <div
      style={{
        width: "1000px",
        minHeight: "900px",
        background: "white",
        padding: "24px",
        borderRadius: "24px",
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
        <ShadowCard>
          <Tile label="Active Users" value={data.metrics.activeUsers} />
        </ShadowCard>

        <ShadowCard>
          <Tile label="Page Views" value={data.metrics.screenPageViews} />
        </ShadowCard>

        <ShadowCard>
          <Tile label="7-Day Users" value={data.metrics.active7DayUsers} />
        </ShadowCard>

        <ShadowCard>
          <Tile
            label="Engagement Rate"
            value={`${(data.metrics.engagementRate * 100).toFixed(1)}%`}
          />
        </ShadowCard>
      </div>

      {/* MIDDLE ROW */}
      <div className="flex gap-4 h-[350px]">
        <ShadowCard className="w-1/3 flex flex-col h-full">
          <div className="text-sm font-semibold mb-2">New vs Returning Users</div>
          <div className="flex-1 min-h-[250px]">
            <ExportDonut data={data.returningVsNew} />
          </div>
        </ShadowCard>

        <ShadowCard className="w-2/3 flex flex-col">
          <div className="text-sm font-semibold mb-2">Active Users (trend)</div>
          <LineCharts
            data={data.usersOverTime}
            xAxisKey="date"
            dataKeys={["activeUsers"]}
            showArea
          />
        </ShadowCard>
      </div>

      {/* BOTTOM ROW */}
      <div className="flex gap-4 h-[350px]">
        <ShadowCard className="w-1/2 flex flex-col">
          <div className="text-sm font-semibold mb-2">Pageviews</div>
          <LineCharts
            data={data.pageviewsOverTime}
            xAxisKey="date"
            dataKeys={["screenPageViews"]}
            showArea
          />
        </ShadowCard>

        <ShadowCard className="w-1/2 flex flex-col">
          <div className="text-sm font-semibold mb-2">7-Day Users Trend</div>
          <LineCharts
            data={data.usersOverTime}
            xAxisKey="date"
            dataKeys={["active7DayUsers"]}
            showArea
          />
        </ShadowCard>
      </div>
    </div>
  );
}

function Tile({ label, value }: { label: string; value: any }) {
  return (
    <div>
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-2xl font-semibold text-indigo-700">{value}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Shadow wrapper so every card has an identical soft floating shadow */
/* ------------------------------------------------------------------ */

function ShadowCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-white rounded-2xl p-4 ${className}`}
      style={{
        boxShadow:
          "0 4px 8px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.08)",
        borderRadius: "16px",
      }}
    >
      {children}
    </div>
  );
}