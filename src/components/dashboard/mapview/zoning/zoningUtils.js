import {
  area as turfArea,
  bbox,
  intersect,
  polygon as turfPolygon,
} from "@turf/turf";
import { ZONE_COLORS, ZONE_TEMPLATES } from "../../../../constants/zoning";

export const DEFAULT_MAP_CENTER = [20.135245, 77.156935];

export const getZoneColor = (level) => ZONE_COLORS[level] || "#22c55e";

export const formatPercent = (value) => `${Number(value).toFixed(0)}%`;

export const formatArea = (ha) => `${ha.toFixed(2)} Ha`;

/** Normalize API field geometry to [[lat, lng], ...] */
export const normalizeFieldRing = (fieldPoints) => {
  if (!Array.isArray(fieldPoints) || fieldPoints.length < 3) return [];

  return fieldPoints
    .map((pt) => {
      if (Array.isArray(pt)) {
        const lat = Number(pt[0]);
        const lng = Number(pt[1]);
        return [lat, lng];
      }
      const lat = Number(pt?.lat);
      const lng = Number(pt?.lng);
      return [lat, lng];
    })
    .filter(([lat, lng]) => !Number.isNaN(lat) && !Number.isNaN(lng));
};

export const ringToTurfPolygon = (ringLatLng) => {
  if (!ringLatLng || ringLatLng.length < 3) return null;

  const coords = ringLatLng.map(([lat, lng]) => [lng, lat]);
  const closed = [...coords];
  const first = closed[0];
  const last = closed[closed.length - 1];
  if (first[0] !== last[0] || first[1] !== last[1]) {
    closed.push([first[0], first[1]]);
  }

  return turfPolygon([closed]);
};

const latLngRingFromTurfPolygonRing = (ringLngLat) => {
  if (!ringLngLat?.length) return [];
  const isClosed =
    ringLngLat[0][0] === ringLngLat[ringLngLat.length - 1][0] &&
    ringLngLat[0][1] === ringLngLat[ringLngLat.length - 1][1];
  const open = isClosed ? ringLngLat.slice(0, -1) : ringLngLat;
  return open.map(([lng, lat]) => [lat, lng]);
};

const latLngFromIntersectGeometry = (geometry) => {
  if (!geometry) return [];

  if (geometry.type === "Polygon") {
    const ring = geometry.coordinates?.[0];
    return latLngRingFromTurfPolygonRing(ring);
  }

  if (geometry.type === "MultiPolygon") {
    let bestRing = null;
    let bestArea = 0;
    for (const poly of geometry.coordinates || []) {
      const ring = poly?.[0];
      if (!ring || ring.length < 4) continue;
      const closed = [...ring];
      const f = closed[0];
      const l = closed[closed.length - 1];
      if (f[0] !== l[0] || f[1] !== l[1]) closed.push([f[0], f[1]]);
      try {
        const a = turfArea(turfPolygon([closed]));
        if (a > bestArea) {
          bestArea = a;
          bestRing = ring;
        }
      } catch {
        /* skip invalid part */
      }
    }
    return bestRing ? latLngRingFromTurfPolygonRing(bestRing) : [];
  }

  return [];
};

/**
 * Split the farm field into internal management zones (quadrants clipped to the field polygon).
 */
export const buildManagementZonesFromField = (ringLatLng) => {
  const fieldPoly = ringToTurfPolygon(ringLatLng);
  if (!fieldPoly) return [];

  let box;
  try {
    box = bbox(fieldPoly);
  } catch {
    return [];
  }

  const [minLng, minLat, maxLng, maxLat] = box;
  const midLng = (minLng + maxLng) / 2;
  const midLat = (minLat + maxLat) / 2;

  const quads = [
    [
      [minLng, minLat],
      [midLng, minLat],
      [midLng, midLat],
      [minLng, midLat],
      [minLng, minLat],
    ],
    [
      [midLng, minLat],
      [maxLng, minLat],
      [maxLng, midLat],
      [midLng, midLat],
      [midLng, minLat],
    ],
    [
      [minLng, midLat],
      [midLng, midLat],
      [midLng, maxLat],
      [minLng, maxLat],
      [minLng, midLat],
    ],
    [
      [midLng, midLat],
      [maxLng, midLat],
      [maxLng, maxLat],
      [midLng, maxLat],
      [midLng, midLat],
    ],
  ].map((ring) => turfPolygon([ring]));

  const zones = [];
  const templates = ZONE_TEMPLATES;

  for (let i = 0; i < Math.min(quads.length, templates.length); i++) {
    let inter = null;
    try {
      inter = intersect(fieldPoly, quads[i]);
    } catch {
      inter = null;
    }

    const coords =
      inter?.geometry != null
        ? latLngFromIntersectGeometry(inter.geometry)
        : [];

    if (coords.length >= 3) {
      zones.push({ ...templates[i], coordinates: coords });
    }
  }

  if (!zones.length) {
    return [
      {
        ...templates[0],
        id: "zone-whole-field",
        name: "Field Zone",
        coordinates: [...ringLatLng],
      },
    ];
  }

  return zones;
};

export const calculateZoneAreaHa = (coordinates) => {
  if (!Array.isArray(coordinates) || coordinates.length < 3) return 0;

  const ring = coordinates.map(([lat, lng]) => [lng, lat]);
  ring.push(ring[0]);

  const areaSqM = turfArea(turfPolygon([ring]));
  return areaSqM / 10000;
};

export const calculateZoneCentroid = (coordinates) => {
  if (!coordinates?.length) return [0, 0];

  const sums = coordinates.reduce(
    (acc, [lat, lng]) => ({
      lat: acc.lat + lat,
      lng: acc.lng + lng,
    }),
    { lat: 0, lng: 0 },
  );

  return [sums.lat / coordinates.length, sums.lng / coordinates.length];
};

export const buildDashboardStats = (zones) => {
  if (!zones?.length) {
    return {
      totalZones: 0,
      avgScore: 0,
      weakZonePct: 0,
      strongZonePct: 0,
      totalAreaHa: 0,
    };
  }

  const totalZones = zones.length;
  const totalScore = zones.reduce((sum, zone) => sum + zone.productivityScore, 0);
  const weakCount = zones.filter(
    (zone) => zone.productivityLevel === "low" || zone.productivityLevel === "critical",
  ).length;
  const strongCount = zones.filter((zone) => zone.productivityLevel === "high").length;
  const totalAreaHa = zones.reduce(
    (sum, zone) => sum + calculateZoneAreaHa(zone.coordinates),
    0,
  );

  return {
    totalZones,
    avgScore: totalScore / totalZones,
    weakZonePct: (weakCount / totalZones) * 100,
    strongZonePct: (strongCount / totalZones) * 100,
    totalAreaHa,
  };
};

export const translateZone = (zone, latShift, lngShift) => ({
  ...zone,
  coordinates: zone.coordinates.map(([lat, lng]) => [lat + latShift, lng + lngShift]),
});

export const scaleZone = (zone, factor) => {
  const centroid = calculateZoneCentroid(zone.coordinates);
  return {
    ...zone,
    coordinates: zone.coordinates.map(([lat, lng]) => {
      const scaledLat = centroid[0] + (lat - centroid[0]) * factor;
      const scaledLng = centroid[1] + (lng - centroid[1]) * factor;
      return [scaledLat, scaledLng];
    }),
  };
};
