import { useEffect, useMemo, useState } from "react";
import InstagramEmbed from "../../components/InstagramEmbed";

// Cards
import BigCard from "../../components/cards/BigCard";
import SmallCard from "../../components/cards/SmallCard";

// Charts
import LineCharts from "../../components/charts/LineCharts";
import PieCharts from "../../components/charts/PieCharts";

// Buttons
import DateDropdown, {
  DateRangeId,
} from "../../components/charts/DateDropdown";
import ExportButton from "../../components/export-pdf/ExportButton";

import { fetchMetrics, SocialMediaMetric } from "../../utils/fetchMetrics";
import { useGlobalPageExporter } from "../../components/export-pdf/GlobalPageExportProvider";

/* ---------- types ---------- */

type LinePoint = { date: string; value: number };

type MetricSummary = {
  current: number | null;
  prev: number | null;
};

type MetricConfig = {
  id: string;
  title: string;
  metric: string;
  metricLabel?: string;
};

const PROVIDER = "INSTAGRAM";
const DEFAULT_START_DATE = "2024-01-01";
const DEFAULT_END_DATE = "3000-01-01";

const METRICS: MetricConfig[] = [
  { id: "impressions", title: "Impressions", metric: "VIEWS", metricLabel: "" },
  { id: "followers", title: "Followers", metric: "FOLLOWERS", metricLabel: "" },
  { id: "likes", title: "Total Likes", metric: "LIKES", metricLabel: "" },
  {
    id: "comments",
    title: "Total Comments",
    metric: "COMMENTS",
    metricLabel: "",
  },
  { id: "posts", title: "Posts", metric: "POSTS", metricLabel: "" },
];

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

function formatPercentChange(summary?: MetricSummary | null) {
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
  if (!pts.length) return pts;
  if (range === "all") return pts;

  const end = new Date();
  end.setHours(0, 0, 0, 0);
  const start = new Date(end);

  if (range === "7d") start.setDate(start.getDate() - 6);
  if (range === "30d") start.setDate(start.getDate() - 29);
  if (range === "1y") start.setFullYear(start.getFullYear() - 1);

  const startStr = start.toISOString().slice(0, 10);
  const endStr = end.toISOString().slice(0, 10);

  return pts.filter((p) => p.date >= startStr && p.date <= endStr);
}

/* ---------- component ---------- */

export default function InstagramPage() {
  const { exportByPlatforms } = useGlobalPageExporter();

  const [rawSeries, setRawSeries] = useState<Record<string, LinePoint[]>>({});
  const [ranges, setRanges] = useState<Record<string, DateRangeId>>(() => {
    const init: Record<string, DateRangeId> = {};
    METRICS.forEach((m) => (init[m.id] = "30d"));
    return init;
  });

  useEffect(() => {
    async function load() {
      try {
        const results = await Promise.all(
          METRICS.map((cfg) =>
            fetchMetrics({
              provider: PROVIDER,
              metric: cfg.metric,
              startDate: DEFAULT_START_DATE,
              endDate: DEFAULT_END_DATE,
            }).then((rows) => ({ cfg, rows })),
          ),
        );

        const nextRaw: Record<string, LinePoint[]> = {};
        for (const { cfg, rows } of results) {
          nextRaw[cfg.id] = toLinePoints(rows);
        }
        setRawSeries(nextRaw);
      } catch (err) {
        console.error("Error loading Instagram metrics:", err);
      }
    }

    load();
  }, []);

  const computed = useMemo(() => {
    return METRICS.reduce(
      (acc, cfg) => {
        const full = rawSeries[cfg.id] ?? [];
        const filtered = filterByRange(full, ranges[cfg.id] ?? "30d");
        const summary = summarizeSeries(filtered);
        const bounds = getBounds(full);
        acc[cfg.id] = { full, filtered, summary, bounds };
        return acc;
      },
      {} as Record<
        string,
        {
          full: LinePoint[];
          filtered: LinePoint[];
          summary: MetricSummary;
          bounds: { min: Date | null; max: Date | null };
        }
      >,
    );
  }, [rawSeries, ranges]);

  // Pie data
  const likesNow = computed["likes"]?.summary.current ?? 0;
  const commentsNow = computed["comments"]?.summary.current ?? 0;
  const postsNow = computed["posts"]?.summary.current ?? 0;

  const engagementMix = [
    { label: "Likes", value: likesNow },
    { label: "Comments", value: commentsNow },
    { label: "Posts", value: postsNow },
  ];

  return (
    <div className="w-full min-h-screen lg:h-full bg-white flex flex-col gap-4">
      {/* Header */}
      <div className="w-full flex items-center px-4 py-2">
        <div className="flex items-center space-x-2 mr-2 lg:mr-0">
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

          <h1 className="font-poppins font-semibold text-3xl lg:text-4xl whitespace-nowrap">
            Instagram
          </h1>
        </div>

        <div className="ml-auto">
          <ExportButton onExport={exportByPlatforms} />
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-4 px-4 lg:h-full">
        {/* Top band: 2x2 small cards + pie chart */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 grid grid-cols-2 gap-4">
            {["impressions", "followers", "posts", "comments"].map((id) => {
              const cfg = METRICS.find((m) => m.id === id)!;
              const s = computed[id]?.summary;

              return (
                <SmallCard
                  key={id}
                  title={cfg.title}
                  displayMode="metric-only"
                  className="w-full h-full"
                  metricValue={s?.current ?? 0}
                  metricLabel={cfg.metricLabel ?? ""}
                  metricChange={formatPercentChange(s)}
                />
              );
            })}
          </div>

          {/* Pie chart */}
          <div className="lg:col-span-1">
            <BigCard
              title="Engagement Mix"
              chart={
                <div className="w-full h-64">
                  <PieCharts
                    data={engagementMix}
                    dataKey="value"
                    nameKey="label"
                  />
                </div>
              }
              displayMode="both"
              className="w-full h-full"
            />
          </div>
        </div>

        {/* Likes + Instagram Feed */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-4 lg:h-full">
          {/* Likes BigCard */}
          {METRICS.filter((cfg) => cfg.id === "likes").map((cfg) => {
            const item = computed[cfg.id];
            const filtered = item?.filtered ?? [];
            const bounds = item?.bounds ?? { min: null, max: null };
            const summary = item?.summary ?? { current: 0, prev: null };

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
                metricValue={summary.current ?? 0}
                metricLabel="total"
                metricChange={formatPercentChange(summary)}
                chart={
                  filtered.length ? (
                    <div className="w-full">
                      <LineCharts
                        data={filtered}
                        xAxisKey="date"
                        dataKeys={["value"]}
                        showArea
                      />
                    </div>
                  ) : (
                    <div className="flex w-full h-3/4 items-center justify-center text-gray-500">
                      No data available
                    </div>
                  )
                }
                displayMode="both"
                className="w-full h-[360px] md:h-[370px]"
              />
            );
          })}

          {/* Instagram Feed */}
          <BigCard
            title="Recent Posts"
            chart={
              <div className="flex justify-center items-start w-full">
                <InstagramEmbed />
              </div>
            }
            displayMode="chart-only"
            className="w-full h-[360px] md:h-[370px]"
          />
        </div>
      </div>
    </div>
  );
}
