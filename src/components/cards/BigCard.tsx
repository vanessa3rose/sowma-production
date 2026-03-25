import React from "react";
import TitleTooltip from "../charts/TitleTooltip";

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
        backgroundColor: "#ffffff",
        border: "1px solid #E5E5E5",
        borderRadius: "12px",
        boxShadow: "0px 4px 4px #1e1e1e64",
        padding: "20px",
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
              color: "#000000",
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
                  color: "#000000",
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
              className=""
              style={{
                fontFamily: "Poppins, sans-serif",
                fontWeight: 400,
                fontSize: "32px",
                lineHeight: "100%",
                letterSpacing: "-3.75%",
                color: "#4781C2",
              }}
            >
              {metricValue}
            </span>
            {metricChange && (
              <span
                className={
                  metricChange.includes("increase") ||
                  metricChange.startsWith("+")
                    ? "text-green-500"
                    : metricChange.includes("decrease") ||
                        metricChange.startsWith("-")
                      ? "text-red-500"
                      : "text-green-500"
                }
                style={{
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: 400,
                  fontSize: "14px",
                  lineHeight: "100%",
                  letterSpacing: "0%",
                }}
              >
                {metricChange}
              </span>
            )}
            {metricLabel && (
              <span
                className="text-gray-500"
                style={{
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: 400,
                  fontSize: "14px",
                  lineHeight: "100%",
                  letterSpacing: "0%",
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
                ? "h-[300px] w-full overflow-hidden"
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
