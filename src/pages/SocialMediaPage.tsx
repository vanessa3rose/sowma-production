// src/pages/SocialMediaPage.tsx

import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import {
  LineChart as SparkLineChart,
  Line,
  ResponsiveContainer,
} from "recharts";

import DateRangeButton from "../components/date-range/DateRangeButton";
import ExportButton from "../components/export-pdf/ExportButton";
import BigCard from "../components/cards/BigCard";
import SmallCard from "../components/cards/SmallCard";
import LineCharts from "../components/charts/LineCharts";
import PieCharts from "../components/charts/PieCharts";

import { fetchMetrics, SocialMediaMetric } from "../utils/fetchMetrics";
import {
  CHART_CONFIGS,
  Platform,
  ChartConfig,
} from "../config/chartConfigs";

// ---------- Local Types ----------
interface LinePoint {
  date: string;
  value: number;
}

interface MetricSummary {
  current: number | null;
  prev: number | null;
}

// ---------- Provider Mapping ----------
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
  const [, params] = useRoute("/social/:platform");
  const platform = (params?.platform as Platform) ?? null;

  const formattedPlatform = platform
    ? platform.charAt(0).toUpperCase() + platform.slice(1)
    : "Social Media";

  const [chartDataMap, setChartDataMap] =
    useState<Record<string, LinePoint[]>>({});
  const [metricSummaries, setMetricSummaries] =
    useState<Record<string, MetricSummary>>({});

  const defaultStartDate = "2024-01-01";
  const defaultEndDate = "3000-01-01";

  // ---------- Helpers ----------
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
    return sortByDate(raw).map((m) => ({
      date: (m.metricDate ?? m.lastSynced)!.slice(0, 10),
      value: m.metricValue,
    }));
  }

  function summarizeSeries(points: LinePoint[]): MetricSummary {
    if (points.length === 0) return { current: null, prev: null };
    if (points.length === 1) return { current: points[0].value, prev: null };
    return {
      current: points[points.length - 1].value,
      prev: points[points.length - 2].value,
    };
  }

  function formatPercentChange(summary?: MetricSummary): string {
    if (
      !summary ||
      summary.current == null ||
      summary.prev == null ||
      summary.prev === 0
    )
      return "+ 0%";

    const pct = ((summary.current - summary.prev) / summary.prev) * 100;
    return `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}% vs. prev`;
  }

  // ---------- Fetch Metrics ----------
  useEffect(() => {
    if (!platform) return;

    const configs = CHART_CONFIGS[platform];
    const provider = providerFromPlatform(platform);

    async function load() {
      try {
        const results = await Promise.all(
          configs.map((cfg: ChartConfig) =>
            fetchMetrics({
              provider,
              metric: cfg.metric,
              startDate: defaultStartDate,
              endDate: defaultEndDate,
            }).then((rows) => ({ cfg, rows }))
          )
        );

        const nextMap: Record<string, LinePoint[]> = {};
        const nextSum: Record<string, MetricSummary> = {};

        for (const { cfg, rows } of results) {
          const series = toLinePoints(rows);
          nextMap[cfg.id] = series;
          nextSum[cfg.id] = summarizeSeries(series);
        }

        setChartDataMap(nextMap);
        setMetricSummaries(nextSum);
      } catch (err) {
        console.error("Failed to load social media metrics:", err);
      }
    }

    load();
  }, [platform]);

  // ---------- Sparkline ----------
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

  // ---------- Export ----------
  function handleExport() {
    window.dispatchEvent(
      new CustomEvent("export-social", { detail: { platform } })
    );
  }

  // ---------- UI ----------
  return (
    <div className="w-full min-h-screen lg:h-full bg-white flex flex-col gap-4">
      {/* Header */}
      <div className="w-full flex flex-col lg:flex-row justify-between items-center px-4 py-2">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => (window.location.href = "/")}
            className="w-[40px] h-[40px]"
          >
            ←
          </button>

          <h1 className="font-poppins font-semibold text-3xl lg:text-4xl">
            {formattedPlatform}
          </h1>
        </div>

        <div className="flex space-x-2 mt-2 lg:mt-0">
          <DateRangeButton />
          <ExportButton onExport={handleExport} />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-4 px-4 lg:h-full">
        {/* Sidebar */}
        <div className="w-full lg:w-1/4 flex flex-col gap-4 lg:h-full">
          {["FOLLOWERS", "COMMENTS", "LIKES", "SHARES"].map((metricKey) => {
            const cfg = CHART_CONFIGS[platform!].find(
              (c) => c.metric === metricKey
            );

            if (!cfg) return null;

            const summary = metricSummaries[cfg.id];
            const series = chartDataMap[cfg.id] ?? [];

            return (
              <SmallCard
                key={cfg.id}
                title={cfg.title}
                displayMode="both"
                className="w-full"
                metricValue={summary?.current ?? 0}
                metricLabel={cfg.title.toLowerCase()}
                metricChange={formatPercentChange(summary)}
                chart={<MiniSparkline data={series} />}
              />
            );
          })}
        </div>

        {/* Chart Cards */}
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
                        showArea
                      />
                    ) : (
                      <PieCharts
                        data={[]}
                        dataKey="value"
                        nameKey="label"
                      />
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