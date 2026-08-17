/** Map VRA / SOC API responses into Zoning UI models — no invented values. */

export const VRA_LAYER_KEYS = {
  SOC: "soc_map_b64",
  N: "vra_n_b64",
  P: "vra_p_b64",
  K: "vra_k_b64",
  Combined: "combined_b64",
};

export const VRA_ZONE_COLORS = {
  Low: "#d32f2f",
  Medium: "#f9a825",
  High: "#388e3c",
};

/** Dose fraction labels match server ZONE_DOSE_FRACTION in vra_core.py */
const ZONE_DOSE_LABEL = {
  Low: "Full dose (100%)",
  Medium: "65% dose",
  High: "30% dose",
};

/**
 * Build zone rows from VRA rates for a selected nutrient.
 * Values come only from the API response.
 */
export function buildZonesFromVraRates(vraRates, nutrient = "N", fieldBoundary = []) {
  const nutrientRates = vraRates?.[nutrient];
  if (!nutrientRates || typeof nutrientRates !== "object") return [];

  return ["Low", "Medium", "High"]
    .filter((label) => nutrientRates[label])
    .map((label) => {
      const row = nutrientRates[label];
      const areaHa = Number(row.area_ha) || 0;
      const product = row.product || nutrient;
      const dose = Number(row.product_dose_kg_ha) || 0;
      const totalKg = Number(row.total_product_kg) || 0;
      const nutrientDose = Number(row.nutrient_dose_kg_ha) || 0;

      return {
        id: `vra-${nutrient.toLowerCase()}-${label.toLowerCase()}`,
        name: `${nutrient} — ${label}`,
        nutrient,
        zoneLabel: label,
        productivityLevel:
          label === "High" ? "high" : label === "Medium" ? "medium" : "critical",
        healthStatus: ZONE_DOSE_LABEL[label] || label,
        suggestedAction:
          areaHa > 0
            ? `Apply ${dose} kg/ha ${product} (${totalKg} kg total on ${areaHa.toFixed(3)} ha)`
            : `No area in ${label} zone`,
        priority:
          label === "Low"
            ? "High Priority"
            : label === "Medium"
              ? "Medium Priority"
              : "Low Priority",
        areaHa,
        areaAcres: Number(row.area_acres) || 0,
        pixelCount: Number(row.pixel_count) || 0,
        nutrientDoseKgHa: nutrientDose,
        product,
        productDoseKgHa: dose,
        totalProductKg: totalKg,
        coordinates: fieldBoundary,
        color: VRA_ZONE_COLORS[label],
      };
    });
}

export function buildAlertsFromVraRates(vraRates, nutrient = "N") {
  const nutrientRates = vraRates?.[nutrient];
  if (!nutrientRates?.Low) return [];

  const low = nutrientRates.Low;
  const areaHa = Number(low.area_ha) || 0;
  if (areaHa <= 0) return [];

  return [
    {
      id: `alert-${nutrient.toLowerCase()}-low`,
      zoneId: `vra-${nutrient.toLowerCase()}-low`,
      zoneName: `${nutrient} — Low`,
      type: `${nutrient} deficiency zone`,
      areaAffected: Number(low.area_acres)?.toFixed?.(2) ?? "0",
      possibleCause: `Satellite VRA classified this area as Low ${nutrient}`,
      recommendedAction: `Apply ${low.product_dose_kg_ha} kg/ha ${low.product} on Low ${nutrient} zones`,
      centroid: null,
    },
  ];
}

