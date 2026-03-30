import {
  Metric,
  PrismaClient,
  Provider,
  Prisma,
} from "../src/generated/prisma/index.js";
import * as XLSX from "xlsx";
import { startOfDay } from "../src/utils/dates.js";
import { requireAdminApi } from "./_auth.js";

const prisma = (globalThis as any).prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") (globalThis as any).prisma = prisma;

type CsvImportRow = {
  date: Date;
  followers?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  views?: number;
  uniqueVisitors?: number;
  totalInteractions?: number;
  daysPosted?: number;
  writes?: MetricWrite[];
};

type MetricWrite = {
  metricName: Metric;
  metricValue: number;
  breakdownKey?: string;
  breakdownValue?: string;
};

type PreparedMetricWrite = MetricWrite & {
  metricDate: Date | null;
};

function normalizeHeader(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseNumber(raw: string | undefined): number | undefined {
  if (!raw) return undefined;
  const cleaned = raw.replace(/,/g, "").replace(/%/g, "").trim();
  if (!cleaned) return undefined;
  const num = Number(cleaned);
  if (!Number.isFinite(num)) return undefined;
  return Math.round(num);
}

function parseDateValue(raw: string): Date | null {
  const value = raw.trim();
  if (!value) return null;

  // LinkedIn exports commonly use MM/DD/YYYY.
  const usDate = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (usDate) {
    const month = Number(usDate[1]);
    const day = Number(usDate[2]);
    const year = Number(usDate[3]);
    const parsed = new Date(Date.UTC(year, month - 1, day));
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

/**
 * Lightweight CSV parser with quote + escaped-quote support.
 * We keep this parser local to avoid introducing a separate CSV dependency
 * for API routes that also need to parse spreadsheet exports.
 */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    const next = text[i + 1];

    if (ch === '"') {
      if (inQuotes && next === '"') {
        cell += '"';
        i += 1;
        continue;
      }
      inQuotes = !inQuotes;
      continue;
    }

    if (ch === "," && !inQuotes) {
      row.push(cell);
      cell = "";
      continue;
    }

    if ((ch === "\n" || ch === "\r") && !inQuotes) {
      if (ch === "\r" && next === "\n") i += 1;
      row.push(cell);
      if (row.some((c) => c.trim() !== "")) rows.push(row);
      row = [];
      cell = "";
      continue;
    }

    cell += ch;
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    if (row.some((c) => c.trim() !== "")) rows.push(row);
  }

  return rows;
}

function getFileExtension(filename: string): string {
  const idx = filename.lastIndexOf(".");
  if (idx === -1) return "";
  return filename.slice(idx + 1).toLowerCase();
}

function decodeBase64ToBuffer(raw: string): Buffer {
  const cleaned = raw.replace(/^data:.*;base64,/, "").trim();
  return Buffer.from(cleaned, "base64");
}

function parseSpreadsheetRowsFromBuffer(
  fileBuffer: Buffer,
  filename: string,
): string[][] {
  const extension = getFileExtension(filename);
  if (extension === "csv") {
    return parseCsv(fileBuffer.toString("utf8"));
  }

  if (extension !== "xls" && extension !== "xlsx") {
    throw new Error("Unsupported file type. Please upload CSV, XLS, or XLSX.");
  }

  const workbook = XLSX.read(fileBuffer, { type: "buffer" });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) return [];

  const firstSheet = workbook.Sheets[firstSheetName];
  const csvText = XLSX.utils.sheet_to_csv(firstSheet);
  return parseCsv(csvText);
}

const DEMOGRAPHIC_BREAKDOWN_KEYS: Record<string, string> = {
  location: "location",
  "job function": "jobFunction",
  seniority: "seniority",
  industry: "industry",
  "company size": "companySize",
};

function mergeDaysPostedRows(
  rows: CsvImportRow[],
  daysPostedDates: Date[],
): CsvImportRow[] {
  if (!daysPostedDates.length) return rows;

  const byDate = new Map<string, CsvImportRow>();
  for (const row of rows) {
    byDate.set(row.date.toISOString().slice(0, 10), row);
  }

  for (const postedDate of daysPostedDates) {
    const key = postedDate.toISOString().slice(0, 10);
    const existing = byDate.get(key);
    if (existing) {
      existing.daysPosted = 1;
      continue;
    }

    byDate.set(key, {
      date: startOfDay(postedDate),
      daysPosted: 1,
    });
  }

  return Array.from(byDate.values()).sort(
    (a, b) => a.date.getTime() - b.date.getTime(),
  );
}

