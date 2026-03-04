import type { ReactNode } from "react";
import type { DateRangeValue } from "../charts/DateButton.js";
import type { ExportCardSelection } from "../../types/exportTypes";
import LineCharts from "../charts/LineCharts";
import PieCharts from "../charts/PieCharts";
import BarCharts from "../charts/BarCharts";
import MassachusettsCountyMap from "../maps/MassachusettsCountyMap";
import {
  EXPORT_PLATFORM_CONFIGS,
  type ExportMetricFormat,
} from "../../../scripts/export-pdf/exportMetricsConfig.js";
import type { Platform } from "../../config/chartConfigs";

export type ExportReportViewProps = {
  selections: ExportCardSelection[];
  range: DateRangeValue;
};

function getRangeLabel(range: DateRangeValue) {
  switch (range.id) {
    case "7d":
      return "Last week";
    case "30d":
      return "Last month";
    case "1y":
      return "Last year";
    case "all":
      return "All time";
    case "custom":
      if (range.start && range.end) {
        const fmt = (d: Date) =>
          `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
        return `Custom: ${fmt(range.start)} – ${fmt(range.end)}`;
      }
      return "Custom Range";
    default:
      return "";
  }
}

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
    <div className="grid grid-cols-5 gap-4 w-full">
      {items.map((item) => (
        <div
          key={item.label}
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #E5E5E5",
            borderBottom: "3px solid #D1D5DB",
            borderRight: "2px solid #D1D5DB",
            borderRadius: "12px",
            padding: "20px",
            fontFamily: "Poppins, sans-serif",
          }}
        >
          <div style={{ fontWeight: 500, fontSize: "16px", color: "#000000" }}>
            {item.label}
          </div>
          <div
            style={{
              fontSize: "32px",
              fontWeight: 400,
              color: "#3B82F6",
              marginTop: "4px",
            }}
          >
            {item.value}
          </div>
          <div
            style={{
              fontSize: "14px",
              color: item.delta.includes("+")
                ? "#10B981"
                : item.delta.includes("-")
                  ? "#EF4444"
                  : "#6B7280",
              marginTop: "4px",
            }}
          >
            {item.delta}
          </div>
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
  data: Array<Record<string, unknown>>;
  dataKeys: string[];
}) {
  const hasData = Array.isArray(data) && data.length > 0;
  return (
    <div
      className="flex flex-col h-[200px]"
      style={{
        backgroundColor: "#ffffff",
        border: "1px solid #E5E5E5",
        borderBottom: "3px solid #D1D5DB",
        borderRight: "2px solid #D1D5DB",
        borderRadius: "12px",
        padding: "20px",
        fontFamily: "Poppins, sans-serif",
      }}
    >
      <div style={{ fontWeight: 500, fontSize: "16px", color: "#000000" }}>
        {title}
      </div>
      {hasData ? (
        <div className="flex w-full h-[200px] min-h-0">
          <LineCharts
            data={data}
            xAxisKey="date"
            dataKeys={dataKeys}
            showArea
            compact
          />
        </div>
      ) : (
        <div className="flex h-full items-center justify-center text-sm text-gray-500">
          No data in range
        </div>
      )}
    </div>
  );
}

const PDF_CARD_STYLE: React.CSSProperties = {
  backgroundColor: "#ffffff",
  border: "1px solid #E5E5E5",
  borderBottom: "3px solid #D1D5DB",
  borderRight: "2px solid #D1D5DB",
  borderRadius: "12px",
  padding: "20px",
  fontFamily: "Poppins, sans-serif",
};

function GoogleSmallMetricCard({
  title,
  value,
  valueNote,
  delta,
}: {
  title: string;
  value: string;
  valueNote?: string;
  delta: string;
}) {
  return (
    <div style={PDF_CARD_STYLE}>
      <div style={{ fontWeight: 500, fontSize: "16px", color: "#000000" }}>
        {title}
      </div>
      <div className="mt-1 flex items-baseline gap-2 flex-wrap">
        <span style={{ fontSize: "32px", fontWeight: 400, color: "#3B82F6" }}>
          {value}
        </span>
        {valueNote ? (
          <span style={{ fontSize: "14px", color: "#6B7280" }}>
            {valueNote}
          </span>
        ) : null}
      </div>
      <div
        style={{
          fontSize: "14px",
          color: delta.includes("+")
            ? "#10B981"
            : delta.includes("-")
              ? "#EF4444"
              : "#6B7280",
          marginTop: "4px",
        }}
      >
        {delta}
      </div>
    </div>
  );
}

function GoogleChartCard({
  title,
  subtitle,
  children,
  height = 220,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  height?: number;
}) {
  return (
    <div
      className="flex flex-col"
      style={{
        ...PDF_CARD_STYLE,
        minHeight: `${height}px`,
        height: `${height}px`,
      }}
    >
      <div className="flex items-center justify-between">
        <div style={{ fontWeight: 500, fontSize: "16px", color: "#000000" }}>
          {title}
        </div>
        {subtitle ? (
          <div style={{ fontSize: "12px", fontWeight: 500, color: "#4B5563" }}>
            {subtitle}
          </div>
        ) : null}
      </div>
      <div className="mt-2 flex-1 min-h-0">{children}</div>
    </div>
  );
}

function toCountyIntensity(countyTotals: Record<string, number>) {
  const total = Object.values(countyTotals).reduce(
    (sum, value) => sum + value,
    0,
  );
  if (total <= 0) return {};
  return Object.fromEntries(
    Object.entries(countyTotals).map(([county, value]) => [
      county,
      value / total,
    ]),
  ) as Record<string, number>;
}

function toTitleCaseLabel(input: string): string {
  return input.replace(/[A-Za-z]+/g, (word) => {
    if (word.length === 0) return word;
    return word[0].toUpperCase() + word.slice(1).toLowerCase();
  });
}

function groupSourceTotals(sourceTotals: Record<string, number>): Array<{
  source: string;
  sessions: number;
  otherBreakdown?: Array<{ label: string; value: number }>;
}> {
  const sorted = Object.entries(sourceTotals)
    .sort((a, b) => b[1] - a[1])
    .map(([source, sessions]) => ({
      source: toTitleCaseLabel(source),
      sessions,
    }));

  if (sorted.length <= 5) return sorted;

  const top = sorted.slice(0, 4);
  const otherItems = sorted.slice(4);
  const otherTotal = otherItems.reduce((sum, item) => sum + item.sessions, 0);

  return [
    ...top,
    {
      source: "Other",
      sessions: otherTotal,
      otherBreakdown: otherItems.map((item) => ({
        label: item.source,
        value: item.sessions,
      })),
    },
  ];
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

export default function e({ selections, range }: ExportReportViewProps) {
  const timestamp = new Date().toLocaleString();

  return (
    <div className="bg-white">
      {selections.map((selection, index) => {
        if (selection.type === "google") {
          const metricSummaries = selection.data.metricSummaries;
          const chartDataMap = selection.data.chartDataMap;
          const rangeLabel = RANGE_LABELS[range];

          const pageViewsSummary = metricSummaries.SCREEN_PAGE_VIEWS ?? {
            current: 0,
            prev: 0,
          };
          const active7Summary = metricSummaries.ACTIVE_7_DAY_USERS ?? {
            current: 0,
            prev: 0,
          };
          const engagementTimeSummary = metricSummaries.ENGAGEMENT_TIME ?? {
            current: 0,
            prev: 0,
          };
          const countyTotals = selection.data.countyTotals ?? {};
          const countyIntensity = toCountyIntensity(countyTotals);
          const countyTotal = Object.values(countyTotals).reduce(
            (sum, value) => sum + value,
            0,
          );

          const newVs = selection.data.newVsReturning ?? {
            newUsers: 0,
            returningUsers: 0,
          };
          const newVsData = [
            { label: "New Users", value: newVs.newUsers },
            { label: "Returning Users", value: newVs.returningUsers },
          ];

          const deviceData = Object.entries(
            selection.data.deviceTotals ?? {},
          ).map(([label, value]) => ({
            label:
              label.length > 0
                ? label[0].toUpperCase() + label.slice(1).toLowerCase()
                : "Unknown",
            value,
          }));
          const sourceData = groupSourceTotals(
            selection.data.sourceTotals ?? {},
          );

          return (
            <div key={`google-${index}`}>
              <ExportPage>
                {index === 0 ? (
                  <div className="mb-6 border-b border-gray-200 pb-4">
                    <div className="text-2xl font-semibold">
                      SOWMA Social Media Analytics Report
                    </div>
                    <div className="mt-1 text-sm text-gray-600">
                      Generated {timestamp} - {rangeLabel}
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      Note: Metrics are daily values unless explicitly labeled
                      as cumulative.
                    </div>
                    <div style={{ marginTop: "4px", fontSize: "12px", color: "#6B7280" }}>
                      Delta values compare the latest point in range to the previous available point (not always the previous calendar day).
                    </div>
                  </div>
                ) : null}

                <div className="text-3xl font-bold mb-4">Google Analytics</div>

                <div className="grid grid-cols-3 gap-4">
                  <GoogleSmallMetricCard
                    title="Page Views"
                    value={formatValue(pageViewsSummary.current ?? 0, "number")}
                    valueNote={
                      selection.data.pageViewsAsOf
                        ? `views (as of ${selection.data.pageViewsAsOf})`
                        : "views"
                    }
                    delta={formatDelta(
                      (pageViewsSummary.current ?? 0) -
                        (pageViewsSummary.prev ?? 0),
                      "number",
                    )}
                  />
                  <GoogleSmallMetricCard
                    title="Active 7-Day Users"
                    value={formatValue(active7Summary.current ?? 0, "number")}
                    valueNote="users (7D)"
                    delta={formatDelta(
                      (active7Summary.current ?? 0) -
                        (active7Summary.prev ?? 0),
                      "number",
                    )}
                  />
                  <GoogleSmallMetricCard
                    title="Avg Engagement Time"
                    value={formatValue(
                      engagementTimeSummary.current ?? 0,
                      "seconds",
                    )}
                    valueNote="seconds"
                    delta={formatDelta(
                      (engagementTimeSummary.current ?? 0) -
                        (engagementTimeSummary.prev ?? 0),
                      "seconds",
                    )}
                  />
                </div>

                <div className="mt-3 flex gap-4">
                  <div className="w-3/5">
                    <GoogleChartCard
                      title="Massachusetts Visitors by County"
                      subtitle={rangeLabel}
                      height={255}
                    >
                      <MassachusettsCountyMap
                        countyIntensity={countyIntensity}
                        countyValue={countyTotals}
                        totalValue={countyTotal}
                        valueLabel="Visitors"
                        intensityLabel="% of total"
                        showLegend={false}
                      />
                    </GoogleChartCard>
                  </div>
                  <div className="w-2/5">
                    <GoogleChartCard
                      title="New vs Returning Users"
                      subtitle={rangeLabel}
                      height={255}
                    >
                      <PieCharts
                        data={newVsData}
                        dataKey="value"
                        nameKey="label"
                        disableAnimation
                      />
                    </GoogleChartCard>
                  </div>
                </div>

                <div className="mt-3 flex gap-4">
                  <div className="w-2/5">
                    <GoogleChartCard
                      title="Sessions by Device Category"
                      subtitle={rangeLabel}
                      height={255}
                    >
                      <PieCharts
                        data={deviceData}
                        dataKey="value"
                        nameKey="label"
                        disableAnimation
                      />
                    </GoogleChartCard>
                  </div>
                  <div className="w-3/5">
                    <GoogleChartCard
                      title="Active Users"
                      subtitle={rangeLabel}
                      height={255}
                    >
                      <LineCharts
                        data={chartDataMap.ACTIVE_USERS ?? []}
                        xAxisKey="date"
                        dataKeys={["value"]}
                        showArea
                        compact
                      />
                    </GoogleChartCard>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-4">
                  <GoogleChartCard
                    title="Traffic Source Breakdown"
                    subtitle={rangeLabel}
                    height={270}
                  >
                    <BarCharts
                      data={sourceData}
                      xAxisKey="source"
                      dataKeys={["sessions"]}
                    />
                  </GoogleChartCard>
                  <GoogleChartCard
                    title="Engagement Rate"
                    subtitle={rangeLabel}
                    height={270}
                  >
                    <LineCharts
                      data={chartDataMap.ENGAGEMENT_RATE ?? []}
                      xAxisKey="date"
                      dataKeys={["value"]}
                      showArea
                      compact
                    />
                  </GoogleChartCard>
                </div>
              </ExportPage>
            </div>
          );
        }

        const platformKey = selection.platform as Platform;
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
                      Generated {timestamp} - {getRangeLabel(range)}
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      Note: Metrics are daily values unless explicitly labeled
                      as cumulative.
                    </div>
                    <div style={{ marginTop: "4px", fontSize: "12px", color: "#6B7280" }}>
                      Delta values compare the latest point in range to the previous available point (not always the previous calendar day).
                    </div>
                  </div>
                ) : null}

                <div className="text-3xl font-bold mb-6">{config.label}</div>
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
