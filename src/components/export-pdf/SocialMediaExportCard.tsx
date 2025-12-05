// src/components/export-pdf/SocialMediaExportCard.tsx

import { SocialExportBundle } from "../../types/exportTypes";
import LineCharts from "../charts/LineCharts";
import PieCharts from "../charts/PieCharts";
import KPI from "./export-elements/KPI";
import SoftCard from "./export-elements/SoftCard";

interface Props {
  data: SocialExportBundle;
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
          textTransform: "capitalize",
        }}
      >
        {data.platform}
      </h1>

      {/* KPI ROW */}
      <div className="grid grid-cols-4 gap-6">
        <SoftCard>
          <KPI
            title="Followers"
            value={data.followers}
            delta={data.followersDelta}
            unit="followers"
          />
        </SoftCard>

        <SoftCard>
          <KPI
            title="Impressions"
            value={data.impressions}
            delta={data.impressionsDelta}
            unit="views"
          />
        </SoftCard>

        <SoftCard>
          <KPI
            title="Posts"
            value={data.posts}
            delta={data.postsDelta}
            unit="posts"
          />
        </SoftCard>

        <SoftCard>
          <KPI
            title="Engagements"
            value={data.engagements}
            delta={data.engagementsDelta}
            unit="actions"
          />
        </SoftCard>
      </div>

      {/* MIDDLE ROW — PIE + LINE */}
      <div className="flex gap-6 h-[360px]">
        {/* PIE: Engagement Breakdown */}
        <SoftCard className="w-[45%] flex flex-col h-full">
          <div
            style={{ fontSize: "20px", marginBottom: "14px" }}
            className="font-semibold"
          >
            Engagement Breakdown
          </div>

          {/* *** FIXED PIE WRAPPER (matches GoogleExportCard) *** */}
          <div style={{ width: "100%", height: "290px" }}>
            <PieCharts
              data={data.engagementBreakdown}
              dataKey="value"
              nameKey="label"
            />
          </div>
        </SoftCard>

        {/* LINE: Impressions Trend */}
        <SoftCard className="w-2/3 flex flex-col">
          <div
            style={{ fontSize: "20px", marginBottom: "14px" }}
            className="font-semibold"
          >
            Impressions (trend)
          </div>

          <div style={{ width: "100%", height: "310px" }}>
            <LineCharts
              data={data.impressionsOverTime}
              xAxisKey="date"
              dataKeys={["value"]}
              showArea
            />
          </div>
        </SoftCard>
      </div>

      {/* BOTTOM ROW — POSTS + FOLLOWERS */}
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
              dataKeys={["value"]}
              showArea
            />
          </div>
        </SoftCard>

        <SoftCard className="w-1/2 flex flex-col">
          <div
            className="font-semibold"
            style={{ fontSize: "20px", marginBottom: "14px" }}
          >
            Followers Over Time
          </div>

          <div style={{ width: "100%", height: "310px" }}>
            <LineCharts
              data={data.followersOverTime}
              xAxisKey="date"
              dataKeys={["value"]}
              showArea
            />
          </div>
        </SoftCard>
      </div>
    </div>
  );
}