import type { ReactNode } from "react";
import type { DateRangeValue } from "../charts/DateButton.js";
import type { ExportCardSelection } from "../../types/exportTypes";
import LineCharts from "../charts/LineCharts";
import PieCharts from "../charts/PieCharts";
import BarCharts from "../charts/BarCharts";
import MassachusettsCountyMap from "../maps/MassachusettsCountyMap";
import ReactECharts from "echarts-for-react";
import {
  EXPORT_PLATFORM_CONFIGS,
  type ExportMetricFormat,
} from "../../../scripts/export-pdf/exportMetricsConfig.js";
import type { Platform } from "../../config/chartConfigs";
import { COLORS } from "../../data/colors.js";

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
        return `Custom: ${fmt(range.start)} - ${fmt(range.end)}`;
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

function latestPointDate(
  chartDataMap: Record<string, { date: string; value: number }[]>,
) {
  const dates = Object.values(chartDataMap)
    .flat()
    .map((point) => point.date)
    .filter(Boolean)
    .sort();
  return dates.length ? dates[dates.length - 1] : null;
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
            backgroundColor: "white",
            border: "1px solid #E5E5E5",
            borderBottom: "3px solid #D1D5DB",
            borderRight: "2px solid #D1D5DB",
            borderRadius: "12px",
            padding: "20px",
            fontFamily: "Poppins, sans-serif",
          }}
        >
          <div style={{ fontWeight: 500, fontSize: "16px", color: "black" }}>
            {item.label}
          </div>
          <div
            style={{
              fontSize: "32px",
              fontWeight: 400,
              color: COLORS.SOWMA_LIGHT_BLUE,
              marginTop: "4px",
            }}
          >
            {item.value}
          </div>
          <div
            style={{
              fontSize: "14px",
              color: item.delta.includes("+")
                ? COLORS.SOWMA_BRIGHT_GREEN
                : item.delta.includes("-")
                  ? COLORS.SOWMA_BRIGHT_RED
                  : COLORS.SOWMA_GRAY,
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
        backgroundColor: "white",
        border: "1px solid #E5E5E5",
        borderBottom: "3px solid #D1D5DB",
        borderRight: "2px solid #D1D5DB",
        borderRadius: "12px",
        padding: "20px",
        fontFamily: "Poppins, sans-serif",
      }}
    >
      <div style={{ fontWeight: 500, fontSize: "16px", color: "black" }}>
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
  backgroundColor: "white",
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
      <div style={{ fontWeight: 500, fontSize: "16px", color: "black" }}>
        {title}
      </div>
      <div className="mt-1 flex items-baseline gap-2 flex-wrap">
        <span
          style={{
            fontSize: "32px",
            fontWeight: 400,
            color: COLORS.SOWMA_LIGHT_BLUE,
          }}
        >
          {value}
        </span>
        {valueNote ? (
          <span style={{ fontSize: "14px", color: COLORS.SOWMA_GRAY }}>
            {valueNote}
          </span>
        ) : null}
      </div>
      <div
        style={{
          fontSize: "14px",
          color: delta.includes("+")
            ? COLORS.SOWMA_BRIGHT_GREEN
            : delta.includes("-")
              ? COLORS.SOWMA_BRIGHT_RED
              : COLORS.SOWMA_GRAY,
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
        <div style={{ fontWeight: 500, fontSize: "16px", color: "black" }}>
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

function fmtN(n: number): string {
  return n.toLocaleString();
}

function buildCCSankeyOption(vals: Record<string, number>) {
  const sent = vals.EMAILS_SENT ?? 0;
  const delivered = vals.EMAILS_DELIVERED ?? 0;
  const bounced = vals.EMAIL_BOUNCED ?? 0;
  const opened = vals.EMAIL_OPENED ?? 0;
  const notOpened = vals.EMAIL_NOT_OPENED ?? 0;
  const clicked = vals.EMAILS_CLICKED ?? 0;
  const unsubscribed = vals.EMAILS_UNSUBSCRIBED ?? 0;
  const abuse = vals.EMAIL_ABUSE ?? 0;
  const forwarded = vals.EMAIL_FORWARDED ?? 0;

  type SankeyNode = { name: string; itemStyle: { color: string } };
  type SankeyLink = {
    source: string;
    target: string;
    value: number;
    lineStyle: { color: string; opacity: number };
  };

  const nodes: SankeyNode[] = [
    { name: `Sent\n${fmtN(sent)}`, itemStyle: { color: "#5B8FF9" } },
    { name: `Delivered\n${fmtN(delivered)}`, itemStyle: { color: "#9DC96A" } },
    { name: `Bounced\n${fmtN(bounced)}`, itemStyle: { color: "#C5C5C5" } },
    { name: `Opened\n${fmtN(opened)}`, itemStyle: { color: "#A78BFA" } },
    { name: `Not Opened\n${fmtN(notOpened)}`, itemStyle: { color: "#F472B6" } },
    { name: `Clicked\n${fmtN(clicked)}`, itemStyle: { color: "#60A5FA" } },
  ];

  const links: SankeyLink[] = [
    {
      source: `Sent\n${fmtN(sent)}`,
      target: `Delivered\n${fmtN(delivered)}`,
      value: delivered,
      lineStyle: { color: "#9DC96A", opacity: 0.35 },
    },
  ];

  if (bounced > 0)
    links.push({
      source: `Sent\n${fmtN(sent)}`,
      target: `Bounced\n${fmtN(bounced)}`,
      value: bounced,
      lineStyle: { color: "#C5C5C5", opacity: 0.35 },
    });
  if (opened > 0)
    links.push({
      source: `Delivered\n${fmtN(delivered)}`,
      target: `Opened\n${fmtN(opened)}`,
      value: opened,
      lineStyle: { color: "#A78BFA", opacity: 0.35 },
    });
  if (notOpened > 0)
    links.push({
      source: `Delivered\n${fmtN(delivered)}`,
      target: `Not Opened\n${fmtN(notOpened)}`,
      value: notOpened,
      lineStyle: { color: "#F472B6", opacity: 0.35 },
    });
  if (clicked > 0)
    links.push({
      source: `Opened\n${fmtN(opened)}`,
      target: `Clicked\n${fmtN(clicked)}`,
      value: clicked,
      lineStyle: { color: "#60A5FA", opacity: 0.35 },
    });
  if (unsubscribed > 0) {
    nodes.push({
      name: `Unsubscribed\n${fmtN(unsubscribed)}`,
      itemStyle: { color: "#FB923C" },
    });
    links.push({
      source: `Opened\n${fmtN(opened)}`,
      target: `Unsubscribed\n${fmtN(unsubscribed)}`,
      value: unsubscribed,
      lineStyle: { color: "#FB923C", opacity: 0.35 },
    });
  }
  if (abuse > 0) {
    nodes.push({
      name: `Spam\n${fmtN(abuse)}`,
      itemStyle: { color: "#F87171" },
    });
    links.push({
      source: `Delivered\n${fmtN(delivered)}`,
      target: `Spam\n${fmtN(abuse)}`,
      value: abuse,
      lineStyle: { color: "#F87171", opacity: 0.35 },
    });
  }
  if (forwarded > 0) {
    nodes.push({
      name: `Forwarded\n${fmtN(forwarded)}`,
      itemStyle: { color: "#34D399" },
    });
    links.push({
      source: `Opened\n${fmtN(opened)}`,
      target: `Forwarded\n${fmtN(forwarded)}`,
      value: forwarded,
      lineStyle: { color: "#34D399", opacity: 0.35 },
    });
  }

  return {
    tooltip: { trigger: "item", triggerOn: "mousemove" },
    series: [
      {
        type: "sankey",
        layout: "none",
        emphasis: { focus: "adjacency" },
        nodeWidth: 18,
        nodeGap: 28,
        left: "2%",
        right: "18%",
        top: "8%",
        bottom: "8%",
        data: nodes,
        links,
        label: {
          color: "#374151",
          fontFamily: "inherit",
          fontSize: 11,
          fontWeight: 500,
        },
        lineStyle: { curveness: 0.5 },
      },
    ],
  };
}

function mergeChartData(
  aPoints: { date: string; value: number }[],
  aKey: string,
  bPoints: { date: string; value: number }[],
  bKey: string,
): Record<string, unknown>[] {
  const map = new Map<string, Record<string, unknown>>();
  for (const p of aPoints) map.set(p.date, { date: p.date, [aKey]: p.value });
  for (const p of bPoints) {
    const existing = map.get(p.date);
    if (existing) existing[bKey] = p.value;
    else map.set(p.date, { date: p.date, [bKey]: p.value });
  }
  return Array.from(map.values()).sort((a, b) =>
    String(a.date).localeCompare(String(b.date)),
  );
}

function computeRatePoints(
  numerator: { date: string; value: number }[],
  denominator: { date: string; value: number }[],
  key: string,
): Record<string, unknown>[] {
  const denomMap = new Map(denominator.map((p) => [p.date, p.value]));
  return numerator.flatMap((p) => {
    const denom = denomMap.get(p.date) ?? 0;
    if (denom === 0) return [];
    return [{ date: p.date, [key]: Math.round((p.value / denom) * 1000) / 10 }];
  });
}

function ExportPage({
  children,
  widthClass = "w-[1000px]",
}: {
  children: ReactNode;
  widthClass?: string;
}) {
  return (
    <div
      data-export-page
      className={`${widthClass} bg-white px-6 py-6 font-sans text-gray-900`}
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
const LINKEDIN_SMALL_KPIS = [
  { id: "LIKES", title: "Reactions" },
  { id: "COMMENTS", title: "Comments" },
  { id: "SHARES", title: "Reposts" },
];
const LINKEDIN_EXPORT_CARD_HEIGHT = 195;
const LINKEDIN_EXPORT_PIE_HEIGHT = 190;
const LINKEDIN_KPI_CARD_HEIGHT = 102;
const LINKEDIN_KPI_ROW_HEIGHT = 332;

function LinkedInMiniMetricCard({
  title,
  value,
  delta,
  note,
}: {
  title: string;
  value: string;
  delta: string;
  note: string;
}) {
  return (
    <div
      style={{
        ...PDF_CARD_STYLE,
        padding: "14px 18px",
        minHeight: `${LINKEDIN_KPI_CARD_HEIGHT}px`,
        height: `${LINKEDIN_KPI_CARD_HEIGHT}px`,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: "3px",
          minHeight: "0",
        }}
      >
        <div style={{ fontWeight: 500, fontSize: "15px", color: "#000000" }}>
          {title}
        </div>
        <div
          style={{
            fontSize: "26px",
            fontWeight: 400,
            color: "#3B82F6",
            lineHeight: 1.05,
            wordBreak: "break-word",
          }}
        >
          {value}
        </div>
        <div
          style={{
            fontSize: "12px",
            lineHeight: 1.15,
            color: delta.includes("+")
              ? "#10B981"
              : delta.includes("-")
                ? "#EF4444"
                : "#6B7280",
          }}
        >
          {delta}
        </div>
        <div style={{ fontSize: "11px", lineHeight: 1.1, color: "#6B7280" }}>
          {note}
        </div>
      </div>
    </div>
  );
}

function normalizeBreakdownChartData(
  totals: Record<string, number> | undefined,
  formatter: (label: string) => string = toTitleCaseLabel,
) {
  return Object.entries(totals ?? {})
    .sort((a, b) => b[1] - a[1])
    .map(([label, value]) => ({
      label: formatter(label),
      value,
    }));
}

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
  const rangeLabel = getRangeLabel(range);

  return (
    <div className="bg-white">
      {selections.map((selection, index) => {
        if (selection.type === "google") {
          const metricSummaries = selection.data.metricSummaries;
          const chartDataMap = selection.data.chartDataMap;

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
                    <div
                      style={{
                        marginTop: "4px",
                        fontSize: "12px",
                        color: COLORS.SOWMA_GRAY,
                      }}
                    >
                      Delta values compare the latest point in range to the
                      previous available point (not always the previous calendar
                      day).
                    </div>
                    <div
                      style={{
                        marginTop: "4px",
                        fontSize: "12px",
                        color: COLORS.SOWMA_GRAY,
                      }}
                    >
                      Delta values compare the latest point in range to the
                      previous available point (not always the previous calendar
                      day).
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
                        className="-mb-2"
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

        if (platformKey === "constantcontact") {
          const chartDataMap = selection.data.chartDataMap;
          const latestDate = latestPointDate(chartDataMap);

          // Sankey totals — sum all points for each metric
          const ccSankeyVals: Record<string, number> = {};
          [
            "EMAILS_SENT",
            "EMAILS_DELIVERED",
            "EMAIL_BOUNCED",
            "EMAIL_OPENED",
            "EMAIL_NOT_OPENED",
            "EMAILS_CLICKED",
            "EMAILS_UNSUBSCRIBED",
            "EMAIL_ABUSE",
            "EMAIL_FORWARDED",
          ].forEach((key) => {
            ccSankeyVals[key] = (chartDataMap[key] ?? []).reduce(
              (s, p) => s + p.value,
              0,
            );
          });
          const ccSankeyOption = buildCCSankeyOption(ccSankeyVals);
          const hasSankeyData = ccSankeyVals.EMAILS_SENT > 0;

          const opensData = mergeChartData(
            chartDataMap.EMAIL_UNIQUE_OPENS ?? [],
            "uniqueOpens",
            chartDataMap.EMAIL_TOTAL_OPENS ?? [],
            "totalOpens",
          );
          const clicksData = mergeChartData(
            chartDataMap.EMAIL_UNIQUE_CLICKS ?? [],
            "uniqueClicks",
            chartDataMap.EMAIL_TOTAL_CLICKS ?? [],
            "totalClicks",
          );

          return (
            <div key={`${selection.type}-${index}`}>
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
                  </div>
                ) : null}

                <div className="text-3xl font-bold mb-2">Constant Contact</div>
                <div className="text-sm text-gray-600 mb-4">
                  Last updated: {latestDate ?? "No data"}
                </div>

                {/* Email Flow Sankey */}
                <GoogleChartCard
                  title="Email Flow"
                  subtitle={rangeLabel}
                  height={360}
                >
                  {hasSankeyData ? (
                    <ReactECharts
                      option={ccSankeyOption}
                      style={{ height: "100%", width: "100%" }}
                      opts={{ renderer: "svg" }}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-gray-500">
                      No data in range
                    </div>
                  )}
                </GoogleChartCard>

                {/* Opens vs Clicks comparison */}
                <div className="mt-3 grid grid-cols-2 gap-4">
                  <GoogleChartCard
                    title="Opens: Unique vs Total"
                    subtitle={rangeLabel}
                    height={200}
                  >
                    <LineCharts
                      data={opensData}
                      xAxisKey="date"
                      dataKeys={["uniqueOpens", "totalOpens"]}
                      showArea
                      compact
                    />
                  </GoogleChartCard>
                  <GoogleChartCard
                    title="Clicks: Unique vs Total"
                    subtitle={rangeLabel}
                    height={200}
                  >
                    <LineCharts
                      data={clicksData}
                      xAxisKey="date"
                      dataKeys={["uniqueClicks", "totalClicks"]}
                      showArea
                      compact
                    />
                  </GoogleChartCard>
                </div>
              </ExportPage>
            </div>
          );
        }

        if (platformKey === "linkedin") {
          // LinkedIn uses a page-specific PDF layout so the export mirrors
          // the live dashboard rather than the generic social template.
          const chartDataMap = selection.data.chartDataMap;
          const metricSummaries = selection.data.metricSummaries;
          const latestDate = latestPointDate(chartDataMap);
          const breakdownTotals = selection.data.breakdownTotals ?? {};

          const visitorDemographicData = normalizeBreakdownChartData(
            breakdownTotals.visitorIndustry,
          ).slice(0, 6);
          const followerDemographicData = normalizeBreakdownChartData(
            breakdownTotals.followerIndustry,
          ).slice(0, 6);
          const interactionMixData = [
            {
              label: "Reactions",
              value: (chartDataMap.LIKES ?? []).reduce(
                (sum, point) => sum + point.value,
                0,
              ),
            },
            {
              label: "Comments",
              value: (chartDataMap.COMMENTS ?? []).reduce(
                (sum, point) => sum + point.value,
                0,
              ),
            },
            {
              label: "Reposts",
              value: (chartDataMap.SHARES ?? []).reduce(
                (sum, point) => sum + point.value,
                0,
              ),
            },
          ];
          const engagementRateData = computeRatePoints(
            chartDataMap.TOTAL_INTERACTIONS ?? [],
            chartDataMap.VIEWS ?? [],
            "engagementRate",
          );

          return (
            <div key={`${selection.type}-${index}`}>
              <ExportPage widthClass="w-[1160px]">
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
                  </div>
                ) : null}

                <div className="text-3xl font-bold mb-2">LinkedIn</div>
                <div className="text-sm text-gray-600 mb-4">
                  Last updated: {latestDate ?? "No imported data"}
                </div>

                <div className="mt-3 flex gap-4">
                  <div className="w-1/3 flex flex-col gap-4">
                    {LINKEDIN_SMALL_KPIS.map((card) => {
                      const summary = metricSummaries[card.id] ?? {
                        current: 0,
                        prev: 0,
                      };
                      const delta =
                        (summary.current ?? 0) - (summary.prev ?? 0);
                      return (
                        <LinkedInMiniMetricCard
                          key={card.id}
                          title={card.title}
                          value={formatValue(summary.current ?? 0, "number")}
                          delta={formatDelta(delta, "number")}
                          note={`since ${latestDate ?? "N/A"}`}
                        />
                      );
                    })}
                  </div>

                  <div className="w-2/3">
                    <GoogleChartCard
                      title="Views"
                      subtitle={rangeLabel}
                      height={LINKEDIN_KPI_ROW_HEIGHT}
                    >
                      <LineCharts
                        data={chartDataMap.VIEWS ?? []}
                        xAxisKey="date"
                        dataKeys={["value"]}
                        showArea
                        compact
                      />
                    </GoogleChartCard>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-4">
                  <GoogleChartCard
                    title="Follower Demographics"
                    subtitle="Industry"
                    height={LINKEDIN_EXPORT_PIE_HEIGHT}
                  >
                    {followerDemographicData.length ? (
                      <div className="h-full [&_.recharts-default-legend]:!text-[8px] [&_.recharts-default-legend]:leading-tight [&_.recharts-legend-item-text]:!text-[8px] [&_.recharts-legend-item]:mr-1">
                        <PieCharts
                          data={followerDemographicData}
                          dataKey="value"
                          nameKey="label"
                          disableAnimation
                        />
                      </div>
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-gray-500">
                        No data in range
                      </div>
                    )}
                  </GoogleChartCard>

                  <GoogleChartCard
                    title="Interaction Mix"
                    subtitle={rangeLabel}
                    height={LINKEDIN_EXPORT_PIE_HEIGHT}
                  >
                    {interactionMixData.some((entry) => entry.value > 0) ? (
                      <PieCharts
                        data={interactionMixData}
                        dataKey="value"
                        nameKey="label"
                        disableAnimation
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-gray-500">
                        No data in range
                      </div>
                    )}
                  </GoogleChartCard>

                  <GoogleChartCard
                    title="Visitor Demographics"
                    subtitle="Industry"
                    height={LINKEDIN_EXPORT_PIE_HEIGHT}
                  >
                    {visitorDemographicData.length ? (
                      <div className="h-full [&_.recharts-default-legend]:!text-[8px] [&_.recharts-default-legend]:leading-tight [&_.recharts-legend-item-text]:!text-[8px] [&_.recharts-legend-item]:mr-1">
                        <PieCharts
                          data={visitorDemographicData}
                          dataKey="value"
                          nameKey="label"
                          disableAnimation
                        />
                      </div>
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-gray-500">
                        No data in range
                      </div>
                    )}
                  </GoogleChartCard>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-4">
                  <GoogleChartCard
                    title="Unique Visitors"
                    subtitle={rangeLabel}
                    height={LINKEDIN_EXPORT_CARD_HEIGHT}
                  >
                    <LineCharts
                      data={chartDataMap.TOTAL_USERS ?? []}
                      xAxisKey="date"
                      dataKeys={["value"]}
                      showArea
                      compact
                    />
                  </GoogleChartCard>

                  <GoogleChartCard
                    title="New Followers"
                    subtitle={rangeLabel}
                    height={LINKEDIN_EXPORT_CARD_HEIGHT}
                  >
                    <LineCharts
                      data={chartDataMap.FOLLOWERS ?? []}
                      xAxisKey="date"
                      dataKeys={["value"]}
                      showArea
                      compact
                    />
                  </GoogleChartCard>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-4">
                  <GoogleChartCard
                    title="Total Interactions"
                    subtitle={rangeLabel}
                    height={LINKEDIN_EXPORT_CARD_HEIGHT}
                  >
                    <LineCharts
                      data={chartDataMap.TOTAL_INTERACTIONS ?? []}
                      xAxisKey="date"
                      dataKeys={["value"]}
                      showArea
                      compact
                    />
                  </GoogleChartCard>

                  <GoogleChartCard
                    title="Engagement Rate"
                    subtitle={rangeLabel}
                    height={LINKEDIN_EXPORT_CARD_HEIGHT}
                  >
                    <LineCharts
                      data={engagementRateData}
                      xAxisKey="date"
                      dataKeys={["engagementRate"]}
                      showArea
                      compact
                    />
                  </GoogleChartCard>
                </div>
              </ExportPage>
            </div>
          );
        }

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
                      Generated {timestamp} - {rangeLabel}
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      Note: Metrics are daily values unless explicitly labeled
                      as cumulative.
                    </div>
                    <div
                      style={{
                        marginTop: "4px",
                        fontSize: "12px",
                        color: COLORS.SOWMA_GRAY,
                      }}
                    >
                      Delta values compare the latest point in range to the
                      previous available point (not always the previous calendar
                      day).
                    </div>
                    <div
                      style={{
                        marginTop: "4px",
                        fontSize: "12px",
                        color: COLORS.SOWMA_GRAY,
                      }}
                    >
                      Delta values compare the latest point in range to the
                      previous available point (not always the previous calendar
                      day).
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
