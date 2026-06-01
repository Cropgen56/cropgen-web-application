/** Client-side NPK display when API response predates server enrichAdvisoryForClient. */

const NUTRIENT_FIELDS = [
  { symbol: "N", label: "Nitrogen", field: "nitrogenKgPerHa" },
  { symbol: "P", label: "Phosphorous", field: "phosphorousKgPerHa" },
  { symbol: "K", label: "Potassium", field: "potassiumKgPerHa" },
];

const MATURITY_BBCH = {
  sugarcane: 90,
  wheat: 89,
  rice: 89,
};

function normalizeCropKey(name) {
  return String(name || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function resolveFarmField(advisory) {
  const ff = advisory?.farmFieldId;
  if (ff && typeof ff === "object") return ff;
  return null;
}

function isHarvestStage(plantGrowthActivity, farmField) {
  const bbch = Number(plantGrowthActivity?.bbchStage);
  const stageName = (plantGrowthActivity?.stageName || "").toLowerCase();
  if (stageName.includes("maturity") || stageName.includes("harvest")) {
    return true;
  }
  const maturity =
    MATURITY_BBCH[normalizeCropKey(farmField?.cropName)] ?? 85;
  if (Number.isFinite(bbch) && bbch >= maturity) return true;
  return false;
}

function allNpkZero(npk) {
  const keys = ["nitrogenKgPerHa", "phosphorousKgPerHa", "potassiumKgPerHa"];
  return keys.every(
    (k) =>
      (Number(npk?.available?.[k]) || 0) === 0 &&
      (Number(npk?.required?.[k]) || 0) === 0,
  );
}

function formatKg(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.round(n * 10) / 10;
}

function buildGrowthStageLabel(plantGrowthActivity) {
  if (!plantGrowthActivity?.stageName) return null;
  const bbch = plantGrowthActivity.bbchStage;
  const bbchPart =
    bbch != null && Number.isFinite(Number(bbch)) ? ` (BBCH ${bbch})` : "";
  return `${plantGrowthActivity.stageName}${bbchPart}`;
}

export function attachClientNpkDisplay(advisory) {
  if (!advisory?.npkManagement || advisory.npkManagement.display) {
    return advisory;
  }

  const npkManagement = advisory.npkManagement;
  const plantGrowthActivity = advisory.plantGrowthActivity;
  const farmField = resolveFarmField(advisory);
  const isHarvest = isHarvestStage(plantGrowthActivity, farmField);
  const allZero = allNpkZero(npkManagement);
  const cropName = farmField?.cropName || "Crop";
  const variety = farmField?.variety || "";
  const varietySuffix = variety ? ` (${variety})` : "";
  const cropAgeDays = plantGrowthActivity?.cropAgeDays;

  let view = "chart";
  if (allZero) view = "zero_baseline";
  else if (isHarvest) view = "harvest_banner";

  const hectare =
    Number(npkManagement?.area?.hectare) > 0
      ? Number(npkManagement.area.hectare)
      : Number(farmField?.acre) > 0
        ? Number(farmField.acre) * 0.40468564224
        : null;

  const nutrients = NUTRIENT_FIELDS.map(({ symbol, label, field }) => {
    const deficitPerHa = formatKg(npkManagement.deficit?.[field]);
    const applyKg =
      hectare != null && deficitPerHa > 0
        ? formatKg(deficitPerHa * hectare)
        : 0;
    return {
      symbol,
      label,
      current: Math.round(Number(npkManagement.available?.[field]) || 0),
      required: Math.round(Number(npkManagement.required?.[field]) || 0),
      deficitPerHa,
      applyKg,
      deficitLabel:
        deficitPerHa > 0 ? `Deficit: ${deficitPerHa} kg/ha` : null,
      applyMessage:
        applyKg > 0
          ? `Apply ${applyKg} kg ${label}`
          : deficitPerHa > 0
            ? `Apply ${deficitPerHa} kg/ha ${label}`
            : null,
    };
  });

  const applyItems = nutrients
    .filter((n) => n.applyKg > 0)
    .map((n) => `${n.applyKg} kg ${n.label}`);

  const display = {
    view,
    unit: "kg/ha",
    growthStageLabel: buildGrowthStageLabel(plantGrowthActivity),
    growthStageSubtitle:
      cropAgeDays != null && Number.isFinite(Number(cropAgeDays))
        ? `Day ${cropAgeDays} · NPK targets match this stage`
        : null,
    bannerTitle: null,
    bannerDescription: null,
    statusCards: null,
    legend: null,
    nutrients: view === "chart" ? nutrients : null,
    applySummary:
      applyItems.length > 0
        ? `Recommended for your field (${applyItems.join(", ")}).`
        : null,
    recommendationFallback:
      "Run a fresh soil test and satellite refresh for this field, then apply a stage-wise NPK plan based on crop age and expected yield.",
  };

  if (view === "zero_baseline") {
    display.bannerTitle = isHarvest
      ? `Harvest phase completed for ${cropName}${varietySuffix}`
      : `NPK baseline currently detected for ${cropName}${varietySuffix}`;
    display.bannerDescription =
      "Current and target NPK values are at baseline (0 kg/ha). This can happen post-harvest or when nutrient recommendations are not yet computed.";
    display.statusCards = [
      { key: "status", title: "Status", body: "No active nutrient demand" },
      { key: "next", title: "Suggested Next", body: "Run post-harvest soil test" },
      {
        key: "planning",
        title: "Planning",
        body: "Prepare nutrient plan for next crop cycle",
      },
    ];
  } else if (view === "harvest_banner") {
    display.bannerTitle = `Final harvest stage reached for ${cropName}${varietySuffix}`;
  } else {
    display.legend = {
      current: "Current Uptake",
      required: "Target Required",
    };
  }

  return {
    ...advisory,
    npkManagement: { ...npkManagement, display },
    cropStage: {
      isHarvestStage: isHarvest,
      bbchStage: plantGrowthActivity?.bbchStage ?? null,
      stageName: plantGrowthActivity?.stageName ?? null,
      cropAgeDays: cropAgeDays ?? null,
      label: buildGrowthStageLabel(plantGrowthActivity),
    },
  };
}
