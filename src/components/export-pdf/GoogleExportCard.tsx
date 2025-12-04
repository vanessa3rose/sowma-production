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
        padding: "32px",
        borderRadius: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "32px",
        boxSizing: "border-box",
      }}
      className="font-sans"
    >
      {/* HEADER */}
      <h1
        className="font-bold"
        style={{
          fontSize: "46px",
          marginBottom: "8px",
        }}
      >
        Google
      </h1>

      {/* KPI ROW */}
      <div className="grid grid-cols-4 gap-6">
        <SoftCard>
          <KPI
            title="Active Users"
            value={data.metrics.activeUsers}
            delta="+ 0% ↑"
            unit="users"
          />
        </SoftCard>

        <SoftCard>
          <KPI
            title="Page Views"
            value={data.metrics.screenPageViews}
            delta="+ 0% ↑"
            unit="views"
          />
        </SoftCard>

        <SoftCard>
          <KPI
            title="Active 7-Day Users"
            value={data.metrics.active7DayUsers}
            delta="+ 0% ↑"
            unit="users (7D)"
          />
        </SoftCard>

        <SoftCard>
          <KPI
            title="Engagement Rate"
            value={`${(data.metrics.engagementRate * 100).toFixed(1)}%`}
            delta="+ 0% ↑"
            unit="% engaged"
          />
        </SoftCard>
      </div>

      {/* MIDDLE ROW */}
      <div className="flex gap-6 h-[360px]">
        <SoftCard className="w-[45%] flex flex-col h-full">
          <div
            style={{ fontSize: "20px", marginBottom: "14px" }}
            className="font-semibold"
          >
            New vs Returning Users
          </div>

          <div style={{ width: "100%", height: "290px" }}>
            <PieCharts
              data={data.returningVsNew}
              dataKey="value"
              nameKey="label"
            />
          </div>
        </SoftCard>

        <SoftCard className="w-2/3 flex flex-col">
          <div
            style={{ fontSize: "20px", marginBottom: "14px" }}
            className="font-semibold"
          >
            Active Users (trend)
          </div>

          <div style={{ width: "100%", height: "310px" }}>
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
      <div className="flex gap-6 h-[360px]">
        <SoftCard className="w-1/2 flex flex-col">
          <div
            className="font-semibold"
            style={{ fontSize: "20px", marginBottom: "14px" }}
          >
            Pageviews
          </div>

          <div style={{ width: "100%", height: "310px" }}>
            <LineCharts
              data={data.pageviewsOverTime}
              xAxisKey="date"
              dataKeys={["screenPageViews"]}
              showArea
            />
          </div>
        </SoftCard>

        <SoftCard className="w-1/2 flex flex-col">
          <div
            className="font-semibold"
            style={{ fontSize: "20px", marginBottom: "14px" }}
          >
            7-Day Users Trend
          </div>

          <div style={{ width: "100%", height: "310px" }}>
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

/* ------------------------------------------------------------------ */
/* KPI — FULLY MATCHES YOUR WEB UI STYLE                             */
/* ------------------------------------------------------------------ */

function KPI({
  title,
  value,
  delta,
  unit,
}: {
  title: string;
  value: string | number;
  delta: string;
  unit: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      {/* Title */}
      <div className="text-black" style={{ fontSize: "17px" }}>
        {title}
      </div>

      {/* Main Metric */}
      <div
        style={{
          fontSize: "30px",
          lineHeight: "44px",
          fontWeight: 600,
          color: "#547CFF",
        }}
      >
        {value}
      </div>

      {/* Delta Row */}
      <div className="flex items-center gap-1">
        <span style={{ color: "#22C55E", fontSize: "15px", fontWeight: 500 }}>
          {delta}
        </span>

        <span style={{ color: "#6B7280", fontSize: "15px" }}>{unit}</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Soft card container                                                */
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
        padding: "20px",
        boxShadow:
          "0 22px 44px rgba(0,0,0,0.08), 0 8px 16px rgba(0,0,0,0.06)",
        border: "1px solid rgba(148,163,184,0.18)",
      }}
    >
      {children}
    </div>
  );
}