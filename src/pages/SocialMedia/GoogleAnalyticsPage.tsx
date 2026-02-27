import { useEffect, useState } from "react";

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
  newUsers?: number;
  engagementRate?: number; // ENGAGEMENT
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
  const [engagementOverTime, setEngagementOverTime] = useState<TimePoint[]>([]); // ENGAGEMENT

  // Full (unfiltered) series — used ONLY for dropdown bounds/options
  const [usersOverTimeAll, setUsersOverTimeAll] = useState<TimePoint[]>([]);
  const [engagementOverTimeAll, setEngagementOverTimeAll] = useState<
    TimePoint[]
  >([]); // ENGAGEMENT

  const [metricSummaries, setMetricSummaries] = useState<
    Partial<Record<MetricKey, MetricSummary>>
  >({});

  // Localized (per-chart) date ranges
  const [activeUsersRange, setActiveUsersRange] = useState<DateRangeId>("30d");
  const pageviewsRange: DateRangeId = "30d";
  const active7Range: DateRangeId = "30d";
  const newUsersRange: DateRangeId = "30d";
  const [engagementRange, setEngagementRange] = useState<DateRangeId>("30d"); // ENGAGEMENT

  const provider = "GOOGLE_ANALYTICS";
  const defaultStartDate = "2024-01-01";
  const defaultEndDate = "3000-01-01";

  function getBounds(pts: { date: string; value: number }[]) {
    if (!pts.length)
      return { min: null as Date | null, max: null as Date | null };
    const dates = pts
      .map((p) => p.date)
      .slice()
      .sort();
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
      return { date: timestamp.slice(0, 10), value: m.metricValue };
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
    if (!summary || summary.current == null || summary.prev == null)
      return "+ 0%";
    if (summary.prev === 0) return "+ 0%";
    const pct = ((summary.current - summary.prev) / summary.prev) * 100;
    const sign = pct >= 0 ? "+" : "";
    return `${sign}${pct.toFixed(1)}% vs. prev.`;
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

        const activeSeriesAll = toLinePoints(activeUsersRaw);
        const pageviewsSeriesAll = toLinePoints(pageviewsRaw);
        const active7SeriesAll = toLinePoints(active7Raw);
        const engagementSeriesAll = toLinePoints(engagementRaw);
        const newUsersSeriesAll = toLinePoints(newUsersRaw);

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
        const engagementSeriesFiltered = filterByRange(
          engagementSeriesAll,
          engagementRange,
        );
        const newUsersSeriesFiltered = filterByRange(
          newUsersSeriesAll,
          newUsersRange,
        );

        const activeSummary = summarizeSeries(activeSeriesFiltered);
        const pageviewsSummary = summarizeSeries(pageviewsSeriesFiltered);
        const active7Summary = summarizeSeries(active7SeriesFiltered);
        const engagementSummary = summarizeSeries(engagementSeriesFiltered);
        const newUsersSummary = summarizeSeries(newUsersSeriesFiltered);

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

        setUsersOverTimeAll(
          mergeUsersAnd7Day(activeSeriesAll, active7SeriesAll),
        );
        setEngagementOverTimeAll(
          engagementSeriesAll.map((p) => ({
            date: p.date,
            engagementRate: p.value,
          })),
        );

        setUsersOverTime(
          mergeUsersAnd7Day(activeSeriesFiltered, active7SeriesFiltered),
        );
        setEngagementOverTime(
          engagementSeriesFiltered.map((p) => ({
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
    pageviewsRange,
    active7Range,
    engagementRange,
    newUsersRange,
  ]);

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

  const activeUsersBounds = getBounds(
    usersOverTimeAll.map((p) => ({ date: p.date, value: p.activeUsers ?? 0 })),
  );
  const engagementBounds = getBounds(
    engagementOverTimeAll.map((p) => ({
      date: p.date,
      value: p.engagementRate ?? 0,
    })),
  );

  return (
    <div className="w-full min-h-screen bg-white flex flex-col gap-4 px-4 py-2">
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

          <h1 className="font-poppins font-semibold text-3xl lg:text-4xl whitespace-nowrap">
            Google Analytics
          </h1>
        </div>
        <div className="flex flex-row justify-center items-center mt-2 lg:flex-row lg:mt-0 lg:space-x-2 space-x-4">
          <a
            href="https://analytics.google.com/analytics/web"
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
      <div className="flex lg:flex-row flex-col gap-4 px-4 lg:h-full">
        {/* Left Column */}
        <div className="flex flex-col gap-4 lg:w-3/5 w-full">
          <BigCard
            title="Active Users"
            titleTooltip="Active means 10+ seconds on the site or viewed 2+ pages"
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

          <BigCard
            title="Engagement Rate"
            titleTooltip="Percent of visitors to the page that stayed for 10+ seconds"
            subtitle={
              <DateDropdown
                value={engagementRange}
                onChange={setEngagementRange}
                minDate={engagementBounds.min}
                maxDate={engagementBounds.max}
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

        {/* Right Column */}
        <div className="flex flex-col gap-4 lg:w-2/5 w-full">
          <BigCard
            title="New vs Returning Users"
            titleTooltip="New users have not visited the site in at least a month"
            chart={
              <PieCharts
                data={returningVsNew}
                dataKey="value"
                nameKey="label"
              />
            }
            displayMode="both"
            className="w-full h-full"
          />

          <SmallCard
            title="Page Views"
            titleTooltip="Number of times any page on the website was viewed"
            displayMode="metric-only"
            className="w-full h-full"
            metricValue={dMetrics.screenPageViews}
            metricLabel="views"
            metricChange={formatPercentChange(metricSummaries.screenPageViews)}
          />
          <SmallCard
            title="Active 7-Day Users"
            titleTooltip="Number of unique, engaged users who visited the website in the last 7 days"
            displayMode="metric-only"
            className="w-full h-full"
            metricValue={dMetrics.active7DayUsers}
            metricLabel="users (7D)"
            metricChange={formatPercentChange(metricSummaries.active7DayUsers)}
          />
        </div>
      </div>
    </div>
  );
}
