import { GoogleAnalyticsExportBundle } from "../../types/exportTypes";
import LineCharts from "../charts/LineCharts";
import PieCharts from "../charts/PieCharts";

import KPI from "./export-elements/KPI";
import SoftCard from "./export-elements/SoftCard";

interface Props {
  data: GoogleAnalyticsExportBundle;
}

function formatPercentChange(current: number | null, prev: number | null): { text: string; color: string } {
  if (current == null || prev == null || prev === 0) {
    return { text: "+ 0%", color: "#22C55E" };
  }
  const pct = ((current - prev) / prev) * 100;
  const sign = pct >= 0 ? "+" : "";
  const arrow = pct >= 0 ? " ↑" : " ↓";
  const color = pct >= 0 ? "#22C55E" : "#EF4444"; // green : red
  return { text: `${sign}${pct.toFixed(1)}%${arrow}`, color };
}

function formatEngagementChange(current: number | null, prev: number | null): { text: string; color: string } {
  if (current == null || prev == null) {
    return { text: "+ 0.0pp", color: "#22C55E" };
  }
  const deltaPoints = current - prev;
  const sign = deltaPoints >= 0 ? "+" : "";
  const color = deltaPoints >= 0 ? "#22C55E" : "#EF4444"; // green : red
  return { text: `${sign}${deltaPoints.toFixed(1)}pp`, color };
}

export default function GoogleExportCard({ data }: Props) {
  const summaries = data.metricSummaries;

  const activeUsersDelta = formatPercentChange(
    summaries.activeUsers.current,
    summaries.activeUsers.prev
  );
  const pageViewsDelta = formatPercentChange(
    summaries.screenPageViews.current,
    summaries.screenPageViews.prev
  );
  const active7DayDelta = formatPercentChange(
    summaries.active7DayUsers.current,
    summaries.active7DayUsers.prev
  );
  const engagementDelta = formatEngagementChange(
    summaries.engagementRate.current,
    summaries.engagementRate.prev
  );

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
            delta={activeUsersDelta.text}
            deltaColor={activeUsersDelta.color}
            unit="users"
          />
        </SoftCard>

        <SoftCard>
          <KPI
            title="Page Views"
            value={data.metrics.screenPageViews}
            delta={pageViewsDelta.text}
            deltaColor={pageViewsDelta.color}
            unit="views"
          />
        </SoftCard>

        <SoftCard>
          <KPI
            title="Active 7-Day Users"
            value={data.metrics.active7DayUsers}
            delta={active7DayDelta.text}
            deltaColor={active7DayDelta.color}
            unit="users (7D)"
          />
        </SoftCard>

        <SoftCard>
          <KPI
            title="Engagement Rate"
            value={`${(data.metrics.engagementRate * 100).toFixed(1)}%`}
            delta={engagementDelta.text}
            deltaColor={engagementDelta.color}
            unit="% engaged"
          />
        </SoftCard>
      </div>

      {/* MIDDLE ROW */}
      <div className="flex gap-6 h-[360px]">
        {/* Pie */}
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

        {/* Line */}
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