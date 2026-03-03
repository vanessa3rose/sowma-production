import { useEffect, useMemo, useState } from "react";
import {
  CalendarHeatmap,
  HeatmapLegend,
} from "../../components/charts/CalendarHeatmap";
import BigCard from "../../components/cards/BigCard";
import SmallCard from "../../components/cards/SmallCard";
import LineCharts from "../../components/charts/LineCharts";
import DateDropdown, {
  DateRangeValue,
} from "../../components/charts/DateButton";
import ExportButton from "../../components/export-pdf/ExportButton";
import { useGlobalPageExporter } from "../../components/export-pdf/GlobalPageExportProvider";
import { fetchMetrics, SocialMediaMetric } from "../../utils/fetchMetrics";

type MetricKey =
  | "followers"
  | "likes"
  | "views"
  | "comments"
  | "posts"
  | "shares";

type LinePoint = { date: string; value: number };
type MetricSummary = { current: number | null; prev: number | null };
type MetricConfig = {
  id: MetricKey;
  metric: string;
  title: string;
  label: string;
};

const PROVIDER = "FACEBOOK";
const DEFAULT_START_DATE = "2024-01-01";
const DEFAULT_END_DATE = "3000-01-01";

const METRICS: MetricConfig[] = [
  {
    id: "followers",
    metric: "FOLLOWERS",
    title: "Followers",
    label: "followers",
  },
  { id: "likes", metric: "LIKES", title: "Reactions / Likes", label: "likes" },
  { id: "views", metric: "VIEWS", title: "Views", label: "views" },
  { id: "comments", metric: "COMMENTS", title: "Comments", label: "comments" },
  { id: "posts", metric: "POSTS", title: "Posts", label: "posts" },
  { id: "shares", metric: "SHARES", title: "Shares", label: "shares" },
];

const INITIAL_SERIES: Record<MetricKey, LinePoint[]> = {
  followers: [],
  likes: [],
  views: [],
  comments: [],
  posts: [],
  shares: [],
};

const INITIAL_RANGES: Record<MetricKey, DateRangeValue> = {
  followers: { id: "30d" },
  likes: { id: "30d" },
  views: { id: "30d" },
  comments: { id: "30d" },
  posts: { id: "30d" },
  shares: { id: "30d" },
};
const METRIC_DESCRIPTIONS: Record<MetricKey, string> = {
  followers: "Cumulative count",
  likes: "Cumulative count",
  views: "Cumulative count",
  comments: "Cumulative count",
  posts: "Green squares indicate days with posts",
  shares: "Cumulative count",
};

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
  if (!points.length) return { current: null, prev: null };
  if (points.length === 1) return { current: points[0].value, prev: null };
  return {
    current: points[points.length - 1].value,
    prev: points[points.length - 2].value,
  };
}

