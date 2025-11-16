export type MetricsParams = {
  provider: string;
  metric: string;
  startDate?: string;
  endDate?: string;
};

export type SocialMediaMetric = {
  id: string;
  metricName: string; // or Metric if you want to import that enum type
  metricValue: number; // ✅ match Prisma
  lastSynced?: string; // DateTime? → string in JSON
  metricDate?: string; // DateTime? → string in JSON
  // socialMedia?: { ... }  // you can add this if you need it
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
