import {
  SocialMediaExportBundle,
} from "../../types/exportTypes";

/* Utility to sort by date (ISO strings sort correctly as strings) */
function sortByDate<T extends { date: string }>(arr: T[]): T[] {
  return arr.slice().sort((a, b) => a.date.localeCompare(b.date));
}

/* -----------------------------------------------------------
   MAP RAW SOCIAL MEDIA METRICS → EXPORT FORMAT
----------------------------------------------------------- */

export function mapSocialToExportData(
  platformName: string,

  followers: number,
  impressions: number,
  posts: number,
  engagements: number,

  rawImpressions: { date: string; impressions: number }[],
  rawPosts: { date: string; posts: number }[],
  rawFollowers: { date: string; followers: number }[],

  breakdown: { label: string; value: number }[]
): SocialMediaExportBundle {
  return {
    platformName,

    followers,
    impressions,
    posts,
    engagements,

    engagementBreakdown: breakdown,

    impressionsOverTime: sortByDate(rawImpressions),
    postsOverTime: sortByDate(rawPosts),
    followersOverTime: sortByDate(rawFollowers),
  };
}