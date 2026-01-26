import img3 from "../../../assets/image/Frame 268.png";
import { useSelector } from "react-redux";

/* ================= HELPERS ================= */

const getRiskColor = (message = "") => {
  const msg = message.toLowerCase();
  if (msg.includes("high")) return "text-red-600";
  if (msg.includes("moderate")) return "text-yellow-500";
  if (msg.includes("low")) return "text-green-600";
  return "text-gray-600";
};

const PestDiseaseCard = () => {
  const { advisory } = useSelector((state) => state.smartAdvisory || {});

  // NEW SOURCE (activitiesToDo)
  const cropRisk = advisory?.activitiesToDo?.find(
    (a) => a.type === "CROP_RISK"
  );

  return (
    <div className="bg-[#344e41] rounded-lg p-4 text-white w-full shadow-sm flex flex-col gap-2">
      {/* ================= HEADER ================= */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-semibold text-[22px]">Crop Risk</h2>
        <img className="w-[30px]" src={img3} alt="Crop Risk" />
      </div>

      {/* ================= CONTENT ================= */}
      <div className="bg-white text-black rounded-md p-3 text-sm flex flex-col justify-center h-full">
        {!cropRisk ? (
          <>
            <p className="font-semibold text-green-600 text-center">
              No Major Crop Risk
            </p>
            <p className="text-[12px] mt-1 text-gray-600 text-center">
              Crop condition is stable. Continue normal monitoring.
            </p>
          </>
        ) : (
          <>
            {/* TITLE */}
            <p className="font-bold mb-1">
              • {cropRisk.title}
            </p>

            {/* MESSAGE */}
            <p
              className={`text-[12px] leading-relaxed mb-2 ${getRiskColor(
                cropRisk.message
              )}`}
            >
              {cropRisk.message}
            </p>

            {/* DETAILS */}
            {cropRisk.details && (
              <div className="text-[11px] text-gray-600 space-y-1">
                {cropRisk.details.chemical && (
                  <div>🧴 {cropRisk.details.chemical}</div>
                )}
                {cropRisk.details.quantity && (
                  <div>📏 {cropRisk.details.quantity}</div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PestDiseaseCard;
