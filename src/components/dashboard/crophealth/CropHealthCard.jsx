import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import Card from "react-bootstrap/Card";
import * as turf from "@turf/turf";
import SoilAnalysisChart from "./SoilAnalysisChart.jsx";
import SoilHealthChart from "./SoilHealthChart.jsx";
import { fetchSoilData } from "../../../redux/slices/satelliteSlice.js";

import CropHealthStatusBar from "./CropHealthStatusBar.jsx";
import { fetchCrops } from "../../../redux/slices/cropSlice.js";


const CropHealth = ({ selectedFieldsDetials }) => {
  const cropDetials = selectedFieldsDetials?.[0];
  const { sowingDate, field: corrdinatesPoint, cropName } = cropDetials || {};
  const dispatch = useDispatch();
  const { crops } = useSelector((state) => state.crops);
  const { cropYield } = useSelector((state) => state.satellite);

  // const { Health_Percentage = 0, Crop_Health = "Unknown" } = cropHealth || {};

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

  useEffect(() => {
    if (cropDetials) dispatch(fetchSoilData({ farmDetails: cropDetials }));
  }, [cropDetials, dispatch]);

  return (
    <Card body className="mt-2 mb-4  bg-white">
      <div className="relative flex flex-col lg:flex-row gap-6 bg-gradient-to-br from-[#5A7C6B] to-[#344E41] rounded-2xl p-6 overflow-hidden">

        <h2 className="absolute top-4 left-6 text-[24px] sm:text-xl font-bold text-white z-20">
          Crop Health
        </h2>


        <div className="relative z-10 flex flex-col lg:flex-row gap-6 mt-10 w-full">

          {/* Crop Image Container */}
          <div className="flex flex-col items-center bg-white/10 backdrop-blur-sm rounded-xl w-[160px] h-[160px] overflow-hidden flex-shrink-0 mx-auto lg:mx-0">
            <img
              src={cropInfo?.cropImage || "https://via.placeholder.com/160"}
              alt={cropInfo?.cropName || "crop"}
              className="w-full h-full p-2 object-cover"
            />
          </div>

          <div className="flex flex-col justify-between w-full gap-4">
            <div className="grid grid-cols-2 gap-x-20 gap-y-5 text-sm md:text-[10px]">
              <div className="flex gap-2">
                <span className="font-semibold text-[18px] text-white/80">Crop Name:</span>
                <span className="text-white font-medium text-[18px]">
                  {cropInfo?.cropName || cropName || "N/A"}
                </span>
              </div>
              <div className="flex gap-2">
                <span className="font-semibold text-[18px] text-white/80">Crop Age:</span>
                <span className="text-white font-medium text-[18px]">
                  {daysFromSowing} days
                </span>
              </div>
              <div className="flex gap-2">
                <span className="font-semibold text-[18px] text-white/80">Total Area:</span>
                <span className="text-white font-medium text-[18px]">
                  {totalArea.toFixed(1) || "0.0"} Ha
                </span>
              </div>
              <div className="flex gap-2">
                <span className="font-semibold text-[18px] text-white/80">Standard Yield:</span>
                <span className="text-white font-medium text-[18px]">
                  {cropYield?.data?.standard_yield || "N/A"}
                </span>
              </div>
              <div className="flex gap-2">
                <span className="font-semibold text-[18px] text-white/80">AI Yield:</span>
                <span className="text-white font-medium text-[18px]">
                  {cropYield?.data?.ai_predicted_yield ||
                    cropYield?.data?.message ||
                    "N/A"}
                </span>
              </div>
            </div>

            <CropHealthStatusBar selectedFieldsDetials={selectedFieldsDetials} />
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row items-start justify-between mt-6 px-2 md:px-4 gap-6 lg:gap-12 bg-gradient-to-br from-[#5A7C6B] to-[#344E41] rounded-2xl p-6 ">
        <div className="w-full lg:w-1/2">


          <h2 className="text-left text-[1.3rem] font-semibold text-white mb-2 ml-10">
            Soil Analysis (Based on BBCH Growth Stage)
          </h2>
          <SoilAnalysisChart selectedFieldsDetials={selectedFieldsDetials} />
        </div>

        <div className="w-full lg:w-1/2">
          <h2 className="text-left text-[1.3rem] font-semibold text-white mb-2 ml-10">
            Soil Health
          </h2>
          <SoilHealthChart selectedFieldsDetials={selectedFieldsDetials} />
        </div>
      </div>
    </Card>
  );
};

export default CropHealth;