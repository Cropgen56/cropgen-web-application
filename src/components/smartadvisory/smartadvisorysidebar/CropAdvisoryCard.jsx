import { useSelector } from "react-redux";
import img1 from "../../../assets/image/Frame 266.png";

const CropAdvisoryCard = ({ isTablet = false }) => {
  const advisory = useSelector((state) => state.smartAdvisory.advisory);

  const nutrientManagement =
    advisory?.advisories?.[0]?.smartAdvisory?.nutrientManagement;

  return (
    <div
      className={`bg-[#344e41] rounded-lg ${
        isTablet ? "p-[5px]" : "p-4"
      } text-white w-full flex flex-col justify-between`}
    >
      {/* Header */}
      <div
        className={`flex items-center justify-between ${
          isTablet ? "mb-[3px]" : "mb-2"
        }`}
      >
        <h2
          className={`font-semibold ${
            isTablet ? "text-[7.5px]" : "text-[24px]"
          }`}
        >
          Nutrition Management
        </h2>
        <img
          className={`${isTablet ? "w-[10px]" : "w-[30px]"}`}
          src={img1}
          alt=""
        />
      </div>

      {/* Advisory */}
      <div
        className={`bg-[#5a7c6b] ${
          isTablet ? "p-[4px]" : "p-3"
        } rounded-md mb-[4px]`}
      >
        <p className={`font-bold ${isTablet ? "text-[7px]" : "text-[16px]"}`}>
          Crop: Wheat
        </p>
        <div
          className={`bg-white text-black rounded-md ${
            isTablet
              ? "p-[4px] mt-[3px] text-[7px] leading-[9px]"
              : "p-2 mt-2 text-[12px]"
          }`}
        >
          {nutrientManagement?.spray?.length > 0 && (
            <p>
              <strong>Spray:</strong>{" "}
              {nutrientManagement.spray.map((item, index) => (
                <span key={index}>
                  {item}
                  {index !== nutrientManagement.spray.length - 1 ? " " : ""}
                </span>
              ))}
            </p>
          )}

          {/* Micronutrient Recommendations */}
          {nutrientManagement?.micronutrient?.length > 0 && (
            <p>
              <strong>Micronutrient:</strong>{" "}
              {nutrientManagement.micronutrient.map((item, index) => (
                <span key={index}>
                  {item}
                  {index !== nutrientManagement.micronutrient.length - 1
                    ? " "
                    : ""}
                </span>
              ))}
            </p>
          )}

          {/* Fertigation Recommendations */}
          {nutrientManagement?.fertigation?.length > 0 && (
            <p>
              <strong>Fertigation:</strong>{" "}
              {nutrientManagement.fertigation.map((item, index) => (
                <span key={index}>
                  {item}
                  {index !== nutrientManagement.fertigation.length - 1
                    ? " "
                    : ""}
                </span>
              ))}
            </p>
          )}

          {/* Disease Recommendations */}
          {nutrientManagement?.disease?.length > 0 && (
            <p>
              <strong>Disease:</strong>{" "}
              {nutrientManagement.disease.map((item, index) => (
                <span key={index}>
                  {item}
                  {index !== nutrientManagement.disease.length - 1 ? " " : ""}
                </span>
              ))}
            </p>
          )}

          {/* Pest Recommendations */}
          {nutrientManagement?.pest?.length > 0 && (
            <p>
              <strong>Pest:</strong>{" "}
              {nutrientManagement.pest.map((item, index) => (
                <span key={index}>
                  {item}
                  {index !== nutrientManagement.pest.length - 1 ? " " : ""}
                </span>
              ))}
            </p>
          )}

          <div className={`${isTablet ? "mt-[3px]" : "mt-3"}`}>
            <span
              className={`font-bold ${
                isTablet ? "text-[7px] mb-[2px]" : "text-[14px]"
              }`}
            >
              Recommendation:
            </span>
            {nutrientManagement?.recommendationNote && (
              <p className="mt-2 italic">
                {nutrientManagement.recommendationNote}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        className={`bg-white text-black rounded-md ${
          isTablet ? "px-[6px] py-[3px] text-[7px]" : "px-4 py-2 text-sm"
        } flex justify-between font-semibold`}
      >
        <span>Expected Yield</span>
        <span>4.2 t/hactare</span>
      </div>
    </div>
  );
};

export default CropAdvisoryCard;
