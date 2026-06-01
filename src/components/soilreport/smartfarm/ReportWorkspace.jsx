import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Check,
  MapPinned,
  Satellite,
  CalendarRange,
  Layers,
  Sparkles,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { REPORT_SATELLITE_INDICES } from "./constants";

export function SmartFarmReportEmptyState({ selectedField, isDesktop }) {
  const name = selectedField?.fieldName || selectedField?.farmName;

  const acres = selectedField?.acre
    ? `${Number(selectedField.acre).toFixed(2)} acres`
    : null;

  return (
    <div className="flex min-h-[min(520px,72vh)] flex-col items-center justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 14, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="w-full max-w-md overflow-hidden rounded-[24px] border border-[#D9E9E1] bg-white text-center shadow-[0_18px_55px_rgba(52,78,65,0.12)]"
      >
        <div className="relative px-8 pb-8 pt-9">
          <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#344e41] via-[#5a7c6b] to-ember-accent" />

          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#344e41]/10 ring-8 ring-[#344e41]/5">
            <MapPinned className="h-8 w-8 text-[#344e41]" />
          </div>

          {selectedField ? (
            <>
              <h2 className="text-xl font-semibold tracking-tight text-gray-900">
                {name || "Selected field"}
              </h2>

              {acres ? (
                <p className="mt-1 text-sm font-medium text-gray-500">
                  {acres}
                </p>
              ) : null}

              <p className="mt-4 text-sm leading-relaxed text-gray-600">
                Run{" "}
                <span className="font-semibold text-gray-800">
                  Smart Farm Intelligence
                </span>{" "}
                to load satellite layers, index analysis, and AI guidance.
              </p>

              <div className="mt-6 flex items-center justify-center gap-2 rounded-[14px] bg-[#344e41] px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(52,78,65,0.28)]">
                <ChevronRight className="h-4 w-4" />
                {isDesktop
                  ? "Click Generate Report in the sidebar"
                  : "Tap Generate Report above"}
              </div>
            </>
          ) : (
            <>
              <h2 className="text-xl font-semibold tracking-tight text-gray-900">
                Choose a farm
              </h2>

              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                {isDesktop
                  ? "Select a field from the farm list in the green panel on the left."
                  : "Pick a field from the dropdown at the top of the screen."}
              </p>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function CircularProgress({ progress, activeLabel, isComplete, warning }) {
  const radius = 58;
  const stroke = 10;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const safeProgress = Math.min(Math.max(progress, 0), 100);
  const strokeDashoffset =
    circumference - (safeProgress / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center">
      <div className="relative h-[150px] w-[150px]">
        {!isComplete && !warning ? (
          <motion.div
            className="absolute inset-0 rounded-full bg-[#344e41]/10 blur-xl"
            animate={{ scale: [1, 1.12, 1], opacity: [0.55, 0.9, 0.55] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        ) : null}

        <svg
          height={radius * 2}
          width={radius * 2}
          className="absolute left-4 top-4"
        >
          <circle
            stroke="#E3F1EA"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />

          <motion.circle
            stroke={warning ? "#F59E0B" : "#344e41"}
            fill="transparent"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${circumference} ${circumference}`}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            style={{
              transform: "rotate(-90deg)",
              transformOrigin: "50% 50%",
              filter: warning
                ? "drop-shadow(0 0 8px rgba(245,158,11,0.32))"
                : "drop-shadow(0 0 8px rgba(52,78,65,0.32))",
            }}
          />
        </svg>

        {!isComplete && !warning ? (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#344e41]"
            animate={{ rotate: 360 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
          />
        ) : null}

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-[96px] w-[96px] flex-col items-center justify-center rounded-full border border-[#DDECE4] bg-white shadow-[0_12px_30px_rgba(52,78,65,0.15)]">
            {isComplete ? (
              <Check className="mb-1 h-7 w-7 text-emerald-600" />
            ) : warning ? (
              <AlertCircle className="mb-1 h-7 w-7 text-amber-600" />
            ) : (
              <Sparkles className="mb-1 h-7 w-7 text-[#344e41]" />
            )}

            <span className="text-xl font-bold text-gray-900">
              {safeProgress}%
            </span>
          </div>
        </div>
      </div>

      <p className="mt-3 text-center text-sm font-semibold text-gray-900">
        {isComplete ? "Report Ready" : warning ? "Finalizing Report" : activeLabel}
      </p>
    </div>
  );
}

function MiniStep({ done, active, warning, icon: Icon, label }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className={[
          "flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-300",
          done
            ? "border-emerald-500 bg-emerald-50 text-emerald-600"
            : warning
              ? "border-amber-400 bg-amber-50 text-amber-600"
              : active
                ? "border-[#344e41] bg-[#344e41]/10 text-[#344e41] shadow-[0_0_0_6px_rgba(52,78,65,0.06)]"
                : "border-[#DFEAE4] bg-[#F7FAF8] text-gray-400",
        ].join(" ")}
      >
        {done ? (
          <Check className="h-4 w-4 stroke-[3]" />
        ) : (
          <Icon className="h-4 w-4" />
        )}
      </div>

      <span
        className={[
          "max-w-[70px] text-center text-[10px] font-semibold leading-tight",
          done
            ? "text-emerald-700"
            : warning
              ? "text-amber-700"
              : active
                ? "text-[#344e41]"
                : "text-gray-400",
        ].join(" ")}
      >
        {label}
      </span>
    </div>
  );
}

export function ReportBuildProgress({
  fieldLabel,
  ringOk,
  loadingSatelliteDates,
  datesReady,
  analysisDate,
  indicesLoadedCount = 0,
  indicesTotal,
  anyIndexLoading,
  aiRunning,
  isComplete,
  aiError,
}) {
  const [aiSeconds, setAiSeconds] = useState(0);

  const total = indicesTotal || REPORT_SATELLITE_INDICES.length || 1;

  useEffect(() => {
    if (!aiRunning || isComplete) {
      setAiSeconds(0);
      return;
    }

    const timer = setInterval(() => {
      setAiSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [aiRunning, isComplete]);

  const indexFetchesComplete =
    Boolean(analysisDate) && datesReady && !anyIndexLoading;

  // IMPORTANT: parent timeout is 10s, so warning starts after 12s
  const aiTakingLong = aiRunning && aiSeconds >= 12 && !isComplete;

  const progress = useMemo(() => {
    let value = 0;

    if (ringOk) value += 18;
    if (datesReady && !loadingSatelliteDates) value += 20;
    if (analysisDate) value += 17;

    const safeLoaded = Math.min(Number(indicesLoadedCount) || 0, total);
    value += Math.round((safeLoaded / total) * 25);

    if (isComplete) value = 100;
    else if (aiRunning) value = Math.max(value, aiTakingLong ? 94 : 84);

    return Math.min(value, 100);
  }, [
    ringOk,
    datesReady,
    loadingSatelliteDates,
    analysisDate,
    indicesLoadedCount,
    total,
    aiRunning,
    aiTakingLong,
    isComplete,
  ]);

  const activeLabel = useMemo(() => {
    if (!ringOk) return "Validating field";
    if (loadingSatelliteDates) return "Scanning satellite archive";
    if (!analysisDate) return "Selecting best scene";
    if (anyIndexLoading) return "Computing indices";
    if (aiRunning) return "Generating AI intelligence";
    if (isComplete) return "Report ready";
    return "Preparing report";
  }, [
    ringOk,
    loadingSatelliteDates,
    analysisDate,
    anyIndexLoading,
    aiRunning,
    isComplete,
  ]);

  const detailText = useMemo(() => {
    if (isComplete) return "Satellite intelligence and recommendations are ready.";
    if (aiError) return "Fallback insights were used to complete the report.";
    if (aiTakingLong) return "Finalizing report with fallback insights...";
    if (anyIndexLoading) {
      return `Processing satellite layers ${Math.min(
        indicesLoadedCount,
        total,
      )}/${total}.`;
    }
    if (analysisDate) return `Using acquisition date ${analysisDate}.`;
    if (datesReady) return "Cloud metadata loaded. Choosing the clearest scene.";
    if (loadingSatelliteDates) return "Scanning recent scenes for your farm boundary.";
    return "Preparing report generation.";
  }, [
    isComplete,
    aiError,
    aiTakingLong,
    anyIndexLoading,
    indicesLoadedCount,
    total,
    analysisDate,
    datesReady,
    loadingSatelliteDates,
  ]);

  const steps = [
    {
      label: "Boundary",
      done: ringOk,
      active: !ringOk,
      warning: false,
      icon: MapPinned,
    },
    {
      label: "Archive",
      done: datesReady && !loadingSatelliteDates,
      active: loadingSatelliteDates,
      warning: false,
      icon: Satellite,
    },
    {
      label: "Scene",
      done: Boolean(analysisDate) && datesReady,
      active: datesReady && !analysisDate && !isComplete,
      warning: false,
      icon: CalendarRange,
    },
    {
      label: "Indices",
      done: indexFetchesComplete,
      active: Boolean(analysisDate) && anyIndexLoading && !isComplete,
      warning: false,
      icon: Layers,
    },
    {
      label: "AI",
      done: isComplete,
      active: aiRunning && !aiTakingLong && !isComplete,
      warning: aiTakingLong || Boolean(aiError),
      icon: Sparkles,
    },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 10, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.32, ease: "easeOut" }}
      className="mb-5 overflow-hidden rounded-[24px] border border-[#DDECE4] bg-white shadow-[0_18px_48px_rgba(52,78,65,0.12)]"
    >
      <div
        className="relative overflow-hidden px-5 py-6"
        style={{
          background:
            "radial-gradient(circle at top right, rgba(52,78,65,0.16), transparent 36%), linear-gradient(135deg, #F4FBF7 0%, #FFFFFF 50%, #EAF6F0 100%)",
        }}
      >
        <motion.div
          className="pointer-events-none absolute -left-16 -top-16 h-44 w-44 rounded-full bg-[#344e41]/10 blur-3xl"
          animate={{ scale: [1, 1.18, 1], opacity: [0.45, 0.8, 0.45] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="relative flex flex-col items-center">
          <div className="mb-4 text-center">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#344e41]">
              Building report
            </h3>

            <p className="mt-1 text-sm font-semibold text-gray-900">
              {fieldLabel || "Selected field"}
            </p>
          </div>

          <CircularProgress
            progress={progress}
            activeLabel={activeLabel}
            isComplete={isComplete}
            warning={aiTakingLong || Boolean(aiError)}
          />

          <p className="mt-3 max-w-md text-center text-xs font-medium leading-relaxed text-gray-500">
            {detailText}
          </p>

          <div className="mt-6 grid w-full max-w-xl grid-cols-5 gap-2 rounded-[18px] border border-[#DDECE4] bg-white/80 p-3 shadow-[0_10px_28px_rgba(52,78,65,0.08)] backdrop-blur">
            {steps.map((step) => (
              <MiniStep key={step.label} {...step} />
            ))}
          </div>
        </div>
      </div>

      {aiTakingLong && !isComplete ? (
        <div className="border-t border-[#F3E3B5] bg-[#FFF9E8] px-5 py-3 text-center text-xs font-medium leading-relaxed text-amber-800">
          Finalizing report with fallback insights...
        </div>
      ) : null}
    </motion.section>
  );
}