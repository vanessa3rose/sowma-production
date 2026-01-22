export type MetricsParams = {
  provider: string;
  metric: string;
  startDate?: string;
  endDate?: string;
};

export type SocialMediaMetric = {
  id: string;
  metricName: string;
  metricValue: number;
  lastSynced?: string;
  metricDate?: string;
};

export async function fetchMetrics(params: MetricsParams) {
    const debug = import.meta.env.VITE_DEBUG_METRICS === "1";

    // Normalize params to reduce "silent empty array" issues
    const normalized: MetricsParams = {
      ...params,
      provider: params.provider?.toUpperCase?.() ?? params.provider,
      metric: params.metric?.toUpperCase?.() ?? params.metric,
      startDate: params.startDate ? String(params.startDate).slice(0, 10) : undefined,
      endDate: params.endDate ? String(params.endDate).slice(0, 10) : undefined,
    };

  const searchParams = new URLSearchParams();

  //Object.entries(params).forEach(([key, value]) => {
  Object.entries(normalized).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });

  //const response = await fetch(`/api/metrics?${searchParams.toString()}`);
  const url = `/api/metrics?${searchParams.toString()}`;
  if (debug) console.log("[fetchMetrics] GET", url);

  const response = await fetch(url);

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    if (debug) console.error("[fetchMetrics] error", response.status, response.statusText, body);
    throw new Error(`Failed to fetch metrics: ${response.statusText}`);
  }

  const data = (await response.json()) as SocialMediaMetric[];
  if (debug) console.log("[fetchMetrics] rows", { provider: normalized.provider, metric: normalized.metric, count: data.length });
  return data;
}
