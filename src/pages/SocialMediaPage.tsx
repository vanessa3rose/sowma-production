// src/pages/SocialMediaPage.tsx

import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { LineChart as SparkLineChart, Line, ResponsiveContainer } from "recharts";

import DateRangeButton from "../components/date-range/DateRangeButton";
import ExportButton from "../components/export-pdf/ExportButton";
import BigCard from "../components/cards/BigCard";
import SmallCard from "../components/cards/SmallCard";
import LineCharts from "../components/charts/LineCharts";
import PieCharts from "../components/charts/PieCharts";

import { fetchMetrics, SocialMediaMetric } from "../utils/fetchMetrics";
import { CHART_CONFIGS, Platform } from "../config/chartConfigs";
import { useGlobalPageExporter } from "../components/export-pdf/GlobalPageExportProvider";

// ---------- Types ----------
type ChartType = "line" | "pie";

type ChartConfig = {
  id: string;
  title: string;
  type: ChartType;
  metric: string;
};

type LinePoint = {
  date: string;
  value: number;
};

type MetricSummary = {
  current: number | null;
  prev: number | null;
};

// ---------- Map URL platform -> backend provider enum ----------
function providerFromPlatform(platform: Platform): string {
  switch (platform) {
    case "instagram":
      return "INSTAGRAM";
    case "twitter":
      return "TWITTER";
    case "facebook":
      return "FACEBOOK";
    case "google":
      return "GOOGLE_ANALYTICS";
    default:
      return "INSTAGRAM";
  }
}

