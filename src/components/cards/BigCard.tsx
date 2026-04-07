import React from "react";
import TitleTooltip from "../charts/TitleTooltip";
import { COLORS } from "../../data/colors.js";

type DisplayMode = "both" | "chart-only";

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
        border: "1px solid #E5E5E5",
        borderRadius: "12px",
        boxShadow: "0px 4px 4px #1e1e1e64",
        padding: "20px",
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

          {dropdown && <div>{dropdown}</div>}
        </div>
      </div>

      {/* Metric Display - shown above chart when both are present */}
      {shouldShowMetric && metricValue !== undefined && (
        <div className="mb-4">
          <div className="flex items-baseline gap-2 flex-wrap opacity-100">
            <span
              style={{
                fontFamily: "Poppins, sans-serif",
                fontWeight: 400,
                fontSize: "32px",
                lineHeight: "100%",
                letterSpacing: "-1%",
                color: COLORS.SOWMA_LIGHT_BLUE,
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
                        : COLORS.SOWMA_GRAY,
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
                  color: COLORS.SOWMA_GRAY,
                }}
              >
                {metricLabel}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Chart Display */}
      {shouldShowChart && chart && (
        <div
          className={`
            flex
            ${
              !useFullChartHeight
                ? `h-[300px] w-full ${scrollable ? "overflow-y-auto" : "overflow-hidden"}`
                : "flex h-full w-full justify-center items-center"
            }`}
        >
          {chart}
        </div>
      )}
    </div>
  );
};

export default BigCard;
