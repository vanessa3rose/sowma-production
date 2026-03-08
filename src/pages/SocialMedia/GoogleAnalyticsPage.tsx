// drop down menu for home page

import { useEffect, useState } from "react";

// Cards
import BigCard from "../../components/cards/BigCard";
import SmallCard from "../../components/cards/SmallCard";

// Charts
import LineCharts from "../../components/charts/LineCharts";
import PieCharts from "../../components/charts/PieCharts";
import BarCharts from "../../components/charts/BarCharts";

import MassachusettsCountyMap, {
  type CountyId,
} from "../../components/maps/MassachusettsCountyMap";
import { toMassachusettsCountyFips } from "../../utils/massachusettsCounties";

// Buttons
import DateDropdown, {
  DateRangeId,
  DateRangeValue,
} from "../../components/charts/DateButton";
import ExportButton from "../../components/export-pdf/ExportButton";

import { fetchMetrics, SocialMediaMetric } from "../../utils/fetchMetrics";
import { useGlobalPageExporter } from "../../components/export-pdf/GlobalPageExportProvider";
import { getLatestImportedDate } from "../../utils/latestImportedDate";
import {
  formatAbsoluteChange,
  getSmallCardSinceLabel,
} from "../../utils/metricChange";

// Types
export type GAMetrics = {
  activeUsers: number;
  screenPageViews: number;
  active7DayUsers: number;
  engagementRate: number;
  newUsers: number;
  engagementTime: number;
};

export type TimePoint = {
  date: string;
  activeUsers?: number;
  screenPageViews?: number;
  active7DayUsers?: number;
  newUsers?: number;
  engagementRate?: number;
};

type MetricSummary = {
  current: number | null;
  prev: number | null;
};

type MetricKey =
  | "activeUsers"
  | "screenPageViews"
  | "active7DayUsers"
  | "engagementRate"
  | "newUsers"
  | "engagementTime";

type Point = { date: string; value: number };

const provider = "GOOGLE_ANALYTICS";
const defaultStartDate = "2024-01-01";
const defaultEndDate = "3000-01-01";
const GA_CARD_TOOLTIPS = {
  pageViews: "Total page and screen views.",
  active7DayUsers: "Users active in the last 7 days.",
  avgEngagementTime: "Average engagement time per user (seconds).",
  countyVisitors: "Total site visitors by Massachusetts county.",
  newVsReturning:
    "Users who have never been to the site vs. users who are returning.",
  sessionsByDevice: "Types of devices accessing the site.",
  activeUsers:
    "Users who were on the site for more than 10 seconds, or visited multiple pages.",
  trafficSources: "How each user got to the site.",
  engagementRate:
    "Percent of sessions that lasted more than 10 seconds, or visited 2+ pages.",
} as const;

