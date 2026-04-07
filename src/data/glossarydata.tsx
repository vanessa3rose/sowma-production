export const GLOSSARY_ITEMS = [
  {
    key: "api",
    term: "API",
    definition:
      "A system that allows one tool to connect and retrieve data from another tool.",
    platforms: ["Facebook", "Google Analytics", "Instagram"],
  },
  {
    key: "bounceRate",
    term: "Bounce Rate",
    definition:
      "The percentage of website visitors who leave after viewing one page.",
    platforms: ["Google Analytics"],
  },
  {
    key: "daysPosted",
    term: "Days Posted",
    definition: "Blue squares indicate days with posts.",
    platforms: ["Facebook"],
  },
  {
    key: "reach",
    term: "Reach",
    definition: "The number of unique users who saw your content.",
    platforms: ["Instagram"],
  },
  {
    key: "impressions",
    term: "Impressions",
    definition:
      "The total number of times your content was displayed, including repeats.",
    platforms: ["Instagram"],
  },
  {
    key: "engagementRate",
    term: "Engagement Rate",
    definition:
      "A measure of how much people interact with your content relative to followers or reach.",
    platforms: ["Google Analytics"],
  },
  {
    key: "trafficSources",
    term: "Traffic Sources",
    definition: "How each user got to the site.",
    platforms: ["Google Analytics"],
  },
  {
    key: "activeUsers",
    term: "Active Users",
    definition:
      "Users who were on the site for more than 10 seconds, or visited multiple pages.",
    platforms: ["Google Analytics"],
  },
  {
    key: "sessionsByDevice",
    term: "Sessions By Device",
    definition: "Types of devices accessing the site.",
    platforms: ["Google Analytics"],
  },
  {
    key: "newVsReturning",
    term: "New VS Returning",
    definition:
      "Users who have never been to the site vs. users who are returning.",
    platforms: ["Google Analytics"],
  },
  {
    key: "pageViews",
    term: "Page Views",
    definition: "Total page and screen views.",
    platforms: ["Google Analytics"],
  },
  {
    key: "avgEngagementTime",
    term: "Average Engagement Time",
    definition: "Average engagement time per user (seconds).",
    platforms: ["Google Analytics"],
  },
  {
    key: "countyVisitors",
    term: "County Visitors",
    definition: "Total site visitors by Massachusetts county.",
    platforms: ["Google Analytics"],
  },
  {
    key: "active7DayUsers",
    term: "Active 7-days Users",
    definition: "Users active in the last 7 days.",
    platforms: ["Google Analytics"],
  },
  {
    key: "email_flow",
    term: "Email Flow",
    definition: "End-to-end journey from sent to final action.",
    platforms: ["Constant Contact"],
  },
  {
    key: "email_opens",
    term: "Emails Opened",
    definition:
      "Unique Opens shows distinct openers; Total Opens includes re-opens.",
    platforms: ["Constant Contact"],
  },
  {
    key: "email_clicks",
    term: "Emails Clicked",
    definition:
      "Unique Clicks shows distinct clickers; Total Clicks includes repeat clicks.",
    platforms: ["Constant Contact"],
  },
  {
    key: "engagementMix",
    term: "Engagement Mix",
    definition:
      "Spread of interactions between Comments, Impressions, Likes, and Posts.",
    platforms: ["Instagram"],
  },
  {
    key: "interactions",
    term: "Interactions",
    definition: "Daily total interactions (reactions + comments + reposts).",
    platforms: ["LinkedIn"],
  },
  {
    key: "shares",
    term: "Shares",
    definition: "Daily reposts/shares for the latest imported date in range.",
    platforms: ["LinkedIn"],
  },
  {
    key: "recentPosts",
    term: "Recent Posts",
    definition: "Displays the date and quantity of most recent posts.",
    platforms: ["Facebook"],
  },
  {
    key: "videoViews",
    term: "Video Views",
    definition: "Cumulative count of the number of views your videos have.",
    platforms: ["Facebook"],
  },
  {
    key: "websiteClicks",
    term: "WebsiteClicks",
    definition:
      "Cumulative count of the number of clicks to your website from Facebook.",
    platforms: ["Facebook"],
  },
] as const;

// List of Keys present
const GLOSSARY_KEYS = GLOSSARY_ITEMS.map((item) => item.key);

// MAP conversion
const GLOSSARY_MAP = Object.fromEntries(
  GLOSSARY_ITEMS.map((item) => [item.key, item]),
) as Record<
  (typeof GLOSSARY_ITEMS)[number]["key"],
  (typeof GLOSSARY_ITEMS)[number]
>;

// Helper Functions
export function isGlossaryKey(
  key: string,
): key is (typeof GLOSSARY_ITEMS)[number]["key"] {
  return GLOSSARY_KEYS.includes(key as any);
}

export function getGlossaryDefinition(key: keyof typeof GLOSSARY_MAP): string {
  return GLOSSARY_MAP[key]?.definition ?? "";
}
