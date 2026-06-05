import React from "react";
import { Download, CheckCircle2 } from "lucide-react";
import satagroLogo from "../../assets/image/login/logo.svg";

const THEME = "#0D6B45";
const SOFT = "#F3FAF6";

const COMPANY = {
  name: "LEACROP AGRITECH PRIVATE LIMITED",
  address:
    "87/3b/1c, Azad Wadi, Kothrud, Pune, Pune City, Maharashtra, India, 411038",
};

const DISCLAIMER =
  "Disclaimer: This report is prepared using satellite data and AI analysis. It is designed to help understand field conditions and provide recommendations. For exact soil nutrient values and scientific verification, laboratory soil testing is recommended.";

const STATIC_FALLBACK = {
  reportId: "LCA-SOIL-001",
  farmerName: "Satagro Farmer",
  villageName: "—",
  tehsil: "—",
  district: "—",
  mobileNumber: "—",
  latitudeLongitude: "—",
  currentCrop: "Default",
  previousCrop: "Default",
};

const SOIL_ROWS = [
  ["nitrogen", "N (Nitrogen)", "Kg/ha", "280-560"],
  ["phosphorus", "P (Phosphorus)", "Kg/ha", "22-56"],
  ["potassium", "K (Potassium)", "Kg/ha", "150-250"],
  ["soc", "SOC (Soil Organic Carbon)", "%", "1.0-3.0"],
  ["soilMoisture", "Soil Moisture", "%", "NA"],
  ["clayContent", "Clay Content", "%", "NA"],
  ["calcium", "Ca (Calcium)", "ppm", "500-1000"],
  ["magnesium", "Mg (Magnesium)", "ppm", "100-300"],
  ["sulfur", "S (Sulfur)", "ppm", "30-50"],
  ["boron", "B (Boron)", "ppm", "0.2-0.6"],
  ["zinc", "Zn (Zinc)", "ppm", "0.5-2.0"],
  ["copper", "Cu (Copper)", "ppm", "0.5-2.0"],
  ["iron", "Fe (Iron)", "ppm", "10-50"],
  ["manganese", "Mn (Manganese)", "ppm", "10-50"],
  ["ph", "pH", "-", "6.5-7.5"],
  ["cec", "CEC (Cation Exchange Capacity)", "Meq/100g", "-"],
];

function formatDate(value) {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) {
    return new Date().toLocaleDateString("en-IN");
  }
  return date.toLocaleDateString("en-IN");
}

function valueText(value, fallback = "—") {
  if (value === null || value === undefined || value === "") return fallback;
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function normalizeKey(key = "") {
  return String(key).toLowerCase().replace(/[\s_()-]/g, "");
}

function findMetric(metrics, wantedKey) {
  const aliases = {
    nitrogen: ["nitrogen", "n"],
    phosphorus: ["phosphorus", "p"],
    potassium: ["potassium", "k"],
    soc: ["soc", "soilorganiccarbon", "organiccarbon"],
    soilMoisture: ["soilmoisture", "moisture"],
    clayContent: ["claycontent", "clay"],
    calcium: ["calcium", "ca"],
    magnesium: ["magnesium", "mg"],
    sulfur: ["sulfur", "sulphur", "s"],
    boron: ["boron", "b"],
    zinc: ["zinc", "zn"],
    copper: ["copper", "cu"],
    iron: ["iron", "fe"],
    manganese: ["manganese", "mn"],
    ph: ["ph"],
    cec: ["cec", "cationexchangecapacity"],
  };

  const possible = aliases[wantedKey] || [wantedKey];

  const found = Object.entries(metrics || {}).find(([key]) =>
    possible.includes(normalizeKey(key))
  );

  return found?.[1] || null;
}

function getMetricValue(metric) {
  if (!metric) return "—";
  return valueText(metric.value ?? metric.available ?? metric.amount ?? metric);
}

function getMetricRemark(metric) {
  if (!metric) return "—";
  return valueText(metric.classification ?? metric.remark ?? metric.status, "—");
}

function getRemarkClass(remark = "") {
  const text = String(remark).toLowerCase();
  if (text.includes("low")) return "text-red-700";
  if (text.includes("high")) return "text-emerald-800";
  if (text.includes("medium") || text.includes("moderate")) return "text-blue-800";
  return "text-gray-800";
}

function InfoCell({ label, value }) {
  return (
    <>
      <td className="w-[18%] border border-gray-400 bg-[#F7FBF8] px-3 py-2 text-[12px] font-black text-gray-900">
        {label}
      </td>
      <td className="w-[32%] border border-gray-400 px-3 py-2 text-[12px] font-bold text-gray-800">
        {valueText(value)}
      </td>
    </>
  );
}

function RecommendationList({ items }) {
  if (!Array.isArray(items) || items.length === 0) return null;

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div
          key={index}
          className="flex gap-2 text-[13px] leading-relaxed text-gray-800"
        >
          <CheckCircle2 className="mt-[2px] h-4 w-4 shrink-0 text-[#0D6B45]" />
          <p>
            <span className="font-black text-[#0D6B45]">{index + 1}. </span>
            {item}
          </p>
        </div>
      ))}
    </div>
  );
}

