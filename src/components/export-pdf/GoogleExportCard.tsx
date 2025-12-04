// src/components/export-pdf/GoogleExportCard.tsx
import { GoogleAnalyticsExportBundle } from "../../types/exportTypes";
import LineCharts from "../charts/LineCharts";

interface Props {
  data: GoogleAnalyticsExportBundle;
}

export default function GoogleExportCard({ data }: Props) {
  return (
    <div
      style={{
        width: "1000px",
        minHeight: "900px",
        background: "#F8FAFC",
        padding: "24px",
        borderRadius: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        boxSizing: "border-box",
      }}
      className="font-sans"
    >
      <h1 className="text-4xl font-bold">Google</h1>

      {/* KPI ROW */}
      <div className="grid grid-cols-4 gap-4">
        <Tile label="Active Users" value={data.metrics.activeUsers} />
        <Tile label="Page Views" value={data.metrics.screenPageViews} />
        <Tile label="7-Day Users" value={data.metrics.active7DayUsers} />
        <Tile
          label="Engagement Rate"
          value={`${(data.metrics.engagementRate * 100).toFixed(1)}%`}
        />
      </div>

      {/* MIDDLE ROW */}
      <div className="flex gap-4 h-[350px]">
        {/* Pie: New vs Returning (CUSTOM SVG DONUT FOR PDF) */}
        <div className="bg-white rounded-xl shadow-sm p-4 w-1/3 flex flex-col h-full">
          <div className="text-sm font-semibold mb-2">
            New vs Returning Users
          </div>
          <div className="flex-1 min-h-[250px]">
            <ExportDonut data={data.returningVsNew} />
          </div>
        </div>

        {/* Line: Active Users */}
        <div className="bg-white rounded-xl shadow-sm p-4 w-2/3 flex flex-col">
          <div className="text-sm font-semibold mb-2">Active Users (trend)</div>
          <LineCharts
            data={data.usersOverTime}
            xAxisKey="date"
            dataKeys={["activeUsers"]}
            showArea
          />
        </div>
      </div>

      {/* BOTTOM ROW */}
      <div className="flex gap-4 h-[350px]">
        <div className="bg-white rounded-xl shadow-sm p-4 w-1/2 flex flex-col">
          <div className="text-sm font-semibold mb-2">Pageviews</div>
          <LineCharts
            data={data.pageviewsOverTime}
            xAxisKey="date"
            dataKeys={["screenPageViews"]}
            showArea
          />
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 w-1/2 flex flex-col">
          <div className="text-sm font-semibold mb-2">7-Day Users Trend</div>
          <LineCharts
            data={data.usersOverTime}
            xAxisKey="date"
            dataKeys={["active7DayUsers"]}
            showArea
          />
        </div>
      </div>
    </div>
  );
}

function Tile({ label, value }: { label: string; value: any }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-2xl font-semibold text-indigo-700">{value}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Custom SVG donut just for the PDF export card                     */
/* ------------------------------------------------------------------ */

const PIE_COLORS = ["#7987FF", "#F765A3", "#FFA9D0", "#A155B9"];

type DonutDatum = { label: string; value: number };

function ExportDonut({ data }: { data: DonutDatum[] }) {
  const total = data.reduce((sum, d) => sum + (d.value || 0), 0);

  if (total <= 0) {
    return (
      <div className="flex items-center justify-center h-full text-xs text-gray-500">
        No data
      </div>
    );
  }

  // SVG viewBox 0 0 200 200
  const cx = 100;
  const cy = 100;
  const outerR = 70;
  const innerR = 45;

  let currentAngle = -90; // start at top

  const slices = data.map((d, idx) => {
    const fraction = (d.value || 0) / total;
    const sweep = fraction * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + sweep;
    currentAngle = endAngle;

    const path = describeDonutSlice(cx, cy, innerR, outerR, startAngle, endAngle);

    return {
      path,
      color: PIE_COLORS[idx % PIE_COLORS.length],
      label: d.label,
      value: d.value,
    };
  });

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <svg
        viewBox="0 0 200 200"
        width="100%"
        height="100%"
        style={{ maxHeight: "260px" }}
      >
        {slices.map((s, i) => (
          <path key={i} d={s.path} fill={s.color} stroke="#ffffff" strokeWidth={1} />
        ))}
      </svg>

      {/* Simple legend under the donut */}
      <div className="mt-2 flex flex-col gap-1 text-[10px]">
        {slices.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <span
              className="inline-block w-3 h-3 rounded-sm"
              style={{ backgroundColor: s.color }}
            />
            <span>{s.label}</span>
            <span className="text-gray-500">
              {total > 0
                ? `${s.value} (${Math.round((s.value / total) * 100)}%)`
                : `${s.value}`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Build an SVG path for a donut slice between startAngle and endAngle (degrees)
 * with inner and outer radius.
 */
function describeDonutSlice(
  cx: number,
  cy: number,
  innerR: number,
  outerR: number,
  startAngle: number,
  endAngle: number
): string {
  const startOuter = polarToCartesian(cx, cy, outerR, endAngle);
  const endOuter = polarToCartesian(cx, cy, outerR, startAngle);
  const startInner = polarToCartesian(cx, cy, innerR, startAngle);
  const endInner = polarToCartesian(cx, cy, innerR, endAngle);

  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  return [
    "M",
    startOuter.x,
    startOuter.y,
    "A",
    outerR,
    outerR,
    0,
    largeArcFlag,
    0,
    endOuter.x,
    endOuter.y,
    "L",
    startInner.x,
    startInner.y,
    "A",
    innerR,
    innerR,
    0,
    largeArcFlag,
    1,
    endInner.x,
    endInner.y,
    "Z",
  ].join(" ");
}

function polarToCartesian(
  cx: number,
  cy: number,
  r: number,
  angleDeg: number
): { x: number; y: number } {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180.0;
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy + r * Math.sin(angleRad),
  };
}