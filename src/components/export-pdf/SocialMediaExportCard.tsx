import SoftCard from "./export-elements/SoftCard";
import KPI from "./export-elements/KPI";

import LineCharts from "../charts/LineCharts";
import PieCharts from "../charts/PieCharts";

import type { SocialMediaExportBundle } from "../../types/exportTypes";

interface Props {
  data: SocialMediaExportBundle;
}

export default function SocialMediaExportCard({ data }: Props) {
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
        {data.platformName}
      </h1>

      {/* KPI ROW */}
      <div className="grid grid-cols-4 gap-6">
        <SoftCard>
          <KPI title="Followers" value={data.followers} delta="+ 0% ↑" unit="" />
        </SoftCard>

        <SoftCard>
          <KPI title="Impressions" value={data.impressions} delta="+ 0% ↑" unit="" />
        </SoftCard>

        <SoftCard>
          <KPI title="Posts" value={data.posts} delta="+ 0% ↑" unit="" />
        </SoftCard>

        <SoftCard>
          <KPI title="Engagements" value={data.engagements} delta="+ 0% ↑" unit="" />
        </SoftCard>
      </div>

      {/* MIDDLE SECTION (Pie + Line) */}
      <div className="flex gap-6 h-[360px]">
        {/* Pie: Engagement Breakdown */}
        <SoftCard className="w-[45%] flex flex-col h-full">
          <div
            className="font-semibold"
            style={{ fontSize: "20px", marginBottom: "14px" }}
          >
            Engagement Breakdown
          </div>

          <div style={{ width: "100%", height: "290px" }}>
            <PieCharts data={data.engagementBreakdown} dataKey="value" nameKey="label" />
          </div>
        </SoftCard>

        {/* Line: Impressions Trend */}
        <SoftCard className="w-2/3 flex flex-col">
          <div
            className="font-semibold"
            style={{ fontSize: "20px", marginBottom: "14px" }}
          >
            Impressions Over Time
          </div>

          <div style={{ width: "100%", height: "310px" }}>
            <LineCharts
              data={data.impressionsOverTime}
              xAxisKey="date"
              dataKeys={["impressions"]}
              showArea
            />
          </div>
        </SoftCard>
      </div>

      {/* BOTTOM SECTION: Posts + Followers Trend */}
      <div className="flex gap-6 h-[360px]">
        <SoftCard className="w-1/2 flex flex-col">
          <div
            className="font-semibold"
            style={{ fontSize: "20px", marginBottom: "14px" }}
          >
            Posts Over Time
          </div>

          <div style={{ width: "100%", height: "310px" }}>
            <LineCharts
              data={data.postsOverTime}
              xAxisKey="date"
              dataKeys={["posts"]}
              showArea
            />
          </div>
        </SoftCard>

        <SoftCard className="w-1/2 flex flex-col">
          <div
            className="font-semibold"
            style={{ fontSize: "20px", marginBottom: "14px" }}
          >
            Follower Growth
          </div>

          <div style={{ width: "100%", height: "310px" }}>
            <LineCharts
              data={data.followersOverTime}
              xAxisKey="date"
              dataKeys={["followers"]}
              showArea
            />
          </div>
        </SoftCard>
      </div>
    </div>
  );
}