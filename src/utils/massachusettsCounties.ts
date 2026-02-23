export type MassachusettsCountyId =
  | "25001"
  | "25003"
  | "25005"
  | "25007"
  | "25009"
  | "25011"
  | "25013"
  | "25015"
  | "25017"
  | "25019"
  | "25021"
  | "25023"
  | "25025"
  | "25027";

export const MA_COUNTY_NAME_TO_FIPS: Record<string, MassachusettsCountyId> = {
  barnstable: "25001",
  berkshire: "25003",
  bristol: "25005",
  dukes: "25007",
  essex: "25009",
  franklin: "25011",
  hampden: "25013",
  hampshire: "25015",
  middlesex: "25017",
  nantucket: "25019",
  norfolk: "25021",
  plymouth: "25023",
  suffolk: "25025",
  worcester: "25027",
};

export const MA_COUNTY_FIPS_TO_NAME: Record<MassachusettsCountyId, string> = {
  "25001": "Barnstable",
  "25003": "Berkshire",
  "25005": "Bristol",
  "25007": "Dukes",
  "25009": "Essex",
  "25011": "Franklin",
  "25013": "Hampden",
  "25015": "Hampshire",
  "25017": "Middlesex",
  "25019": "Nantucket",
  "25021": "Norfolk",
  "25023": "Plymouth",
  "25025": "Suffolk",
  "25027": "Worcester",
};

// Common GA city labels in Massachusetts mapped to county FIPS.
// This can be extended as we see unmapped city names in production data.
const MA_CITY_TO_COUNTY_FIPS: Record<string, MassachusettsCountyId> = {
  abington: "25023",
  acton: "25017",
  amherst: "25015",
  arlington: "25017",
  ashland: "25017",
  attleboro: "25005",
  auburn: "25027",
  barnstable: "25001",
  beverly: "25009",
  billerica: "25017",
  boston: "25025",
  braintree: "25021",
  bridgewater: "25023",
  brockton: "25023",
  brookline: "25021",
  burlington: "25017",
  cambridge: "25017",
  canton: "25021",
  chelmsford: "25017",
  chelsea: "25025",
  chicopee: "25013",
  concord: "25017",
  danvers: "25009",
  dartmouth: "25005",
  dedham: "25021",
  dover: "25021",
  dracut: "25017",
  "east boston": "25025",
  "east longmeadow": "25013",
  eastham: "25001",
  "fall river": "25005",
  fitchburg: "25027",
  framingham: "25017",
  franklin: "25021",
  gloucester: "25009",
  "great barrington": "25003",
  greenfield: "25011",
  haverhill: "25009",
  hingham: "25023",
  holyoke: "25013",
  hyannis: "25001",
  ipswich: "25009",
  lawrence: "25009",
  leominster: "25027",
  lexington: "25017",
  longmeadow: "25013",
  lowell: "25017",
  lynn: "25009",
  malden: "25017",
  mansfield: "25021",
  marblehead: "25009",
  marlborough: "25017",
  marshfield: "25023",
  mashpee: "25001",
  medford: "25017",
  melrose: "25017",
  methuen: "25009",
  middleborough: "25023",
  milford: "25027",
  milton: "25021",
  natick: "25017",
  needham: "25021",
  "new bedford": "25005",
  newton: "25017",
  northampton: "25015",
  norton: "25005",
  norwell: "25023",
  norwood: "25021",
  peabody: "25009",
  pittsfield: "25003",
  plymouth: "25023",
  quincy: "25021",
  randolph: "25021",
  revere: "25025",
  salem: "25009",
  sandwich: "25001",
  saugus: "25009",
  scituate: "25023",
  shrewsbury: "25027",
  somerville: "25017",
  "south boston": "25025",
  springfield: "25013",
  stoneham: "25017",
  taunton: "25005",
  tewksbury: "25017",
  wakefield: "25017",
  walpole: "25021",
  waltham: "25017",
  wareham: "25023",
  watertown: "25017",
  wellesley: "25021",
  "west springfield": "25013",
  westborough: "25027",
  westfield: "25013",
  weymouth: "25021",
  whitman: "25023",
  winchester: "25017",
  winthrop: "25025",
  woburn: "25017",
  worcester: "25027",
  yarmouth: "25001",
};

const MA_FIPS_SET = new Set(Object.values(MA_COUNTY_NAME_TO_FIPS));

function normalizeCountyName(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/ county$/i, "")
    .replace(/\./g, "")
    .replace(/\s+/g, " ");
}

function normalizeCityName(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\(.*\)/g, "")
    .replace(/\./g, "")
    .replace(/\s+/g, " ");
}

export function toMassachusettsCountyFips(
  raw: string,
): MassachusettsCountyId | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  if (/^\d{5}$/.test(trimmed) && MA_FIPS_SET.has(trimmed as MassachusettsCountyId)) {
    return trimmed as MassachusettsCountyId;
  }

  const normalized = normalizeCountyName(trimmed);
  return MA_COUNTY_NAME_TO_FIPS[normalized] ?? null;
}

export function toMassachusettsCountyFipsFromCity(
  rawCity: string,
): MassachusettsCountyId | null {
  const normalized = normalizeCityName(rawCity);
  if (!normalized || normalized === "(not set)") return null;
  return MA_CITY_TO_COUNTY_FIPS[normalized] ?? null;
}
