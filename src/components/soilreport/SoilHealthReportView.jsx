import React from "react";
import { Download, Printer, Leaf, CheckCircle2 } from "lucide-react";
import satagroLogo from "../../assets/image/login/logo.svg";

function cleanLabel(value = "") {
  return String(value)
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/^./, (s) => s.toUpperCase());
}

function getValue(value) {
  if (value == null || value === "") return "—";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function Section({ title, children }) {
  return (
    <section className="overflow-hidden rounded-xl border border-gray-300 bg-white print:rounded-none print:border-gray-400">
      <div className="border-b border-gray-300 bg-[#F3FAF6] px-4 py-2 print:border-gray-400">
        <h2 className="text-[12px] font-black uppercase tracking-[0.16em] text-[#0D6B45]">
          {title}
        </h2>
      </div>
      <div className="p-3 print:p-2">{children}</div>
    </section>
  );
}

function ReportRow({ items, columns = 3 }) {
  return (
    <div
      className={`grid border border-gray-300 ${columns === 2
        ? "grid-cols-2"
        : columns === 3
          ? "grid-cols-3"
          : columns === 4
            ? "grid-cols-4"
            : "grid-cols-6"
        }`}
    >
      {items.map(([label, value], index) => (
        <div
          key={`${label}-${index}`}
          className="flex min-h-[42px] items-center border-r border-b border-gray-300 last:border-r-0"
        >
          <div className="w-[45%] self-stretch border-r border-gray-300 bg-gray-50 px-3 py-2 text-[11px] font-black uppercase tracking-wide text-gray-500">
            {cleanLabel(label)}
          </div>
          <div className="flex-1 px-3 py-2 text-[12px] font-bold text-gray-900">
            {getValue(value)}
          </div>
        </div>
      ))}
    </div>
  );
}

function ChunkRows({ entries, columns = 3 }) {
  const rows = [];
  for (let i = 0; i < entries.length; i += columns) {
    rows.push(entries.slice(i, i + columns));
  }

  return (
    <div className="space-y-0">
      {rows.map((row, index) => (
        <ReportRow key={index} items={row} columns={columns} />
      ))}
    </div>
  );
}

function PillsRow({ obj }) {
  if (!obj || typeof obj !== "object") return null;

  return (
    <div className="flex flex-wrap gap-2 border border-gray-300 px-3 py-3">
      {Object.entries(obj).map(([key, value]) => (
        <span
          key={key}
          className="rounded-full border border-[#0D6B45]/20 bg-[#0D6B45]/5 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-[#0D6B45]"
        >
          {value === true || value === "true"
            ? cleanLabel(key)
            : `${cleanLabel(key)}: ${getValue(value)}`}
        </span>
      ))}
    </div>
  );
}

function CropContextTable({ obj }) {
  if (!obj || typeof obj !== "object") return null;

  const allEntries = Object.entries(obj);
  const firstRowKeys = ["n", "p", "k", "sos"];
  const firstRow = firstRowKeys
    .map((key) => {
      const found = allEntries.find(([k]) => k.toLowerCase() === key);
      return found || null;
    })
    .filter(Boolean);

  const usedKeys = new Set(firstRow.map(([key]) => key));
  const remaining = allEntries.filter(([key]) => !usedKeys.has(key));

  return (
    <div className="space-y-3">
      {firstRow.length > 0 ? (
        <table className="w-full border-collapse border border-gray-300 text-left text-xs">
          <thead>
            <tr className="bg-[#0D6B45] text-white">
              {firstRow.map(([key]) => (
                <th
                  key={key}
                  className="border border-[#0D6B45] px-3 py-2 font-black uppercase tracking-wide"
                >
                  {cleanLabel(key)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {firstRow.map(([key, value]) => (
                <td
                  key={key}
                  className="border border-gray-300 px-3 py-2 font-bold text-gray-900"
                >
                  {getValue(value)}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      ) : null}

      {remaining.length > 0 ? (
        <table className="w-full border-collapse border border-gray-300 text-left text-xs">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              {remaining.map(([key]) => (
                <th
                  key={key}
                  className="border border-gray-300 px-3 py-2 font-black uppercase tracking-wide"
                >
                  {cleanLabel(key)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {remaining.map(([key, value]) => (
                <td
                  key={key}
                  className="border border-gray-300 px-3 py-2 font-bold text-gray-900"
                >
                  {getValue(value)}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      ) : null}
    </div>
  );
}

function getBadgeClass(classification = "") {
  const value = classification.toLowerCase();
  if (value.includes("high")) {
    return "bg-emerald-100 text-emerald-800 border-emerald-300";
  }
  if (value.includes("low")) {
    return "bg-amber-100 text-amber-900 border-amber-300";
  }
  if (value.includes("medium") || value.includes("moderate")) {
    return "bg-blue-100 text-blue-800 border-blue-300";
  }
  return "bg-gray-100 text-gray-700 border-gray-300";
}

function MetricRow({ label, metric }) {
  if (!metric) return null;

  return (
    <tr>
      <td className="border border-gray-300 px-3 py-2 text-xs font-bold text-gray-800">
        {cleanLabel(label)}
      </td>
      <td className="border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-900">
        {metric.value != null ? metric.value : "—"}
      </td>
      <td className="border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-900">
        {metric.unit || "—"}
      </td>
      <td className="border border-gray-300 px-3 py-2">
        <span
          className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-black ${getBadgeClass(
            metric.classification
          )}`}
        >
          {metric.classification || "—"}
        </span>
      </td>
    </tr>
  );
}

function RecommendationList({ items }) {
  if (!Array.isArray(items) || items.length === 0) return null;

  return (
    <div className="border border-gray-300">
      {items.map((line, i) => (
        <div
          key={`rec-${i}`}
          className="flex items-start gap-2 border-b border-gray-300 px-3 py-2 last:border-b-0"
        >
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#0D6B45]" />
          <p className="text-xs font-semibold leading-relaxed text-gray-800">
            {line}
          </p>
        </div>
      ))}
    </div>
  );
}

export function SoilHealthReportView({
  data,
  onDownloadPdf,
  onPrint,
  isDownloading,
  reportRef,
}) {
  if (!data) return null;

  const areaEntries = data.area ? Object.entries(data.area) : [];
  const satelliteEntries = data.satelliteContext
    ? Object.entries(data.satelliteContext)
    : [];

  const metrics = data.soilMetrics || {};
  const metricEntries = Object.entries(metrics);

  return (
    <div className="min-h-screen bg-[#F4FAF6] px-4 py-5">
      <div
        ref={reportRef}
        className="pdf-export mx-auto max-w-5xl space-y-3 bg-white p-4 shadow-[0_20px_60px_rgba(0,0,0,0.08)] print:max-w-none print:space-y-2 print:p-0 print:shadow-none"
      >
        {/* REPORT HEADER */}
        <div className={`overflow-hidden rounded-[18px] bg-gradient-to-r from-[#0B3D0B] via-[#0D6B45] to-[#15803D] shadow-[0_10px_30px_rgba(13,107,69,0.18)] print:shadow-none ${isDownloading ? "pointer-events-none" : ""
          }`}>
          <div className="relative flex flex-wrap items-center justify-between gap-4 px-6 py-4 text-white">
            <div className="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-white/10 blur-2xl" />

            <div className="relative z-10 flex items-center gap-5">
              <div className="flex h-16 w-[170px] items-center justify-center rounded-xl bg-white  shadow-lg">
                <img
                  src={satagroLogo}
                  alt="Satagro"
                  className="h-10 w-[50%] object-contain"
                />
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-emerald-100">
                  SATAGRO SMART FARMING
                </p>
                <h1 className="text-[30px] font-black tracking-wide leading-none text-white">
                  Soil Health Report
                </h1>
                <p className="mt-1 text-sm font-medium text-emerald-50/90">
                  AI Powered Soil Analytics & Nutrient Assessment
                </p>
              </div>
            </div>

            {!isDownloading && (
              <div className="relative z-10 flex flex-wrap gap-2 print:hidden">
                {onDownloadPdf ? (
                  <button
                    type="button"
                    onClick={onDownloadPdf}
                    disabled={isDownloading}
                    className="inline-flex items-center gap-2 rounded-[10px] bg-white px-4 py-2 text-sm font-bold text-[#0D6B45] shadow-md hover:bg-emerald-50 disabled:opacity-60"
                  >
                    <Download className="h-4 w-4" />
                    {isDownloading ? "Preparing PDF..." : "Download PDF"}
                  </button>
                ) : null}

                {onPrint ? (
                  <button
                    type="button"
                    onClick={onPrint}
                    className="inline-flex items-center gap-2 rounded-[10px] border border-white/25 bg-white/10 px-4 py-2 text-sm font-bold text-white backdrop-blur hover:bg-white/15"
                  >
                    <Printer className="h-4 w-4" />
                    Print
                  </button>
                ) : null}
              </div>
            )}
          </div>
        </div>

        {areaEntries.length > 0 && (
          <div className="soil-section" data-section-title="Area Details">
            <Section title="Area Details">
              <ChunkRows entries={areaEntries} columns={3} />
            </Section>
          </div>
        )}

        {satelliteEntries.length > 0 && (
          <div className="soil-section" data-section-title="Satellite Context">
            <Section title="Satellite Context">
              <ChunkRows entries={satelliteEntries.slice(0, 6)} columns={3} />
            </Section>
          </div>
        )}

        {data.indicesUsed && (
          <div className="soil-section" data-section-title="Indices Used">
            <Section title="Indices Used">
              <PillsRow obj={data.indicesUsed} />
            </Section>
          </div>
        )}

        {data.cropContext && (
          <div className="soil-section" data-section-title="Crop Context">
            <Section title="Crop Context">
              <CropContextTable obj={data.cropContext} />
            </Section>
          </div>
        )}

        {metricEntries.length > 0 && (
          <div className="soil-section" data-section-title="Soil Metrics">
            <Section title="Soil Metrics Table">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-[#0D6B45] text-white">
                    <th className="border border-[#0D6B45] px-3 py-2 text-xs font-black uppercase tracking-wide">
                      Parameter
                    </th>
                    <th className="border border-[#0D6B45] px-3 py-2 text-xs font-black uppercase tracking-wide">
                      Value
                    </th>
                    <th className="border border-[#0D6B45] px-3 py-2 text-xs font-black uppercase tracking-wide">
                      Unit
                    </th>
                    <th className="border border-[#0D6B45] px-3 py-2 text-xs font-black uppercase tracking-wide">
                      Classification
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {metricEntries.map(([key, metric]) => (
                    <MetricRow key={key} label={key} metric={metric} />
                  ))}
                </tbody>
              </table>
            </Section>
          </div>
        )}

        {Array.isArray(data.fertilizerRecommendations) &&
          data.fertilizerRecommendations.length > 0 && (
            <div className="soil-section" data-section-title="Fertilizer Recommendations">
              <Section title="Fertilizer Recommendations">
                <RecommendationList items={data.fertilizerRecommendations} />
              </Section>
            </div>
          )}

        {Array.isArray(data.organizationSuggestions) &&
          data.organizationSuggestions.length > 0 &&
          data.organizationSuggestions.map((block, idx) => (
            <div
              key={block.organizationCode || `org-${idx}`}
              className="soil-section"
              data-section-title={block.title || "Organization Suggestions"}
            >
              <Section title={block.title || "Organization Suggestions"}>
                {block.organizationCode && (
                  <p className="mb-2 inline-flex rounded-md bg-gray-100 px-3 py-1 text-xs font-bold text-gray-600">
                    Organization Code: {block.organizationCode}
                  </p>
                )}
                <RecommendationList items={block.notes || []} />
              </Section>
            </div>
          ))}
      </div>
    </div>
  );
}

export default SoilHealthReportView;