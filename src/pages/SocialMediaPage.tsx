import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import {
  LineChart as SparkLineChart,
  Line,
  ResponsiveContainer,
} from "recharts";

import DateDropdown, { DateRangeId } from "../components/charts/DateDropdown";
import ExportButton from "../components/export-pdf/ExportButton";
import BigCard from "../components/cards/BigCard";
import SmallCard from "../components/cards/SmallCard";
import LineCharts from "../components/charts/LineCharts";

import { fetchMetrics, SocialMediaMetric } from "../utils/fetchMetrics";
import { useGlobalPageExporter } from "../components/export-pdf/GlobalPageExportProvider";

/* ---------- types ---------- */

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

const CHART_CONFIGS: Record<string, ChartConfig[]> = {
  instagram: [
    { id: "impressions", title: "Impressions", type: "line", metric: "VIEWS" },
    { id: "followers", title: "Followers", type: "line", metric: "FOLLOWERS" },
    { id: "likes", title: "Total Likes", type: "line", metric: "LIKES" },
    {
      id: "comments",
      title: "Total Comments",
      type: "line",
      metric: "COMMENTS",
    },
    { id: "posts", title: "Posts", type: "line", metric: "POSTS" },
  ],
  twitter: [
    { id: "followers", title: "Followers", type: "line", metric: "FOLLOWERS" },
    { id: "likes", title: "Likes", type: "line", metric: "LIKES" },
    { id: "tweets", title: "Tweet Count", type: "line", metric: "POSTS" },
    { id: "shares", title: "Shares", type: "line", metric: "SHARES" },
  ],
  facebook: [
    {
      id: "followers",
      title: "Page Follows",
      type: "line",
      metric: "FOLLOWERS",
    },
    { id: "likes", title: "Reactions / Likes", type: "line", metric: "LIKES" },
    { id: "views", title: "Page Views", type: "line", metric: "VIEWS" },
    { id: "comments", title: "Comments", type: "line", metric: "COMMENTS" },
    { id: "posts", title: "Posts", type: "line", metric: "POSTS" },
    { id: "shares", title: "Shares", type: "line", metric: "SHARES" },
  ],
};

type Platform = keyof typeof CHART_CONFIGS;

function providerFromPlatform(platform: Platform) {
  switch (platform) {
    case "instagram":
      return "INSTAGRAM";
    case "twitter":
      return "TWITTER";
    case "facebook":
      return "FACEBOOK";
    default:
      return "INSTAGRAM";
  }
}

/* ---------- helpers ---------- */

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
    const ts = (m.metricDate ?? m.lastSynced)!;
    return { date: ts.slice(0, 10), value: m.metricValue };
  });
}

function summarizeSeries(points: LinePoint[]): MetricSummary {
  if (points.length === 0) return { current: null, prev: null };
  if (points.length === 1) return { current: points[0].value, prev: null };
  return {
    current: points[points.length - 1].value,
    prev: points[points.length - 2].value,
  };
}

function formatPercentChange(summary?: MetricSummary) {
  if (
    !summary ||
    summary.current == null ||
    summary.prev == null ||
    summary.prev === 0
  ) {
    return "+ 0%";
  }
  const pct = ((summary.current - summary.prev) / summary.prev) * 100;
  return `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}% vs. prev.`;
}

function getBounds(pts: LinePoint[]) {
  if (!pts.length)
    return { min: null as Date | null, max: null as Date | null };
  const dates = pts
    .map((p) => p.date)
    .slice()
    .sort();
  return { min: new Date(dates[0]), max: new Date(dates[dates.length - 1]) };
}

function filterByRange(pts: LinePoint[], range: DateRangeId) {
  if (range === "all" || !pts.length) return pts;

  const end = new Date(pts[pts.length - 1].date);
  const start = new Date(end);

  if (range === "7d") start.setDate(start.getDate() - 6);
  if (range === "30d") start.setDate(start.getDate() - 29);
  if (range === "1y") start.setFullYear(start.getFullYear() - 1);

  const startStr = start.toISOString().slice(0, 10);
  const endStr = end.toISOString().slice(0, 10);

  return pts.filter((p) => p.date >= startStr && p.date <= endStr);
}

