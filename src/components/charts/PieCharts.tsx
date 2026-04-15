import { useEffect, useMemo, useRef, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  PieLabelRenderProps,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import ChartTooltip from "./ChartTooltip";

import { COLORS } from "../../data/colors.js";
const PIE_COLORS = [
  COLORS.SOWMA_BLUE,
  COLORS.SOWMA_GREEN,
  COLORS.SOWMA_LIGHT_GREEN,
  COLORS.SOWMA_DARK_BLUE,
  COLORS.SOWMA_DARK_GREEN,
];

type PieChartsProps = {
  data: any[];
  dataKey: string;
  nameKey: string;
  disableAnimation?: boolean;
  flushLegendLayout?: boolean;
};

const LEGEND_MAX_FONT_SIZE = 20;
const LEGEND_MIN_FONT_SIZE = 15;
const LEGEND_SWATCH_RATIO = 0.72;
const LEGEND_GAP_X_RATIO = 0.8;
const LEGEND_GAP_Y_RATIO = 0.35;
const LEGEND_SWATCH_GAP_RATIO = 0.5;
const LEGEND_ROW_HEIGHT_RATIO = 1.0;

function formatPieLabel({ value, percent }: PieLabelRenderProps) {
  return `${value} (${((percent as number) * 100).toFixed(0)}%)`;
}

function estimateLegendTextWidth(label: string, fontSize: number) {
  if (typeof document !== "undefined") {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (context) {
      context.font = `500 ${fontSize}px Poppins, sans-serif`;
      return context.measureText(label).width;
    }
  }

  return label.length * fontSize * 0.48;
}

function getLegendRows(
  items: Array<{ color: string; label: string }>,
  legendWidth: number,
  fontSize: number,
  useEqualSlots = false,
) {
  const swatchSize = fontSize * LEGEND_SWATCH_RATIO;
  const swatchGap = fontSize * LEGEND_SWATCH_GAP_RATIO;
  const gapX = fontSize * LEGEND_GAP_X_RATIO;

  return items.reduce<
    Array<
      Array<{ color: string; label: string; width: number; textWidth: number }>
    >
  >(
    (rows, item) => {
      const maxTextWidth = Math.max(0, legendWidth - swatchSize - swatchGap);
      const textWidth = Math.min(
        estimateLegendTextWidth(item.label, fontSize),
        maxTextWidth,
      );
      const itemWidth = swatchSize + swatchGap + textWidth;
      const currentRow = rows[rows.length - 1];
      const nextRow = [...currentRow, { ...item, width: itemWidth, textWidth }];
      const currentWidth = currentRow.reduce(
        (sum, rowItem, index) => sum + rowItem.width + (index > 0 ? gapX : 0),
        0,
      );
      const nextSlotWidth = legendWidth / nextRow.length;
      const nextFitsEqualSlots = nextRow.every(
        (rowItem) => rowItem.width <= nextSlotWidth,
      );

      if (
        currentRow.length > 0 &&
        (currentWidth + gapX + itemWidth > legendWidth ||
          (useEqualSlots && !nextFitsEqualSlots))
      ) {
        rows.push([{ ...item, width: itemWidth, textWidth }]);
      } else {
        currentRow.push({ ...item, width: itemWidth, textWidth });
      }

      return rows;
    },
    [[]],
  );
}

const PieCharts = ({
  data,
  dataKey,
  nameKey,
  disableAnimation = false,
  flushLegendLayout = false,
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
  const legendItems = validData.map((entry, index) => ({
    color: PIE_COLORS[index % PIE_COLORS.length],
    label: String(entry[nameKey]),
  }));
  const legendWidth = Math.max(size.width, 1);
  const avgLabelLength =
    legendItems.reduce((sum, item) => sum + item.label.length, 0) /
    Math.max(legendItems.length, 1);
  const densityFontSize =
    legendWidth /
    Math.max(legendItems.length * (avgLabelLength * 0.58 + 2.6), 1);
  const legendFontSize = Math.max(
    LEGEND_MIN_FONT_SIZE,
    Math.min(LEGEND_MAX_FONT_SIZE, densityFontSize),
  );
  const legendSwatchSize = legendFontSize * LEGEND_SWATCH_RATIO;
  const legendSwatchGap = legendFontSize * LEGEND_SWATCH_GAP_RATIO;
  const legendGapX = legendFontSize * LEGEND_GAP_X_RATIO;
  const legendGapY = legendFontSize * LEGEND_GAP_Y_RATIO;
  const legendRowHeight = legendFontSize * LEGEND_ROW_HEIGHT_RATIO;
  const legendRows = getLegendRows(
    legendItems,
    legendWidth,
    legendFontSize,
    flushLegendLayout,
  );
  const legendHeight =
    legendRows.length * legendRowHeight +
    Math.max(0, legendRows.length - 1) * legendGapY;

  const tooltipSeries = Object.fromEntries(
    validData.map((entry, index) => [
      entry[nameKey],
      {
        color: PIE_COLORS[index % PIE_COLORS.length],
        description: entry.tooltipDetails,
      },
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
    <div
      ref={wrapperRef}
      className={
        flushLegendLayout
          ? "w-full h-full overflow-visible"
          : "w-full h-full lg:p-4 -mt-4 overflow-visible"
      }
    >
      <div
        className="grid h-full w-full overflow-visible"
        style={{
          gridTemplateRows: `minmax(0, 1fr) ${legendHeight}px`,
          transform: flushLegendLayout ? "translateY(8px)" : undefined,
        }}
      >
        <div
          className="min-h-0"
          style={{
            gridRow: 1,
          }}
        >
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
            </PieChart>
          </ResponsiveContainer>
        </div>

        <svg
          className="recharts-default-legend"
          width={legendWidth}
          height={legendHeight}
          role="img"
          aria-label="Pie chart legend"
          style={{
            display: "block",
            gridRow: 2,
            overflow: "visible",
          }}
        >
          {legendRows.flatMap((row, rowIndex) => {
            const rowWidth = row.reduce(
              (sum, item, itemIndex) =>
                sum + item.width + (itemIndex > 0 ? legendGapX : 0),
              0,
            );
            let x = Math.max(0, (legendWidth - rowWidth) / 2);
            const centerY =
              rowIndex * (legendRowHeight + legendGapY) + legendRowHeight / 2;

            return row.map((item, itemIndex) => {
              const slotWidth = legendWidth / row.length;
              const itemX = flushLegendLayout
                ? itemIndex * slotWidth +
                  Math.max(0, (slotWidth - item.width) / 2)
                : x;
              x += item.width + legendGapX;

              return (
                <g
                  key={`${item.label}-${rowIndex}-${itemX}`}
                  className="recharts-legend-item"
                >
                  <rect
                    x={itemX}
                    y={centerY - legendSwatchSize / 2 - legendFontSize * 0.04}
                    width={legendSwatchSize}
                    height={legendSwatchSize}
                    fill={item.color}
                  />
                  <text
                    className="recharts-legend-item-text"
                    x={itemX + legendSwatchSize + legendSwatchGap}
                    y={centerY}
                    fill={item.color}
                    dominantBaseline="middle"
                    fontFamily="Poppins, sans-serif"
                    fontSize={legendFontSize}
                    fontWeight={500}
                    textLength={item.textWidth}
                    lengthAdjust="spacingAndGlyphs"
                  >
                    {item.label}
                  </text>
                </g>
              );
            });
          })}
        </svg>
      </div>
    </div>
  );
};

export default PieCharts;
