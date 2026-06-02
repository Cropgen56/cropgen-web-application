import React from "react";
import { Download, Printer } from "lucide-react";

function Section({ title, children, className = "" }) {
  return (
    <section
      className={`rounded-[12px] bg-white border border-gray-100 shadow-[0_4px_20px_rgba(13,107,69,0.07)] p-5 ${className}`}
    >
      {title ? (
        <h2 className="text-sm font-bold uppercase tracking-wide text-[#0D6B45] mb-4">
          {title}
        </h2>
      ) : null}
      {children}
    </section>
  );
}

function MetricRow({ label, metric }) {
  if (!metric) return null;
  return (
    <tr className="border-b border-gray-100 last:border-0">
      <td className="px-4 py-3 font-medium text-gray-700">{label}</td>
      <td className="px-4 py-3 text-gray-900">
        {metric.value != null ? `${metric.value} ${metric.unit || ""}`.trim() : "—"}
      </td>
      <td className="px-4 py-3">
        <span
          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            metric.classification === "High"
              ? "bg-emerald-100 text-emerald-800"
              : metric.classification === "Low"
                ? "bg-amber-100 text-amber-900"
                : metric.classification === "Medium"
                  ? "bg-slate-100 text-slate-700"
                  : "bg-gray-100 text-gray-600"
          }`}
        >
          {metric.classification || "—"}
        </span>
      </td>
    </tr>
  );
}

function KeyValueGrid({ obj }) {
  if (!obj || typeof obj !== "object") return null;
  return (
    <dl className="grid sm:grid-cols-2 gap-3 text-sm">
      {Object.entries(obj).map(([key, value]) => (
        <div key={key}>
          <dt className="text-gray-500 font-mono text-xs">{key}</dt>
          <dd className="font-medium text-gray-900">
            {value != null && typeof value === "object"
              ? JSON.stringify(value)
              : String(value ?? "—")}
          </dd>
        </div>
      ))}
    </dl>
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

  const metrics = data.soilMetrics || {};
  const metricEntries = Object.entries(metrics);

  return (
    <div ref={reportRef} className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-5 pb-16">
      {(onDownloadPdf || onPrint) && (
        <div className="flex flex-wrap justify-end gap-2 print:hidden">
          {onDownloadPdf ? (
            <button
              type="button"
              onClick={onDownloadPdf}
              disabled={isDownloading}
              className="inline-flex items-center gap-2 rounded-[10px] border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50 disabled:opacity-60"
            >
              <Download className="w-4 h-4" />
              {isDownloading ? "Preparing PDF..." : "Download PDF"}
            </button>
          ) : null}
          {onPrint ? (
            <button
              type="button"
              onClick={onPrint}
              className="inline-flex items-center gap-2 rounded-[10px] border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
          ) : null}
        </div>
      )}

      {data.organizationCode ? (
        <Section title="organizationCode">
          <p className="text-sm font-medium text-gray-900">{data.organizationCode}</p>
        </Section>
      ) : null}

      {data.recommendationSource ? (
        <Section title="recommendationSource">
          <p className="text-sm font-medium text-gray-900">{data.recommendationSource}</p>
        </Section>
      ) : null}

      {data.area ? (
        <Section title="area">
          <KeyValueGrid obj={data.area} />
        </Section>
      ) : null}

      {data.satelliteContext ? (
        <Section title="satelliteContext">
          <KeyValueGrid obj={data.satelliteContext} />
        </Section>
      ) : null}

      {data.indicesUsed ? (
        <Section title="indicesUsed">
          <KeyValueGrid obj={data.indicesUsed} />
        </Section>
      ) : null}

      {data.cropContext ? (
        <Section title="cropContext">
          <KeyValueGrid obj={data.cropContext} />
        </Section>
      ) : null}

      {metricEntries.length > 0 ? (
        <Section title="soilMetrics">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-[#0D6B45] text-white">
                  <th className="px-4 py-3 font-semibold">key</th>
                  <th className="px-4 py-3 font-semibold">value</th>
                  <th className="px-4 py-3 font-semibold">classification</th>
                </tr>
              </thead>
              <tbody>
                {metricEntries.map(([key, metric]) => (
                  <MetricRow key={key} label={key} metric={metric} />
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      ) : null}

      {Array.isArray(data.fertilizerRecommendations) &&
      data.fertilizerRecommendations.length > 0 ? (
        <Section title="fertilizerRecommendations">
          <ul className="space-y-2 text-sm text-gray-800 leading-relaxed list-disc pl-5">
            {data.fertilizerRecommendations.map((line, i) => (
              <li key={`rec-${i}`}>{line}</li>
            ))}
          </ul>
        </Section>
      ) : null}

      {Array.isArray(data.organizationSuggestions) &&
      data.organizationSuggestions.length > 0
        ? data.organizationSuggestions.map((block, idx) => (
            <Section
              key={block.organizationCode || `org-${idx}`}
              title="organizationSuggestions"
            >
              {block.organizationCode ? (
                <p className="text-sm font-mono text-gray-600 mb-2">
                  organizationCode: {block.organizationCode}
                </p>
              ) : null}
              {block.title ? (
                <p className="text-sm font-semibold text-gray-900 mb-3">{block.title}</p>
              ) : null}
              <ul className="space-y-2 text-sm text-gray-800 leading-relaxed list-disc pl-5">
                {(block.notes || []).map((note, i) => (
                  <li key={`org-${i}`}>{note}</li>
                ))}
              </ul>
            </Section>
          ))
        : null}
    </div>
  );
}

export default SoilHealthReportView;
