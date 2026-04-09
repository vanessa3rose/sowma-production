import { useEffect, useMemo, useState } from "react";
import ReactECharts from "echarts-for-react";

import BigCard from "../../components/cards/BigCard";
import LineCharts from "../../components/charts/LineCharts";
import DateDropdown, {
  DateRangeValue,
} from "../../components/charts/DateButton";
import ExportButton from "../../components/export-pdf/ExportButton";
import { useGlobalPageExporter } from "../../components/export-pdf/GlobalPageExportProvider";
import { fetchMetrics, SocialMediaMetric } from "../../utils/fetchMetrics";

/* ---------- types ---------- */

type LinePoint = { date: string; value: number };
type MetricSummary = { current: number | null; prev: number | null };

type MetricConfig = {
  id: string;
  title: string;
  metric: string;
  description: string;
};

/* ---------- config ---------- */

const PROVIDER = "CONSTANT_CONTACT";
const DEFAULT_START_DATE = "2020-01-01";
const DEFAULT_END_DATE = "3000-01-01";

const METRICS: MetricConfig[] = [
  {
    id: "emails_sent",
    title: "Emails Sent",
    metric: "EMAILS_SENT",
    description: "Total unique emails sent across all campaigns",
  },
  {
    id: "emails_delivered",
    title: "Emails Delivered",
    metric: "EMAILS_DELIVERED",
    description: "Emails that reached the inbox (sent minus bounced)",
  },
  {
    id: "email_opened",
    title: "Emails Opened",
    metric: "EMAIL_OPENED",
    description: "Unique recipients who opened the email",
  },
  {
    id: "emails_clicked",
    title: "Emails Clicked",
    metric: "EMAILS_CLICKED",
    description: "Unique recipients who clicked a link in the email",
  },
  {
    id: "emails_unsubscribed",
    title: "Unsubscribed",
    metric: "EMAILS_UNSUBSCRIBED",
    description: "Recipients who opted out of future emails",
  },
  {
    id: "email_bounced",
    title: "Bounced",
    metric: "EMAIL_BOUNCED",
    description: "Emails that could not be delivered",
  },
  {
    id: "email_forwarded",
    title: "Forwarded",
    metric: "EMAIL_FORWARDED",
    description: "Recipients who forwarded the email",
  },
  {
    id: "email_not_opened",
    title: "Not Opened",
    metric: "EMAIL_NOT_OPENED",
    description: "Recipients who received but did not open the email",
  },
  {
    id: "email_abuse",
    title: "Abuse / Spam",
    metric: "EMAIL_ABUSE",
    description: "Recipients who marked the email as spam",
  },
  {
    id: "email_unique_opens",
    title: "Unique Opens",
    metric: "EMAIL_UNIQUE_OPENS",
    description: "Number of unique recipients who opened each campaign",
  },
  {
    id: "email_total_opens",
    title: "Total Opens",
    metric: "EMAIL_TOTAL_OPENS",
    description: "Total number of times emails were opened, including re-opens",
  },
  {
    id: "email_unique_clicks",
    title: "Unique Clicks",
    metric: "EMAIL_UNIQUE_CLICKS",
    description: "Number of unique recipients who clicked a link",
  },
  {
    id: "email_total_clicks",
    title: "Total Clicks",
    metric: "EMAIL_TOTAL_CLICKS",
    description: "Total number of link clicks, including repeat clicks",
  },
];

const CHART_IDS = [
  "emails_sent",
  "emails_delivered",
  "emails_unsubscribed",
  "email_bounced",
  "email_abuse",
];

/* ---------- helpers ---------- */

function sortByDate(raw: SocialMediaMetric[]): SocialMediaMetric[] {
  return raw
    .filter((m) => m.metricDate || m.lastSynced)
    .slice()
    .sort((a, b) =>
      (a.metricDate ?? a.lastSynced)!.localeCompare(
        (b.metricDate ?? b.lastSynced)!,
      ),
    );
}

function toLinePoints(raw: SocialMediaMetric[]): LinePoint[] {
  return sortByDate(raw).map((m) => {
    const ts = (m.metricDate ?? m.lastSynced)!;
    return { date: ts.slice(0, 10), value: m.metricValue };
  });
}