// -----------------------------
// Today-anchored date helpers
// -----------------------------
function todayISO(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

function computeStartEndFromRangeToday(
  range: DateRangeId,
  fallbackStartDate = defaultStartDate,
): { startDate: string; endDate: string } {
  const endDate = todayISO();
  if (range === "all") return { startDate: fallbackStartDate, endDate };

  const end = new Date(endDate);
  const start = new Date(end);

  if (range === "7d") start.setDate(start.getDate() - 6);
  if (range === "30d") start.setDate(start.getDate() - 29);
  if (range === "1y") start.setFullYear(start.getFullYear() - 1);

  return { startDate: start.toISOString().slice(0, 10), endDate };
}

// -----------------------------
// Helpers for county map
// -----------------------------
function aggregateCountyVisitTotals(
  rows: SocialMediaMetric[],
): Record<CountyId, number> {
  const totals: Partial<Record<CountyId, number>> = {};

  for (const row of rows) {
    if (row.breakdownKey !== "county" || !row.breakdownValue) continue;

    const countyId = toMassachusettsCountyFips(row.breakdownValue);
    if (!countyId) continue;

    totals[countyId] = (totals[countyId] ?? 0) + row.metricValue;
  }

  return totals as Record<CountyId, number>;
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

function toTitleCaseLabel(input: string): string {
  return input.replace(/[A-Za-z]+/g, (word) => {
    if (word.length === 0) return word;
    return word[0].toUpperCase() + word.slice(1).toLowerCase();
  });
}

function groupSourceTotals(sourceTotals: Record<string, number>): Array<{
  source: string;
  sessions: number;
  otherBreakdown?: Array<{ label: string; value: number }>;
}> {
  const sorted = Object.entries(sourceTotals)
    .sort((a, b) => b[1] - a[1])
    .map(([source, sessions]) => ({
      source: toTitleCaseLabel(source),
      sessions,
    }));

  if (sorted.length <= 5) return sorted;

  const top = sorted.slice(0, 4);
  const otherItems = sorted.slice(4);
  const otherTotal = otherItems.reduce((sum, item) => sum + item.sessions, 0);

  return [
    ...top,
    {
      source: "Other",
      sessions: otherTotal,
      otherBreakdown: otherItems.map((item) => ({
        label: item.source,
        value: item.sessions,
      })),
    },
  ];
}

// share-of-total for tooltip/coloring
function toShareOfTotalIntensity(countyVisits: Record<CountyId, number>): {
  intensity: Partial<Record<CountyId, number>>;
  total: number;
} {
  const entries = Object.entries(countyVisits) as Array<[CountyId, number]>;
  const total = entries.reduce((sum, [, v]) => sum + (Number(v) || 0), 0);

  if (total <= 0) return { intensity: {}, total: 0 };

  const intensity = Object.fromEntries(
    entries.map(([id, v]) => [id, (Number(v) || 0) / total]),
  ) as Partial<Record<CountyId, number>>;

  return { intensity, total };
}

// -----------------------------
// Helpers for time series / cards
// -----------------------------
function getBounds(pts: Point[]) {
  if (!pts.length)
    return { min: null as Date | null, max: null as Date | null };
  const dates = pts
    .map((p) => p.date)
    .slice()
    .sort();
  return { min: new Date(dates[0]), max: new Date(dates[dates.length - 1]) };
}

function filterByRangeAnchoredToToday(pts: Point[], range: DateRangeId) {
  if (!pts.length) return pts;

  const { startDate, endDate } = computeStartEndFromRangeToday(range);
  return pts.filter((p) => p.date >= startDate && p.date <= endDate);
}

function rangeOptionsWithData(points: Point[]): DateRangeId[] {
  if (!points.length) return ["all"];

  const options: DateRangeId[] = [];
  if (filterByRangeAnchoredToToday(points, "7d").length > 0) options.push("7d");
  if (filterByRangeAnchoredToToday(points, "30d").length > 0)
    options.push("30d");
  if (filterByRangeAnchoredToToday(points, "1y").length > 0) options.push("1y");
  if (filterByRangeAnchoredToToday(points, "all").length > 0)
    options.push("all");

  return options.length > 0 ? options : ["all"];
}

function metricRowDateISO(row: SocialMediaMetric): string | null {
  const raw = row.metricDate ?? row.lastSynced;
  return raw ? raw.slice(0, 10) : null;
}

function filterMetricRowsByRangeAnchoredToToday(
  rows: SocialMediaMetric[],
  range: DateRangeId,
) {
  const { startDate, endDate } = computeStartEndFromRangeToday(
    range,
    defaultStartDate,
  );

  return rows.filter((row) => {
    const date = metricRowDateISO(row);
    return date != null && date >= startDate && date <= endDate;
  });
}

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

function toLinePoints(raw: SocialMediaMetric[]): Point[] {
  return sortByDate(raw).map((m) => {
    const timestamp = (m.metricDate ?? m.lastSynced)!;
    return { date: timestamp.slice(0, 10), value: m.metricValue };
  });
}

function summarizeSeries(pts: Point[]): MetricSummary {
  if (pts.length === 0) return { current: null, prev: null };
  if (pts.length === 1) return { current: pts[0].value, prev: null };
  const latest = pts[pts.length - 1].value;
  const prev = pts[pts.length - 2].value;
  return { current: latest, prev };
}

function mergeUsersAnd7Day(active: Point[], active7: Point[]): TimePoint[] {
  const map: Record<string, TimePoint> = {};
  active.forEach((p) => {
    map[p.date] ??= { date: p.date };
    map[p.date].activeUsers = p.value;
  });
  active7.forEach((p) => {
    map[p.date] ??= { date: p.date };
    map[p.date].active7DayUsers = p.value;
  });
  return Object.values(map).sort((a, b) => a.date.localeCompare(b.date));
}

function formatPercentChange(summary?: MetricSummary | null): string {
  if (!summary || summary.current == null || summary.prev == null)
    return "+ 0%";
  if (summary.prev === 0) return "+ 0%";
  const pct = ((summary.current - summary.prev) / summary.prev) * 100;
  const sign = pct >= 0 ? "+" : "";
  return `${sign}${pct.toFixed(1)}% vs. prev.`;
}

// -----------------------------
// Component
// -----------------------------
export default function GoogleAnalyticsPage() {
  const { exportByPlatforms } = useGlobalPageExporter();

  const [metrics, setMetrics] = useState<GAMetrics | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  // charts
  const [usersOverTime, setUsersOverTime] = useState<TimePoint[]>([]);
  const [engagementOverTime, setEngagementOverTime] = useState<TimePoint[]>([]);

  // bounds-only series
  const [usersOverTimeAll, setUsersOverTimeAll] = useState<TimePoint[]>([]);
  const [engagementOverTimeAll, setEngagementOverTimeAll] = useState<
    TimePoint[]
  >([]);

  const [metricSummaries, setMetricSummaries] = useState<
    Partial<Record<MetricKey, MetricSummary>>
  >({});
  const [smallCardSummaries, setSmallCardSummaries] = useState<
    Partial<Record<MetricKey, MetricSummary>>
  >({});
  const [smallCardSeries, setSmallCardSeries] = useState<
    Partial<Record<MetricKey, Point[]>>
  >({});

  // date ranges
  const [activeUsersRange, setActiveUsersRange] = useState<DateRangeId>("30d");
  const [engagementRange, setEngagementRange] = useState<DateRangeId>("30d");
  const [countyRange, setCountyRange] = useState<DateRangeId>("30d"); // ✅ map dropdown
  const [sourceRange, setSourceRange] = useState<DateRangeId>("30d");
  const [deviceRange, setDeviceRange] = useState<DateRangeId>("30d");
  const [newVsReturningRange, setNewVsReturningRange] =
    useState<DateRangeId>("30d");

  // fixed ranges
  const pageviewsRange: DateRangeId = "30d";
  const active7Range: DateRangeId = "30d";
  const newUsersRange: DateRangeId = "30d";

  // -----------------------------
  // County map state (DB driven)
  // -----------------------------
  const [totalSessionsRowsAll, setTotalSessionsRowsAll] = useState<
    SocialMediaMetric[]
  >([]);
  const [sourceRowsAll, setSourceRowsAll] = useState<SocialMediaMetric[]>([]);
  const [returningVsNewData, setReturningVsNewData] = useState<
    { label: string; value: number }[]
  >([
    { label: "New Users", value: 0 },
    { label: "Returning Users", value: 0 },
  ]);

  // ---------------------
  // Fetch GA metrics
  // ---------------------
  useEffect(() => {
    async function loadGA() {
      try {
        const [
          activeUsersRaw,
          pageviewsRaw,
          active7Raw,
          engagementRaw,
          newUsersRaw,
          engagementTimeRaw,
        ] = await Promise.all([
          fetchMetrics({
            provider,
            metric: "ACTIVE_USERS",
            startDate: defaultStartDate,
            endDate: defaultEndDate,
          }),
          fetchMetrics({
            provider,
            metric: "SCREEN_PAGE_VIEWS",
            startDate: defaultStartDate,
            endDate: defaultEndDate,
          }),
          fetchMetrics({
            provider,
            metric: "ACTIVE_7_DAY_USERS",
            startDate: defaultStartDate,
            endDate: defaultEndDate,
          }),
          fetchMetrics({
            provider,
            metric: "ENGAGEMENT_RATE",
            startDate: defaultStartDate,
            endDate: defaultEndDate,
          }),
          fetchMetrics({
            provider,
            metric: "NEW_USERS",
            startDate: defaultStartDate,
            endDate: defaultEndDate,
          }),
          fetchMetrics({
            provider,
            metric: "ENGAGEMENT_TIME",
            startDate: defaultStartDate,
            endDate: defaultEndDate,
          }),
        ]);

        const activeAll = toLinePoints(activeUsersRaw);
        const pageviewsAll = toLinePoints(pageviewsRaw);
        const active7All = toLinePoints(active7Raw);
        const engagementAll = toLinePoints(engagementRaw);
        const newUsersAll = toLinePoints(newUsersRaw);
        const engagementTimeAll = toLinePoints(engagementTimeRaw);

        // FILTER ANCHORED TO TODAY (not last datapoint)
        const activeFiltered = filterByRangeAnchoredToToday(
          activeAll,
          activeUsersRange,
        );
        const pageviewsFiltered = filterByRangeAnchoredToToday(
          pageviewsAll,
          pageviewsRange,
        );
        const active7Filtered = filterByRangeAnchoredToToday(
          active7All,
          active7Range,
        );
        const engagementFiltered = filterByRangeAnchoredToToday(
          engagementAll,
          engagementRange,
        );
        const newUsersFiltered = filterByRangeAnchoredToToday(
          newUsersAll,
          newUsersRange,
        );
        const engagementTimeFiltered = filterByRangeAnchoredToToday(
          engagementTimeAll,
          activeUsersRange,
        );

        const activeSummary = summarizeSeries(activeFiltered);
        const pageviewsDisplaySeries =
          pageviewsFiltered.length > 0 ? pageviewsFiltered : pageviewsAll;
        const pageviewsSummary = summarizeSeries(pageviewsDisplaySeries);
        const active7Summary = summarizeSeries(
          active7Filtered.length > 0 ? active7Filtered : active7All,
        );
        const engagementSummary = summarizeSeries(engagementFiltered);
        const newUsersSummary = summarizeSeries(newUsersFiltered);
        const engagementTimeSummary = summarizeSeries(engagementTimeFiltered);
        const activeForPie = filterByRangeAnchoredToToday(
          activeAll,
          newVsReturningRange,
        );
        const newUsersForPie = filterByRangeAnchoredToToday(
          newUsersAll,
          newVsReturningRange,
        );
        const pieActiveSummary = summarizeSeries(activeForPie);
        const pieNewUsersSummary = summarizeSeries(newUsersForPie);
        const pieActiveUsers = pieActiveSummary.current ?? 0;
        const pieNewUsers = pieNewUsersSummary.current ?? 0;
        const pieReturningUsers = Math.max(pieActiveUsers - pieNewUsers, 0);

        setMetricSummaries({
          activeUsers: activeSummary,
          screenPageViews: pageviewsSummary,
          active7DayUsers: active7Summary,
          engagementRate: engagementSummary,
          newUsers: newUsersSummary,
          engagementTime: engagementTimeSummary,
        });
        setSmallCardSummaries({
          screenPageViews: summarizeSeries(pageviewsAll),
          active7DayUsers: summarizeSeries(active7All),
          engagementTime: summarizeSeries(engagementTimeAll),
        });
        setSmallCardSeries({
          screenPageViews: pageviewsAll,
          active7DayUsers: active7All,
          engagementTime: engagementTimeAll,
        });

        setMetrics({
          activeUsers: activeSummary.current ?? 0,
          screenPageViews: pageviewsSummary.current ?? 0,
          active7DayUsers: active7Summary.current ?? 0,
          engagementRate:
            engagementSummary.current != null
              ? engagementSummary.current / 100
              : 0,
          newUsers: newUsersSummary.current ?? 0,
          engagementTime: engagementTimeSummary.current ?? 0,
        });
        setLastUpdated((prev) =>
          getLatestImportedDate(
            prev ? [{ date: prev }] : [],
            activeAll,
            pageviewsAll,
            active7All,
            engagementAll,
            newUsersAll,
            engagementTimeAll,
          ),
        );
        setReturningVsNewData([
          { label: "New Users", value: pieNewUsers },
          { label: "Returning Users", value: pieReturningUsers },
        ]);

        // all-series for bounds / date pickers
        setUsersOverTimeAll(mergeUsersAnd7Day(activeAll, active7All));
        setEngagementOverTimeAll(
          engagementAll.map((p) => ({ date: p.date, engagementRate: p.value })),
        );

        // filtered for charts
        setUsersOverTime(mergeUsersAnd7Day(activeFiltered, active7Filtered));
        setEngagementOverTime(
          engagementFiltered.map((p) => ({
            date: p.date,
            engagementRate: p.value,
          })),
        );
      } catch (err) {
        console.error("Error loading Google Analytics metrics:", err);
      }
    }

    loadGA();
  }, [
    activeUsersRange,
    engagementRange,
    pageviewsRange,
    active7Range,
    newUsersRange,
    newVsReturningRange,
  ]);

  // ---------------------
  // Fetch county sessions breakdown + compute % of total
  // ✅ date dropdown on map, anchored to TODAY
  // ---------------------
  useEffect(() => {
    async function loadBreakdownsAllTime() {
      try {
        const [sessionRows, sourceRows] = await Promise.all([
          fetchMetrics({
            provider,
            metric: "TOTAL_SESSIONS",
            startDate: defaultStartDate,
            endDate: defaultEndDate,
          }),
          fetchMetrics({
            provider,
            metric: "SESSIONS_BY_SOURCE",
            startDate: defaultStartDate,
            endDate: defaultEndDate,
          }),
        ]);

        setTotalSessionsRowsAll(sessionRows);
        setSourceRowsAll(sourceRows);
        setLastUpdated((prev) =>
          getLatestImportedDate(
            prev ? [{ date: prev }] : [],
            sessionRows,
            sourceRows,
          ),
        );
      } catch (err) {
        console.error("Error loading GA breakdown metrics:", err);
        setTotalSessionsRowsAll([]);
        setSourceRowsAll([]);
      }
    }

    loadBreakdownsAllTime();
  }, []);

  // ---------------------
  // Derived display
  // ---------------------
  const dMetrics: GAMetrics = metrics ?? {
    activeUsers: 0,
    screenPageViews: 0,
    active7DayUsers: 0,
    engagementRate: 0,
    newUsers: 0,
    engagementTime: 0,
  };

  const activeUsersBounds = getBounds(
    usersOverTimeAll.map((p) => ({ date: p.date, value: p.activeUsers ?? 0 })),
  );
  const engagementBounds = getBounds(
    engagementOverTimeAll.map((p) => ({
      date: p.date,
      value: p.engagementRate ?? 0,
    })),
  );

  // Use same bounds for county dropdown so it looks consistent with other cards.
  // (Even though filtering is anchored to TODAY, this just controls min/max labels.)
  const countyBounds = activeUsersBounds;
  const activeUsersOptions = rangeOptionsWithData(
    usersOverTimeAll
      .map((p) => ({ date: p.date, value: p.activeUsers }))
      .filter((p): p is { date: string; value: number } => p.value != null),
  );
  const engagementOptions = rangeOptionsWithData(
    engagementOverTimeAll
      .map((p) => ({ date: p.date, value: p.engagementRate }))
      .filter((p): p is { date: string; value: number } => p.value != null),
  );
  const filteredCountyRows = filterMetricRowsByRangeAnchoredToToday(
    totalSessionsRowsAll.filter((row) => row.breakdownKey === "county"),
    countyRange,
  );
  const countyVisits = aggregateCountyVisitTotals(filteredCountyRows);
  const { intensity: countyIntensity, total: countyTotal } =
    toShareOfTotalIntensity(countyVisits);
  const countyOptions = (["7d", "30d", "1y", "all"] as DateRangeId[]).filter(
    (range) =>
      aggregateCountyVisitTotals(
        filterMetricRowsByRangeAnchoredToToday(
          totalSessionsRowsAll.filter((row) => row.breakdownKey === "county"),
          range,
        ),
      ) &&
      Object.keys(
        aggregateCountyVisitTotals(
          filterMetricRowsByRangeAnchoredToToday(
            totalSessionsRowsAll.filter((row) => row.breakdownKey === "county"),
            range,
          ),
        ),
      ).length > 0,
  );
  const countyAvailableOptions: DateRangeId[] =
    countyOptions.length > 0 ? countyOptions : ["all"];

  const filteredSourceRows = filterMetricRowsByRangeAnchoredToToday(
    sourceRowsAll.filter((row) => row.breakdownKey === "sessionSource"),
    sourceRange,
  );
  const sourceTotals = aggregateBreakdownTotals(
    filteredSourceRows,
    "sessionSource",
  );
  const sourceData = groupSourceTotals(sourceTotals);
  const sourceAvailableOptions: DateRangeId[] = (
    ["7d", "30d", "1y", "all"] as DateRangeId[]
  ).filter(
    (range) =>
      Object.keys(
        aggregateBreakdownTotals(
          filterMetricRowsByRangeAnchoredToToday(
            sourceRowsAll.filter((row) => row.breakdownKey === "sessionSource"),
            range,
          ),
          "sessionSource",
        ),
      ).length > 0,
  );

  const filteredDeviceRows = filterMetricRowsByRangeAnchoredToToday(
    totalSessionsRowsAll.filter((row) => row.breakdownKey === "deviceCategory"),
    deviceRange,
  );
  const deviceTotals = aggregateBreakdownTotals(
    filteredDeviceRows,
    "deviceCategory",
  );
  const deviceData = Object.entries(deviceTotals).map(([label, value]) => ({
    label:
      label.length > 0
        ? label[0].toUpperCase() + label.slice(1).toLowerCase()
        : "Unknown",
    value,
  }));
  const deviceAvailableOptions: DateRangeId[] = (
    ["7d", "30d", "1y", "all"] as DateRangeId[]
  ).filter(
    (range) =>
      Object.keys(
        aggregateBreakdownTotals(
          filterMetricRowsByRangeAnchoredToToday(
            totalSessionsRowsAll.filter(
              (row) => row.breakdownKey === "deviceCategory",
            ),
            range,
          ),
          "deviceCategory",
        ),
      ).length > 0,
  );
  const topSmallCards = [
    {
      title: "Page Views",
      tooltip: GA_CARD_TOOLTIPS.pageViews,
      value: smallCardSummaries.screenPageViews?.current ?? 0,
      label: getSmallCardSinceLabel(smallCardSeries.screenPageViews),
      change: formatAbsoluteChange(smallCardSummaries.screenPageViews),
    },
    {
      title: "Active 7-Day Users",
      tooltip: GA_CARD_TOOLTIPS.active7DayUsers,
      value: smallCardSummaries.active7DayUsers?.current ?? 0,
      label: getSmallCardSinceLabel(smallCardSeries.active7DayUsers),
      change: formatAbsoluteChange(smallCardSummaries.active7DayUsers),
    },
    {
      title: "Avg Engagement Time",
      tooltip: GA_CARD_TOOLTIPS.avgEngagementTime,
      value: Math.round(smallCardSummaries.engagementTime?.current ?? 0),
      label: getSmallCardSinceLabel(smallCardSeries.engagementTime),
      change: formatAbsoluteChange(smallCardSummaries.engagementTime),
    },
  ];

  // ---------------------
  // Render
  // ---------------------
  return (
    <div className="w-full min-h-screen bg-white flex flex-col gap-4 px-4 pb-2 pt-4 lg:pt-6">
      {/* Header */}
      <div className="w-full flex items-center justify-between px-4 py-2">
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

          <h1 className="font-poppins font-semibold text-3xl lg:text-4xl whitespace-wrap">
            Google Analytics
          </h1>
        </div>

        <div className="flex flex-row justify-center items-center mt-2 lg:mt-0 lg:space-x-2 space-x-4">
          <a
            href="https://analytics.google.com/analytics/web/#/p393011442/reports/intelligenthome"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-[15px] border border-[#0A86D9] px-4 py-1.5 text-[#0A86D9] font-poppins font-semibold inline-block"
          >
            Go to Account
          </a>
          <ExportButton onExport={exportByPlatforms} />
        </div>
      </div>
      <div className="px-4 font-poppins text-sm text-gray-600">
        Last updated: {lastUpdated ?? "No imported data yet"}
      </div>

      {/* Row 1: Top small cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 px-4">
        {topSmallCards.map((card) => (
          <SmallCard
            key={card.title}
            title={card.title}
            titleTooltip={card.tooltip}
            displayMode="metric-only"
            className="w-full"
            metricValue={card.value}
            metricLabel={card.label}
            metricChange={card.change}
          />
        ))}
      </div>

      {/* Row 2: Map + New vs Returning */}
      <div className="flex lg:flex-row flex-col gap-4 px-4">
        <div className="lg:w-3/5 w-full">
          <BigCard
            title="Massachusetts Visitors by County"
            titleTooltip={GA_CARD_TOOLTIPS.countyVisitors}
            subtitle={
              <DateDropdown
                value={{ id: countyRange }}
                onChange={(v: DateRangeValue) => setCountyRange(v.id)}
                minDate={countyBounds.min}
                maxDate={countyBounds.max}
                availableOptions={countyAvailableOptions}
              />
            }
            chart={
              <MassachusettsCountyMap
                countyIntensity={countyIntensity}
                countyValue={countyVisits}
                totalValue={countyTotal}
                valueLabel="Visitors"
                intensityLabel="% of total"
                className="mb-16"
              />
            }
            displayMode="chart-only"
            className="h-[360px]"
          />
        </div>
        <div className="lg:w-2/5 w-full">
          <BigCard
            title="New vs Returning Users"
            titleTooltip={GA_CARD_TOOLTIPS.newVsReturning}
            subtitle={
              <DateDropdown
                value={{ id: newVsReturningRange }}
                onChange={(v: DateRangeValue) => setNewVsReturningRange(v.id)}
                minDate={activeUsersBounds.min}
                maxDate={activeUsersBounds.max}
                availableOptions={activeUsersOptions}
              />
            }
            chart={
              <PieCharts
                data={returningVsNewData}
                dataKey="value"
                nameKey="label"
              />
            }
            displayMode="both"
            className="h-[360px]"
          />
        </div>
      </div>

      {/* Row 3: Device category + Active users */}
      <div className="flex lg:flex-row flex-col gap-4 px-4">
        <div className="lg:w-2/5 w-full">
          <BigCard
            title="Sessions by Device Category"
            titleTooltip={GA_CARD_TOOLTIPS.sessionsByDevice}
            subtitle={
              <DateDropdown
                value={{ id: deviceRange }}
                onChange={(v: DateRangeValue) => setDeviceRange(v.id)}
                minDate={activeUsersBounds.min}
                maxDate={activeUsersBounds.max}
                availableOptions={
                  deviceAvailableOptions.length
                    ? deviceAvailableOptions
                    : ["all"]
                }
              />
            }
            chart={
              <PieCharts data={deviceData} dataKey="value" nameKey="label" />
            }
            displayMode="both"
            className="h-[360px]"
          />
        </div>
        <div className="lg:w-3/5 w-full">
          <BigCard
            title="Active Users"
            titleTooltip={GA_CARD_TOOLTIPS.activeUsers}
            subtitle={
              <DateDropdown
                value={{ id: activeUsersRange }}
                onChange={(v: DateRangeValue) => setActiveUsersRange(v.id)}
                minDate={activeUsersBounds.min}
                maxDate={activeUsersBounds.max}
                availableOptions={activeUsersOptions}
              />
            }
            metricValue={dMetrics.activeUsers}
            metricLabel="total"
            metricChange={formatPercentChange(metricSummaries.activeUsers)}
            chart={
              <LineCharts
                data={usersOverTime}
                xAxisKey="date"
                dataKeys={["activeUsers"]}
                showArea
              />
            }
            displayMode="both"
            className="h-[360px]"
          />
        </div>
      </div>

      {/* Row 4: Source + Engagement side-by-side equal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 px-4 pb-4">
        <BigCard
          title="Traffic Source Breakdown"
          titleTooltip={GA_CARD_TOOLTIPS.trafficSources}
          subtitle={
            <DateDropdown
              value={{ id: sourceRange }}
              onChange={(v: DateRangeValue) => setSourceRange(v.id)}
              minDate={activeUsersBounds.min}
              maxDate={activeUsersBounds.max}
              availableOptions={
                sourceAvailableOptions.length ? sourceAvailableOptions : ["all"]
              }
            />
          }
          chart={
            <BarCharts
              data={sourceData}
              xAxisKey="source"
              dataKeys={["sessions"]}
            />
          }
          displayMode="chart-only"
          className="h-[360px]"
        />
        <BigCard
          title="Engagement Rate"
          titleTooltip={GA_CARD_TOOLTIPS.engagementRate}
          subtitle={
            <DateDropdown
              value={{ id: engagementRange }}
              onChange={(v: DateRangeValue) => setEngagementRange(v.id)}
              minDate={engagementBounds.min}
              maxDate={engagementBounds.max}
              availableOptions={engagementOptions}
            />
          }
          metricValue={Number((dMetrics.engagementRate * 100).toFixed(1))}
          metricLabel="% engaged"
          metricChange={formatPercentChange(metricSummaries.engagementRate)}
          chart={
            <LineCharts
              data={engagementOverTime}
              xAxisKey="date"
              dataKeys={["engagementRate"]}
              showArea
            />
          }
          displayMode="both"
          className="h-[360px]"
        />
      </div>
    </div>
  );
}
