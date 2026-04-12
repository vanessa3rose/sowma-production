import { Count, PrismaClient } from "../src/generated/prisma/index.js";
import * as XLSX from "xlsx";
import { requireAdminApi, requireSignedInApi } from "./_auth.js";
import { createPrismaClient } from "./_db.js";

type ApiResponse = {
  status: (code: number) => {
    json: (body: unknown) => unknown;
  };
};

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
};
const prisma = globalForPrisma.prisma ?? createPrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

type HearAboutUsEntry = {
  source: string;
  count: number;
};

const COUNT_LABELS: Record<Count, string> = {
  [Count.CORPORATE_VOLUNTEER]: "Corporate Volunteer",
  [Count.COMMUNITY_VOLUNTEER]: "Community Volunteer",
  [Count.GOOGLE_SEARCH]: "Google Search",
  [Count.ATTENDED_EVENT]: "Attended an Event",
  [Count.WEBSITE]: "Website",
  [Count.SCHOOL_VOLUNTEER]: "School Volunteer",
  [Count.SOCIAL_MEDIA]: "Social Media",
  [Count.HEARD_SOWMA_SPEAKER]: "Heard a SOWMA Speaker",
  [Count.NEWS_MEDIA]: "News Media",
  [Count.REFERRAL]: "Referral",
  [Count.OTHER]: "Other",
};

const COUNT_ORDER: Count[] = [
  Count.CORPORATE_VOLUNTEER,
  Count.COMMUNITY_VOLUNTEER,
  Count.GOOGLE_SEARCH,
  Count.ATTENDED_EVENT,
  Count.WEBSITE,
  Count.SCHOOL_VOLUNTEER,
  Count.SOCIAL_MEDIA,
  Count.HEARD_SOWMA_SPEAKER,
  Count.NEWS_MEDIA,
  Count.REFERRAL,
  Count.OTHER,
];

const NORMALIZED_COUNT_MAP = new Map<string, Count>([
  ["attended an event", Count.ATTENDED_EVENT],
  ["community volunteer", Count.COMMUNITY_VOLUNTEER],
  ["corporate volunteer", Count.CORPORATE_VOLUNTEER],
  ["google search", Count.GOOGLE_SEARCH],
  ["heard a sowma speaker", Count.HEARD_SOWMA_SPEAKER],
  ["heard sowma speaker", Count.HEARD_SOWMA_SPEAKER],
  ["news media", Count.NEWS_MEDIA],
  ["other", Count.OTHER],
  ["referral", Count.REFERRAL],
  ["school volunteer", Count.SCHOOL_VOLUNTEER],
  ["social media", Count.SOCIAL_MEDIA],
  ["website", Count.WEBSITE],
]);

function normalizeHeader(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

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

function findHeaderRowIndex(rows: string[][]): number {
  for (let i = 0; i < rows.length; i += 1) {
    const normalized = rows[i].map((cell) =>
      normalizeHeader(String(cell ?? "")),
    );
    if (
      normalized.includes("how did you hear about us account") ||
      normalized.includes("how did you hear about us")
    ) {
      return i;
    }
  }
  return -1;
}

function aggregateCounts(rows: string[][]): Record<Count, number> {
  const headerRowIndex = findHeaderRowIndex(rows);
  if (headerRowIndex === -1) {
    throw new Error(
      'File is missing a "How did you hear about us? (Account)" column.',
    );
  }

  const headers = rows[headerRowIndex].map((cell) =>
    normalizeHeader(String(cell ?? "")),
  );
  const sourceIdx = headers.findIndex(
    (header) =>
      header === "how did you hear about us account" ||
      header === "how did you hear about us",
  );

  if (sourceIdx === -1) {
    throw new Error(
      'File is missing a "How did you hear about us? (Account)" column.',
    );
  }

  const counts = Object.fromEntries(
    COUNT_ORDER.map((countKey) => [countKey, 0]),
  ) as Record<Count, number>;

  for (let i = headerRowIndex + 1; i < rows.length; i += 1) {
    const rawValue = String(rows[i]?.[sourceIdx] ?? "").trim();
    if (!rawValue) continue;

    const normalized = normalizeHeader(rawValue);
    const mapped = NORMALIZED_COUNT_MAP.get(normalized) ?? Count.OTHER;
    counts[mapped] += 1;
  }

  return counts;
}

async function handleGet(req: any, res: ApiResponse) {
  const auth = await requireSignedInApi(req, res);
  if (!auth) return;

  const latest = await prisma.databaseReport.findFirst({
    orderBy: { reportDate: "desc" },
    include: { counts: true },
  });

  if (!latest) {
    return res.status(200).json({
      data: [],
      latestImport: null,
    });
  }

  const countMap = new Map(latest.counts.map((entry) => [entry.count, entry]));
  const data: HearAboutUsEntry[] = COUNT_ORDER.map((countKey) => ({
    source: COUNT_LABELS[countKey],
    count: countMap.get(countKey)?.value ?? 0,
  }));

  return res.status(200).json({
    data,
    latestImport: latest.reportDate,
  });
}

async function handlePost(req: any, res: ApiResponse) {
  const auth = await requireAdminApi(req, res);
  if (!auth) return;

  const fileBase64 = String(req.body?.fileBase64 ?? "").trim();
  const csvText = String(req.body?.csvText ?? "");
  const filename = String(req.body?.filename ?? "hear-about-us.xlsx");

  if (!fileBase64 && !csvText.trim()) {
    return res.status(400).json({
      error: "Either csvText or fileBase64 is required",
    });
  }

  const rows = fileBase64
    ? parseSpreadsheetRowsFromBuffer(decodeBase64ToBuffer(fileBase64), filename)
    : parseCsv(csvText);

  const counts = aggregateCounts(rows);
  const totalAccounts = Object.values(counts).reduce(
    (sum, count) => sum + count,
    0,
  );

  if (totalAccounts === 0) {
    return res.status(400).json({
      error: "No valid rows found in file.",
    });
  }

  const report = await prisma.databaseReport.create({
    data: {
      reportDate: new Date(),
      counts: {
        create: COUNT_ORDER.map((countKey) => ({
          count: countKey,
          value: counts[countKey],
        })),
      },
    },
    include: { counts: true },
  });

  return res.status(200).json({
    message: "How Did You Hear About Us data imported successfully",
    filename,
    totalAccounts,
    categoriesWritten: report.counts.length,
  });
}

export default async function handler(req: any, res: ApiResponse) {
  try {
    if (req.method === "GET") {
      return await handleGet(req, res);
    }

    if (req.method === "POST") {
      return await handlePost(req, res);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("[hear-about-us-report] failed", error);
    return res.status(500).json({ error: "Failed to process report" });
  }
}
