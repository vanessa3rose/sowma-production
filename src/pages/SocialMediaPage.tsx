// pages/SocialMediaPage.tsx
import { useEffect, useState } from "react";
import { useRoute } from "wouter";

import BigCard from "../components/cards/BigCard";
import SmallCard from "../components/cards/SmallCard";
import LineCharts from "../components/charts/LineCharts";
import DateRangeButton from "../components/date-range/DateRangeButton";
import ExportButton from "../components/export-pdf/ExportButton";

import {
  CHART_CONFIGS,
  Platform,
  PLATFORM_LABELS,
} from "../config/chartConfigs";
import { useGlobalPageExporter } from "../components/export-pdf/GlobalPageExportProvider";
import { fetchMetrics, SocialMediaMetric } from "../utils/fetchMetrics";

type LinePoint = { date: string; value: number };
type MetricSummary = { current: number | null; prev: number | null };

export default function SocialMediaPage() {
  // We only care about the params; ignore the match flag.
  const [, params] = useRoute("/social/:platform");
  const rawPlatform = params?.platform as Platform | undefined;

  // Guard against invalid or missing platform
  const platform: Platform =
    rawPlatform && rawPlatform in CHART_CONFIGS
      ? rawPlatform
      : "instagram";

  const { exportByPlatforms } = useGlobalPageExporter();

  const [chartDataMap, setChartDataMap] = useState<
    Record<string, LinePoint[]>
  >({});
  const [metricSummaries, setMetricSummaries] = useState<
    Record<string, MetricSummary>
  >({});

  const defaultStartDate = "2024-01-01";
  const defaultEndDate = "3000-01-01";

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

  // Map URL platform -> backend provider string
  const provider = ((): string => {
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
  })();

  useEffect(() => {
    async function loadMetrics() {
      try {
        const configs = CHART_CONFIGS[platform];

        const results = await Promise.all(
          configs.map((cfg) =>
            fetchMetrics({
              provider,
              metric: cfg.metric,
              startDate: defaultStartDate,
              endDate: defaultEndDate,
            }).then((rows) => ({ cfg, rows })),
          ),
        );

        const newMap: Record<string, LinePoint[]> = {};
        const newSummaries: Record<string, MetricSummary> = {};

        for (const { cfg, rows } of results) {
          const pts = toLinePoints(rows);
          newMap[cfg.id] = pts;
          newSummaries[cfg.id] = summarizeSeries(pts);
        }

        setChartDataMap(newMap);
        setMetricSummaries(newSummaries);
      } catch (err) {
        console.error("Error loading social media metrics:", err);
      }
    }

    loadMetrics();
  }, [platform, provider]);

  const formattedPlatform = PLATFORM_LABELS[platform] ?? "Social Media";

  return (
    <div className="w-full min-h-screen bg-white flex flex-col gap-4">
      {/* Header */}
      <div className="w-full flex justify-between items-center px-4 py-2">
        <h1 className="font-poppins font-semibold text-4xl">
          {formattedPlatform}
        </h1>

        <div className="flex gap-2">
          <DateRangeButton />
          {/* 🔑 Global export: export ANY platforms from here */}
          <ExportButton onExport={exportByPlatforms} />
        </div>
      </div>

      {/* Layout */}
      <div className="flex flex-col lg:flex-row gap-4 px-4">
        {/* Sidebar metrics */}
        <div className="w-full lg:w-1/4 flex flex-col gap-4">
          {CHART_CONFIGS[platform].map((cfg) => {
            const summary = metricSummaries[cfg.id];
            const value = summary?.current ?? 0;

            return (
              <SmallCard
                key={cfg.id}
                title={cfg.title}
                metricValue={value}
                metricChange="+ 0%" // you can wire real deltas later
                displayMode="metric-only"
                className="w-full"
              />
            );
          })}
        </div>

        {/* Main charts */}
        <div className="w-full lg:w-3/4 flex flex-col gap-4">
          {CHART_CONFIGS[platform].map((cfg) => (
            <BigCard
              key={cfg.id}
              title={cfg.title}
              displayMode="both"
              className="w-full h-full"
              chart={
                <div className="w-full h-64">
                  <LineCharts
                    data={chartDataMap[cfg.id] ?? []}
                    xAxisKey="date"
                    dataKeys={["value"]}
                    showArea
                  />
                </div>
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}