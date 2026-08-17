import React, { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  Download,
  LayoutGrid,
  Leaf,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
  WandSparkles,
} from "lucide-react";
import ZoningMap from "./ZoningMap";
import { calculateZoneAreaHa, formatArea } from "./zoningUtils";
import {
  availableLayerOptions,
  getVraImageUrl,
  VRA_ZONE_COLORS,
} from "./vraZoningMapper";

const cardClass = "rounded-2xl border border-slate-100 bg-white p-4 shadow-sm";

const NUTRIENT_OPTIONS = ["N", "P", "K"];

const SOC_LEGEND = [
  { label: "Very Low (<0.3%)", color: "#3d1c00" },
  { label: "Low (0.3–0.7%)", color: "#c17f00" },
  { label: "Medium (0.7–1.2%)", color: "#e8c840" },
  { label: "High (1.2–2.0%)", color: "#4caf50" },
  { label: "Very High (>2.0%)", color: "#1b5e20" },
];

const VRA_ZONE_LEGEND = [
  { label: "Low — full dose", color: VRA_ZONE_COLORS.Low },
  { label: "Medium — 65%", color: VRA_ZONE_COLORS.Medium },
  { label: "High — 30%", color: VRA_ZONE_COLORS.High },
];

const downloadTextFile = (filename, text) => {
  if (!text) return;
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

const downloadBase64Png = (filename, dataUrl) => {
  if (!dataUrl) return;
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  a.click();
};

const ZoningDashboardView = ({
  zones,
  center,
  fieldBoundary,
  fieldName,
  fieldCropName,
  loading,
  recommendations = [],
  images,
  activeLayer,
  setActiveLayer,
  activeNutrient,
  setActiveNutrient,
  runVraAnalysis,
  analysisDate,
  setAnalysisDate,
  socStats,
  socClasses = [],
  rateRows = [],
  textReport,
  hasGenerated,
  error,
  sceneDate,
  cloudCover,
  cropName,
  availableDates = [],
  meanIndices = [],
  socAreaHa = null,
  socAreaAcres = null,
  collection = null,
  resM = null,
}) => {
  const fieldAreaHa =
    socAreaHa != null && Number(socAreaHa) > 0
      ? Number(socAreaHa)
      : fieldBoundary?.length >= 3
        ? calculateZoneAreaHa(fieldBoundary)
        : 0;

  const layerOptions = useMemo(() => {
    const fromImages = availableLayerOptions(images);
    return fromImages.length ? fromImages : ["SOC", "N", "P", "K", "Combined"];
  }, [images]);

  const overlayImageUrl = useMemo(
    () => getVraImageUrl(images, activeLayer),
    [images, activeLayer],
  );

  const nutrientRows = useMemo(
    () => rateRows.filter((r) => r.nutrient === activeNutrient),
    [rateRows, activeNutrient],
  );

  const lowAreaPct = useMemo(() => {
    const total = nutrientRows.reduce((s, r) => s + r.areaHa, 0);
    const low = nutrientRows.find((r) => r.zone === "Low")?.areaHa || 0;
    if (!total) return null;
    return (low / total) * 100;
  }, [nutrientRows]);

  const highAreaPct = useMemo(() => {
    const total = nutrientRows.reduce((s, r) => s + r.areaHa, 0);
    const high = nutrientRows.find((r) => r.zone === "High")?.areaHa || 0;
    if (!total) return null;
    return (high / total) * 100;
  }, [nutrientRows]);

  const handleExport = () => {
    if (textReport) {
      downloadTextFile(
        `vra-report-${fieldName || "field"}-${sceneDate || analysisDate}.txt`,
        textReport,
      );
    }
    const img = overlayImageUrl || getVraImageUrl(images, "Combined");
    if (img) {
      downloadBase64Png(
        `zoning-${activeLayer}-${fieldName || "field"}-${sceneDate || analysisDate}.png`,
        img,
      );
    }
  };

  const metaBits = [
    fieldCropName || null,
    cropName && cropName !== "default" ? `Crop: ${cropName}` : null,
    sceneDate ? `Scene date: ${sceneDate}` : null,
    cloudCover != null ? `Cloud cover: ${Number(cloudCover).toFixed(1)}%` : null,
    collection || null,
    resM != null ? `${resM} m` : null,
  ].filter(Boolean);

  const hasField = fieldBoundary?.length >= 3;

  // Before analysis: map + generate panel (fills the page, clear CTA)
  if (!hasGenerated && !loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="space-y-4"
      >
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 md:text-2xl">
              Farm Zoning Analysis
            </h1>
            <p className="mt-1 max-w-xl text-sm text-slate-500">
              SOC & VRA analysis
            </p>
          </div>
          {fieldName && (
            <div className="rounded-lg border border-ember-border bg-white px-3 py-2 text-sm text-slate-600 shadow-sm">
              Field{" "}
              <span className="font-semibold text-ember-sidebar">
                {fieldName}
              </span>
              {fieldCropName ? (
                <span className="text-slate-400"> · {fieldCropName}</span>
              ) : null}
            </div>
          )}
        </header>

        <div className="grid gap-4 lg:grid-cols-5 lg:items-stretch">
          <section
            className={`${cardClass} overflow-hidden p-0 lg:col-span-3 min-h-[320px] lg:min-h-[420px]`}
          >
            {hasField ? (
              <ZoningMap
                zones={[]}
                center={center}
                fieldBoundary={fieldBoundary}
                fieldName={fieldName}
                className="h-full min-h-[320px] lg:min-h-[420px] rounded-2xl"
                showLabels={false}
                showLayer={false}
              />
            ) : (
              <div className="flex h-full min-h-[320px] flex-col items-center justify-center gap-2 bg-slate-100 px-6 text-center lg:min-h-[420px]">
                <LayoutGrid className="text-slate-400" size={36} />
                <p className="text-sm font-medium text-slate-600">
                  Choose a field with a boundary to unlock zone generation.
                </p>
              </div>
            )}
          </section>

          <section
            className={`${cardClass} flex flex-col lg:col-span-2`}
          >
            <div className="mb-5 flex items-start gap-3">
              <span className="rounded-xl bg-ember-sidebar/10 p-2.5 text-ember-sidebar">
                <WandSparkles size={22} />
              </span>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Generate Zones
                </h2>
                <p className="mt-0.5 text-sm text-slate-500">
                  {hasField
                    ? "Confirm the end date, then run live SOC & VRA analysis on this field."
                    : "Choose a field with a boundary to unlock zone generation."}
                </p>
              </div>
            </div>

            <ol className="mb-5 space-y-3 text-sm">
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ember-sidebar text-[11px] font-bold text-white">
                  1
                </span>
                <span className="pt-0.5 text-slate-600">
                  Select a field
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ember-sidebar text-[11px] font-bold text-white">
                  2
                </span>
                <span className="pt-0.5 text-slate-600">
                  End Date
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ember-sidebar text-[11px] font-bold text-white">
                  3
                </span>
                <span className="pt-0.5 text-slate-600">
                  Generate Zones
                </span>
              </li>
            </ol>

            {hasField && (
              <label className="mb-4 flex flex-col gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  End Date
                </span>
                <input
                  type="date"
                  value={analysisDate}
                  list="zoning-available-dates"
                  max={availableDates[availableDates.length - 1] || undefined}
                  onChange={(e) => setAnalysisDate?.(e.target.value)}
                  className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-ember-sidebar focus:bg-white focus:ring-2 focus:ring-ember-sidebar/20"
                />
                {availableDates.length > 0 && (
                  <datalist id="zoning-available-dates">
                    {availableDates.map((d) => (
                      <option key={d} value={d} />
                    ))}
                  </datalist>
                )}
              </label>
            )}

            <button
              type="button"
              onClick={() => runVraAnalysis?.()}
              disabled={!hasField}
              className="mt-auto inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-ember-sidebar px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-ember-sidebar-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              <WandSparkles size={16} />
              Generate Zones
            </button>

            {error && (
              <p className="mt-3 flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                <TriangleAlert size={16} className="mt-0.5 shrink-0" />
                {error}
              </p>
            )}

            <div className="mt-5 grid grid-cols-2 gap-2 border-t border-slate-100 pt-4">
              <div className="rounded-lg bg-slate-50 px-3 py-2.5">
                <Leaf size={14} className="mb-1 text-ember-sidebar" />
                <p className="text-xs font-semibold text-slate-800">
                  SOC map
                </p>
                <p className="text-[11px] text-slate-500">
                  Soil carbon classes
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 px-3 py-2.5">
                <Activity size={14} className="mb-1 text-ember-sidebar" />
                <p className="text-xs font-semibold text-slate-800">
                  VRA zones
                </p>
                <p className="text-[11px] text-slate-500">
                  N · P · K rate maps
                </p>
              </div>
            </div>
          </section>
        </div>
      </motion.div>
    );
  }

  if (loading && !hasGenerated) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="space-y-4"
      >
        <header>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 md:text-2xl">
            Farm Zoning Analysis
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Analyzing… {fieldName || "Field"}
          </p>
        </header>

        <div className="grid gap-4 lg:grid-cols-5 lg:items-stretch">
          <section
            className={`${cardClass} overflow-hidden p-0 lg:col-span-3 min-h-[320px] lg:min-h-[420px]`}
          >
            {hasField ? (
              <div className="relative h-full min-h-[320px] lg:min-h-[420px]">
                <ZoningMap
                  zones={[]}
                  center={center}
                  fieldBoundary={fieldBoundary}
                  fieldName={fieldName}
                  className="h-full min-h-[320px] lg:min-h-[420px] rounded-2xl"
                  showLabels={false}
                  showLayer={false}
                />
                <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-slate-900/25 backdrop-blur-[1px]">
                  <div className="rounded-xl bg-white/95 px-5 py-4 text-center shadow-lg">
                    <div className="mx-auto mb-3 h-1.5 w-36 overflow-hidden rounded-full bg-ember-sidebar/15">
                      <div className="h-full w-1/3 animate-pulse rounded-full bg-ember-sidebar" />
                    </div>
                    <p className="text-sm font-semibold text-slate-800">
                      Generate Zones…
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      SOC & VRA analysis
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex h-full min-h-[320px] items-center justify-center lg:min-h-[420px]">
                <div className="h-1.5 w-40 overflow-hidden rounded-full bg-ember-sidebar/15">
                  <div className="h-full w-1/3 animate-pulse rounded-full bg-ember-sidebar" />
                </div>
              </div>
            )}
          </section>

          <section className={`${cardClass} flex flex-col justify-center lg:col-span-2`}>
            <h2 className="text-lg font-semibold text-slate-900">
              Analyzing…
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              SOC & VRA analysis{" "}
              <span className="font-semibold text-ember-sidebar">
                {fieldName || "Field"}
              </span>
            </p>
            <ul className="mt-5 space-y-2 text-sm text-slate-500">
              <li className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-ember-sidebar" />
                Scene date
              </li>
              <li className="flex items-center gap-2">
                <Leaf size={14} className="text-ember-sidebar" />
                Soil carbon classes
              </li>
              <li className="flex items-center gap-2">
                <Activity size={14} className="text-ember-sidebar" />
                N · P · K rate maps
              </li>
            </ul>
          </section>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-4"
    >
      <header className="mb-2 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[18px] font-bold leading-none text-slate-900">
            Farm Zoning Analysis
          </h1>
          <p className="mt-1 text-[11px] text-slate-500">
            {metaBits.join(" · ") || "SOC & VRA analysis"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[12px] text-slate-600">
            End Date
            <input
              type="date"
              value={analysisDate}
              list="zoning-available-dates-ready"
              max={availableDates[availableDates.length - 1] || undefined}
              onChange={(e) => setAnalysisDate?.(e.target.value)}
              className="border-0 bg-transparent text-[13px] font-semibold text-slate-800 outline-none"
            />
            {availableDates.length > 0 && (
              <datalist id="zoning-available-dates-ready">
                {availableDates.map((d) => (
                  <option key={d} value={d} />
                ))}
              </datalist>
            )}
          </label>
          <button
            type="button"
            onClick={handleExport}
            disabled={!textReport && !images}
            className="inline-flex min-h-[34px] items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-[13px] font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download size={16} />
            Export
          </button>
          <button
            type="button"
            onClick={() => runVraAnalysis?.()}
            disabled={loading || !hasField}
            className="inline-flex min-h-[34px] items-center gap-2 rounded-lg bg-ember-sidebar px-5 py-2 text-[13px] font-semibold text-white shadow-sm transition hover:bg-ember-sidebar-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            <WandSparkles size={16} />
            {loading ? "Analyzing…" : "Generate Zones"}
          </button>
        </div>
      </header>

      <div className="grid gap-4 xl:grid-cols-3">
        <section className={`${cardClass} xl:col-span-2`}>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Map layer
            </span>
            {layerOptions.map((layer) => (
              <button
                key={layer}
                type="button"
                onClick={() => setActiveLayer?.(layer)}
                className={`rounded-full px-3 py-1 text-[12px] font-semibold transition ${
                  activeLayer === layer
                    ? "bg-ember-sidebar text-white"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {layer}
              </button>
            ))}
            {hasGenerated && rateRows.length > 0 && (
              <>
                <span className="ml-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Rates
                </span>
                {NUTRIENT_OPTIONS.map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setActiveNutrient?.(n)}
                    className={`rounded-full px-3 py-1 text-[12px] font-semibold transition ${
                      activeNutrient === n
                        ? "bg-slate-800 text-white"
                        : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </>
            )}
          </div>

          {fieldBoundary?.length >= 3 && (
            <div className="relative mb-3">
              <ZoningMap
                zones={[]}
                alerts={[]}
                center={center}
                fieldBoundary={fieldBoundary}
                fieldName={fieldName}
                overlayImageUrl={null}
                reservedRightInset={0}
                showLayer={false}
                className="h-[200px]"
              />
              <div className="absolute left-3 top-3 z-[400] rounded-lg border border-slate-200 bg-white/95 px-2.5 py-1.5 text-[10px] font-semibold text-slate-700 shadow">
                {fieldName || "Field"}
                {fieldAreaHa > 0 ? ` · ${formatArea(fieldAreaHa)}` : ""}
              </div>
            </div>
          )}

          <div className="overflow-hidden rounded-xl border border-slate-100 bg-[#0f0f23]">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-white/80">
                {activeLayer === "SOC"
                  ? "Soil Organic Carbon"
                  : activeLayer === "Combined"
                    ? "Combined SOC + N/P/K"
                    : `${activeLayer} variable-rate zones`}
              </p>
              {!overlayImageUrl && (
                <div className="flex flex-wrap gap-2">
                  {(activeLayer === "SOC" ? SOC_LEGEND : VRA_ZONE_LEGEND).map(
                    (item) => (
                      <span
                        key={item.label}
                        className="inline-flex items-center gap-1 text-[10px] text-white/80"
                      >
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        {item.label}
                      </span>
                    ),
                  )}
                </div>
              )}
            </div>
            {overlayImageUrl ? (
              <img
                src={overlayImageUrl}
                alt={`${activeLayer} zoning analysis`}
                className="mx-auto max-h-[520px] w-full object-contain"
              />
            ) : (
              <div className="flex h-[220px] items-center justify-center px-4 text-center text-sm text-white/60">
                {loading
                  ? "Refreshing SOC & VRA maps…"
                  : `No image returned for ${activeLayer}.`}
              </div>
            )}
          </div>

          {loading && (
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-emerald-100">
              <div className="h-full w-1/3 animate-pulse rounded-full bg-emerald-600" />
            </div>
          )}
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </section>

        <aside className={`${cardClass} bg-[#f8faf8]`}>
          <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-slate-900">
            <Sparkles size={16} className="text-emerald-700" />
            Recommendations
          </h2>
          <div className="space-y-3">
            {recommendations.length === 0 && (
              <p className="text-sm text-slate-500">
                No recommendations in this analysis response.
              </p>
            )}
            {recommendations.map((item) => (
              <div
                key={item.id}
                className="rounded-lg bg-emerald-800 p-3 text-white shadow-sm"
              >
                <p className="text-sm font-semibold">{item.title}</p>
                <p className="text-xs text-emerald-100">{item.description}</p>
              </div>
            ))}
          </div>
        </aside>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className={cardClass}>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm text-slate-500">Field area</p>
            <span className="rounded-md bg-emerald-700 p-1.5 text-white">
              <LayoutGrid size={14} />
            </span>
          </div>
          <p className="text-3xl font-bold text-slate-900">
            {fieldAreaHa > 0 ? formatArea(fieldAreaHa) : "—"}
          </p>
          <p className="text-xs text-slate-500">
            {socAreaAcres != null
              ? `${Number(socAreaAcres).toFixed(2)} Acres`
              : hasGenerated
                ? `${zones.length} ${activeNutrient} · VRA zones`
                : "From field / SOC analysis"}
          </p>
        </div>
        <div className={cardClass}>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm text-slate-500">Mean SOC %</p>
            <span className="rounded-md bg-amber-50 p-1.5 text-amber-700">
              <Leaf size={14} />
            </span>
          </div>
          <p className="text-3xl font-bold text-slate-900">
            {socStats?.mean_pct != null
              ? Number(socStats.mean_pct).toFixed(2)
              : "—"}
          </p>
          <p className="text-xs text-slate-500">
            {socStats?.min_pct != null && socStats?.max_pct != null
              ? `Min ${Number(socStats.min_pct).toFixed(2)}–Max ${Number(socStats.max_pct).toFixed(2)}%`
              : "Soil carbon classes"}
          </p>
        </div>
        <div className={cardClass}>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Low {activeNutrient} · Area
            </p>
            <span className="rounded-md bg-red-50 p-1.5 text-red-600">
              <TriangleAlert size={14} />
            </span>
          </div>
          <p className="text-3xl font-bold text-slate-900">
            {lowAreaPct != null ? `${lowAreaPct.toFixed(0)}%` : "—"}
          </p>
          <p className="text-xs text-red-600">Full-dose zones</p>
        </div>
        <div className={cardClass}>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              High {activeNutrient} · Area
            </p>
            <span className="rounded-md bg-emerald-50 p-1.5 text-emerald-700">
              <ShieldCheck size={14} />
            </span>
          </div>
          <p className="text-3xl font-bold text-slate-900">
            {highAreaPct != null ? `${highAreaPct.toFixed(0)}%` : "—"}
          </p>
          <p className="text-xs text-emerald-700">
            Reduced-rate zones
          </p>
        </div>
      </section>

      {socClasses.length > 0 && (
        <section className={cardClass}>
          <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-slate-900">
            <Activity size={16} className="text-emerald-700" />
            Soil carbon classes
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px]">
              <thead className="rounded-xl bg-emerald-900 text-left text-xs font-semibold text-white">
                <tr>
                  <th className="px-3 py-2">Class</th>
                  <th className="px-3 py-2">Pixels</th>
                  <th className="px-3 py-2">Area (ha)</th>
                  <th className="px-3 py-2">Acres</th>
                  <th className="px-3 py-2">% of field</th>
                </tr>
              </thead>
              <tbody>
                {socClasses.map((row) => (
                  <tr
                    key={row.label}
                    className="border-b border-slate-100 text-sm text-slate-700"
                  >
                    <td className="px-3 py-3 font-medium">{row.label}</td>
                    <td className="px-3 py-3">{row.pixels.toLocaleString()}</td>
                    <td className="px-3 py-3">{row.ha.toFixed(3)}</td>
                    <td className="px-3 py-3">{row.acres.toFixed(3)}</td>
                    <td className="px-3 py-3">{row.pctArea.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {socStats && (
            <p className="mt-2 text-[11px] text-slate-500">
              Mean {Number(socStats.mean_pct).toFixed(3)}% · Min{" "}
              {Number(socStats.min_pct).toFixed(3)}% · Max{" "}
              {Number(socStats.max_pct).toFixed(3)}%
              {socStats.std_pct != null
                ? ` · std ${Number(socStats.std_pct).toFixed(3)}%`
                : ""}
            </p>
          )}
        </section>
      )}

      {meanIndices.length > 0 && (
        <section className={cardClass}>
          <h3 className="mb-3 text-base font-semibold text-slate-900">
            Mean spectral indices
          </h3>
          <div className="grid gap-2 sm:grid-cols-3 xl:grid-cols-6">
            {meanIndices.map((item) => (
              <div
                key={item.key}
                className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2"
              >
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  {item.key}
                </p>
                <p className="text-lg font-bold text-slate-900">
                  {Number.isFinite(item.value) ? item.value.toFixed(5) : "—"}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {rateRows.length > 0 && (
        <section className={cardClass}>
          <h3 className="mb-3 text-base font-semibold text-slate-900">
            N · P · K rate maps
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px]">
              <thead className="rounded-xl bg-emerald-900 text-left text-xs font-semibold text-white">
                <tr>
                  <th className="px-3 py-2">Nutrient</th>
                  <th className="px-3 py-2">Zone</th>
                  <th className="px-3 py-2">Area (ha)</th>
                  <th className="px-3 py-2">Acres</th>
                  <th className="px-3 py-2">Nutrient kg/ha</th>
                  <th className="px-3 py-2">Product</th>
                  <th className="px-3 py-2">Product kg/ha</th>
                  <th className="px-3 py-2">Total kg</th>
                  <th className="px-3 py-2">Pixels</th>
                </tr>
              </thead>
              <tbody>
                {rateRows.map((row) => (
                  <tr
                    key={row.id}
                    className={`border-b border-slate-100 text-sm text-slate-700 ${
                      row.nutrient === activeNutrient ? "bg-emerald-50/60" : ""
                    }`}
                  >
                    <td className="px-3 py-3 font-semibold">{row.nutrient}</td>
                    <td className="px-3 py-3">
                      <span className="inline-flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: row.color }}
                        />
                        {row.zone}
                      </span>
                    </td>
                    <td className="px-3 py-3">{row.areaHa.toFixed(3)}</td>
                    <td className="px-3 py-3">{row.areaAcres.toFixed(3)}</td>
                    <td className="px-3 py-3">{row.nutrientDoseKgHa}</td>
                    <td className="px-3 py-3">{row.product}</td>
                    <td className="px-3 py-3">{row.productDoseKgHa}</td>
                    <td className="px-3 py-3">{row.totalProductKg}</td>
                    <td className="px-3 py-3">
                      {row.pixelCount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {(hasGenerated || textReport) && (
        <section className={cardClass}>
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                VRA field report
              </h3>
              <p className="mt-0.5 text-[11px] text-slate-500">
                Variable-rate application summary from satellite analysis
              </p>
            </div>
            {textReport && (
              <button
                type="button"
                onClick={() =>
                  downloadTextFile(
                    `vra-report-${fieldName || "field"}-${sceneDate || analysisDate}.txt`,
                    textReport,
                  )
                }
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-[12px] font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Download size={14} />
                Download .txt
              </button>
            )}
          </div>

          <div className="mb-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
            {[
              {
                label: "Crop",
                value:
                  (cropName && cropName !== "default" ? cropName : null) ||
                  fieldCropName ||
                  "—",
              },
              {
                label: "Scene date",
                value: sceneDate || analysisDate || "—",
              },
              {
                label: "Cloud cover",
                value:
                  cloudCover != null
                    ? `${Number(cloudCover).toFixed(2)}%`
                    : "—",
              },
              {
                label: "Data source",
                value: collection || "—",
              },
              {
                label: "Resolution",
                value: resM != null ? `${resM} m/px` : "—",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5"
              >
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  {item.label}
                </p>
                <p className="mt-0.5 text-sm font-semibold capitalize text-slate-900">
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          {socStats && (
            <div className="mb-4 rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-emerald-800">
                Soil organic carbon summary
              </p>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div>
                  <p className="text-[11px] text-slate-500">Mean</p>
                  <p className="text-xl font-bold text-slate-900">
                    {Number(socStats.mean_pct).toFixed(2)}%
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-500">Min</p>
                  <p className="text-xl font-bold text-slate-900">
                    {Number(socStats.min_pct).toFixed(2)}%
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-500">Max</p>
                  <p className="text-xl font-bold text-slate-900">
                    {Number(socStats.max_pct).toFixed(2)}%
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-500">
                    Field area
                  </p>
                  <p className="text-xl font-bold text-slate-900">
                    {socStats.total_area_ha != null
                      ? `${Number(socStats.total_area_ha).toFixed(2)} ha`
                      : "—"}
                  </p>
                  {socStats.total_area_acres != null && (
                    <p className="text-[11px] text-slate-500">
                      {Number(socStats.total_area_acres).toFixed(2)} Acres
                    </p>
                  )}
                </div>
              </div>
              {socClasses.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {socClasses.map((row) => (
                    <span
                      key={row.label}
                      className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-white px-2.5 py-1 text-[11px] text-slate-700"
                    >
                      <span className="font-medium">{row.label}</span>
                      <span className="text-slate-500">
                        {row.ha.toFixed(3)} ha · {row.pctArea.toFixed(0)}%
                      </span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {rateRows.length > 0 && (
            <div className="mb-4">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Nutrient zones &amp; application rates
              </p>
              <div className="grid gap-3 xl:grid-cols-3">
                {NUTRIENT_OPTIONS.map((nutrient) => {
                  const rows = rateRows.filter(
                    (r) => r.nutrient === nutrient && r.areaHa > 0,
                  );
                  if (!rows.length) return null;
                  const product = rows[0]?.product || nutrient;
                  return (
                    <div
                      key={nutrient}
                      className="overflow-hidden rounded-xl border border-slate-100"
                    >
                      <div className="flex items-center justify-between bg-emerald-900 px-3 py-2 text-white">
                        <span className="text-sm font-semibold">
                          {nutrient}
                        </span>
                        <span className="text-[11px] text-emerald-100">
                          {product}
                        </span>
                      </div>
                      <div className="divide-y divide-slate-100">
                        {rows.map((row) => (
                          <div
                            key={row.id}
                            className="flex items-center justify-between gap-2 px-3 py-2.5 text-sm"
                          >
                            <span className="inline-flex items-center gap-2 font-medium text-slate-800">
                              <span
                                className="h-2 w-2 rounded-full"
                                style={{ backgroundColor: row.color }}
                              />
                              {row.zone}
                            </span>
                            <div className="text-right text-[12px] text-slate-600">
                              <p className="font-semibold text-slate-900">
                                {row.productDoseKgHa} kg/ha
                              </p>
                              <p>
                                {row.areaHa.toFixed(3)} ha · {row.totalProductKg}{" "}
                                kg
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Zone interpretation
            </p>
            <div className="grid gap-2 sm:grid-cols-3">
              {[
                {
                  zone: "Low",
                  color: VRA_ZONE_COLORS.Low,
                  text: "Low — full dose",
                },
                {
                  zone: "Medium",
                  color: VRA_ZONE_COLORS.Medium,
                  text: "Medium — 65%",
                },
                {
                  zone: "High",
                  color: VRA_ZONE_COLORS.High,
                  text: "High — 30%",
                },
              ].map((item) => (
                <div
                  key={item.zone}
                  className="flex items-start gap-2 rounded-lg bg-white px-3 py-2 text-[12px] text-slate-700"
                >
                  <span
                    className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span>
                    <strong className="text-slate-900">{item.zone}</strong>
                    {" — "}
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </motion.div>
  );
};

export default ZoningDashboardView;
