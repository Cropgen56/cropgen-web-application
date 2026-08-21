/** Map cropgen_soil_vra API responses into Zoning UI models. */

export const VRA_LAYER_KEYS = {
  SOC: "SOC",
  N: "N",
  P: "P",
  K: "K",
  Combined: "OVERVIEW",
  Zones: "MANAGEMENT_ZONES",
  Moisture: "MOISTURE",
  Clay: "CLAY",
  pH: "PH",
  Vigour: "VIGOUR",
};

export const VRA_ZONE_COLORS = {
  "Very Low": "#b71c1c",
  Low: "#d32f2f",
  "Medium-Low": "#ef6c00",
  "Med-Low": "#ef6c00",
  Medium: "#f9a825",
  "Medium-High": "#9ccc65",
  "Med-High": "#9ccc65",
  High: "#388e3c",
  "Very High": "#1b5e20",
};

function zoneColor(label) {
  return VRA_ZONE_COLORS[label] || "#64748b";
}

function dosePercent(row) {
  const frac = Number(row?.dose_fraction);
  if (Number.isFinite(frac)) return Math.round(frac * 100);
  return null;
}

function doseLabel(row) {
  const pct = dosePercent(row);
  return pct != null ? `${pct}% dose` : row?.zone_class || "";
}

function productivityFromDose(row) {
  const frac = Number(row?.dose_fraction);
  if (!Number.isFinite(frac)) return "medium";
  if (frac >= 0.8) return "critical";
  if (frac >= 0.55) return "medium";
  return "high";
}

function priorityFromDose(row) {
  const frac = Number(row?.dose_fraction);
  if (!Number.isFinite(frac)) return "Medium Priority";
  if (frac >= 0.8) return "High Priority";
  if (frac >= 0.55) return "Medium Priority";
  return "Low Priority";
}

/** Highest-dose zones first (Very Low soil → full dose). */
export function orderedZoneLabels(nutrientRates) {
  if (!nutrientRates || typeof nutrientRates !== "object") return [];
  return Object.entries(nutrientRates)
    .sort(([, a], [, b]) => {
      const fa = Number(a?.dose_fraction);
      const fb = Number(b?.dose_fraction);
      if (Number.isFinite(fa) && Number.isFinite(fb) && fa !== fb) return fb - fa;
      return 0;
    })
    .map(([label]) => label);
}

export function buildZonesFromVraRates(
  vraRates,
  nutrient = "N",
  fieldBoundary = [],
) {
  const nutrientRates = vraRates?.[nutrient];
  if (!nutrientRates || typeof nutrientRates !== "object") return [];

  return orderedZoneLabels(nutrientRates)
    .filter((label) => nutrientRates[label])
    .map((label) => {
      const row = nutrientRates[label];
      const areaHa = Number(row.area_ha) || 0;
      const product = row.product || nutrient;
      const dose = Number(row.product_dose_kg_ha) || 0;
      const totalKg = Number(row.total_product_kg) || 0;
      const nutrientDose = Number(row.nutrient_dose_kg_ha) || 0;

      return {
        id: `vra-${nutrient.toLowerCase()}-${String(label).toLowerCase().replace(/\s+/g, "-")}`,
        name: `${nutrient} — ${label}`,
        nutrient,
        zoneLabel: label,
        productivityLevel: productivityFromDose(row),
        healthStatus: doseLabel(row) || label,
        suggestedAction:
          areaHa > 0
            ? `Apply ${dose} kg/ha ${product} (${totalKg} kg total on ${areaHa.toFixed(3)} ha)`
            : `No area in ${label} zone`,
        priority: priorityFromDose(row),
        areaHa,
        areaAcres: Number(row.area_acres) || 0,
        pixelCount: Number(row.pixel_count) || 0,
        nutrientDoseKgHa: nutrientDose,
        product,
        productDoseKgHa: dose,
        totalProductKg: totalKg,
        doseFraction: Number(row.dose_fraction) || null,
        soilMean: row.soil_mean ?? null,
        coordinates: fieldBoundary,
        color: zoneColor(label),
      };
    });
}

export function buildAlertsFromVraRates(vraRates, nutrient = "N") {
  const nutrientRates = vraRates?.[nutrient];
  if (!nutrientRates || typeof nutrientRates !== "object") return [];

  const labels = orderedZoneLabels(nutrientRates);
  const lowLabel = labels.find((label) => {
    const row = nutrientRates[label];
    const frac = Number(row?.dose_fraction);
    const area = Number(row?.area_ha) || 0;
    return area > 0 && (!Number.isFinite(frac) || frac >= 0.8);
  });
  if (!lowLabel) return [];

  const low = nutrientRates[lowLabel];
  const slug = String(lowLabel).toLowerCase().replace(/\s+/g, "-");
  return [
    {
      id: `alert-${nutrient.toLowerCase()}-${slug}`,
      zoneId: `vra-${nutrient.toLowerCase()}-${slug}`,
      zoneName: `${nutrient} — ${lowLabel}`,
      type: `${nutrient} deficiency zone`,
      areaAffected: Number(low.area_acres)?.toFixed?.(2) ?? "0",
      possibleCause: `Satellite VRA classified this area as ${lowLabel} ${nutrient}`,
      recommendedAction: `Apply ${low.product_dose_kg_ha} kg/ha ${low.product} on ${lowLabel} ${nutrient} zones`,
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
    else if (mean < 1.2)
      advice = "Maintain residue and reduce tillage where possible.";

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

    const parts = orderedZoneLabels(zones)
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
    orderedZoneLabels(zones).forEach((label) => {
      const row = zones[label];
      if (!row) return;
      rows.push({
        id: `${nutrient}-${label}`,
        nutrient,
        zone: label,
        color: zoneColor(label),
        areaHa: Number(row.area_ha) || 0,
        areaAcres: Number(row.area_acres) || 0,
        nutrientDoseKgHa: Number(row.nutrient_dose_kg_ha) || 0,
        product: row.product || "—",
        productDoseKgHa: Number(row.product_dose_kg_ha) || 0,
        totalProductKg: Number(row.total_product_kg) || 0,
        pixelCount: Number(row.pixel_count) || 0,
        doseFraction: Number(row.dose_fraction) || null,
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

/** param_stats from cropgen_soil_vra → display rows */
export function paramStatEntries(paramStats) {
  if (!paramStats || typeof paramStats !== "object") return [];
  const order = [
    "SOC",
    "N",
    "P",
    "K",
    "MOISTURE",
    "CLAY",
    "PH",
    "EC",
    "VIGOUR",
  ];
  const keys = [
    ...order.filter((k) => paramStats[k] != null),
    ...Object.keys(paramStats).filter((k) => !order.includes(k)),
  ];
  return keys.map((key) => ({
    key,
    value: Number(paramStats[key]?.mean),
    unit: paramStats[key]?.unit || "",
    confidence: paramStats[key]?.confidence || null,
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

export function availableLayerOptions(images) {
  if (!images) return [];
  return Object.entries(VRA_LAYER_KEYS)
    .filter(
      ([, key]) => typeof images[key] === "string" && images[key].length > 0,
    )
    .map(([label]) => label);
}

export function zoneLegendFromRates(vraRates, nutrient = "N") {
  const nutrientRates = vraRates?.[nutrient];
  if (!nutrientRates) return [];
  return orderedZoneLabels(nutrientRates).map((label) => {
    const row = nutrientRates[label] || {};
    const pct = dosePercent(row);
    return {
      label: pct != null ? `${label} — ${pct}%` : label,
      color: zoneColor(label),
    };
  });
}
