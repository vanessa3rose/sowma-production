import { useEffect, useMemo, useState } from "react";
import { fetchMetrics, SocialMediaMetric } from "../utils/fetchMetrics";
import ExportButton from "../components/export-pdf/ExportButton";
import { useGlobalPageExporter } from "../components/export-pdf/useGlobalPageExporter";

import LineCharts from "../components/charts/LineCharts";
import BigCard from "../components/cards/BigCard";
import PlatformMetricCard from "../components/cards/PlatformMetricCard";
import DateDropdown, { DateRangeValue } from "../components/charts/DateButton";

import { COLORS } from "../data/colors.js";
import BarCharts from "../components/charts/BarCharts";

type HearAboutUsEntry = {
  source: string;
  count: number;
};

type PlatformMetricPoint = {
  date: string;
  facebook: number | null;
  instagram: number | null;
  twitter: number | null;
  linkedin: number | null;
};

type WebsiteSessionsPoint = { date: string; sessions: number };

export default function Homepage() {
  const { exportByPlatforms } = useGlobalPageExporter();

  const [impressionsData, setImpressionsData] = useState<PlatformMetricPoint[]>(
    [],
  );
  const [daysPostedData, setDaysPostedData] = useState<PlatformMetricPoint[]>(
    [],
  );
  const [websiteSessionsData, setWebsiteSessionsData] = useState<
    WebsiteSessionsPoint[]
  >([]);
  const [followerCountData, setFollowerCountData] = useState<
    PlatformMetricPoint[]
  >([]);
  const [hearAboutUsData, setHearAboutUsData] = useState<HearAboutUsEntry[]>(
    [],
  );

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
      return d.toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "2-digit",
      });
    }
    return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };

  function getSortedMetrics(raw: SocialMediaMetric[]): SocialMediaMetric[] {
    return raw
      .slice()
      .sort((a, b) =>
        (a.metricDate ?? a.lastSynced ?? "").localeCompare(
          b.metricDate ?? b.lastSynced ?? "",
        ),
      );
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
      const [fbRaw, igRaw, liRaw] = await Promise.all([
        fetchMetrics({
          provider: "FACEBOOK",
          metric: "VIEWS",
          startDate: defaultStartDate,
          endDate: defaultEndDate,
        }),
        fetchMetrics({
          provider: "INSTAGRAM",
          metric: "VIEWS",
          startDate: defaultStartDate,
          endDate: defaultEndDate,
        }),
        fetchMetrics({
          provider: "LINKEDIN",
          metric: "VIEWS",
          startDate: defaultStartDate,
          endDate: defaultEndDate,
        }),
      ]);

      const mergedMap = new Map<string, PlatformMetricPoint>();

      const add = (
        raw: SocialMediaMetric[],
        key: "facebook" | "instagram" | "linkedin",
      ) => {
        for (const m of raw) {
          const date = (
            m.metricDate ??
            m.lastSynced ??
            new Date().toISOString()
          ).slice(0, 10);

          const existing = mergedMap.get(date) ?? {
            date,
            facebook: null,
            instagram: null,
            linkedin: null,
            twitter: null,
          };

          mergedMap.set(date, { ...existing, [key]: m.metricValue });
        }
      };

      add(fbRaw, "facebook");
      add(igRaw, "instagram");
      add(liRaw, "linkedin");

      const merged = Array.from(mergedMap.values()).sort((a, b) =>
        a.date.localeCompare(b.date),
      );

      setImpressionsData(merged);
    } catch (err) {
      console.error(err);
    }
  }

  async function loadDaysPosted() {
    try {
      const [fbRaw, igRaw, twRaw] = await Promise.all([
        fetchMetrics({
          provider: "FACEBOOK",
          metric: "POSTS",
          startDate: defaultStartDate,
          endDate: defaultEndDate,
        }),
        fetchMetrics({
          provider: "INSTAGRAM",
          metric: "POSTS",
          startDate: defaultStartDate,
          endDate: defaultEndDate,
        }),
        fetchMetrics({
          provider: "TWITTER",
          metric: "POSTS",
          startDate: defaultStartDate,
          endDate: defaultEndDate,
        }),
      ]);

      const mergedMap = new Map<string, PlatformMetricPoint>();
      let fbTotal = 0;

      // Facebook: cumulative
      for (const m of getSortedMetrics(fbRaw)) {
        const date = (
          m.metricDate ??
          m.lastSynced ??
          new Date().toISOString()
        ).slice(0, 10);
        fbTotal += m.metricValue;
        const existing = mergedMap.get(date) ?? {
          date,
          facebook: null,
          instagram: null,
          linkedin: null,
          twitter: null,
        };
        mergedMap.set(date, { ...existing, facebook: fbTotal });
      }

      // Instagram: daily values (do not sum)
      for (const m of getSortedMetrics(igRaw)) {
        const date = (
          m.metricDate ??
          m.lastSynced ??
          new Date().toISOString()
        ).slice(0, 10);
        const existing = mergedMap.get(date) ?? {
          date,
          facebook: null,
          instagram: null,
          twitter: null,
          linkedin: null,
        };
        mergedMap.set(date, { ...existing, instagram: m.metricValue });
      }

      // Twitter: daily values (do not sum)
      for (const m of getSortedMetrics(twRaw)) {
        const date = (
          m.metricDate ??
          m.lastSynced ??
          new Date().toISOString()
        ).slice(0, 10);
        const existing = mergedMap.get(date) ?? {
          date,
          facebook: null,
          instagram: null,
          twitter: null,
          linkedin: null,
        };
        mergedMap.set(date, { ...existing, twitter: m.metricValue });
      }

      const merged = Array.from(mergedMap.values()).sort((a, b) =>
        a.date.localeCompare(b.date),
      );
      setDaysPostedData(merged);
    } catch (err) {
      console.error(err);
    }
  }

  async function loadWebsiteSessions() {
    try {
      const raw = await fetchMetrics({
        provider: googleAnalyticsProvider,
        metric: "SCREEN_PAGE_VIEWS",
        startDate: defaultStartDate,
        endDate: defaultEndDate,
      });
      setWebsiteSessionsData(mapToWebsiteSessionsPoints(raw));
    } catch (err) {
      console.error(err);
    }
  }

  async function loadFollowers() {
    try {
      const [fbRaw, igRaw, twRaw] = await Promise.all([
        fetchMetrics({
          provider: "FACEBOOK",
          metric: "FOLLOWERS",
          startDate: defaultStartDate,
          endDate: defaultEndDate,
        }),
        fetchMetrics({
          provider: "INSTAGRAM",
          metric: "FOLLOWERS",
          startDate: defaultStartDate,
          endDate: defaultEndDate,
        }),
        fetchMetrics({
          provider: "TWITTER",
          metric: "FOLLOWERS",
          startDate: defaultStartDate,
          endDate: defaultEndDate,
        }),
      ]);

      const mergedMap = new Map<
        string,
        {
          facebook: number | null;
          instagram: number | null;
          twitter: number | null;
          linkedin: number | null;
        }
      >();

      const addToMap = (
        raw: SocialMediaMetric[],
        key: "facebook" | "instagram" | "twitter",
      ) => {
        for (const m of raw) {
          const date = (
            m.metricDate ??
            m.lastSynced ??
            new Date().toISOString()
          ).slice(0, 10);
          const existing = mergedMap.get(date) ?? {
            facebook: null,
            instagram: null,
            twitter: null,
            linkedin: null,
          };
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
    } catch (err) {
      console.error(err);
    }
  }

  async function loadHearAboutUs() {
    try {
      const response = await fetch("/api/hear-about-us-report");
      if (!response.ok) {
        throw new Error(`Failed to fetch report: ${response.statusText}`);
      }

      const data = (await response.json()) as HearAboutUsEntry[];
      console.log("DATA", data);
      if (Array.isArray(data) && data.length > 0) {
        setHearAboutUsData(data);
      }
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    loadImpressions();
  }, []);
  useEffect(() => {
    loadDaysPosted();
  }, []);
  useEffect(() => {
    loadWebsiteSessions();
  }, []);
  useEffect(() => {
    loadFollowers();
  }, []);
  useEffect(() => {
    loadHearAboutUs();
  }, []);

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

  const impressionsChange = useMemo(() => {
    if (!impressionsFiltered.length)
      return {
        facebook: null,
        instagram: null,
        linkedin: null,
        fbChange: null,
        igChange: null,
        liChange: null,
        fbSince: null,
        igSince: null,
        liSince: null,
      };

    const getFirst = (key: "facebook" | "instagram" | "linkedin") =>
      impressionsFiltered.find((p) => p[key] !== null);

    const getLast = (key: "facebook" | "instagram" | "linkedin") =>
      [...impressionsFiltered].reverse().find((p) => p[key] !== null)?.[key] ??
      null;

    const fbFirst = getFirst("facebook");
    const igFirst = getFirst("instagram");
    const liFirst = getFirst("linkedin");

    const fbLast = getLast("facebook");
    const igLast = getLast("instagram");
    const liLast = getLast("linkedin");

    return {
      facebook: fbLast,
      instagram: igLast,
      linkedin: liLast,
      fbChange:
        fbFirst && fbLast !== null ? fbLast - (fbFirst.facebook ?? 0) : null,
      igChange:
        igFirst && igLast !== null ? igLast - (igFirst.instagram ?? 0) : null,
      liChange:
        liFirst && liLast !== null ? liLast - (liFirst.linkedin ?? 0) : null,
      fbSince: fbFirst?.date ?? null,
      igSince: igFirst?.date ?? null,
      liSince: liFirst?.date ?? null,
    };
  }, [impressionsFiltered]);

  const postsChange = useMemo(() => {
    if (!daysPostedFiltered.length)
      return {
        facebook: null,
        instagram: null,
        twitter: null,
        fbChange: null,
        igChange: null,
        twChange: null,
        fbSince: null,
        igSince: null,
        twSince: null,
      };

    type PlatformKey = "facebook" | "instagram" | "twitter";

    // Build mostRecent map safely
    const mostRecent: Record<PlatformKey, PlatformMetricPoint | null> = {
      facebook: null,
      instagram: null,
      twitter: null,
    };

    (["facebook", "instagram", "twitter"] as PlatformKey[]).forEach((key) => {
      for (let i = daysPostedData.length - 1; i >= 0; i--) {
        if (daysPostedData[i][key] !== null) {
          mostRecent[key] = daysPostedData[i];
          break;
        }
      }
    });

    const getFirst = (key: PlatformKey) =>
      daysPostedFiltered.find((p) => p[key] !== null) ?? mostRecent[key];

    const getLast = (key: PlatformKey): number | null => {
      // Prefer filtered range last
      const lastInFiltered = [...daysPostedFiltered]
        .reverse()
        .find((p) => p[key] !== null)?.[key];
      if (lastInFiltered !== undefined && lastInFiltered !== null)
        return lastInFiltered;

      // Fallback to mostRecent value
      const fallback = mostRecent[key]?.[key as keyof PlatformMetricPoint];
      return typeof fallback === "number" ? fallback : null;
    };

    // Usage
    const fbFirst = getFirst("facebook");
    const igFirst = getFirst("instagram");
    const twFirst = getFirst("twitter");

    const fbLast = getLast("facebook");
    const igLast = getLast("instagram");
    const twLast = getLast("twitter");

    return {
      facebook: fbLast,
      instagram: igLast,
      twitter: twLast,
      fbChange:
        fbFirst && fbLast !== null ? fbLast - (fbFirst.facebook ?? 0) : null,
      igChange:
        igFirst && igLast !== null ? igLast - (igFirst.instagram ?? 0) : null,
      twChange:
        twFirst && twLast !== null ? twLast - (twFirst.twitter ?? 0) : null,
      fbSince: fbFirst?.date ?? null,
      igSince: igFirst?.date ?? null,
      twSince: twFirst?.date ?? null,
    };
  }, [daysPostedFiltered]);

  const followerChange = useMemo(() => {
    if (!followersFiltered.length)
      return {
        facebook: null,
        instagram: null,
        twitter: null,
        fbChange: null,
        igChange: null,
        twChange: null,
        fbSince: null,
        igSince: null,
        twSince: null,
      };

    const getFirstPoint = (key: "facebook" | "instagram" | "twitter") => {
      for (let i = 0; i < followersFiltered.length; i++) {
        if (followersFiltered[i][key] !== null) return followersFiltered[i];
      }
      return null;
    };

    const getLastValue = (key: "facebook" | "instagram" | "twitter") => {
      for (let i = followersFiltered.length - 1; i >= 0; i--) {
        if (followersFiltered[i][key] !== null)
          return followersFiltered[i][key];
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
      fbChange:
        fbFirst && fbLast !== null ? fbLast - (fbFirst.facebook ?? 0) : null,
      igChange:
        igFirst && igLast !== null ? igLast - (igFirst.instagram ?? 0) : null,
      twChange:
        twFirst && twLast !== null ? twLast - (twFirst.twitter ?? 0) : null,
      fbSince: fbFirst?.date ?? null,
      igSince: igFirst?.date ?? null,
      twSince: twFirst?.date ?? null,
    };
  }, [followersFiltered]);

  return (
    <div className="w-full min-h-screen lg:h-full px-6 py-6 flex flex-col gap-6">
      <div className="flex flex-wrap w-full justify-between items-center gap-4">
        <h1 className="font-poppins text-sowma-blue text-2xl font-semibold">
          Dashboard
        </h1>
        <ExportButton onExport={exportByPlatforms} />
      </div>

      <div className="flex flex-col flex-wrap gap-4 w-full lg:flex-row">
        {/* Impressions */}
        <PlatformMetricCard
          title="Impressions"
          titleTooltip="Number of users who saw your content"
          className="flex-1 w-full"
          dropdown={
            <DateDropdown
              value={impressionsRange}
              onChange={setImpressionsRange}
              minDate={impressionsBounds.min}
              maxDate={impressionsBounds.max}
            />
          }
          metrics={[
            {
              label: "LinkedIn",
              value: impressionsChange.linkedin,
              change: impressionsChange.liChange,
              color: COLORS.SOWMA_LINKEDIN,
              sinceDate: formatSinceDate(
                impressionsChange.liSince,
                impressionsRange,
              ),
            },
            {
              label: "Facebook",
              value: impressionsChange.facebook,
              change: impressionsChange.fbChange,
              color: COLORS.SOWMA_FACEBOOK,
              sinceDate: formatSinceDate(
                impressionsChange.fbSince,
                impressionsRange,
              ),
            },
            {
              label: "Instagram",
              value: impressionsChange.instagram,
              change: impressionsChange.igChange,
              color: COLORS.SOWMA_INSTAGRAM,
              sinceDate: formatSinceDate(
                impressionsChange.igSince,
                impressionsRange,
              ),
            },
          ]}
        />

        {/* Total Posts */}
        <PlatformMetricCard
          title="Total Posts"
          titleTooltip="Total posts made"
          className="flex-1 w-full"
          dropdown={
            <DateDropdown
              value={daysPostedRange}
              onChange={setDaysPostedRange}
              minDate={daysPostedBounds.min}
              maxDate={daysPostedBounds.max}
            />
          }
          metrics={[
            {
              label: "Facebook",
              value: postsChange.facebook,
              change: postsChange.fbChange,
              color: COLORS.SOWMA_FACEBOOK,
              sinceDate: formatSinceDate(postsChange.fbSince, daysPostedRange),
            },
            {
              label: "Instagram",
              value: postsChange.instagram,
              change: postsChange.igChange,
              color: COLORS.SOWMA_INSTAGRAM,
              sinceDate: formatSinceDate(postsChange.igSince, daysPostedRange),
            },
            {
              label: "Twitter",
              value: postsChange.twitter,
              change: postsChange.twChange,
              color: COLORS.SOWMA_TWITTER,
              sinceDate: formatSinceDate(postsChange.twSince, daysPostedRange),
            },
          ]}
        />

        {/* Follower Count */}
        <PlatformMetricCard
          title="Follower Count"
          titleTooltip="Follower count across all platforms"
          className="flex-1 w-full"
          dropdown={
            <DateDropdown
              value={followersRange}
              onChange={setFollowersRange}
              minDate={followersBounds.min}
              maxDate={followersBounds.max}
            />
          }
          metrics={[
            {
              label: "Facebook",
              value: followerChange.facebook,
              change: followerChange.fbChange,
              color: COLORS.SOWMA_FACEBOOK,
              sinceDate: formatSinceDate(
                followerChange.fbSince,
                followersRange,
              ),
            },
            {
              label: "Instagram",
              value: followerChange.instagram,
              change: followerChange.igChange,
              color: COLORS.SOWMA_INSTAGRAM,
              sinceDate: formatSinceDate(
                followerChange.igSince,
                followersRange,
              ),
            },
            {
              label: "Twitter",
              value: followerChange.twitter,
              change: followerChange.twChange,
              color: COLORS.SOWMA_TWITTER,
              sinceDate: formatSinceDate(
                followerChange.twSince,
                followersRange,
              ),
            },
          ]}
        />
      </div>

      {/* Follower Count */}
      <div className="flex flex-col lg:flex-row flex-wrap gap-4 w-full lg:h-full">
        {/* GA Website Session */}
        <BigCard
          title="Google Analytics Website Sessions"
          data={sessionsFiltered}
          titleTooltip="A session is all the actions a user takes during one visit"
          subtitle=""
          displayMode="both"
          className="flex-1 w-full max-h-[320px]"
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
            <div className="w-full h-full max-h-[320px]">
              <LineCharts
                data={sessionsFiltered}
                xAxisKey="date"
                dataKeys={["sessions"]}
                showArea
                autoAdjustYAxis
              />
            </div>
          }
        />

        {/* How Did You Hear About Us */}
        <BigCard
          title="How did you hear about us?"
          data={hearAboutUsData}
          subtitle=""
          chart={
            <BarCharts
              data={hearAboutUsData}
              xAxisKey="source"
              dataKeys={["count"]}
            />
          }
          displayMode="chart-only"
          className="flex-1 w-full max-h-[320px]"
        />
      </div>
    </div>
  );
}