function findHeaderIndex(headers: string[], aliases: string[]): number {
  return headers.findIndex((header) => aliases.includes(header));
}

function findHeadersByPattern(
  headers: string[],
  pattern: RegExp,
): Array<{ index: number; header: string }> {
  return headers.flatMap((header, index) =>
    pattern.test(header) ? [{ index, header }] : [],
  );
}

function normalizeBreakdownValue(value: string): string {
  return value.replace(/\s+/g, " ").trim().toLowerCase();
}

function buildBreakdownWrite(
  metricName: Metric,
  metricValue: number | undefined,
  breakdownKey: string,
  breakdownValue: string,
): MetricWrite | null {
  if (metricValue == null) return null;
  return {
    metricName,
    metricValue,
    breakdownKey,
    breakdownValue: normalizeBreakdownValue(breakdownValue),
  };
}

function findHeaderRowIndex(rows: string[][]): number {
  for (let i = 0; i < rows.length; i += 1) {
    const normalized = rows[i].map((cell) =>
      normalizeHeader(String(cell ?? "")),
    );
    if (normalized.includes("date")) return i;
  }
  return -1;
}

function parseBreakdownSheet(
  rows: string[][],
  metricName: Metric,
  breakdownKey: string,
): MetricWrite[] {
  if (rows.length < 2) return [];

  const headerRow = rows[0].map((cell) => normalizeHeader(String(cell ?? "")));
  const labelIdx = 0;
  const valueIdx = findHeaderIndex(headerRow, [
    "total views",
    "total followers",
    "total unique visitors",
  ]);

  if (valueIdx === -1) return [];

  const writes: MetricWrite[] = [];
  for (let i = 1; i < rows.length; i += 1) {
    const label = String(rows[i][labelIdx] ?? "").trim();
    const metricValue = parseNumber(rows[i][valueIdx]);
    if (!label || metricValue == null) continue;

    writes.push({
      metricName,
      metricValue,
      breakdownKey,
      breakdownValue: normalizeBreakdownValue(label),
    });
  }

  return writes;
}

function parsePostDateRows(rows: string[][]): Date[] {
  if (rows.length < 2) return [];

  let headerRowIndex = -1;
  let createdDateIdx = -1;

  for (let i = 0; i < rows.length; i += 1) {
    const headers = rows[i].map((h) => normalizeHeader(String(h ?? "")));
    createdDateIdx = findHeaderIndex(headers, [
      "created date",
      "post date",
      "date",
    ]);
    if (createdDateIdx !== -1) {
      headerRowIndex = i;
      break;
    }
  }

  if (headerRowIndex === -1 || createdDateIdx === -1) return [];

  const seen = new Set<string>();
  const dates: Date[] = [];

  for (let i = headerRowIndex + 1; i < rows.length; i += 1) {
    const rawDate = rows[i][createdDateIdx]?.trim();
    if (!rawDate) continue;

    const parsedDate = parseDateValue(rawDate);
    if (!parsedDate) continue;

    const day = startOfDay(parsedDate);
    const key = day.toISOString().slice(0, 10);
    if (seen.has(key)) continue;
    seen.add(key);
    dates.push(day);
  }

  return dates.sort((a, b) => a.getTime() - b.getTime());
}

