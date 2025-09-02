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
      dispatch(fetchCropHealth({ ...farmDetails, bypassCache: true }));
    }
  }, [dispatch, farmDetails]);

  return (
    <div className="w-full flex flex-col gap-2">
      {/* ✅ Heading */}
      <span className="text-[#344E41] font-semibold text-[16px]">
        Overall Crop Health
      </span>

      {/* ✅ Percentage, Message, and Badge Row */}
      <div className="flex items-center justify-between w-full">
        <div className="flex items-baseline gap-3">
          <span className="text-black font-bold text-[20px] md:text-[20px]">
            {Health_Percentage}%
          </span>
          <span className="text-gray-400 text-[12px] md:text-[12px]">
            No Precipitation within the Hour
          </span>
        </div>

        <span className="text-[#FCC21B] bg-[#F8F8F8] px-4 py-1 rounded-md text-[20px] font-semibold">
          {Crop_Health}
        </span>
      </div>

      {/* ✅ Progress bar */}
      <div className="relative w-full h-3 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="absolute left-0 top-0 h-3 bg-yellow-400 rounded-full"
          style={{ width: `${Health_Percentage}%` }}
        />
      </div>
    </div>
  );
};

export default CropHealthStatusBar;
