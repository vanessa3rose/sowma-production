import React, { SetStateAction, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

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
    socialMedia: "TikTok",
    metrics: [],
  },
  {
    socialMedia: "LinkedIn",
    metrics: [],
  },
  {
    socialMedia: "Twitter",
    metrics: [],
  },
];

export default function APIData() {
  const [platform, setPlatform] = useState("instagram");
  const [metric, setMetric] = useState("");

  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    null,
    null,
  ]);
  const [startDate, endDate] = dateRange;

  const [text, setText] = useState("");
  const [submittedText, setSubmittedText] = useState("");

  const selectedPlatform = SOCIAL_MEDIA_METRICS.find(
    (p) => p.socialMedia === platform,
  );
  return (
    <div className="p-6 flex flex-col">
      <h2 className="text-2xl text-gray-500 font-bold font-poppins">
        Manual Data Entry
      </h2>

      <div className="font-poppins font-[400] text-2xl grid grid-rows gap-6 py-6">
        <div className="flex items-center gap-6">
          <p className="text-gray-500">Select a platform</p>
          <select
            value={platform}
            onChange={(e) => {
              setPlatform(e.target.value);
              setMetric("");
            }}
            className="rounded-2xl border-gray-500 border-2 px-3 py-2 text-xl"
          >
            {SOCIAL_MEDIA_METRICS.map((p) => (
              <option key={p.socialMedia} value={p.socialMedia}>
                {p.socialMedia}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-6">
          <p className="text-gray-500">
            Which metric would you like to change?
          </p>
          <select
            value={metric}
            onChange={(e) => setMetric(e.target.value)}
            disabled={!selectedPlatform}
            className="rounded-2xl border-gray-500 border-2 px-3 py-2 text-xl disabled:opacity-50"
          >
            <option value="" disabled>
              Select metric
            </option>
            {selectedPlatform?.metrics.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col">
          <div className="flex gap-20">
            <div className="grid-rows">
              <p className="text-xl text-black py-3">Date</p>
              <DatePicker
                selectsRange
                startDate={startDate}
                endDate={endDate}
                onChange={(update: [Date | null, Date | null]) =>
                  setDateRange(update)
                }
                inline
                dateFormat="MMMM d, yyyy"
              />
            </div>

            <div className="flex-rows">
              <p className="text-xl text-black py-3">Metrics</p>
              <input
                type="text"
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                  console.log(e.target.value);
                }}
                className="rounded-3xl border-2 border-gray-500 px-4 py-2 text-xl"
              />

              {submittedText && (
                <p className="text-sm py-2">
                  Submitted: <span>{submittedText}</span>
                </p>
              )}
            </div>
          </div>

          <div className="mt-4 self-end">
            <button
              onClick={() => setSubmittedText(text)}
              className="rounded-3xl bg-[#4e8bcc] text-white text-xl font-bold px-10 py-2"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
