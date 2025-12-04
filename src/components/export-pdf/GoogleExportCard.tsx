// src/components/export-pdf/GoogleExportCard.tsx

import { GoogleAnalyticsExportBundle } from "../../types/exportTypes";
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
  BarChart,
  Bar,
} from "recharts";

interface Props {
  data: GoogleAnalyticsExportBundle;
}

export default function GoogleExportCard({ data }: Props) {
  return (
    <div
      style={{
        width: "1000px",
        minHeight: "900px",
        backgroundColor: "#F8FAFC",
        padding: "24px",
        borderRadius: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        boxSizing: "border-box",
      }}
      className="font-sans"
    >
      <div className="text-4xl font-bold text-black">Google</div>

      {/* ===== Top KPI Row ===== */}
      <div className="grid grid-cols-4 gap-4">
        <Tile label="Active Users" value={data.metrics.activeUsers} change="" />
        <Tile label="Page Views" value={data.metrics.screenPageViews} change="" />
        <Tile label="7-Day Users" value={data.metrics.active7DayUsers} change="" />
        <Tile
          label="Engagement Rate"
          value={`${(data.metrics.engagementRate * 100).toFixed(1)}%`}
          change=""
        />
      </div>

      {/* ===== Middle Row ===== */}
      <div className="flex gap-4 flex-1">
        {/* New vs Returning Pie */}
        <div className="bg-white rounded-xl shadow-sm p-4 flex-1 flex flex-col">
          <div className="text-sm font-semibold mb-2">New vs Returning Users</div>

          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.returningVsNew}
                dataKey="value"
                nameKey="label"
                innerRadius="60%"
                outerRadius="85%"
                paddingAngle={2}
              >
                {data.returningVsNew.map((_, i) => (
                  <Cell
                    key={i}
                    fill={["#4F46E5", "#EC4899"][i % 2]} // explicit export colors
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Active Users Trend Line */}
        <div className="bg-white rounded-xl shadow-sm p-4 flex-[2] flex flex-col">
          <div className="text-sm font-semibold mb-2">Active Users (trend)</div>

          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.usersOverTime}>
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="activeUsers"
                stroke="#4F46E5"         // EXPLICIT COLOR
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ===== Bottom Row ===== */}
      <div className="flex gap-4 h-[250px]">
        {/* Pageviews Trend */}
        <div className="bg-white rounded-xl shadow-sm p-4 flex-1 flex flex-col">
          <div className="text-xs font-semibold mb-2">Pageviews</div>

          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.pageviewsOverTime}>
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="screenPageViews"
                stroke="#10B981"         // EXPLICIT COLOR
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Engagement Trend */}
        <div className="bg-white rounded-xl shadow-sm p-4 flex-1 flex flex-col">
          <div className="text-sm font-semibold mb-1">7-Day Users Trend</div>

          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.usersOverTime}>
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="active7DayUsers"
                stroke="#6366F1"        // EXPLICIT COLOR
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
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
  change?: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-2xl font-semibold text-indigo-700">{value}</div>
      {change && (
        <div className="text-[10px] text-emerald-600 mt-1">{change}</div>
      )}
    </div>
  );
}