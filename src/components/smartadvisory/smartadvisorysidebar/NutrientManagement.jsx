import React from "react";
import { useSelector } from "react-redux";
import imgIcon from "../../../assets/image/Frame 266.png";

const UPLOADED_IMAGE = "/mnt/data/92fc842d-fdcc-47c7-b2d4-2477640a1bc8.png";

const FieldList = ({ title, items }) => {
  if (!items || items.length === 0) return null;
  return (
    <p className="mb-1">
      <strong>{title}:</strong>{" "}
      {items.map((it, i) => (
        <span key={i}>
          {it}
          {i !== items.length - 1 ? " " : ""}
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
      <div className="text-sm font-semibold mb-2">NPK Summary (kg/ha)</div>
      <div className="grid grid-cols-3 gap-2 text-sm">
        <div>
          <div className="text-xs text-gray-500">N (available)</div>
          <div className="font-bold">{a.nitrogenKgPerHa ?? 0}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">P (available)</div>
          <div className="font-bold">
            {a.phosphorousKgPerHa ?? a.phosphorousKgPerHa ?? 0}
          </div>
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
      <div
        className={`flex items-center justify-between ${
          isTablet ? "mb-[3px]" : "mb-2"
        }`}
      >
        <h2
          className={`font-semibold ${
            isTablet ? "text-[10px]" : "text-[20px]"
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

      <div
        className={`bg-[#5a7c6b] ${
          isTablet ? "p-[6px]" : "p-3"
        } rounded-md mb-[6px] text-sm`}
      >
        <div className="font-bold mb-2">{`Crop: ${cropName}`}</div>

        {/* Spray */}
        <FieldList title="Spray" items={nutrientManagement?.spray} />

        {/* Micronutrient */}
        <FieldList
          title="Micronutrient"
          items={nutrientManagement?.micronutrient}
        />

        {/* Fertigation */}
        <FieldList
          title="Fertigation"
          items={nutrientManagement?.fertigation}
        />

        {/* Disease */}
        <FieldList title="Disease" items={nutrientManagement?.disease} />

        {/* Pest */}
        <FieldList title="Pest" items={nutrientManagement?.pest} />

        {nutrientManagement?.recommendationNote && (
          <div
            className={`${isTablet ? "mt-2 text-[10px]" : "mt-3 text-[13px]"}`}
          >
            <div className="font-bold">Recommendation:</div>
            <p className="italic mt-1">
              {nutrientManagement.recommendationNote}
            </p>
          </div>
        )}

        {/* optional badge image if water/advice present */}
        {advisory?.smartAdvisory?.weeklyAdvisory?.items?.some(
          (it) => it.key === "water"
        ) && (
          <div className="mt-3">
            <img
              src={UPLOADED_IMAGE}
              alt="water-badge"
              className="w-20 h-auto rounded-md"
            />
          </div>
        )}
      </div>

      <NpkSummary npk={npkManagement} />

      <div
        className={`bg-white text-black rounded-md ${
          isTablet ? "px-[6px] py-[6px] text-[10px]" : "px-4 py-2 text-sm"
        } flex justify-between font-semibold mt-3`}
      >
        <span>Expected Yield</span>
        <span>{expectedYield ? `${expectedYield} ${yieldUnit}` : "—"}</span>
      </div>
    </div>
  );
};

export default NutrientManagement;
