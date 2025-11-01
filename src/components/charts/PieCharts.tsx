import {
  PieChart,
  Pie,
  Cell,
  Legend,
  PieLabelRenderProps,
  ResponsiveContainer,
} from "recharts";

const COLORS = [
  "#7987FF", // blue
  "#F765A3", // pink
  "#FFA9D0", // light pink
  "#A155B9", // purple
];

type PieChartsProps = {
  data: any[];
  width: number | `${number}%`;
  height: number | `${number}%`;
  dataKey: string;
  nameKey: string;
};

const PieCharts = ({
  data,
  width,
  height,
  dataKey,
  nameKey,
}: PieChartsProps) => {
  return (
    <div className="w-full h-full p-4 overflow-visible">
      <ResponsiveContainer width={width} height={height}>
        <PieChart>
          <Pie
            data={data}
            dataKey={dataKey}
            nameKey={nameKey}
            outerRadius="35%"
            innerRadius="25%"
            label={({ value, percent }: PieLabelRenderProps) =>
              `${value} (${((percent as number) * 100).toFixed(0)}%)`
            }
            cx="50%"
            cy="50%"
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Legend
            verticalAlign="middle"
            align="right"
            layout="vertical"
            wrapperStyle={{ fontFamily: "Poppins, sans-serif" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PieCharts;