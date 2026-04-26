import React from "react";
import TitleTooltip from "../charts/TitleTooltip";
import { COLORS } from "../../data/colors.js";

type DisplayMode = "both" | "chart-only";

function hasData(data: unknown): boolean {
  if (data === null || data === undefined) return false;
  if (Array.isArray(data)) {
    if (data.length === 0) return false;
    // treat array of objects with all-zero numeric values as empty
    if (
      data.every(
        (item) =>
          typeof item === "object" &&
          item !== null &&
          Object.values(item).every((v) => v === 0 || typeof v === "string"),
      )
    )
      return false;
    return true;
  }
  if (typeof data === "object") return Object.keys(data).length > 0;
  return true;
}

interface BigCardProps {
  title: string;
  subtitle?: React.ReactNode;
  chart: React.ReactNode;
  metricValue?: number;
  metricLabel?: string;
  metricChange?: string;
  displayMode: DisplayMode;
  className: string;
  dropdown?: React.ReactNode;
  titleTooltip?: string;
  style?: React.CSSProperties;
  data?: unknown;
  scrollable?: boolean;
}

const BigCard: React.FC<BigCardProps> = ({
  title,
  subtitle,
  chart,
  metricValue,
  metricLabel,
  metricChange,
  displayMode = "both",
  className = "",
  dropdown,
  titleTooltip,
  style,
  data,
  scrollable = false,
}) => {
  const shouldShowChart =
    displayMode === "both" || displayMode === "chart-only";
  const shouldShowMetric = displayMode === "both";
  const useFullChartHeight =
    displayMode === "chart-only" &&
    (title === "Days Posted" || title === "Engagement Calendar");

  return (
    <div
      className={className}
      style={{
        backgroundColor: "white",
        border: `1px solid ${COLORS.SOWMA_LIGHTER_GRAY}`,
        borderRadius: "12px",
        boxShadow: "0px 4px 4px #1e1e1e64",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        ...style,
      }}
    >
      {/* Header with title, subtitle, and optional dropdown */}
      <div className="flex justify-between items-center opacity-100">
        <div className="flex items-center">
          <h3
            style={{
              fontFamily: "Poppins, sans-serif",
              fontWeight: 500,
              fontSize: "16px",
              color: "black",
            }}
          >
            {title}
          </h3>
          {titleTooltip && <TitleTooltip description={titleTooltip} />}
        </div>

        <div className="flex items-center gap-2">
          {subtitle && (
            <div className="flex items-center gap-1 cursor-pointer opacity-100">
              <span
                style={{
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: 500,
                  fontSize: "12px",
                  lineHeight: "100%",
                  letterSpacing: "0%",
                  textAlign: "right",
                  color: "black",
                }}
              >
                {subtitle}
              </span>
            </div>
          )}

          {dropdown && (
            <div className="flex flex-1 w-full justify-end items-center">
              {dropdown}
            </div>
          )}
        </div>
      </div>

      {/* Metric Display - shown above chart when both are present */}
      {shouldShowMetric && metricValue !== undefined && hasData(data) && (
        <div className="mb-4">
          <div className="flex items-baseline gap-2 flex-wrap opacity-100">
            <span
              style={{
                fontFamily: "Poppins, sans-serif",
                fontWeight: 400,
                fontSize: "32px",
                lineHeight: "100%",
                letterSpacing: "-1%",
                color: COLORS.SOWMA_BLUE,
              }}
            >
              {metricValue}
            </span>
            {metricChange && (
              <div className="flex items-center gap-1">
                <span
                  style={{
                    fontFamily: "Poppins, sans-serif",
                    fontWeight: 400,
                    fontSize: "14px",
                    lineHeight: "100%",
                    letterSpacing: "0%",
                    color: metricChange.startsWith("+")
                      ? COLORS.SOWMA_BRIGHT_GREEN
                      : metricChange.startsWith("-")
                        ? COLORS.SOWMA_BRIGHT_RED
                        : COLORS.SOWMA_MEDIUM_GRAY,
                  }}
                >
                  {metricChange}
                </span>
                {metricChange.startsWith("+") && (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    style={{ transform: "rotate(-45deg)" }}
                  >
                    <path
                      d="M2 8L14 8M14 8L8 2M14 8L8 14"
                      stroke={COLORS.SOWMA_BRIGHT_GREEN}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
            )}
            {metricLabel && (
              <span
                style={{
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: 400,
                  fontSize: "14px",
                  lineHeight: "100%",
                  letterSpacing: "0%",
                  color: COLORS.SOWMA_MEDIUM_GRAY,
                }}
              >
                {metricLabel}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Chart Display */}
      {shouldShowChart && (
        <div
          className={`
            flex items-center justify-center
            ${
              !useFullChartHeight
                ? `min-h-[300px] flex-1 w-full ${scrollable ? "overflow-y-auto" : "overflow-hidden"}`
                : "h-full w-full"
            }`}
        >
          {data !== undefined && !hasData(data) ? (
            <div className="flex h-full w-full items-center justify-center">
              <span
                className="font-poppins"
                style={{
                  fontWeight: 400,
                  fontSize: "14px",
                  color: COLORS.SOWMA_MEDIUM_GRAY,
                }}
              >
                No data available
              </span>
            </div>
          ) : (
            chart
          )}
        </div>
      )}
    </div>
  );
};

export default BigCard;
