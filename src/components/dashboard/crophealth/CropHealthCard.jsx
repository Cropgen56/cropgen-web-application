import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import Card from "react-bootstrap/Card";
import * as turf from "@turf/turf";
import SoilAnalysisChart from "./SoilAnalysisChart.jsx";
import SoilHealthChart from "./SoilHealthChart.jsx";
import { fetchSoilData } from "../../../redux/slices/satelliteSlice.js";
import cropimage from "../../../assets/image/Rectangle 74@2x.jpg";
import CropHealthStatusBar from "./CropHealthStatusBar.jsx";

const CropHealth = ({ selectedFieldsDetials }) => {
  const cropDetials = selectedFieldsDetials?.[0];
  const { sowingDate, field: corrdinatesPoint, cropName } = cropDetials || {};
  const dispatch = useDispatch();
  const { cropYield, cropHealth } = useSelector((state) => state.satellite);
  const { Health_Percentage = 0, Crop_Health = "Unknown" } = cropHealth || {};

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
    return turf.area(polygon) / 4046.86;
  }, [corrdinatesPoint]);

  useEffect(() => {
    if (cropDetials) dispatch(fetchSoilData({ farmDetails: cropDetials }));
  }, [cropDetials, dispatch]);

  return (
    <Card body className="mt-2 mb-6 shadow-md rounded-lg bg-white">
      <h2 className="text-[24px] sm:text-xl font-bold text-[#344E41] px-4 sm:px-6 mb-4">
        Crop Health
      </h2>

      <div className="flex flex-row px-4 gap-6">
        <div className="flex flex-col items-center border-2 border-[#5A7C6B] rounded-md w-[160px] h-[160px] overflow-hidden">
          <img
            src={cropimage}
            alt="crop"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex flex-col justify-between w-full gap-4">
          <div className="grid grid-cols-2 gap-x-20 gap-y-5 text-sm md:text-[10px] text-[#344E41]">
            <div className="flex gap-2">
              <span className="font-semibold text-[18px]">Crop Name:</span>
              <span className="text-black font-medium text-[18px]">
                {cropName || "N/A"}
              </span>
            </div>
            <div className="flex gap-2">
              <span className="font-semibold text-[18px]">Crop Age:</span>
              <span className="text-black font-medium text-[18px]">
                {daysFromSowing} days
              </span>
            </div>
            <div className="flex gap-2">
              <span className="font-semibold text-[18px]">Total Area:</span>
              <span className="text-black font-medium text-[18px]">
                {totalArea.toFixed(1) || "0.0"} Acre
              </span>
            </div>
            <div className="flex gap-2">
              <span className="font-semibold text-[18px]">Standard Yield:</span>
              <span className="text-black font-medium text-[18px]">
                {cropYield?.data?.standard_yield || "N/A"}
              </span>
            </div>
            <div className="flex gap-2">
              <span className="font-semibold text-[18px]">AI Yield:</span>
              <span className="text-black font-medium text-[18px]">
                {cropYield?.data?.ai_predicted_yield ||
                  cropYield?.data?.message ||
                  "N/A"}
              </span>
            </div>
          </div>

          <CropHealthStatusBar selectedFieldsDetials={selectedFieldsDetials} />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row items-start justify-between mt-6 px-2 md:px-4 gap-6 lg:gap-12">
        <div className="w-full lg:w-1/2">
          <h2 className="text-left text-[1.3rem] font-semibold text-[#344E41] mb-2 ml-10">
            Soil Analysis (Based on BBCH Growth Stage)
          </h2>
          <SoilAnalysisChart selectedFieldsDetials={selectedFieldsDetials} />
        </div>

        <div className="w-full lg:w-1/2">
          <h2 className="text-left text-[1.3rem] font-semibold text-[#344E41] mb-2 ml-10">
            Soil Health
          </h2>
          <SoilHealthChart selectedFieldsDetials={selectedFieldsDetials} />
        </div>
      </div>
    </Card>
  );
};

export default CropHealth;
