import { useEffect, useMemo, useState } from "react";
import DateDropdown, {
  DateRangeValue,
} from "../../components/charts/DateButton";
import BigCard from "../../components/cards/BigCard";
import SmallCard from "../../components/cards/SmallCard";
import LineCharts from "../../components/charts/LineCharts";
import PieCharts from "../../components/charts/PieCharts";
import ExportButton from "../../components/export-pdf/ExportButton";
import { useGlobalPageExporter } from "../../components/export-pdf/GlobalPageExportProvider";
import { fetchMetrics, SocialMediaMetric } from "../../utils/fetchMetrics";

type MetricConfig = {
  id: string;
  title: string;
  metric: string;
  metricLabel?: string;
  description: string;
};

type LinePoint = { date: string; value: number };
type MetricSummary = { current: number | null; prev: number | null };
const PROVIDER = "INSTAGRAM";
const DEFAULT_START_DATE = "2016-08-15";
const DEFAULT_END_DATE = "3000-01-01";

const METRICS: MetricConfig[] = [
  {
    id: "impressions",
    title: "Impressions",
    metric: "VIEWS",
    metricLabel: "",
    description: "Number of users who see your website",
  },
  {
    id: "followers",
    title: "Followers",
    metric: "FOLLOWERS",
    metricLabel: "",
    description: "Cumulative count",
  },
  {
    id: "likes",
    title: "Total Likes",
    metric: "LIKES",
    metricLabel: "",
    description: "Cumulative count",
  },
  {
    id: "comments",
    title: "Total Comments",
    metric: "COMMENTS",
    metricLabel: "",
    description: "Cumulative count",
  },
  {
    id: "posts",
    title: "Posts",
    metric: "POSTS",
    metricLabel: "",
    description: "Cumulative count",
  },
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

/* ---------- component ---------- */

export default function InstagramPage() {
  const { exportByPlatforms } = useGlobalPageExporter();

  const [rawSeries, setRawSeries] = useState<Record<string, LinePoint[]>>({});
  const [ranges, setRanges] = useState<Record<string, DateRangeValue>>(() => {
    const init: Record<string, DateRangeValue> = {};
    METRICS.forEach((m) => (init[m.id] = { id: "30d" }));
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

  function filterByRange(pts: LinePoint[], range: DateRangeValue) {
    if (!pts.length) return pts;
    if (range.id === "all") return pts;
    if (range.id === "custom" && range.start && range.end) {
      const startStr = range.start.toISOString().slice(0, 10);
      const endStr = range.end.toISOString().slice(0, 10);
      return pts.filter((p) => p.date >= startStr && p.date <= endStr);
    }
    const end = new Date();
    end.setHours(0, 0, 0, 0);
    const start = new Date(end);
    if (range.id === "7d") start.setDate(start.getDate() - 6);
    if (range.id === "30d") start.setDate(start.getDate() - 29);
    if (range.id === "1y") start.setFullYear(start.getFullYear() - 1);
    const startStr = start.toISOString().slice(0, 10);
    const endStr = end.toISOString().slice(0, 10);
    return pts.filter((p) => p.date >= startStr && p.date <= endStr);
  }

  const computed = useMemo(() => {
    return METRICS.reduce(
      (acc, cfg) => {
        const full = rawSeries[cfg.id] ?? [];
        const filtered = filterByRange(full, ranges[cfg.id] ?? { id: "30d" });
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

  // Engagement Mix: add date range selector and cumulative calculation
  const [engagementRange, setEngagementRange] = useState<DateRangeValue>({
    id: "30d",
  });

  // Helper to get activity in range (difference between first and last value)
  function getActivityInRange(metricId: string, range: DateRangeValue) {
    const points = filterByRange(rawSeries[metricId] ?? [], range);
    if (!points.length) return 0;
    if (points.length === 1) return points[0].value;
    return points[points.length - 1].value - points[0].value;
  }

  const engagementMix = [
    {
      label: "Comments",
      value: getActivityInRange("comments", engagementRange),
    },
    {
      label: "Impressions",
      value: getActivityInRange("impressions", engagementRange),
    },
    { label: "Likes", value: getActivityInRange("likes", engagementRange) },
    { label: "Posts", value: getActivityInRange("posts", engagementRange) },
  ];
  return (
    <div className="w-full min-h-screen bg-white flex flex-col gap-4 px-4 pb-2 pt-4 lg:pt-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between lg:items-center">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => (window.location.href = "/")}
            className="w-[40px] h-[40px] flex items-center justify-center"
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
            Instagram
          </h1>
        </div>
        <div className="flex flex-row justify-center items-center mt-2 lg:flex-row lg:mt-0 lg:space-x-2 space-x-4">
          <a
            href="https://www.instagram.com/schoolonwheelsma/?hl=en"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-[15px] border border-[#0A86D9] px-4 py-1.5 text-[#0A86D9] font-poppins font-semibold inline-block"
          >
            {" "}
            Go to Account{" "}
          </a>
          <ExportButton onExport={exportByPlatforms} />
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-4 px-4 lg:h-full">
        {/* Top band: 2x2 small cards + pie chart */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {["impressions", "followers", "posts", "comments"].map((id) => {
              const cfg = METRICS.find((m) => m.id === id)!;
              const s = computed[id]?.summary;

              return (
                <SmallCard
                  key={id}
                  title={cfg.title}
                  titleTooltip={cfg.description}
                  displayMode="metric-only"
                  className="w-full h-full"
                  metricValue={s?.current ?? 0}
                  metricLabel={cfg.metricLabel ?? ""}
                  metricChange={formatPercentChange(s)}
                />
              );
            })}
          </div>

          {/* Pie chart with date range selector */}
          <div className="lg:col-span-1">
            <BigCard
              title="Engagement Mix"
              titleTooltip="Spread of interactions between Comments, Impressions, Likes, and Posts"
              subtitle={
                <DateDropdown
                  value={engagementRange}
                  onChange={setEngagementRange}
                  minDate={computed["impressions"]?.bounds.min}
                  maxDate={computed["impressions"]?.bounds.max}
                />
              }
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

        {/* Only Likes BigCard */}
        <div className="w-full grid grid-cols-1 gap-4 lg:h-full">
          {METRICS.filter((cfg) => cfg.id === "likes").map((cfg) => {
            const item = computed[cfg.id];
            const filtered = item?.filtered ?? [];
            const bounds = item?.bounds ?? { min: null, max: null };
            const summary = item?.summary ?? { current: 0, prev: null };

            return (
              <div key={cfg.id}>
                <BigCard
                  title={cfg.title}
                  titleTooltip={cfg.description}
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
                      <div className="w-full h-64">
                        <LineCharts
                          data={filtered}
                          xAxisKey="date"
                          dataKeys={["value"]}
                          showArea
                        />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center text-gray-500">
                        No data available
                      </div>
                    )
                  }
                  displayMode="both"
                  className="w-full h-[360px]"
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
