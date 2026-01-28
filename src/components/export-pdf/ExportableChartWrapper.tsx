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
    register(id, ref.current); /* Should unregister on unmount?? */
  }, [id, register]);

  return <div ref={ref}>{children}</div>;
}