function parseRows(rows: string[][]): CsvImportRow[] {
  if (rows.length < 2) return [];

  const headerRowIndex = findHeaderRowIndex(rows);
  if (headerRowIndex === -1) {
    throw new Error("CSV is missing a Date column.");
  }

  const headers = rows[headerRowIndex].map((h) => normalizeHeader(h));

  const dateIdx = findHeaderIndex(headers, ["date", "day", "post date"]);
  if (dateIdx === -1) throw new Error("CSV is missing a Date column.");

  const followersIdx = findHeaderIndex(headers, [
    "followers",
    "total followers",
    "follower count",
    "organic followers",
  ]);
  const likesIdx = findHeaderIndex(headers, [
    "likes",
    "reactions",
    "total reactions",
    "reactions total",
    "reactions organic",
    "reactions sponsored",
  ]);
  const commentsIdx = findHeaderIndex(headers, [
    "comments",
    "comment count",
    "comments total",
    "comments organic",
    "comments sponsored",
  ]);
  const sharesIdx = findHeaderIndex(headers, [
    "shares",
    "share count",
    "reposts",
    "repost count",
    "reposts total",
    "reposts organic",
    "reposts sponsored",
  ]);
  const viewsIdx = findHeaderIndex(headers, [
    "views",
    "impressions",
    "video views",
    "impressions total",
    "overview page views total",
    "total page views total",
  ]);
  const postsIdx = findHeaderIndex(headers, [
    "posts",
    "post count",
    "updates",
    "posts published",
  ]);
  const totalInteractionsIdx = findHeaderIndex(headers, [
    "total interactions",
    "engagements",
    "total engagements",
  ]);
  const uniqueVisitorsIdx = findHeaderIndex(headers, [
    "total unique visitors total",
    "unique visitors",
    "total unique visitors",
  ]);

  const uniqueVisitorDeviceHeaders = findHeadersByPattern(
    headers,
    /^total unique visitors (desktop|mobile)$/,
  );
  const uniqueVisitorPageHeaders = findHeadersByPattern(
    headers,
    /^(overview|life|jobs) unique visitors total$/,
  );

  const out: CsvImportRow[] = [];

  for (let i = headerRowIndex + 1; i < rows.length; i += 1) {
    const row = rows[i];
    const rawDate = row[dateIdx]?.trim();
    if (!rawDate) continue;

    const parsedDate = parseDateValue(rawDate);
    if (!parsedDate) continue;

    const likes = likesIdx >= 0 ? parseNumber(row[likesIdx]) : undefined;
    const comments =
      commentsIdx >= 0 ? parseNumber(row[commentsIdx]) : undefined;
    const shares = sharesIdx >= 0 ? parseNumber(row[sharesIdx]) : undefined;

    const derivedInteractions = (likes ?? 0) + (comments ?? 0) + (shares ?? 0);

    const totalInteractions =
      totalInteractionsIdx >= 0
        ? parseNumber(row[totalInteractionsIdx])
        : derivedInteractions > 0
          ? derivedInteractions
          : undefined;

    const postsCount = postsIdx >= 0 ? parseNumber(row[postsIdx]) : undefined;
    const writes: MetricWrite[] = [];

    for (const { index, header } of uniqueVisitorDeviceHeaders) {
      const match = header.match(/^total unique visitors (desktop|mobile)$/);
      if (!match) continue;
      const metricValue = parseNumber(row[index]);
      const write = buildBreakdownWrite(
        Metric.TOTAL_USERS,
        metricValue,
        "deviceType",
        match[1],
      );
      if (write) writes.push(write);
    }

    for (const { index, header } of uniqueVisitorPageHeaders) {
      const match = header.match(/^(overview|life|jobs) unique visitors total$/);
      if (!match) continue;
      const metricValue = parseNumber(row[index]);
      const write = buildBreakdownWrite(
        Metric.TOTAL_USERS,
        metricValue,
        "pageType",
        match[1],
      );
      if (write) writes.push(write);
    }

    out.push({
      date: startOfDay(parsedDate),
      followers: followersIdx >= 0 ? parseNumber(row[followersIdx]) : undefined,
      likes,
      comments,
      shares,
      views: viewsIdx >= 0 ? parseNumber(row[viewsIdx]) : undefined,
      uniqueVisitors:
        uniqueVisitorsIdx >= 0 ? parseNumber(row[uniqueVisitorsIdx]) : undefined,
      totalInteractions,
      daysPosted: postsCount != null ? (postsCount > 0 ? 1 : 0) : undefined,
      writes,
    });
  }

  return out;
}

