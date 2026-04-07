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
import { fetchMetrics } from "../../utils/fetchMetrics";
import { getLatestImportedDate } from "../../utils/latestImportedDate";
import {
  formatAbsoluteChange,
  getSmallCardSinceLabel,
} from "../../utils/metricChange";

import { getGlossaryDefinition, isGlossaryKey } from "../../data/glossarydata";
import SocialMediaHeader from "../../components/SocialMediaHeader";
import {
  type LinePoint,
  type MetricSummary,
  toLinePoints,
  summarizeSeries,
  getBounds,
  filterByRange,
} from "../../utils/seriesUtils";

type MetricKey =
  | "followers"
  | "likes"
  | "views"
  | "comments"
  | "posts"
  | "shares";

type MetricConfig = {
  id: MetricKey;
  metric: string;
  title: string;
};

const PROVIDER = "FACEBOOK";
const DEFAULT_START_DATE = "2024-01-01";
const DEFAULT_END_DATE = "3000-01-01";

const METRICS: MetricConfig[] = [
  {
    id: "followers",
    metric: "FOLLOWERS",
    title: "Followers",
  },
  {
    id: "likes",
    metric: "LIKES",
    title: "Reactions / Likes",
  },
  {
    id: "views",
    metric: "VIEWS",
    title: "Views",
  },
  {
    id: "comments",
    metric: "COMMENTS",
    title: "Comments",
  },
  {
    id: "posts",
    metric: "POSTS",
    title: "Posts",
  },
  {
    id: "shares",
    metric: "SHARES",
    title: "Shares",
  },
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

/* ---------- helpers ---------- */

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

function buildPostingActivity(points: LinePoint[]): Map<string, number> {
  if (points.length < 2) return new Map();

  const activity = new Map<string, number>();

  for (let i = 1; i < points.length; i++) {
    const delta = points[i].value - points[i - 1].value;
    activity.set(points[i].date, Math.max(0, delta));
  }

  return activity;
}

function calculateWeeksNeeded(year: number, month: number): number {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const totalDays = lastDay.getDate();
  const paddedDays = firstDay.getDay() + totalDays;
  return Math.ceil(paddedDays / 7);
}

function buildRecentPosts(points: LinePoint[], count = 6) {
  const activity = buildPostingActivity(points);

  return Array.from(activity.entries())
    .filter(([, value]) => value > 0)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .slice(0, count)
    .map(([date, value]) => ({ date, value }));
}

/* ---------- component ---------- */

export default function FacebookPage() {
  const [rawSeries, setRawSeries] =
    useState<Record<MetricKey, LinePoint[]>>(INITIAL_SERIES);

  const [ranges, setRanges] =
    useState<Record<MetricKey, DateRangeValue>>(INITIAL_RANGES);

  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [calendarOffset, setCalendarOffset] = useState(0);
  const [isXl, setIsXl] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1280px)");
    setIsXl(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsXl(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const today = new Date();

  const minCalendarOffset = useMemo(() => {
    if (!rawSeries.posts.length) return -12;
    const earliest = rawSeries.posts[0].date.slice(0, 7);
    const eYear = parseInt(earliest.slice(0, 4));
    const eMonth = parseInt(earliest.slice(5, 7)) - 1;
    const monthsDiff =
      (today.getFullYear() - eYear) * 12 + (today.getMonth() - eMonth);
    return -monthsDiff;
  }, [rawSeries.posts]);

  const weeksNeeded = useMemo(() => {
    const viewDate = new Date(
      today.getFullYear(),
      today.getMonth() + calendarOffset,
      1,
    );
    return calculateWeeksNeeded(viewDate.getFullYear(), viewDate.getMonth());
  }, [calendarOffset]);

  const sharedCardHeight = isXl
    ? 360 + Math.max(0, weeksNeeded - 5) * 60
    : undefined;

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

        setLastUpdated(
          getLatestImportedDate(results.map(({ rows }) => rows).flat()),
        );

        setRawSeries(next);
      } catch (err) {
        console.error("Error loading Facebook metrics:", err);
      }
    }

    loadFacebook();
  }, []);

  const computed = useMemo(() => {
    const out = {} as Record<
      MetricKey,
      {
        filtered: LinePoint[];
        fullSummary: MetricSummary;
        summary: MetricSummary;
        bounds: { min: Date | null; max: Date | null };
      }
    >;

    METRICS.forEach((cfg) => {
      const full = rawSeries[cfg.id] ?? [];
      const filtered = filterByRange(full, ranges[cfg.id]);

      out[cfg.id] = {
        filtered,
        fullSummary: summarizeSeries(full),
        summary: summarizeSeries(filtered),
        bounds: getBounds(full),
      };
    });

    return out;
  }, [rawSeries, ranges]);

  const topSmallCards = [
    { title: "Shares", key: "shares" as MetricKey },
    { title: "Reactions", key: "likes" as MetricKey },
    { title: "Comments", key: "comments" as MetricKey },
    { title: "Likes", key: "likes" as MetricKey },
  ];

  const allPostsPoints = rawSeries.posts ?? [];
  const recentPosts = buildRecentPosts(computed.posts?.filtered ?? []);

  return (
    <div className="w-full min-h-screen bg-white flex flex-col gap-4 px-4 pb-2 pt-4 lg:pt-6">
      <SocialMediaHeader
        lastUpdated={lastUpdated}
        Title={"Facebook"}
        Link={"https://www.facebook.com/schoolonwheels"}
      />

      <div className="grid grid-cols-1 xl:grid-cols-[2.1fr_1.3fr_1fr] gap-4">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {topSmallCards.map(({ title, key }, idx) => {
              const item = computed[key];

              return (
                <SmallCard
                  key={`${title}-${idx}`}
                  title={title}
                  titleTooltip={
                    isGlossaryKey(key) ? getGlossaryDefinition(key) : ""
                  }
                  displayMode="metric-only"
                  className="w-full min-h-[172px]"
                  metricValue={item?.fullSummary.current ?? 0}
                  metricChange={formatAbsoluteChange(item?.fullSummary)}
                  metricLabel={getSmallCardSinceLabel(rawSeries[key])}
                />
              );
            })}
          </div>

          <BigCard
            title="Followers"
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
                  labels={{ value: "Followers" }}
                  showArea
                />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  No data available
                </div>
              )
            }
            displayMode="both"
            className=""
            style={
              sharedCardHeight ? { height: `${sharedCardHeight}px` } : undefined
            }
          />
        </div>

        <div className="flex flex-col gap-4">
          <BigCard
            title="Views"
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
                  labels={{ value: "Views" }}
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
            titleTooltip={getGlossaryDefinition("daysPosted")}
            subtitle={<HeatmapLegend />}
            chart={
              allPostsPoints.length ? (
                <CalendarHeatmap
                  points={allPostsPoints}
                  offset={calendarOffset}
                  onOffsetChange={setCalendarOffset}
                  minOffset={minCalendarOffset}
                />
              ) : (
                <div className="flex items-center justify-center text-gray-500">
                  No post activity data
                </div>
              )
            }
            displayMode="chart-only"
            className=""
            style={
              sharedCardHeight ? { height: `${sharedCardHeight}px` } : undefined
            }
          />
        </div>

        <BigCard
          title="Recent Posts"
          titleTooltip={getGlossaryDefinition("recentPosts")}
          chart={
            recentPosts.length ? (
              <div className="w-full flex flex-col gap-2 pt-2">
                {recentPosts.map((post) => (
                  <div
                    key={post.date}
                    className="rounded-lg border border-neutral-200 p-3 font-poppins"
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
          className="h-full"
        />
      </div>
    </div>
  );
}
