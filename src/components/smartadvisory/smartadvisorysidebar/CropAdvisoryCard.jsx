import img1 from "../../../assets/image/Frame 266.png";

const CropAdvisoryCard = ({ isTablet = false }) => {
  return (
    <div className={`bg-[#344e41] rounded-lg ${isTablet ? "p-[5px]" : "p-4"} text-white w-full flex flex-col justify-between`}>
      {/* Header */}
      <div className={`flex items-center justify-between ${isTablet ? "mb-[3px]" : "mb-2"}`}>
        <h2 className={`font-semibold ${isTablet ? "text-[7.5px]" : "text-[24px]"}`}>
          Nutrition Management
        </h2>
        <img className={`${isTablet ? "w-[10px]" : "w-[30px]"}`} src={img1} alt="" />
      </div>

      {/* Advisory */}
      <div className={`bg-[#5a7c6b] ${isTablet ? "p-[4px]" : "p-3"} rounded-md mb-[4px]`}>
        <p className={`font-bold ${isTablet ? "text-[7px]" : "text-[16px]"}`}>Crop: Wheat</p>
        <div className={`bg-white text-black rounded-md ${isTablet ? "p-[4px] mt-[3px] text-[7px] leading-[9px]" : "p-2 mt-2 text-[12px]"}`}>
          <p>
            Spray: Imidacloprid 17.8% SL (0.3ml/L) + Micronutrient Mix (2g/L).<br />
            Fertigation: NPK 19:19:19 (2kg/acre).<br />
            Disease: Monitor for Downy Mildew.<br />
            Pest: Check for Aphids and Whiteflies.
          </p>
          <div className={`${isTablet ? "mt-[3px]" : "mt-3"}`}>
            <p className={`font-semibold ${isTablet ? "text-[7px] mb-[2px]" : "text-[12px]"}`}>
              Weather Preparation: Heavy Rain/Flooding
            </p>
            <ul className={`${isTablet ? "list-disc ml-[10px] text-[7px] leading-[9px]" : "list-disc ml-4"}`}>
              <li>Create drainage channels.</li>
              <li>Elevate seedlings in raised beds.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className={`bg-white text-black rounded-md ${isTablet ? "px-[6px] py-[3px] text-[7px]" : "px-4 py-2 text-sm"} flex justify-between font-semibold`}>
        <span>Expected Yield</span>
        <span>4.2 t/hactare</span>
      </div>
    </div>
  );
};


export default CropAdvisoryCard;
