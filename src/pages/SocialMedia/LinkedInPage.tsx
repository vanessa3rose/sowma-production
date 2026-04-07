import { useEffect, useMemo, useState } from "react";
import BigCard from "../../components/cards/BigCard";
import SmallCard from "../../components/cards/SmallCard";
import { HeatmapLegend } from "../../components/charts/CalendarHeatmap";
import { LinkedInCalendarHeatmap } from "../../components/charts/LinkedInCalendarHeatmap";
import LineCharts from "../../components/charts/LineCharts";
import DateDropdown, {
  DateRangeValue,
} from "../../components/charts/DateButton";
import { fetchMetrics, SocialMediaMetric } from "../../utils/fetchMetrics";
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
  | "views"
  | "likes"
  | "comments"
  | "shares"
  | "interactions";

type MetricConfig = {
  id: MetricKey;
  metric: string;
  title: string;
};

const PROVIDER = "LINKEDIN";
const DEFAULT_START_DATE = "2024-01-01";
const DEFAULT_END_DATE = "3000-01-01";

const METRICS: MetricConfig[] = [
  {
    id: "followers",
    metric: "FOLLOWERS",
    title: "New Followers",
  },
  { id: "views", metric: "VIEWS", title: "Views" },
  { id: "likes", metric: "LIKES", title: "Reactions" },
  {
    id: "comments",
    metric: "COMMENTS",
    title: "Comments",
  },
  { id: "shares", metric: "SHARES", title: "Reposts" },
  {
    id: "interactions",
    metric: "TOTAL_INTERACTIONS",
    title: "Total Interactions",
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

export default function LinkedInPage() {
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
      <SocialMediaHeader
        lastUpdated={lastUpdated}
        Title={"LinkedIn"}
        Link={"https://www.linkedin.com/company/schoolonwheelsofmasschusetts/"}
      />

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
