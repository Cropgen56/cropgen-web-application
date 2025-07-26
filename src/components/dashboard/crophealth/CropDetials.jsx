// CropDetails.jsx — compacted layout for tablet (md), unchanged on desktop
import React from "react";
import cropImage from "../../../assets/image/dashboard/crop-image.jpg";

const CropDetials = ({ cropDetials, daysFromSowing, totalArea, cropYield }) => {
    const crop = cropDetials?.[0];

    // console.log("cropYield:", cropYield);

    return (
        // <div className="flex flex-col sm:flex-row items-center mb-4 md:mb-0 md:gap-2 md:scale-[0.85] md:pl-1 lg:scale-100 lg:pl-4">
        <div className="flex flex-row items-center md:gap-1 md:pl-1 lg:pl-4">

            <img
                src={cropImage}
                alt="crop image"
                className="w-24 h-24 sm:w-20 sm:h-20 lg:w-32 lg:h-32 border-2 border-green-600 rounded-md p-1 object-cover"
            />
            <div className="mt-4 sm:mt-0 md:ml-1 flex flex-col gap-2 md:gap-1">
                {[
                ["Crop Name", crop?.cropName || "N/A"],
                ["Crop Age", `${daysFromSowing || 0} days`],
                ["Total Area", `${totalArea?.toFixed(2) || "0.00"} acres`],
                ["Standard Yield", cropYield?.Standard_Yield_units || "N/A"],
                ["AI Yield Data", cropYield?.AI_Predicted_Yield_units || "N/A"],
                ].map(([label, value], i) => (
                <div key={i} className="flex items-start">
                    <span className="whitespace-nowrap md:text-xs lg:text-md font-semibold text-[#344E41] min-w-28 md:min-w-[85px]">
                        {label}:
                    </span>
                    <span className="md:text-xs lg:text-md text-black break-words">{value}</span>
                </div>
                ))}
            </div>
        </div>
    );
};

export default CropDetials;