import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getNpkData } from "../../../redux/slices/satelliteSlice";
import { formatToYYYYMMDD } from "../../../utility/convertYYYYMMDD";
import NpkChartSkeleton from "../../Skeleton/NpkChartSkeleton";

// Helper: Validate date for formatToYYYYMMDD
const isValidDate = (dateInput) => {
  if (!dateInput) return false;

  // Check for yyyy-mm-dd or yyyy/mm/dd formats
  const regexDash = /^\d{4}-\d{2}-\d{2}$/;
  const regexSlash = /^\d{4}\/\d{2}\/\d{2}$/;
  if (
    typeof dateInput === "string" &&
    (regexDash.test(dateInput) || regexSlash.test(dateInput))
  ) {
    // Additional validation to ensure the date is parseable
    const date = new Date(dateInput.replace(/\//g, "-"));
    return !isNaN(date.getTime());
  }

  // Check if it's a valid Date object or parseable string
  const date = new Date(dateInput);
  return !isNaN(date.getTime());
};

// NutrientBar component with memoization to prevent unnecessary re-renders
const NutrientBar = React.memo(
  ({ label, symbol, current, required, colorCurrent, colorRequired }) => {
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
  }
);

// Constant for nutrient data configuration
const NUTRIENT_CONFIG = [
  { symbol: "N", label: "Nitrogen", key: "N" },
  { symbol: "P", label: "Phosphorous", key: "P" },
  { symbol: "K", label: "Potassium", key: "K" },
];

const SoilAnalysisChart = ({ selectedFieldsDetials = [] }) => {
  const dispatch = useDispatch();

  const farmDetails = selectedFieldsDetials[0] || {};
  const { cropName, variety, sowingDate, _id: selectedFieldId, field } = farmDetails;

  // Get NPK data and loading state from Redux
  const { newNpkData, loading } = useSelector((state) => state.satellite);
  const npkLoading = loading?.newNpkData || false;

  // Calculate days since sowing
  const daysSinceSowing = useMemo(() => {
    const isSowingValid = isValidDate(sowingDate);
    if (!isSowingValid) return 1;

    const today = new Date();
    const sowing = new Date(sowingDate);
    return Math.max(
      1,
      Math.floor((today.getTime() - sowing.getTime()) / (1000 * 60 * 60 * 24)) + 1
    );
  }, [sowingDate]);

  // Memoize nutrient data and date validation
  const { nutrientData, isSowingDateValid, endDate, startDate } = useMemo(() => {
    const isSowingValid = isValidDate(sowingDate);
    const today = new Date();
    const isTodayValid = isValidDate(today);
    let formattedEndDate = "";
    let formattedStartDate = "";

    if (isTodayValid) {
      formattedEndDate = formatToYYYYMMDD(today);
    } else {
      formattedEndDate = new Date().toISOString().split('T')[0];
    }

    if (isSowingValid) {
      formattedStartDate = formatToYYYYMMDD(sowingDate);
    } else {
      formattedStartDate = formattedEndDate;
    }

    const nutrientData = NUTRIENT_CONFIG.map(({ symbol, label, key }) => ({
      symbol,
      label,
      current: newNpkData?.data?.estimated_uptake?.[key] ?? 0,
      required: newNpkData?.data?.stage_target?.[key] ?? 0,
    }));

    return {
      nutrientData,
      isSowingDateValid: isSowingValid,
      endDate: formattedEndDate,
      startDate: formattedStartDate,
    };
  }, [sowingDate, newNpkData]);

  useEffect(() => {
    // Fetch NPK data when component mounts or dependencies change
    if (field && field.length > 0 && cropName && selectedFieldId && isSowingDateValid) {
      // Transform field coordinates to geometryCoords format
      const geometryCoords = [
        field.map(({ lat, lng }) => {
          if (typeof lat !== "number" || typeof lng !== "number") {
            console.error(`Invalid coordinate: lat=${lat}, lng=${lng}`);
            return [0, 0];
          }
          return [lng, lat];
        })
      ];

      // Ensure polygon is closed
      if (geometryCoords[0].length > 0) {
        const firstCoord = geometryCoords[0][0];
        const lastCoord = geometryCoords[0][geometryCoords[0].length - 1];
        if (firstCoord[0] !== lastCoord[0] || firstCoord[1] !== lastCoord[1]) {
          geometryCoords[0].push([...firstCoord]);
        }
      }

      const payload = {
        crop: cropName.toLowerCase(),
        geometryCoords: geometryCoords,
        geometry_id: selectedFieldId,
        startDate: startDate,
        endDate: endDate,
      };

      dispatch(getNpkData(payload));
    }
  }, [dispatch, field, cropName, selectedFieldId, isSowingDateValid, startDate, endDate]);

  if (!isSowingDateValid) {
    return (
      <div className="w-full px-2 sm:px-4 md:scale-[0.95] md:pl-1">
        <div className="bg-gray-100 p-3 sm:p-4 rounded-lg border border-gray-300 mb-4 sm:mb-6">
          <span className="block text-sm sm:text-base font-semibold text-gray-800 text-center">
            Invalid sowing date. Please provide a valid date.
          </span>
        </div>
      </div>
    );
  }

  if (npkLoading) {
    return <NpkChartSkeleton />;
  }

  const isFinalHarvest = daysSinceSowing > 98;

  return (
    <div className="w-full px-2 sm:px-4 md:scale-[0.95] md:pl-1">


      {isFinalHarvest ? (
        <div className="bg-orange-50 p-3 sm:p-4 rounded-lg border border-yellow-500 mb-4 sm:mb-6">
          <span className="block text-sm sm:text-base font-semibold text-orange-800 text-center">
            {`Final harvest stage reached for ${cropName} ${variety ? `(${variety})` : ''}`}
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
          {newNpkData?.data?.notes && (
            <div className="mt-4 sm:mt-6 bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-300">
              <span className="block text-sm sm:text-base font-medium text-gray-800">
                <strong>Recommendations:</strong> {newNpkData.data.notes}
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SoilAnalysisChart;