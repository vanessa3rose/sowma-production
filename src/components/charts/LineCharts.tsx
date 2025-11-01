import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = [
  "#7987FF", // blue
  "#F765A3", // pink
  "#FFA9D0", // light pink
  "#A155B9", // purple
];

type LineChartProps = {
  data: any[];
  width: number | "100%" | "auto";
  height: number | "100%" | "auto";
  xAxisKey: string;
  dataKeys: string[];
  showArea?: boolean;
};

const LineCharts = ({
  data,
  width,
  height,
  xAxisKey,
  dataKeys,
  showArea,
}: LineChartProps) => {
  return (
    <ResponsiveContainer width={width as number | "100%" | "auto"} height={height as number | "100%" | "auto"}>
      {showArea ? (
        <AreaChart
          data={data}
          margin={{ top: 20, right: 50, left: 20, bottom: 20 }}
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
          />
          <YAxis tick={{ fontFamily: "Poppins, sans-serif" }} />
          <Legend wrapperStyle={{ fontFamily: "Poppins, sans-serif" }} />

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
          margin={{ top: 20, right: 50, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey={xAxisKey}
            tick={{ fontFamily: "Poppins, sans-serif" }}
          />
          <YAxis tick={{ fontFamily: "Poppins, sans-serif" }} />
          <Legend wrapperStyle={{ fontFamily: "Poppins, sans-serif" }} />

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