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
            delta={`${data.followersDelta}%`}
            unit="followers"
          />
        </SoftCard>

        <SoftCard>
          <KPI
            title="Impressions"
            value={data.impressions}
            delta={`${data.impressionsDelta}%`}
            unit="views"
          />
        </SoftCard>

        <SoftCard>
          <KPI
            title="Posts"
            value={data.posts}
            delta={`${data.postsDelta}%`}
            unit="posts"
          />
        </SoftCard>

        <SoftCard>
          <KPI
            title="Engagements"
            value={data.engagements}
            delta={`${data.engagementsDelta}%`}
            unit="actions"
          />
        </SoftCard>
      </div>

      {/* ======= MIDDLE ROW (Pie + Impressions Trend) ======= */}
      <div className="flex gap-6" style={{ height: "360px" }}>
        {/* PIE CARD */}
        <SoftCard
          className="flex flex-col"
          style={{ width: "45%", height: "360px" }}
        >
          <div
            className="font-semibold"
            style={{ fontSize: "20px", marginBottom: "14px" }}
          >
            Engagement Breakdown
          </div>

          <div style={{ width: "100%", height: "290px" }}>
            <PieCharts
              data={data.engagementBreakdown}
              dataKey="value"
              nameKey="label"
            />
          </div>
        </SoftCard>

        {/* IMPRESSIONS TREND */}
        <SoftCard
          className="flex flex-col flex-1"
          style={{ height: "360px" }}
        >
          <div
            className="font-semibold"
            style={{ fontSize: "20px", marginBottom: "14px" }}
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

      {/* ======= BOTTOM ROW (Posts + Followers) ======= */}
      <div className="flex gap-6" style={{ height: "360px" }}>
        {/* POSTS */}
        <SoftCard
          className="flex flex-col flex-1"
          style={{ height: "360px" }}
        >
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

        {/* FOLLOWERS */}
        <SoftCard
          className="flex flex-col flex-1"
          style={{ height: "360px" }}
        >
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