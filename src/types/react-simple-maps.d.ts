declare module "react-simple-maps" {
  import * as React from "react";

  export type GeoFeature = {
    id: string | number;
    properties?: Record<string, unknown>;
    geometry?: unknown;
    rsmKey?: string;
  };

  export type GeographiesRenderProps = {
    geographies: GeoFeature[];
  };

  export type ComposableMapProps = React.SVGProps<SVGSVGElement> & {
    projection?: string;
    width?: number;
    height?: number;
  };

  export const ComposableMap: React.FC<ComposableMapProps>;

  export type ZoomableGroupProps = {
    children?: React.ReactNode;
    center?: [number, number];
    zoom?: number;
    minZoom?: number;
    maxZoom?: number;
    disablePanning?: boolean;
    disableZooming?: boolean;
  };

  export const ZoomableGroup: React.FC<ZoomableGroupProps>;

  export type GeographiesProps = {
    geography: unknown;
    children: (props: GeographiesRenderProps) => React.ReactNode;
  };

  export const Geographies: React.FC<GeographiesProps>;

  export type GeographyInteractionStyle = {
    default?: React.CSSProperties;
    hover?: React.CSSProperties;
    pressed?: React.CSSProperties;
  };

  export type GeographyProps = Omit<React.SVGProps<SVGPathElement>, "style"> & {
    geography: GeoFeature;
    style?: GeographyInteractionStyle;
  };

  export const Geography: React.FC<GeographyProps>;
}
