import { useMemo, useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import Dropdown from "../Dropdown";
import "react-datepicker/dist/react-datepicker.css";

import {
  BreakdownKeyOption,
  BreakdownKeyId,
  Platform,
  PLATFORM_CONFIGS,
  PLATFORM_LABELS,
  PLATFORM_TO_PROVIDER,
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

  const [breakdownKey, setBreakdownKey] = useState<BreakdownKeyId | "">("");
  const [breakdownValue, setBreakdownValue] = useState<string>("");
  const [breakdownSuggestions, setBreakdownSuggestions] = useState<string[]>(
    [],
  );
  const [showEx, setShowEx] = useState(false);

  const COUNTY_MAP: Record<string, string> = {
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

  const COUNTY_REVERSE_MAP: Record<string, string> = Object.fromEntries(
    Object.entries(COUNTY_MAP).map(([k, v]) => [v, k]),
  );

  useEffect(() => {
    if (!platform || !metric || !breakdownKey) {
      setBreakdownSuggestions([]);
      return;
    }

    const selectedMetricConfig = selectedPlatformMetrics.find(
      (m) => m.title === metric,
    );

    if (!selectedMetricConfig) return;

    fetch(
      `/api/breakdown-values?platform=${platform}&metric=${selectedMetricConfig.metric}&breakdownKey=${breakdownKey}`,
    )
      .then((res) => res.json())
      .then((data) => {
        const values = (data.values || [])
          .filter(Boolean)
          .map((v: string) => v.trim())
          .map((v: string) =>
            breakdownKey === "county" ? (COUNTY_MAP[v] ?? v) : v,
          )
          .filter((v: string, i: number, arr: string[]) => arr.indexOf(v) === i)
          .sort((a: string, b: string) =>
            a.localeCompare(b, undefined, { sensitivity: "base" }),
          );

        setBreakdownSuggestions(values);
      })
      .catch(() => setBreakdownSuggestions([]));
  }, [platform, metric, breakdownKey]);

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

    const key =
      !selectedMetricConfig?.breakdownKeys || breakdownKey === ""
        ? null
        : breakdownKey;
    const val =
      !selectedMetricConfig?.breakdownKeys || breakdownValue === ""
        ? null
        : breakdownKey === "county" &&
            COUNTY_REVERSE_MAP[breakdownValue] !== undefined
          ? COUNTY_REVERSE_MAP[breakdownValue]
          : breakdownValue;

    try {
      const res = await fetch("/api/manual-metric", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: PLATFORM_TO_PROVIDER[platform],
          metric: selectedMetricConfig.metric,
          value: Number(text),
          date: selectedDate.toISOString(),
          breakdownKey: key,
          breakdownValue: val,
        }),
      });

      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(body?.error || "Failed to save metric");
      }

      setSubmittedText(`${metric} (${text})`);
    } catch (err: any) {
      console.error(err);
      alert(err.message);
    }
  }

  const selectedMetricConfig = selectedPlatformMetrics.find(
    (m) => m.title === metric,
  );

  const hasBreakdownKeys =
    (selectedMetricConfig?.breakdownKeys?.length ?? 0) > 0;

  const isValidNumber = text !== "" && !isNaN(Number(text));

  const hasRequiredFields =
    isValidNumber &&
    platform !== null &&
    metric !== "" &&
    selectedDate !== null;

  const hasValidBreakdown =
    (!hasBreakdownKeys || breakdownValue !== "") &&
    (breakdownKey !== "county" ||
      COUNTY_MAP[breakdownValue] !== undefined ||
      COUNTY_REVERSE_MAP[breakdownValue] !== undefined);

  const canSubmit = hasRequiredFields && hasValidBreakdown && !showEx;

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
                setSubmittedText("");
              }}
              getLabel={(val) => PLATFORM_LABELS[val] ?? val}
              getKey={(val) => val}
              className="rounded-2xl border-sowma-gray border-2 px-3 py-2"
              openClassName="rounded-t-2xl border-sowma-gray border-2 px-3 pt-2 -pb-2 mb-2 lg:text-[14px]"
            />
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center items-start gap-2 lg:gap-6">
            <p className="text-gray-500">Which metric would you like to add?</p>
            <Dropdown<string>
              items={selectedPlatformMetrics.map((m) => m.title)}
              value={metric}
              onChange={(val) => {
                setSubmittedText("");
                setMetric(val);
              }}
              getLabel={(val) => val}
              getKey={(val) => val}
              defaultValue="select metric"
              className={`rounded-2xl ${metric ? "border-sowma-gray" : "border-sowma-light-gray"} border-2 px-3 py-2`}
              openClassName="rounded-t-2xl border-sowma-gray border-2 px-3 pt-2 -pb-2 mb-2 lg:text-[14px]"
            />
          </div>

          {selectedMetricConfig?.breakdownKeys && (
            <div className="flex flex-col lg:flex-row lg:items-center items-start gap-2 lg:gap-6">
              <p className="text-gray-500">
                What is the attribute of this metric?
              </p>
              <Dropdown<BreakdownKeyOption | null>
                items={selectedMetricConfig?.breakdownKeys || []}
                value={
                  selectedMetricConfig?.breakdownKeys?.find(
                    (b) => b.key === breakdownKey,
                  ) ?? null
                }
                onChange={(val) => {
                  setSubmittedText("");
                  setBreakdownKey(val?.key || "");
                  setBreakdownValue("");
                  setShowEx(false);
                }}
                getLabel={(val) => val?.label || ""}
                getKey={(val) => val?.key || ""}
                defaultValue="select metric"
                className={`rounded-2xl ${metric ? "border-sowma-gray" : "border-sowma-light-gray"} border-2 px-3 py-2`}
                openClassName="rounded-t-2xl border-sowma-gray border-2 px-3 pt-2 -pb-2 mb-2 lg:text-[14px]"
              />
            </div>
          )}

          <div className="flex flex-col gap-10">
            <div className="flex flex-col relative lg:flex-row h-full lg:items-start lg:gap-20 items-start gap-6">
              <div className="flex flex-col">
                <p className="lg:text-xl text-black lg:py-3 pt-3 pb-1">Date</p>
                <DatePicker
                  selected={selectedDate}
                  onChange={(date: Date | null) => {
                    setSelectedDate(date);
                    setSubmittedText("");
                  }}
                  inline
                  dateFormat="MMMM d, yyyy"
                />
              </div>

              <div className="flex flex-col h-full space-y-2">
                {selectedMetricConfig?.breakdownKeys && (
                  <div className="flex flex-col">
                    <div className="flex flex-row space-x-4">
                      <p className="lg:text-xl text-black lg:py-3 pt-3 pb-1">
                        Attribute Value
                      </p>

                      {breakdownSuggestions.length > 0 && (
                        <button
                          className="text-sm italic text-gray-500 -mb-1"
                          onClick={() => setShowEx(!showEx)}
                        >
                          {showEx ? "hide examples" : "show examples"}
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={breakdownValue}
                      onChange={(e) => {
                        setSubmittedText("");
                        setBreakdownValue(e.target.value);
                      }}
                      className="rounded-3xl border-2 border-sowma-gray px-4 py-2 lg:text-xl"
                    />
                    {showEx && breakdownSuggestions.length > 0 && (
                      <div className="mt-2 max-h-40 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-sm">
                        {breakdownSuggestions.map((val) => (
                          <div
                            key={val}
                            onClick={() => {
                              setBreakdownValue(val);
                              setShowEx(false);
                            }}
                            className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100"
                          >
                            {val}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex flex-col">
                  <p className="lg:text-xl text-black lg:py-3 pt-3 pb-1">
                    Metric Value
                  </p>
                  <input
                    type="text"
                    value={text}
                    onChange={(e) => {
                      setSubmittedText("");
                      const val = e.target.value;
                      // allow empty, "-", and valid numeric strings
                      if (
                        val === "" ||
                        val === "-" ||
                        /^-?\d*\.?\d*$/.test(val)
                      ) {
                        setText(val);
                      }
                    }}
                    className="rounded-3xl border-2 border-sowma-gray px-4 py-2 lg:text-xl"
                  />
                  {submittedText ? (
                    <p className="text-sm py-2">
                      Submitted: <span>{submittedText}</span>
                    </p>
                  ) : null}
                </div>
              </div>

              {canSubmit && (
                <div className="lg:absolute lg:right-2 lg:bottom-2 lg:mt-0 lg:self-end mt-4 self-end">
                  <button
                    type="button"
                    onClick={() => handleSubmit()}
                    className="rounded-3xl bg-sowma-blue text-white text-xl font-bold px-10 py-2"
                  >
                    Submit
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
