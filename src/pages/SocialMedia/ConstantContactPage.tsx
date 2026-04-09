import { useEffect, useMemo, useState } from "react";
import ReactECharts from "echarts-for-react";
import { COLORS } from "../../data/colors.js";

import BigCard from "../../components/cards/BigCard";
import LineCharts from "../../components/charts/LineCharts";
import DateDropdown, {
  DateRangeValue,
} from "../../components/charts/DateButton";
import { getLatestImportedDate } from "../../utils/latestImportedDate";
import { fetchMetrics } from "../../utils/fetchMetrics";
import SocialMediaHeader from "../../components/SocialMediaHeader";
import { getGlossaryDefinition } from "../../data/glossarydata";

/* ---------- types ---------- */

import {
  type LinePoint,
  toLinePoints,
  getBounds,
  filterByRange,
} from "../../utils/seriesUtils";

/* ---------- types ---------- */

type MetricConfig = {
  id: string;
  title: string;
  metric: string;
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
  },
  {
    id: "emails_delivered",
    title: "Emails Delivered",
    metric: "EMAILS_DELIVERED",
  },
  {
    id: "emails_opened",
    title: "Emails Opened",
    metric: "EMAIL_OPENED",
  },
  {
    id: "emails_clicked",
    title: "Emails Clicked",
    metric: "EMAILS_CLICKED",
  },
  {
    id: "emails_unsubscribed",
    title: "Unsubscribed",
    metric: "EMAILS_UNSUBSCRIBED",
  },
  {
    id: "emails_bounced",
    title: "Bounced",
    metric: "EMAIL_BOUNCED",
  },
  {
    id: "emails_forwarded",
    title: "Forwarded",
    metric: "EMAIL_FORWARDED",
  },
  {
    id: "emails_not_opened",
    title: "Not Opened",
    metric: "EMAIL_NOT_OPENED",
  },
  {
    id: "email_abuse",
    title: "Abuse / Spam",
    metric: "EMAIL_ABUSE",
  },
  {
    id: "email_unique_opens",
    title: "Unique Opens",
    metric: "EMAIL_UNIQUE_OPENS",
  },
  {
    id: "email_total_opens",
    title: "Total Opens",
    metric: "EMAIL_TOTAL_OPENS",
  },
  {
    id: "email_unique_clicks",
    title: "Unique Clicks",
    metric: "EMAIL_UNIQUE_CLICKS",
  },
  {
    id: "email_total_clicks",
    title: "Total Clicks",
    metric: "EMAIL_TOTAL_CLICKS",
  },
];

