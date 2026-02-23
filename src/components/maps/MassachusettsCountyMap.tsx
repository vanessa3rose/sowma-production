import { useMemo, useRef, useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
  type GeoFeature,
} from "react-simple-maps";
import countiesTopoJson from "us-atlas/counties-10m.json";
import { MA_COUNTY_FIPS_TO_NAME } from "../../utils/massachusettsCounties";
import ChartTooltip from "../charts/ChartTooltip";

const DEFAULT_COUNTY_COLOR = "#DBEAFE";
const MA_STATE_FIPS = "25";
const MA_CENTER: [number, number] = [-71.8, 42.25];
const MA_ZOOM = 13.2;
const MAP_ROTATION_DEGREES = 14;

type CountyId = string;

interface MassachusettsCountyMapProps {
  countyIntensity?: Partial<Record<CountyId, number>>;
  countyValue?: Partial<Record<CountyId, number>>;
  totalValue?: number;
  valueLabel?: string; // "Visitors" / "Sessions"
  intensityLabel?: string; // "% of total"
  showLegend?: boolean;
}

type CountyTooltip = {
  countyName: string;
  pctOfTotal: number; // 0..100
  rawValue: number | null;
  x: number;
  y: number;
};

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

function colorFromIntensity(intensity: number): string {
  const clamped = clamp01(intensity);
  const lightness = 92 - clamped * 52;
  return `hsl(213, 94%, ${lightness}%)`;
}

function toCountyId(id: string | number): CountyId {
  return String(id).padStart(5, "0");
}

function isMassachusettsCounty(id: string | number): boolean {
  return toCountyId(id).startsWith(MA_STATE_FIPS);
}

function toFiniteNumber(value: unknown): number | null {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

export default function MassachusettsCountyMap({
  countyIntensity,
  countyValue,
  totalValue,
  valueLabel = "Visitors",
  intensityLabel = "% of total",
  showLegend = true,
}: MassachusettsCountyMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [tooltip, setTooltip] = useState<CountyTooltip | null>(null);

  // Always returns a number (never undefined)
  const computedTotal: number = useMemo(() => {
    const provided = toFiniteNumber(totalValue);
    if (provided != null) return Math.max(0, provided);

    if (!countyValue) return 0;

    const vals = Object.values(countyValue);
    return vals.reduce<number>((acc, v) => {
      const n = toFiniteNumber(v);
      return acc + (n ?? 0);
    }, 0);
  }, [countyValue, totalValue]);

  // Fill shading is relative to the max county value so the largest county is the deepest color.
  // If values are not available, fall back to caller-provided intensity.
  const fillIntensityByCounty: Partial<Record<CountyId, number>> = useMemo(() => {
    if (!countyValue) return countyIntensity ?? {};

    const entries = Object.entries(countyValue)
      .map(([id, value]) => [id, toFiniteNumber(value)] as const)
      .filter(([, value]) => value != null && value >= 0) as Array<
      readonly [string, number]
    >;

    if (entries.length === 0) return countyIntensity ?? {};

    const maxValue = entries.reduce((max, [, value]) => Math.max(max, value), 0);
    if (maxValue <= 0) return countyIntensity ?? {};

    return Object.fromEntries(
      entries.map(([id, value]) => [id, clamp01(value / maxValue)]),
    ) as Partial<Record<CountyId, number>>;
  }, [countyIntensity, countyValue]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-center relative"
    >
      <div
        className="w-full h-full max-h-[320px]"
        style={{
          transform: `rotate(${MAP_ROTATION_DEGREES}deg)`,
          transformOrigin: "center",
        }}
        onWheel={(event) => event.preventDefault()}
      >
        <ComposableMap
          projection="geoAlbersUsa"
          width={900}
          height={500}
          className="w-full h-full"
          aria-label="Massachusetts county map preview"
        >
          <ZoomableGroup
            center={MA_CENTER}
            zoom={MA_ZOOM}
            minZoom={MA_ZOOM}
            maxZoom={MA_ZOOM}
            disablePanning
            disableZooming
          >
            <Geographies geography={countiesTopoJson}>
              {({ geographies }) =>
                geographies
                  .filter((geo: GeoFeature) => isMassachusettsCounty(geo.id))
                  .map((geo: GeoFeature) => {
                    const countyId = toCountyId(geo.id);

                    const intensity = fillIntensityByCounty?.[countyId];
                    const fillColor =
                      intensity == null
                        ? DEFAULT_COUNTY_COLOR
                        : colorFromIntensity(intensity);

                    const countyName =
                      MA_COUNTY_FIPS_TO_NAME[
                        countyId as keyof typeof MA_COUNTY_FIPS_TO_NAME
                      ] ?? countyId;

                    const rawNum = toFiniteNumber(countyValue?.[countyId]);
                    const total = computedTotal; // local alias helps TS narrowing

                    const pct =
                      rawNum != null && total > 0 ? (rawNum / total) * 100 : 0;

                    return (
                      <Geography
                        key={countyId}
                        geography={geo}
                        fill={fillColor}
                        stroke="#1E293B"
                        strokeWidth={0.42}
                        vectorEffect="non-scaling-stroke"
                        style={{
                          default: { outline: "none" },
                          hover: { outline: "none" },
                          pressed: { outline: "none" },
                        }}
                        onMouseMove={(event) => {
                          const rect =
                            containerRef.current?.getBoundingClientRect();
                          if (!rect) return;

                          setTooltip({
                            countyName,
                            pctOfTotal: pct,
                            rawValue: rawNum,
                            x: event.clientX - rect.left + 12,
                            y: event.clientY - rect.top - 12,
                          });
                        }}
                        onMouseLeave={() => setTooltip(null)}
                      />
                    );
                  })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>
      </div>

      {/* Legend */}
      {showLegend ? (
        <div className="absolute right-2 bottom-2 z-10 rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-md">
          <div className="mb-1 text-[11px] font-[Poppins] font-semibold text-gray-800">
            Visit Intensity
          </div>
          <div className="h-2 w-28 rounded bg-gradient-to-r from-blue-100 to-blue-700" />
          <div className="mt-1 flex justify-between text-[10px] font-[Poppins] text-gray-600">
            <span>Low</span>
            <span>High</span>
          </div>
        </div>
      ) : null}

      {/* Tooltip */}
      {tooltip && (
        <div
          className="absolute z-20 pointer-events-none"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform: "translateY(-100%)",
          }}
        >
          <ChartTooltip
            active
            label={tooltip.countyName}
            payload={[
              {
                dataKey: "raw",
                name: valueLabel,
                value: tooltip.rawValue ?? 0,
              },
              {
                dataKey: "pct",
                name: intensityLabel,
                value: tooltip.pctOfTotal,
              },
            ]}
            series={{
              raw: {
                label: valueLabel,
                color: "#7987FF",
                formatter: (v) => Number(v).toLocaleString(),
              },
              pct: {
                label: intensityLabel,
                color: "#7987FF",
                formatter: (v) => `${Number(v).toFixed(1)}%`,
              },
            }}
            showEmptyState={false}
          />
        </div>
      )}
    </div>
  );
}

export type { CountyId };
