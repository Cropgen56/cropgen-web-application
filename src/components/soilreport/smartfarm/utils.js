const CLOUD_COVER_THRESHOLD = 8;

export function fieldToLngLatRing(field) {
  if (!field?.length || field.length < 3) return [];
  const coords = field.map(({ lat, lng }) => [lng, lat]);
  const a = coords[0];
  const b = coords[coords.length - 1];
  if (a[0] !== b[0] || a[1] !== b[1]) {
    coords.push([...a]);
  }
  return coords;
}

export function toISODateString(date) {
  try {
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return "";
    d.setHours(12, 0, 0, 0);
    return d.toISOString().split("T")[0];
  } catch {
    return "";
  }
}

export function pickLowCloudIsoDate(sortedNewestFirst, threshold = CLOUD_COVER_THRESHOLD) {
  if (!sortedNewestFirst?.length) return "";
  for (let i = 0; i < sortedNewestFirst.length; i++) {
    const cloud = sortedNewestFirst[i]?.value ?? 0;
    if (cloud <= threshold) return sortedNewestFirst[i].isoDate;
  }
  return sortedNewestFirst[sortedNewestFirst.length - 1]?.isoDate || "";
}

export function satelliteDatesToOptions(satelliteDates) {
  const items = satelliteDates?.items || [];
  if (!items.length) return [];

  const dateMap = new Map();
  items.forEach((item) => {
    const isoDate = toISODateString(item.date);
    if (isoDate && !dateMap.has(isoDate)) {
      dateMap.set(isoDate, {
        isoDate,
        value: item.cloud_cover ?? 0,
      });
    }
  });

  return Array.from(dateMap.values()).sort(
    (a, b) => new Date(b.isoDate) - new Date(a.isoDate),
  );
}

export function dominantLegendSummary(legend) {
  if (!Array.isArray(legend) || legend.length === 0) {
    return {
      value: "—",
      status: "No data",
      meaning: "Awaiting satellite processing",
      dominantLabel: "—",
      coveragePct: null,
    };
  }
  const sorted = [...legend].sort(
    (a, b) => (b.percent ?? 0) - (a.percent ?? 0),
  );
  const top = sorted[0];
  const label = top.label || "—";
  const pct = top.percent ?? 0;
  const value = `${pct.toFixed(1)}% · ${label}`;

  const low = /poor|stress|low|dry|deficient|bad/i.test(label);
  const high = /good|high|healthy|optimal|excellent/i.test(label);
  const mid = /fair|moderate|medium|average/i.test(label);

  let status = "Moderate";
  if (high) status = "Favorable";
  if (low) status = "Attention";
  if (mid) status = "Moderate";

  return {
    value,
    status,
    meaning: `Dominant class covers ${pct.toFixed(1)}% of the field: ${label}.`,
    dominantLabel: label,
    coveragePct: pct,
  };
}

export function polygonCentroidLatLng(field) {
  if (!field?.length) return { lat: null, lng: null };
  let lat = 0;
  let lng = 0;
  const n = field.length;
  field.forEach((p) => {
    lat += p.lat;
    lng += p.lng;
  });
  return { lat: lat / n, lng: lng / n };
}
