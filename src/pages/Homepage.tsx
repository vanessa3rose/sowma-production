import { useEffect, useState } from "react";
import { fetchMetrics, SocialMediaMetric } from "../utils/fetchMetrics";
import ExportButton from "../components/export-pdf/ExportButton";
import { useGlobalPageExporter } from "../components/export-pdf/GlobalPageExportProvider";

import LineCharts from "../components/charts/LineCharts";
import BigCard from "../components/cards/BigCard";

type ImpressionsPoint = {
  date: string;
  impressions: number;
};

type DaysPostedPoint = {
  date: string;
  posts: number;
};

type WebsiteSessionsPoint = {
  date: string;
  sessions: number;
};

type FollowerPoint = {
  date: string;
  followers: number;
};

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
      return {
        date: timestamp.slice(0, 10),
        impressions: m.metricValue,
      };
    });
  }

  function mapToDaysPostedPoints(raw: SocialMediaMetric[]): DaysPostedPoint[] {
    return getSortedMetrics(raw).map((m) => {
      const timestamp =
        m.metricDate ?? m.lastSynced ?? new Date().toISOString();
      return {
        date: timestamp.slice(0, 10),
        posts: m.metricValue,
      };
    });
  }

  function mapToWebsiteSessionsPoints(
    raw: SocialMediaMetric[],
  ): WebsiteSessionsPoint[] {
    return getSortedMetrics(raw).map((m) => {
      const timestamp =
        m.metricDate ?? m.lastSynced ?? new Date().toISOString();
      return {
        date: timestamp.slice(0, 10),
        sessions: m.metricValue,
      };
    });
  }

  function mapToFollowerPoints(raw: SocialMediaMetric[]): FollowerPoint[] {
    return getSortedMetrics(raw).map((m) => {
      const timestamp =
        m.metricDate ?? m.lastSynced ?? new Date().toISOString();
      return {
        date: timestamp.slice(0, 10),
        followers: m.metricValue,
      };
    });
  }

  // ---- FETCHERS FOR EACH CARD (use its own provider) ----
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

  // GA sessions: just once on mount
  useEffect(() => {
    loadWebsiteSessions();
  }, []);

  return (
    <div className="w-full min-h-screen lg:h-full px-6 py-6 flex flex-col gap-6">
      {/* Header row */}
      <div className="flex flex-wrap w-full justify-between items-center gap-4">
        <h1 className="font-poppins text-[#4781C2] text-2xl font-semibold">
          Dashboard
        </h1>
        {/* 🔑 Export from homepage: can choose ANY platforms */}

        <ExportButton onExport={exportByPlatforms} />
      </div>

      {/* Main charts row */}
      <div className="flex flex-col lg:flex-row flex-wrap gap-4 w-full lg:h-full">
        <BigCard
          title="Impressions"
          subtitle=""
          dropdown={
            <select
              value={impressionsProvider}
              onChange={(e) =>
                setImpressionsProvider(e.target.value as SocialProvider)
              }
              className="border rounded-md px-2 py-1 text-xs bg-white text-gray-700"
            >
              <option value="FACEBOOK">Facebook</option>
              <option value="INSTAGRAM">Instagram</option>
              <option value="TWITTER">Twitter</option>
            </select>
          }
          chart={
            impressionsData.length > 0 ? (
              <div className="w-full h-64">
                <LineCharts
                  data={impressionsData}
                  xAxisKey="date"
                  dataKeys={["impressions"]}
                  showArea
                />
              </div>
            ) : (
              <div className="w-full h-64 flex items-center justify-center text-sm text-gray-500">
                No impressions data available.
              </div>
            )
          }
          displayMode="both"
          className="flex-1 w-full h-full"
        />

        <BigCard
          title="Days Posted"
          subtitle=""
          dropdown={
            <select
              value={daysPostedProvider}
              onChange={(e) =>
                setDaysPostedProvider(e.target.value as SocialProvider)
              }
              className="border rounded-md px-2 py-1 text-xs bg-white text-gray-700"
            >
              <option value="FACEBOOK">Facebook</option>
              <option value="INSTAGRAM">Instagram</option>
              <option value="TWITTER">Twitter</option>
            </select>
          }
          chart={
            daysPostedData.length > 0 ? (
              <div className="w-full h-64">
                <LineCharts
                  data={daysPostedData}
                  xAxisKey="date"
                  dataKeys={["posts"]}
                />
              </div>
            ) : (
              <div className="w-full h-64 flex items-center justify-center text-sm text-gray-500">
                No days posted data available.
              </div>
            )
          }
          displayMode="both"
          className="flex-1 w-full h-full"
        />

        <BigCard
          title="Google Analytics Website Sessions"
          subtitle=""
          chart={
            websiteSessionsData.length > 0 ? (
              <div className="w-full h-64">
                <LineCharts
                  data={websiteSessionsData}
                  xAxisKey="date"
                  dataKeys={["sessions"]}
                  showArea
                />
              </div>
            ) : (
              <div className="w-full h-64 flex items-center justify-center text-sm text-gray-500">
                No website sessions data available.
              </div>
            )
          }
          displayMode="both"
          className="flex-1 w-full h-full"
        />
      </div>

      <div className="flex flex-col lg:flex-row flex-wrap gap-4 w-full lg:h-full">
        <BigCard
          title="Follower Count"
          subtitle=""
          dropdown={
            <select
              value={followersProvider}
              onChange={(e) =>
                setFollowersProvider(e.target.value as SocialProvider)
              }
              className="border rounded-md px-2 py-1 text-xs bg-white text-gray-700"
            >
              <option value="FACEBOOK">Facebook</option>
              <option value="INSTAGRAM">Instagram</option>
              <option value="TWITTER">Twitter</option>
            </select>
          }
          chart={
            followerCountData.length > 0 ? (
              <div className="w-full h-64">
                <LineCharts
                  data={followerCountData}
                  xAxisKey="date"
                  dataKeys={["followers"]}
                />
              </div>
            ) : (
              <div className="w-full h-64 flex items-center justify-center text-sm text-gray-500">
                No follower count data available.
              </div>
            )
          }
          displayMode="both"
          className="flex-1 w-full h-full"
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
          className="flex-1 w-full h-full"
        />
      </div>
    </div>
  );
}