function summarizeSeries(points: LinePoint[]): MetricSummary {
  if (!points.length) return { current: null, prev: null };
  if (points.length === 1) return { current: points[0].value, prev: null };
  return {
    current: points[points.length - 1].value,
    prev: points[points.length - 2].value,
  };
}

function formatPercentChange(summary?: MetricSummary | null): string {
  if (
    !summary ||
    summary.current == null ||
    summary.prev == null ||
    summary.prev === 0
  ) {
    return "+ 0%";
  }
  const pct = ((summary.current - summary.prev) / summary.prev) * 100;
  return `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}% vs. prev.`;
}

function getBounds(pts: LinePoint[]) {
  if (!pts.length)
    return { min: null as Date | null, max: null as Date | null };
  const dates = pts
    .map((p) => p.date)
    .slice()
    .sort();
  return { min: new Date(dates[0]), max: new Date(dates[dates.length - 1]) };
}

function filterByRange(pts: LinePoint[], range: DateRangeValue): LinePoint[] {
  if (!pts.length || range.id === "all") return pts;

  if (range.id === "custom" && range.start && range.end) {
    const startStr = range.start.toISOString().slice(0, 10);
    const endStr = range.end.toISOString().slice(0, 10);
    return pts.filter((p) => p.date >= startStr && p.date <= endStr);
  }

  const end = new Date(pts[pts.length - 1].date);
  const start = new Date(end);
  if (range.id === "7d") start.setDate(start.getDate() - 6);
  if (range.id === "30d") start.setDate(start.getDate() - 29);
  if (range.id === "1y") start.setFullYear(start.getFullYear() - 1);

  const startStr = start.toISOString().slice(0, 10);
  const endStr = end.toISOString().slice(0, 10);
  return pts.filter((p) => p.date >= startStr && p.date <= endStr);
}

function toRateSeries(
  numerator: LinePoint[],
  denominator: LinePoint[],
): LinePoint[] {
  const denomMap = new Map(denominator.map((p) => [p.date, p.value]));
  return numerator.flatMap((p) => {
    const denom = denomMap.get(p.date) ?? 0;
    if (denom === 0) return [];
    return [{ date: p.date, value: Math.round((p.value / denom) * 1000) / 10 }];
  });
}

function mergeByDate(
  aPoints: LinePoint[],
  aKey: string,
  bPoints: LinePoint[],
  bKey: string,
): Record<string, number | string>[] {
  const map = new Map<string, Record<string, number | string>>();
  for (const p of aPoints) {
    map.set(p.date, { date: p.date, [aKey]: p.value });
  }
  for (const p of bPoints) {
    const existing = map.get(p.date);
    if (existing) existing[bKey] = p.value;
    else map.set(p.date, { date: p.date, [bKey]: p.value });
  }
  return Array.from(map.values()).sort((a, b) =>
    String(a.date).localeCompare(String(b.date)),
  );
}

/* ---------- Sankey helpers ---------- */

function fmt(n: number): string {
  return n.toLocaleString();
}

type SankeyNode = { name: string; itemStyle: { color: string } };
type SankeyLink = {
  source: string;
  target: string;
  value: number;
  lineStyle: { color: string; opacity: number };
};

