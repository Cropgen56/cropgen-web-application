import React from "react";
import { motion } from "framer-motion";
import {
  Check,
  Loader2,
  MapPinned,
  Satellite,
  CalendarRange,
  Layers,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { REPORT_SATELLITE_INDICES } from "./constants";

const BRAND = "#0D6B45";

export function SmartFarmReportEmptyState({ selectedField, isDesktop }) {
  const name = selectedField?.fieldName || selectedField?.farmName;
  const acres = selectedField?.acre
    ? `${Number(selectedField.acre).toFixed(2)} acres`
    : null;

  return (
    <div className="flex flex-col items-center justify-center min-h-[min(520px,72vh)] px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-md rounded-[16px] bg-white border border-gray-100 shadow-[0_8px_40px_rgba(0,0,0,0.06)] p-8 text-center"
      >
        <div
          className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl"
          style={{ backgroundColor: `${BRAND}18` }}
        >
          <MapPinned className="h-8 w-8" style={{ color: BRAND }} />
        </div>

        {selectedField ? (
          <>
            <h2 className="text-xl font-semibold text-gray-900 tracking-tight">
              {name || "Selected field"}
            </h2>
            {acres ? (
              <p className="mt-1 text-sm font-medium text-gray-500">{acres}</p>
            ) : null}
            <p className="mt-4 text-sm leading-relaxed text-gray-600">
              Run <span className="font-semibold text-gray-800">Smart Farm Intelligence</span>{" "}
              to load satellite layers, index analysis, and AI guidance for this
              parcel.
            </p>
            <div
              className="mt-6 flex items-center justify-center gap-2 rounded-[12px] px-4 py-3 text-sm font-medium text-white"
              style={{ backgroundColor: BRAND }}
            >
              <ChevronRight className="h-4 w-4 opacity-90" />
              {isDesktop
                ? "Click Generate Report in the sidebar"
                : "Tap Generate Report above"}
            </div>
          </>
        ) : (
          <>
            <h2 className="text-xl font-semibold text-gray-900 tracking-tight">
              Choose a farm
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              {isDesktop
                ? "Select a field from the farm list in the green panel on the left."
                : "Pick a field from the dropdown at the top of the screen."}{" "}
              Then generate the report to see satellite intelligence and
              recommendations.
            </p>
          </>
        )}
      </motion.div>
    </div>
  );
}

function StepRow({ title, subtitle, done, active, icon: Icon, isLast }) {
  return (
    <div
      className={`flex gap-3.5 ${isLast ? "" : "pb-4 mb-1 border-b border-gray-100"}`}
    >
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
          done
            ? "border-emerald-500 bg-emerald-50 text-emerald-600"
            : active
              ? "border-[#0D6B45] bg-[#0D6B45]/10 text-[#0D6B45]"
              : "border-gray-200 bg-gray-50 text-gray-400"
        }`}
      >
        {done ? (
          <Check className="h-4 w-4 stroke-[3]" />
        ) : active ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Icon className="h-4 w-4" />
        )}
      </div>
      <div className="min-w-0 flex-1 pt-0.5">
        <p
          className={`text-sm font-semibold ${
            done ? "text-gray-900" : active ? "text-[#0D6B45]" : "text-gray-500"
          }`}
        >
          {title}
        </p>
        <p className="mt-0.5 text-xs leading-snug text-gray-500">{subtitle}</p>
      </div>
    </div>
  );
}

export function ReportBuildProgress({
  fieldLabel,
  ringOk,
  loadingSatelliteDates,
  datesReady,
  analysisDate,
  indicesLoadedCount,
  indicesTotal,
  anyIndexLoading,
  aiRunning,
  isComplete,
}) {
  const total = indicesTotal || REPORT_SATELLITE_INDICES.length;
  const indexFetchesComplete =
    Boolean(analysisDate) && !anyIndexLoading && datesReady;
  const idxLabel = anyIndexLoading
    ? `Computing layers ${Math.min(indicesLoadedCount, total)}/${total}`
    : indexFetchesComplete
      ? `${indicesLoadedCount}/${total} layers with usable legend data`
      : `Queued (${total} layers planned)`;

  const steps = [
    {
      id: "geo",
      title: "Field boundary",
      subtitle: ringOk
        ? "Polygon is valid for satellite queries."
        : "Validating parcel geometry…",
      done: ringOk,
      active: !ringOk,
      icon: MapPinned,
    },
    {
      id: "dates",
      title: "Satellite archive",
      subtitle: loadingSatelliteDates
        ? "Scanning recent scenes for your field…"
        : datesReady
          ? "Cloud metadata loaded."
          : "Waiting for scene list…",
      done: datesReady && !loadingSatelliteDates,
      active: loadingSatelliteDates,
      icon: Satellite,
    },
    {
      id: "scene",
      title: "Best scene",
      subtitle: analysisDate
        ? `Using acquisition date ${analysisDate} (low-cloud priority).`
        : datesReady && !loadingSatelliteDates
          ? "Selecting the clearest available date…"
          : "Queued after archive load.",
      done: Boolean(analysisDate) && datesReady,
      active:
        datesReady &&
        !loadingSatelliteDates &&
        !analysisDate &&
        !isComplete,
      icon: CalendarRange,
    },
    {
      id: "idx",
      title: "Spectral indices",
      subtitle: idxLabel,
      done: indexFetchesComplete,
      active:
        Boolean(analysisDate) && anyIndexLoading && !isComplete,
      icon: Layers,
    },
    {
      id: "ai",
      title: "AI intelligence",
      subtitle: aiRunning
        ? "Drafting farm narrative, risks, and recommendations…"
        : isComplete
          ? "Report narrative ready."
          : "Starts when layers finish.",
      done: isComplete,
      active: aiRunning,
      icon: Sparkles,
    },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[14px] border border-gray-100 bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)] overflow-hidden mb-5"
    >
      <div
        className="px-5 py-3.5 border-b border-gray-100 flex flex-wrap items-center justify-between gap-2"
        style={{ background: "linear-gradient(90deg, #f8fbf9 0%, #fff 100%)" }}
      >
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wide text-[#0D6B45]">
            Building report
          </h3>
          <p className="text-sm font-semibold text-gray-900 mt-0.5">
            {fieldLabel}
          </p>
        </div>
        {!isComplete ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0D6B45]/10 px-3 py-1 text-xs font-bold text-[#0D6B45]">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            In progress
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
            <Check className="h-3.5 w-3.5 stroke-[3]" />
            Ready
          </span>
        )}
      </div>
      <div className="p-5 sm:p-6">
        <div>
          {steps.map((s, i) => (
            <StepRow key={s.id} {...s} isLast={i === steps.length - 1} />
          ))}
        </div>
      </div>
    </motion.section>
  );
}
