// src/components/export-pdf/GoogleExportCard.tsx

import { GoogleAnalyticsExportData } from "../../types/exportTypes";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
} from "recharts";

interface Props {
  data: GoogleAnalyticsExportData;
}

export default function GoogleExportCard({ data }: Props) {
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
        boxSizing: "border-box",
      }}
      className="font-sans"
    >
      <div className="text-3xl font-bold text-black">Google</div>

      {/* KPI Tiles */}
      <div className="grid grid-cols-4 gap-4">
        <Tile label="Users" value={data.users} change={data.usersChangeLabel} />
        <Tile
          label="Bounce Rate"
          value={`${data.bounceRate}%`}
          change={data.bounceRateChangeLabel}
        />
        <Tile
          label="Session Time"
          value={`${data.sessionTimeMinutes} min`}
          change={data.sessionTimeChangeLabel}
        />
        <Tile
          label="Pages/Session"
          value={data.pagesPerSession}
          change={data.pagesPerSessionChangeLabel}
        />
      </div>

      {/* Middle Row */}
      <div className="flex gap-4 flex-1">
        {/* New vs Returning (Fake donut using bar expand) */}
        <div className="bg-white rounded-xl shadow-sm p-4 flex-1 flex flex-col">
          <div className="text-sm font-semibold mb-2">New vs Returning Users</div>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="95%">
              <BarChart
                data={[
                  { key: "New", value: data.newUsersPct },
                  { key: "Returning", value: data.returningUsersPct },
                ]}
                stackOffset="expand"
              >
                <Bar dataKey="value" stackId="a" radius={9999} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Traffic Source Bar */}
        <div className="bg-white rounded-xl shadow-sm p-4 flex-[2] flex flex-col">
          <div className="text-sm font-semibold mb-2">
            Traffic Source Breakdown
          </div>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.trafficSources}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="flex gap-4 h-[150px]">
        {/* Top pages */}
        <div className="bg-white rounded-xl shadow-sm p-4 flex-1 flex flex-col">
          <div className="text-xs font-semibold mb-2">Top Pages</div>

          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.topPages}>
              <XAxis dataKey="label" tick={{ fontSize: 9 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Impressions Trend */}
        <div className="bg-white rounded-xl shadow-sm p-4 flex-1 flex flex-col">
          <div className="text-sm font-semibold mb-1">Impressions</div>
          <div className="text-2xl text-indigo-600 font-bold">
            {data.impressions[data.impressions.length - 1]?.value ?? 0}
          </div>

          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.impressions}>
              <XAxis dataKey="year" tick={{ fontSize: 10 }} />
              <YAxis />
              <Tooltip />
              <Line dataKey="value" strokeWidth={2} dot={false} />
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
  change: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-2xl font-semibold text-indigo-700">{value}</div>
      <div className="text-[10px] text-emerald-600 mt-1">{change}</div>
    </div>
  );
}