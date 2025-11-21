import { Doughnut } from "react-chartjs-2";
import img4 from "../../../assets/image/Group.png";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { useSelector } from "react-redux";

ChartJS.register(ArcElement, Tooltip, Legend);

const IrrigationStatusCard = ({ isTablet = false }) => {
  const advisory = useSelector((state) => state.smartAdvisory.advisory);

  const irrigationStage =
    advisory?.advisories?.[0]?.smartAdvisory?.irrigationStage;
  const percentage = irrigationStage?.irrigationPercentage ?? 0;
  const recommendations = irrigationStage?.recommendations ?? [];

  const data = {
    labels: ["Moisture", "Remaining"],
    datasets: [
      {
        data: [percentage, 100 - percentage],
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
        isTablet ? "p-[2px]" : "p-3"
      } text-white flex flex-col justify-between`}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-[2px]">
        <h2 className={`${isTablet ? "text-[7px]" : "text-xl"} font-semibold`}>
          Irrigation Status
        </h2>
        <img
          className={`${isTablet ? "w-[10px] h-[10px]" : "w-[20px]"}`}
          src={img4}
          alt=""
        />
      </div>

      {/* Donut Chart */}
      <div
        className={`flex justify-center items-center relative ${
          isTablet ? "h-[85px]" : "h-[180px]"
        }`}
      >
        <Doughnut data={data} options={options} />
        <div
          className={`absolute text-white font-bold ${
            isTablet ? "text-[7.5px]" : "text-3xl"
          }`}
        >
          {percentage}%
        </div>
      </div>

      {/* Recommendation */}
      <div
        className={`bg-[#5A7C6B] rounded-md ${
          isTablet ? "p-[2px] mt-[4px]" : "p-2 mt-3"
        }`}
      >
        <h3
          className={`${
            isTablet ? "text-[7px]" : "text-[15px]"
          } font-semibold mb-[1px]`}
        >
          Recommendation
        </h3>
        <ul
          className={`${
            isTablet ? "text-[7px] leading-[9px]" : "text-[12px]"
          } list-disc list-inside`}
        >
          {recommendations.length > 0 ? (
            recommendations.map((rec, index) => (
              <li key={index}>
                {` ${rec.when.replace("_", " ")}, ${rec.action} Use ${
                  rec.quantity
                } ${rec.unit}. Reason: ${rec.rationale}`}
              </li>
            ))
          ) : (
            <li>No irrigation recommendations available</li>
          )}
        </ul>
      </div>

      {/* Footer */}
      <div
        className={`flex justify-between items-center ${
          isTablet ? "mt-[4px] text-[7px]" : "mt-6 text-sm"
        } font-semibold`}
      >
        <span>Last Watered</span>
        <span>2 days ago</span>
      </div>
    </div>
  );
};

export default IrrigationStatusCard;
