import { useEffect, useMemo, useState } from "react";
import BigCard from "../../components/cards/BigCard";
import SmallCard from "../../components/cards/SmallCard";
import {
  CalendarHeatmap,
  HeatmapLegend,
} from "../../components/charts/CalendarHeatmap";
import LineCharts from "../../components/charts/LineCharts";
import PieCharts from "../../components/charts/PieCharts";
import DateDropdown, {
  DateRangeValue,
} from "../../components/charts/DateButton";
import SocialMediaHeader from "../../components/SocialMediaHeader";
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
  | "interactions"
  | "daysPosted"
  | "uniqueVisitors";

type LinePoint = { date: string; value: number };
type MetricSummary = { current: number | null; prev: number | null };
type PieDatum = {
  label: string;
  value: number;
  tooltipDetails?: string;
};
type MetricConfig = {
  id: MetricKey;
  metric: string;
  title: string;
};

type RangeKey =
  | MetricKey
  | "engagementRate"
  | "interactionMix"
  | "deviceType"
  | "pageDestinations";

type DemographicKey =
  | "location"
  | "jobFunction"
  | "seniority"
  | "industry"
  | "companySize";

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
  {
    id: "uniqueVisitors",
    metric: "TOTAL_USERS",
    title: "Unique Visitors",
  },
  {
    id: "daysPosted",
    metric: "DAYS_POSTED",
    title: "Days Posted",
  },
];

const INITIAL_SERIES: Record<MetricKey, LinePoint[]> = {
  followers: [],
  views: [],
  likes: [],
  comments: [],
  shares: [],
  interactions: [],
  uniqueVisitors: [],
  daysPosted: [],
};

const INITIAL_RANGES: Record<RangeKey, DateRangeValue> = {
  followers: { id: "30d" },
  views: { id: "30d" },
  likes: { id: "30d" },
  comments: { id: "30d" },
  shares: { id: "30d" },
  interactions: { id: "30d" },
  uniqueVisitors: { id: "30d" },
  daysPosted: { id: "30d" },
  engagementRate: { id: "30d" },
  interactionMix: { id: "30d" },
  deviceType: { id: "30d" },
  pageDestinations: { id: "30d" },
};

const DEMOGRAPHIC_OPTIONS: Array<{ value: DemographicKey; label: string }> = [
  { value: "location", label: "Location" },
  { value: "jobFunction", label: "Job Function" },
  { value: "seniority", label: "Seniority" },
  { value: "industry", label: "Industry" },
  { value: "companySize", label: "Company Size" },
];

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

