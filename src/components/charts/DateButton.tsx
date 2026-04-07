import { useMemo, useState, useRef, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format, differenceInDays, subYears } from "date-fns";

export type DateRangeId = "7d" | "30d" | "1y" | "all" | "custom";

type Preset = {
  id: Exclude<DateRangeId, "custom">;
  label: string;
  shortLabel: string;
};

const PRESETS: Preset[] = [
  { id: "7d", label: "Past Week", shortLabel: "Past Week" },
  { id: "30d", label: "Past Month", shortLabel: "Past Month" },
  { id: "1y", label: "Past Year", shortLabel: "Past Year" },
  { id: "all", label: "All Time", shortLabel: "All Time" },
];

export function computeRangeDates(
  range: DateRangeId,
  maxDate: Date,
  customStart?: Date | null,
  customEnd?: Date | null,
): { startDate?: string; endDate?: string } {
  if (range === "custom") {
    return {
      startDate: customStart ? format(customStart, "yyyy-MM-dd") : undefined,
      endDate: customEnd ? format(customEnd, "yyyy-MM-dd") : undefined,
    };
  }
  if (range === "all") return { startDate: undefined, endDate: undefined };

  const end = new Date(maxDate);
  const endStr = format(end, "yyyy-MM-dd");
  const start = new Date(end);
  if (range === "7d") start.setDate(start.getDate() - 6);
  if (range === "30d") start.setDate(start.getDate() - 29);
  if (range === "1y") start.setFullYear(start.getFullYear() - 1);

  return { startDate: format(start, "yyyy-MM-dd"), endDate: endStr };
}

/** Given a [start, end] range, check if it matches a preset relative to maxDate */
function detectPreset(
  start: Date,
  end: Date,
  maxDate: Date,
): Exclude<DateRangeId, "custom"> | null {
  const endDay = format(end, "yyyy-MM-dd");
  const maxDay = format(maxDate, "yyyy-MM-dd");
  if (endDay !== maxDay) return null;

  const days = differenceInDays(end, start);
  if (days === 6) return "7d";
  if (days === 29) return "30d";
  const oneYearAgo = subYears(end, 1);
  if (format(start, "yyyy-MM-dd") === format(oneYearAgo, "yyyy-MM-dd"))
    return "1y";
  return null;
}

export type DateRangeValue = {
  id: DateRangeId;
  start?: Date | null;
  end?: Date | null;
};

type DateDropdownProps = {
  value: DateRangeValue;
  onChange: (v: DateRangeValue) => void;
  minDate?: Date | null;
  maxDate?: Date | null;
  availableOptions?: DateRangeId[];
  disabled?: boolean;
  className?: string;
};

export default function DateDropdown({
  value,
  onChange,
  minDate,
  maxDate,
  availableOptions,
  disabled,
  className,
}: DateDropdownProps) {
  const [open, setOpen] = useState(false);
  const [activePreset, setActivePreset] = useState<DateRangeId>(value.id);
  const [startDate, setStartDate] = useState<Date | null>(value.start ?? null);
  const [endDate, setEndDate] = useState<Date | null>(value.end ?? null);
  const containerRef = useRef<HTMLDivElement>(null);

  const effectiveMax = maxDate ?? new Date();

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // When a preset button is clicked
  function handlePreset(id: Exclude<DateRangeId, "custom">) {
    setActivePreset(id);
    let start: Date | null = null;
    let end: Date | null = null;
    if (id === "all") {
      setStartDate(null);
      setEndDate(null);
    } else {
      end = new Date(effectiveMax);
      start = new Date(end);
      if (id === "7d") start.setDate(start.getDate() - 6);
      if (id === "30d") start.setDate(start.getDate() - 29);
      if (id === "1y") start.setFullYear(start.getFullYear() - 1);
      setStartDate(start);
      setEndDate(end);
    }
    onChange({ id, start, end });
    setOpen(false);
  }

  // When user manually picks dates in the calendar
  function handleCalendarChange(dates: [Date | null, Date | null]) {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);

    if (start && end) {
      const matched = detectPreset(start, end, effectiveMax);
      if (matched) {
        setActivePreset(matched);
        onChange({ id: matched, start, end });
      } else {
        setActivePreset("custom");
        onChange({ id: "custom", start, end });
      }
      setOpen(false);
    } else {
      // mid-selection
      setActivePreset("custom");
    }
  }

  // Button label
  const buttonLabel = useMemo(() => {
    if (activePreset !== "custom") {
      return (
        PRESETS.find((p) => p.id === activePreset)?.shortLabel ?? "Select range"
      );
    }
    if (startDate && endDate) {
      return `${format(startDate, "MMM d, yyyy")} – ${format(endDate, "MMM d, yyyy")}`;
    }
    return "Select range";
  }, [activePreset, startDate, endDate]);

  const validPresets = useMemo(() => {
    const allowed = new Set<DateRangeId>(
      availableOptions ?? PRESETS.map((preset) => preset.id),
    );

    if (!minDate || !maxDate) {
      return PRESETS.filter((preset) => allowed.has(preset.id));
    }

    const spanDays = differenceInDays(maxDate, minDate) + 1;
    return PRESETS.filter((p) => {
      if (!allowed.has(p.id)) return false;
      if (p.id === "all") return true;
      if (p.id === "7d") return spanDays >= 7;
      if (p.id === "30d") return spanDays >= 30;
      if (p.id === "1y") return spanDays >= 365;
      return true;
    });
  }, [minDate, maxDate, availableOptions]);

  return (
    <div
      ref={containerRef}
      className={["relative inline-block", className ?? ""].join(" ")}
    >
      {/* Trigger button */}
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
        <span>{buttonLabel}</span>
        <span className="text-gray-500">▾</span>
      </button>

      {/* Dropdown panel */}
      {open && !disabled && (
        <div className="absolute right-0 z-50 mt-2 rounded-xl border border-gray-200 bg-white shadow-lg p-3 w-fit">
          {/* Preset buttons */}
          <div className="flex gap-2 mb-3">
            {validPresets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handlePreset(preset.id)}
                className={[
                  "rounded-full px-3 py-1 text-xs font-semibold font-[Poppins] border transition-colors",
                  activePreset === preset.id
                    ? "text-white"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50",
                ].join(" ")}
                style={
                  activePreset === preset.id
                    ? { backgroundColor: "#4781C2", borderColor: "#4781C2" }
                    : undefined
                }
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Calendar */}
          <div className="flex justify-center">
            <DatePicker
              renderCustomHeader={({ date, decreaseMonth, increaseMonth }) => (
                <div className="flex items-center justify-between px-4">
                  <button onClick={decreaseMonth}>←</button>
                  <span>{format(date, "MMMM yyyy")}</span>
                  <button onClick={increaseMonth}>→</button>
                </div>
              )}
              selected={startDate}
              onChange={handleCalendarChange}
              startDate={startDate}
              endDate={endDate}
              minDate={minDate ?? undefined}
              maxDate={effectiveMax}
              selectsRange
              inline
              calendarClassName="!font-[Poppins] !border-none !shadow-none"
            />
          </div>
        </div>
      )}
    </div>
  );
}
