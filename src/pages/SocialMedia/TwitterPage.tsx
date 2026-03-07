import { useEffect, useState } from "react";
import BigCard from "../../components/cards/BigCard";
import LineCharts from "../../components/charts/LineCharts";
import DateDropdown, {
  DateRangeId,
} from "../../components/charts/DateDropdown";
import ExportButton from "../../components/export-pdf/ExportButton";
import { fetchMetrics, SocialMediaMetric } from "../..//utils/fetchMetrics";
import { useGlobalPageExporter } from "../../components/export-pdf/GlobalPageExportProvider";

type TwitterMetrics = {
  followers: number;
  tweets: number;
};

type TimePoint = {
  date: string;
  followers?: number;
  tweets?: number;
};

type MetricSummary = {
  current: number | null;
  prev: number | null;
};

export default function TwitterPage() {
  const { exportByPlatforms } = useGlobalPageExporter();

  const [metrics, setMetrics] = useState<TwitterMetrics | null>(null);

  const [followersOverTime, setFollowersOverTime] = useState<TimePoint[]>([]);
  const [tweetsOverTime, setTweetsOverTime] = useState<TimePoint[]>([]);

  const [followersOverTimeAll, setFollowersOverTimeAll] = useState<TimePoint[]>(
    [],
  );
  const [tweetsOverTimeAll, setTweetsOverTimeAll] = useState<TimePoint[]>([]);

  const [metricSummaries, setMetricSummaries] = useState<
    Partial<Record<keyof TwitterMetrics, MetricSummary>>
  >({});

  const [followersRange, setFollowersRange] = useState<DateRangeId>("30d");
  const [tweetsRange, setTweetsRange] = useState<DateRangeId>("30d");

  const provider = "TWITTER";
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

  function summarizeSeries(
    pts: { date: string; value: number }[],
  ): MetricSummary {
    if (!pts.length) return { current: null, prev: null };
    if (pts.length === 1) return { current: pts[0].value, prev: null };
    return {
      current: pts[pts.length - 1].value,
      prev: pts[pts.length - 2].value,
    };
  }

  function filterByRange(
    pts: { date: string; value: number }[],
    range: DateRangeId,
  ) {
    if (!pts.length || range === "all") return pts;
    const end = new Date(pts[pts.length - 1].date);
    const start = new Date(end);
    if (range === "7d") start.setDate(start.getDate() - 6);
    if (range === "30d") start.setDate(start.getDate() - 29);
    if (range === "1y") start.setFullYear(start.getFullYear() - 1);
    const startStr = start.toISOString().slice(0, 10);
    const endStr = end.toISOString().slice(0, 10);
    return pts.filter((p) => p.date >= startStr && p.date <= endStr);
  }

  function getBounds(pts: { date: string; value: number }[]) {
    if (!pts.length)
      return { min: null as Date | null, max: null as Date | null };
    const dates = pts
      .map((p) => p.date)
      .slice()
      .sort();
    return { min: new Date(dates[0]), max: new Date(dates[dates.length - 1]) };
  }

  function formatPercentChange(summary?: MetricSummary | null): string {
    if (!summary || summary.current == null || summary.prev == null)
      return "+ 0%";
    if (summary.prev === 0) return "+ 0%";
    const pct = ((summary.current - summary.prev) / summary.prev) * 100;
    return `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}% vs. prev.`;
  }

  // ---------- Load Metrics ----------
  useEffect(() => {
    async function loadTwitter() {
      try {
        const [followersRaw, tweetsRaw] = await Promise.all([
          fetchMetrics({
            provider,
            metric: "FOLLOWERS",
            startDate: defaultStartDate,
            endDate: defaultEndDate,
          }),
          fetchMetrics({
            provider,
            metric: "POSTS",
            startDate: defaultStartDate,
            endDate: defaultEndDate,
          }),
        ]);

        const followersAll = toLinePoints(followersRaw);
        const tweetsAll = toLinePoints(tweetsRaw);

        const followersFiltered = filterByRange(followersAll, followersRange);
        const tweetsFiltered = filterByRange(tweetsAll, tweetsRange);

        setMetricSummaries({
          followers: summarizeSeries(followersFiltered),
          tweets: summarizeSeries(tweetsFiltered),
        });

        setMetrics({
          followers: summarizeSeries(followersFiltered).current ?? 0,
          tweets: summarizeSeries(tweetsFiltered).current ?? 0,
        });

        setFollowersOverTimeAll(followersAll);
        setTweetsOverTimeAll(tweetsAll);

        setFollowersOverTime(
          followersFiltered.map((p) => ({ date: p.date, followers: p.value })),
        );
        setTweetsOverTime(
          tweetsFiltered.map((p) => ({ date: p.date, tweets: p.value })),
        );
      } catch (err) {
        console.error("Error loading Twitter metrics:", err);
      }
    }
    loadTwitter();
  }, [followersRange, tweetsRange]);

  const dMetrics: TwitterMetrics = metrics ?? { followers: 0, tweets: 0 };

  const followersBounds = getBounds(
    followersOverTimeAll.map((p) => ({
      date: p.date,
      value: p.followers ?? 0,
    })),
  );
  const tweetsBounds = getBounds(
    tweetsOverTimeAll.map((p) => ({ date: p.date, value: p.tweets ?? 0 })),
  );

  // ---------- Render ----------
  return (
    <div className="w-full min-h-screen bg-white flex flex-col gap-4 px-4 pb-2 pt-4 lg:pt-6">
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

          <h1 className="font-poppins font-semibold text-3xl lg:text-4xl">
            Twitter
          </h1>
        </div>
        <div className="flex flex-row justify-center items-center mt-2 lg:flex-row lg:mt-0 lg:space-x-2 space-x-4">
          <a
            href="https://x.com/sowma"
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

      <div className="flex flex-col gap-4 px-4 lg:h-full">
        <div className="w-full flex flex-col lg:flex-row gap-4">
          {/* Right Column */}
          <div className="flex flex-col gap-4 w-full">
            <BigCard
              title="Tweets"
              titleTooltip="Cumulative count"
              subtitle={
                <DateDropdown
                  value={tweetsRange}
                  onChange={setTweetsRange}
                  minDate={tweetsBounds.min}
                  maxDate={tweetsBounds.max}
                />
              }
              metricValue={dMetrics.tweets}
              metricLabel="total"
              metricChange={formatPercentChange(metricSummaries.tweets)}
              chart={
                <LineCharts
                  data={tweetsOverTime}
                  xAxisKey="date"
                  dataKeys={["tweets"]}
                  showArea
                />
              }
              displayMode="both"
              className="h-[360px]"
            />

            <div className="flex flex-col gap-4 w-full">
              <BigCard
                title="Followers"
                titleTooltip="Cumulative count"
                subtitle={
                  <DateDropdown
                    value={followersRange}
                    onChange={setFollowersRange}
                    minDate={followersBounds.min}
                    maxDate={followersBounds.max}
                  />
                }
                metricValue={dMetrics.followers}
                metricLabel="followers"
                metricChange={formatPercentChange(metricSummaries.followers)}
                chart={
                  <LineCharts
                    data={followersOverTime}
                    xAxisKey="date"
                    dataKeys={["followers"]}
                    showArea
                  />
                }
                displayMode="both"
                className="h-[360px]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
