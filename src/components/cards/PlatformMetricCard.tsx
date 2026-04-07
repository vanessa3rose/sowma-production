import React from "react";
import TitleTooltip from "../charts/TitleTooltip";
import { COLORS } from "../../data/colors.js";

interface PlatformMetric {
  label: string;
  value: number | null;
  change: number | null;
  color: string;
  sinceDate?: string | null;
}

interface PlatformMetricCardProps {
  title: string;
  titleTooltip?: string;
  metrics: PlatformMetric[];
  dropdown?: React.ReactNode;
  className?: string;
}

const PlatformMetricCard: React.FC<PlatformMetricCardProps> = ({
  title,
  titleTooltip,
  metrics,
  dropdown,
  className = "",
}) => {
  return (
    <div
      className={className}
      style={{
        backgroundColor: "white",
        border: `1px solid ${COLORS.SOWMA_LIGHTER_GRAY}`,
        borderRadius: "12px",
        boxShadow: "0px 4px 4px #1e1e1e64",
        padding: "24px 28px",
      }}
    >
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-1">
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
        {dropdown && <div className="flex items-center">{dropdown}</div>}
      </div>

      <div className="flex flex-col gap-4">
        {metrics.map(({ label, value, change, color, sinceDate }, index) => (
          <div key={label}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span
                  style={{
                    fontFamily: "Poppins, sans-serif",
                    fontSize: "12px",
                    fontWeight: 500,
                    color: COLORS.SOWMA_GRAY,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    width: "72px",
                  }}
                >
                  {label}
                </span>
                <span
                  style={{
                    fontFamily: "Poppins, sans-serif",
                    fontSize: "28px",
                    // FIX: Removed the condition that turned the number gray when change === 0
                    color: value === null ? COLORS.SOWMA_GRAY : color,
                    fontWeight: 600,
                    lineHeight: "1",
                  }}
                >
                  {value !== null ? value.toLocaleString() : "—"}
                </span>
              </div>
              <div className="flex flex-col items-end gap-0.5">
                {change !== null && (
                  <div className="flex items-center gap-1">
                    <span
                      style={{
                        fontFamily: "Poppins, sans-serif",
                        fontSize: "13px",
                        fontWeight: 500,
                        color:
                          change > 0
                            ? COLORS.SOWMA_BRIGHT_GREEN
                            : change < 0
                              ? COLORS.SOWMA_BRIGHT_RED
                              : COLORS.SOWMA_GRAY,
                      }}
                    >
                      {change > 0 ? "+" : ""}
                      {change.toLocaleString()}
                    </span>
                    {change === 0 ? (
                      /* FIX: Smaller font size and fixed width to match the SVG arrow scale */
                      <span
                        style={{
                          fontSize: "10px",
                          fontWeight: 800,
                          color: COLORS.SOWMA_GRAY,
                          lineHeight: "1",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: "11px",
                        }}
                      >
                        —
                      </span>
                    ) : (
                      <svg
                        width="11"
                        height="11"
                        viewBox="0 0 16 16"
                        fill="none"
                        style={{
                          transform:
                            change > 0 ? "rotate(-45deg)" : "rotate(45deg)",
                        }}
                      >
                        <path
                          d="M2 8L14 8M14 8L8 2M14 8L8 14"
                          stroke={
                            change > 0
                              ? COLORS.SOWMA_BRIGHT_GREEN
                              : COLORS.SOWMA_BRIGHT_RED
                          }
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                )}
                {sinceDate && (
                  <span
                    style={{
                      fontFamily: "Poppins, sans-serif",
                      fontSize: "11px",
                      color: "#C4C4C4",
                    }}
                  >
                    since {sinceDate}
                  </span>
                )}
              </div>
            </div>

            {index < metrics.length - 1 && (
              <div
                style={{
                  borderBottom: `1px solid ${COLORS.SOWMA_LIGHTEST_GRAY}`,
                  marginTop: "16px",
                }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlatformMetricCard;
