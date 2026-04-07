import React, { useState } from "react";

interface TitleTooltipProps {
  description: string;
}

const TitleTooltip: React.FC<TitleTooltipProps> = ({ description }) => {
  const [visible, setVisible] = useState(false);

  return (
    <span
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        marginLeft: "6px",
      }}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {/* Info icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#9CA3AF"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ cursor: "pointer", flexShrink: 0 }}
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>

      {/* Tooltip bubble */}
      {visible && (
        <div
          style={{
            position: "absolute",
            bottom: "calc(100% + 8px)",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 50,
            backgroundColor: "white",
            border: "1px solid #E5E7EB",
            borderRadius: "12px",
            boxShadow: "0px 4px 12px rgba(0,0,0,0.12)",
            padding: "8px 12px",
            minWidth: "160px",
            maxWidth: "220px",
            fontFamily: "Poppins, sans-serif",
            fontSize: "12px",
            lineHeight: "1.5",
            color: "#374151",
            whiteSpace: "normal",
            pointerEvents: "none",
          }}
        >
          {description}
        </div>
      )}
    </span>
  );
};

export default TitleTooltip;
