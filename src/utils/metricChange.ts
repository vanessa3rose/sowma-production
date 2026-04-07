export type MetricChangeSummary = {
  current: number | null;
  prev: number | null;
};

export type MetricChangePoint = {
  date: string;
};

function formatSinceDate(date: string): string {
  const parsed = new Date(date);
  return parsed.toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "2-digit",
  });
}

export function getSmallCardSinceLabel(
  points?: MetricChangePoint[] | null,
): string {
  if (!points || points.length < 2) {
    return "since latest sync";
  }

  const previousPoint = points[points.length - 2];
  return `since ${formatSinceDate(previousPoint.date)}`;
}

export function formatAbsoluteChange(
  summary?: MetricChangeSummary | null,
): string {
  if (!summary || summary.current == null || summary.prev == null) {
    return "0";
  }

  const change = summary.current - summary.prev;
  const formatted = Number.isInteger(change)
    ? change
    : Number(change.toFixed(1));

  if (formatted === 0) {
    return "0";
  }

  return `${formatted >= 0 ? "+" : ""}${formatted}`;
}