function parseLinkedInImportBuffer(
  fileBuffer: Buffer,
  filename: string,
): { rows: CsvImportRow[]; supplementalWrites: MetricWrite[] } {
  const extension = getFileExtension(filename);
  if (extension === "csv") {
    return {
      rows: parseRows(parseCsv(fileBuffer.toString("utf8"))),
      supplementalWrites: [],
    };
  }

  if (extension !== "xls" && extension !== "xlsx") {
    throw new Error("Unsupported file type. Please upload CSV, XLS, or XLSX.");
  }

  const workbook = XLSX.read(fileBuffer, { type: "buffer" });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) return { rows: [], supplementalWrites: [] };

  const firstSheet = workbook.Sheets[firstSheetName];
  const firstSheetRows = parseCsv(XLSX.utils.sheet_to_csv(firstSheet));
  const parsedRows = parseRows(firstSheetRows);
  const supplementalWrites: MetricWrite[] = [];

  // Visitor and follower exports include non-daily audience snapshots on
  // dedicated sheets. We store them as breakdown rows so the LinkedIn page
  // can render demographic composition charts without a schema change.
  for (const [sheetName, breakdownKey] of Object.entries(
    DEMOGRAPHIC_BREAKDOWN_KEYS,
  )) {
    const sheet = workbook.Sheets[
      Object.keys(workbook.Sheets).find(
        (name) => normalizeHeader(name) === sheetName,
      ) ?? ""
    ];
    if (!sheet) continue;

    const sheetRows = parseCsv(XLSX.utils.sheet_to_csv(sheet));
    const metricName =
      normalizeHeader(firstSheetName) === "new followers"
        ? Metric.FOLLOWERS
        : normalizeHeader(firstSheetName) === "visitor metrics"
          ? Metric.TOTAL_USERS
          : null;

    if (!metricName) continue;
    supplementalWrites.push(
      ...parseBreakdownSheet(sheetRows, metricName, breakdownKey),
    );
  }

  // LinkedIn content exports include an "All posts" sheet keyed by the
  // actual post creation date. We merge that into DAYS_POSTED so the
  // calendar reflects publish days rather than later engagement days.
  const allPostsSheet = workbook.Sheets["All posts"];
  if (!allPostsSheet) return { rows: parsedRows, supplementalWrites };

  const allPostsRows = parseCsv(XLSX.utils.sheet_to_csv(allPostsSheet));
  const daysPostedDates = parsePostDateRows(allPostsRows);
  return {
    rows: mergeDaysPostedRows(parsedRows, daysPostedDates),
    supplementalWrites,
  };
}

/**
 * Convert a parsed LinkedIn row into metric writes for a single day.
 * Undefined values are ignored so each file type (followers/content/visitors)
 * can populate only the metrics it actually contains.
 */
function rowToMetricWrites(row: CsvImportRow): MetricWrite[] {
  const candidates: Array<MetricWrite | null> = [
    row.followers != null
      ? { metricName: Metric.FOLLOWERS, metricValue: row.followers }
      : null,
    row.likes != null
      ? { metricName: Metric.LIKES, metricValue: row.likes }
      : null,
    row.comments != null
      ? { metricName: Metric.COMMENTS, metricValue: row.comments }
      : null,
    row.shares != null
      ? { metricName: Metric.SHARES, metricValue: row.shares }
      : null,
    row.totalInteractions != null
      ? {
          metricName: Metric.TOTAL_INTERACTIONS,
          metricValue: row.totalInteractions,
        }
      : null,
    row.daysPosted != null
      ? { metricName: Metric.DAYS_POSTED, metricValue: row.daysPosted }
      : null,
    row.views != null
      ? { metricName: Metric.VIEWS, metricValue: row.views }
      : null,
    row.uniqueVisitors != null
      ? { metricName: Metric.TOTAL_USERS, metricValue: row.uniqueVisitors }
      : null,
  ];

  return [
    ...candidates.filter((m): m is MetricWrite => m !== null),
    ...(row.writes ?? []),
  ];
}

function chunkArray<T>(items: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += chunkSize) {
    chunks.push(items.slice(i, i + chunkSize));
  }
  return chunks;
}

/**
 * Flatten parsed day rows into concrete metric writes and collapse duplicates
 * inside the same upload payload. This keeps repeated uploads idempotent and
 * lets us write to the database in larger batches.
 */
function prepareMetricWrites(rows: CsvImportRow[]): PreparedMetricWrite[] {
  const writesByKey = new Map<string, PreparedMetricWrite>();
  return prepareMetricWritesWithSupplemental(rows, []);
}

function prepareMetricWritesWithSupplemental(
  rows: CsvImportRow[],
  supplementalWrites: MetricWrite[],
): PreparedMetricWrite[] {
  const writesByKey = new Map<string, PreparedMetricWrite>();

  for (const row of rows) {
    for (const metric of rowToMetricWrites(row)) {
      const metricDay = row.date.toISOString();
      const key = [
        metricDay,
        metric.metricName,
        metric.breakdownKey ?? "",
        metric.breakdownValue ?? "",
      ].join("::");

      writesByKey.set(key, {
        ...metric,
        metricDate: row.date,
      });
    }
  }

  for (const metric of supplementalWrites) {
    const key = [
      "snapshot",
      metric.metricName,
      metric.breakdownKey ?? "",
      metric.breakdownValue ?? "",
    ].join("::");

    writesByKey.set(key, {
      ...metric,
      metricDate: null,
    });
  }

  return Array.from(writesByKey.values());
}

