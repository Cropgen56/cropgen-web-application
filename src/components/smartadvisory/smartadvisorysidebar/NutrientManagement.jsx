import React from "react";
import { useSelector } from "react-redux";
import imgIcon from "../../../assets/image/Frame 266.png";

/* ---------- Reusable List ---------- */
const FieldList = ({ title, items }) => {
  if (!items || items.length === 0) return null;

  return (
    <p className="mb-2 text-sm leading-relaxed">
      <strong className="font-bold text-[15px]">{title}:</strong>{" "}
      {items.map((it, i) => (
        <span key={i}>
          {it}
          {i !== items.length - 1 ? ", " : ""}
        </span>
      ))}
    </p>
  );
};

/* ---------- NPK SUMMARY ---------- */
const NpkSummary = () => {
  const { advisory } = useSelector((state) => state.smartAdvisory || {});
  const npk = advisory?.npkManagement;

  if (!npk) return null;

  const a = npk.available || {};
  const r = npk.required || {};

  return (
    <div className="mt-3 bg-white text-black rounded-md p-3">
      <div className="text-base font-bold mb-3">NPK Summary (kg/ha)</div>

      <div className="grid grid-cols-3 gap-3 text-sm">
        <div>
          <div className="text-xs text-gray-500">N (available)</div>
          <div className="font-bold">{a.nitrogenKgPerHa ?? 0}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">P (available)</div>
          <div className="font-bold">{a.phosphorousKgPerHa ?? 0}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">K (available)</div>
          <div className="font-bold">{a.potassiumKgPerHa ?? 0}</div>
        </div>

        <div>
          <div className="text-xs text-gray-500">N (required)</div>
          <div className="font-bold">{r.nitrogenKgPerHa ?? 0}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">P (required)</div>
          <div className="font-bold">{r.phosphorousKgPerHa ?? 0}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">K (required)</div>
          <div className="font-bold">{r.potassiumKgPerHa ?? 0}</div>
        </div>
      </div>
    </div>
  );
};

/* ---------- MAIN COMPONENT ---------- */
const NutrientManagement = ({ isTablet = false }) => {
  const advisory = useSelector(
    (state) => state.smartAdvisory?.advisory ?? null
  );

  const nutrientManagement =
    advisory?.nutrientManagement ??
    advisory?.smartAdvisory?.nutrientManagement ??
    null;

  const npkManagement = advisory?.npkManagement ?? null;
  const cropYield = advisory?.yield ?? null;

  const cropName = advisory?.farmFieldId?.cropName ?? "Crop";

  const expectedYield =
    cropYield?.standardYield ?? cropYield?.aiYield ?? null;

  const yieldUnit = cropYield?.unit ?? "";

  return (
    <div
      className={`bg-[#344e41] rounded-lg ${
        isTablet ? "p-[6px]" : "p-4"
      } text-white w-full flex flex-col`}
    >
      {/* ---------- Header ---------- */}
      <div className="flex items-center justify-between mb-3">
        <h2 className={`font-bold ${isTablet ? "text-[10px]" : "text-[22px]"}`}>
          Nutrition Management
        </h2>
        <img
          className={isTablet ? "w-[16px]" : "w-[36px]"}
          src={imgIcon}
          alt="nutrient"
        />
      </div>

      {/* ---------- Main Section ---------- */}
      <div
        className={`bg-[#5a7c6b] ${
          isTablet ? "p-[6px]" : "p-3"
        } rounded-md`}
      >
        <div className="font-bold mb-3">Crop: {cropName}</div>

        <div className={isTablet ? "text-[9px]" : ""}>
          <FieldList title="Spray" items={nutrientManagement?.spray} />
          <FieldList
            title="Micronutrient"
            items={nutrientManagement?.micronutrient}
          />
          <FieldList
            title="Fertigation"
            items={nutrientManagement?.fertigation}
          />
          <FieldList title="Disease" items={nutrientManagement?.disease} />
          <FieldList title="Pest" items={nutrientManagement?.pest} />
        </div>
      </div>

      {/* ---------- NPK ---------- */}
      <NpkSummary />

      {/* ---------- Yield ---------- */}
      <div
        className={`bg-white text-black rounded-md ${
          isTablet ? "px-2 py-2 text-[10px]" : "px-4 py-2 text-sm"
        } flex justify-between items-center font-bold mt-3`}
      >
        <span>Expected Yield</span>
        <span>
          {expectedYield ? `${expectedYield} ${yieldUnit}` : "—"}
        </span>
      </div>

      {/* ---------- Recommendation (BELOW YIELD) ---------- */}
      {npkManagement?.recommendation && (
        <div className="mt-3 bg-[#4a6555] p-3 rounded-md">
          <div className="font-bold mb-2 flex items-center gap-2">
            Recommendation
            <span className="w-5 h-5 text-[10px] bg-green-500 text-white rounded-full flex items-center justify-center font-bold">
              i
            </span>
          </div>

          <p className="whitespace-pre-line leading-relaxed italic text-sm">
            {npkManagement.recommendation}
          </p>
        </div>
      )}
    </div>
  );
};

export default NutrientManagement;
