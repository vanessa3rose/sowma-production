import { useRoute } from "wouter";
import DateRangeButton from "../components/date-range/DateRangeButton";
import ExportButton from "../components/export-pdf/ExportButton";
import BigCard from "../components/cards/BigCard";
import SmallCard from "../components/cards/SmallCard";
import LineCharts from "../components/charts/LineCharts";
import PieCharts from "../components/charts/PieCharts";

const pieTestData = [
  { source: "Organic", value: 400 },
  { source: "Paid", value: 300 },
  { source: "Referral", value: 200 },
  { source: "Social", value: 100 },
];

const lineTestData = [
  { date: "01", followers: 100, likes: 20, comments: 5 },
  { date: "02", followers: 120, likes: 35, comments: 8 },
  { date: "03", followers: 140, likes: 50, comments: 10 },
  { date: "04", followers: 160, likes: 45, comments: 7 },
  { date: "05", followers: 180, likes: 60, comments: 12 },
];

const CHART_CONFIGS = {
  instagram: [
    { id: "impressions", title: "Impressions", type: "line" },
    { id: "followers_count", title: "Followers", type: "line" },
    { id: "total_likes", title: "Total Likes", type: "line" },
    { id: "total_comments", title: "Total Comments", type: "line" },
    { id: "media_count", title: "Media Reactions", type: "line" },
  ],
  twitter: [
    { id: "followers_count", title: "Followers", type: "line" },
    { id: "following_count", title: "Following", type: "line" },
    { id: "tweet_count", title: "Tweet Count", type: "line" },
    { id: "listed_count", title: "Listed Count", type: "line" },
  ],
  facebook: [
    { id: "page_follows", title: "Page Follows", type: "line" },
    {
      id: "page_actions_post_reactions_like_total",
      title: "Total reactions/likes",
      type: "line",
    },
    { id: "page_media_view", title: "Page Views", type: "line" },
    { id: "total_comments", title: "Total Comments", type: "line" },
    { id: "total_posts", title: "Total Posts", type: "line" },
    { id: "total_shares", title: "Total Shares", type: "line" },
  ],
  google: [
    { id: "activeUsers", title: "Active Users", type: "line" },
    { id: "screenPageViews", title: "Page Views", type: "line" },
    { id: "active7DayUsers", title: "Active 7 Day Users", type: "line" },
    { id: "engagementRate", title: "Engagement Rate", type: "line" },
    { id: "newUsers", title: "New Users", type: "line" },
  ],
};

type Platform = keyof typeof CHART_CONFIGS;

export default function SocialMediaPage() {
  // ⭐ Using Wouter's dynamic route match
  const [match, params] = useRoute("/social/:platform");

  const platform = (params?.platform as Platform) || null;

  const formattedPlatform = platform
    ? platform.charAt(0).toUpperCase() + platform.slice(1)
    : "Social Media";

  return (
    <div className="w-full min-h-screen lg:h-full bg-white flex flex-col gap-4">
      {/* Header */}
      <div className="w-full flex flex-col lg:flex-row justify-between items-center px-4 py-2">
        <div className="flex items-center space-x-2">
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
          <h1 className="font-poppins font-semibold text-3xl lg:text-4xl">
            {formattedPlatform}
          </h1>
        </div>
        <div className="flex space-x-2 mt-2 lg:mt-0">
          <DateRangeButton />
          <ExportButton />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-4 px-4 lg:h-full">
        {/* Sidebar Cards */}
        <div className="w-full lg:w-1/4 flex flex-col gap-4 lg:h-full">
          <SmallCard
            title="Followers"
            displayMode="both"
            className="w-full h-full"
          />
          <SmallCard
            title="Comments"
            displayMode="both"
            className="w-full h-full"
          />
          <SmallCard
            title="Likes"
            displayMode="both"
            className="w-full h-full"
          />
          <SmallCard
            title="Shared"
            displayMode="both"
            className="w-full h-full"
          />
        </div>

        {/* Chart Cards (Dynamic) */}
        <div className="w-full lg:w-3/4 flex flex-col gap-4 lg:h-full">
          {platform &&
            CHART_CONFIGS[platform].map((chart) => (
              <BigCard
                key={chart.id}
                title={chart.title}
                displayMode="both"
                className="w-full h-full"
                chart={
                  <div className="w-full">
                    {chart.type === "line" ? (
                      <LineCharts
                        data={lineTestData}
                        xAxisKey="date"
                        dataKeys={["followers", "likes", "comments"]}
                        showArea={true}
                      />
                    ) : (
                      <PieCharts
                        data={pieTestData}
                        dataKey="value"
                        nameKey="source"
                      />
                    )}
                  </div>
                }
              />
            ))}
        </div>
      </div>
    </div>
  );
}
