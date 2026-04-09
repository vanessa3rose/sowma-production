import { useMemo, useState } from "react";
import DatePicker from "react-datepicker";
import Dropdown from "../Dropdown";
import "react-datepicker/dist/react-datepicker.css";

type UploadResult = {
  fileName: string;
  ok: boolean;
  message: string;
  rowsImported?: number;
  metricsWritten?: number;
};

const SOCIAL_MEDIA_METRICS = [
  {
    socialMedia: "Google Analytics",
    metrics: [
      "Active Users",
      "Page Views",
      "Engagement Rate",
      "New Users",
      "Bounce Rate",
      "Avg Session Duration",
      "Total Session",
      "Engaged Sessions",
      "Pages / Session",
      "Engagement Time",
    ],
  },
  {
    socialMedia: "Instagram",
    metrics: [
      "Likes",
      "Comments",
      "Days Posted",
      "Followers",
      "Reach",
      "Views",
      "Total Interactions",
    ],
  },
  {
    socialMedia: "Facebook",
    metrics: ["Followers", "Likes", "Views", "Posts", "Shares", "Comments"],
  },
  {
    socialMedia: "Constant Contact",
    metrics: [],
  },
  {
    socialMedia: "LinkedIn",
    metrics: [
      "New Followers",
      "Likes",
      "Comments",
      "Shares",
      "Total Interactions",
      "Views",
    ],
  },
  {
    socialMedia: "Twitter",
    metrics: [],
  },
];

export default function APIData() {
  const [platform, setPlatform] = useState("Instagram");
  const [metric, setMetric] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [text, setText] = useState("");
  const [submittedText, setSubmittedText] = useState("");

  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState<UploadResult[]>([]);

  const selectedPlatform = useMemo(
    () => SOCIAL_MEDIA_METRICS.find((p) => p.socialMedia === platform),
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
        // API accepts base64 to support CSV + Excel uploads in one endpoint.
        const fileBase64 = arrayBufferToBase64(await file.arrayBuffer());

        const response = await fetch("/api/linkedin-csv-import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: file.name,
            fileBase64,
          }),
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
          message:
            typeof body?.message === "string"
              ? body.message
              : "Imported successfully",
          rowsImported:
            typeof body?.rowsImported === "number"
              ? body.rowsImported
              : undefined,
          metricsWritten:
            typeof body?.metricsWritten === "number"
              ? body.metricsWritten
              : undefined,
        });
      }

      setUploadResults(nextResults);
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="p-6 flex flex-col gap-8">
      <section className="border border-gray-200 rounded-2xl p-4 lg:p-6">
        <h2 className="text-2xl text-gray-500 font-bold font-poppins">
          LinkedIn CSV Upload
        </h2>
        <p className="font-poppins text-sm text-gray-600 mt-2">
          Upload one or more LinkedIn export files (.csv, .xls, .xlsx).
        </p>

        <div className="mt-4 flex flex-col lg:flex-row lg:items-center gap-4">
          <input
            type="file"
            accept=".csv,.xls,.xlsx,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            multiple
            onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
            className="font-poppins text-sm"
          />

          <button
            type="button"
            onClick={handleLinkedInUpload}
            disabled={isUploading || files.length === 0}
            className="rounded-full bg-sowma-blue text-white font-poppins font-semibold px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? "Uploading..." : "Upload File(s)"}
          </button>
        </div>

        {files.length > 0 ? (
          <p className="font-poppins text-sm text-gray-700 mt-3">
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
                {result.ok ? (
                  <div>
                    rows imported: {result.rowsImported ?? 0}, metrics written:{" "}
                    {result.metricsWritten ?? 0}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        ) : null}
      </section>

      <section>
        <h2 className="text-2xl text-gray-500 font-bold font-poppins">
          Manual Data Entry
        </h2>

        <div className="font-poppins font-[400] lg:text-2xl text-lg grid grid-rows gap-6 py-6 items-start">
          <div className="flex flex-col lg:flex-row lg:items-center items-start gap-2 lg:gap-6">
            <p className="text-gray-500">Select a platform</p>
            <Dropdown<string>
              items={SOCIAL_MEDIA_METRICS.map((p) => p.socialMedia)}
              value={platform}
              onChange={(val) => {
                setPlatform(val);
                setMetric("");
              }}
              getLabel={(val) => val}
              getKey={(val) => val}
              className="rounded-2xl border-sowma-gray  border-2 px-3 py-2"
              openClassName="rounded-t-2xl border-sowma-gray border-2 px-3 pt-2 -pb-2 mb-2 lg:text-[14px]"
            />
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center items-start gap-2 lg:gap-6">
            <p className="text-gray-500">
              Which metric would you like to change?
            </p>
            <Dropdown<string>
              items={selectedPlatform?.metrics || []}
              value={metric}
              onChange={(val) => {
                setMetric(val);
              }}
              getLabel={(val) => val}
              getKey={(val) => val}
              defaultValue="select metric"
              className={`rounded-2xl  ${metric ? "border-sowma-gray" : "border-sowma-light-gray"} border-2 px-3 py-2`}
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
                  onChange={(e) => {
                    setText(e.target.value);
                  }}
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
                  onClick={() => setSubmittedText(text)}
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