function baseMetricRows(raw: SocialMediaMetric[]): SocialMediaMetric[] {
  return raw.filter((row) => !row.breakdownKey && !row.breakdownValue);
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

function combineDates(...series: LinePoint[][]): string[] {
  return Array.from(new Set(series.flat().map((point) => point.date))).sort();
}

function buildEngagementRateSeries(
  interactions: LinePoint[],
  views: LinePoint[],
): LinePoint[] {
  const interactionMap = new Map(
    interactions.map((point) => [point.date, point.value]),
  );
  const viewsMap = new Map(views.map((point) => [point.date, point.value]));

  return combineDates(interactions, views).map((date) => {
    const interactionValue = interactionMap.get(date) ?? 0;
    const viewValue = viewsMap.get(date) ?? 0;
    return {
      date,
      value:
        viewValue > 0
          ? Number(((interactionValue / viewValue) * 100).toFixed(2))
          : 0,
    };
  });
}

function buildGrayCalendarSeries(anchorDate: Date): LinePoint[] {
  const year = anchorDate.getFullYear();
  const month = anchorDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  return Array.from({ length: daysInMonth }, (_, index) => {
    const date = new Date(Date.UTC(year, month, index + 1));
    return {
      date: date.toISOString().slice(0, 10),
      value: 0,
    };
  });
}

function calculateWeeksNeeded(year: number, month: number): number {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const totalDays = lastDay.getDate();
  const paddedDays = firstDay.getDay() + totalDays;
  return Math.ceil(paddedDays / 7);
}

function getLatestDateAcrossSeries(series: LinePoint[][]): Date | null {
  const dates = series
    .flat()
    .map((point) => point.date)
    .sort();
  if (!dates.length) return null;
  const latest = new Date(dates[dates.length - 1]);
  return Number.isNaN(latest.getTime()) ? null : latest;
}

function sumSeries(points: LinePoint[]): number {
  return points.reduce((total, point) => total + point.value, 0);
}

function formatRateDelta(summary?: MetricSummary | null): string {
  if (
    !summary ||
    summary.current == null ||
    summary.prev == null ||
    !Number.isFinite(summary.current) ||
    !Number.isFinite(summary.prev)
  ) {
    return "+0.0 pp";
  }

  const delta = summary.current - summary.prev;
  return `${delta >= 0 ? "+" : ""}${delta.toFixed(1)} pp`;
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

function filterRowsByRange(
  rows: SocialMediaMetric[],
  range: DateRangeValue,
): SocialMediaMetric[] {
  const basePoints = toLinePoints(baseMetricRows(rows));
  if (!basePoints.length || range.id === "all") return rows;

  let startStr = basePoints[0].date;
  let endStr = basePoints[basePoints.length - 1].date;

  if (range.id === "custom" && range.start && range.end) {
    startStr = range.start.toISOString().slice(0, 10);
    endStr = range.end.toISOString().slice(0, 10);
  } else {
    const end = new Date(endStr);
    const start = new Date(end);
    if (range.id === "7d") start.setDate(start.getDate() - 6);
    if (range.id === "30d") start.setDate(start.getDate() - 29);
    if (range.id === "1y") start.setFullYear(start.getFullYear() - 1);
    startStr = start.toISOString().slice(0, 10);
  }

  return rows.filter((row) => {
    const ts = row.metricDate ?? row.lastSynced;
    if (!ts) return false;
    const day = ts.slice(0, 10);
    return day >= startStr && day <= endStr;
  });
}

function filterBreakdownRowsByRange(
  rows: SocialMediaMetric[],
  range: DateRangeValue,
): SocialMediaMetric[] {
  const breakdownRows = rows.filter(
    (row) => row.breakdownKey && row.breakdownValue,
  );
  if (!breakdownRows.length) return [];

  const datedBreakdownRows = breakdownRows.filter((row) => row.metricDate);
  if (datedBreakdownRows.length) {
    return filterRowsByRange(datedBreakdownRows, range);
  }

  return breakdownRows;
}

function aggregateBreakdownTotals(
  rows: SocialMediaMetric[],
  breakdownKey: string,
): Record<string, number> {
  const totals: Record<string, number> = {};
  for (const row of rows) {
    if (row.breakdownKey !== breakdownKey || !row.breakdownValue) continue;
    totals[row.breakdownValue] =
      (totals[row.breakdownValue] ?? 0) + row.metricValue;
  }
  return totals;
}

function formatBreakdownLabel(label: string): string {
  return label.replace(/\b\w/g, (ch) => ch.toUpperCase());
}

function buildTopBreakdownChartData(
  totals: Record<string, number>,
  keepCount: number,
  sourceSliceCount = keepCount,
): PieDatum[] {
  const sorted = Object.entries(totals)
    .filter(([, value]) => Number.isFinite(value) && value > 0)
    .sort((a, b) => b[1] - a[1]);

  // Preserve the old chart's math by first limiting the universe to the
  // same top-N categories the live chart used before this change.
  const source = sorted.slice(0, sourceSliceCount);

  const top = source.slice(0, keepCount).map(([label, value]) => ({
    label: formatBreakdownLabel(label),
    value,
  }));

  const remainder = source.slice(keepCount);
  if (!remainder.length) return top;

  const otherValue = remainder.reduce((sum, [, value]) => sum + value, 0);
  if (otherValue <= 0) return top;

  return [
    ...top,
    {
      label: "Other",
      value: otherValue,
      tooltipDetails: remainder
        .map(([label, value]) => `${formatBreakdownLabel(label)}: ${value}`)
        .join("\n"),
    },
  ];
}

function chartControlSelectClassName() {
  return "appearance-none rounded-full border border-transparent bg-white px-3 py-1.5 pr-7 text-sm font-semibold font-[Poppins] text-gray-800 outline-none transition hover:bg-gray-50";
}

function ChartControlSelect({
  value,
  onChange,
}: {
  value: DemographicKey;
  onChange: (value: DemographicKey) => void;
}) {
  return (
    <div className="relative inline-block">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as DemographicKey)}
        className={chartControlSelectClassName()}
      >
        {DEMOGRAPHIC_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-500">
        ▾
      </span>
    </div>
  );
}

export default function LinkedInPage() {
  const [rawSeries, setRawSeries] =
    useState<Record<MetricKey, LinePoint[]>>(INITIAL_SERIES);
  const [uniqueVisitorRows, setUniqueVisitorRows] = useState<
    SocialMediaMetric[]
  >([]);
  const [followerRows, setFollowerRows] = useState<SocialMediaMetric[]>([]);
  const [ranges, setRanges] =
    useState<Record<RangeKey, DateRangeValue>>(INITIAL_RANGES);
  const [visitorDemographic, setVisitorDemographic] =
    useState<DemographicKey>("industry");
  const [followerDemographic, setFollowerDemographic] =
    useState<DemographicKey>("industry");
  const [isXl, setIsXl] = useState(false);
  const [calendarOffset, setCalendarOffset] = useState(0);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1280px)");
    setIsXl(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsXl(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

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
          if (id === "uniqueVisitors") {
            setUniqueVisitorRows(rows);
            next[id] = toLinePoints(baseMetricRows(rows));
            return;
          }
          if (id === "followers") {
            setFollowerRows(rows);
            next[id] = toLinePoints(baseMetricRows(rows));
            return;
          }
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

  const engagementRate = useMemo(() => {
    const full = buildEngagementRateSeries(
      rawSeries.interactions,
      rawSeries.views,
    );
    const filtered = filterByRange(full, ranges.engagementRate);
    return {
      filtered,
      summary: summarizeSeries(filtered),
      bounds: getBounds(full),
    };
  }, [rawSeries.interactions, rawSeries.views, ranges.engagementRate]);

  const interactionMixData = useMemo(() => {
    const likes = filterByRange(rawSeries.likes, ranges.interactionMix);
    const comments = filterByRange(rawSeries.comments, ranges.interactionMix);
    const shares = filterByRange(rawSeries.shares, ranges.interactionMix);

    return [
      { label: "Reactions", value: sumSeries(likes) },
      { label: "Comments", value: sumSeries(comments) },
      { label: "Reposts", value: sumSeries(shares) },
    ];
  }, [
    rawSeries.likes,
    rawSeries.comments,
    rawSeries.shares,
    ranges.interactionMix,
  ]);

  const deviceTypeData = useMemo(() => {
    const filteredRows = filterBreakdownRowsByRange(
      uniqueVisitorRows,
      ranges.deviceType,
    );
    const totals = aggregateBreakdownTotals(filteredRows, "deviceType");

    return Object.entries(totals)
      .sort((a, b) => b[1] - a[1])
      .map(([label, value]) => ({
        label: formatBreakdownLabel(label),
        value,
      }));
  }, [ranges.deviceType, uniqueVisitorRows]);

  const pageDestinationData = useMemo(() => {
    const filteredRows = filterBreakdownRowsByRange(
      uniqueVisitorRows,
      ranges.pageDestinations,
    );
    const totals = aggregateBreakdownTotals(filteredRows, "pageType");

    return Object.entries(totals)
      .sort((a, b) => b[1] - a[1])
      .map(([label, value]) => ({
        label: formatBreakdownLabel(label),
        value,
      }));
  }, [ranges.pageDestinations, uniqueVisitorRows]);

  const visitorDemographicData = useMemo<PieDatum[]>(() => {
    const totals = aggregateBreakdownTotals(
      uniqueVisitorRows,
      visitorDemographic,
    );
    return buildTopBreakdownChartData(totals, 4, 6);
  }, [uniqueVisitorRows, visitorDemographic]);

  const followerDemographicData = useMemo<PieDatum[]>(() => {
    const totals = aggregateBreakdownTotals(followerRows, followerDemographic);
    return buildTopBreakdownChartData(totals, 4, 6);
  }, [followerRows, followerDemographic]);

  const daysPostedCalendarPoints = useMemo(() => {
    if (rawSeries.daysPosted.length) return rawSeries.daysPosted;

    const anchor =
      getLatestDateAcrossSeries([
        rawSeries.uniqueVisitors,
        rawSeries.views,
        rawSeries.interactions,
        rawSeries.followers,
      ]) ?? new Date();

    return buildGrayCalendarSeries(anchor);
  }, [
    rawSeries.daysPosted,
    rawSeries.uniqueVisitors,
    rawSeries.views,
    rawSeries.interactions,
    rawSeries.followers,
  ]);

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
  const today = new Date();
  const minCalendarOffset = useMemo(() => {
    if (!daysPostedCalendarPoints.length) return -12;
    const earliest = daysPostedCalendarPoints[0].date.slice(0, 7);
    const eYear = parseInt(earliest.slice(0, 4));
    const eMonth = parseInt(earliest.slice(5, 7)) - 1;
    const monthsDiff =
      (today.getFullYear() - eYear) * 12 + (today.getMonth() - eMonth);
    return -monthsDiff;
  }, [daysPostedCalendarPoints, today]);
  const weeksNeeded = useMemo(() => {
    const viewDate = new Date(
      today.getFullYear(),
      today.getMonth() + calendarOffset,
      1,
    );
    return calculateWeeksNeeded(viewDate.getFullYear(), viewDate.getMonth());
  }, [calendarOffset, today]);
  // LinkedIn gives the Facebook heatmap a wider 1/3 column than the
  // Facebook page itself, so the square cells need a taller baseline
  // to avoid clipping even in 5-week months.
  const sharedCalendarRowHeight = isXl
    ? 410 + Math.max(0, weeksNeeded - 5) * 85
    : undefined;

  return (
    <div className="w-full min-h-screen bg-white flex flex-col gap-4 px-4 pb-2 pt-4 lg:pt-6">
      <SocialMediaHeader
        lastUpdated={lastUpdated}
        Title={"LinkedIn"}
        Link={"https://www.linkedin.com/company/schoolonwheelsofmasschusetts/"}
      />

      {/* big cards */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="lg:w-1/3 w-full flex flex-col gap-4 h-[396px]">
            {topSmallCards.map((card, idx) => (
              <SmallCard
                key={`${card.title}-${idx}`}
                title={card.title}
                titleTooltip={
                  isGlossaryKey(card.key) ? getGlossaryDefinition(card.key) : ""
                }
                displayMode="metric-only"
                className="w-full flex-1 min-h-0"
                metricValue={computed[card.key]?.fullSummary.current ?? 0}
                metricChange={formatAbsoluteChange(
                  computed[card.key]?.fullSummary,
                )}
                metricLabel={getSmallCardSinceLabel(rawSeries[card.key])}
              />
            ))}
          </div>

          <div className="lg:w-2/3 w-full">
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
              className="h-[396px]"
            />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-4">
          <div className="lg:w-1/2 w-full">
            <BigCard
              title="Follower Demographics"
              titleTooltip="Audience composition from LinkedIn follower export breakdowns."
              subtitle={
                <ChartControlSelect
                  value={followerDemographic}
                  onChange={setFollowerDemographic}
                />
              }
              chart={
                followerDemographicData.some((entry) => entry.value > 0) ? (
                  <PieCharts
                    data={followerDemographicData}
                    dataKey="value"
                    nameKey="label"
                  />
                ) : (
                  <div className="flex items-center justify-center text-gray-500">
                    No follower demographic data available
                  </div>
                )
              }
              displayMode="chart-only"
              className="h-[360px]"
            />
          </div>

          <div className="lg:w-1/2 w-full">
            <BigCard
              title="Visitor Demographics"
              titleTooltip="Audience composition from LinkedIn visitor export breakdowns."
              subtitle={
                <ChartControlSelect
                  value={visitorDemographic}
                  onChange={setVisitorDemographic}
                />
              }
              chart={
                visitorDemographicData.some((entry) => entry.value > 0) ? (
                  <PieCharts
                    data={visitorDemographicData}
                    dataKey="value"
                    nameKey="label"
                  />
                ) : (
                  <div className="flex items-center justify-center text-gray-500">
                    No visitor demographic data available
                  </div>
                )
              }
              displayMode="chart-only"
              className="h-[360px]"
            />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-4">
          <div className="lg:w-2/3 w-full">
            <BigCard
              title="Unique Visitors"
              titleTooltip="Daily total of unique visitors to the LinkedIn page from the uploaded visitor export."
              subtitle={
                <DateDropdown
                  value={ranges.uniqueVisitors}
                  onChange={(r: DateRangeValue) =>
                    setRanges((prev) => ({ ...prev, uniqueVisitors: r }))
                  }
                  minDate={computed.uniqueVisitors?.bounds.min}
                  maxDate={computed.uniqueVisitors?.bounds.max}
                />
              }
              metricValue={computed.uniqueVisitors?.summary.current ?? 0}
              metricLabel="latest imported day"
              metricChange={formatPercentChange(
                computed.uniqueVisitors?.summary,
              )}
              chart={
                computed.uniqueVisitors?.filtered.length ? (
                  <LineCharts
                    data={computed.uniqueVisitors.filtered}
                    xAxisKey="date"
                    dataKeys={["value"]}
                    labels={{ value: "Unique Visitors" }}
                    showArea
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500">
                    No unique visitor data available
                  </div>
                )
              }
              displayMode="both"
              className="h-[360px]"
            />
          </div>

          <div className="lg:w-1/3 w-full">
            <BigCard
              title="Visitor Type"
              titleTooltip="Share of LinkedIn unique visitors across the Overview, Life, and Jobs tabs for the selected range."
              subtitle={
                <DateDropdown
                  value={ranges.pageDestinations}
                  onChange={(r: DateRangeValue) =>
                    setRanges((prev) => ({ ...prev, pageDestinations: r }))
                  }
                  minDate={computed.uniqueVisitors?.bounds.min}
                  maxDate={computed.uniqueVisitors?.bounds.max}
                />
              }
              chart={
                pageDestinationData.some((entry) => entry.value > 0) ? (
                  <PieCharts
                    data={pageDestinationData}
                    dataKey="value"
                    nameKey="label"
                  />
                ) : (
                  <div className="flex items-center justify-center text-gray-500">
                    No page destination data available
                  </div>
                )
              }
              displayMode="chart-only"
              className="h-[360px]"
            />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-4">
          <div className="lg:w-1/3 w-full">
            <BigCard
              title="Interaction Mix"
              titleTooltip="Share of engagement made up of reactions, comments, and reposts for the selected range."
              subtitle={
                <DateDropdown
                  value={ranges.interactionMix}
                  onChange={(r: DateRangeValue) =>
                    setRanges((prev) => ({ ...prev, interactionMix: r }))
                  }
                  minDate={computed.likes?.bounds.min}
                  maxDate={computed.likes?.bounds.max}
                />
              }
              chart={
                interactionMixData.some((entry) => entry.value > 0) ? (
                  <PieCharts
                    data={interactionMixData}
                    dataKey="value"
                    nameKey="label"
                  />
                ) : (
                  <div className="flex items-center justify-center text-gray-500">
                    No interaction mix data
                  </div>
                )
              }
              displayMode="chart-only"
              className="h-[360px]"
            />
          </div>

          <div className="lg:w-2/3 w-full">
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
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-4">
          <div className="lg:w-2/3 w-full">
            <BigCard
              title="Engagement Rate"
              titleTooltip="Daily interaction rate calculated as total interactions divided by views."
              subtitle={
                <DateDropdown
                  value={ranges.engagementRate}
                  onChange={(r: DateRangeValue) =>
                    setRanges((prev) => ({ ...prev, engagementRate: r }))
                  }
                  minDate={engagementRate.bounds.min}
                  maxDate={engagementRate.bounds.max}
                />
              }
              metricValue={Number(
                (engagementRate.summary.current ?? 0).toFixed(1),
              )}
              metricLabel="% of views"
              metricChange={formatRateDelta(engagementRate.summary)}
              chart={
                engagementRate.filtered.length ? (
                  <LineCharts
                    data={engagementRate.filtered}
                    xAxisKey="date"
                    dataKeys={["value"]}
                    labels={{ value: "Engagement Rate (%)" }}
                    showArea
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500">
                    No engagement rate data available
                  </div>
                )
              }
              displayMode="both"
              className="h-[360px]"
            />
          </div>

          <div className="lg:w-1/3 w-full">
            <BigCard
              title="Device Type"
              titleTooltip="Desktop vs mobile share of LinkedIn unique visitors for the selected range."
              subtitle={
                <DateDropdown
                  value={ranges.deviceType}
                  onChange={(r: DateRangeValue) =>
                    setRanges((prev) => ({ ...prev, deviceType: r }))
                  }
                  minDate={computed.uniqueVisitors?.bounds.min}
                  maxDate={computed.uniqueVisitors?.bounds.max}
                />
              }
              chart={
                deviceTypeData.some((entry) => entry.value > 0) ? (
                  <PieCharts
                    data={deviceTypeData}
                    dataKey="value"
                    nameKey="label"
                  />
                ) : (
                  <div className="flex items-center justify-center text-gray-500">
                    No device data available
                  </div>
                )
              }
              displayMode="chart-only"
              className="h-[360px]"
            />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-4">
          <div className="lg:w-1/3 w-full">
            <BigCard
              title="Days Posted"
              titleTooltip={getGlossaryDefinition("daysPosted")}
              subtitle={<HeatmapLegend />}
              chart={
                daysPostedCalendarPoints.length ? (
                  <CalendarHeatmap
                    points={daysPostedCalendarPoints}
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
                sharedCalendarRowHeight
                  ? { height: `${sharedCalendarRowHeight}px` }
                  : { height: "360px" }
              }
            />
          </div>

          <div className="lg:w-2/3 w-full">
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
              className=""
              style={
                sharedCalendarRowHeight
                  ? { height: `${sharedCalendarRowHeight}px` }
                  : { height: "360px" }
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
