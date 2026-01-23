import { useEffect, useMemo, useRef, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  PieLabelRenderProps,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import ChartTooltip from "./ChartTooltip";

const COLORS = [
  "#7987FF", // blue
  "#F765A3", // pink
  "#FFA9D0", // light pink
  "#A155B9", // purple
];

type PieChartsProps = {
  data: any[];
  dataKey: string;
  nameKey: string;
};

function formatPieLabel({ value, percent }: PieLabelRenderProps) {
  return `${value} (${((percent as number) * 100).toFixed(0)}%)`;
}

const PieCharts = ({ data, dataKey, nameKey }: PieChartsProps) => {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;

      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const compact = useMemo(() => {
    // If we don't have a measurement yet, assume compact to avoid label overflow.
    if (!size.width || !size.height) return true;
    return size.width < 320 || size.height < 160;
  }, [size.width, size.height]);

  return (
    <div ref={wrapperRef} className="w-full h-full lg:p-4 overflow-visible">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey={dataKey}
            nameKey={nameKey}
            outerRadius={compact ? "65%" : "70%"}
            innerRadius={compact ? "45%" : "50%"}
            label={compact ? false : formatPieLabel}
            labelLine={compact ? false : true}
            cx="50%"
            cy="50%"
          >
            {data.map((_: any, index: number) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>

          <Tooltip content={<ChartTooltip hideZeroValues />} />

          <Legend
            verticalAlign="bottom"
            align="center"
            layout="horizontal"
            wrapperStyle={{ fontFamily: "Poppins, sans-serif" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PieCharts;