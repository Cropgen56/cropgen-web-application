import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

const PENDING_RISKS = [
  {
    id: "pending-1",
    label: "Nutrient deficiency",
    active: false,
    detail: "AI analysis in progress…",
  },
  {
    id: "pending-2",
    label: "Water stress",
    active: false,
    detail: "AI analysis in progress…",
  },
  {
    id: "pending-3",
    label: "Soil dryness",
    active: false,
    detail: "AI analysis in progress…",
  },
  {
    id: "pending-4",
    label: "Crop stress",
    active: false,
    detail: "AI analysis in progress…",
  },
];

export default function RiskDetection({ risks }) {
  const list = risks?.length ? risks : PENDING_RISKS;

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.18 }}
      className="rounded-[12px] bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-gray-100 p-5"
    >
      <h2 className="text-sm font-bold uppercase tracking-wide text-[#0D6B45] mb-4">
        Risk Detection
      </h2>
      <div className="grid sm:grid-cols-2 gap-3">
        {list.map((risk) => (
          <div
            key={risk.id || risk.label}
            className={`rounded-[10px] border p-4 flex gap-3 ${
              risk.active
                ? "border-amber-200 bg-amber-50/50"
                : "border-gray-100 bg-gray-50/50"
            }`}
          >
            {risk.active ? (
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-bold text-gray-900 text-sm">{risk.label}</p>
              <p className="text-xs text-gray-600 mt-1 leading-snug">{risk.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.section>
  );
}
