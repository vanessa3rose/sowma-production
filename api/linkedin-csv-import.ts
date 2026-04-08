import {
  Metric,
  Provider,
  Prisma,
} from "../src/generated/prisma/index.js";
import * as XLSX from "xlsx";
import { startOfDay } from "../src/utils/dates.js";
import { requireAdminApi } from "./_auth.js";
import { createPrismaClient } from "./_db.js";

const prisma = (globalThis as any).prisma ?? createPrismaClient();
if (process.env.NODE_ENV !== "production") (globalThis as any).prisma = prisma;

type CsvImportRow = {
  date: Date;
  followers?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  views?: number;
  totalInteractions?: number;
  daysPosted?: number;
};

type MetricWrite = {
  metricName: Metric;
  metricValue: number;
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

function findHeaderIndex(headers: string[], aliases: string[]): number {
  return headers.findIndex((header) => aliases.includes(header));
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
    out.push({
      date: startOfDay(parsedDate),
      followers: followersIdx >= 0 ? parseNumber(row[followersIdx]) : undefined,
      likes,
      comments,
      shares,
      views: viewsIdx >= 0 ? parseNumber(row[viewsIdx]) : undefined,
      totalInteractions,
      daysPosted: postsCount != null ? (postsCount > 0 ? 1 : 0) : undefined,
    });
  }

  return out;
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
  ];

  return candidates.filter((m): m is MetricWrite => m !== null);
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
    const parsedCsv = fileBase64.trim()
      ? parseSpreadsheetRowsFromBuffer(
          decodeBase64ToBuffer(fileBase64),
          filename,
        )
      : parseCsv(csvText);
    const parsedRows = parseRows(parsedCsv);

    if (parsedRows.length === 0) {
      return res.status(400).json({
        error: "No valid metric rows found in CSV.",
      });
    }

    let rowsImported = 0;
    let metricsWritten = 0;

    for (const row of parsedRows) {
      const metricsToInsert = rowToMetricWrites(row);

      if (metricsToInsert.length === 0) {
        continue;
      }

      await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        await tx.socialMediaMetrics.deleteMany({
          where: {
            socialMediaId,
            metricDate: row.date,
            metricName: { in: metricsToInsert.map((m) => m.metricName) },
          },
        });

        await Promise.all(
          metricsToInsert.map((m) =>
            tx.socialMediaMetrics.create({
              data: {
                socialMediaId,
                metricName: m.metricName,
                metricValue: m.metricValue,
                metricDate: row.date,
                lastSynced: new Date(),
              },
            }),
          ),
        );
      });

      rowsImported += 1;
      metricsWritten += metricsToInsert.length;
    }

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
