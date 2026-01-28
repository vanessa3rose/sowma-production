import { SocialExportBundle } from "../../types/exportTypes";
import LineCharts from "../charts/LineCharts";
import PieCharts from "../charts/PieCharts";
import KPI from "./export-elements/KPI";
import SoftCard from "./export-elements/SoftCard";

interface Props {
  data: SocialExportBundle;
}

function formatDelta(delta: number): { text: string; color: string } {
  const sign = delta > 0 ? "+" : "";
  const color = delta >= 0 ? "#22C55E" : "#EF4444"; // green : red
  return { text: `${sign}${delta.toFixed(1)}%`, color };
}

export default function SocialMediaExportCard({ data }: Props) {
  const hasImpressions =
    data.impressionsOverTime.length > 0 && data.impressions > 0;
  const hasPieData = data.engagementBreakdown.some((d) => d.value > 0);

  const followersDelta = formatDelta(data.followersDelta);
  const impressionsDelta = formatDelta(data.impressionsDelta);
  const postsDelta = formatDelta(data.postsDelta);
  const engagementsDelta = formatDelta(data.engagementsDelta);

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
            delta={followersDelta.text}
            deltaColor={followersDelta.color}
            unit="followers"
          />
        </SoftCard>

        <SoftCard>
          <KPI
            title={hasImpressions ? "Impressions" : "Views"}
            value={data.impressions}
            delta={impressionsDelta.text}
            deltaColor={impressionsDelta.color}
            unit="views"
          />
        </SoftCard>

        <SoftCard>
          <KPI
            title={data.platform === "twitter" ? "Tweets" : "Posts"}
            value={data.posts}
            delta={postsDelta.text}
            deltaColor={postsDelta.color}
            unit={data.platform === "twitter" ? "tweets" : "posts"}
          />
        </SoftCard>

        <SoftCard>
          <KPI
            title="Engagements"
            value={data.engagements}
            delta={engagementsDelta.text}
            deltaColor={engagementsDelta.color}
            unit="actions"
          />
        </SoftCard>
      </div>

      {/* ======= MIDDLE ROW (Pie + Impressions/Engagements Trend) ======= */}
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
            {data.platform === "twitter"
              ? "Account Metrics"
              : "Engagement Breakdown"}
          </div>

          <div style={{ width: "100%", height: "290px" }}>
            {hasPieData ? (
              <PieCharts
                data={data.engagementBreakdown}
                dataKey="value"
                nameKey="label"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                No data available
              </div>
            )}
          </div>
        </SoftCard>

        {/* IMPRESSIONS OR ENGAGEMENTS TREND */}
        <SoftCard className="flex flex-col flex-1" style={{ height: "360px" }}>
          <div
            className="font-semibold"
            style={{ fontSize: "20px", marginBottom: "14px" }}
          >
            {hasImpressions ? "Impressions Over Time" : "Engagement Over Time"}
          </div>

          <div style={{ width: "100%", height: "310px" }}>
            {(hasImpressions
              ? data.impressionsOverTime
              : data.engagementsOverTime
            ).length > 0 ? (
              <LineCharts
                data={
                  hasImpressions
                    ? data.impressionsOverTime
                    : data.engagementsOverTime
                }
                xAxisKey="date"
                dataKeys={["value"]}
                showArea
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                No data available
              </div>
            )}
          </div>
        </SoftCard>
      </div>

      {/* ======= BOTTOM ROW (Posts + Followers) ======= */}
      <div className="flex gap-6" style={{ height: "360px" }}>
        {/* POSTS */}
        <SoftCard className="flex flex-col flex-1" style={{ height: "360px" }}>
          <div
            className="font-semibold"
            style={{ fontSize: "20px", marginBottom: "14px" }}
          >
            {data.platform === "twitter"
              ? "Tweets Over Time"
              : "Posts Over Time"}
          </div>

          <div style={{ width: "100%", height: "310px" }}>
            {data.postsOverTime.length > 0 ? (
              <LineCharts
                data={data.postsOverTime}
                xAxisKey="date"
                dataKeys={["value"]}
                showArea
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                No data available
              </div>
            )}
          </div>
        </SoftCard>

        {/* FOLLOWERS */}
        <SoftCard className="flex flex-col flex-1" style={{ height: "360px" }}>
          <div
            className="font-semibold"
            style={{ fontSize: "20px", marginBottom: "14px" }}
          >
            Followers Over Time
          </div>

          <div style={{ width: "100%", height: "310px" }}>
            {data.followersOverTime.length > 0 ? (
              <LineCharts
                data={data.followersOverTime}
                xAxisKey="date"
                dataKeys={["value"]}
                showArea
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                No data available
              </div>
            )}
          </div>
        </SoftCard>
      </div>
    </div>
  );
}
