
// CropHealth.jsx — optimize tablet layout: enlarge doughnut + inline crop details
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Card from "react-bootstrap/Card";
import * as turf from "@turf/turf";
import DaughnutChart from "./DaughnutChart.jsx";
import SoilAnalysisChart from "./SoilAnalysisChart.jsx";
import SoilHealthChart from "./SoilHealthChart.jsx";
import { calculateAiYield, fetchSoilData } from "../../../redux/slices/satelliteSlice.js";
import CropDetials from "./CropDetials.jsx";

const CropHealth = ({ selectedFieldsDetials }) => {
    const cropDetials = selectedFieldsDetials?.[0];
    const sowingDate = cropDetials?.sowingDate;
    const corrdinatesPoint = cropDetials?.field;
    const dispatch = useDispatch();
    const { cropYield, NpkData } = useSelector((state) => state?.satellite);

    const daysFromSowing = React.useMemo(() => {
        if (!sowingDate) return 0;

        const targetDate = new Date(sowingDate);
        const currentDate = new Date();

        targetDate.setHours(0, 0, 0, 0);
        currentDate.setHours(0, 0, 0, 0);

        return Math.floor((currentDate - targetDate) / (1000 * 60 * 60 * 24));
    }, [sowingDate]);

    const totalArea = React.useMemo(() => {
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

    return (
        <Card body className="mt-2 mb-6 shadow-md rounded-lg bg-white md:h-[350px] md:overflow-y-auto lg:h-auto">
            <h2 className="text-lg sm:text-xl font-semibold text-[#344E41] lg:mb-4 px-4 sm:px-6">
                Crop Health
            </h2>

            {/* Top section: CropDetails + Doughnut */}
            <div className="flex flex-col lg:flex-row md:items-center md:justify-between px-2 md:px-4 gap-2 md:gap-4">
                <div className="w-full lg:w-1/2">
                    <CropDetials
                        cropDetials={selectedFieldsDetials}
                        daysFromSowing={daysFromSowing}
                        totalArea={totalArea}
                        cropYield={cropYield}
                    />
                </div>
                <div className="w-full md:w-1/2 flex justify-center md:justify-end">
                    <DaughnutChart selectedFieldsDetials={selectedFieldsDetials} />
                </div>
            </div>

            {/* Bottom section: Soil Charts */}
            <div className="flex flex-col lg:flex-row md:items-center md:justify-between mt-4 px-2 md:px-4 gap-2 md:gap-4">
                <div className="w-full lg:w-1/3">
                    <h2 className="text-left text-lg sm:text-xl font-semibold text-[#344E41] mb-4">
                        Soil Analysis
                    </h2>
                    <SoilAnalysisChart selectedFieldsDetials={selectedFieldsDetials} />
                </div>
                <div className="w-full lg:w-2/3">
                    {/* <h2 className="text-left text-lg sm:text-xl font-semibold text-[#344E41] mb-2 sm:mb-6">
                        Soil Health
                    </h2> */}
                    <SoilHealthChart selectedFieldsDetials={selectedFieldsDetials} />
                </div>
            </div>
        </Card>
    );
};

export default CropHealth;
