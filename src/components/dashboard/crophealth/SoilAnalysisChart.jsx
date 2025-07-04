import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetcNpkData } from "../../../redux/slices/satelliteSlice";

const NutrientBar = ({
  label,
  symbol,
  current,
  required,
  colorCurrent,
  colorRequired,
}) => {
  const max = Math.max(current, required, 1);
  const currentWidth = `${(current / max) * 100}%`;
  const requiredWidth = `${(required / max) * 100}%`;

  return (
    <div className="flex items-center mb-3 sm:mb-8">
      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-teal-700 rounded-full flex items-center justify-center mr-2 sm:mr-3">
        <span className="text-white font-bold text-xs sm:text-sm">
          {symbol}
        </span>
      </div>
      <div className="flex-1">
        <span className="block text-sm sm:text-base font-semibold text-black mb-1 sm:mb-2">
          {label}
        </span>
        <div className="bg-gray-200 h-1.5 sm:h-2 rounded-full mb-1.5 sm:mb-2 overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{ backgroundColor: colorCurrent, width: currentWidth }}
          />
        </div>
        <div className="bg-gray-200 h-1.5 sm:h-2 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{ backgroundColor: colorRequired, width: requiredWidth }}
          />
        </div>
      </div>
      <div className="flex flex-col items-center justify-center pl-2 sm:pl-4 pt-4 sm:pt-5">
        <span className="text-xs sm:text-sm font-bold text-gray-900">{`${current} kg/acre`}</span>
        <span className="text-xs sm:text-sm font-medium text-gray-500">{`${required} kg/acre`}</span>
      </div>
    </div>
  );
};

const SoilAnalysisChart = ({ selectedFieldsDetials }) => {
  const dispatch = useDispatch();
  const farmDetails = selectedFieldsDetials?.[0];
  const { NpkData } = useSelector((state) => state?.satellite);

  const { cropName } = farmDetails || {};

  useEffect(() => {
    if (farmDetails) {
      dispatch(fetcNpkData(farmDetails));
    }
  }, [farmDetails, dispatch]);

  const isFinalHarvest = NpkData?.Crop_Growth_Stage === "Final Harvest";

  const data = [
    {
      symbol: "N",
      label: "Nitrogen",
      current: NpkData?.NPK_Available_kg?.N ?? 0,
      required: NpkData?.NPK_Required_at_Stage_kg?.N ?? 0,
    },
    {
      symbol: "P",
      label: "Phosphorous",
      current: NpkData?.NPK_Available_kg?.P ?? 0,
      required: NpkData?.NPK_Required_at_Stage_kg?.P ?? 0,
    },
    {
      symbol: "K",
      label: "Potassium",
      current: NpkData?.NPK_Available_kg?.K ?? 0,
      required: NpkData?.NPK_Required_at_Stage_kg?.K ?? 0,
    },
  ];

  return (
    <div className="w-full px-3 sm:px-4">
      {isFinalHarvest && (
        <div className="bg-orange-50 p-3 sm:p-4 rounded-lg border border-yellow-500 mb-4 sm:mb-6">
          <span className="block text-sm sm:text-base font-semibold text-orange-800 text-center">
            {`Final harvest stage reached for ${cropName || "Crop"}`}
          </span>
        </div>
      )}
      {!isFinalHarvest && (
        <>
          <div className="flex justify-end items-center sm:mb-2">
            <div className="flex items-center mr-4 sm:mr-6">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-600 rounded-sm mr-1 sm:mr-2"></div>
              <span className="text-xs sm:text-sm text-gray-700">Current</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-lime-400 rounded-sm mr-1 sm:mr-2"></div>
              <span className="text-xs sm:text-sm text-gray-700">Required</span>
            </div>
          </div>
          {data.map((item, index) => (
            <NutrientBar
              key={index}
              label={item.label}
              symbol={item.symbol}
              current={item.current}
              required={item.required}
              colorCurrent="#36A534" // Green for current
              colorRequired="#C4E930" // Lime for required
            />
          ))}
        </>
      )}
    </div>
  );
};

export default SoilAnalysisChart;
