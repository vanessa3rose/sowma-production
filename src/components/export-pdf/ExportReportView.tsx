import type { ReactNode } from "react";
import type { DateRangeId } from "../charts/DateDropdown";
import type { ExportCardSelection } from "../../types/exportTypes";
import LineCharts from "../charts/LineCharts";
import {
  EXPORT_PLATFORM_CONFIGS,
  type ExportMetricFormat,
} from "./exportMetricsConfig";
import type { Platform } from "../../config/chartConfigs";

export type ExportReportViewProps = {
  selections: ExportCardSelection[];
  range: DateRangeId;
};

const RANGE_LABELS: Record<DateRangeId, string> = {
  "7d": "Last week",
  "30d": "Last month",
  "1y": "Last year",
  all: "All time",
};

function formatNumber(value: number, digits = 0) {
  if (!Number.isFinite(value)) return "0";
  return value.toLocaleString(undefined, {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  });
}

function formatSigned(value: number, digits = 0) {
  const sign = value > 0 ? "+" : "";
  return `${sign}${formatNumber(value, digits)}`;
}

function normalizePercent(value: number | null | undefined) {
  if (value == null || !Number.isFinite(value)) return 0;
  return value <= 1 ? value * 100 : value;
}

function formatValue(value: number, format?: ExportMetricFormat) {
  if (format === "percent") {
    return `${formatNumber(normalizePercent(value), 1)}%`;
  }
  if (format === "decimal") {
    return formatNumber(value, 2);
  }
  if (format === "seconds") {
    return `${formatNumber(value, 0)}s`;
  }
  return formatNumber(value, 0);
}

function formatDelta(delta: number, format?: ExportMetricFormat) {
  if (format === "percent") {
    return `${formatSigned(normalizePercent(delta), 1)}pp`;
  }
  if (format === "decimal") {
    return formatSigned(delta, 2);
  }
  if (format === "seconds") {
    return `${formatSigned(delta, 0)}s`;
  }
  return formatSigned(delta, 0);
}

function MetricRow({
  items,
}: {
  items: { label: string; value: string; delta: string }[];
}) {
  return (
    <div className="flex flex-wrap gap-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="min-w-[170px] rounded-lg border border-gray-200 bg-white px-4 py-3"
        >
          <div className="text-xs uppercase tracking-wide text-gray-500">
            {item.label}
          </div>
          <div className="mt-1 text-lg font-semibold text-gray-900">
            {item.value}
          </div>
          <div className="text-xs text-gray-500">Delta {item.delta}</div>
        </div>
      ))}
    </div>
  );
}

function ChartBlock({
  title,
  data,
  dataKeys,
}: {
  title: string;
  data: any[];
  dataKeys: string[];
}) {
  const hasData = Array.isArray(data) && data.length > 0;
  return (
    <div className="mt-4">
      <div className="text-sm font-semibold text-gray-800">{title}</div>
      <div className="mt-2 h-48 w-full rounded-md border border-gray-200 p-3">
        {hasData ? (
          <LineCharts
            data={data}
            xAxisKey="date"
            dataKeys={dataKeys}
            showArea
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-gray-500">
            No data in range
          </div>
        )}
      </div>
    </div>
  );
}

function ExportPage({ children }: { children: ReactNode }) {
  return (
    <div
      data-export-page
      className="w-[1000px] bg-white px-8 py-6 font-sans text-gray-900"
    >
      {children}
    </div>
  );
}

type PageChunk<T> = {
  charts: T[];
  includeMetrics: boolean;
};

const PAGE_MAX_HEIGHT_PX = 980;
const REPORT_HEADER_HEIGHT_PX = 90;
const PLATFORM_HEADER_HEIGHT_PX = 60;
const KPI_BLOCK_HEIGHT_PX = 140;
const CHARTS_PER_ROW = 2;
const CHART_ROW_HEIGHT_PX = 220;

function buildChartPages<T>(
  charts: T[],
  includeMetrics: boolean,
  includeHeader: boolean,
): PageChunk<T>[] {
  const pages: PageChunk<T>[] = [];
  let current: PageChunk<T> = { charts: [], includeMetrics };
  let used =
    PLATFORM_HEADER_HEIGHT_PX +
    (includeMetrics ? KPI_BLOCK_HEIGHT_PX : 0) +
    (includeHeader ? REPORT_HEADER_HEIGHT_PX : 0);

  for (let i = 0; i < charts.length; i += CHARTS_PER_ROW) {
    if (
      used + CHART_ROW_HEIGHT_PX > PAGE_MAX_HEIGHT_PX &&
      current.charts.length > 0
    ) {
      pages.push(current);
      current = { charts: [], includeMetrics: false };
      used = PLATFORM_HEADER_HEIGHT_PX;
    }
    current.charts.push(...charts.slice(i, i + CHARTS_PER_ROW));
    used += CHART_ROW_HEIGHT_PX;
  }

  if (current.charts.length > 0 || current.includeMetrics) {
    pages.push(current);
  }

  return pages;
}

export default function ExportReportView({
  selections,
  range,
}: ExportReportViewProps) {
  const timestamp = new Date().toLocaleString();

  return (
    <div className="bg-white">
      {selections.map((selection, index) => {
        const platformKey =
          selection.type === "google"
            ? "google"
            : (selection.platform as Platform);
        const config = EXPORT_PLATFORM_CONFIGS[platformKey];

        const metrics = config.metrics.map((metric) => {
          const summary = selection.data.metricSummaries[metric.id];
          const current = summary?.current ?? 0;
          const prev = summary?.prev ?? 0;
          const delta = current - prev;
          return {
            label: metric.label,
            value: formatValue(current, metric.format),
            delta: formatDelta(delta, metric.format),
          };
        });

        const chartChunks = buildChartPages(config.charts, true, index === 0);

        return (
          <div key={`${selection.type}-${index}`}>
            {chartChunks.map((chunk, chunkIndex) => (
              <ExportPage key={`${config.platform}-chunk-${chunkIndex}`}>
                {index === 0 && chunkIndex === 0 ? (
                  <div className="mb-6 border-b border-gray-200 pb-4">
                    <div className="text-2xl font-semibold">
                      SOWMA Social Media Analytics Report
                    </div>
                    <div className="mt-1 text-sm text-gray-600">
                      Generated {timestamp} - {RANGE_LABELS[range]}
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      Note: Metrics are daily values unless explicitly labeled
                      as cumulative.
                    </div>
                  </div>
                ) : null}

                <div className="text-xl font-semibold">{config.label}</div>
                {chunk.includeMetrics ? (
                  <div className="mt-4">
                    <MetricRow items={metrics} />
                  </div>
                ) : null}

                <div className="mt-4 grid grid-cols-2 gap-4">
                  {chunk.charts.map((chart) => (
                    <ChartBlock
                      key={`${config.platform}-${chart.metricId}`}
                      title={chart.title ?? chart.metricId}
                      data={selection.data.chartDataMap[chart.metricId] ?? []}
                      dataKeys={["value"]}
                    />
                  ))}
                </div>
              </ExportPage>
            ))}
          </div>
        );
      })}
    </div>
  );
}
