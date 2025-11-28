import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import Card from "react-bootstrap/Card";
import * as turf from "@turf/turf";
import SoilAnalysisChart from "./SoilAnalysisChart.jsx";
import SoilHealthChart from "./SoilHealthChart.jsx";
import CropHealthStatusBar from "./CropHealthStatusBar.jsx";
import { fetchCrops } from "../../../redux/slices/cropSlice.js";
import PremiumContentWrapper from "../../subscription/PremiumContentWrapper.jsx";
// import { selectHasCropHealthAndYield } from "../../../redux/slices/membershipSlice.js";

const CropHealth = ({ selectedFieldsDetials, fields, onSubscribe, hasCropHealthAndYield  }) => {
  const cropDetials = selectedFieldsDetials?.[0];
  const { sowingDate, field: corrdinatesPoint, cropName } = cropDetials || {};
  const dispatch = useDispatch();

  const { crops } = useSelector((state) => state.crops);

  // const hasCropHealthAndYield = useSelector(selectHasCropHealthAndYield);

  const advisory = useSelector((state) => state.smartAdvisory.advisory);
  const advisoryLoading = useSelector((state) => state.smartAdvisory.loading);

  useEffect(() => {
    dispatch(fetchCrops());
  }, [dispatch]);

  const cropInfo = useMemo(() => {
    if (!cropName || !crops?.length) return null;
    return crops.find(
      (c) => c.cropName.toLowerCase() === cropName.toLowerCase()
    );
  }, [cropName, crops]);

  const daysFromSowing = useMemo(() => {
    if (!sowingDate) return 0;
    const targetDate = new Date(sowingDate);
    const currentDate = new Date();
    targetDate.setHours(0, 0, 0, 0);
    currentDate.setHours(0, 0, 0, 0);
    return Math.floor((currentDate - targetDate) / (1000 * 60 * 60 * 24));
  }, [sowingDate]);

  const totalArea = useMemo(() => {
    if (!corrdinatesPoint || corrdinatesPoint.length < 3) return 0;
    const coordinates = corrdinatesPoint.map((p) => [p.lng, p.lat]);
    coordinates.push(coordinates[0]);
    const polygon = turf.polygon([coordinates]);
    return turf.area(polygon) / 10000;
  }, [corrdinatesPoint]);

  const buildGeometry = useMemo(() => {
    if (!corrdinatesPoint || corrdinatesPoint.length < 3) return null;

    const coordinates = corrdinatesPoint.map((p) => [p.lng, p.lat]);
    coordinates.push(coordinates[0]);

    return {
      type: "Polygon",
      coordinates: [coordinates],
    };
  }, [corrdinatesPoint]);

  const yieldData = useMemo(() => {
    if (advisory?.yield) {
      return {
        standardYield: advisory.yield.standardYield
          ? `${advisory.yield.standardYield} ${advisory.yield.unit || ""}`
          : "N/A",

        aiYield:
          advisory.yield.aiYield !== null &&
          advisory.yield.aiYield !== undefined
            ? `${advisory.yield.aiYield} ${advisory.yield.unit || ""}`
            : "N/A",
      };
    }

    return null;
  }, [advisory]);

  return (
    <div className="p-2">
      <div className="relative flex flex-col gap-6 rounded-2xl p-4 overflow-hidden bg-white shadow-md border border-gray-200">
        <h2 className="absolute top-4 left-6 text-[24px] sm:text-xl font-bold text-[#344E41] z-20">
          Crop Health
        </h2>

        <div className="relative z-10 flex gap-16 mt-10 w-full">
          <div className="flex flex-col items-center bg-white rounded-xl w-[160px] h-[160px] overflow-hidden flex-shrink-0 mx-auto md:mx-0 shadow-sm border border-gray-200">
            <img
              src={cropInfo?.cropImage || "https://via.placeholder.com/160"}
              alt={cropInfo?.cropName || "crop"}
              className="w-full h-full p-2 object-contain"
            />
          </div>

          <div className="flex flex-col justify-between w-full gap-4">
            <div className="grid grid-cols-2 gap-x-20 gap-y-5 text-sm">
              <div className="flex gap-2">
                <span className="font-semibold lg:text-[18px] md:text-[15px] text-[#344E41]">
                  Crop Name:
                </span>
                <span className="font-medium text-black lg:text-[18px] md:text-[14px]">
                  {cropInfo?.cropName || cropName || "N/A"}
                </span>
              </div>

              <div className="flex gap-2">
                <span className="font-semibold lg:text-[18px] md:text-[15px] text-[#344E41]">
                  Crop Age:
                </span>
                <span className="font-medium text-black lg:text-[18px] md:text-[14px]">
                  {daysFromSowing} days
                </span>
              </div>

              <div className="flex gap-2">
                <span className="font-semibold lg:text-[18px] md:text-[15px] text-[#344E41]">
                  Total Area:
                </span>
                <span className="font-medium text-black lg:text-[18px] md:text-[14px]">
                  {totalArea.toFixed(1) || "0.0"} Ha
                </span>
              </div>

              <div className="flex gap-2">
                <span className="font-semibold lg:text-[18px] md:text-[15px] text-[#344E41]">
                  Standard Yield:
                </span>
                <span className="font-medium text-black lg:text-[18px] md:text-[14px]">
                  {advisoryLoading
                    ? "Loading..."
                    : yieldData?.standardYield || "N/A"}
                </span>
              </div>

              <div className="flex gap-2">
                <span className="font-semibold lg:text-[18px] md:text-[15px] text-[#344E41]">
                  AI Yield:
                </span>
                <span className="font-medium text-black lg:text-[18px] md:text-[12px]">
                  {advisoryLoading ? "Loading..." : yieldData?.aiYield || "N/A"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <CropHealthStatusBar selectedFieldsDetials={selectedFieldsDetials} />
      </div>

      <PremiumContentWrapper
        isLocked={!hasCropHealthAndYield}
        onSubscribe={onSubscribe}
        title="Advanced Soil Analytics"
      >
        <div className="flex flex-col lg:flex-row items-center justify-between mt-6 px-2 md:px-4 gap-6 lg:gap-12 bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="w-full lg:w-1/2">
            <h2 className="text-left text-[1.3rem] font-semibold text-[#344E41] mb-2 ml-10">
              Soil Analysis (Based on BBCH Growth Stage)
            </h2>
            <SoilAnalysisChart selectedFieldsDetials={selectedFieldsDetials} />
          </div>

          <div className="w-full lg:w-1/2 flex flex-col justify-start">
            <h2 className="text-left text-[1.3rem] font-semibold text-[#344E41] ml-10">
              Soil Health
            </h2>
            <SoilHealthChart selectedFieldsDetials={selectedFieldsDetials} />
          </div>
        </div>
      </PremiumContentWrapper>
    </div>
  );
};

export default CropHealth;
