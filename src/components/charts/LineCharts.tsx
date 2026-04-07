import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import ChartTooltip from "./ChartTooltip";

import { COLORS } from "../../data/colors.js";
const PLATFORM_COLORS: Record<string, string> = {
  facebook: COLORS.SOWMA_LIGHT_BLUE,
  instagram: COLORS.SOWMA_GREEN,
  twitter: COLORS.SOWMA_DARK_BLUE,
};

const getSeriesColor = (key: string) => {
  const k = key.toLowerCase();

  if (k.includes("unique")) return COLORS.SOWMA_LIGHT_BLUE;
  if (k.includes("total")) return COLORS.SOWMA_GREEN;

  return PLATFORM_COLORS[k] || COLORS.SOWMA_LIGHT_BLUE;
};

type LineChartProps = {
  data: any[];
  xAxisKey: string;
  dataKeys: string[];
  labels?: Record<string, string>;
  showArea?: boolean;
  autoAdjustYAxis?: boolean;
  compact?: boolean;
};

const LineCharts = ({
  data,
  xAxisKey,
  dataKeys,
  labels,
  showArea,
  autoAdjustYAxis = true,
  compact = false,
}: LineChartProps) => {
  const series = labels
    ? Object.fromEntries(
        Object.entries(labels).map(([k, v]) => [k, { label: v }]),
      )
    : undefined;
  const values: number[] = [];
  if (autoAdjustYAxis) {
    data.forEach((row) => {
      dataKeys.forEach((key) => {
        const v = Number(row?.[key]);
        if (Number.isFinite(v)) values.push(v);
      });
    });
  }

  let yDomain: [number, number] | undefined;
  if (autoAdjustYAxis && values.length > 0) {
    const min = Math.min(...values);
    const max = Math.max(...values);
    const span = max - min;
    const spanRatio = max !== 0 ? span / Math.abs(max) : 0;
    const farFromZero = min > 0 && min / Math.max(1, max) > 0.5;
    if (spanRatio < 0.2 && farFromZero) {
      const pad = span > 0 ? span * 0.1 : Math.max(1, Math.abs(max) * 0.1);
      yDomain = [Math.floor(min - pad), Math.ceil(max + pad)];
    }
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      {showArea ? (
        <AreaChart
          data={data}
          margin={
            compact
              ? { top: 8, right: 12, left: 4, bottom: 24 }
              : { top: 20, right: 50, left: 20, bottom: 80 }
          }
        >
          <defs>
            {dataKeys.map((key) => {
              const color = getSeriesColor(key);
              return (
                <linearGradient
                  key={key}
                  id={`gradient-${key}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor={color} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={color} stopOpacity={0.05} />
                </linearGradient>
              );
            })}
          </defs>

          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey={xAxisKey}
            tick={{
              fontFamily: "Poppins, sans-serif",
              fontSize: compact ? 10 : 12,
            }}
            interval="preserveStartEnd"
            minTickGap={compact ? 14 : 28}
          />
          <YAxis
            tick={{
              fontFamily: "Poppins, sans-serif",
              fontSize: compact ? 10 : 12,
            }}
            domain={yDomain}
            allowDecimals={false}
          />
          <Tooltip content={<ChartTooltip series={series} />} />

          {dataKeys.map((key) => (
            <Area
              key={key}
              type="monotone"
              dataKey={key}
              stroke={getSeriesColor(key)}
              strokeWidth={compact ? 2.5 : 3}
              fill={`url(#gradient-${key})`}
              fillOpacity={1}
              connectNulls={false}
            />
          ))}
        </AreaChart>
      ) : (
        <LineChart
          data={data}
          margin={
            compact
              ? { top: 8, right: 12, left: 4, bottom: 24 }
              : { top: 20, right: 50, left: 20, bottom: 48 }
          }
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey={xAxisKey}
            tick={{
              fontFamily: "Poppins, sans-serif",
              fontSize: compact ? 10 : 12,
            }}
            interval="preserveStartEnd"
            minTickGap={compact ? 14 : 28}
          />
          <YAxis
            tick={{
              fontFamily: "Poppins, sans-serif",
              fontSize: compact ? 10 : 12,
            }}
            domain={yDomain}
            allowDecimals={false}
          />
          <Tooltip content={<ChartTooltip series={series} />} />
          {dataKeys.map((key) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={getSeriesColor(key)}
              strokeWidth={compact ? 2.5 : 3}
              dot={compact ? false : { r: 4 }}
              activeDot={false}
              connectNulls={false}
            />
          ))}
        </LineChart>
      )}
    </ResponsiveContainer>
  );
};

export default LineCharts;
