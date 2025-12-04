// pages/display-pages/SocialMediaPage.tsx

import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import {
  LineChart as SparkLineChart,
  Line,
  ResponsiveContainer,
} from "recharts";

import DateRangeButton from "../../components/date-range/DateRangeButton";
import ExportButton from "../../components/export-pdf/ExportButton";
import BigCard from "../../components/cards/BigCard";
import SmallCard from "../../components/cards/SmallCard";
import LineCharts from "../../components/charts/LineCharts";
import PieCharts from "../../components/charts/PieCharts";

import {
  CHART_CONFIGS,
  type Platform,
} from "../../config/chartConfigs";

import { fetchMetrics, SocialMediaMetric } from "../../utils/fetchMetrics";
import { useGlobalPageExporter } from "../../components/export-pdf/GlobalPageExportProvider";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type LinePoint = { date: string; value: number };

type MetricSummary = {
  current: number | null;
  prev: number | null;
};

/* -------------------------------------------------------------------------- */
/* Map URL → backend provider enum                                             */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/* Temporary pie data (no backend support yet)                                 */
/* -------------------------------------------------------------------------- */

const pieTestData = [
  { source: "Organic", value: 400 },
  { source: "Paid", value: 300 },
  { source: "Referral", value: 200 },
  { source: "Social", value: 100 },
];

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export default function SocialMediaPage() {
  const [_, params] = useRoute("/social/:platform");
  const platform = (params?.platform as Platform) || null;

  const formattedPlatform = platform
    ? platform[0].toUpperCase() + platform.slice(1)
    : "Social Media";

  const { registerSocial, exportByPlatforms } = useGlobalPageExporter();
  const handleExport = (selected: Platform[]) => exportByPlatforms(selected);

  /* ------------------------------ State ---------------------------------- */

  const [chartDataMap, setChartDataMap] =
    useState<Record<string, LinePoint[]>>({});
  const [metricSummaries, setMetricSummaries] =
    useState<Record<string, MetricSummary>>({});

  const defaultStart = "2024-01-01";
  const defaultEnd = "3000-01-01";

  /* ------------------------------ Helpers -------------------------------- */

  function sortByDate(raw: SocialMediaMetric[]): SocialMediaMetric[] {
    return raw
      .filter((m) => m.metricDate || m.lastSynced)
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
    const len = points.length;

    if (len === 0) return { current: null, prev: null };
    if (len === 1) return { current: points[0].value, prev: null };

    return {
      current: points[len - 1].value,
      prev: points[len - 2].value,
    };
  }

  function formatPercentChange(summary?: MetricSummary) {
    if (
      !summary ||
      summary.current == null ||
      summary.prev == null ||
      summary.prev === 0
    )
      return "+ 0%";

    const pct = ((summary.current - summary.prev) / summary.prev) * 100;
    const sign = pct >= 0 ? "+" : "";
    return `${sign}${pct.toFixed(1)}% vs. prev.`;
  }

  /* Auto-detect summary config */
  function findConfigForMetric(platform: Platform, metricCode: string) {
    return CHART_CONFIGS[platform].find((cfg) => cfg.metric === metricCode);
  }

  /* ------------------------------ Fetch metrics -------------------------- */

  useEffect(() => {
    if (!platform) return;

    const configs = CHART_CONFIGS[platform];
    const provider = providerFromPlatform(platform);

    async function load() {
      try {
        const results = await Promise.all(
          configs.map((cfg) =>
            fetchMetrics({
              provider,
              metric: cfg.metric,
              startDate: defaultStart,
              endDate: defaultEnd,
            }).then((rows) => ({ cfg, rows })),
          ),
        );

        const nextData: Record<string, LinePoint[]> = {};
        const nextSummaries: Record<string, MetricSummary> = {};

        for (const { cfg, rows } of results) {
          const points = toLinePoints(rows);
          nextData[cfg.id] = points;
          nextSummaries[cfg.id] = summarizeSeries(points);
        }

        setChartDataMap(nextData);
        setMetricSummaries(nextSummaries);

        /* -------- Register social for export -------- */

        // Extract keys if they exist
        const followersId = configs.find((c) => c.metric === "FOLLOWERS")?.id;
        const impressionsId = configs.find((c) => c.metric === "VIEWS")?.id;
        const postsId = configs.find((c) => c.metric === "POSTS")?.id;

        registerSocial(platform, {
          chartDataMap: {
            impressions: impressionsId ? nextData[impressionsId] ?? [] : [],
            posts: postsId ? nextData[postsId] ?? [] : [],
            followers: followersId ? nextData[followersId] ?? [] : [],
          },

          metricSummaries: {
            followers: followersId ? nextSummaries[followersId] ?? null : null,
            impressions: impressionsId ? nextSummaries[impressionsId] ?? null : null,
            posts: postsId ? nextSummaries[postsId] ?? null : null,

            // engagements is *synthetic*, so default to 0
            engagements: {
              current:
                (nextSummaries[likesCfg?.id ?? ""]?.current ?? 0) +
                (nextSummaries[commentsCfg?.id ?? ""]?.current ?? 0) +
                (nextSummaries[sharesCfg?.id ?? ""]?.current ?? 0),
              prev:
                (nextSummaries[likesCfg?.id ?? ""]?.prev ?? 0) +
                (nextSummaries[commentsCfg?.id ?? ""]?.prev ?? 0) +
                (nextSummaries[sharesCfg?.id ?? ""]?.prev ?? 0),
            },
          },

          engagementBreakdown: [
            { label: "Likes", value: nextSummaries[likesCfg?.id ?? ""]?.current ?? 0 },
            { label: "Comments", value: nextSummaries[commentsCfg?.id ?? ""]?.current ?? 0 },
            { label: "Shares", value: nextSummaries[sharesCfg?.id ?? ""]?.current ?? 0 },
          ],
        });

      } catch (err) {
        console.error("Error loading metrics:", err);
      }
    }

    load();
  }, [platform]);

  /* ------------------------- Summary Metric Configs ------------------------ */

  const followersCfg = platform && findConfigForMetric(platform, "FOLLOWERS");
  const commentsCfg = platform && findConfigForMetric(platform, "COMMENTS");
  const likesCfg = platform && findConfigForMetric(platform, "LIKES");
  const sharesCfg = platform && findConfigForMetric(platform, "SHARES");

  /* ------------------------------ Sparkline ------------------------------- */

  const MiniSparkline = ({ data }: { data: LinePoint[] }) => (
    <ResponsiveContainer width="100%" height="100%">
      <SparkLineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
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

  /* ------------------------------- Render --------------------------------- */

  return (
    <div className="w-full min-h-screen lg:h-full bg-white flex flex-col gap-4">
      {/* Header */}
      <div className="w-full flex flex-col lg:flex-row justify-between items-center px-4 py-2">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => (window.location.href = "/")}
            className="w-[40px] h-[40px]"
          >
            {/* back arrow */}
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
          <ExportButton onExport={handleExport} />
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col lg:flex-row gap-4 px-4 lg:h-full">
        {/* Sidebar Metrics */}
        <div className="w-full lg:w-1/4 flex flex-col gap-4">
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
              commentsCfg ? (
                <MiniSparkline
                  data={chartDataMap[commentsCfg.id] ?? []}
                />
              ) : undefined
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
            chart={
              likesCfg ? (
                <MiniSparkline data={chartDataMap[likesCfg.id] ?? []} />
              ) : undefined
            }
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
            chart={
              sharesCfg ? (
                <MiniSparkline data={chartDataMap[sharesCfg.id] ?? []} />
              ) : undefined
            }
          />
        </div>

        {/* Main Chart Cards */}
        <div className="w-full lg:w-3/4 flex flex-col gap-4">
          {platform &&
            CHART_CONFIGS[platform].map((chart) => (
              <BigCard
                key={`${platform}-${chart.id}`}
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
                        data={pieTestData}
                        dataKey="value"
                        nameKey="source"
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