// CropDetails.jsx — updated to match `dashboard 2.png` layout
import React from "react";

const CropDetials = ({ cropDetials, daysFromSowing, totalArea, cropYield }) => {
    const crop = cropDetials?.[0];
    const yieldVal = cropYield?.Standard_Yield_units || "N/A";

    return (
        <div className="flex gap-4">
      
        <div className="flex flex-row items-center gap-4 md:gap-2">
            
            <div className="flex flex-col gap-[4px] text-sm md:text-[10px] text-[#344E41]">
               <div className="flex justify-between gap-4">
                 <div className="flex gap-2">
                    <span className="font-semibold">Crop Name :-</span>
                    <span className="text-black font-medium">{crop?.cropName || "N/A"}</span>
                </div>
                <div className="flex gap-2">
                    <span className="font-semibold">Total Area :-</span>
                    <span className="text-black font-medium">{totalArea?.toFixed(1) || "0.0"} Acre</span>
                </div>
               </div>
                <div className="flex gap-2">
                    <span className="font-semibold">Crop Age :-</span>
                    <span className="text-black font-medium">{daysFromSowing} days</span>
                </div>
                <div className="flex gap-2">
                    <span className="font-semibold">Standard Yield Data :-</span>
                    <span className="text-black font-medium">{yieldVal}</span>
                </div>
        
            </div>
        </div>
        </div>
    );
};

export default CropDetials;
