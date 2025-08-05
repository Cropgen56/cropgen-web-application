import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCropHealth } from "../../../redux/slices/satelliteSlice";

const CropHealthStatusBar = ({ selectedFieldsDetials }) => {
  const dispatch = useDispatch();
  const farmDetails = selectedFieldsDetials?.[0];
  const { cropHealth, loading } = useSelector((state) => state?.satellite);

  const { Health_Percentage = 0, Crop_Health = "Unknown" } = cropHealth || {};

  useEffect(() => {
    if (farmDetails) {
      dispatch(fetchCropHealth({ ...farmDetails, bypassCache: true })); // ✅
    }
  }, [dispatch, farmDetails]);

  return (
    <div className="flex flex-col gap-1 w-full">
      <span className="text-[#344E41] font-semibold text-sm md:text-[15px]">
        Overall Crop Health
      </span>
      <div className="flex items-baseline gap-2">
        <span className="text-black font-bold text-xl md:text-[20px]">
          {Health_Percentage}%
        </span>
        <span className="text-gray-400 text-xs md:text-[9px]">
          Real-time Health Data
        </span>
      </div>
      <div className="relative w-full h-2 bg-gray-100 rounded-md mt-1">
        <div
          className="absolute left-0 top-0 h-2 bg-yellow-400 rounded-md"
          style={{ width: `${Health_Percentage}%` }}
        />
      </div>
      <div className="mt-1 text-right">
        <span className="text-xs text-yellow-500 bg-yellow-50 px-2 py-[2px] rounded">
          {Crop_Health}
        </span>
      </div>
    </div>
  );
};

export default CropHealthStatusBar;
