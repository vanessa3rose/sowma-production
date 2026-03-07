import { useEffect, useMemo, useState } from "react";
import { fetchMetrics, SocialMediaMetric } from "../utils/fetchMetrics";
import ExportButton from "../components/export-pdf/ExportButton";
import { useGlobalPageExporter } from "../components/export-pdf/GlobalPageExportProvider";

import LineCharts from "../components/charts/LineCharts";
import BigCard from "../components/cards/BigCard";
import PlatformMetricCard from "../components/cards/PlatformMetricCard";
import DateDropdown, { DateRangeValue } from "../components/charts/DateButton";

type ImpressionsPoint = { date: string; impressions: number };
type DaysPostedPoint = { date: string; posts: number };
type WebsiteSessionsPoint = { date: string; sessions: number };
type FollowerPoint = { date: string; facebook: number | null; instagram: number | null; twitter: number | null };

type SocialProvider = "FACEBOOK" | "INSTAGRAM" | "TWITTER";

export default function Homepage() {
  const { exportByPlatforms } = useGlobalPageExporter();

  const [impressionsData, setImpressionsData] = useState<ImpressionsPoint[]>([]);
  const [daysPostedData, setDaysPostedData] = useState<DaysPostedPoint[]>([]);
  const [websiteSessionsData, setWebsiteSessionsData] = useState<WebsiteSessionsPoint[]>([]);
  const [followerCountData, setFollowerCountData] = useState<FollowerPoint[]>([]);

  const [impressionsProvider, setImpressionsProvider] = useState<SocialProvider>("FACEBOOK");
  const [daysPostedProvider, setDaysPostedProvider] = useState<SocialProvider>("FACEBOOK");

  // Per-card date ranges (now using DateRangeValue)
  const [impressionsRange, setImpressionsRange] = useState<DateRangeValue>({
    id: "30d",
  });
  const [daysPostedRange, setDaysPostedRange] = useState<DateRangeValue>({
    id: "30d",
  });
  const [sessionsRange, setSessionsRange] = useState<DateRangeValue>({
    id: "30d",
  });
  const [followersRange, setFollowersRange] = useState<DateRangeValue>({
    id: "30d",
  });

  const googleAnalyticsProvider = "GOOGLE_ANALYTICS";
  const defaultStartDate = "2024-01-01";
  const defaultEndDate = "3000-01-01";

  const formatSinceDate = (
    date: string | null,
    range: DateRangeValue,
  ): string | null => {
    if (!date) return null;
    const d = new Date(date);
    if (range.id === "7d" || range.id === "30d") {
      return d.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "2-digit" });
    }
    return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };

  function getSortedMetrics(raw: SocialMediaMetric[]): SocialMediaMetric[] {
    return raw.slice().sort((a, b) =>
      (a.metricDate ?? a.lastSynced ?? "").localeCompare(b.metricDate ?? b.lastSynced ?? "")
    );
  }

  function mapToImpressionsPoints(raw: SocialMediaMetric[]): ImpressionsPoint[] {
    return getSortedMetrics(raw).map(m => {
      const timestamp = m.metricDate ?? m.lastSynced ?? new Date().toISOString();
      return { date: timestamp.slice(0, 10), impressions: m.metricValue };
    });
  }

  function mapToDaysPostedPoints(raw: SocialMediaMetric[]): DaysPostedPoint[] {
    const sorted = getSortedMetrics(raw);
    if (daysPostedProvider === "FACEBOOK") {
      let runningTotal = 0;
      return sorted.map(m => {
        const timestamp = m.metricDate ?? m.lastSynced ?? new Date().toISOString();
        runningTotal += m.metricValue;
        return { date: timestamp.slice(0, 10), posts: runningTotal };
      });
    }
    return sorted.map(m => {
      const timestamp = m.metricDate ?? m.lastSynced ?? new Date().toISOString();
      return { date: timestamp.slice(0, 10), posts: m.metricValue };
    });
  }

  function mapToWebsiteSessionsPoints(raw: SocialMediaMetric[]): WebsiteSessionsPoint[] {
    return getSortedMetrics(raw).map(m => {
      const timestamp = m.metricDate ?? m.lastSynced ?? new Date().toISOString();
      return { date: timestamp.slice(0, 10), sessions: m.metricValue };
    });
  }

  function getBounds(dates: string[]) {
    if (!dates.length) return { min: null as Date | null, max: null as Date | null };
    const sorted = dates.slice().sort();
    return { min: new Date(sorted[0]), max: new Date(sorted[sorted.length - 1]) };
  }

  function filterByRange<T extends { date: string }>(
    pts: T[],
    range: DateRangeValue,
  ) {
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

  async function loadImpressions() {
    try {
      const raw = await fetchMetrics({ provider: impressionsProvider, metric: "VIEWS", startDate: defaultStartDate, endDate: defaultEndDate });
      setImpressionsData(mapToImpressionsPoints(raw));
    } catch (err) { console.error(err); }
  }

  async function loadDaysPosted() {
    try {
      const raw = await fetchMetrics({ provider: daysPostedProvider, metric: "POSTS", startDate: defaultStartDate, endDate: defaultEndDate });
      setDaysPostedData(mapToDaysPostedPoints(raw));
    } catch (err) { console.error(err); }
  }

  async function loadWebsiteSessions() {
    try {
      const raw = await fetchMetrics({ provider: googleAnalyticsProvider, metric: "SCREEN_PAGE_VIEWS", startDate: defaultStartDate, endDate: defaultEndDate });
      setWebsiteSessionsData(mapToWebsiteSessionsPoints(raw));
    } catch (err) { console.error(err); }
  }

  async function loadFollowers() {
    try {
      const [fbRaw, igRaw, twRaw] = await Promise.all([
        fetchMetrics({ provider: "FACEBOOK", metric: "FOLLOWERS", startDate: defaultStartDate, endDate: defaultEndDate }),
        fetchMetrics({ provider: "INSTAGRAM", metric: "FOLLOWERS", startDate: defaultStartDate, endDate: defaultEndDate }),
        fetchMetrics({ provider: "TWITTER", metric: "FOLLOWERS", startDate: defaultStartDate, endDate: defaultEndDate }),
      ]);
  
      const mergedMap = new Map<string, { facebook: number | null; instagram: number | null; twitter: number | null }>();
  
      const addToMap = (raw: SocialMediaMetric[], key: "facebook" | "instagram" | "twitter") => {
        for (const m of raw) {
          const date = (m.metricDate ?? m.lastSynced ?? new Date().toISOString()).slice(0, 10);
          const existing = mergedMap.get(date) ?? { facebook: null, instagram: null, twitter: null };
          mergedMap.set(date, { ...existing, [key]: m.metricValue });
        }
      };
  
      addToMap(fbRaw, "facebook");
      addToMap(igRaw, "instagram");
      addToMap(twRaw, "twitter");
  
      const merged = Array.from(mergedMap.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, values]) => ({ date, ...values }));
  
      setFollowerCountData(merged);
    } catch (err) { console.error(err); }
  }

  useEffect(() => { loadImpressions(); }, [impressionsProvider]);
  useEffect(() => { loadDaysPosted(); }, [daysPostedProvider]);
  useEffect(() => { loadWebsiteSessions(); }, []);
  useEffect(() => { loadFollowers(); }, []);

  const impressionsBounds = useMemo(() => getBounds(impressionsData.map(p => p.date)), [impressionsData]);
  const daysPostedBounds = useMemo(() => getBounds(daysPostedData.map(p => p.date)), [daysPostedData]);
  const sessionsBounds = useMemo(() => getBounds(websiteSessionsData.map(p => p.date)), [websiteSessionsData]);
  const followersBounds = useMemo(() => getBounds(followerCountData.map(p => p.date)), [followerCountData]);

  const impressionsFiltered = useMemo(() => filterByRange(impressionsData, impressionsRange), [impressionsData, impressionsRange]);
  const daysPostedFiltered = useMemo(() => filterByRange(daysPostedData, daysPostedRange), [daysPostedData, daysPostedRange]);
  const sessionsFiltered = useMemo(() => filterByRange(websiteSessionsData, sessionsRange), [websiteSessionsData, sessionsRange]);
  const followersFiltered = useMemo(() => filterByRange(followerCountData, followersRange), [followerCountData, followersRange]);

  const followerChange = useMemo(() => {
    if (!followersFiltered.length) return {
      facebook: null, instagram: null, twitter: null,
      fbChange: null, igChange: null, twChange: null,
      fbSince: null, igSince: null, twSince: null,
    };
  
    const getFirstPoint = (key: "facebook" | "instagram" | "twitter") => {
      for (let i = 0; i < followersFiltered.length; i++) {
        if (followersFiltered[i][key] !== null) return followersFiltered[i];
      }
      return null;
    };
  
    const getLastValue = (key: "facebook" | "instagram" | "twitter") => {
      for (let i = followersFiltered.length - 1; i >= 0; i--) {
        if (followersFiltered[i][key] !== null) return followersFiltered[i][key];
      }
      return null;
    };
  
    const fbFirst = getFirstPoint("facebook");
    const igFirst = getFirstPoint("instagram");
    const twFirst = getFirstPoint("twitter");
  
    const fbLast = getLastValue("facebook");
    const igLast = getLastValue("instagram");
    const twLast = getLastValue("twitter");
  
    return {
      facebook: fbLast,
      instagram: igLast,
      twitter: twLast,
      fbChange: fbFirst && fbLast !== null ? fbLast - (fbFirst.facebook ?? 0) : null,
      igChange: igFirst && igLast !== null ? igLast - (igFirst.instagram ?? 0) : null,
      twChange: twFirst && twLast !== null ? twLast - (twFirst.twitter ?? 0) : null,
      fbSince: fbFirst?.date ?? null,
      igSince: igFirst?.date ?? null,
      twSince: twFirst?.date ?? null,
    };
  }, [followersFiltered]);

  const ProviderSelect = ({ value, onChange }: { value: SocialProvider; onChange: (v: SocialProvider) => void }) => (
    <select value={value} onChange={(e) => onChange(e.target.value as SocialProvider)} className="border rounded-md px-2 py-1 text-xs bg-white text-gray-700">
      <option value="FACEBOOK">Facebook</option>
      <option value="INSTAGRAM">Instagram</option>
      <option value="TWITTER">Twitter</option>
    </select>
  );
  
  return (
    <div className="w-full min-h-screen lg:h-full px-6 py-6 flex flex-col gap-6">
      <div className="flex flex-wrap w-full justify-between items-center gap-4">
        <h1 className="font-poppins text-[#4781C2] text-2xl font-semibold">Dashboard</h1>
        <ExportButton onExport={exportByPlatforms} />
      </div>

      <div className="flex flex-col flex-wrap gap-4 w-full lg:flex-row">
        <BigCard
          title="Impressions"
          titleTooltip="Number of users who see your website"
          subtitle=""
          displayMode="both"
          className="flex-1 w-full max-h-[320px]"
          dropdown={
            <div className="flex h-full items-center gap-2">
              <ProviderSelect value={impressionsProvider} onChange={setImpressionsProvider} />
              <DateDropdown value={impressionsRange} onChange={setImpressionsRange} minDate={impressionsBounds.min} maxDate={impressionsBounds.max} />
            </div>
          }
          chart={
            impressionsFiltered.length > 0 ? (
              <div className="w-full h-full">
                <LineCharts data={impressionsFiltered} xAxisKey="date" dataKeys={["impressions"]} showArea autoAdjustYAxis />
              </div>
            ) : (
              <div className="w-full flex items-center justify-center text-sm text-gray-500">No impressions data available.</div>
            )
          }
        />

        <BigCard
          title="Total Posts"
          titleTooltip="Cumulative count"
          subtitle=""
          displayMode="both"
          className="flex-1 w-full max-h-[320px]"
          dropdown={
            <div className="flex items-center gap-2">
              <ProviderSelect value={daysPostedProvider} onChange={setDaysPostedProvider} />
              <DateDropdown value={daysPostedRange} onChange={setDaysPostedRange} minDate={daysPostedBounds.min} maxDate={daysPostedBounds.max} />
            </div>
          }
          chart={
            daysPostedFiltered.length > 0 ? (
              <div className="w-full h-full">
                <LineCharts data={daysPostedFiltered} xAxisKey="date" dataKeys={["posts"]} showArea autoAdjustYAxis />
              </div>
            ) : (
              <div className="w-full flex items-center justify-center text-sm text-gray-500">No days posted data available.</div>
            )
          }
        />

        <BigCard
          title="Google Analytics Website Sessions"
          titleTooltip="A session is all the actions a user takes during one visit"
          subtitle=""
          displayMode="both"
          className="flex-1 w-full max-h-[320px]"
          dropdown={
            <div className="flex items-center gap-2">
              <DateDropdown value={sessionsRange} onChange={setSessionsRange} minDate={sessionsBounds.min} maxDate={sessionsBounds.max} />
            </div>
          }
          chart={
            sessionsFiltered.length > 0 ? (
              <div className="w-full h-full">
                <LineCharts data={sessionsFiltered} xAxisKey="date" dataKeys={["sessions"]} showArea autoAdjustYAxis />
              </div>
            ) : (
              <div className="w-full flex items-center justify-center text-sm text-gray-500">No website sessions data available.</div>
            )
          }
        />
      </div>

      <div className="flex flex-col lg:flex-row flex-wrap gap-4 w-full lg:h-full">
          <PlatformMetricCard
      title="Follower Count"
      titleTooltip="Follower count across all platforms"
      className="flex-1 w-full max-h-[320px]"
      dropdown={
        <DateDropdown
          value={followersRange}
          onChange={setFollowersRange}
          minDate={followersBounds.min}
          maxDate={followersBounds.max}
        />
      }
      metrics={[
        { label: "Facebook", value: followerChange.facebook, change: followerChange.fbChange, color: "#A155B9", sinceDate: formatSinceDate(followerChange.fbSince, followersRange) },
        { label: "Instagram", value: followerChange.instagram, change: followerChange.igChange, color: "#7987FF", sinceDate: formatSinceDate(followerChange.igSince, followersRange) },
        { label: "Twitter", value: followerChange.twitter, change: followerChange.twChange, color: "#F765A3", sinceDate: formatSinceDate(followerChange.twSince, followersRange) },
      ]}
    />

        <BigCard
          title="How did you hear about us?"
          subtitle=""
          displayMode="both"
          className="flex-1 w-full max-h-[320px]"
          chart={
            <div className="w-full flex items-center justify-center text-sm text-gray-500">No data available.</div>
          }
        />
      </div>
    </div>
  );
}
