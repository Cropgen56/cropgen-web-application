import { area as turfArea } from "@turf/turf";

export const SAMPLE_HECTARES = 1.5;
export const FULL_GEOMETRY_MAX_HECTARES = 2;
const METERS_PER_DEG_LAT = 111_320;

export function compactAoiName(farmId) {
  return `${String(farmId)}-wx`;
}

export function isMatchingAoiName(aoiName, farmId) {
  if (!aoiName || !farmId) return false;
  const id = String(farmId);
  return aoiName === id || aoiName === compactAoiName(id);
}

export function findAoiForField(aois, farmId) {
  if (!farmId || !Array.isArray(aois)) return null;
  return aois.find((aoi) => isMatchingAoiName(aoi.name, farmId)) || null;
}

function closeRing(ring) {
  const copy = ring.map((pair) => [Number(pair[0]), Number(pair[1])]);
  if (copy.length < 3) {
    throw new Error("Invalid farm polygon: minimum 3 points required");
  }
  const first = copy[0];
  const last = copy[copy.length - 1];
  if (first[0] !== last[0] || first[1] !== last[1]) {
    copy.push([...first]);
  }
  return copy;
}

function ringCentroid(ring) {
  const pts = ring.length > 1 ? ring.slice(0, -1) : ring;
  let lng = 0;
  let lat = 0;
  for (const [x, y] of pts) {
    lng += x;
    lat += y;
  }
  return { lng: lng / pts.length, lat: lat / pts.length };
}

function samplePolygonFromRing(ring, hectares = SAMPLE_HECTARES) {
  const closed = closeRing(ring);
  const { lng, lat } = ringCentroid(closed);
  const halfMeters = Math.sqrt(Number(hectares) * 10_000) / 2;
  const dLat = halfMeters / METERS_PER_DEG_LAT;
  const cosLat = Math.cos((lat * Math.PI) / 180);
  const dLng = halfMeters / (METERS_PER_DEG_LAT * (Math.abs(cosLat) || 0.2));

  return {
    type: "Polygon",
    coordinates: [
      [
        [lng - dLng, lat - dLat],
        [lng + dLng, lat - dLat],
        [lng + dLng, lat + dLat],
        [lng - dLng, lat + dLat],
        [lng - dLng, lat - dLat],
      ],
    ],
  };
}

export function buildCentroidSamplePolygonFromField(
  field,
  hectares = SAMPLE_HECTARES,
) {
  if (!Array.isArray(field) || field.length < 3) {
    throw new Error("Invalid farm polygon: minimum 3 points required");
  }
  const ring = field.map((point) => [Number(point.lng), Number(point.lat)]);
  return samplePolygonFromRing(ring, hectares);
}

export function toAoiPolygon(field) {
  return buildCentroidSamplePolygonFromField(field, SAMPLE_HECTARES);
}

export function normalizeToPolygon(input) {
  if (!input) {
    throw new Error("Geometry is missing");
  }

  if (input.type === "Polygon" && Array.isArray(input.coordinates?.[0])) {
    return { type: "Polygon", coordinates: [closeRing(input.coordinates[0])] };
  }

  if (Array.isArray(input) && input[0] && input[0].lat != null) {
    return {
      type: "Polygon",
      coordinates: [
        closeRing(input.map((point) => [Number(point.lng), Number(point.lat)])),
      ],
    };
  }

  if (Array.isArray(input) && typeof input[0]?.[0] === "number") {
    return { type: "Polygon", coordinates: [closeRing(input)] };
  }

  if (
    Array.isArray(input) &&
    Array.isArray(input[0]?.[0]) &&
    typeof input[0][0][0] === "number"
  ) {
    return { type: "Polygon", coordinates: [closeRing(input[0])] };
  }

  throw new Error("Unsupported geometry");
}

/**
 * Satellite / soil / zoning API geometry.
 * Fields already ≤ 2 ha keep their real boundary; larger fields use a 1.5 ha centroid sample.
 */
export function toApiPolygon(input) {
  const full = normalizeToPolygon(input);
  let farmAreaHa = null;
  try {
    farmAreaHa = turfArea(full) / 10_000;
  } catch {
    farmAreaHa = null;
  }

  if (farmAreaHa != null && farmAreaHa <= FULL_GEOMETRY_MAX_HECTARES) {
    return full;
  }

  return samplePolygonFromRing(full.coordinates[0], SAMPLE_HECTARES);
}
