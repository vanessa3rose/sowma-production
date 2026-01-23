//drop down menu for hoże page

import { useEffect, useState } from "react";

// Cards
import BigCard from "../components/cards/BigCard";
import SmallCard from "../components/cards/SmallCard";
// Charts
import LineCharts from "../components/charts/LineCharts";
import PieCharts from "../components/charts/PieCharts";
// Buttons
import DateRangeButton from "../components/date-range/DateRangeButton";
import DateDropdown, { DateRangeId } from "../components/charts/DateDropdown";
import ExportButton from "../components/export-pdf/ExportButton";

import { fetchMetrics, SocialMediaMetric } from "../utils/fetchMetrics";
import { useGlobalPageExporter } from "../components/export-pdf/GlobalPageExportProvider";

//Types
export type GAMetrics = {
  activeUsers: number;
  screenPageViews: number;
  active7DayUsers: number;
  engagementRate: number;
  newUsers: number;
};

export type TimePoint = {
  date: string;
  activeUsers?: number;
  screenPageViews?: number;
  active7DayUsers?: number;
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
  | "newUsers";

export default function GoogleAnalyticsPage() {
  const { exportByPlatforms } = useGlobalPageExporter();

  const [metrics, setMetrics] = useState<GAMetrics | null>(null);

  // Filtered (displayed) series
  const [usersOverTime, setUsersOverTime] = useState<TimePoint[]>([]);
  const [pageviewsOverTime, setPageviewsOverTime] = useState<TimePoint[]>([]);

  // Full (unfiltered) series — used ONLY for dropdown bounds/options
  const [usersOverTimeAll, setUsersOverTimeAll] = useState<TimePoint[]>([]);
  const [pageviewsOverTimeAll, setPageviewsOverTimeAll] = useState<TimePoint[]>(
    [],
  );

  const [metricSummaries, setMetricSummaries] = useState<
    Partial<Record<MetricKey, MetricSummary>>
  >({});

  // Localized (per-chart) date ranges
  const [activeUsersRange, setActiveUsersRange] = useState<DateRangeId>("30d");
  const [pageviewsRange, setPageviewsRange] = useState<DateRangeId>("30d");
  const [active7Range, setActive7Range] = useState<DateRangeId>("30d");

  const provider = "GOOGLE_ANALYTICS";
  const defaultStartDate = "2024-01-01";
  const defaultEndDate = "3000-01-01";

  function getBounds(pts: { date: string; value: number }[]) {
    if (!pts.length)
      return { min: null as Date | null, max: null as Date | null };
    const dates = pts
      .map((p) => p.date)
      .slice()
      .sort(); // YYYY-MM-DD sorts correctly
    return { min: new Date(dates[0]), max: new Date(dates[dates.length - 1]) };
  }

  function filterByRange(
    pts: { date: string; value: number }[],
    range: DateRangeId,
  ) {
    if (!pts.length) return pts;
    if (range === "all") return pts;

    const end = new Date(pts[pts.length - 1].date);
    const start = new Date(end);

    if (range === "7d") start.setDate(start.getDate() - 6);
    if (range === "30d") start.setDate(start.getDate() - 29);
    if (range === "1y") start.setFullYear(start.getFullYear() - 1);

    const startStr = start.toISOString().slice(0, 10);
    const endStr = end.toISOString().slice(0, 10);

    return pts.filter((p) => p.date >= startStr && p.date <= endStr);
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

  function toLinePoints(
    raw: SocialMediaMetric[],
  ): { date: string; value: number }[] {
    return sortByDate(raw).map((m) => {
      const timestamp = (m.metricDate ?? m.lastSynced)!;
      return {
        date: timestamp.slice(0, 10),
        value: m.metricValue,
      };
    });
  }

  function summarizeSeries(
    pts: { date: string; value: number }[],
  ): MetricSummary {
    if (pts.length === 0) return { current: null, prev: null };
    if (pts.length === 1) return { current: pts[0].value, prev: null };
    const latest = pts[pts.length - 1].value;
    const prev = pts[pts.length - 2].value;
    return { current: latest, prev };
  }

  function mergeUsersAnd7Day(
    active: { date: string; value: number }[],
    active7: { date: string; value: number }[],
  ): TimePoint[] {
    const map: Record<string, TimePoint> = {};

    active.forEach((p) => {
      if (!map[p.date]) map[p.date] = { date: p.date };
      map[p.date].activeUsers = p.value;
    });

    active7.forEach((p) => {
      if (!map[p.date]) map[p.date] = { date: p.date };
      map[p.date].active7DayUsers = p.value;
    });

    return Object.values(map).sort((a, b) => a.date.localeCompare(b.date));
  }

  function formatPercentChange(summary?: MetricSummary | null): string {
    if (!summary || summary.current == null || summary.prev == null) {
      return "+ 0%";
    }
    if (summary.prev === 0) return "+ 0%";
    const pct = ((summary.current - summary.prev) / summary.prev) * 100;
    const sign = pct >= 0 ? "+" : "";
    return `${sign}${pct.toFixed(1)}% vs. prev.`;
  }

  function formatEngagementChange(summary?: MetricSummary | null): string {
    if (!summary || summary.current == null || summary.prev == null) {
      return "0";
    }
    const deltaPoints = summary.current - summary.prev;
    const sign = deltaPoints >= 0 ? "+" : "";
    return `${sign}${deltaPoints.toFixed(1)}pp`;
  }

  useEffect(() => {
    async function loadGA() {
      try {
        const [
          activeUsersRaw,
          pageviewsRaw,
          active7Raw,
          engagementRaw,
          newUsersRaw,
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
        ]);

        // FULL series (unfiltered)
        const activeSeriesAll = toLinePoints(activeUsersRaw);
        const pageviewsSeriesAll = toLinePoints(pageviewsRaw);
        const active7SeriesAll = toLinePoints(active7Raw);

        // Filtered series (display)
        const activeSeriesFiltered = filterByRange(
          activeSeriesAll,
          activeUsersRange,
        );
        const pageviewsSeriesFiltered = filterByRange(
          pageviewsSeriesAll,
          pageviewsRange,
        );
        const active7SeriesFiltered = filterByRange(
          active7SeriesAll,
          active7Range,
        );

        // Summaries should match what the chart is showing
        const activeSummary = summarizeSeries(activeSeriesFiltered);
        const pageviewsSummary = summarizeSeries(pageviewsSeriesFiltered);
        const active7Summary = summarizeSeries(active7SeriesFiltered);

        // (keeping these as-is; if you later want dropdowns for them too, do the same pattern)
        const engagementSeries = toLinePoints(engagementRaw);
        const newUsersSeries = toLinePoints(newUsersRaw);
        const engagementSummary = summarizeSeries(engagementSeries);
        const newUsersSummary = summarizeSeries(newUsersSeries);

        setMetricSummaries({
          activeUsers: activeSummary,
          screenPageViews: pageviewsSummary,
          active7DayUsers: active7Summary,
          engagementRate: engagementSummary,
          newUsers: newUsersSummary,
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
        });

        // FULL merged series for dropdown bounds
        setUsersOverTimeAll(
          mergeUsersAnd7Day(activeSeriesAll, active7SeriesAll),
        );
        setPageviewsOverTimeAll(
          pageviewsSeriesAll.map((p) => ({
            date: p.date,
            screenPageViews: p.value,
          })),
        );

        // FILTERED merged series for chart display
        setUsersOverTime(
          mergeUsersAnd7Day(activeSeriesFiltered, active7SeriesFiltered),
        );
        setPageviewsOverTime(
          pageviewsSeriesFiltered.map((p) => ({
            date: p.date,
            screenPageViews: p.value,
          })),
        );
      } catch (err) {
        console.error("Error loading Google Analytics metrics:", err);
      }
    }

    loadGA();
  }, [activeUsersRange, pageviewsRange, active7Range]);

  const dMetrics: GAMetrics = metrics ?? {
    activeUsers: 0,
    screenPageViews: 0,
    active7DayUsers: 0,
    engagementRate: 0,
    newUsers: 0,
  };

  const returningUsers = Math.max(dMetrics.activeUsers - dMetrics.newUsers, 0);
  const returningVsNew = [
    { label: "New Users", value: dMetrics.newUsers },
    { label: "Returning Users", value: returningUsers },
  ];

  // ✅ Bounds for dropdowns come from FULL (unfiltered) data
  const activeUsersBounds = getBounds(
    usersOverTimeAll.map((p) => ({
      date: p.date,
      value: p.activeUsers ?? 0,
    })),
  );
  const pageviewsBounds = getBounds(
    pageviewsOverTimeAll.map((p) => ({
      date: p.date,
      value: p.screenPageViews ?? 0,
    })),
  );
  const active7Bounds = getBounds(
    usersOverTimeAll.map((p) => ({
      date: p.date,
      value: p.active7DayUsers ?? 0,
    })),
  );

  return (
    <div className="w-full min-h-screen lg:h-full bg-white flex flex-col gap-4">
      {/* Header */}
      <div className="w-full flex flex-col lg:flex-row justify-between items-center px-4 py-2">
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
            Google
          </h1>
        </div>
        <div className="flex space-x-2 mt-2 lg:mt-0">
          <DateRangeButton />
          <ExportButton onExport={exportByPlatforms} />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col gap-4 px-4 lg:h-full">
        {/* Top Row Small Cards */}
        <div className="w-full flex flex-col lg:flex-row gap-4">
          <SmallCard
            title="Active Users"
            displayMode="metric-only"
            className="w-full h-full"
            metricValue={dMetrics.activeUsers}
            metricLabel="users"
            metricChange={formatPercentChange(metricSummaries.activeUsers)}
          />
          <SmallCard
            title="Page Views"
            displayMode="metric-only"
            className="w-full h-full"
            metricValue={dMetrics.screenPageViews}
            metricLabel="views"
            metricChange={formatPercentChange(metricSummaries.screenPageViews)}
          />
          <SmallCard
            title="Active 7-Day Users"
            displayMode="metric-only"
            className="w-full h-full"
            metricValue={dMetrics.active7DayUsers}
            metricLabel="users (7D)"
            metricChange={formatPercentChange(metricSummaries.active7DayUsers)}
          />
          <SmallCard
            title="Engagement Rate"
            displayMode="metric-only"
            className="w-full h-full"
            metricValue={Number((dMetrics.engagementRate * 100).toFixed(1))}
            metricLabel="% engaged"
            metricChange={formatEngagementChange(
              metricSummaries.engagementRate,
            )}
          />
          <SmallCard
            title="New Users"
            displayMode="metric-only"
            className="w-full h-full"
            metricValue={dMetrics.newUsers}
            metricLabel="new"
            metricChange={formatPercentChange(metricSummaries.newUsers)}
          />
        </div>

        {/* Large Chart Cards */}
        <div className="w-full flex flex-col gap-4 lg:h-full">
          {/* First Row */}
          <div className="flex flex-col lg:flex-row gap-4 lg:h-full">
            <div className="lg:w-2/3">
              <BigCard
                title="Active Users"
                subtitle={
                  <DateDropdown
                    value={activeUsersRange}
                    onChange={setActiveUsersRange}
                    minDate={activeUsersBounds.min}
                    maxDate={activeUsersBounds.max}
                  />
                }
                metricValue={dMetrics.activeUsers}
                metricLabel="total"
                metricChange={formatPercentChange(metricSummaries.activeUsers)}
                chart={
                  <div className="w-full h-64">
                    <LineCharts
                      data={usersOverTime}
                      xAxisKey="date"
                      dataKeys={["activeUsers"]}
                      showArea
                    />
                  </div>
                }
                displayMode="both"
                className="w-full h-full"
              />
            </div>
            <div className="lg:w-1/3">
              <BigCard
                title="New vs Returning Users"
                chart={
                  <div className="w-full h-64">
                    <PieCharts
                      data={returningVsNew}
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

          {/* Second Row */}
          <div className="flex flex-col lg:flex-row gap-4 lg:h-full">
            <div className="lg:w-1/2">
              <BigCard
                title="Pageviews"
                subtitle={
                  <DateDropdown
                    value={pageviewsRange}
                    onChange={setPageviewsRange}
                    minDate={pageviewsBounds.min}
                    maxDate={pageviewsBounds.max}
                  />
                }
                metricValue={dMetrics.screenPageViews}
                metricLabel="total"
                metricChange={formatPercentChange(
                  metricSummaries.screenPageViews,
                )}
                chart={
                  <div className="w-full h-64">
                    <LineCharts
                      data={pageviewsOverTime}
                      xAxisKey="date"
                      dataKeys={["screenPageViews"]}
                    />
                  </div>
                }
                displayMode="both"
                className="w-full h-full"
              />
            </div>
            <div className="lg:w-1/2">
              <BigCard
                title="Active 7-Day Users (trend)"
                subtitle={
                  <DateDropdown
                    value={active7Range}
                    onChange={setActive7Range}
                    minDate={active7Bounds.min}
                    maxDate={active7Bounds.max}
                  />
                }
                chart={
                  <div className="w-full h-64">
                    <LineCharts
                      data={usersOverTime}
                      xAxisKey="date"
                      dataKeys={["active7DayUsers"]}
                      showArea
                    />
                  </div>
                }
                displayMode="both"
                className="w-full h-full"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
