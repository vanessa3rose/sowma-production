import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { useMemo } from "react";

import ChartTooltip from "./ChartTooltip";

type OtherBreakdownItem = {
  label: string;
  value: number;
};

type BarDataRow = {
  [key: string]: unknown;
  otherBreakdown?: OtherBreakdownItem[];
};

type BarGraphsProps = {
  data: BarDataRow[]; // define as array of integers
  dataKeys: string[]; // name of each bar label
  xAxisKey: string; // the x axis titles for the chart
};

const BarCharts = ({ data, dataKeys, xAxisKey }: BarGraphsProps) => {
  const yAxisWidth = useMemo(() => {
    const labels = data
      .map((row) => String(row?.[xAxisKey] ?? ""))
      .filter((label) => label.length > 0);
    if (labels.length === 0) return 90;

    const font = "12px Poppins, sans-serif";
    let maxWidth = 0;

    if (typeof document !== "undefined") {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.font = font;
        for (const label of labels) {
          maxWidth = Math.max(maxWidth, ctx.measureText(label).width);
        }
      }
    }

    if (maxWidth === 0) {
      const longest = labels.reduce(
        (max, label) => Math.max(max, label.length),
        0,
      );
      maxWidth = longest * 7.2;
    }

    return Math.min(180, Math.max(80, Math.ceil(maxWidth) + 12));
  }, [data, xAxisKey]);

  const leftMargin = Math.max(16, yAxisWidth - 64);

  const tooltipContent = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: ReadonlyArray<{
      payload?: BarDataRow;
      name?: string;
      dataKey?: string;
      value?: unknown;
      color?: string;
      fill?: string;
    }>;
    label?: unknown;
  }) => {
    if (!active) return null;

    const row = payload?.[0]?.payload;
    const otherBreakdown = row?.otherBreakdown;
    const isOtherBar = String(label ?? "") === "Other";

    if (!isOtherBar || !otherBreakdown || otherBreakdown.length === 0) {
      return <ChartTooltip active={active} payload={payload} label={label} />;
    }

    return (
      <div className="min-w-[180px] rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-md font-[Poppins] text-sm">
        <div className="mb-2 text-xs font-semibold text-gray-800">
          {String(label)}
        </div>
        <div className="mb-2 text-xs text-gray-700">
          Total:{" "}
          <span className="font-semibold text-gray-900">
            {Number(row?.[dataKeys[0]] ?? 0).toLocaleString()}
          </span>
        </div>
        <div className="border-t border-gray-100 pt-2">
          <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
            Includes
          </div>
          <div className="flex max-h-40 flex-col gap-1 overflow-y-auto">
            {otherBreakdown.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between gap-3"
              >
                <span className="truncate text-xs text-gray-700">
                  {item.label}
                </span>
                <span className="shrink-0 text-xs font-semibold text-gray-900">
                  {item.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        layout="vertical"
        data={data}
        margin={{ top: 20, right: 24, left: leftMargin, bottom: 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" tick={{ fontFamily: "Poppins, sans-serif" }} />
        <YAxis
          type="category"
          dataKey={xAxisKey}
          width={yAxisWidth}
          tick={{ fontFamily: "Poppins, sans-serif", fontSize: 12 }}
        />
        <Tooltip content={tooltipContent} />
        {dataKeys.map((key) => (
          <Bar key={key} dataKey={key} fill="#7987FF" />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};

export default BarCharts;
