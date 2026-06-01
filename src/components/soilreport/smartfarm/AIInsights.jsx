import React from "react";
import { motion } from "framer-motion";
import { BrainCircuit } from "lucide-react";

export default function AIInsights({
  healthSummary,
  soilCondition,
  farmPerformance,
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.16 }}
      className="rounded-[12px] border-2 border-[#344e41]/20 bg-gradient-to-br from-ember-card to-white shadow-[0_8px_32px_rgba(52,78,65,0.12)] p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <BrainCircuit className="w-6 h-6 text-[#344e41]" />
        <h2 className="text-lg font-bold text-[#344e41]">AI Generated Insights</h2>
        <span className="ml-auto text-[10px] font-bold uppercase tracking-wider text-white bg-[#344e41] px-2 py-1 rounded-md">
          Model assisted
        </span>
      </div>
      <div className="space-y-4 text-sm text-gray-800 leading-relaxed">
        <div>
          <h3 className="text-xs font-bold text-gray-500 uppercase mb-1">
            AI Health Summary
          </h3>
          <p>{healthSummary || "—"}</p>
        </div>
        <div>
          <h3 className="text-xs font-bold text-gray-500 uppercase mb-1">
            Soil Condition Explanation
          </h3>
          <p>{soilCondition || "—"}</p>
        </div>
        <div>
          <h3 className="text-xs font-bold text-gray-500 uppercase mb-1">
            Farm Performance Overview
          </h3>
          <p>{farmPerformance || "—"}</p>
        </div>
      </div>
    </motion.section>
  );
}
