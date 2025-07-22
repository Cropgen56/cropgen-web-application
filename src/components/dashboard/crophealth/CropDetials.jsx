// CropDetails.jsx — compacted layout for tablet (md), unchanged on desktop
import React from "react";
import cropImage from "../../../assets/image/dashboard/crop-image.jpg";

const CropDetials = ({ cropDetials, daysFromSowing, totalArea, cropYield }) => {
    const crop = cropDetials?.[0];

    // console.log("cropYield:", cropYield);

    return (
        // <div className="flex flex-col sm:flex-row items-center mb-4 md:mb-0 md:gap-2 md:scale-[0.85] md:pl-1 lg:scale-100 lg:pl-4">
        <div className="flex flex-row items-center mb-4 md:mb-0 md:gap-2 md:pl-1 lg:pl-4">

            <img
                src={cropImage}
                alt="crop image"
                className="w-24 h-24 sm:w-32 sm:h-32 lg:w-32 lg:h-32 border-2 border-green-600 rounded-md p-1 object-cover"
            />
            <div className="mt-4 sm:mt-0 sm:ml-4 md:ml-2 flex flex-col gap-2 md:gap-1">
                {[
                ["Crop Name", crop?.cropName || "N/A"],
                ["Crop Age", `${daysFromSowing || 0} days`],
                ["Total Area", `${totalArea?.toFixed(2) || "0.00"} acres`],
                ["Standard Yield", cropYield?.Standard_Yield_units || "N/A"],
                ["AI Yield Data", cropYield?.AI_Predicted_Yield_units || "N/A"],
                ].map(([label, value], i) => (
                <div key={i} className="flex items-center">
                    <span className="whitespace-nowrap text-sm md:text-md font-semibold text-[#344E41] min-w-[100px] md:min-w-[120px]">
                        {label}:
                    </span>
                    <span className="text-sm md:text-md text-black lg:whitespace-nowrap">{value}</span>
                </div>
                ))}
            </div>
        </div>
    );
};

export default CropDetials;