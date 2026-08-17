import React from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import ZoningMap from "./ZoningMap";
import { formatArea } from "./zoningUtils";
import { VRA_ZONE_COLORS } from "./vraZoningMapper";

const cardClass = "rounded-2xl border border-slate-100 bg-white p-4 shadow-sm";

const ZoneDetailView = ({
  zone,
  center,
  fieldBoundary,
  fieldName,
  sceneDate,
  cropName,
  socStats,
  onBack,
}) => {
  if (!zone) {
    return (
      <div className={`${cardClass} text-sm text-slate-600`}>
        No zone selected.
      </div>
    );
  }

  const areaLabel =
    zone.areaHa != null && zone.areaHa > 0
      ? `${formatArea(zone.areaHa)}${
          zone.areaAcres != null
            ? ` (${Number(zone.areaAcres).toFixed(3)} ac)`
            : ""
        }`
      : "—";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-4"
    >
      <section className={`${cardClass} space-y-3`}>
        <header className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <button
              type="button"
              onClick={onBack}
              className="mb-2 inline-flex items-center gap-1 text-xs font-semibold text-emerald-800"
            >
              <ArrowLeft size={14} />
              Back to Zoning
            </button>
            <h1 className="text-xl font-bold text-slate-900">{zone.name}</h1>
            <p className="text-sm text-slate-500">
              {[
                fieldName,
                cropName && cropName !== "default" ? cropName : null,
                sceneDate ? `Scene date: ${sceneDate}` : null,
              ]
                .filter(Boolean)
                .join(" · ") || "VRA Zones"}
            </p>
          </div>
        </header>

        {fieldBoundary?.length >= 3 && (
          <div className="relative">
            <ZoningMap
              zones={[]}
              alerts={[]}
              center={center}
              fieldBoundary={fieldBoundary}
              fieldName={fieldName}
              overlayImageUrl={null}
              showLayer={false}
              className="h-[280px]"
            />
            <div className="absolute right-4 top-4 rounded-xl border border-slate-100 bg-white p-3 shadow-md">
              <p className="inline-flex items-center gap-2 font-semibold text-slate-900">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{
                    backgroundColor:
                      zone.color || VRA_ZONE_COLORS[zone.zoneLabel] || "#64748b",
                  }}
                />
                {zone.name}
              </p>
              <p className="text-xs text-slate-500">Area: {areaLabel}</p>
              <p className="text-xs text-slate-500">{zone.healthStatus}</p>
            </div>
          </div>
        )}
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className={cardClass}>
          <p className="text-sm text-slate-500">Area</p>
          <p className="text-3xl font-bold text-slate-900">
            {zone.areaHa != null ? Number(zone.areaHa).toFixed(3) : "—"}
          </p>
          <p className="text-xs text-slate-500">ha</p>
        </div>
        <div className={cardClass}>
          <p className="text-sm text-slate-500">Product Dose</p>
          <p className="text-3xl font-bold text-slate-900">
            {zone.productDoseKgHa ?? "—"}
          </p>
          <p className="text-xs text-slate-500">
            kg/ha {zone.product || ""}
          </p>
        </div>
        <div className={cardClass}>
          <p className="text-sm text-slate-500">Nutrient Dose</p>
          <p className="text-3xl font-bold text-slate-900">
            {zone.nutrientDoseKgHa ?? "—"}
          </p>
          <p className="text-xs text-slate-500">
            kg/ha {zone.nutrient || ""}
          </p>
        </div>
        <div className={cardClass}>
          <p className="text-sm text-slate-500">Total Product</p>
          <p className="text-3xl font-bold text-slate-900">
            {zone.totalProductKg ?? "—"}
          </p>
          <p className="text-xs text-slate-500">
            kg
            {zone.pixelCount != null
              ? ` · ${Number(zone.pixelCount).toLocaleString()} px`
              : ""}
          </p>
        </div>
      </section>

      <section className={cardClass}>
        <h3 className="mb-2 text-base font-semibold text-slate-900">
          Application Guidance
        </h3>
        <p className="text-sm text-slate-700">{zone.suggestedAction}</p>
        {socStats?.mean_pct != null && (
          <p className="mt-3 text-xs text-slate-500">
            Mean SOC: {Number(socStats.mean_pct).toFixed(2)}%
            {socStats.min_pct != null && socStats.max_pct != null
              ? ` (min ${Number(socStats.min_pct).toFixed(2)}–max ${Number(socStats.max_pct).toFixed(2)}%)`
              : ""}
          </p>
        )}
      </section>
    </motion.div>
  );
};

export default ZoneDetailView;
