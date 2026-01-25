// src/components/export-pdf/export-elements/KPI.tsx

export default function KPI({
  title,
  value,
  delta,
  unit,
  deltaColor,
}: {
  title: string;
  value: string | number;
  delta: string;
  unit: string;
  deltaColor?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      {/* Title */}
      <div className="text-black" style={{ fontSize: "17px" }}>
        {title}
      </div>

      {/* Main Metric */}
      <div
        style={{
          fontSize: "30px",
          lineHeight: "44px",
          fontWeight: 600,
          color: "#547CFF",
        }}
      >
        {value}
      </div>

      {/* Delta Row */}
      <div className="flex items-center gap-1">
        <span
          style={{
            color: deltaColor || "#22C55E",
            fontSize: "15px",
            fontWeight: 500,
          }}
        >
          {delta}
        </span>

        <span style={{ color: "#6B7280", fontSize: "15px" }}>{unit}</span>
      </div>
    </div>
  );
}
