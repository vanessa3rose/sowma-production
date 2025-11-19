import { useRef, useEffect, ReactNode } from "react";

type ExportableChartWrapperProps = {
  id: string;
  register: (id: string, el: HTMLElement | null) => void;
  children: ReactNode;
};

/**
 * Wrap any chart inside this component so it can be exported.
 */
export default function ExportableChartWrapper({
  id,
  register,
  children,
}: ExportableChartWrapperProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Register chart DOM node when it becomes available
    register(id, ref.current);

    // Clean up registration when the chart is removed from the DOM
    return () => {
      register(id, null);
    };
  }, [id, register]);

  return <div ref={ref}>{children}</div>;
}
