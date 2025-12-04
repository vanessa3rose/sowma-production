/* ------------------------------------------------------------------ */
/* Custom SVG donut slice generator                                  */
/* ------------------------------------------------------------------ */

const PIE_COLORS = ["#7987FF", "#F765A3", "#FFA9D0", "#A155B9"];

type DonutDatum = { label: string; value: number };

export default function ExportDonut({ data }: { data: DonutDatum[] }) {
  const total = data.reduce((sum, d) => sum + (d.value || 0), 0);

  if (total <= 0) {
    return (
      <div className="flex items-center justify-center h-full text-xs text-gray-500">
        No data
      </div>
    );
  }

  const cx = 100;
  const cy = 100;
  const outerR = 70;
  const innerR = 45;

  let currentAngle = -90;

  const slices = data.map((d, idx) => {
    const fraction = (d.value || 0) / total;
    const sweep = fraction * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + sweep;
    currentAngle = endAngle;

    const path = describeDonutSlice(cx, cy, innerR, outerR, startAngle, endAngle);

    return {
      path,
      color: PIE_COLORS[idx % PIE_COLORS.length],
      label: d.label,
      value: d.value,
    };
  });

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <svg viewBox="0 0 200 200" width="100%" height="100%" style={{ maxHeight: "260px" }}>
        {slices.map((s, i) => (
          <path key={i} d={s.path} fill={s.color} stroke="#ffffff" strokeWidth={1} />
        ))}
      </svg>

      {/* Legend */}
      <div className="mt-2 flex flex-col gap-1 text-[10px]">
        {slices.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: s.color }} />
            <span>{s.label}</span>
            <span className="text-gray-500">
              {total > 0
                ? `${s.value} (${Math.round((s.value / total) * 100)}%)`
                : `${s.value}`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function describeDonutSlice(
  cx: number,
  cy: number,
  innerR: number,
  outerR: number,
  startAngle: number,
  endAngle: number
): string {
  const startOuter = polarToCartesian(cx, cy, outerR, endAngle);
  const endOuter = polarToCartesian(cx, cy, outerR, startAngle);
  const startInner = polarToCartesian(cx, cy, innerR, startAngle);
  const endInner = polarToCartesian(cx, cy, innerR, endAngle);

  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  return [
    "M",
    startOuter.x,
    startOuter.y,
    "A",
    outerR,
    outerR,
    0,
    largeArcFlag,
    0,
    endOuter.x,
    endOuter.y,
    "L",
    startInner.x,
    startInner.y,
    "A",
    innerR,
    innerR,
    0,
    largeArcFlag,
    1,
    endInner.x,
    endInner.y,
    "Z",
  ].join(" ");
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy + r * Math.sin(angleRad),
  };
}