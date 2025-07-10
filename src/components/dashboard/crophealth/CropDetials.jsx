import React from "react";
import cropImage from "../../../assets/image/dashboard/crop-image.jpg";

const CropDetials = ({ cropDetials, daysFromSowing, totalArea, cropYield }) => {
  const crop = cropDetials?.[0]; // Access the first item in the array

  return (
    <div className="flex flex-col md:flex-row items-center mb-4 md:mb-0 md:px-0 md:mx-0">
      <img
        src={cropImage}
        alt="crop image"
        className="w-24 h-24 md:w-24 md:h-24 border-2 border-green-600 rounded-md p-1 object-cover"
      />
      <div className="mt-4 md:mt-0 md:ml-2 flex flex-col gap-2 md:gap-1">
        <div className="flex items-center">
          <span className="text-sm sm:text-base md:text-sm font-semibold text-[#344E41] min-w-[120px] md:min-w-[100px]">
            Crop Name:
          </span>
          <span className="text-sm sm:text-base md:text-sm text-black">
            {crop?.cropName || "N/A"}
          </span>
        </div>
        <div className="flex items-center">
          <span className="text-sm sm:text-base md:text-sm font-semibold text-[#344E41] min-w-[120px] md:min-w-[100px]">
            Crop Age:
          </span>
          <span className="text-sm sm:text-base md:text-sm text-black">
            {daysFromSowing || 0} days
          </span>
        </div>
        <div className="flex items-center">
          <span className="text-sm sm:text-base md:text-sm font-semibold text-[#344E41] min-w-[120px] md:min-w-[100px]">
            Total Area:
          </span>
          <span className="text-sm sm:text-base md:text-sm text-black">
            {totalArea?.toFixed(2) || "0.00"} acres
          </span>
        </div>
        <div className="flex items-center">
          <span className="text-sm sm:text-base md:text-sm font-semibold text-[#344E41] min-w-[120px] md:min-w-[100px]">
            Standard Yield:
          </span>
          <span className="text-sm sm:text-base md:text-sm text-black">
            {cropYield?.Standard_Yield_units || "N/A"}
          </span>
        </div>
        <div className="flex items-center">
          <span className="text-sm sm:text-base md:text-sm font-semibold text-[#344E41] min-w-[120px] md:min-w-[100px]">
            AI Yield Data:
          </span>
          <span className="text-sm sm:text-base md:text-sm text-black">
            {cropYield?.AI_Predicted_Yield_units || "N/A"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CropDetials;
