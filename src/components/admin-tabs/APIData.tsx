import { useMemo, useState } from "react";
import DatePicker from "react-datepicker";
import Dropdown from "../Dropdown";
import "react-datepicker/dist/react-datepicker.css";

import {
  Platform,
  PLATFORM_CONFIGS,
  PLATFORM_LABELS,
} from "../../config/platformConfigs.ts";

type UploadResult = {
  fileName: string;
  ok: boolean;
  message: string;
  rowsImported?: number;
  metricsWritten?: number;
  totalAccounts?: number;
  categoriesWritten?: number;
};

type UploadPanelProps = {
  title: string;
  description: string;
  files: File[];
  isUploading: boolean;
  uploadResults: UploadResult[];
  onFileChange: (files: File[]) => void;
  onUpload: () => Promise<void>;
};

function UploadPanel({
  title,
  description,
  files,
  isUploading,
  uploadResults,
  onFileChange,
  onUpload,
}: UploadPanelProps) {
  return (
    <section className="border border-gray-200 rounded-2xl p-4 lg:p-6 bg-white min-w-0">
      <h2 className="text-2xl text-gray-500 font-bold font-poppins">{title}</h2>
      <p className="font-poppins text-sm text-gray-600 mt-2">{description}</p>

      <div className="mt-4 flex flex-col gap-4">
        <input
          type="file"
          accept=".csv,.xls,.xlsx,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          multiple
          onChange={(e) => onFileChange(Array.from(e.target.files ?? []))}
          className="font-poppins text-sm min-w-0"
        />

        <button
          type="button"
          onClick={onUpload}
          disabled={isUploading || files.length === 0}
          className="w-fit rounded-full bg-sowma-light-blue text-white font-poppins font-semibold px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUploading ? "Uploading..." : "Upload File(s)"}
        </button>
      </div>

      {files.length > 0 ? (
        <p className="font-poppins text-sm text-gray-700 mt-3 break-words">
          Selected: {files.map((f) => f.name).join(", ")}
        </p>
      ) : null}

      {uploadResults.length > 0 ? (
        <div className="mt-4 space-y-2">
          {uploadResults.map((result) => (
            <div
              key={result.fileName}
              className={`rounded-lg border px-3 py-2 font-poppins text-sm ${
                result.ok
                  ? "border-green-200 bg-green-50 text-green-800"
                  : "border-red-200 bg-red-50 text-red-800"
              }`}
            >
              <div className="font-semibold">{result.fileName}</div>
              <div>{result.message}</div>

              {result.ok && result.rowsImported != null ? (
                <div>
                  rows imported: {result.rowsImported ?? 0}, metrics written:{" "}
                  {result.metricsWritten ?? 0}
                </div>
              ) : null}

              {result.ok && result.totalAccounts != null ? (
                <div>
                  accounts counted: {result.totalAccounts ?? 0}, categories
                  written: {result.categoriesWritten ?? 0}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}

export default function APIData() {
  const [platform, setPlatform] = useState<Platform>("instagram");
  const [metric, setMetric] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [text, setText] = useState("");
  const [submittedText, setSubmittedText] = useState("");

  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState<UploadResult[]>([]);

  const [hearAboutUsFiles, setHearAboutUsFiles] = useState<File[]>([]);
  const [isHearAboutUsUploading, setIsHearAboutUsUploading] = useState(false);
  const [hearAboutUsUploadResults, setHearAboutUsUploadResults] = useState<
    UploadResult[]
  >([]);

  const selectedPlatformMetrics = useMemo(
    () => PLATFORM_CONFIGS[platform] ?? [],
    [platform],
  );

  function arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    const chunkSize = 0x8000;

    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, i + chunkSize);
      binary += String.fromCharCode(...chunk);
    }

    return btoa(binary);
  }

  async function handleLinkedInUpload() {
    if (files.length === 0) return;

    try {
      setIsUploading(true);
      setUploadResults([]);

      const nextResults: UploadResult[] = [];

      for (const file of files) {
        const fileBase64 = arrayBufferToBase64(await file.arrayBuffer());

        const response = await fetch("/api/linkedin-csv-import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filename: file.name, fileBase64 }),
        });

        const body = await response.json().catch(() => ({}));

        if (!response.ok) {
          nextResults.push({
            fileName: file.name,
            ok: false,
            message:
              typeof body?.error === "string" ? body.error : "Upload failed",
          });
          continue;
        }

        nextResults.push({
          fileName: file.name,
          ok: true,
          message: body?.message ?? "Imported successfully",
          rowsImported: body?.rowsImported,
          metricsWritten: body?.metricsWritten,
        });
      }

      setUploadResults(nextResults);
    } finally {
      setIsUploading(false);
    }
  }

  async function handleHearAboutUsUpload() {
    if (hearAboutUsFiles.length === 0) return;

    try {
      setIsHearAboutUsUploading(true);
      setHearAboutUsUploadResults([]);

      const nextResults: UploadResult[] = [];

      for (const file of hearAboutUsFiles) {
        const fileBase64 = arrayBufferToBase64(await file.arrayBuffer());

        const response = await fetch("/api/hear-about-us-report", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filename: file.name, fileBase64 }),
        });

        const body = await response.json().catch(() => ({}));

        if (!response.ok) {
          nextResults.push({
            fileName: file.name,
            ok: false,
            message:
              typeof body?.error === "string" ? body.error : "Upload failed",
          });
          continue;
        }

        nextResults.push({
          fileName: file.name,
          ok: true,
          message: body?.message ?? "Imported successfully",
          totalAccounts: body?.totalAccounts,
          categoriesWritten: body?.categoriesWritten,
        });
      }

      setHearAboutUsUploadResults(nextResults);
    } finally {
      setIsHearAboutUsUploading(false);
    }
  }

  async function handleSubmit() {
    if (!metric || !selectedDate || !text) {
      alert("Missing metric, date, or value");
      return;
    }

    const selectedMetricConfig = selectedPlatformMetrics.find(
      (m) => m.title === metric,
    );

    if (!selectedMetricConfig) {
      alert("Invalid metric selection");
      return;
    }

    try {
      const res = await fetch("/api/manual-metric", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform,
          metric: selectedMetricConfig.metric,
          value: Number(text),
          date: selectedDate.toISOString(),
        }),
      });

      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(body?.error || "Failed to save metric");
      }

      setSubmittedText(`${metric} - ${text}`);
    } catch (err: any) {
      console.error(err);
      alert(err.message);
    }
  }

  return (
    <div className="p-6 flex flex-col gap-8">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <UploadPanel
          title="LinkedIn CSV Upload"
          description="Upload one or more LinkedIn export files (.csv, .xls, .xlsx)."
          files={files}
          isUploading={isUploading}
          uploadResults={uploadResults}
          onFileChange={setFiles}
          onUpload={handleLinkedInUpload}
        />

        <UploadPanel
          title="How Did You Hear About Us Upload"
          description="Upload compatible data to the Dashboard bar chart (.csv, .xls, .xlsx)."
          files={hearAboutUsFiles}
          isUploading={isHearAboutUsUploading}
          uploadResults={hearAboutUsUploadResults}
          onFileChange={setHearAboutUsFiles}
          onUpload={handleHearAboutUsUpload}
        />
      </div>

      <section className="border border-gray-200 rounded-2xl p-4 lg:p-6 bg-white">
        <h2 className="text-2xl text-gray-500 font-bold font-poppins">
          Manual Data Entry
        </h2>

        <div className="font-poppins font-[400] lg:text-2xl text-lg grid grid-rows gap-6 py-6 items-start">
          <div className="flex flex-col lg:flex-row lg:items-center items-start gap-2 lg:gap-6">
            <p className="text-gray-500">Select a platform</p>
            <Dropdown<Platform>
              items={Object.keys(PLATFORM_CONFIGS) as Platform[]}
              value={platform}
              onChange={(val) => {
                setPlatform(val);
                setMetric("");
              }}
              getLabel={(val) => PLATFORM_LABELS[val] ?? val}
              getKey={(val) => val}
              className="rounded-2xl border-sowma-gray border-2 px-3 py-2"
              openClassName="rounded-t-2xl border-sowma-gray border-2 px-3 pt-2 -pb-2 mb-2 lg:text-[14px]"
            />
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center items-start gap-2 lg:gap-6">
            <p className="text-gray-500">
              Which metric would you like to change?
            </p>
            <Dropdown<string>
              items={selectedPlatformMetrics.map((m) => m.title)}
              value={metric}
              onChange={(val) => setMetric(val)}
              getLabel={(val) => val}
              getKey={(val) => val}
              defaultValue="select metric"
              className={`rounded-2xl ${metric ? "border-sowma-gray" : "border-sowma-light-gray"} border-2 px-3 py-2`}
              openClassName="rounded-t-2xl border-sowma-gray border-2 px-3 pt-2 -pb-2 mb-2 lg:text-[14px]"
            />
          </div>

          <div className="flex flex-col gap-10">
            <div className="flex flex-col relative lg:flex-row h-full lg:items-start lg:gap-20 items-start gap-6">
              <div className="flex flex-col">
                <p className="lg:text-xl text-black lg:py-3 pt-3 pb-1">Date</p>
                <DatePicker
                  selected={selectedDate}
                  onChange={(date: Date | null) => setSelectedDate(date)}
                  inline
                  dateFormat="MMMM d, yyyy"
                />
              </div>

              <div className="flex flex-col h-full">
                <p className="lg:text-xl text-black lg:py-3 pt-3 pb-1">
                  Metrics
                </p>
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="rounded-3xl border-2 border-sowma-gray px-4 py-2 lg:text-xl"
                />

                {submittedText ? (
                  <p className="text-sm py-2">
                    Submitted: <span>{submittedText}</span>
                  </p>
                ) : null}
              </div>

              <div className="lg:absolute lg:right-2 lg:bottom-2 lg:mt-0 lg:self-end mt-4 self-end">
                <button
                  type="button"
                  onClick={() => handleSubmit()}
                  className="rounded-3xl bg-sowma-blue text-white text-xl font-bold px-10 py-2"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
