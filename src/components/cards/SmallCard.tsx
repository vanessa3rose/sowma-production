import React from "react";
import TitleTooltip from "../charts/TitleTooltip";

// Type definitions - consistent with BigCard
type DisplayMode = "both" | "metric-only";

interface SmallCardProps {
  title: string;
  subtitle?: string;
  chart?: React.ReactNode;
  metricValue?: number;
  metricValueNote?: string;
  metricLabel?: string;
  metricChange?: string;
  displayMode: DisplayMode;
  className: string;
  titleTooltip?: string;
}

// SmallCard Component
const SmallCard: React.FC<SmallCardProps> = ({
  title,
  subtitle,
  chart,
  metricValue,
  metricValueNote,
  metricLabel,
  metricChange,
  displayMode = "metric-only",
  className = "",
  titleTooltip,
}) => {
  const shouldShowChart = displayMode === "both";
  const shouldShowMetric =
    displayMode === "both" || displayMode === "metric-only";

  return (
    <div
      className={className}
      style={{
        backgroundColor: "#ffffff",
        border: "1px solid #E5E5E5",
        borderRadius: "12px",
        boxShadow: "0px 4px 4px #1e1e1e64",
        padding: "20px",
        position: "relative",
      }}
    >
      {/* Header with title and subtitle */}
      <div className="flex justify-between items-center mb-3">
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
        {subtitle && (
          <div className="flex items-center gap-1 cursor-pointer">
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              style={{
                width: "12px",
                height: "12px",
                color: "#000000",
              }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m19.5 8.25-7.5 7.5-7.5-7.5"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Content area - flexible layout based on displayMode */}
      <div
        className={shouldShowChart ? "flex items-start justify-between" : ""}
      >
        {/* Left side - Metric Display */}
        {shouldShowMetric && metricValue !== undefined && (
          <div className="flex flex-col">
            {/* Main metric value */}
            <div
              className="flex items-baseline gap-2 flex-wrap"
              style={{ marginBottom: "4px" }}
            >
              <span
                style={{
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: 400,
                  fontSize: "32px",
                  lineHeight: "100%",
                  letterSpacing: "-1%",
                  color: "#3B82F6",
                }}
              >
                {metricValue}
              </span>
              {metricValueNote && (
                <span
                  style={{
                    fontFamily: "Poppins, sans-serif",
                    fontWeight: 400,
                    fontSize: "14px",
                    lineHeight: "100%",
                    letterSpacing: "0%",
                    color: "#6B7280",
                  }}
                >
                  {metricValueNote}
                </span>
              )}
            </div>

            {/* Metric change and label on same line with wrapping */}
            <div
              className="flex items-center gap-2 flex-wrap"
              style={{ marginBottom: "2px" }}
            >
              {metricChange && (
                <div className="flex items-center gap-1">
                  <span
                    style={{
                      fontFamily: "Poppins, sans-serif",
                      fontWeight: 400,
                      fontSize: displayMode === "both" ? "12px" : "14px",
                      lineHeight: "100%",
                      letterSpacing: "0%",
                      color:
                        metricChange.includes("increase") ||
                        metricChange.startsWith("+")
                          ? "#10B981"
                          : metricChange.includes("decrease") ||
                              metricChange.startsWith("-")
                            ? "#EF4444"
                            : "#10B981",
                    }}
                  >
                    {metricChange}
                  </span>
                  {(metricChange.includes("increase") ||
                    metricChange.startsWith("+")) && (
                    <svg
                      width={displayMode === "both" ? "12" : "16"}
                      height={displayMode === "both" ? "12" : "16"}
                      viewBox="0 0 16 16"
                      fill="none"
                      style={{ transform: "rotate(-45deg)" }}
                    >
                      <path
                        d="M2 8L14 8M14 8L8 2M14 8L8 14"
                        stroke="#10B981"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
              )}

              {/* Custom label text */}
              {displayMode === "metric-only" && metricLabel && (
                <span
                  style={{
                    fontFamily: "Poppins, sans-serif",
                    fontWeight: 400,
                    fontSize: "14px",
                    lineHeight: "100%",
                    letterSpacing: "0%",
                    color: "#6B7280",
                  }}
                >
                  {metricLabel}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Right side - Chart Display */}
        {shouldShowChart && chart && (
          <div
            style={{
              position: "absolute",
              right: "20px",
              bottom: "20px",
              width: "100px",
              height: "60px",
            }}
          >
            {chart}
          </div>
        )}
      </div>
    </div>
  );
};

export default SmallCard;
