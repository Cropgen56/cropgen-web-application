import img3 from "../../../assets/image/Frame 268.png";
import { useSelector } from "react-redux";

const PestDiseaseCard = () => {
  const { advisory } = useSelector((state) => state.smartAdvisory || {});

  const cropRisk =
    advisory?.smartAdvisory?.weeklyAdvisory?.cropRiskAlert ?? null;

  /* ---------- Helpers ---------- */
  const getRiskColor = (level) => {
    if (!level) return "text-gray-500";
    if (level.toLowerCase() === "high") return "text-red-600";
    if (level.toLowerCase() === "medium") return "text-yellow-500";
    if (level.toLowerCase() === "low") return "text-green-600";
    return "text-gray-500";
  };

  return (
    <div className="bg-[#344e41] rounded-lg p-4 text-white w-full shadow-sm flex flex-col gap-2">
      {/* ================= HEADER ================= */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-semibold text-[22px]">Crop Risk</h2>
        <img className="w-[30px]" src={img3} alt="Crop Risk" />
      </div>

      {/* ================= CONTENT ================= */}
      <div className="bg-white text-black rounded-md p-3 text-sm flex flex-col justify-center h-full">
        {cropRisk?.enabled ? (
          <>
            <p className="font-bold mb-1">
              • {cropRisk.riskType || "Crop Risk"}{" "}
              {cropRisk.riskLevel && (
                <span
                  className={`ml-1 font-medium ${getRiskColor(
                    cropRisk.riskLevel
                  )}`}
                >
                  ({cropRisk.riskLevel})
                </span>
              )}
            </p>

            <p className="text-[12px] text-gray-700 leading-relaxed">
              {cropRisk.instruction ||
                "Monitor the field regularly and take preventive measures."}
            </p>
          </>
        ) : (
          <>
            <p className="font-semibold text-green-600 text-center">
              No Significant Crop Risk
            </p>

            <p className="text-[12px] mt-1 text-gray-600 text-center leading-relaxed">
              {cropRisk?.instruction ||
                "Crop health is stable. Continue regular field monitoring."}
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default PestDiseaseCard;
