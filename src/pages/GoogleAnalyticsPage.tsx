// pages/GoogleAnalyticsPage.tsx
import { useEffect, useState } from "react";

// Cards
import BigCard from "../components/cards/BigCard";
import SmallCard from "../components/cards/SmallCard";
// Charts
import LineCharts from "../components/charts/LineCharts";
import PieCharts from "../components/charts/PieCharts";
// Buttons
import DateRangeButton from "../components/date-range/DateRangeButton";
import ExportButton from "../components/export-pdf/ExportButton";

import { useGlobalPageExporter } from "../components/export-pdf/GlobalPageExportProvider";
import { fetchMetrics, SocialMediaMetric } from "../utils/fetchMetrics";

// ---------- Types ----------
type GAMetrics = {
  activeUsers: number;
  screenPageViews: number;
  active7DayUsers: number;
  engagementRate: number; // stored as 0–1, displayed as %
  newUsers: number;
};

type TimePoint = {
  date: string;
  activeUsers?: number;
  screenPageViews?: number;
  active7DayUsers?: number;
};

type MetricSummary = {
  current: number | null;
  prev: number | null;
};

export default function GoogleAnalyticsPage() {
  const [metrics, setMetrics] = useState<GAMetrics | null>(null);
  const [usersOverTime, setUsersOverTime] = useState<TimePoint[]>([]);
  const [pageviewsOverTime, setPageviewsOverTime] = useState<
    { date: string; screenPageViews: number }[]
  >([]);
  const [metricSummaries, setMetricSummaries] = useState<
    Record<string, MetricSummary>
  >({});

  const { exportByPlatforms } = useGlobalPageExporter();

  const provider = "GOOGLE_ANALYTICS";
  const defaultStartDate = "2024-01-01";
  const defaultEndDate = "3000-01-01";

  // ---------- Helpers ----------
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
    return sortByDate(raw).map((m) => ({
      date: (m.metricDate ?? m.lastSynced)!.slice(0, 10),
      value: m.metricValue,
    }));
  }

  function summarize(points: { value: number }[]): MetricSummary {
    if (points.length === 0) return { current: null, prev: null };
    if (points.length === 1) return { current: points[0].value, prev: null };
    return {
      current: points[points.length - 1].value,
      prev: points[points.length - 2].value,
    };
  }

  function mergeUsers(
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

  function pct(summary?: MetricSummary): string {
    if (!summary || summary.current == null || summary.prev == null) {
      return "+ 0%";
    }
    if (summary.prev === 0) return "+ 0%";

    const change = ((summary.current - summary.prev) / summary.prev) * 100;
    const sign = change >= 0 ? "+" : "";
    return `${sign}${change.toFixed(1)}%`;
  }

  function engagementDelta(summary?: MetricSummary): string {
    if (!summary || summary.current == null || summary.prev == null) {
      return "+0.0pp";
    }
    const delta = summary.current - summary.prev;
    const sign = delta >= 0 ? "+" : "";
    return `${sign}${delta.toFixed(1)}pp`;
  }

  // ---------- Load GA metrics for on-screen display ----------
  useEffect(() => {
    async function load() {
      try {
        const fetcher = (metric: string) =>
          fetchMetrics({
            provider,
            metric,
            startDate: defaultStartDate,
            endDate: defaultEndDate,
          });

        const [
          activeRaw,
          pageRaw,
          active7Raw,
          engageRaw,
          newUsersRaw,
        ] = await Promise.all([
          fetcher("ACTIVE_USERS"),
          fetcher("SCREEN_PAGE_VIEWS"),
          fetcher("ACTIVE_7_DAY_USERS"),
          fetcher("ENGAGEMENT_RATE"),
          fetcher("NEW_USERS"),
        ]);

        const activePts = toLinePoints(activeRaw);
        const pagePts = toLinePoints(pageRaw);
        const active7Pts = toLinePoints(active7Raw);
        const engagePts = toLinePoints(engageRaw);
        const newPts = toLinePoints(newUsersRaw);

        const summaries: Record<string, MetricSummary> = {
          activeUsers: summarize(activePts),
          screenPageViews: summarize(pagePts),
          active7DayUsers: summarize(active7Pts),
          engagementRate: summarize(engagePts),
          newUsers: summarize(newPts),
        };
        setMetricSummaries(summaries);

        setMetrics({
          activeUsers: summaries.activeUsers.current ?? 0,
          screenPageViews: summaries.screenPageViews.current ?? 0,
          active7DayUsers: summaries.active7DayUsers.current ?? 0,
          engagementRate:
            summaries.engagementRate.current != null
              ? summaries.engagementRate.current / 100
              : 0,
          newUsers: summaries.newUsers.current ?? 0,
        });

        setUsersOverTime(mergeUsers(activePts, active7Pts));
        setPageviewsOverTime(
          pagePts.map((p) => ({
            date: p.date,
            screenPageViews: p.value,
          })),
        );
      } catch (err) {
        console.error("Error loading Google Analytics metrics:", err);
      }
    }

    load();
  }, []);

  // ---------- Safe defaults ----------
  const d: GAMetrics = metrics ?? {
    activeUsers: 0,
    screenPageViews: 0,
    active7DayUsers: 0,
    engagementRate: 0,
    newUsers: 0,
  };

  const returningUsers = Math.max(d.activeUsers - d.newUsers, 0);

  const returningVsNew = [
    { label: "New Users", value: d.newUsers },
    { label: "Returning Users", value: returningUsers },
  ];

  // ---------- Render ----------
  return (
    <div className="w-full min-h-screen bg-white flex flex-col gap-4">
      {/* Header */}
      <div className="w-full flex justify-between items-center px-4 py-2">
        <h1 className="font-poppins font-semibold text-4xl">Google</h1>

        <div className="flex gap-2">
          <DateRangeButton />
          {/* 🔑 Global export: can export ANY platforms from here */}
          <ExportButton onExport={exportByPlatforms} />
        </div>
      </div>

      {/* Top metric row */}
      <div className="px-4 flex flex-col lg:flex-row gap-4">
        <SmallCard
          title="Active Users"
          metricValue={d.activeUsers}
          metricChange={pct(metricSummaries.activeUsers)}
          displayMode="metric-only"
          className="w-full h-full"
        />

        <SmallCard
          title="Page Views"
          metricValue={d.screenPageViews}
          metricChange={pct(metricSummaries.screenPageViews)}
          displayMode="metric-only"
          className="w-full h-full"
        />

        <SmallCard
          title="Active 7-Day Users"
          metricValue={d.active7DayUsers}
          metricChange={pct(metricSummaries.active7DayUsers)}
          displayMode="metric-only"
          className="w-full h-full"
        />

        <SmallCard
          title="Engagement Rate"
          metricValue={Number((d.engagementRate * 100).toFixed(1))}
          metricLabel="% engaged"
          metricChange={engagementDelta(metricSummaries.engagementRate)}
          displayMode="metric-only"
          className="w-full h-full"
        />

        <SmallCard
          title="New Users"
          metricValue={d.newUsers}
          metricChange={pct(metricSummaries.newUsers)}
          displayMode="metric-only"
          className="w-full h-full"
        />
      </div>

      {/* Large chart cards */}
      <div className="px-4 flex flex-col gap-4">
        <BigCard
          title="Active Users"
          subtitle="Over time"
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
          className="w-full"
        />

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
          className="w-full"
        />

        <BigCard
          title="Pageviews"
          subtitle="Over time"
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
          className="w-full"
        />

        <BigCard
          title="Active 7-Day Users (trend)"
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
          className="w-full"
        />
      </div>
    </div>
  );
}