// src/components/export-pdf/GoogleExportCard.tsx

import { GoogleAnalyticsExportBundle } from "../../types/exportTypes";
import LineCharts from "../charts/LineCharts";
import ExportDonut from "./ExportDonut";

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
        <SoftCard className="w-1/3 flex flex-col h-full">
          <div className="text-sm font-semibold mb-2">New vs Returning Users</div>
          <div className="flex-1 min-h-[250px]">
            <ExportDonut data={data.returningVsNew} />
          </div>
        </SoftCard>

        <SoftCard className="w-2/3 flex flex-col">
          <div className="text-sm font-semibold mb-2">Active Users (trend)</div>
          <LineCharts
            data={data.usersOverTime}
            xAxisKey="date"
            dataKeys={["activeUsers"]}
            showArea
          />
        </SoftCard>
      </div>

      {/* BOTTOM ROW */}
      <div className="flex gap-4 h-[350px]">
        <SoftCard className="w-1/2 flex flex-col">
          <div className="text-sm font-semibold mb-2">Pageviews</div>
          <LineCharts
            data={data.pageviewsOverTime}
            xAxisKey="date"
            dataKeys={["screenPageViews"]}
            showArea
          />
        </SoftCard>

        <SoftCard className="w-1/2 flex flex-col">
          <div className="text-sm font-semibold mb-2">7-Day Users Trend</div>
          <LineCharts
            data={data.usersOverTime}
            xAxisKey="date"
            dataKeys={["active7DayUsers"]}
            showArea
          />
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

        // Stronger soft drop shadow — still realistic for UI
        boxShadow:
          "0 18px 36px rgba(15,23,42,0.10), 0 4px 10px rgba(15,23,42,0.06)",

        border: "1px solid rgba(148,163,184,0.22)",
      }}
    >
      {children}
    </div>
  );
}