export default function SocialMediaPage() {
  const [match, params] = useRoute("/social/:platform");
  const platform = (params?.platform as Platform) || null;

  const formattedPlatform = platform
    ? platform.charAt(0).toUpperCase() + platform.slice(1)
    : "Social Media";

  // 👇 from global exporter
  const { registerSocial, exportByPlatforms } = useGlobalPageExporter();

  // ---- State for charts + summaries ----
  const [chartDataMap, setChartDataMap] = useState<Record<string, LinePoint[]>>(
    {},
  );
  const [metricSummaries, setMetricSummaries] = useState<
    Record<string, MetricSummary>
  >({});

  const defaultStartDate = "2024-01-01";
  const defaultEndDate = "3000-01-01";

  // ---- Helpers ----
  function sortByDate(raw: SocialMediaMetric[]): SocialMediaMetric[] {
    return raw
      .filter((m) => m.metricDate || m.lastSynced)
      .slice()
      .sort((a, b) =>
        (a.metricDate ?? a.lastSynced)!.localeCompare(
          (b.metricDate ?? b.lastSynced)!,
        ),
      );
  }

  function toLinePoints(raw: SocialMediaMetric[]): LinePoint[] {
    return sortByDate(raw).map((m) => {
      const timestamp = (m.metricDate ?? m.lastSynced)!;
      return {
        date: timestamp.slice(0, 10),
        value: m.metricValue,
      };
    });
  }

  function summarizeSeries(points: LinePoint[]): MetricSummary {
    if (points.length === 0) return { current: null, prev: null };
    if (points.length === 1) return { current: points[0].value, prev: null };
    const latest = points[points.length - 1].value;
    const prev = points[points.length - 2].value;
    return { current: latest, prev };
  }

  function formatPercentChange(summary?: MetricSummary): string {
    if (!summary || summary.current == null || summary.prev == null || summary.prev === 0) {
      return "+ 0%";
    }
    const pct = ((summary.current - summary.prev) / summary.prev) * 100;
    const sign = pct >= 0 ? "+" : "";
    return `${sign}${pct.toFixed(1)}% vs. prev.`;
  }

  // ---- Fetch metrics whenever platform changes ----
  useEffect(() => {
    if (!platform) return;

    const configs = CHART_CONFIGS[platform];
    if (!configs) return;

    const provider = providerFromPlatform(platform);

    async function loadMetrics() {
      try {
        const results = await Promise.all(
          configs.map((cfg: ChartConfig) =>
            fetchMetrics({
              provider,
              metric: cfg.metric,
              startDate: defaultStartDate,
              endDate: defaultEndDate,
            }).then((rows) => ({ cfg, rows })),
          ),
        );

        const nextChartDataMap: Record<string, LinePoint[]> = {};
        const nextSummaries: Record<string, MetricSummary> = {};

        for (const { cfg, rows } of results) {
          const series = toLinePoints(rows);
          nextChartDataMap[cfg.id] = series;
          nextSummaries[cfg.id] = summarizeSeries(series);
        }

        setChartDataMap(nextChartDataMap);
        setMetricSummaries(nextSummaries);
      } catch (err) {
        console.error("Error loading social media metrics:", err);
      }
    }

    loadMetrics();
  }, [platform]);

  // ---- Register this platform's bundle with global exporter ----
  useEffect(() => {
    if (!platform) return;

    // Require at least one metric before registering
    if (Object.keys(chartDataMap).length === 0) return;

    registerSocial(platform, {
      chartDataMap,
      metricSummaries,
    });
  }, [platform, chartDataMap, metricSummaries, registerSocial]);

  // ---- SmallCard helpers: pick the right chart for each metric ----
  function findConfigForMetric(
    platform: Platform,
    metric: string,
  ): ChartConfig | undefined {
    return CHART_CONFIGS[platform].find((c) => c.metric === metric);
  }

  const followersCfg =
    platform && findConfigForMetric(platform, "FOLLOWERS");
  const commentsCfg =
    platform && findConfigForMetric(platform, "COMMENTS");
  const likesCfg =
    platform && findConfigForMetric(platform, "LIKES");
  const sharesCfg =
    platform && findConfigForMetric(platform, "SHARES");
  const commentsSeries =
    commentsCfg ? chartDataMap[commentsCfg.id] ?? [] : [];
  const likesSeries = likesCfg ? chartDataMap[likesCfg.id] ?? [] : [];
  const sharesSeries = sharesCfg ? chartDataMap[sharesCfg.id] ?? [] : [];

  const MiniSparkline = ({ data }: { data: LinePoint[] }) => (
    <ResponsiveContainer width="100%" height="100%">
      <SparkLineChart
        data={data}
        margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
      >
        <Line
          type="monotone"
          dataKey="value"
          stroke="#3B82F6"
          strokeWidth={2}
          dot={false}
        />
      </SparkLineChart>
    </ResponsiveContainer>
  );

  return (
    <div className="w-full min-h-screen lg:h-full bg-white flex flex-col gap-4">
      {/* Header */}
      <div className="w-full flex flex-col lg:flex-row justify-between items-center px-4 py-2">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => (window.location.href = "/")}
            className="w-[40px] h-[40px]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="size-7"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5 8.25 12l7.5-7.5"
              />
            </svg>
          </button>
          <h1 className="font-poppins font-semibold text-3xl lg:text-4xl">
            {formattedPlatform}
          </h1>
        </div>
        <div className="flex space-x-2 mt-2 lg:mt-0">
          <DateRangeButton />

          {/* 👇 key change: use global exporter here too */}
          <ExportButton onExport={exportByPlatforms} />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-4 px-4 lg:h-full">
        {/* Sidebar Cards */}
        <div className="w-full lg:w-1/4 flex flex-col gap-4 lg:h-full">
          {/* Followers */}
          <SmallCard
            title="Followers"
            displayMode="metric-only"
            className="w-full"
            metricValue={
              followersCfg
                ? metricSummaries[followersCfg.id]?.current ?? 0
                : 0
            }
            metricLabel="followers"
            metricChange={
              followersCfg
                ? formatPercentChange(metricSummaries[followersCfg.id])
                : "+ 0%"
            }
          />

          {/* Comments */}
          <SmallCard
            title="Comments"
            displayMode="both"
            className="w-full"
            metricValue={
              commentsCfg
                ? metricSummaries[commentsCfg.id]?.current ?? 0
                : 0
            }
            metricLabel="comments"
            metricChange={
              commentsCfg
                ? formatPercentChange(metricSummaries[commentsCfg.id])
                : "+ 0%"
            }
            chart={
              commentsCfg ? <MiniSparkline data={commentsSeries} /> : undefined
            }
          />

          {/* Likes */}
          <SmallCard
            title="Likes"
            displayMode="both"
            className="w-full"
            metricValue={
              likesCfg ? metricSummaries[likesCfg.id]?.current ?? 0 : 0
            }
            metricLabel="likes"
            metricChange={
              likesCfg
                ? formatPercentChange(metricSummaries[likesCfg.id])
                : "+ 0%"
            }
            chart={likesCfg ? <MiniSparkline data={likesSeries} /> : undefined}
          />

          {/* Shared */}
          <SmallCard
            title="Shared"
            displayMode="both"
            className="w-full"
            metricValue={
              sharesCfg ? metricSummaries[sharesCfg.id]?.current ?? 0 : 0
            }
            metricLabel="shares"
            metricChange={
              sharesCfg
                ? formatPercentChange(metricSummaries[sharesCfg.id])
                : "+ 0%"
            }
            chart={sharesCfg ? <MiniSparkline data={sharesSeries} /> : undefined}
          />
        </div>

        {/* Chart Cards (Dynamic) */}
        <div className="w-full lg:w-3/4 flex flex-col gap-4 lg:h-full">
          {platform &&
            CHART_CONFIGS[platform].map((chart: ChartConfig) => (
              <BigCard
                key={chart.id}
                title={chart.title}
                displayMode="both"
                className="w-full h-full"
                chart={
                  <div className="w-full h-64">
                    {chart.type === "line" ? (
                      <LineCharts
                        data={chartDataMap[chart.id] ?? []}
                        xAxisKey="date"
                        dataKeys={["value"]}
                        showArea={true}
                      />
                    ) : (
                      <PieCharts data={[]} dataKey="value" nameKey="label" />
                    )}
                  </div>
                }
              />
            ))}
        </div>
      </div>
    </div>
  );
}