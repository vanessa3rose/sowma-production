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

const COLORS = ["#7987FF", "#F765A3", "#FFA9D0", "#A155B9"];

type LineChartProps = {
  data: any[];
  xAxisKey: string;
  dataKeys: string[];
  showArea?: boolean;
  autoAdjustYAxis?: boolean;
};

const LineCharts = ({
  data,
  xAxisKey,
  dataKeys,
  showArea,
  autoAdjustYAxis = true,
}: LineChartProps) => {
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
          margin={{ top: 20, right: 50, left: 20, bottom: 80 }}
        >
          <defs>
            {dataKeys.map((key, index) => (
              <linearGradient
                key={key}
                id={`gradient-${key}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor={COLORS[index % COLORS.length]}
                  stopOpacity={0.4}
                />
                <stop
                  offset="95%"
                  stopColor={COLORS[index % COLORS.length]}
                  stopOpacity={0.05}
                />
              </linearGradient>
            ))}
          </defs>

          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey={xAxisKey}
            tick={{ fontFamily: "Poppins, sans-serif" }}
            interval="preserveStartEnd"
            minTickGap={28}
          />
          <YAxis
            tick={{ fontFamily: "Poppins, sans-serif" }}
            domain={yDomain}
          />
          <Tooltip content={<ChartTooltip />} />

          {dataKeys.map((key, index) => (
            <Area
              key={key}
              type="monotone"
              dataKey={key}
              stroke={COLORS[index % COLORS.length]}
              strokeWidth={3}
              fill={`url(#gradient-${key})`}
              fillOpacity={1}
            />
          ))}
        </AreaChart>
      ) : (
        <LineChart
          data={data}
          margin={{ top: 20, right: 50, left: 20, bottom: 48 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey={xAxisKey}
            tick={{ fontFamily: "Poppins, sans-serif" }}
            interval="preserveStartEnd"
            minTickGap={28}
          />
          <YAxis
            tick={{ fontFamily: "Poppins, sans-serif" }}
            domain={yDomain}
          />
          <Tooltip content={<ChartTooltip />} />
          {dataKeys.map((key, index) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={COLORS[index % COLORS.length]}
              strokeWidth={3}
              dot={{ r: 4 }}
              activeDot={false}
            />
          ))}
        </LineChart>
      )}
    </ResponsiveContainer>
  );
};

export default LineCharts;