/* ---------- helpers ---------- */

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
  const bounced = vals.emails_bounced ?? 0;
  const opened = vals.emails_opened ?? 0;
  const notOpened = vals.emails_not_opened ?? 0;
  const clicked = vals.emails_clicked ?? 0;
  const unsubscribed = vals.emails_unsubscribed ?? 0;
  const abuse = vals.email_abuse ?? 0;
  const forwarded = vals.emails_forwarded ?? 0;

  const nodes: SankeyNode[] = [
    {
      name: `Sent\n${fmt(sent)}`,
      itemStyle: { color: COLORS.SOWMA_SANKEY_SENT },
    },
    {
      name: `Delivered\n${fmt(delivered)}`,
      itemStyle: { color: COLORS.SOWMA_SANKEY_DELIVERED },
    },
    {
      name: `Bounced\n${fmt(bounced)}`,
      itemStyle: { color: COLORS.SOWMA_SANKEY_BOUNCED },
    },
    {
      name: `Opened\n${fmt(opened)}`,
      itemStyle: { color: COLORS.SOWMA_SANKEY_OPENED },
    },
    {
      name: `Not Opened\n${fmt(notOpened)}`,
      itemStyle: { color: COLORS.SOWMA_SANKEY_NOT_OPENED },
    },
    {
      name: `Clicked\n${fmt(clicked)}`,
      itemStyle: { color: COLORS.SOWMA_SANKEY_CLICKED },
    },
  ];

  const links: SankeyLink[] = [
    {
      source: `Sent\n${fmt(sent)}`,
      target: `Delivered\n${fmt(delivered)}`,
      value: delivered,
      lineStyle: { color: COLORS.SOWMA_SANKEY_DELIVERED, opacity: 0.35 },
    },
  ];

  if (bounced > 0) {
    links.push({
      source: `Sent\n${fmt(sent)}`,
      target: `Bounced\n${fmt(bounced)}`,
      value: bounced,
      lineStyle: { color: COLORS.SOWMA_SANKEY_BOUNCED, opacity: 0.35 },
    });
  }
  if (opened > 0) {
    links.push({
      source: `Delivered\n${fmt(delivered)}`,
      target: `Opened\n${fmt(opened)}`,
      value: opened,
      lineStyle: { color: COLORS.SOWMA_SANKEY_OPENED, opacity: 0.35 },
    });
  }
  if (notOpened > 0) {
    links.push({
      source: `Delivered\n${fmt(delivered)}`,
      target: `Not Opened\n${fmt(notOpened)}`,
      value: notOpened,
      lineStyle: { color: COLORS.SOWMA_SANKEY_NOT_OPENED, opacity: 0.35 },
    });
  }
  if (clicked > 0) {
    links.push({
      source: `Opened\n${fmt(opened)}`,
      target: `Clicked\n${fmt(clicked)}`,
      value: clicked,
      lineStyle: { color: COLORS.SOWMA_SANKEY_CLICKED, opacity: 0.35 },
    });
  }
  if (unsubscribed > 0) {
    nodes.push({
      name: `Unsubscribed\n${fmt(unsubscribed)}`,
      itemStyle: { color: COLORS.SOWMA_SANKEY_UNSUBSCRIBED },
    });
    links.push({
      source: `Opened\n${fmt(opened)}`,
      target: `Unsubscribed\n${fmt(unsubscribed)}`,
      value: unsubscribed,
      lineStyle: { color: COLORS.SOWMA_SANKEY_UNSUBSCRIBED, opacity: 0.35 },
    });
  }
  if (abuse > 0) {
    nodes.push({
      name: `Spam\n${fmt(abuse)}`,
      itemStyle: { color: COLORS.SOWMA_SANKEY_ABUSE },
    });
    links.push({
      source: `Delivered\n${fmt(delivered)}`,
      target: `Spam\n${fmt(abuse)}`,
      value: abuse,
      lineStyle: { color: COLORS.SOWMA_SANKEY_ABUSE, opacity: 0.35 },
    });
  }
  if (forwarded > 0) {
    nodes.push({
      name: `Forwarded\n${fmt(forwarded)}`,
      itemStyle: { color: COLORS.SOWMA_SANKEY_FORWARDED },
    });
    links.push({
      source: `Opened\n${fmt(opened)}`,
      target: `Forwarded\n${fmt(forwarded)}`,
      value: forwarded,
      lineStyle: { color: COLORS.SOWMA_SANKEY_FORWARDED, opacity: 0.35 },
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
          color: COLORS.SOWMA_DARKER_GRAY,
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

export default function ConstantContactPage() {
  const [rawSeries, setRawSeries] = useState<Record<string, LinePoint[]>>({});
  const [sankeyRange, setSankeyRange] = useState<DateRangeValue>(ALL_RANGE);
  const [opensRange, setOpensRange] = useState<DateRangeValue>(ALL_RANGE);
  const [clicksRange, setClicksRange] = useState<DateRangeValue>(ALL_RANGE);

  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

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

        setLastUpdated(
          getLatestImportedDate(results.map(({ rows }) => rows).flat()),
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

  return (
    <div className="w-full min-h-screen bg-white flex flex-col gap-4 px-4 pb-2 pt-4 lg:pt-6">
      <SocialMediaHeader
        lastUpdated={lastUpdated}
        Title={"Constant Contact"}
        Link={"https://app.constantcontact.com"}
      />

      <div className="flex flex-col gap-4">
        {/* ── Email Flow Sankey — first ── */}
        <BigCard
          title="Email Flow"
          data={sankeyVals}
          titleTooltip={getGlossaryDefinition("email_flow")}
          subtitle={
            <DateDropdown
              value={sankeyRange}
              onChange={setSankeyRange}
              minDate={sankeyBounds.min}
              maxDate={sankeyBounds.max}
            />
          }
          chart={
            <div className="flex w-full justify-center items-center">
              <ReactECharts
                option={buildSankeyOption(sankeyVals)}
                style={{ height: "100%", width: "95%" }}
                opts={{ renderer: "svg" }}
              />
            </div>
          }
          displayMode="chart-only"
          className="w-full h-[360px]"
        />

        {/* ── Opens + Clicks comparison ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <BigCard
            title="Opens: Unique vs Total"
            titleTooltip={getGlossaryDefinition("email_opens")}
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
            titleTooltip={getGlossaryDefinition("email_clicks")}
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
      </div>
    </div>
  );
}
