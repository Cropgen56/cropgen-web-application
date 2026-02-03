import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import NpkChartSkeleton from "../../Skeleton/NpkChartSkeleton";

const NutrientBar = React.memo(
  ({
    label,
    symbol,
    current = 0,
    required = 0,
    colorCurrent,
    colorRequired,
  }) => {
    const max = Math.max(current, required, 1);
    const currentWidth = `${(current / max) * 100}%`;
    const requiredWidth = `${(required / max) * 100}%`;

    return (
      <div className="flex items-center gap-2 sm:gap-3 md:gap-2 mb-3 sm:mb-4 bg-gray-50 rounded-lg p-2 sm:p-3 md:p-2 shadow-sm border border-gray-200">
        <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-6 md:h-6 bg-lime-500 rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-xs sm:text-sm md:text-[10px]">
            {symbol}
          </span>
        </div>

        <div className="flex-1">
          <span className="block text-sm sm:text-base md:text-xs font-semibold text-[#344E41] mb-1 sm:mb-2">
            {label}
          </span>

          <div className="bg-gray-200 h-1.5 sm:h-2 md:h-1.5 rounded-full mb-1 overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{ backgroundColor: colorCurrent, width: currentWidth }}
            />
          </div>

          <div className="bg-gray-200 h-1.5 sm:h-2 md:h-1.5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{ backgroundColor: colorRequired, width: requiredWidth }}
            />
          </div>
        </div>

        <div className="flex flex-col items-start pt-4 sm:pt-5 md:pt-4">
          <span className="text-xs sm:text-sm md:text-[10px] font-bold text-gray-900">{`${current} kg/acre`}</span>
          <span className="text-xs sm:text-sm md:text-[10px] font-medium text-gray-600">{`${required} kg/acre`}</span>
        </div>
      </div>
    );
  },
);
NutrientBar.displayName = "NutrientBar";

const NUTRIENT_CONFIG = [
  { symbol: "N", label: "Nitrogen", key: "N" },
  { symbol: "P", label: "Phosphorous", key: "P" },
  { symbol: "K", label: "Potassium", key: "K" },
];

const SoilAnalysisChart = ({ selectedFieldsDetials = [] }) => {
  const farmDetails = selectedFieldsDetials[0] || {};
  const { cropName = "Crop", variety = "", sowingDate } = farmDetails;

  const smartAdvisory = useSelector((s) => s.smartAdvisory?.advisory || null);
  const advisoryLoading = Boolean(useSelector((s) => s.smartAdvisory?.loading));

  const daysSinceSowing = useMemo(() => {
    if (!sowingDate) return 1;
    const sow = new Date(sowingDate);
    if (isNaN(sow.getTime())) return 1;
    const now = new Date();
    return Math.max(
      1,
      Math.floor((now.getTime() - sow.getTime()) / (1000 * 60 * 60 * 24)) + 1,
    );
  }, [sowingDate]);

  const { nutrientData } = useMemo(() => {
    const npk = smartAdvisory?.npkManagement || {};
    const mapKey = {
      N: "nitrogenKgPerHa",
      P: "phosphorousKgPerHa",
      K: "potassiumKgPerHa",
    };

    const nutrientData = NUTRIENT_CONFIG.map(({ symbol, label }) => ({
      symbol,
      label,
      current: Math.round(npk?.available?.[mapKey[symbol]] ?? 0),
      required: Math.round(npk?.required?.[mapKey[symbol]] ?? 0),
    }));

    return { nutrientData };
  }, [smartAdvisory]);

  if (advisoryLoading) return <NpkChartSkeleton />;

  const isFinalHarvest = daysSinceSowing > 98;

  return (
    <div className="w-full px-2 sm:px-4 md:scale-[0.95] md:pl-1">
      {isFinalHarvest ? (
        <div className="bg-orange-50 p-3 sm:p-4 rounded-lg border border-yellow-500 mb-4 sm:mb-6">
          <span className="block text-sm sm:text-base font-semibold text-orange-800 text-center">
            {`Final harvest stage reached for ${cropName} ${
              variety ? `(${variety})` : ""
            }`}
          </span>
        </div>
      ) : (
        <>
          <div className="flex justify-end items-center mb-2 sm:mb-3 md:mb-2">
            <div className="flex items-center mr-4 sm:mr-6">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-600 rounded-sm mr-1 sm:mr-2" />
              <span className="text-xs sm:text-sm md:text-xs text-gray-700">
                Current Uptake
              </span>
            </div>

            <div className="flex items-center">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-lime-400 rounded-sm mr-1 sm:mr-2" />
              <span className="text-xs sm:text-sm md:text-xs text-gray-700">
                Target Required
              </span>
            </div>
          </div>

          {nutrientData.map((item) => (
            <NutrientBar
              key={item.symbol}
              label={item.label}
              symbol={item.symbol}
              current={item.current}
              required={item.required}
              colorCurrent="#36A534"
              colorRequired="#C4E930"
            />
          ))}

          {smartAdvisory?.npkManagement?.recommendation && (
            <div className="mt-4 sm:mt-6 bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-300">
              <span className="block text-[10px] sm:text-[12px] font-medium text-gray-800">
                <strong>Recommendations:</strong>{" "}
                {smartAdvisory.npkManagement.recommendation}
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SoilAnalysisChart;
