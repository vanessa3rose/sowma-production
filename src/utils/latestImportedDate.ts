type DateCarrier = {
  date?: string | null;
  metricDate?: string | null;
  lastSynced?: string | null;
};

type DateCollection = DateCarrier[] | Record<string, DateCarrier[]>;

function normalizeDate(item: DateCarrier): string | null {
  if (item.date) return item.date.slice(0, 10);

  const raw = item.metricDate ?? item.lastSynced;
  return raw ? raw.slice(0, 10) : null;
}

export function getLatestImportedDate(
  ...collections: DateCollection[]
): string | null {
  let latest: string | null = null;

  collections.forEach((collection) => {
    const groups = Array.isArray(collection)
      ? [collection]
      : Object.values(collection);

    groups.forEach((items) => {
      items.forEach((item) => {
        const date = normalizeDate(item);
        if (date && (!latest || date > latest)) {
          latest = date;
        }
      });
    });
  });

  return latest;
}
