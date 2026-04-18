import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";

const BRAND = "#0D6B45";
const TRACK = "#e8f5ef";

function productivityBand(pct) {
  if (pct >= 75) return { label: "Strong", hint: "Upper productivity band for this scene." };
  if (pct >= 55) return { label: "Good", hint: "Solid potential with normal seasonal care." };
  if (pct >= 40) return { label: "Moderate", hint: "Room to improve with targeted inputs." };
  return { label: "Elevated risk", hint: "Review nutrition, water, and scouting priorities." };
}

export default function YieldPrediction({ productivityPercent, futurePrediction }) {
  const pctRaw =
    typeof productivityPercent === "number" && !Number.isNaN(productivityPercent)
      ? productivityPercent
      : 0;
  const pct = Math.max(0, Math.min(100, pctRaw));
  const display = Number.isInteger(pct) ? String(pct) : pct.toFixed(1);
  const band = useMemo(() => productivityBand(Math.round(pct)), [pct]);

  const r = 52;
  const stroke = 10;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.22 }}
      className="rounded-[12px] bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-gray-100 p-5"
    >
      <h2 className="text-sm font-bold uppercase tracking-wide text-[#0D6B45] mb-4 flex items-center gap-2">
        <TrendingUp className="w-4 h-4" />
        Yield &amp; Future Outlook
      </h2>
      <div className="grid md:grid-cols-2 gap-8 items-center">
        <div className="flex flex-col items-center justify-center">
          <div className="relative w-[200px] h-[200px] flex items-center justify-center">
            <svg
              width="200"
              height="200"
              viewBox="0 0 140 140"
              className="transform -rotate-90"
              aria-hidden
            >
              <circle
                cx="70"
                cy="70"
                r={r}
                fill="none"
                stroke={TRACK}
                strokeWidth={stroke}
              />
              <circle
                cx="70"
                cy="70"
                r={r}
                fill="none"
                stroke={BRAND}
                strokeWidth={stroke}
                strokeLinecap="round"
                strokeDasharray={c}
                strokeDashoffset={offset}
                className="transition-[stroke-dashoffset] duration-700 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span
                className="text-[2.75rem] font-bold leading-none tabular-nums tracking-tight"
                style={{ color: BRAND }}
              >
                {display}
                <span className="text-lg font-bold align-super text-gray-500">
                  %
                </span>
              </span>
              <span className="mt-2 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                Productivity index
              </span>
              <span className="mt-1 inline-flex rounded-full bg-[#0D6B45]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[#0D6B45]">
                {band.label}
              </span>
            </div>
          </div>
          <p className="mt-2 text-center text-xs text-gray-500 max-w-[220px] leading-snug">
            {band.hint} Scale is 0–100 for this report.
          </p>
        </div>
        <div className="rounded-[10px] bg-[#f8fbf9] border border-gray-100 p-4">
          <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">
            Future farm performance prediction
          </h3>
          <p className="text-sm text-gray-800 leading-relaxed">
            {futurePrediction || "—"}
          </p>
        </div>
      </div>
    </motion.section>
  );
}
