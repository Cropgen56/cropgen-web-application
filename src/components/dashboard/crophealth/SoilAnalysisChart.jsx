import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getNpkData } from "../../../redux/slices/satelliteSlice";
import { formatToYYYYMMDD } from "../../../utility/convertYYYYMMDD";
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
    <div className="flex items-center gap-2 sm:gap-3 md:gap-2 mb-3 sm:mb-4">
      <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-6 md:h-6 bg-lime-500 rounded-full flex items-center justify-center">
        <span className="text-white font-bold text-xs sm:text-sm md:text-[10px]">
          {symbol}
        </span>
      </div>
      <div className="flex-1">
        <span className="block text-sm sm:text-base md:text-xs font-semibold text-gray-900 mb-1 sm:mb-2">
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
        <span className="text-xs sm:text-sm md:text-[10px] font-medium text-gray-500">{`${required} kg/acre`}</span>
      </div>
    </div>
  );
};

function convertFieldToCoordinates(field) {
  if (!Array.isArray(field) || field.length === 0) {
    return [];
  }

  // Map each point into [lng, lat]
  const coordinates = field.map((point) => [point.lng, point.lat]);

  // Close the polygon by repeating the first coordinate at the end
  if (
    coordinates.length > 0 &&
    (coordinates[0][0] !== coordinates[coordinates.length - 1][0] ||
      coordinates[0][1] !== coordinates[coordinates.length - 1][1])
  ) {
    coordinates.push(coordinates[0]);
  }

  // Wrap inside another array as per GeoJSON Polygon format
  return [coordinates];
}

const SoilAnalysisChart = ({ selectedFieldsDetials = [] }) => {
  const dispatch = useDispatch();
  const farmDetails = selectedFieldsDetials[0] || {};
  const { cropName, sowingDate } = farmDetails;
  const aois = useSelector((state) => state.weather?.aois) || [];
  const newNpkData = useSelector((state) => state.satellite?.newNpkData);
  const npkLoading = useSelector((state) => state.satellite?.npkLoading);
  const npkError = useSelector((state) => state.satellite?.npkError);
  const today = new Date();

  useEffect(() => {
    if (!cropName || !sowingDate || !farmDetails._id) return;

    const selectedFieldId = farmDetails._id;
    const aoi = aois.find((a) => a.name === selectedFieldId);
    if (!aoi?.id) {
      dispatch({
        type: "FETCH_NPK_DATA_FAILURE",
        payload: "No matching AOI found",
      });
      return;
    }

    const payload = {
      crop: cropName,
      startDate: formatToYYYYMMDD(sowingDate),
      endDate: today.toISOString().split("T")[0],
      geometry_id: aoi.id,
      geometryCoords: convertFieldToCoordinates(farmDetails?.field),
    };

    dispatch(getNpkData(payload));
  }, [cropName, sowingDate, farmDetails, aois, dispatch]);

  console.log("NPK Data:", newNpkData);

  // Use newNpkData.data for nutrient values
  const data = [
    {
      symbol: "N",
      label: "Nitrogen",
      current: newNpkData?.data?.estimated_uptake?.N ?? 0,
      required: newNpkData?.data?.stage_target?.N ?? 0,
    },
    {
      symbol: "P",
      label: "Phosphorous",
      current: newNpkData?.data?.estimated_uptake?.P ?? 0,
      required: newNpkData?.data?.stage_target?.P ?? 0,
    },
    {
      symbol: "K",
      label: "Potassium",
      current: newNpkData?.data?.estimated_uptake?.K ?? 0,
      required: newNpkData?.data?.stage_target?.K ?? 0,
    },
  ];

  // Assume no final harvest check if stage is not provided
  const isFinalHarvest = false; // Update if stage data is available

  if (npkError) {
    return (
      <div className="w-full px-2 sm:px-4 md:scale-[0.95] md:pl-1">
        <div className="bg-red-50 p-3 sm:p-4 rounded-lg border border-red-500 mb-4 sm:mb-6">
          <span className="block text-sm sm:text-base font-semibold text-red-800 text-center">
            {npkError.includes("Permission denied")
              ? "Permission denied: Unable to access soil data. Please check your API credentials or geometry ID."
              : `Error: ${npkError}`}
          </span>
        </div>
      </div>
    );
  }

  if (npkLoading) {
    return (
      <div className="w-full px-2 sm:px-4 md:scale-[0.95] md:pl-1">
        <div className="bg-gray-100 p-3 sm:p-4 rounded-lg border border-gray-300 mb-4 sm:mb-6">
          <span className="block text-sm sm:text-base font-semibold text-gray-800 text-center">
            Loading soil analysis data...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-2 sm:px-4 md:scale-[0.95] md:pl-1">
      {isFinalHarvest ? (
        <div className="bg-orange-50 p-3 sm:p-4 rounded-lg border border-yellow-500 mb-4 sm:mb-6">
          <span className="block text-sm sm:text-base font-semibold text-orange-800 text-center">
            {`Final harvest stage reached for ${cropName || "Crop"}`}
          </span>
        </div>
      ) : (
        <>
          <div className="flex justify-end items-center mb-2 sm:mb-3 md:mb-2">
            <div className="flex items-center mr-4 sm:mr-6">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-600 rounded-sm mr-1 sm:mr-2"></div>
              <span className="text-xs sm:text-sm md:text-xs text-gray-700">
                Current
              </span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-lime-400 rounded-sm mr-1 sm:mr-2"></div>
              <span className="text-xs sm:text-sm md:text-xs text-gray-700">
                Required
              </span>
            </div>
          </div>
          {data.map((item, index) => (
            <NutrientBar
              key={index}
              label={item.label}
              symbol={item.symbol}
              current={item.current}
              required={item.required}
              colorCurrent="#36A534"
              colorRequired="#C4E930"
            />
          ))}
        </>
      )}
    </div>
  );
};

export default SoilAnalysisChart;
