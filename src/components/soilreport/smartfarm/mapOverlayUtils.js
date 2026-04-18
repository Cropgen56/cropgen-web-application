/** Leaflet-style [[south, west], [north, east]] bounds for ImageOverlay */

export function isValidImageBounds(bounds) {
  if (!bounds || !Array.isArray(bounds) || bounds.length !== 2) return false;
  const [sw, ne] = bounds;
  if (!Array.isArray(sw) || !Array.isArray(ne)) return false;
  if (sw.length !== 2 || ne.length !== 2) return false;
  const [swLat, swLng] = sw;
  const [neLat, neLng] = ne;
  if (
    typeof swLat !== "number" ||
    Number.isNaN(swLat) ||
    typeof swLng !== "number" ||
    Number.isNaN(swLng) ||
    typeof neLat !== "number" ||
    Number.isNaN(neLat) ||
    typeof neLng !== "number" ||
    Number.isNaN(neLng)
  ) {
    return false;
  }
  if (swLat < -90 || swLat > 90 || neLat < -90 || neLat > 90) return false;
  if (swLng < -180 || swLng > 180 || neLng < -180 || neLng > 180) return false;
  return true;
}

export function parseApiBounds(apiBounds) {
  if (!apiBounds) return null;
  try {
    if (Array.isArray(apiBounds)) {
      if (apiBounds.length === 4) {
        const [minLng, minLat, maxLng, maxLat] = apiBounds;
        if (
          typeof minLat === "number" &&
          typeof minLng === "number" &&
          typeof maxLat === "number" &&
          typeof maxLng === "number"
        ) {
          return [
            [minLat, minLng],
            [maxLat, maxLng],
          ];
        }
      } else if (apiBounds.length === 2) {
        const [first, second] = apiBounds;
        if (Array.isArray(first) && Array.isArray(second)) {
          if (first.length === 2 && second.length === 2) {
            const [firstVal0, firstVal1] = first;
            const [secondVal0, secondVal1] = second;
            if (
              typeof firstVal0 === "number" &&
              typeof firstVal1 === "number" &&
              typeof secondVal0 === "number" &&
              typeof secondVal1 === "number"
            ) {
              return [
                [firstVal1, firstVal0],
                [secondVal1, secondVal0],
              ];
            }
          }
        }
      }
    } else if (typeof apiBounds === "object") {
      if (apiBounds.southwest && apiBounds.northeast) {
        const sw = apiBounds.southwest;
        const ne = apiBounds.northeast;
        if (
          typeof sw.lat === "number" &&
          typeof sw.lng === "number" &&
          typeof ne.lat === "number" &&
          typeof ne.lng === "number"
        ) {
          return [
            [sw.lat, sw.lng],
            [ne.lat, ne.lng],
          ];
        }
      }
    }
  } catch {
    /* ignore */
  }
  return null;
}

/** positions: [lat, lng][] */
export function paddedBoundsFromPolygon(positions) {
  if (!positions?.length) return null;
  const lats = positions.map((p) => p[0]);
  const lngs = positions.map((p) => p[1]);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const padLat = (maxLat - minLat) * 0.04 || 0.002;
  const padLng = (maxLng - minLng) * 0.04 || 0.002;
  return [
    [minLat - padLat, minLng - padLng],
    [maxLat + padLat, maxLng + padLng],
  ];
}
