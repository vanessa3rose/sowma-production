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
        <SoftCard>
          <Tile label="Active Users" value={data.metrics.activeUsers} />
        </SoftCard>

        <SoftCard>
          <Tile label="Page Views" value={data.metrics.screenPageViews} />
        </SoftCard>

        <SoftCard>
          <Tile label="7-Day Users" value={data.metrics.active7DayUsers} />
        </SoftCard>

        <SoftCard>
          <Tile
            label="Engagement Rate"
            value={`${(data.metrics.engagementRate * 100).toFixed(1)}%`}
          />
        </SoftCard>
      </div>

      {/* MIDDLE ROW */}
      <div className="flex gap-4 h-[350px]">
        {/* Pie: New vs Returning – back to Recharts PieChart */}
        <SoftCard className="w-[45%] flex flex-col h-full">
          <div className="text-sm font-semibold mb-2">
            New vs Returning Users
          </div>
          {/* IMPORTANT: give the ResponsiveContainer a concrete height */}
          <div style={{ width: "100%", height: "260px" }}>
            <PieCharts
              data={data.returningVsNew}
              dataKey="value"
              nameKey="label"
            />
          </div>
        </SoftCard>

        {/* Line: Active Users */}
        <SoftCard className="w-2/3 flex flex-col">
          <div className="text-sm font-semibold mb-2">Active Users (trend)</div>
          <div style={{ width: "100%", height: "300px" }}>
            <LineCharts
              data={data.usersOverTime}
              xAxisKey="date"
              dataKeys={["activeUsers"]}
              showArea
            />
          </div>
        </SoftCard>
      </div>

      {/* BOTTOM ROW */}
      <div className="flex gap-4 h-[350px]">
        <SoftCard className="w-1/2 flex flex-col">
          <div className="text-sm font-semibold mb-2">Pageviews</div>
          <div style={{ width: "100%", height: "300px" }}>
            <LineCharts
              data={data.pageviewsOverTime}
              xAxisKey="date"
              dataKeys={["screenPageViews"]}
              showArea
            />
          </div>
        </SoftCard>

        <SoftCard className="w-1/2 flex flex-col">
          <div className="text-sm font-semibold mb-2">7-Day Users Trend</div>
          <div style={{ width: "100%", height: "300px" }}>
            <LineCharts
              data={data.usersOverTime}
              xAxisKey="date"
              dataKeys={["active7DayUsers"]}
              showArea
            />
          </div>
        </SoftCard>
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
/* SoftCard: subtle, Figma-style depth that works in html2canvas/PDF  */
/* ------------------------------------------------------------------ */

function SoftCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={className}
      style={{
        backgroundColor: "#ffffff",
        borderRadius: "18px",
        padding: "16px",
        boxShadow:
          "0 18px 36px rgba(15,23,42,0.10), 0 4px 10px rgba(15,23,42,0.06)",
        border: "1px solid rgba(148,163,184,0.22)",
      }}
    >
      {children}
    </div>
  );
}