/**
 * Aggregated data from "Tufts How did you hear about us .xlsx"
 * Source: src/data/Tufts How did you hear about us .xlsx (2,730 accounts)
 * Column: "How did you hear about us? (Account)"
 */

export type HearAboutUsEntry = {
  source: string;
  count: number;
};

export const HEAR_ABOUT_US_DATA: HearAboutUsEntry[] = [
  { source: "Corporate Volunteer", count: 537 },
  { source: "Community Volunteer", count: 358 },
  { source: "Google Search", count: 250 },
  { source: "Attended an Event", count: 172 },
  { source: "Website", count: 170 },
  { source: "School Volunteer", count: 165 },
  { source: "Social Media", count: 103 },
  { source: "Heard a SOWMA Speaker", count: 43 },
  { source: "News Media", count: 43 },
  { source: "Referral", count: 1 },
  { source: "Other", count: 888 },
];

export const TOTAL_ACCOUNTS = HEAR_ABOUT_US_DATA.reduce(
  (sum, d) => sum + d.count,
  0,
);
