// pages/export-pages/GoogleAnalyticsExportPage.tsx
import { useEffect, useState } from "react";

import BigCard from "../../components/cards/BigCard";
import SmallCard from "../../components/cards/SmallCard";
import LineCharts from "../../components/charts/LineCharts";
import PieCharts from "../../components/charts/PieCharts";
import { fetchMetrics, SocialMediaMetric } from "../../utils/fetchMetrics";

// ---- Local export types (keeps export page self-contained) ----
export type MetricSummary = { current: number | null; prev: number | null };

export type GAMetrics = {
  activeUsers: number;
  screenPageViews: number;
  active7DayUsers: number;
  engagementRate: number; // 0–1; displayed as %
  newUsers: number;
};

export type TimePoint = {
  date: string;
  activeUsers?: number;
  screenPageViews?: number;
  active7DayUsers?: number;
};

interface GoogleAnalyticsExportPageProps {
  domId: string;
  registerPage: (id: string, el: HTMLElement | null) => void;
}

export default function GoogleAnalyticsExportPage({
  domId,
  registerPage,
}: GoogleAnalyticsExportPageProps) {
  const [metrics, setMetrics] = useState<GAMetrics | null>(null);
  const [metricSummaries, setMetricSummaries] = useState<
    Record<string, MetricSummary>
  >({});
  const [usersOverTime, setUsersOverTime] = useState<TimePoint[]>([]);
  const [pageviewsOverTime, setPageviewsOverTime] = useState<TimePoint[]>([]);

  const provider = "GOOGLE_ANALYTICS";
  const startDate = "2024-01-01";
  const endDate = "3000-01-01";

  // ---- Helpers ----
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

  function toSeries(raw: SocialMediaMetric[]): { date: string; value: number }[] {
    return sortByDate(raw).map((m) => {
      const timestamp = (m.metricDate ?? m.lastSynced)!;
      return {
        date: timestamp.slice(0, 10),
        value: m.metricValue,
      };
    });
  }

  function summarize(series: { date: string; value: number }[]): MetricSummary {
    if (series.length === 0) return { current: null, prev: null };
    if (series.length === 1) return { current: series[0].value, prev: null };
    return {
      current: series[series.length - 1].value,
      prev: series[series.length - 2].value,
    };
  }

  function mergeUsers(
    active: { date: string; value: number }[],
    seven: { date: string; value: number }[],
  ): TimePoint[] {
    const map: Record<string, TimePoint> = {};

    active.forEach((p) => {
      if (!map[p.date]) map[p.date] = { date: p.date };
      map[p.date].activeUsers = p.value;
    });

    seven.forEach((p) => {
      if (!map[p.date]) map[p.date] = { date: p.date };
      map[p.date].active7DayUsers = p.value;
    });

    return Object.values(map).sort((a, b) => a.date.localeCompare(b.date));
  }

  useEffect(() => {
    // register this page with the global exporter
    registerPage(domId, document.getElementById(domId));

    async function load() {
      try {
        const [
          activeRaw,
          pageviewsRaw,
          active7Raw,
          engageRaw,
          newRaw,
        ] = await Promise.all([
          fetchMetrics({
            provider,
            metric: "ACTIVE_USERS",
            startDate,
            endDate,
          }),
          fetchMetrics({
            provider,
            metric: "SCREEN_PAGE_VIEWS",
            startDate,
            endDate,
          }),
          fetchMetrics({
            provider,
            metric: "ACTIVE_7_DAY_USERS",
            startDate,
            endDate,
          }),
          fetchMetrics({
            provider,
            metric: "ENGAGEMENT_RATE",
            startDate,
            endDate,
          }),
          fetchMetrics({
            provider,
            metric: "NEW_USERS",
            startDate,
            endDate,
          }),
        ]);

        const activeSeries = toSeries(activeRaw);
        const pageviewsSeries = toSeries(pageviewsRaw);
        const active7Series = toSeries(active7Raw);
        const engageSeries = toSeries(engageRaw);
        const newSeries = toSeries(newRaw);

        setMetricSummaries({
          activeUsers: summarize(activeSeries),
          screenPageViews: summarize(pageviewsSeries),
          active7DayUsers: summarize(active7Series),
          engagementRate: summarize(engageSeries),
          newUsers: summarize(newSeries),
        });

        setMetrics({
          activeUsers:
            activeSeries.length > 0
              ? activeSeries[activeSeries.length - 1].value
              : 0,
          screenPageViews:
            pageviewsSeries.length > 0
              ? pageviewsSeries[pageviewsSeries.length - 1].value
              : 0,
          active7DayUsers:
            active7Series.length > 0
              ? active7Series[active7Series.length - 1].value
              : 0,
          // stored as 0–100, convert to 0–1
          engagementRate:
            engageSeries.length > 0
              ? engageSeries[engageSeries.length - 1].value / 100
              : 0,
          newUsers:
            newSeries.length > 0
              ? newSeries[newSeries.length - 1].value
              : 0,
        });

        setUsersOverTime(mergeUsers(activeSeries, active7Series));

        setPageviewsOverTime(
          pageviewsSeries.map((p) => ({
            date: p.date,
            screenPageViews: p.value,
          })),
        );
      } catch (err) {
        console.error("Error loading Google Analytics metrics for export:", err);
      }
    }

    load();
  }, [domId, registerPage]);

  const d: GAMetrics = metrics ?? {
    activeUsers: 0,
    screenPageViews: 0,
    active7DayUsers: 0,
    engagementRate: 0,
    newUsers: 0,
  };

  const returningUsers = Math.max(d.activeUsers - d.newUsers, 0);

  return (
    <div
      id={domId}
      style={{
        padding: 32,
        background: "#ffffff",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <h1 style={{ fontSize: 32, fontWeight: 600, marginBottom: 24 }}>
        Google Analytics — Full Report
      </h1>

      {/* Summary Metric Row */}
      <div style={{ display: "flex", gap: 16, marginBottom: 32 }}>
        <SmallCard
          title="Active Users"
          metricValue={d.activeUsers}
          displayMode="metric-only"
          className="w-full"
        />
        <SmallCard
          title="Page Views"
          metricValue={d.screenPageViews}
          displayMode="metric-only"
          className="w-full"
        />
        <SmallCard
          title="Active 7-Day Users"
          metricValue={d.active7DayUsers}
          displayMode="metric-only"
          className="w-full"
        />
        <SmallCard
          title="Engagement Rate"
          metricValue={Number((d.engagementRate * 100).toFixed(1))}
          displayMode="metric-only"
          className="w-full"
        />
        <SmallCard
          title="New Users"
          metricValue={d.newUsers}
          displayMode="metric-only"
          className="w-full"
        />
      </div>

      {/* Big Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <BigCard
          title="Active Users"
          displayMode="chart-only"
          className="w-full"
          chart={
            <div style={{ height: 260 }}>
              <LineCharts
                data={usersOverTime}
                xAxisKey="date"
                dataKeys={["activeUsers"]}
                showArea
              />
            </div>
          }
        />

        <BigCard
          title="New vs Returning Users"
          displayMode="chart-only"
          className="w-full"
          chart={
            <div style={{ height: 260 }}>
              <PieCharts
                data={[
                  { label: "New Users", value: d.newUsers },
                  { label: "Returning Users", value: returningUsers },
                ]}
                dataKey="value"
                nameKey="label"
              />
            </div>
          }
        />

        <BigCard
          title="Pageviews"
          displayMode="chart-only"
          className="w-full"
          chart={
            <div style={{ height: 260 }}>
              <LineCharts
                data={pageviewsOverTime}
                xAxisKey="date"
                dataKeys={["screenPageViews"]}
              />
            </div>
          }
        />

        <BigCard
          title="Active 7-Day Users (trend)"
          displayMode="chart-only"
          className="w-full"
          chart={
            <div style={{ height: 260 }}>
              <LineCharts
                data={usersOverTime}
                xAxisKey="date"
                dataKeys={["active7DayUsers"]}
                showArea
              />
            </div>
          }
        />
      </div>
    </div>
  );
}