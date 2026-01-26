import { Doughnut } from "react-chartjs-2";
import img4 from "../../../assets/image/Group.png";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { useSelector } from "react-redux";

ChartJS.register(ArcElement, Tooltip, Legend);

const IrrigationStatusCard = ({ isTablet = false }) => {
  const { advisory } = useSelector((state) => state.smartAdvisory || {});

  console.log(advisory)
  /* ---------- Safe Access ---------- */
  const irrigationStage = advisory?.smartAdvisory?.irrigationStage;
  const percentage = irrigationStage?.irrigationPercentage ?? 0;
  const rec = irrigationStage?.recommendations;

  /* ---------- Donut Chart ---------- */
  const data = {
    labels: ["Irrigated", "Remaining"],
    datasets: [
      {
        data: [percentage, Math.max(0, 100 - percentage)],
        backgroundColor: ["#FFEB8C", "#E6E6E6"],
        borderWidth: 0,
      },
    ],
  };

  const options = {
    cutout: "70%",
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
    maintainAspectRatio: false,
  };

  return (
    <div
      className={`bg-[#2F4F3A] w-full h-full rounded-[16px] ${
        isTablet ? "p-[4px]" : "p-3"
      } text-white flex flex-col justify-between`}
    >
      {/* ================= HEADER ================= */}
      <div className="flex justify-between items-center">
        <h2 className={`${isTablet ? "text-[8px]" : "text-[22px]"} font-semibold`}>
          Irrigation Status
        </h2>
        <img
          className={`${isTablet ? "w-[10px] h-[10px]" : "w-[20px]"}`}
          src={img4}
          alt="Irrigation"
        />
      </div>

      {/* ================= DONUT ================= */}
      <div
        className={`relative flex justify-center items-center ${
          isTablet ? "h-[90px]" : "h-[180px]"
        }`}
      >
        <Doughnut data={data} options={options} />
        <div
          className={`absolute font-bold ${
            isTablet ? "text-[9px]" : "text-3xl"
          }`}
        >
          {percentage}%
        </div>
      </div>

      {/* ================= RECOMMENDATION ================= */}
      <div
        className={`bg-[#5A7C6B] rounded-md ${
          isTablet ? "p-[4px]" : "p-2"
        }`}
      >
        <h3
          className={`${
            isTablet ? "text-[8px]" : "text-[15px]"
          } font-semibold mb-1`}
        >
          Recommendation
        </h3>

        {rec ? (
          <p
            className={`${
              isTablet ? "text-[7px] leading-[10px]" : "text-[12px]"
            }`}
          >
            <strong>{rec.when}:</strong> {rec.action}.  
            Apply irrigation for <strong>{rec.quantity} {rec.unit}</strong>.  
            {rec.rationale}
          </p>
        ) : (
          <p
            className={`${
              isTablet ? "text-[7px]" : "text-[12px]"
            }`}
          >
            No irrigation required at this stage.
          </p>
        )}
      </div>

      {/* ================= FOOTER ================= */}
      <div
        className={`flex justify-between items-center ${
          isTablet ? "text-[7px] mt-[4px]" : "text-sm mt-4"
        } font-semibold`}
      >
        <span>Last Irrigation</span>
        <span>—</span>
      </div>
    </div>
  );
};

export default IrrigationStatusCard;