function formatPercentChange(summary?: MetricSummary | null): string {
  if (
    !summary ||
    summary.current == null ||
    summary.prev == null ||
    summary.prev === 0
  )
    return "+ 0%";
  const pct = ((summary.current - summary.prev) / summary.prev) * 100;
  return `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%`;
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

function buildPostingActivity(points: LinePoint[]): Map<string, number> {
  if (points.length < 2) return new Map();
  const activity = new Map<string, number>();
  for (let i = 1; i < points.length; i++) {
    const delta = points[i].value - points[i - 1].value;
    activity.set(points[i].date, Math.max(0, delta));
  }
  return activity;
}

function buildRecentPosts(points: LinePoint[], count = 6) {
  const activity = buildPostingActivity(points);
  return Array.from(activity.entries())
    .filter(([, value]) => value > 0)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .slice(0, count)
    .map(([date, value]) => ({ date, value }));
}

// ── Page ────────────────────────────────────────────────────────────────────
export default function FacebookPage() {
  const { exportByPlatforms } = useGlobalPageExporter();
  const [rawSeries, setRawSeries] =
    useState<Record<MetricKey, LinePoint[]>>(INITIAL_SERIES);
  const [ranges, setRanges] =
    useState<Record<MetricKey, DateRangeValue>>(INITIAL_RANGES);

  useEffect(() => {
    async function loadFacebook() {
      try {
        const results = await Promise.all(
          METRICS.map((cfg) =>
            fetchMetrics({
              provider: PROVIDER,
              metric: cfg.metric,
              startDate: DEFAULT_START_DATE,
              endDate: DEFAULT_END_DATE,
            }).then((rows) => ({ id: cfg.id, rows })),
          ),
        );
        const next = { ...INITIAL_SERIES };
        results.forEach(({ id, rows }) => {
          next[id] = toLinePoints(rows);
        });
        setRawSeries(next);
      } catch (err) {
        console.error("Error loading Facebook metrics:", err);
      }
    }
    loadFacebook();
  }, []);

  function filterByRange(pts: LinePoint[], range: DateRangeValue) {
    if (!pts.length || range.id === "all") return pts;
    if (range.id === "custom" && range.start && range.end) {
      const startStr = range.start.toISOString().slice(0, 10);
      const endStr = range.end.toISOString().slice(0, 10);
      return pts.filter((p) => p.date >= startStr && p.date <= endStr);
    }
    const end = new Date(pts[pts.length - 1].date);
    const start = new Date(end);
    if (range.id === "7d") start.setDate(start.getDate() - 6);
    if (range.id === "30d") start.setDate(start.getDate() - 29);
    if (range.id === "1y") start.setFullYear(start.getFullYear() - 1);
    const startStr = start.toISOString().slice(0, 10);
    const endStr = end.toISOString().slice(0, 10);
    return pts.filter((p) => p.date >= startStr && p.date <= endStr);
  }

  const computed = useMemo(() => {
    const out = {} as Record<
      MetricKey,
      {
        filtered: LinePoint[];
        summary: MetricSummary;
        bounds: { min: Date | null; max: Date | null };
      }
    >;
    METRICS.forEach((cfg) => {
      const full = rawSeries[cfg.id] ?? [];
      const filtered = filterByRange(full, ranges[cfg.id] ?? { id: "30d" });
      out[cfg.id] = {
        filtered,
        summary: summarizeSeries(filtered),
        bounds: getBounds(full),
      };
    });
    return out;
  }, [rawSeries, ranges]);

  const topSmallCards = [
    { title: "Shares", key: "shares" as MetricKey, label: "from last year" },
    { title: "Reactions", key: "likes" as MetricKey, label: "from last year" },
    {
      title: "Comments",
      key: "comments" as MetricKey,
      label: "from last year",
    },
    { title: "Likes", key: "likes" as MetricKey, label: "from last year" },
  ];

  // Use ALL posts data (not range-filtered) for the calendar so past months work
  const allPostsPoints = rawSeries.posts ?? [];
  const recentPosts = buildRecentPosts(computed.posts?.filtered ?? []);

  return (
    <div className="w-full min-h-screen bg-white flex flex-col gap-4 px-4 pb-2 pt-4 lg:pt-6">
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
              className="w-7 h-7"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5 8.25 12l7.5-7.5"
              />
            </svg>
          </button>

          <h1 className="font-poppins font-semibold text-3xl lg:text-4xl">
            Facebook
          </h1>
        </div>
        <div className="flex flex-row justify-center items-center mt-2 lg:flex-row lg:mt-0 lg:space-x-2 space-x-4">
          <a
            href="https://www.facebook.com/schoolonwheels"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-[15px] border border-[#0A86D9] px-4 py-1.5 text-[#0A86D9] font-poppins font-semibold inline-block"
          >
            Go to Account
          </a>
          <ExportButton onExport={exportByPlatforms} />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[2.1fr_1.3fr_1fr] gap-4">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {topSmallCards.map((card, idx) => {
              const item = computed[card.key];
              return (
                <SmallCard
                  key={`${card.title}-${idx}`}
                  title={card.title}
                  titleTooltip={METRIC_DESCRIPTIONS[card.key]}
                  subtitle="Total"
                  displayMode="metric-only"
                  className="w-full min-h-[172px]"
                  metricValue={item?.summary.current ?? 0}
                  metricChange={formatPercentChange(item?.summary)}
                  metricLabel={card.label}
                />
              );
            })}
          </div>

          <BigCard
            title="Followers"
            titleTooltip={METRIC_DESCRIPTIONS.followers}
            subtitle={
              <DateDropdown
                value={ranges.followers}
                onChange={(r) =>
                  setRanges((prev) => ({ ...prev, followers: r }))
                }
                minDate={computed.followers?.bounds.min}
                maxDate={computed.followers?.bounds.max}
              />
            }
            metricValue={computed.followers?.summary.current ?? 0}
            metricLabel="followers"
            metricChange={formatPercentChange(computed.followers?.summary)}
            chart={
              computed.followers?.filtered.length ? (
                <LineCharts
                  data={computed.followers.filtered}
                  xAxisKey="date"
                  dataKeys={["value"]}
                  showArea
                />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  No data available
                </div>
              )
            }
            displayMode="both"
            className="h-[360px]"
          />
        </div>

        <div className="flex flex-col gap-4">
          <BigCard
            title="Views"
            titleTooltip={METRIC_DESCRIPTIONS.views}
            subtitle={
              <DateDropdown
                value={ranges.views}
                onChange={(r) => setRanges((prev) => ({ ...prev, views: r }))}
                minDate={computed.views?.bounds.min}
                maxDate={computed.views?.bounds.max}
              />
            }
            metricValue={computed.views?.summary.current ?? 0}
            metricLabel="from last week"
            metricChange={formatPercentChange(computed.views?.summary)}
            chart={
              computed.views?.filtered.length ? (
                <LineCharts
                  data={computed.views.filtered}
                  xAxisKey="date"
                  dataKeys={["value"]}
                  showArea
                />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  No data available
                </div>
              )
            }
            displayMode="both"
            className="h-[360px]"
          />

          <BigCard
            title="Days Posted"
            titleTooltip={METRIC_DESCRIPTIONS.posts}
            subtitle={<HeatmapLegend />}
            chart={
              allPostsPoints.length ? (
                <CalendarHeatmap points={allPostsPoints} />
              ) : (
                <div className="flex items-center justify-center text-gray-500">
                  No post activity data
                </div>
              )
            }
            displayMode="chart-only"
            className="lmd:h-[500px] g:h-[400px] xl:h-[360px]"
          />
        </div>

        <BigCard
          title="Recent Posts"
          titleTooltip="Displays the date and quantity of most recent posts"
          chart={
            recentPosts.length ? (
              <div className="w-full flex flex-col gap-2 pt-2">
                {recentPosts.map((post) => (
                  <div
                    key={post.date}
                    className="rounded-lg border border-[#E5E5E5] p-3 font-poppins"
                  >
                    <p className="font-semibold text-sm">{post.date}</p>
                    <p className="text-sm text-gray-600">
                      {post.value} new post(s)
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                No recent post data
              </div>
            )
          }
          displayMode="chart-only"
          className="xl:h-[736px]"
        />
      </div>
    </div>
  );
}
