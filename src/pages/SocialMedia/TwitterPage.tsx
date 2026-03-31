import { useEffect, useState } from "react";
import { DateRangeValue } from "../../components/charts/DateButton";
import DateDropdown from "../../components/charts/DateButton";
import BigCard from "../../components/cards/BigCard";
import LineCharts from "../../components/charts/LineCharts";
import { fetchMetrics } from "../../utils/fetchMetrics";
import { getLatestImportedDate } from "../../utils/latestImportedDate";
import {
  type MetricSummary,
  toLinePoints,
  summarizeSeries,
  getBounds,
  filterByRange,
} from "../../utils/seriesUtils";

type TwitterMetrics = { followers: number; tweets: number };
type TimePoint = { date: string; followers?: number; tweets?: number };

const PROVIDER = "TWITTER";
const DEFAULT_START_DATE = "2024-01-01";
const DEFAULT_END_DATE = "3000-01-01";

function formatPercentChange(summary?: MetricSummary | null): string {
  if (!summary || summary.current == null || summary.prev == null)
    return "+ 0%";
  if (summary.prev === 0) return "+ 0%";
  const pct = ((summary.current - summary.prev) / summary.prev) * 100;
  return `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}% vs. prev.`;
}

export default function TwitterPage() {
  const [followersOverTimeAll, setFollowersOverTimeAll] = useState<
    { date: string; value: number }[]
  >([]);
  const [tweetsOverTimeAll, setTweetsOverTimeAll] = useState<
    { date: string; value: number }[]
  >([]);
  const [followersOverTime, setFollowersOverTime] = useState<TimePoint[]>([]);
  const [tweetsOverTime, setTweetsOverTime] = useState<TimePoint[]>([]);
  const [metrics, setMetrics] = useState<TwitterMetrics | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [metricSummaries, setMetricSummaries] = useState<
    Partial<Record<keyof TwitterMetrics, MetricSummary>>
  >({});
  const [followersRange, setFollowersRange] = useState<DateRangeValue>({
    id: "30d",
  });
  const [tweetsRange, setTweetsRange] = useState<DateRangeValue>({ id: "30d" });

  // ---------- Load Metrics ----------

  useEffect(() => {
    async function loadTwitter() {
      try {
        const [followersRaw, tweetsRaw] = await Promise.all([
          fetchMetrics({
            provider: PROVIDER,
            metric: "FOLLOWERS",
            startDate: DEFAULT_START_DATE,
            endDate: DEFAULT_END_DATE,
          }),
          fetchMetrics({
            provider: PROVIDER,
            metric: "POSTS",
            startDate: DEFAULT_START_DATE,
            endDate: DEFAULT_END_DATE,
          }),
        ]);

        const followersAll = toLinePoints(followersRaw);
        const tweetsAll = toLinePoints(tweetsRaw);

        setLastUpdated(getLatestImportedDate(followersRaw, tweetsRaw));
        setFollowersOverTimeAll(followersAll);
        setTweetsOverTimeAll(tweetsAll);

        const followersFiltered = filterByRange(followersAll, followersRange);
        const tweetsFiltered = filterByRange(tweetsAll, tweetsRange);

        setFollowersOverTime(
          followersFiltered.map((p) => ({ date: p.date, followers: p.value })),
        );
        setTweetsOverTime(
          tweetsFiltered.map((p) => ({ date: p.date, tweets: p.value })),
        );

        setMetricSummaries({
          followers: summarizeSeries(followersFiltered),
          tweets: summarizeSeries(tweetsFiltered),
        });

        setMetrics({
          followers: summarizeSeries(followersFiltered).current ?? 0,
          tweets: summarizeSeries(tweetsFiltered).current ?? 0,
        });
      } catch (err) {
        console.error("Error loading Twitter metrics:", err);
      }
    }
    loadTwitter();
  }, [followersRange, tweetsRange]);

  const dMetrics: TwitterMetrics = metrics ?? { followers: 0, tweets: 0 };
  const followersBounds = getBounds(followersOverTimeAll);
  const tweetsBounds = getBounds(tweetsOverTimeAll);

  // ---------- Render ----------
  return (
    <div className="w-full min-h-screen bg-white flex flex-col gap-4 px-4 pb-2 pt-4 lg:pt-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between lg:items-center">
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
            Twitter
          </h1>
        </div>
        {/* Add export button if needed */}
      </div>
      <div className="font-poppins text-sm text-gray-600">
        Last updated: {lastUpdated ?? "No imported data yet"}
      </div>

      <div className="flex flex-col gap-4 lg:h-full">
        <div className="w-full flex flex-col lg:flex-row gap-4">
          <div className="flex flex-col gap-4 w-full">
            <BigCard
              title="Tweets"
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