function buildSankeyOption(vals: Record<string, number>) {
  const sent = vals.emails_sent ?? 0;
  const delivered = vals.emails_delivered ?? 0;
  const bounced = vals.email_bounced ?? 0;
  const opened = vals.email_opened ?? 0;
  const notOpened = vals.email_not_opened ?? 0;
  const clicked = vals.emails_clicked ?? 0;
  const unsubscribed = vals.emails_unsubscribed ?? 0;
  const abuse = vals.email_abuse ?? 0;
  const forwarded = vals.email_forwarded ?? 0;

  const nodes: SankeyNode[] = [
    { name: `Sent\n${fmt(sent)}`, itemStyle: { color: "#5B8FF9" } },
    { name: `Delivered\n${fmt(delivered)}`, itemStyle: { color: "#9DC96A" } },
    { name: `Bounced\n${fmt(bounced)}`, itemStyle: { color: "#C5C5C5" } },
    { name: `Opened\n${fmt(opened)}`, itemStyle: { color: "#A78BFA" } },
    { name: `Not Opened\n${fmt(notOpened)}`, itemStyle: { color: "#F472B6" } },
    { name: `Clicked\n${fmt(clicked)}`, itemStyle: { color: "#60A5FA" } },
  ];

  const links: SankeyLink[] = [
    {
      source: `Sent\n${fmt(sent)}`,
      target: `Delivered\n${fmt(delivered)}`,
      value: delivered,
      lineStyle: { color: "#9DC96A", opacity: 0.35 },
    },
  ];

  if (bounced > 0) {
    links.push({
      source: `Sent\n${fmt(sent)}`,
      target: `Bounced\n${fmt(bounced)}`,
      value: bounced,
      lineStyle: { color: "#C5C5C5", opacity: 0.35 },
    });
  }
  if (opened > 0) {
    links.push({
      source: `Delivered\n${fmt(delivered)}`,
      target: `Opened\n${fmt(opened)}`,
      value: opened,
      lineStyle: { color: "#A78BFA", opacity: 0.35 },
    });
  }
  if (notOpened > 0) {
    links.push({
      source: `Delivered\n${fmt(delivered)}`,
      target: `Not Opened\n${fmt(notOpened)}`,
      value: notOpened,
      lineStyle: { color: "#F472B6", opacity: 0.35 },
    });
  }
  if (clicked > 0) {
    links.push({
      source: `Opened\n${fmt(opened)}`,
      target: `Clicked\n${fmt(clicked)}`,
      value: clicked,
      lineStyle: { color: "#60A5FA", opacity: 0.35 },
    });
  }
  if (unsubscribed > 0) {
    nodes.push({
      name: `Unsubscribed\n${fmt(unsubscribed)}`,
      itemStyle: { color: "#FB923C" },
    });
    links.push({
      source: `Opened\n${fmt(opened)}`,
      target: `Unsubscribed\n${fmt(unsubscribed)}`,
      value: unsubscribed,
      lineStyle: { color: "#FB923C", opacity: 0.35 },
    });
  }
  if (abuse > 0) {
    nodes.push({
      name: `Spam\n${fmt(abuse)}`,
      itemStyle: { color: "#F87171" },
    });
    links.push({
      source: `Delivered\n${fmt(delivered)}`,
      target: `Spam\n${fmt(abuse)}`,
      value: abuse,
      lineStyle: { color: "#F87171", opacity: 0.35 },
    });
  }
  if (forwarded > 0) {
    nodes.push({
      name: `Forwarded\n${fmt(forwarded)}`,
      itemStyle: { color: "#34D399" },
    });
    links.push({
      source: `Opened\n${fmt(opened)}`,
      target: `Forwarded\n${fmt(forwarded)}`,
      value: forwarded,
      lineStyle: { color: "#34D399", opacity: 0.35 },
    });
  }

  return {
    tooltip: {
      trigger: "item",
      triggerOn: "mousemove",
      formatter: (params: {
        dataType: string;
        data: {
          source?: string;
          target?: string;
          value?: number;
          name?: string;
        };
      }) => {
        if (params.dataType === "edge") {
          const src = params.data.source?.split("\n")[0] ?? "";
          const tgt = params.data.target?.split("\n")[0] ?? "";
          return `${src} → ${tgt}: <strong>${fmt(params.data.value ?? 0)}</strong>`;
        }
        return `<strong>${params.data.name?.replace("\n", ": ")}</strong>`;
      },
    },
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
          fontSize: 12,
          fontWeight: 500,
        },
        lineStyle: { curveness: 0.5 },
      },
    ],
  };
}

/* ---------- component ---------- */

const ALL_RANGE: DateRangeValue = { id: "all" };
const DEFAULT_RANGE: DateRangeValue = { id: "30d" };

