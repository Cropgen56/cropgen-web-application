import React from "react";
import { motion } from "framer-motion";
import { Satellite } from "lucide-react";
import { INDEX_LABELS } from "./constants";

export default function SatelliteAnalysis({ rows, analysisDate }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.12 }}
      className="rounded-[12px] bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-gray-100 overflow-hidden"
    >
      <div className="px-5 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-2 bg-[#fafcfb]">
        <h2 className="text-sm font-bold uppercase tracking-wide text-[#0D6B45] flex items-center gap-2">
          <Satellite className="w-4 h-4" />
          Satellite Index Analysis
        </h2>
        {analysisDate ? (
          <span className="text-xs font-medium text-gray-500">Scene: {analysisDate}</span>
        ) : null}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-[#0D6B45] text-white">
              <th className="px-4 py-3 font-semibold">Index</th>
              <th className="px-4 py-3 font-semibold">Value / distribution</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold min-w-[220px]">Meaning</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={row.code}
                className={i % 2 === 0 ? "bg-white" : "bg-gray-50/80"}
              >
                <td className="px-4 py-3 font-semibold text-gray-900">
                  <span className="text-[#0D6B45]">{row.code}</span>
                  <span className="block text-xs font-normal text-gray-500">
                    {INDEX_LABELS[row.code] || ""}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-800">{row.value}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      row.status === "Favorable"
                        ? "bg-emerald-100 text-emerald-800"
                        : row.status === "Attention"
                          ? "bg-amber-100 text-amber-900"
                          : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {row.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600 leading-snug">{row.meaning}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.section>
  );
}
