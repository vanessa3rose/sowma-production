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
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });

  const response = await fetch(`/api/metrics?${searchParams.toString()}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch metrics: ${response.statusText}`);
  }

  const data = (await response.json()) as SocialMediaMetric[];
  return data;
}