/* ---------- component ---------- */

export default function SocialMediaPage() {
  const { exportByPlatforms } = useGlobalPageExporter();
  const [_, params] = useRoute("/social/:platform");
  const platform = params?.platform as Platform;

  const configs = platform ? CHART_CONFIGS[platform] : [];

  const [rawSeries, setRawSeries] = useState<Record<string, LinePoint[]>>({});
  const [ranges, setRanges] = useState<Record<string, DateRangeId>>({});
  const [summaries, setSummaries] = useState<Record<string, MetricSummary>>({});

  useEffect(() => {
    if (!platform) return;

    const provider = providerFromPlatform(platform);

    async function load() {
      const results = await Promise.all(
        configs.map((cfg) =>
          fetchMetrics({
            provider, // now guaranteed string
            metric: cfg.metric,
            startDate: "2024-01-01",
            endDate: "3000-01-01",
          }).then((rows) => ({ cfg, rows })),
        ),
      );

      const nextRaw: Record<string, LinePoint[]> = {};
      const nextSummaries: Record<string, MetricSummary> = {};
      const nextRanges: Record<string, DateRangeId> = {};

      for (const { cfg, rows } of results) {
        const series = toLinePoints(rows);
        nextRaw[cfg.id] = series;
        nextSummaries[cfg.id] = summarizeSeries(series);
        nextRanges[cfg.id] = "30d";
      }

      setRawSeries(nextRaw);
      setSummaries(nextSummaries);
      setRanges(nextRanges);
    }

    load();
  }, [platform]);

  const MiniSparkline = ({ data }: { data: LinePoint[] }) => (
    <ResponsiveContainer width="100%" height="100%">
      <SparkLineChart data={data}>
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
    <div className="w-full min-h-screen bg-white flex flex-col gap-4 px-4">
      {/* Header */}
      <div className="flex justify-between items-center py-2">
        <h1 className="font-poppins font-semibold text-3xl">
          {platform?.charAt(0).toUpperCase() + platform?.slice(1)}
        </h1>
        <div className="flex gap-2">
          <ExportButton onExport={exportByPlatforms} />
        </div>
      </div>

      <div className="flex gap-4">
        {/* Sidebar */}
        <div className="w-1/4 flex flex-col gap-4">
          {configs.slice(0, 4).map((cfg) => (
            <SmallCard
              key={cfg.id}
              title={cfg.title}
              displayMode="both"
              metricValue={summaries[cfg.id]?.current ?? 0}
              metricChange={formatPercentChange(summaries[cfg.id])}
              chart={<MiniSparkline data={rawSeries[cfg.id] ?? []} />}
              className="w-full"
            />
          ))}
        </div>

        {/* Charts */}
        <div className="w-3/4 flex flex-col gap-4">
          {configs.map((cfg) => {
            const fullSeries = rawSeries[cfg.id] ?? [];
            const filtered = filterByRange(fullSeries, ranges[cfg.id] ?? "30d");
            const bounds = getBounds(fullSeries);

            return (
              <BigCard
                key={cfg.id}
                title={cfg.title}
                subtitle={
                  <DateDropdown
                    value={ranges[cfg.id] ?? "30d"}
                    onChange={(r) =>
                      setRanges((prev) => ({ ...prev, [cfg.id]: r }))
                    }
                    minDate={bounds.min}
                    maxDate={bounds.max}
                  />
                }
                displayMode="both"
                className="w-full"
                chart={
                  filtered.length ? (
                    <LineCharts
                      data={filtered}
                      xAxisKey="date"
                      dataKeys={["value"]}
                      showArea
                    />
                  ) : (
                    <div className="h-64 flex items-center justify-center text-gray-500">
                      No data available
                    </div>
                  )
                }
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
