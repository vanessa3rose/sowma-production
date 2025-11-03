import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

type BarGraphsProps = {
  data: any[]; // define as array of integers
  dataKeys: string[]; // name of each bar label
  xAxisKey: string; // the x axis titles for the chart
};

const BarCharts = ({
  data,
  dataKeys,
  xAxisKey,
}: BarGraphsProps) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{ top: 20, right: 50, left: 20, bottom: 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey={xAxisKey}
          tick={{ fontFamily: "Poppins, sans-serif" }}
        />
        <YAxis />
        {dataKeys.map((key) => (
          <Bar key={key} dataKey={key} fill="#7987FF" />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};

export default BarCharts;
