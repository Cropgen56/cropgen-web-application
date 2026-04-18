import { INDEX_LABELS, REPORT_SATELLITE_INDICES } from "./constants";

const DEFAULT_MODEL = "gpt-4o-mini";

function safeParseJson(text) {
  try {
    const cleaned = text.replace(/```json\n?|\n?```/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}

/** Rule-based row meanings when the LLM is unavailable or omits a code. */
export function buildIndexMeaningFallback(indexRows) {
  const out = {};
  if (!Array.isArray(indexRows)) return out;
  for (const row of indexRows) {
    const code = row?.code;
    if (!code) continue;
    const label = INDEX_LABELS[code] || code;
    const attention = row.status === "Attention";
    const favorable = row.status === "Favorable";
    const snapshot = row.value || "—";

    if (attention) {
      const hint =
        code === "NDMI" || code === "SMI"
          ? "Prioritize moisture checks and irrigation uniformity."
          : code === "NITROGEN"
            ? "Consider soil or tissue testing before large N applications."
            : code === "SOC"
              ? "Validate with organic-matter sampling; manage residue and compaction."
              : "Ground-truth with scouting and stage-appropriate management.";
      out[code] = `${label}: the prevailing class in this scene (${snapshot}) warrants attention—${hint}`;
    } else if (favorable) {
      out[code] = `${label}: the dominant response (${snapshot}) is in a favorable range for this index; keep monitoring through the season.`;
    } else {
      out[code] = `${label}: signals are mixed (${snapshot}); treat as moderate and combine with local field knowledge.`;
    }
  }
  return out;
}

function mergeIndexMeanings(parsed, fb, indexRows) {
  const base = { ...(fb.indexMeanings || buildIndexMeaningFallback(indexRows)) };
  const fromModel = parsed?.indexMeanings;
  if (!fromModel || typeof fromModel !== "object") return base;
  for (const code of REPORT_SATELLITE_INDICES) {
    const v = fromModel[code];
    if (typeof v === "string" && v.trim()) base[code] = v.trim();
  }
  return base;
}

export function buildFallbackInsights({ fieldName, indexRows }) {
  const stressed = indexRows.filter((r) => r.status === "Attention").length;
  const diagnosis =
    stressed > 2
      ? "Overall farm health shows multiple indices in the attention range; targeted nutrition and water management are advised."
      : "Overall farm health is stable with localized variability typical for the season.";

  return {
    healthSummary: `Satellite analysis for ${fieldName} indicates a mixed canopy and soil signal. Dominant legend classes suggest monitoring ${stressed > 1 ? "moisture and nutrient balance" : "ongoing crop development"} through the next growth window.`,
    soilCondition:
      "Soil moisture and organic proxies (SMI / SOC) should be read together with field sampling; satellite layers highlight relative patterns across the parcel.",
    farmPerformance:
      "Vegetation indices (NDVI / EVI / SAVI) describe canopy performance relative to surrounding conditions and recent cloud-free imagery.",
    risks: [
      {
        id: "nutrient",
        label: "Nutrient deficiency",
        active: stressed > 0,
        detail: "Vegetation or nitrogen proxies may indicate a need for tissue or soil testing.",
      },
      {
        id: "water",
        label: "Water stress",
        active: stressed > 1,
        detail: "NDMI / SMI patterns can flag areas to review for irrigation uniformity.",
      },
      {
        id: "dryness",
        label: "Soil dryness",
        active: false,
        detail: "No severe dryness signature flagged in the dominant satellite classes.",
      },
      {
        id: "crop",
        label: "Crop stress",
        active: stressed > 2,
        detail: "Multiple indices suggest reviewing agronomic inputs and scouting high-stress zones.",
      },
    ],
    recommendations: {
      fertilizer:
        "Schedule a split application aligned with crop stage; validate with soil/tissue tests on low-NDVI zones.",
      irrigation:
        "Audit emitters or flood advance on areas with weaker NDMI/SMI response; maintain consistent soil moisture through flowering/grain fill as applicable.",
      soil:
        "Plan organic matter builds (residue, cover crops) where SOC proxy is flat; avoid compaction in wet windows.",
    },
    futurePrediction:
      "If management targets are met for the next 4–6 weeks, productivity potential can trend toward the upper band of the recent three-season range for this region.",
    productivityPercent: Math.min(92, 68 + (indexRows.length - stressed) * 3),
    diagnosis,
    indexMeanings: buildIndexMeaningFallback(indexRows),
  };
}

export async function generateFarmIntelligenceAi({
  fieldName,
  farmerName,
  indexRows,
  acre,
  cropName,
}) {
  const apiKey = process.env.REACT_APP_OPENAI_API_KEY?.trim();
  const model = process.env.REACT_APP_OPENAI_MODEL?.trim() || DEFAULT_MODEL;

  const payload = {
    fieldName,
    farmerName,
    acre,
    cropName,
    indices: indexRows,
  };

  if (!apiKey) {
    return buildFallbackInsights({ fieldName, indexRows });
  }

  const codesList = REPORT_SATELLITE_INDICES.join(", ");
  const userPrompt = `Generate professional farm intelligence analysis using this JSON:\n${JSON.stringify(payload, null, 2)}\n\nReturn ONLY valid JSON with keys:
healthSummary (string),
soilCondition (string),
farmPerformance (string),
risks (array of {id, label, active (boolean), detail (string)} for: Nutrient deficiency, Water stress, Soil dryness, Crop stress — set active true only if justified),
recommendations (object: fertilizer, irrigation, soil — each string),
futurePrediction (string),
productivityPercent (number 0-100),
diagnosis (one professional closing sentence like an agronomist report footer),
indexMeanings (object): REQUIRED. Keys exactly: ${codesList}. Each value is 1–2 sentences for a farmer explaining what that index row implies in plain agronomic language. Use only the numbers, status, and dominant class implied by indices[] for that code. Do NOT write "Dominant class covers" or repeat the table verbatim.`;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.35,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You are a senior agronomist for CropGen, an enterprise agritech platform. Be precise, conservative, and professional. Never invent measured numbers not implied by the JSON. Output JSON only.",
          },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.warn("OpenAI error:", res.status, errText);
      return buildFallbackInsights({ fieldName, indexRows });
    }

    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content;
    const parsed = typeof content === "string" ? safeParseJson(content) : null;
    if (!parsed?.healthSummary) {
      return buildFallbackInsights({ fieldName, indexRows });
    }
    const fb = buildFallbackInsights({ fieldName, indexRows });
    const indexMeanings = mergeIndexMeanings(parsed, fb, indexRows);
    return {
      ...fb,
      ...parsed,
      indexMeanings,
      risks:
        Array.isArray(parsed.risks) && parsed.risks.length > 0
          ? parsed.risks
          : fb.risks,
      recommendations: {
        ...fb.recommendations,
        ...(parsed.recommendations && typeof parsed.recommendations === "object"
          ? parsed.recommendations
          : {}),
      },
    };
  } catch (e) {
    console.warn("OpenAI request failed:", e);
    return buildFallbackInsights({ fieldName, indexRows });
  }
}
