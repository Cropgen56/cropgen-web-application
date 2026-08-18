import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectAdvisoryCrop } from "../../../redux/slices/smartAdvisorySlice";

function cropIdOf(advisory) {
  const crop = advisory?.cropInstanceId;
  if (!crop) return null;
  return String(crop._id ?? crop);
}

const ROLE_LABEL = {
  main: "Main",
  intercrop: "Intercrop",
  cover: "Cover crop",
};

/**
 * Multi-crop: lets the user pick which of the farm's active crops' advisory
 * is shown by the cards below. Hidden entirely on single-crop farms so the
 * default experience stays unchanged.
 */
const CropSwitcher = () => {
  const dispatch = useDispatch();
  const advisories = useSelector((s) => s.smartAdvisory.advisories) || [];
  const selectedCropId = useSelector((s) => s.smartAdvisory.selectedCropId);
  const farmSummary = useSelector((s) => s.smartAdvisory.farmSummary);

  if (advisories.length < 2) return null;

  return (
    <div className="bg-[#344e41] rounded-lg shadow-md border border-white/5 p-3 text-white w-full">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <span className="text-xs uppercase tracking-wide text-white/60">
          This farm has {advisories.length} active crops
        </span>
        {typeof farmSummary?.averageCropHealthPercentage === "number" && (
          <span className="text-xs text-white/60">
            Avg. crop health: {farmSummary.averageCropHealthPercentage}%
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mt-2">
        {advisories.map((advisory) => {
          const cropId = cropIdOf(advisory);
          const crop = advisory.cropInstanceId;
          const isSelected = cropId === selectedCropId;
          const roleLabel = ROLE_LABEL[crop?.cropRole] || crop?.cropRole;

          return (
            <button
              key={cropId || advisory._id}
              type="button"
              onClick={() => dispatch(selectAdvisoryCrop(cropId))}
              className={`px-3 py-1.5 rounded-full text-sm capitalize transition-colors ${
                isSelected
                  ? "bg-[#63C086] text-[#10271D] font-semibold"
                  : "bg-[#214A37] text-white/70 hover:bg-[#295742]"
              }`}
            >
              {crop?.cropName || "Crop"}
              {roleLabel && (
                <span className="ml-1 text-xs opacity-70">({roleLabel})</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CropSwitcher;
