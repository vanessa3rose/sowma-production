import { useState } from "react";
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

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

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

      <div className="font-poppins font-[400] lg:text-2xl text-lg grid grid-rows gap-6 py-6 items-start">
        <div className="flex flex-col lg:flex-row lg:items-center items-start gap-2 lg:gap-6">
          <p className="text-gray-500">Select a platform</p>
          <select
            value={platform}
            onChange={(e) => {
              setPlatform(e.target.value);
              setMetric("");
            }}
            className="rounded-2xl border-gray-500 border-2 px-3 py-2 lg:text-xl"
          >
            {SOCIAL_MEDIA_METRICS.map((p) => (
              <option key={p.socialMedia} value={p.socialMedia}>
                {p.socialMedia}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center items-start gap-2 lg:gap-6">
          <p className="text-gray-500">
            Which metric would you like to change?
          </p>
          <select
            value={metric}
            onChange={(e) => setMetric(e.target.value)}
            disabled={!selectedPlatform}
            className="rounded-2xl border-gray-500 border-2 px-3 py-2 lg:text-xl disabled:opacity-50"
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
              <p className="lg:text-xl text-black lg:py-3 pt-3 pb-1">Metrics</p>
              <input
                type="text"
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                  console.log(e.target.value);
                }}
                className="rounded-3xl border-2 border-gray-500 px-4 py-2 lg:text-xl"
              />

              {submittedText && (
                <p className="text-sm py-2">
                  Submitted: <span>{submittedText}</span>
                </p>
              )}
            </div>

            <div className="lg:absolute lg:right-2 lg:bottom-2 lg:mt-0 lg:self-end mt-4 self-end">
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
    </div>
  );
}