export default function ConstantContactPage() {
  const { exportByPlatforms } = useGlobalPageExporter();

  const [rawSeries, setRawSeries] = useState<Record<string, LinePoint[]>>({});
  const [ranges, setRanges] = useState<Record<string, DateRangeValue>>(() => {
    const init: Record<string, DateRangeValue> = {};
    METRICS.forEach((m) => (init[m.id] = DEFAULT_RANGE));
    return init;
  });
  const [sankeyRange, setSankeyRange] = useState<DateRangeValue>(ALL_RANGE);
  const [opensRange, setOpensRange] = useState<DateRangeValue>(ALL_RANGE);
  const [clicksRange, setClicksRange] = useState<DateRangeValue>(ALL_RANGE);
  const [openRateRange, setOpenRateRange] = useState<DateRangeValue>(ALL_RANGE);
  const [ctorRange, setCtorRange] = useState<DateRangeValue>(ALL_RANGE);
  const [deliveryRateRange, setDeliveryRateRange] =
    useState<DateRangeValue>(ALL_RANGE);

  useEffect(() => {
    async function load() {
      try {
        const results = await Promise.all(
          METRICS.map((cfg) =>
            fetchMetrics({
              provider: PROVIDER,
              metric: cfg.metric,
              startDate: DEFAULT_START_DATE,
              endDate: DEFAULT_END_DATE,
            }).then((rows) => ({ cfg, rows })),
          ),
        );
        const nextRaw: Record<string, LinePoint[]> = {};
        for (const { cfg, rows } of results) {
          nextRaw[cfg.id] = toLinePoints(rows);
        }
        setRawSeries(nextRaw);
      } catch (err) {
        console.error("Error loading Constant Contact metrics:", err);
      }
    }
    load();
  }, []);

  const computed = useMemo(() => {
    return METRICS.reduce(
      (acc, cfg) => {
        const full = rawSeries[cfg.id] ?? [];
        const filtered = filterByRange(full, ranges[cfg.id] ?? DEFAULT_RANGE);
        const summary = summarizeSeries(filtered);
        const bounds = getBounds(full);
        acc[cfg.id] = { full, filtered, summary, bounds };
        return acc;
      },
      {} as Record<
        string,
        {
          full: LinePoint[];
          filtered: LinePoint[];
          summary: MetricSummary;
          bounds: { min: Date | null; max: Date | null };
        }
      >,
    );
  }, [rawSeries, ranges]);

  // Sankey: sum all values over the selected sankeyRange
  const sankeyVals = useMemo(() => {
    const v: Record<string, number> = {};
    METRICS.forEach((cfg) => {
      const filtered = filterByRange(rawSeries[cfg.id] ?? [], sankeyRange);
      v[cfg.id] = filtered.reduce((sum, p) => sum + p.value, 0);
    });
    return v;
  }, [rawSeries, sankeyRange]);

  const sankeyBounds = getBounds(rawSeries["emails_sent"] ?? []);
  const hasSankeyData = sankeyVals.emails_sent > 0;

  // Opens comparison: Unique vs Total
  const opensData = useMemo(() => {
    const unique = filterByRange(
      rawSeries["email_unique_opens"] ?? [],
      opensRange,
    );
    const total = filterByRange(
      rawSeries["email_total_opens"] ?? [],
      opensRange,
    );
    return mergeByDate(unique, "uniqueOpens", total, "totalOpens");
  }, [rawSeries, opensRange]);

  const opensBounds = getBounds([
    ...(rawSeries["email_unique_opens"] ?? []),
    ...(rawSeries["email_total_opens"] ?? []),
  ]);
  // hi
  // Clicks comparison: Unique vs Total
  const clicksData = useMemo(() => {
    const unique = filterByRange(
      rawSeries["email_unique_clicks"] ?? [],
      clicksRange,
    );
    const total = filterByRange(
      rawSeries["email_total_clicks"] ?? [],
      clicksRange,
    );
    return mergeByDate(unique, "uniqueClicks", total, "totalClicks");
  }, [rawSeries, clicksRange]);

  const clicksBounds = getBounds([
    ...(rawSeries["email_unique_clicks"] ?? []),
    ...(rawSeries["email_total_clicks"] ?? []),
  ]);

  // Open Rate %: opened / delivered * 100
  const openRateData = useMemo(() => {
    const delivered = filterByRange(
      rawSeries["emails_delivered"] ?? [],
      openRateRange,
    );
    const opened = filterByRange(
      rawSeries["email_opened"] ?? [],
      openRateRange,
    );
    return toRateSeries(opened, delivered).map((p) => ({
      date: p.date,
      openRate: p.value,
    }));
  }, [rawSeries, openRateRange]);

  const openRateBounds = getBounds([
    ...(rawSeries["emails_delivered"] ?? []),
    ...(rawSeries["email_opened"] ?? []),
  ]);

  // Delivery Rate %: delivered / sent * 100
  const deliveryRateData = useMemo(() => {
    const sent = filterByRange(
      rawSeries["emails_sent"] ?? [],
      deliveryRateRange,
    );
    const delivered = filterByRange(
      rawSeries["emails_delivered"] ?? [],
      deliveryRateRange,
    );
    return toRateSeries(delivered, sent).map((p) => ({
      date: p.date,
      deliveryRate: p.value,
    }));
  }, [rawSeries, deliveryRateRange]);

  const deliveryRateBounds = getBounds([
    ...(rawSeries["emails_sent"] ?? []),
    ...(rawSeries["emails_delivered"] ?? []),
  ]);

  // Click-to-Open Rate %: clicked / opened * 100
  const ctorData = useMemo(() => {
    const opened = filterByRange(rawSeries["email_opened"] ?? [], ctorRange);
    const clicked = filterByRange(rawSeries["emails_clicked"] ?? [], ctorRange);
    return toRateSeries(clicked, opened).map((p) => ({
      date: p.date,
      ctorRate: p.value,
    }));
  }, [rawSeries, ctorRange]);

  const ctorBounds = getBounds([
    ...(rawSeries["email_opened"] ?? []),
    ...(rawSeries["emails_clicked"] ?? []),
  ]);

  return (
    <div className="w-full min-h-screen bg-white flex flex-col gap-4 px-4 py-2">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between lg:items-center">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => (window.location.href = "/")}
            className="w-[40px] h-[40px] flex items-center justify-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="size-7"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5 8.25 12l7.5-7.5"
              />
            </svg>
          </button>
          <h1 className="font-poppins font-semibold text-3xl lg:text-4xl">
            Constant Contact
          </h1>
        </div>
        <div className="flex flex-row justify-center items-center mt-2 lg:mt-0 space-x-4">
          <a
            href="https://app.constantcontact.com"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-[15px] border border-[#0A86D9] px-4 py-1.5 text-[#0A86D9] font-poppins font-semibold inline-block"
          >
            Go to Account
          </a>
          <ExportButton onExport={exportByPlatforms} />
        </div>
      </div>

      <div className="flex flex-col gap-4 px-4">
        {/* ── Email Flow Sankey — first ── */}
        <div className="w-full rounded-2xl border border-gray-100 bg-white shadow-sm p-6">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h2 className="font-poppins font-semibold text-lg text-gray-800">
                Email Flow
              </h2>
              <p className="text-sm text-gray-400 mt-0.5">
                End-to-end journey from sent to final action
              </p>
            </div>
            <DateDropdown
              value={sankeyRange}
              onChange={setSankeyRange}
              minDate={sankeyBounds.min}
              maxDate={sankeyBounds.max}
            />
          </div>
          {hasSankeyData ? (
            <ReactECharts
              option={buildSankeyOption(sankeyVals)}
              style={{ height: 520, width: "100%" }}
              opts={{ renderer: "svg" }}
            />
          ) : (
            <div className="flex items-center font-poppins justify-center h-64 text-gray-400 text-sm">
              No data available
            </div>
          )}
        </div>

        {/* ── Open Rate % + CTOR % ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <BigCard
            title="Open Rate %"
            data={openRateData}
            titleTooltip="Percentage of delivered emails that were opened (Opened ÷ Delivered × 100)"
            subtitle={
              <DateDropdown
                value={openRateRange}
                onChange={setOpenRateRange}
                minDate={openRateBounds.min}
                maxDate={openRateBounds.max}
              />
            }
            chart={
              <div className="w-full h-full">
                <LineCharts
                  data={openRateData}
                  xAxisKey="date"
                  dataKeys={["openRate"]}
                  showArea
                />
              </div>
            }
            displayMode="chart-only"
            className="w-full h-[360px]"
          />

          <BigCard
            title="Click-to-Open Rate %"
            data={ctorData}
            titleTooltip="Of people who opened, the percentage who clicked a link (Clicked ÷ Opened × 100)"
            subtitle={
              <DateDropdown
                value={ctorRange}
                onChange={setCtorRange}
                minDate={ctorBounds.min}
                maxDate={ctorBounds.max}
              />
            }
            chart={
              <div className="w-full h-full">
                <LineCharts
                  data={ctorData}
                  xAxisKey="date"
                  dataKeys={["ctorRate"]}
                  showArea
                />
              </div>
            }
            displayMode="chart-only"
            className="w-full h-[360px]"
          />
        </div>

        {/* ── Opens + Clicks comparison ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <BigCard
            title="Opens: Unique vs Total"
            data={opensData}
            titleTooltip="Unique Opens (purple) shows distinct openers; Total Opens (pink) includes re-opens"
            subtitle={
              <DateDropdown
                value={opensRange}
                onChange={setOpensRange}
                minDate={opensBounds.min}
                maxDate={opensBounds.max}
              />
            }
            chart={
              <div className="w-full h-full">
                <LineCharts
                  data={opensData}
                  xAxisKey="date"
                  dataKeys={["uniqueOpens", "totalOpens"]}
                  showArea
                />
              </div>
            }
            displayMode="chart-only"
            className="w-full h-[360px]"
          />

          <BigCard
            title="Clicks: Unique vs Total"
            data={clicksData}
            titleTooltip="Unique Clicks (purple) shows distinct clickers; Total Clicks (pink) includes repeat clicks"
            subtitle={
              <DateDropdown
                value={clicksRange}
                onChange={setClicksRange}
                minDate={clicksBounds.min}
                maxDate={clicksBounds.max}
              />
            }
            chart={
              <div className="w-full h-full">
                <LineCharts
                  data={clicksData}
                  xAxisKey="date"
                  dataKeys={["uniqueClicks", "totalClicks"]}
                  showArea
                />
              </div>
            }
            displayMode="chart-only"
            className="w-full h-[360px]"
          />
        </div>

        {/* ── Individual metric line charts ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {CHART_IDS.map((id) => {
            const cfg = METRICS.find((m) => m.id === id)!;
            const item = computed[id];
            const filtered = item?.filtered ?? [];
            const bounds = item?.bounds ?? { min: null, max: null };
            const summary = item?.summary ?? { current: null, prev: null };
            
            return (
              <BigCard
                key={id}
                data={filtered}
                title={cfg.title}
                titleTooltip={cfg.description}
                subtitle={
                  <DateDropdown
                    value={ranges[id] ?? DEFAULT_RANGE}
                    onChange={(r) =>
                      setRanges((prev) => ({ ...prev, [id]: r }))
                    }
                    minDate={bounds.min}
                    maxDate={bounds.max}
                  />
                }
                metricValue={summary.current ?? 0}
                metricLabel="total"
                metricChange={formatPercentChange(summary)}
                chart={
                  <div className="w-full h-full">
                    <LineCharts
                      data={filtered}
                      xAxisKey="date"
                      dataKeys={["value"]}
                      showArea
                    />
                  </div>
                }
                displayMode="both"
                className="w-full h-[360px]"
              />
            );
          })}

          <BigCard
            title="Delivery Rate %"
            data={deliveryRateData}
            subtitle={
              <DateDropdown
                value={deliveryRateRange}
                onChange={setDeliveryRateRange}
                minDate={deliveryRateBounds.min}
                maxDate={deliveryRateBounds.max}
              />
            }
            chart={
              <div className="w-full h-full">
                <LineCharts
                  data={deliveryRateData}
                  xAxisKey="date"
                  dataKeys={["deliveryRate"]}
                  showArea
                />
              </div>
            }
            displayMode="chart-only"
            className="w-full h-[360px]"
          />
        </div>
      </div>
    </div>
  );
}
