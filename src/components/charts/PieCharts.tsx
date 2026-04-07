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

import { COLORS } from "../../data/colors.js";
const PIE_COLORS = [
  COLORS.SOWMA_LIGHT_BLUE,
  COLORS.SOWMA_GREEN,
  COLORS.SOWMA_LIGHT_GREEN,
  COLORS.SOWMA_DARK_GREEN,
];

type PieChartsProps = {
  data: any[];
  dataKey: string;
  nameKey: string;
  disableAnimation?: boolean;
};

function formatPieLabel({ value, percent }: PieLabelRenderProps) {
  return `${value} (${((percent as number) * 100).toFixed(0)}%)`;
}

const PieCharts = ({
  data,
  dataKey,
  nameKey,
  disableAnimation = false,
}: PieChartsProps) => {
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
    if (!size.width || !size.height) return true;
    return size.width < 320 || size.height < 160;
  }, [size.width, size.height]);

  const validData = data.filter((entry) => entry[dataKey] > 0);

  const tooltipSeries = Object.fromEntries(
    validData.map((entry, index) => [
      entry[nameKey],
      { color: PIE_COLORS[index % PIE_COLORS.length] },
    ]),
  );

  if (!validData.length) {
    return (
      <div
        ref={wrapperRef}
        className="w-full h-full flex items-center justify-center"
      >
        <p
          style={{ fontFamily: "Poppins, sans-serif" }}
          className="text-sm text-gray-400"
        >
          No data available
        </p>
      </div>
    );
  }

  return (
    <div ref={wrapperRef} className="w-full h-full lg:p-4 overflow-visible">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={validData}
            dataKey={dataKey}
            nameKey={nameKey}
            outerRadius={compact ? "65%" : "70%"}
            innerRadius={compact ? "45%" : "50%"}
            label={compact ? false : formatPieLabel}
            labelLine={compact ? false : true}
            cx="50%"
            cy="50%"
            isAnimationActive={!disableAnimation}
          >
            {validData.map((_: any, index: number) => (
              <Cell
                key={`cell-${index}`}
                fill={PIE_COLORS[index % PIE_COLORS.length]}
              />
            ))}
          </Pie>

          <Tooltip
            content={<ChartTooltip hideZeroValues series={tooltipSeries} />}
          />

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
