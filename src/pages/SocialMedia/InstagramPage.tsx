import { useEffect, useMemo, useState } from "react";
import DateDropdown, {
  DateRangeValue,
} from "../../components/charts/DateButton";
import BigCard from "../../components/cards/BigCard";
import SmallCard from "../../components/cards/SmallCard";
import LineCharts from "../../components/charts/LineCharts";
import PieCharts from "../../components/charts/PieCharts";
import { fetchMetrics, SocialMediaMetric } from "../../utils/fetchMetrics";
import { getLatestImportedDate } from "../../utils/latestImportedDate";
import {
  formatAbsoluteChange,
  getSmallCardSinceLabel,
} from "../../utils/metricChange";

import { getGlossaryDefinition, isGlossaryKey } from "../../data/glossarydata";
import InstagramEmbed from "../../components/InstagramEmbed";
import SocialMediaHeader from "../../components/SocialMediaHeader";
import {
  type LinePoint,
  type MetricSummary,
  toLinePoints,
  summarizeSeries,
  getBounds,
} from "../../utils/seriesUtils";

const METRICS: MetricConfig[] = [
  { id: "impressions", title: "Impressions", metric: "VIEWS" },
  { id: "followers", title: "Total Followers", metric: "FOLLOWERS" },
  { id: "reach", title: "Reach", metric: "REACH" },
  {
    id: "totalInteractions",
    title: "Total Interactions",
    metric: "TOTAL_INTERACTIONS",
  },
  { id: "likes", title: "Likes", metric: "LIKES" },
  { id: "comments", title: "Comments", metric: "COMMENTS" },
  { id: "posts", title: "Total Posts", metric: "POSTS" },
  { id: "shares", title: "Shares", metric: "SHARES" },
  { id: "saves", title: "Saves", metric: "SAVES" },
  { id: "profileViews", title: "Profile Views", metric: "PROFILE_VIEWS" },
  { id: "websiteClicks", title: "Website Clicks", metric: "WEBSITE_CLICKS" },
];

type MetricConfig = {
  id: string;
  title: string;
  metric: string;
  metricLabel?: string;
};

const PROVIDER = "INSTAGRAM";
const DEFAULT_START_DATE = "2016-08-15";
const DEFAULT_END_DATE = "3000-01-01";

/* ---------- helpers ---------- */

// Format percent change between two values
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

function sumSeries(pts: LinePoint[]): number {
  return pts.reduce((acc, p) => acc + p.value, 0);
}

/* ---------- component ---------- */

