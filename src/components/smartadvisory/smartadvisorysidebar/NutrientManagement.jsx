import React from "react";
import { useSelector } from "react-redux";
import imgIcon from "../../../assets/image/Frame 266.png";

const UPLOADED_IMAGE = "/mnt/data/92fc842d-fdcc-47c7-b2d4-2477640a1bc8.png";

const FieldList = ({ title, items }) => {
  if (!items || items.length === 0) return null;
  return (
    <p className="mb-2 text-sm leading-relaxed">
      <strong className="font-bold text-[15px]">{title}:</strong>{" "}
      {items.map((it, i) => (
        <span key={i} className="font-normal">
          {it}
          {i !== items.length - 1 ? ", " : ""}
        </span>
      ))}
    </p>
  );
};

const NpkSummary = ({ npk }) => {
  if (!npk) return null;
  const a = npk.available || {};
  const r = npk.required || {};
  return (
    <div className="mt-3 bg-white text-black rounded-md p-3">
      <div className="text-base font-bold mb-3">NPK Summary (kg/ha)</div>
      <div className="grid grid-cols-3 gap-2 text-sm">
        <div>
          <div className="text-xs text-gray-500 font-medium mb-1">N (available)</div>
          <div className="font-bold text-base">{a.nitrogenKgPerHa ?? 0}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 font-medium mb-1">P (available)</div>
          <div className="font-bold text-base">
            {a.phosphorousKgPerHa ?? 0}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500 font-medium mb-1">K (available)</div>
          <div className="font-bold text-base">{a.potassiumKgPerHa ?? 0}</div>
        </div>

        <div>
          <div className="text-xs text-gray-500 font-medium mb-1">N (required)</div>
          <div className="font-bold text-base">{r.nitrogenKgPerHa ?? 0}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 font-medium mb-1">P (required)</div>
          <div className="font-bold text-base">{r.phosphorousKgPerHa ?? 0}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 font-medium mb-1">K (required)</div>
          <div className="font-bold text-base">{r.potassiumKgPerHa ?? 0}</div>
        </div>
      </div>
    </div>
  );
};

const NutrientManagement = ({ isTablet = false }) => {
  const advisory = useSelector(
    (state) => state.smartAdvisory?.advisory ?? null
  );

  const nutrientManagement =
    advisory?.smartAdvisory?.nutrientManagement ??
    advisory?.nutrientManagement ??
    null;

  const npkManagement =
    advisory?.npkManagement ?? advisory?.smartAdvisory?.npkManagement ?? null;

  const cropName = advisory?.farmFieldId?.cropName ?? "Crop";
  const expectedYield =
    advisory?.yield?.standardYield ?? advisory?.yield?.aiYield ?? null;
  const yieldUnit = advisory?.yield?.unit ?? "";

  return (
    <div
      className={`bg-[#344e41] rounded-lg ${
        isTablet ? "p-[6px]" : "p-4"
      } text-white w-full flex flex-col justify-between`}
    >
      {/* Header */}
      <div
        className={`flex items-center justify-between ${
          isTablet ? "mb-[3px]" : "mb-3"
        }`}
      >
        <h2
          className={`font-bold ${
            isTablet ? "text-[10px]" : "text-[22px]"
          }`}
        >
          Nutrition Management
        </h2>
        <img
          className={`${isTablet ? "w-[16px]" : "w-[36px]"}`}
          src={imgIcon}
          alt="nutrient"
        />
      </div>

      {/* Main Content Section */}
      <div
        className={`bg-[#5a7c6b] ${
          isTablet ? "p-[6px]" : "p-3"
        } rounded-md mb-[6px]`}
      >
        {/* Crop Name */}
        <div className={`font-bold mb-3 ${isTablet ? "text-[11px]" : "text-[16px]"}`}>
          Crop: {cropName}
        </div>

        {/* Field Lists */}
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

        {/* Recommendation Note */}
        {nutrientManagement?.recommendationNote && (
          <div
            className={`${
              isTablet ? "mt-2 text-[10px]" : "mt-3 text-[13px]"
            } bg-[#4a6555] p-2 rounded-md`}
          >
            <div className={`font-bold mb-1 flex items-center gap-2 ${isTablet ? "text-[11px]" : "text-[14px]"}`}>
              <span>Recommendation:</span>
              <span 
                className={`${
                  isTablet ? "w-4 h-4 text-[8px]" : "w-5 h-5 text-[10px]"
                } bg-green-500 text-white rounded-full flex items-center justify-center font-bold shadow-sm`}
                title="Important recommendation"
              >
                i
              </span>
            </div>
            <p className="italic leading-relaxed">
              {nutrientManagement.recommendationNote}
            </p>
          </div>
        )}

      </div>

      {/* NPK Summary */}
      <NpkSummary npk={npkManagement} />

      {/* Expected Yield */}
      <div
        className={`bg-white text-black rounded-md ${
          isTablet ? "px-[6px] py-[6px] text-[10px]" : "px-4 py-2 text-sm"
        } flex justify-between items-center font-bold mt-3`}
      >
        <span>Expected Yield</span>
        <span>{expectedYield ? `${expectedYield} ${yieldUnit}` : "—"}</span>
      </div>
    </div>
  );
};

export default NutrientManagement;