async function resolveLinkedInAccountId(
  explicitId?: string,
): Promise<string | null> {
  if (explicitId?.trim()) return explicitId.trim();

  const slug = String(process.env.LINKEDIN_COMPANY_SLUG ?? "").trim();
  if (slug) {
    const bySlug = await prisma.socialMedia.findFirst({
      where: {
        provider: Provider.LINKEDIN,
        OR: [{ username: slug }, { userId: slug }],
      },
      select: { id: true },
    });
    if (bySlug?.id) return bySlug.id;
  }

  const first = await prisma.socialMedia.findFirst({
    where: { provider: Provider.LINKEDIN },
    select: { id: true },
  });
  return first?.id ?? null;
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const auth = await requireAdminApi(req, res);
  if (!auth) return;

  try {
    const csvText = String(req.body?.csvText ?? "");
    const fileBase64 = String(req.body?.fileBase64 ?? "");
    const filename = String(req.body?.filename ?? "linkedin.csv");
    const explicitSocialMediaId = String(req.body?.socialMediaId ?? "");

    if (!csvText.trim() && !fileBase64.trim()) {
      return res.status(400).json({
        error: "Either csvText or fileBase64 is required",
      });
    }

    const socialMediaId = await resolveLinkedInAccountId(explicitSocialMediaId);
    if (!socialMediaId) {
      return res.status(404).json({
        error:
          "No LinkedIn account found in SocialMedia. Add provider=LINKEDIN first.",
      });
    }

    // Accept either raw CSV text or base64-encoded CSV/XLS/XLSX files
    // from the Admin upload UI.
    const parsedImport = fileBase64.trim()
      ? parseLinkedInImportBuffer(decodeBase64ToBuffer(fileBase64), filename)
      : { rows: parseRows(parseCsv(csvText)), supplementalWrites: [] };
    const parsedRows = parsedImport.rows;

    if (parsedRows.length === 0) {
      return res.status(400).json({
        error: "No valid metric rows found in CSV.",
      });
    }

    const preparedWrites = prepareMetricWritesWithSupplemental(
      parsedRows,
      parsedImport.supplementalWrites,
    );
    const rowsImported = parsedRows.filter(
      (row) => rowToMetricWrites(row).length > 0,
    ).length;
    const metricsWritten = preparedWrites.length;

    if (preparedWrites.length === 0) {
      return res.status(400).json({
        error: "No valid metric rows found in CSV.",
      });
    }

    const datedWrites = preparedWrites.filter(
      (write): write is PreparedMetricWrite & { metricDate: Date } =>
        write.metricDate instanceof Date,
    );
    const undatedWrites = preparedWrites.filter((write) => !write.metricDate);
    const metricDates = Array.from(
      new Set(datedWrites.map((write) => write.metricDate.toISOString())),
    ).map((value) => new Date(value));
    const datedMetricNames = Array.from(
      new Set(datedWrites.map((write) => write.metricName)),
    );
    const undatedMetricNames = Array.from(
      new Set(undatedWrites.map((write) => write.metricName)),
    );
    const now = new Date();

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      if (metricDates.length && datedMetricNames.length) {
        await tx.socialMediaMetrics.deleteMany({
          where: {
            socialMediaId,
            metricDate: { in: metricDates },
            metricName: { in: datedMetricNames },
          },
        });
      }

      if (undatedMetricNames.length) {
        await tx.socialMediaMetrics.deleteMany({
          where: {
            socialMediaId,
            metricDate: null,
            metricName: { in: undatedMetricNames },
          },
        });
      }

      for (const chunk of chunkArray(preparedWrites, 500)) {
        await tx.socialMediaMetrics.createMany({
          data: chunk.map((write) => ({
            socialMediaId,
            metricName: write.metricName,
            metricValue: write.metricValue,
            breakdownKey: write.breakdownKey ?? null,
            breakdownValue: write.breakdownValue ?? null,
            metricDate: write.metricDate,
            lastSynced: now,
          })),
        });
      }
    });

    return res.status(200).json({
      message: "LinkedIn CSV imported successfully",
      filename,
      rowsParsed: parsedRows.length,
      rowsImported,
      metricsWritten,
    });
  } catch (error) {
    console.error("[linkedin-csv-import] failed", error);
    return res.status(500).json({ error: "Failed to import LinkedIn CSV" });
  }
}
