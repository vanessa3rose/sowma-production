// src/components/export-pdf/SocialMediaExportCard.tsx

import { SocialMediaExportData } from "../../types/exportTypes";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#4F46E5", "#EC4899", "#8B5CF6"];
const HEAT = ["#E0E7FF", "#C7D2FE", "#A5B4FC", "#818CF8", "#6366F1"];

export default function SocialMediaExportCard({
  data,
}: {
  data: SocialMediaExportData;
}) {
  return (
    <div
      style={{
        width: "1000px",
        height: "550px",
        backgroundColor: "#F8FAFC",
        padding: "24px",
        borderRadius: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      }}
      className="font-sans"
    >
      <div className="text-3xl font-bold">{data.platform}</div>

      {/* KPI Row */}
      <div className="grid grid-cols-4 gap-3">
        <Tile label="Followers" value={data.followers} change={data.followersChangeLabel} />
        <Tile label="Comments" value={data.comments} change={data.commentsChangeLabel} />
        <Tile label="Likes" value={data.likes} change={data.likesChangeLabel} />
        <Tile label="Shared" value={data.shared} change={data.sharedChangeLabel} />
      </div>

      {/* Middle: Impressions + Demographics */}
      <div className="flex gap-4 flex-1">
        {/* Impressions */}
        <div className="bg-white p-4 rounded-xl shadow-sm flex-[1.3] flex flex-col">
          <div className="text-sm font-semibold mb-1">Impressions</div>
          <div className="text-2xl text-indigo-700 font-bold mb-2">
            {data.impressions[data.impressions.length - 1]?.value ?? 0}
          </div>

          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.impressions}>
              <XAxis dataKey="year" tick={{ fontSize: 10 }} />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Demographics */}
        <div className="bg-white p-4 rounded-xl shadow-sm flex-1 flex flex-col">
          <div className="text-sm font-semibold mb-2">Demographics - Gender</div>

          <div className="flex flex-1">
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.demographics}
                    dataKey="value"
                    nameKey="label"
                    innerRadius="60%"
                    outerRadius="80%"
                    paddingAngle={2}
                  >
                    {data.demographics.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="flex flex-col justify-center gap-1 text-xs">
              {data.demographics.map((d, i) => (
                <div className="flex items-center gap-1" key={d.label}>
                  <span
                    className="w-2 h-2 rounded-full inline-block"
                    style={{ backgroundColor: COLORS[i] }}
                  />
                  <span>{d.label}</span>
                  <span className="text-gray-500">{d.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom: Reach + Heatmap */}
      <div className="flex gap-4 h-[170px]">
        {/* Reach Sources */}
        <div className="bg-white p-4 rounded-xl shadow-sm flex-1 flex flex-col">
          <div className="text-sm font-semibold mb-2">Reach Sources</div>

          <div className="flex flex-1">
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.reachSources}
                    dataKey="value"
                    nameKey="label"
                    innerRadius="60%"
                    outerRadius="80%"
                  >
                    {data.reachSources.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="flex flex-col justify-center gap-1 text-xs">
              {data.reachSources.map((d, i) => (
                <div key={d.label} className="flex items-center gap-1">
                  <span
                    className="w-2 h-2 rounded-full inline-block"
                    style={{ backgroundColor: COLORS[i] }}
                  />
                  <span>{d.label}</span>
                  <span className="text-gray-500">{d.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Heatmap */}
        <div className="bg-white p-4 rounded-xl shadow-sm flex-[1.1] flex flex-col">
          <div className="text-sm font-semibold mb-1">Days Posted</div>

          <div className="flex flex-1 flex-col justify-between">
            {data.daysPosted.map((row) => (
              <div className="flex items-center gap-2 text-[10px]" key={row.month}>
                <span className="w-8 text-gray-500">{row.month}</span>
                <div className="flex gap-[2px]">
                  {row.intensity.map((v, idx) => {
                    const bucket = Math.min(HEAT.length - 1, Math.floor(v * HEAT.length));
                    return (
                      <span
                        key={idx}
                        className="w-3 h-3 rounded-[4px]"
                        style={{ backgroundColor: HEAT[bucket] }}
                      />
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="text-[9px] text-right text-gray-500 mt-1">
              Less ▬▬▬ More
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Tile({
  label,
  value,
  change,
}: {
  label: string;
  value: any;
  change: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col">
      <div className="text-[11px] text-gray-500">{label}</div>
      <div className="text-2xl text-indigo-700 font-semibold">{value}</div>
      <div className="text-[10px] text-emerald-600">{change}</div>
    </div>
  );
}