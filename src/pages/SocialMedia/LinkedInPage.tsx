import { useEffect, useMemo, useState } from "react";
import BigCard from "../../components/cards/BigCard";
import SmallCard from "../../components/cards/SmallCard";
import { HeatmapLegend } from "../../components/charts/CalendarHeatmap";
import { LinkedInCalendarHeatmap } from "../../components/charts/LinkedInCalendarHeatmap";
import LineCharts from "../../components/charts/LineCharts";
import DateDropdown, {
  DateRangeValue,
} from "../../components/charts/DateButton";
import ExportButton from "../../components/export-pdf/ExportButton";
import { useGlobalPageExporter } from "../../components/export-pdf/GlobalPageExportProvider";
import { fetchMetrics, SocialMediaMetric } from "../../utils/fetchMetrics";
import { getLatestImportedDate } from "../../utils/latestImportedDate";
import {
  formatAbsoluteChange,
  getSmallCardSinceLabel,
} from "../../utils/metricChange";
import { getGlossaryDefinition, isGlossaryKey } from "../../data/glossarydata";

type MetricKey =
  | "followers"
  | "views"
  | "likes"
  | "comments"
  | "shares"
  | "interactions";

type LinePoint = { date: string; value: number };
type MetricSummary = { current: number | null; prev: number | null };
type MetricConfig = {
  id: MetricKey;
  metric: string;
  title: string;
  label: string;
};

const PROVIDER = "LINKEDIN";
const DEFAULT_START_DATE = "2024-01-01";
const DEFAULT_END_DATE = "3000-01-01";

const METRICS: MetricConfig[] = [
  {
    id: "followers",
    metric: "FOLLOWERS",
    title: "New Followers",
    label: "new followers",
  },
  { id: "views", metric: "VIEWS", title: "Views", label: "views" },
  { id: "likes", metric: "LIKES", title: "Reactions", label: "reactions" },
  {
    id: "comments",
    metric: "COMMENTS",
    title: "Comments",
    label: "comments",
  },
  { id: "shares", metric: "SHARES", title: "Reposts", label: "reposts" },
  {
    id: "interactions",
    metric: "TOTAL_INTERACTIONS",
    title: "Total Interactions",
    label: "interactions",
  },
];

const INITIAL_SERIES: Record<MetricKey, LinePoint[]> = {
  followers: [],
  views: [],
  likes: [],
  comments: [],
  shares: [],
  interactions: [],
};

const INITIAL_RANGES: Record<MetricKey, DateRangeValue> = {
  followers: { id: "30d" },
  views: { id: "30d" },
  likes: { id: "30d" },
  comments: { id: "30d" },
  shares: { id: "30d" },
  interactions: { id: "30d" },
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
  ) {
    return "+ 0%";
  }

  const pct = ((summary.current - summary.prev) / summary.prev) * 100;
  return `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%`;
}

function getBounds(pts: LinePoint[]) {
  if (!pts.length) {
    return { min: null as Date | null, max: null as Date | null };
  }

  const dates = pts
    .map((p) => p.date)
    .slice()
    .sort();

  return {
    min: new Date(dates[0]),
    max: new Date(dates[dates.length - 1]),
  };
}

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

