import facebook from "../assets/facebook.jpg";
import google from "../assets/google.jpg";
import instagram from "../assets/instagram.jpg";
import linkedin from "../assets/linkedin.jpg";
import twitter from "../assets/twitter.jpg";
import tiktok from "../assets/tiktok.jpg";

import ExportButton from "../components/export-pdf/ExportButton";
import DateRangeButton from "../components/date-range/DateRangeButton";
import { useEffect, useState } from "react";
import { fetchMetrics, SocialMediaMetric } from "../utils/fetchMetrics";

import BarCharts from "../components/charts/BarCharts";
import PieCharts from "../components/charts/PieCharts";
import LineCharts from "../components/charts/LineCharts";

import BigCard from "../components/cards/BigCard";

type FollowerPoint = {
  date: string;
  followers: number;
};


export default function Homepage() {
  //state for the card
  const [followerCountData, setFollowerCountData] = useState<FollowerPoint[]>([]);
  //defaults
  const defaultProvider = "INSTAGRAM";
  const defaultStartDate = "2024-01-01";
  const defaultEndDate = "2025-11-14"
  
  function mapBackendToMetricPoints(raw: SocialMediaMetric[]): FollowerPoint[] {
  return raw
    .slice()
    .sort((a, b) =>
      (a.metricDate ?? a.lastSynced ?? "").localeCompare(
        b.metricDate ?? b.lastSynced ?? "",
      ),
    )
    .map((m) => {
      const timestamp = m.metricDate ?? m.lastSynced ?? new Date().toISOString();
      return {
        date: timestamp.slice(0, 10),
        followers: m.metricValue,
      };
    });
}


  async function getBackendMetrics() {
    try {
      const followerCountRaw = await fetchMetrics({
        provider: defaultProvider,
        metric: "FOLLOWERS",   
        startDate: defaultStartDate,
        endDate: defaultEndDate,
      });

      // Map into your chart format
      console.log(followerCountRaw);
      setFollowerCountData(mapBackendToMetricPoints(followerCountRaw));
    } catch (error) {
      console.error("Error fetching follower metrics:", error);
    }
  }    

  useEffect(() => {
    getBackendMetrics();
  }, []);

  return (
    <div className="w-full min-h-screen lg:h-full px-6 py-6 flex flex-col gap-6">
      {/* Top control bar */}
      <div className="flex flex-wrap w-full justify-between items-center gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <DateRangeButton />

          <div className="flex flex-row gap-2">
            {[google, instagram, facebook, tiktok, linkedin, twitter].map(
              (icon, idx) => (
                <a href="/" key={idx}>
                  <img
                    src={icon}
                    className="w-10 h-10 hover:opacity-80 transition rounded-[10px] border border-solid"
                  />
                </a>
              ),
            )}

            <a href="/">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-10 h-10 hover:opacity-80 transition rounded-[10px] border border-solid"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z"
                />
              </svg>
            </a>
          </div>
        </div>

        <ExportButton />
      </div>

      {/* First row of cards */}
      <div className="flex flex-col lg:flex-row flex-wrap gap-4 w-full lg:h-full">
        <BigCard
          title="Impressions"
          subtitle=""
          chart={undefined}
          displayMode="both"
          className="flex-1 w-full h-full"
        />
        <BigCard
          title="Days Posted"
          subtitle=""
          chart={undefined}
          displayMode="both"
          className="flex-1 w-full h-full"
        />
        <BigCard
          title="Website Sessions"
          subtitle=""
          chart={undefined}
          displayMode="both"
          className="flex-1 w-full h-full"
        />
      </div>

      {/* Second row of cards */}
      <div className="flex flex-col lg:flex-row flex-wrap gap-4 w-full lg:h-full">
        <BigCard
          title="Follower Count"
          subtitle=""
          chart={
          <div className="w-full h-64">
            <LineCharts
              data={followerCountData}
              xAxisKey="date"
              dataKeys={["followers"]}
              showArea={false}
            />
          </div>
          }
          displayMode="both"
          className="flex-1 w-full h-full"
        />
        <BigCard
          title="How did you hear about us?"
          subtitle=""
          chart={undefined}
          displayMode="both"
          className="flex-1 w-full h-full"
        />
      </div>
    </div>
  );
}
