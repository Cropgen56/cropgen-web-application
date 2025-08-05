import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import Card from "react-bootstrap/Card";
import * as turf from "@turf/turf";
import SoilAnalysisChart from "./SoilAnalysisChart.jsx";
import SoilHealthChart from "./SoilHealthChart.jsx";
import { calculateAiYield, fetchSoilData } from "../../../redux/slices/satelliteSlice.js";
import cropImage from "../../../assets/image/dashboard/crop-image.jpg";
import CropHealthStatusBar from "./CropHealthStatusBar.jsx";

const CropHealth = ({ selectedFieldsDetials }) => {
    const cropDetials = selectedFieldsDetials?.[0];
    const sowingDate = cropDetials?.sowingDate;
    const corrdinatesPoint = cropDetials?.field;
    const dispatch = useDispatch();
    const { cropYield, NpkData } = useSelector((state) => state?.satellite);
    const { cropHealth } = useSelector((state) => state?.satellite);
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
        if (NpkData?.Crop_Growth_Stage && cropDetials) {
            dispatch(calculateAiYield({ cropDetials, Crop_Growth_Stage: NpkData.Crop_Growth_Stage }));
        }
    }, [dispatch, cropDetials, NpkData?.Crop_Growth_Stage]);

    useEffect(() => {
        if (cropDetials) dispatch(fetchSoilData({ farmDetails: cropDetials }));
    }, [cropDetials, dispatch]);

    const crop = cropDetials;
    const yieldVal = cropYield?.Standard_Yield_units || "N/A";



    return (
        <Card body className="mt-2 mb-6 shadow-md rounded-lg bg-white md:h-[350px] md:overflow-y-auto lg:h-auto">
            <h2 className="text-lg sm:text-xl font-semibold text-[#344E41] lg:mb-4 px-4 sm:px-6">
                Crop Health
            </h2>

            {/* === Main Layout: Image container + Details container === */}
            <div className="flex flex-row px-4 gap-6">
                {/* Left: BIG CROP IMAGE in its own box */}
                <div className="flex flex-col items-center justify-center border border-green-600 rounded-md p-2 w-[160px] h-[160px]">
                    <img
                        src={cropImage}
                        alt="crop"
                        className="w-full h-full object-cover rounded-md"
                    />
                </div>

                {/* Right: Info + health status */}
                <div className="flex flex-col justify-between w-full gap-4">
                    {/* Top: Grid details */}
                    <div className="grid grid-cols-2 gap-x-20 gap-y-5 text-sm md:text-[10px] text-[#344E41]">
                        <div className="flex gap-1 ">
                            <span className="font-semibold text-[20px]">Crop Name :-</span>
                            <span className="text-black font-medium text-[20px]">{crop?.cropName || "N/A"}</span>
                        </div>
                        <div className="flex gap-1">
                            <span className="font-semibold text-[20px]">Crop Age :-</span>
                            <span className="text-black font-medium text-[20px]">{daysFromSowing} days</span>
                        </div>
                        <div className="flex gap-1">
                            <span className="font-semibold text-[20px]">Total Area :-</span>
                            <span className="text-black font-medium text-[20px]">
                                {totalArea?.toFixed(1) || "0.0"} Acre
                            </span>
                        </div>
                        <div className="flex gap-1">
                            <span className="font-semibold text-[20px]">Standard Yield :-</span>
                            <span className="text-black font-medium text-[20px]">{yieldVal}</span>
                        </div>
                    </div>

                    {/* Bottom: Health status */}
                    <div className="w-full flex flex-col justify-center">
                        <CropHealthStatusBar selectedFieldsDetials={selectedFieldsDetials} />
                    </div>

                </div>
            </div>

            {/* Bottom: Charts */}
            <div className="flex flex-col lg:flex-row md:items-center md:justify-between lg:mt-4 mt-2 px-2 md:px-4 gap-2 md:gap-4">
                <div className="w-full lg:w-1/3">
                    <h2 className="text-left text-lg sm:text-xl font-semibold text-[#344E41] lg:mb-4 mt-2">
                        Soil Analysis
                    </h2>
                    <SoilAnalysisChart selectedFieldsDetials={selectedFieldsDetials} />
                </div>
                <div className="w-full lg:w-2/3">
                    <SoilHealthChart selectedFieldsDetials={selectedFieldsDetials} />
                </div>
            </div>
        </Card>
    );
};

export default CropHealth;