export default function LinkedInPage() {
  const { exportByPlatforms } = useGlobalPageExporter();
  const [rawSeries, setRawSeries] =
    useState<Record<MetricKey, LinePoint[]>>(INITIAL_SERIES);
  const [ranges, setRanges] =
    useState<Record<MetricKey, DateRangeValue>>(INITIAL_RANGES);

  useEffect(() => {
    async function loadLinkedIn() {
      try {
        // Load each KPI family independently; missing series should not block
        // the rest of the dashboard.
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
      } catch (error) {
        console.error("Error loading LinkedIn metrics:", error);
      }
    }

    loadLinkedIn();
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
      const filtered = filterByRange(full, ranges[cfg.id] ?? { id: "30d" });
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
    {
      title: "Reactions",
      key: "likes" as MetricKey,
    },
    {
      title: "Comments",
      key: "comments" as MetricKey,
    },
    {
      title: "Reposts",
      key: "shares" as MetricKey,
    },
  ];
  const lastUpdated = getLatestImportedDate(rawSeries);

  return (
    <div className="w-full min-h-screen bg-white flex flex-col gap-4 px-4 pb-2 pt-4 lg:pt-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between lg:items-center">
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
            LinkedIn
          </h1>
        </div>

        <div className="flex flex-row items-center space-x-4 mt-2 lg:mt-0">
          <a
            href="https://www.linkedin.com/company/schoolonwheelsofmasschusetts/"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-[15px] border border-[#0A86D9] px-4 py-1.5 text-[#0A86D9] font-poppins font-semibold inline-block"
          >
            Go to Account
          </a>
          <ExportButton onExport={exportByPlatforms} />
        </div>
      </div>

      <div className="font-poppins text-sm text-gray-600">
        Last updated: {lastUpdated ?? "No imported data yet"}
      </div>

      {/* small cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {topSmallCards.map((card, idx) => (
          <SmallCard
            key={`${card.title}-${idx}`}
            title={card.title}
            titleTooltip={
              isGlossaryKey(card.key) ? getGlossaryDefinition(card.key) : ""
            }
            displayMode="metric-only"
            className="w-full"
            metricValue={computed[card.key]?.fullSummary.current ?? 0}
            metricChange={formatAbsoluteChange(computed[card.key]?.fullSummary)}
            metricLabel={getSmallCardSinceLabel(rawSeries[card.key])}
          />
        ))}
      </div>

      {/* big cards */}
      <div className="grid grid-cols-1 xl:grid-cols-[2fr_2fr] gap-4">
        <div className="flex flex-col gap-4">
          <BigCard
            title="New Followers"
            subtitle={
              <DateDropdown
                value={ranges.followers}
                onChange={(r: DateRangeValue) =>
                  setRanges((prev) => ({ ...prev, followers: r }))
                }
                minDate={computed.followers?.bounds.min}
                maxDate={computed.followers?.bounds.max}
              />
            }
            metricValue={computed.followers?.summary.current ?? 0}
            metricLabel="latest imported day"
            metricChange={formatPercentChange(computed.followers?.summary)}
            chart={
              computed.followers?.filtered.length ? (
                <LineCharts
                  data={computed.followers.filtered}
                  xAxisKey="date"
                  dataKeys={["value"]}
                  labels={{ value: "New Followers" }}
                  showArea
                />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  No new follower data available
                </div>
              )
            }
            displayMode="both"
            className="h-[360px]"
          />

          <BigCard
            title="Views"
            subtitle={
              <DateDropdown
                value={ranges.views}
                onChange={(r: DateRangeValue) =>
                  setRanges((prev) => ({ ...prev, views: r }))
                }
                minDate={computed.views?.bounds.min}
                maxDate={computed.views?.bounds.max}
              />
            }
            metricValue={computed.views?.summary.current ?? 0}
            metricLabel="latest imported day"
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
                  No views data available
                </div>
              )
            }
            displayMode="both"
            className="h-[360px]"
          />
        </div>

        <div className="flex flex-col gap-4">
          <BigCard
            title="Total Interactions"
            titleTooltip={getGlossaryDefinition("interactions")}
            subtitle={
              <DateDropdown
                value={ranges.interactions}
                onChange={(r: DateRangeValue) =>
                  setRanges((prev) => ({ ...prev, interactions: r }))
                }
                minDate={computed.interactions?.bounds.min}
                maxDate={computed.interactions?.bounds.max}
              />
            }
            metricValue={computed.interactions?.summary.current ?? 0}
            metricLabel="latest imported day"
            metricChange={formatPercentChange(computed.interactions?.summary)}
            chart={
              computed.interactions?.filtered.length ? (
                <LineCharts
                  data={computed.interactions.filtered}
                  xAxisKey="date"
                  dataKeys={["value"]}
                  labels={{ value: "Total Interactions" }}
                  showArea
                />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  No interactions data available
                </div>
              )
            }
            displayMode="both"
            className="h-[360px]"
          />

          <BigCard
            title="Engagement Calendar"
            titleTooltip="Interaction intensity by calendar day. Darker means more interactions."
            subtitle={<HeatmapLegend />}
            chart={
              rawSeries.interactions.length ? (
                <LinkedInCalendarHeatmap points={rawSeries.interactions} />
              ) : (
                <div className="flex items-center justify-center text-gray-500">
                  No interaction activity data
                </div>
              )
            }
            displayMode="chart-only"
            className="h-[360px]"
          />
        </div>
      </div>
    </div>
  );
}
