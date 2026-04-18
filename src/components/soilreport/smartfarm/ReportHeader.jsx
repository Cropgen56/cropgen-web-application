import React from "react";
import { motion } from "framer-motion";
import { Download, Printer, Sparkles } from "lucide-react";
import { SATAGRO_GREEN } from "./constants";

export default function ReportHeader({
  generatedAt,
  onDownloadPdf,
  onPrint,
  isDownloading,
}) {
  const dateStr =
    generatedAt instanceof Date
      ? generatedAt.toLocaleString()
      : generatedAt
        ? new Date(generatedAt).toLocaleString()
        : new Date().toLocaleString();

  return (
    <motion.header
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[12px] bg-white shadow-[0_8px_30px_rgba(13,107,69,0.08)] border border-gray-100 overflow-hidden"
    >
      <div
        className="px-6 py-5 text-white"
        style={{
          background: `linear-gradient(135deg, ${SATAGRO_GREEN} 0%, #0a5238 100%)`,
        }}
      >
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-lg bg-white/15 p-2">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80 mb-1">
                CropGen Intelligence
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Smart Farm Intelligence Report
              </h1>
              <p className="mt-1 text-sm text-white/90 max-w-2xl">
                AI Powered Soil &amp; Farm Diagnostic Analysis
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onDownloadPdf}
              disabled={isDownloading}
              className="inline-flex items-center gap-2 rounded-[10px] bg-white px-4 py-2.5 text-sm font-semibold text-[#0D6B45] shadow-md hover:bg-gray-50 disabled:opacity-60 transition-colors"
            >
              <Download className="w-4 h-4" />
              {isDownloading ? "Preparing PDF…" : "Download PDF"}
            </button>
            <button
              type="button"
              onClick={onPrint}
              className="inline-flex items-center gap-2 rounded-[10px] bg-white/10 border border-white/30 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/15 transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
          </div>
        </div>
        <p className="mt-4 text-xs text-white/75">Generated {dateStr}</p>
      </div>
    </motion.header>
  );
}
