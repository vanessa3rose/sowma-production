import { useMemo, useState } from "react";

export type DateRangeId = "7d" | "30d" | "1y" | "all";

type Option = {
  id: DateRangeId;
  label: string;
};

const ALL_OPTIONS: Option[] = [
  { id: "7d", label: "Last week" },
  { id: "30d", label: "Last month" },
  { id: "1y", label: "Last year" },
  { id: "all", label: "All time" },
];

function daysBetween(a: Date, b: Date) {
  const ms = b.getTime() - a.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

export function computeRangeDates(
  range: DateRangeId,
  maxDate: Date,
): { startDate?: string; endDate?: string } {
  const end = new Date(maxDate);
  const endStr = end.toISOString().slice(0, 10);

  if (range === "all") return { startDate: undefined, endDate: undefined };

  const start = new Date(end);
  if (range === "7d") start.setDate(start.getDate() - 6);
  if (range === "30d") start.setDate(start.getDate() - 29);
  if (range === "1y") start.setFullYear(start.getFullYear() - 1);

  const startStr = start.toISOString().slice(0, 10);
  return { startDate: startStr, endDate: endStr };
}

type DateDropdownProps = {
  value: DateRangeId;
  onChange: (v: DateRangeId) => void;

  /** Earliest date present in this chart’s dataset (metricDate/lastSynced) */
  minDate?: Date | null;
  /** Latest date present in this chart’s dataset */
  maxDate?: Date | null;

  /** Optional: if true, disables interaction */
  disabled?: boolean;
  className?: string;
  /** Optional explicit range allow-list based on datapoint availability */
  availableOptions?: DateRangeId[];
};

export default function DateDropdown({
  value,
  onChange,
  minDate,
  maxDate,
  disabled,
  className,
  availableOptions,
}: DateDropdownProps) {
  const [open, setOpen] = useState(false);

  const validOptions = useMemo(() => {
    if (availableOptions && availableOptions.length > 0) {
      return ALL_OPTIONS.filter((opt) => availableOptions.includes(opt.id));
    }
    if (!minDate || !maxDate) return ALL_OPTIONS; // if unknown, show all
    const spanDays = daysBetween(minDate, maxDate) + 1;
    return ALL_OPTIONS.filter((opt) => {
      if (opt.id === "all") return true;
      if (opt.id === "7d") return spanDays >= 7;
      if (opt.id === "30d") return spanDays >= 30;
      if (opt.id === "1y") return spanDays >= 365;
      return true;
    });
  }, [minDate, maxDate, availableOptions]);

  const selected = validOptions.find((o) => o.id === value) ?? ALL_OPTIONS[1]; // default 30d

  // If current value is no longer valid (e.g. data shrank), fall back.
  // (This is safe and keeps UI from showing an option that isn’t in the menu.)
  const effectiveValue = validOptions.some((o) => o.id === value)
    ? value
    : (validOptions.find((o) => o.id === "30d")?.id ?? "all");

  if (effectiveValue !== value) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    // We avoid useEffect here to keep it minimal; call onChange during render only when needed.
    // If you prefer, swap this to useEffect.
    onChange(effectiveValue);
  }

  return (
    <div className={["relative inline-block", className ?? ""].join(" ")}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className={[
          "flex items-center gap-2 rounded-full px-3 py-1.5",
          "text-sm font-semibold font-[Poppins] text-gray-800",
          "hover:bg-gray-50 border border-transparent",
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
        ].join(" ")}
      >
        <span>{selected.label}</span>
        <span className="text-gray-500">▾</span>
      </button>

      {open && !disabled ? (
        <div
          className="absolute right-0 z-50 mt-2 w-44 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg"
          onMouseLeave={() => setOpen(false)}
        >
          {validOptions.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => {
                onChange(opt.id);
                setOpen(false);
              }}
              className={[
                "w-full px-4 py-2 text-left text-sm font-[Poppins]",
                opt.id === value ? "bg-gray-50 font-semibold" : "bg-white",
                "hover:bg-gray-50",
              ].join(" ")}
            >
              {opt.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
