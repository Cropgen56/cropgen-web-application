import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Card from "react-bootstrap/Card";
import * as turf from "@turf/turf";
import DaughnutChart from "./DaughnutChart.jsx";
import SoilAnalysisChart from "./SoilAnalysisChart.jsx";
import SoilHealthChart from "./SoilHealthChart.jsx";
import { calculateAiYield } from "../../../redux/slices/satelliteSlice.js";
import { fetchSoilData } from "../../../redux/slices/satelliteSlice.js";
import CropDetials from "./CropDetials.jsx";

const CropHealth = ({ selectedFieldsDetials }) => {
  const cropDetials = selectedFieldsDetials?.[0];
  const sowingDate = cropDetials?.sowingDate;
  const corrdinatesPoint = cropDetials?.field;

  const dispatch = useDispatch();
  const { cropYield, NpkData } = useSelector((state) => state?.satellite);

  // Memoize the calculation of days from sowing date
  const daysFromSowing = React.useMemo(() => {
    if (!sowingDate) return 0;
    const targetDate = new Date(sowingDate);
    const currentDate = new Date();
    targetDate.setHours(0, 0, 0, 0);
    currentDate.setHours(0, 0, 0, 0);
    const timeDifference = currentDate - targetDate;
    return Math.floor(timeDifference / (1000 * 60 * 60 * 24));
  }, [sowingDate]);

  // Memoize the calculation of area
  const totalArea = React.useMemo(() => {
    if (!corrdinatesPoint || corrdinatesPoint.length < 3) return 0;
    const coordinates = corrdinatesPoint.map((point) => [point.lng, point.lat]);
    coordinates.push(coordinates[0]);
    const polygon = turf.polygon([coordinates]);
    const area = turf.area(polygon);
    return area / 4046.86;
  }, [corrdinatesPoint]);

  // Extract Crop_Growth_Stage
  const { Crop_Growth_Stage } = NpkData || {};

  // Dispatch calculateAiYield only when Crop_Growth_Stage changes
  useEffect(() => {
    if (Crop_Growth_Stage && cropDetials) {
      dispatch(calculateAiYield({ cropDetials, Crop_Growth_Stage }));
    }
  }, [dispatch, cropDetials, Crop_Growth_Stage]);

  // Fetch soil data when farm details are available
  useEffect(() => {
    if (cropDetials) {
      dispatch(fetchSoilData({ farmDetails: cropDetials }));
    }
  }, [cropDetials, dispatch]);

  return (
    <Card body className="mt-2 mb-3 shadow-md rounded-lg bg-white">
      <h2 className="text-lg sm:text-xl font-semibold text-[#344E41] mb-4 px-4 sm:px-6">
        Crop Health
      </h2>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between px-4 sm:px-6 gap-4">
        <div className="w-full sm:w-1/2 md:w-auto">
          <CropDetials
            cropDetials={selectedFieldsDetials}
            daysFromSowing={daysFromSowing}
            totalArea={totalArea}
            cropYield={cropYield}
          />
        </div>
        <div className="w-full sm:w-1/2 md:w-1/3 md:mr-8">
          <DaughnutChart selectedFieldsDetials={selectedFieldsDetials} />
        </div>
      </div>
      <div className="flex flex-col lg:flex-row lg:justify-between mt-6 px-4 sm:px-6 gap-4">
        <div className="w-full sm:w-1/2 lg:w-1/2">
          <h2 className="text-lg sm:text-xl font-semibold text-[#344E41] mb-4">
            Soil Analysis
          </h2>
          <SoilAnalysisChart selectedFieldsDetials={selectedFieldsDetials} />
        </div>
        <div className="w-full sm:w-1/2 lg:w-1/2">
          <SoilHealthChart selectedFieldsDetials={selectedFieldsDetials} />
        </div>
      </div>
    </Card>
  );
};

export default CropHealth;