function DisclaimerText() {
  return (
    <p className="mt-2 border-t border-gray-300 pt-2 text-[9px] font-semibold leading-[1.35] text-gray-600">
      {DISCLAIMER}
    </p>
  );
}

export function SoilHealthReportView({
  data,
  field,
  generatedAt,
  onDownloadPdf,
  isDownloading,
  reportRef,
}) {
  const report = data?.soilReport || data || {};
  const selectedField = data?.field || field || {};

  const metrics = report?.soilMetrics || report?.metrics || {};
  const area = report?.area || {};
  const cropContext = report?.cropContext || {};

  const farmName =
    selectedField?.fieldName ||
    selectedField?.farmName ||
    area?.fieldName ||
    STATIC_FALLBACK.farmerName;

  const latitude =
    selectedField?.field?.[0]?.lat ||
    selectedField?.lat ||
    area?.latitude ||
    report?.latitude;

  const longitude =
    selectedField?.field?.[0]?.lng ||
    selectedField?.lng ||
    area?.longitude ||
    report?.longitude;

  const info = {
    farmerName: selectedField?.farmerName || selectedField?.ownerName || farmName,
    reportId: report?.reportId || STATIC_FALLBACK.reportId,
    villageName:
      selectedField?.village ||
      selectedField?.villageName ||
      STATIC_FALLBACK.villageName,
    date: formatDate(generatedAt || data?.generatedAt || report?.generatedAt),
    tehsil: selectedField?.tehsil || STATIC_FALLBACK.tehsil,
    mobileNumber: selectedField?.mobileNumber || STATIC_FALLBACK.mobileNumber,
    district:
      selectedField?.district || selectedField?.state || STATIC_FALLBACK.district,
    latitudeLongitude:
      latitude && longitude
        ? `${Number(latitude).toFixed(6)}, ${Number(longitude).toFixed(6)}`
        : STATIC_FALLBACK.latitudeLongitude,
    currentCrop:
      selectedField?.cropName ||
      cropContext?.currentCrop ||
      report?.currentCrop ||
      STATIC_FALLBACK.currentCrop,
    previousCrop:
      selectedField?.previousCrop ||
      cropContext?.previousCrop ||
      report?.previousCrop ||
      STATIC_FALLBACK.previousCrop,
  };

  const recommendations =
    report?.fertilizerRecommendations ||
    report?.recommendations || [
      "Apply balanced nutrients based on crop requirement and soil condition.",
      "Use organic compost or well decomposed manure to improve soil organic carbon.",
      "Maintain proper irrigation scheduling to avoid nutrient leaching.",
      "Repeat soil testing periodically for better fertilizer planning.",
    ];

  return (
    <div className="min-h-screen bg-[#EEF6F1] px-4 py-5">
      <div
        ref={reportRef}
        className="pdf-export mx-auto max-w-[820px] space-y-5 print:space-y-0"
      >
        <div className="pdf-page bg-white p-5 shadow-[0_18px_60px_rgba(13,107,69,0.12)] print:shadow-none">
          <div className="flex min-h-[1085px] flex-col border-[1.5px] border-gray-500 bg-white p-3">
            <div className="grid grid-cols-[160px_1fr] border border-gray-500">
              <div className="flex h-[105px] items-center justify-center p-3">
                <div className="flex h-[72px] w-[128px] items-center justify-center overflow-hidden">
                  <img
                    src={satagroLogo}
                    alt="LeaCrop"
                    className="block h-auto max-h-[68px] w-auto max-w-[124px] object-contain"
                    style={{
                      aspectRatio: "auto",
                      objectFit: "contain",
                    }}
                  />
                </div>
              </div>

              <div className="flex flex-col items-center justify-center px-5 py-4 text-center">
                <h1 className="text-[21px] font-black uppercase tracking-[0.08em] text-[#0B3D0B]">
                  {COMPANY.name}
                </h1>
                <p className="mt-2 max-w-[520px] text-[12px] font-semibold leading-relaxed text-gray-600">
                  {COMPANY.address}
                </p>
              </div>
            </div>

            <div className="relative mt-4 text-center">
              <h2 className="text-[22px] font-black uppercase tracking-wide text-gray-950">
                Soil Report
              </h2>

              {!isDownloading && onDownloadPdf ? (
                <button
                  type="button"
                  onClick={onDownloadPdf}
                  disabled={isDownloading}
                  className="pdf-hide absolute right-0 top-0 inline-flex items-center gap-2 rounded-lg bg-[#0D6B45] px-4 py-2 text-xs font-bold text-white shadow hover:bg-[#0B3D0B] disabled:opacity-60"
                >
                  <Download className="h-4 w-4" />
                  {isDownloading ? "Preparing..." : "Download PDF"}
                </button>
              ) : null}
            </div>

            <div className="mt-4">
              <table className="w-full border-collapse">
                <tbody>
                  <tr>
                    <InfoCell label="Farmer Name" value={info.farmerName} />
                    <InfoCell label="Report ID" value={info.reportId} />
                  </tr>
                  <tr>
                    <InfoCell label="Village Name" value={info.villageName} />
                    <InfoCell label="Date" value={info.date} />
                  </tr>
                  <tr>
                    <InfoCell label="Tehsil" value={info.tehsil} />
                    <InfoCell label="Mobile Number" value={info.mobileNumber} />
                  </tr>
                  <tr>
                    <InfoCell label="District" value={info.district} />
                    <InfoCell label="Latitude, Longitude" value={info.latitudeLongitude} />
                  </tr>
                  <tr>
                    <InfoCell label="Current Crop" value={info.currentCrop} />
                    <InfoCell label="Previous Crop" value={info.previousCrop} />
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-6">
              <table className="w-full border-collapse text-center">
                <thead>
                  <tr style={{ backgroundColor: SOFT }}>
                    <th className="border border-gray-500 px-2 py-3 text-[12px] font-black text-gray-950">
                      Sr.No
                    </th>
                    <th className="border border-gray-500 px-2 py-3 text-[12px] font-black text-gray-950">
                      Soil Parameters
                    </th>
                    <th className="border border-gray-500 px-2 py-3 text-[12px] font-black text-gray-950">
                      Unit
                    </th>
                    <th className="border border-gray-500 px-2 py-3 text-[12px] font-black text-gray-950">
                      Range
                    </th>
                    <th className="border border-gray-500 px-2 py-3 text-[12px] font-black text-gray-950">
                      Available
                    </th>
                    <th className="border border-gray-500 px-2 py-3 text-[12px] font-black text-gray-950">
                      Remark
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {SOIL_ROWS.map(([key, label, unit, range], index) => {
                    const metric = findMetric(metrics, key);
                    const available = getMetricValue(metric);
                    const remark = getMetricRemark(metric);

                    return (
                      <tr key={key}>
                        <td className="border border-gray-500 px-2 py-2 text-[12px] font-black">
                          {index + 1}
                        </td>
                        <td className="border border-gray-500 px-2 py-2 text-[12px] font-black">
                          {label}
                        </td>
                        <td className="border border-gray-500 px-2 py-2 text-[12px] font-bold">
                          {unit}
                        </td>
                        <td className="border border-gray-500 px-2 py-2 text-[12px] font-bold">
                          {range}
                        </td>
                        <td className="border border-gray-500 px-2 py-2 text-[12px] font-black text-[#0D6B45]">
                          {available}
                        </td>
                        <td
                          className={`border border-gray-500 px-2 py-2 text-[12px] font-black ${getRemarkClass(
                            remark
                          )}`}
                        >
                          {remark}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-auto">
              <div className="mt-5 flex justify-end text-[11px] font-bold text-gray-700">
                Authorized by LeaCrop Agritech
              </div>
              <DisclaimerText />
            </div>
          </div>
        </div>

        <div className="pdf-page bg-white p-5 shadow-[0_18px_60px_rgba(13,107,69,0.12)] print:shadow-none">
          <div className="flex min-h-[1085px] flex-col border-[1.5px] border-gray-500 bg-white p-5">
            <div>
              <h3 className="mb-4 text-[18px] font-black text-[#0B3D0B]">
                Recommendations –
              </h3>

              <RecommendationList items={recommendations} />

              {Array.isArray(report?.organizationSuggestions) &&
                report.organizationSuggestions.length > 0 && (
                  <div className="mt-8">
                    <h3 className="mb-4 text-[18px] font-black text-[#0B3D0B]">
                      Organization Suggestions –
                    </h3>

                    <div className="space-y-6">
                      {report.organizationSuggestions.map((block, index) => (
                        <div key={block.organizationCode || index}>
                          {block.organizationCode ? (
                            <p className="mb-3 inline-flex rounded-md bg-[#F3FAF6] px-3 py-1 text-[12px] font-bold text-[#0D6B45]">
                              Organization Code: {block.organizationCode}
                            </p>
                          ) : null}

                          <RecommendationList items={block.notes || []} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>

            <div className="mt-auto">
              <div className="flex items-center justify-between border-t border-gray-400 pt-3 text-[11px] font-bold text-gray-700">
                <span>Authorized by LeaCrop Agritech</span>
                <span style={{ color: THEME }}>
                  Generated by Smart Farming Platform
                </span>
              </div>
              <DisclaimerText />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SoilHealthReportView;