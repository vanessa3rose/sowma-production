// src/components/charts/ChartTooltip.tsx
import React from "react";

type SeriesMeta = {
  label?: string;
  color?: string;
  formatter?: (value: unknown) => React.ReactNode;
  hidden?: boolean;
};

// Minimal shape Recharts passes to custom tooltip content
type RechartsTooltipItem = {
  name?: string;
  dataKey?: string;
  value?: unknown;
  color?: string;
  fill?: string;
};

export type ChartTooltipProps = {
  active?: boolean;
  payload?: RechartsTooltipItem[];
  label?: unknown;

  /** Optional title override; if omitted uses formatted label */
  title?: React.ReactNode;
  /** Format the x-axis label / tooltip label */
  labelFormatter?: (label: unknown) => React.ReactNode;
  /** Provide metadata per series key (dataKey/name) */
  series?: Record<string, SeriesMeta>;
  /** Format values when series formatter isn't provided */
  valueFormatter?: (value: unknown, name?: string) => React.ReactNode;
  /** Hide rows where value is 0 (useful for pies / sparse charts) */
  hideZeroValues?: boolean;
  /** Show a small "No data" state when payload is empty */
  showEmptyState?: boolean;
  className?: string;
};

function humanizeKey(key: string) {
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2") // camelCase → camel Case
    .replace(/^./, (s) => s.toUpperCase()); // capitalize
}

function defaultValueFormatter(v: unknown): React.ReactNode {
  if (v === null || v === undefined) return "—";
  if (typeof v === "number" && Number.isFinite(v)) return v.toLocaleString();
  return String(v);
}

function isEmptyValue(v: unknown) {
  return v === null || v === undefined;
}

function normalizeName(n: unknown) {
  if (n === null || n === undefined) return "";
  return String(n);
}

export default function ChartTooltip(props: ChartTooltipProps) {
  const {
    active,
    payload,
    label,
    title,
    labelFormatter,
    valueFormatter = defaultValueFormatter,
    series,
    hideZeroValues = false,
    showEmptyState = true,
    className,
  } = props;

  if (!active) return null;

  const safePayload = Array.isArray(payload) ? payload : [];
  const hasRows = safePayload.length > 0;

  const renderedTitle =
    title ??
    (labelFormatter
      ? labelFormatter(label)
      : label !== undefined
        ? String(label)
        : "");

  if (!hasRows && showEmptyState) {
    return (
      <div
        className={[
          "rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-md",
          "font-[Poppins] text-sm",
          className ?? "",
        ].join(" ")}
      >
        {renderedTitle ? (
          <div className="mb-1 text-xs font-semibold text-gray-800">
            {renderedTitle}
          </div>
        ) : null}
        <div className="text-xs text-gray-500">No data</div>
      </div>
    );
  }

  const rows = safePayload
    .map((item) => {
      const dataKey = normalizeName(item.dataKey ?? item.name);
      const meta = series?.[dataKey] ?? series?.[normalizeName(item.name)];
      if (meta?.hidden) return null;

      const rawName = normalizeName(item.name ?? item.dataKey);
      const displayName =
        meta?.label ??
        (rawName ? humanizeKey(rawName) : humanizeKey(dataKey));

      const rawValue = item.value;
      if (hideZeroValues && rawValue === 0) return null;

      const color = meta?.color ?? item.color ?? item.fill;

      const formattedValue = meta?.formatter
        ? meta.formatter(rawValue)
        : valueFormatter(rawValue, dataKey);

      return {
        key: `${dataKey}-${rawName}`,
        displayName,
        formattedValue,
        color,
        isMissing: isEmptyValue(rawValue),
      };
    })
    .filter(Boolean) as Array<{
    key: string;
    displayName: string;
    formattedValue: React.ReactNode;
    color?: string;
    isMissing: boolean;
  }>;

  if (rows.length === 0 && showEmptyState) {
    return (
      <div
        className={[
          "rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-md",
          "font-[Poppins] text-sm",
          className ?? "",
        ].join(" ")}
      >
        {renderedTitle ? (
          <div className="mb-1 text-xs font-semibold text-gray-800">
            {renderedTitle}
          </div>
        ) : null}
        <div className="text-xs text-gray-500">No data</div>
      </div>
    );
  }

  return (
    <div
      className={[
        "min-w-[160px] rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-md",
        "font-[Poppins] text-sm",
        className ?? "",
      ].join(" ")}
    >
      {renderedTitle ? (
        <div className="mb-2 text-xs font-semibold text-gray-800">
          {renderedTitle}
        </div>
      ) : null}

      <div className="flex flex-col gap-1.5">
        {rows.map((r) => (
          <div key={r.key} className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: r.color ?? "#7987FF" }}
              />
              <span className="truncate text-xs text-gray-700">
                {r.displayName}
              </span>
            </div>
            <span
              className={[
                "shrink-0 text-xs font-semibold",
                r.isMissing ? "text-gray-400" : "text-gray-900",
              ].join(" ")}
            >
              {r.formattedValue}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}