export function buildRecommendationsFromVra(vraRates, socStats, crop) {
  const recs = [];
  const cropLabel = crop && crop !== "default" ? crop : null;

  if (socStats?.mean_pct != null) {
    const mean = Number(socStats.mean_pct);
    const min = socStats.min_pct != null ? Number(socStats.min_pct) : null;
    const max = socStats.max_pct != null ? Number(socStats.max_pct) : null;
    let advice = "Sustain current organic-matter practices.";
    if (mean < 0.7) advice = "Build organic matter with compost or cover crops.";
    else if (mean < 1.2) advice = "Maintain residue and reduce tillage where possible.";

    recs.push({
      id: "rec-soc",
      title: "Soil Organic Carbon",
      description: `Field mean SOC is ${mean.toFixed(2)}%${
        min != null && max != null
          ? ` (range ${min.toFixed(2)}–${max.toFixed(2)}%)`
          : ""
      }. ${advice}`,
    });
  }

  ["N", "P", "K"].forEach((nutrient) => {
    const zones = vraRates?.[nutrient];
    if (!zones) return;

    const parts = ["Low", "Medium", "High"]
      .map((label) => {
        const z = zones[label];
        if (!z || !(Number(z.area_ha) > 0)) return null;
        return `${label}: ${Number(z.product_dose_kg_ha)} kg/ha ${z.product} on ${Number(z.area_ha).toFixed(3)} ha (${Number(z.total_product_kg)} kg)`;
      })
      .filter(Boolean);

    if (!parts.length) return;

    recs.push({
      id: `rec-${nutrient.toLowerCase()}`,
      title: `Variable Rate ${nutrient}${cropLabel ? ` · ${cropLabel}` : ""}`,
      description: parts.join(". "),
    });
  });

  return recs;
}

export function flattenVraRateRows(vraRates) {
  const rows = [];
  if (!vraRates || typeof vraRates !== "object") return rows;

  ["N", "P", "K"].forEach((nutrient) => {
    const zones = vraRates[nutrient] || {};
    ["Low", "Medium", "High"].forEach((label) => {
      const row = zones[label];
      if (!row) return;
      rows.push({
        id: `${nutrient}-${label}`,
        nutrient,
        zone: label,
        color: VRA_ZONE_COLORS[label],
        areaHa: Number(row.area_ha) || 0,
        areaAcres: Number(row.area_acres) || 0,
        nutrientDoseKgHa: Number(row.nutrient_dose_kg_ha) || 0,
        product: row.product || "—",
        productDoseKgHa: Number(row.product_dose_kg_ha) || 0,
        totalProductKg: Number(row.total_product_kg) || 0,
        pixelCount: Number(row.pixel_count) || 0,
      });
    });
  });

  return rows;
}

export function socClassEntries(socStats, { includeEmpty = false } = {}) {
  const classes = socStats?.classes;
  if (!classes || typeof classes !== "object") return [];
  const rows = Object.entries(classes).map(([label, stats]) => ({
    label,
    pixels: Number(stats?.pixels) || 0,
    ha: Number(stats?.ha) || 0,
    acres: Number(stats?.acres) || 0,
    pctArea: Number(stats?.pct_area) || 0,
  }));
  if (includeEmpty) return rows;
  return rows.filter((r) => r.pixels > 0 || r.ha > 0 || r.pctArea > 0);
}

/** SOC metadata.mean_indices → display rows */
export function socMeanIndexEntries(meanIndices) {
  if (!meanIndices || typeof meanIndices !== "object") return [];
  const order = ["NDVI", "NDWI", "SAVI", "BSI", "SWIR1", "CLAY"];
  const keys = [
    ...order.filter((k) => meanIndices[k] != null),
    ...Object.keys(meanIndices).filter((k) => !order.includes(k)),
  ];
  return keys.map((key) => ({
    key,
    value: Number(meanIndices[key]),
  }));
}

export function getVraImageUrl(images, layerKey) {
  if (!images) return null;
  const key = VRA_LAYER_KEYS[layerKey] || layerKey;
  const b64 = images[key];
  if (!b64 || typeof b64 !== "string") return null;
  const cleaned = b64.replace(/\s/g, "");
  return cleaned.startsWith("data:")
    ? cleaned
    : `data:image/png;base64,${cleaned}`;
}

/** Layers that actually have an image in the current payload */
export function availableLayerOptions(images) {
  if (!images) return [];
  return Object.entries(VRA_LAYER_KEYS)
    .filter(([, key]) => typeof images[key] === "string" && images[key].length > 0)
    .map(([label]) => label);
}
