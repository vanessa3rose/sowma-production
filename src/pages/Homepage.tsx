import { useEffect, useMemo, useState } from "react";
import { fetchMetrics, SocialMediaMetric } from "../utils/fetchMetrics";
import ExportButton from "../components/export-pdf/ExportButton";
import { useGlobalPageExporter } from "../components/export-pdf/GlobalPageExportProvider";

import LineCharts from "../components/charts/LineCharts";
import BigCard from "../components/cards/BigCard";
import DateDropdown, { DateRangeId } from "../components/charts/DateDropdown";

type ImpressionsPoint = { date: string; impressions: number };
type DaysPostedPoint = { date: string; posts: number };
type WebsiteSessionsPoint = { date: string; sessions: number };
type FollowerPoint = { date: string; followers: number };

type SocialProvider = "FACEBOOK" | "INSTAGRAM" | "TWITTER";

export default function Homepage() {
  const { exportByPlatforms } = useGlobalPageExporter();

  const [impressionsData, setImpressionsData] = useState<ImpressionsPoint[]>(
    [],
  );
  const [daysPostedData, setDaysPostedData] = useState<DaysPostedPoint[]>([]);
  const [websiteSessionsData, setWebsiteSessionsData] = useState<
    WebsiteSessionsPoint[]
  >([]);
  const [followerCountData, setFollowerCountData] = useState<FollowerPoint[]>(
    [],
  );

  const [impressionsProvider, setImpressionsProvider] =
    useState<SocialProvider>("FACEBOOK");
  const [daysPostedProvider, setDaysPostedProvider] =
    useState<SocialProvider>("FACEBOOK");
  const [followersProvider, setFollowersProvider] =
    useState<SocialProvider>("FACEBOOK");

  // Per-card date ranges
  const [impressionsRange, setImpressionsRange] = useState<DateRangeId>("30d");
  const [daysPostedRange, setDaysPostedRange] = useState<DateRangeId>("30d");
  const [sessionsRange, setSessionsRange] = useState<DateRangeId>("30d");
  const [followersRange, setFollowersRange] = useState<DateRangeId>("30d");

  const googleAnalyticsProvider = "GOOGLE_ANALYTICS";
  const defaultStartDate = "2024-01-01";
  const defaultEndDate = "3000-01-01";

  function getSortedMetrics(raw: SocialMediaMetric[]): SocialMediaMetric[] {
    return raw
      .slice()
      .sort((a, b) =>
        (a.metricDate ?? a.lastSynced ?? "").localeCompare(
          b.metricDate ?? b.lastSynced ?? "",
        ),
      );
  }

  function mapToImpressionsPoints(
    raw: SocialMediaMetric[],
  ): ImpressionsPoint[] {
    return getSortedMetrics(raw).map((m) => {
      const timestamp =
        m.metricDate ?? m.lastSynced ?? new Date().toISOString();
      return { date: timestamp.slice(0, 10), impressions: m.metricValue };
    });
  }

  function mapToDaysPostedPoints(raw: SocialMediaMetric[]): DaysPostedPoint[] {
    const sorted = getSortedMetrics(raw);
    if (daysPostedProvider === "FACEBOOK") {
      let runningTotal = 0;
      return sorted.map((m) => {
        const timestamp =
          m.metricDate ?? m.lastSynced ?? new Date().toISOString();
        runningTotal += m.metricValue;
        return { date: timestamp.slice(0, 10), posts: runningTotal };
      });
    }
    return sorted.map((m) => {
      const timestamp =
        m.metricDate ?? m.lastSynced ?? new Date().toISOString();
      return { date: timestamp.slice(0, 10), posts: m.metricValue };
    });
  }

  function mapToWebsiteSessionsPoints(
    raw: SocialMediaMetric[],
  ): WebsiteSessionsPoint[] {
    return getSortedMetrics(raw).map((m) => {
      const timestamp =
        m.metricDate ?? m.lastSynced ?? new Date().toISOString();
      return { date: timestamp.slice(0, 10), sessions: m.metricValue };
    });
  }

  function mapToFollowerPoints(raw: SocialMediaMetric[]): FollowerPoint[] {
    return getSortedMetrics(raw).map((m) => {
      const timestamp =
        m.metricDate ?? m.lastSynced ?? new Date().toISOString();
      return { date: timestamp.slice(0, 10), followers: m.metricValue };
    });
  }

  // Bounds + filtering helpers (TODAY-anchored)
  function getBounds(dates: string[]) {
    if (!dates.length)
      return { min: null as Date | null, max: null as Date | null };
    const sorted = dates.slice().sort();
    return {
      min: new Date(sorted[0]),
      max: new Date(sorted[sorted.length - 1]),
    };
  }

  function filterByRange<T extends { date: string }>(
    pts: T[],
    range: DateRangeId,
  ) {
    if (!pts.length) return pts;
    if (range === "all") return pts;

    const end = new Date();
    end.setHours(0, 0, 0, 0);
    const start = new Date(end);

    if (range === "7d") start.setDate(start.getDate() - 6);
    if (range === "30d") start.setDate(start.getDate() - 29);
    if (range === "1y") start.setFullYear(start.getFullYear() - 1);

    const startStr = start.toISOString().slice(0, 10);
    const endStr = end.toISOString().slice(0, 10);

    return pts.filter((p) => p.date >= startStr && p.date <= endStr);
  }

  // ---- FETCHERS ----
  async function loadImpressions() {
    try {
      const impressionsRaw = await fetchMetrics({
        provider: impressionsProvider,
        metric: "VIEWS",
        startDate: defaultStartDate,
        endDate: defaultEndDate,
      });
      setImpressionsData(mapToImpressionsPoints(impressionsRaw));
    } catch (error) {
      console.error("Error fetching impressions metrics:", error);
    }
  }

  async function loadDaysPosted() {
    try {
      const daysPostedRaw = await fetchMetrics({
        provider: daysPostedProvider,
        metric: "POSTS",
        startDate: defaultStartDate,
        endDate: defaultEndDate,
      });
      setDaysPostedData(mapToDaysPostedPoints(daysPostedRaw));
    } catch (error) {
      console.error("Error fetching days posted metrics:", error);
    }
  }

  async function loadWebsiteSessions() {
    try {
      const websiteSessionsRaw = await fetchMetrics({
        provider: googleAnalyticsProvider,
        metric: "SCREEN_PAGE_VIEWS",
        startDate: defaultStartDate,
        endDate: defaultEndDate,
      });
      setWebsiteSessionsData(mapToWebsiteSessionsPoints(websiteSessionsRaw));
    } catch (error) {
      console.error("Error fetching website sessions metrics:", error);
    }
  }

  async function loadFollowers() {
    try {
      const followerCountRaw = await fetchMetrics({
        provider: followersProvider,
        metric: "FOLLOWERS",
        startDate: defaultStartDate,
        endDate: defaultEndDate,
      });
      setFollowerCountData(mapToFollowerPoints(followerCountRaw));
    } catch (error) {
      console.error("Error fetching follower metrics:", error);
    }
  }

  // ---- EFFECTS ----
  useEffect(() => {
    loadImpressions();
  }, [impressionsProvider]);

  useEffect(() => {
    loadDaysPosted();
  }, [daysPostedProvider]);

  useEffect(() => {
    loadFollowers();
  }, [followersProvider]);

  useEffect(() => {
    loadWebsiteSessions();
  }, []);

  // Compute bounds from full (unfiltered) series
  const impressionsBounds = useMemo(
    () => getBounds(impressionsData.map((p) => p.date)),
    [impressionsData],
  );
  const daysPostedBounds = useMemo(
    () => getBounds(daysPostedData.map((p) => p.date)),
    [daysPostedData],
  );
  const sessionsBounds = useMemo(
    () => getBounds(websiteSessionsData.map((p) => p.date)),
    [websiteSessionsData],
  );
  const followersBounds = useMemo(
    () => getBounds(followerCountData.map((p) => p.date)),
    [followerCountData],
  );

  // Filtered (displayed) series
  const impressionsFiltered = useMemo(
    () => filterByRange(impressionsData, impressionsRange),
    [impressionsData, impressionsRange],
  );
  const daysPostedFiltered = useMemo(
    () => filterByRange(daysPostedData, daysPostedRange),
    [daysPostedData, daysPostedRange],
  );
  const sessionsFiltered = useMemo(
    () => filterByRange(websiteSessionsData, sessionsRange),
    [websiteSessionsData, sessionsRange],
  );
  const followersFiltered = useMemo(
    () => filterByRange(followerCountData, followersRange),
    [followerCountData, followersRange],
  );

  const ProviderSelect = ({
    value,
    onChange,
  }: {
    value: SocialProvider;
    onChange: (v: SocialProvider) => void;
  }) => (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as SocialProvider)}
      className="border rounded-md px-2 py-1 text-xs bg-white text-gray-700"
    >
      <option value="FACEBOOK">Facebook</option>
      <option value="INSTAGRAM">Instagram</option>
      <option value="TWITTER">Twitter</option>
    </select>
  );

  return (
    <div className="w-full min-h-screen lg:h-full px-6 py-6 flex flex-col gap-6">
      {/* Header row */}
      <div className="flex flex-wrap w-full justify-between items-center gap-4">
        <h1 className="font-poppins text-[#4781C2] text-2xl font-semibold">
          Dashboard
        </h1>

        <ExportButton onExport={exportByPlatforms} />
      </div>

      {/* Main charts row */}
      <div className="flex flex-col flex-wrap gap-4 w-full lg:flex-row">
        <BigCard
          title="Impressions"
          titleTooltip="Number of users who see your website"
          subtitle=""
          dropdown={
            <div className="flex items-center gap-2">
              <ProviderSelect
                value={impressionsProvider}
                onChange={setImpressionsProvider}
              />
              <DateDropdown
                value={impressionsRange}
                onChange={setImpressionsRange}
                minDate={impressionsBounds.min}
                maxDate={impressionsBounds.max}
              />
            </div>
          }
          chart={
            impressionsFiltered.length > 0 ? (
              <div className="w-full h-64">
                <LineCharts
                  data={impressionsFiltered}
                  xAxisKey="date"
                  dataKeys={["impressions"]}
                  showArea
                  autoAdjustYAxis
                />
              </div>
            ) : (
              <div className="w-full h-64 flex items-center justify-center text-sm text-gray-500">
                No impressions data available.
              </div>
            )
          }
          displayMode="both"
          className="flex-1 w-full"
        />

        <BigCard
          title="Total Posts"
          titleTooltip="Cumulative count"
          subtitle=""
          dropdown={
            <div className="flex items-center gap-2">
              <ProviderSelect
                value={daysPostedProvider}
                onChange={setDaysPostedProvider}
              />
              <DateDropdown
                value={daysPostedRange}
                onChange={setDaysPostedRange}
                minDate={daysPostedBounds.min}
                maxDate={daysPostedBounds.max}
              />
            </div>
          }
          chart={
            daysPostedFiltered.length > 0 ? (
              <div className="w-full h-64">
                <LineCharts
                  data={daysPostedFiltered}
                  xAxisKey="date"
                  dataKeys={["posts"]}
                  autoAdjustYAxis
                  showArea
                />
              </div>
            ) : (
              <div className="w-full h-64 flex items-center justify-center text-sm text-gray-500">
                No days posted data available.
              </div>
            )
          }
          displayMode="both"
          className="flex-1 w-full"
        />

        <BigCard
          title="Google Analytics Website Sessions"
          titleTooltip="A session is all the actions a user takes during one visit"
          subtitle=""
          dropdown={
            <div className="flex items-center gap-2">
              <DateDropdown
                value={sessionsRange}
                onChange={setSessionsRange}
                minDate={sessionsBounds.min}
                maxDate={sessionsBounds.max}
              />
            </div>
          }
          chart={
            sessionsFiltered.length > 0 ? (
              <div className="w-full h-64">
                <LineCharts
                  data={sessionsFiltered}
                  xAxisKey="date"
                  dataKeys={["sessions"]}
                  showArea
                  autoAdjustYAxis
                />
              </div>
            ) : (
              <div className="w-full h-64 flex items-center justify-center text-sm text-gray-500">
                No website sessions data available.
              </div>
            )
          }
          displayMode="both"
          className="flex-1 w-full"
        />
      </div>

      <div className="flex flex-col lg:flex-row flex-wrap gap-4 w-full lg:h-full">
        <BigCard
          title="Follower Count"
          titleTooltip="Cumulative count"
          subtitle=""
          dropdown={
            <div className="flex items-center gap-2">
              <ProviderSelect
                value={followersProvider}
                onChange={setFollowersProvider}
              />
              <DateDropdown
                value={followersRange}
                onChange={setFollowersRange}
                minDate={followersBounds.min}
                maxDate={followersBounds.max}
              />
            </div>
          }
          chart={
            followersFiltered.length > 0 ? (
              <div className="w-full h-64">
                <LineCharts
                  data={followersFiltered}
                  xAxisKey="date"
                  dataKeys={["followers"]}
                  autoAdjustYAxis
                  showArea
                />
              </div>
            ) : (
              <div className="w-full h-64 flex items-center justify-center text-sm text-gray-500">
                No follower count data available.
              </div>
            )
          }
          displayMode="both"
          className="flex-1 w-full"
        />

        <BigCard
          title="How did you hear about us?"
          subtitle=""
          chart={
            <div className="w-full h-64 flex items-center justify-center text-sm text-gray-500">
              No data available.
            </div>
          }
          displayMode="both"
          className="flex-1 w-full"
        />
      </div>
    </div>
  );
}