export default function InstagramPage() {
  const [rawSeries, setRawSeries] = useState<Record<string, LinePoint[]>>({});
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  // Date range per metric card
  const [ranges, setRanges] = useState<Record<string, DateRangeValue>>(() => {
    const init: Record<string, DateRangeValue> = {};
    METRICS.forEach((m) => (init[m.id] = { id: "30d" }));
    return init;
  });

  // Load metric data once on mount
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

        setLastUpdated(
          getLatestImportedDate(results.map(({ rows }) => rows).flat()),
        );
      } catch (err) {
        console.error("Error loading Instagram metrics:", err);
      }
    }

    load();
  }, []);

  // Filter data by selected date range
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

  // Compute filtered + summarized data per metric
  const computed = useMemo(() => {
    return METRICS.reduce(
      (acc, cfg) => {
        const full = rawSeries[cfg.id] ?? [];
        const filtered = filterByRange(full, ranges[cfg.id] ?? { id: "30d" });

        acc[cfg.id] = {
          full,
          filtered,
          summary: summarizeSeries(filtered),
          fullSummary: summarizeSeries(full),
          bounds: getBounds(full),
        };

        return acc;
      },
      {} as Record<
        string,
        {
          full: LinePoint[];
          filtered: LinePoint[];
          summary: MetricSummary;
          fullSummary: MetricSummary;
          bounds: { min: Date | null; max: Date | null };
        }
      >,
    );
  }, [rawSeries, ranges]);

  // Engagement mix range selector
  const [engagementRange, setEngagementRange] = useState<DateRangeValue>({
    id: "30d",
  });

  // Sum all values in range (for daily metrics shown as totals)
  function sumInRange(metricId: string, range: DateRangeValue) {
    return sumSeries(filterByRange(rawSeries[metricId] ?? [], range));
  }

  const engagementMix = [
    { label: "Likes", value: sumInRange("likes", engagementRange) },
    { label: "Comments", value: sumInRange("comments", engagementRange) },
    { label: "Shares", value: sumInRange("shares", engagementRange) },
    { label: "Saves", value: sumInRange("saves", engagementRange) },
  ];

  const smallCards = [
    { id: "impressions" },
    { id: "totalInteractions" },
    { id: "posts" },
    { id: "comments" },
  ] as const;

  function lineBigCard(
    id: string,
    chartData: LinePoint[],
    metricValue: number,
    metricLabel: string,
    metricChange?: string,
  ) {
    const cfg = METRICS.find((m) => m.id === id)!;
    const bounds = computed[id]?.bounds ?? { min: null, max: null };
    return (
      <BigCard
        key={id}
        title={cfg.title}
        titleTooltip={
          isGlossaryKey(cfg.id) ? getGlossaryDefinition(cfg.id) : ""
        }
        subtitle={
          <DateDropdown
            value={ranges[id] ?? { id: "30d" }}
            onChange={(r) => setRanges((prev) => ({ ...prev, [id]: r }))}
            minDate={bounds.min}
            maxDate={bounds.max}
          />
        }
        metricValue={metricValue}
        metricLabel={metricLabel}
        metricChange={metricChange}
        chart={
          chartData.length ? (
            <LineCharts
              data={chartData}
              xAxisKey="date"
              dataKeys={["value"]}
              labels={{ value: cfg.title }}
              showArea
            />
          ) : (
            <div className="flex items-center justify-center text-gray-500">
              No data available
            </div>
          )
        }
        displayMode="both"
        className="w-full h-[360px]"
      />
    );
  }

  return (
    <div className="w-full min-h-screen bg-white flex flex-col gap-4 px-4 pb-2 pt-4 lg:pt-6">
      <SocialMediaHeader
        lastUpdated={lastUpdated}
        Title={"Instagram"}
        Link={"https://www.instagram.com/schoolonwheelsma/?hl=en"}
      />

      <div className="flex flex-col gap-4">
        {/* Small cards — full-width horizontal strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {smallCards.map(({ id }) => {
            const cfg = METRICS.find((m) => m.id === id)!;
            const s = computed[id]?.fullSummary;
            return (
              <SmallCard
                key={id}
                title={cfg.title}
                titleTooltip={
                  isGlossaryKey(cfg.id) ? getGlossaryDefinition(cfg.id) : ""
                }
                displayMode="metric-only"
                className="w-full min-h-[172px]"
                metricValue={s?.current ?? 0}
                metricLabel={getSmallCardSinceLabel(computed[id]?.full)}
                metricChange={formatAbsoluteChange(s)}
              />
            );
          })}
        </div>

        {/* Followers + Reach + Total Likes */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {(() => {
            const item = computed["followers"];
            const filtered = item?.filtered ?? [];
            const summary = item?.summary ?? { current: 0, prev: null };
            return lineBigCard(
              "followers",
              filtered,
              summary.current ?? 0,
              "followers",
              formatPercentChange(summary),
            );
          })()}
          {(() => {
            const item = computed["reach"];
            const filtered = item?.filtered ?? [];
            const summary = item?.summary ?? { current: 0, prev: null };
            return lineBigCard(
              "reach",
              filtered,
              summary.current ?? 0,
              "total",
              formatPercentChange(summary),
            );
          })()}
          {(() => {
            const item = computed["likes"];
            const filtered = item?.filtered ?? [];
            const summary = item?.summary ?? { current: 0, prev: null };
            return lineBigCard(
              "likes",
              filtered,
              summary.current ?? 0,
              "total",
              formatPercentChange(summary),
            );
          })()}
        </div>

        {/* Engagement Mix + Recent Posts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <BigCard
            title="Engagement Mix"
            titleTooltip={getGlossaryDefinition("engagementMix")}
            subtitle={
              <DateDropdown
                value={engagementRange}
                onChange={setEngagementRange}
                minDate={computed["likes"]?.bounds.min}
                maxDate={computed["likes"]?.bounds.max}
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
            className="w-full h-[360px]"
          />
          <BigCard
            title="Recent Posts"
            chart={
              <div className="flex justify-center items-start w-full">
                <InstagramEmbed />
              </div>
            }
            displayMode="chart-only"
            scrollable
            className="w-full h-[360px]"
          />
        </div>
      </div>
    </div>
  );
}
