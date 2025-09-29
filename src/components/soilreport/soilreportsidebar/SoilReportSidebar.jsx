import React, { useState } from "react";
import { Operation2 } from "../../../assets/Icons";
import { CiSearch } from "react-icons/ci";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { fetchSatelliteDates } from "../../../redux/slices/satelliteSlice";
import PolygonPreview from "../../polygon/PolygonPreview";

const FieldInfo = ({ title, area, lat, lon, isSelected, onClick, coordinates }) => (
  <div
    className={`flex items-center gap-4 border-b border-[#344e41] py-3 px-2 cursor-pointer ${
      isSelected ? "bg-[#5a7c6b]" : "bg-transparent"
    }`}
    onClick={onClick}
  >
    <PolygonPreview coordinates={coordinates}  isSelected={isSelected}/>
    <div>
      <h4 className={`text-base ${isSelected ? "text-white" : "text-[#344e41]"}`}>
        {title}
      </h4>
      <p className="text-xs text-[#a2a2a2] mb-1">{area}</p>
      <div className="flex gap-4 text-xs text-[#a2a2a2]">
        <p>{lat} N</p>
        <p>{lon} E</p>
      </div>
    </div>
  </div>
);

const cropOptions = [
  "Barley",
  "Wheat",
  "Pearl Millet",
  "Sorghum",
  "Finger Millet",
  "Chickpea",
  "Red Gram",
  "Green Gram",
  "Black Gram",
  "Lentil",
  "Field Pea",
  "Horse Gram",
  "Cowpea",
  "Groundnut",
  "Mustard",
  "Soybean",
  "Sunflower",
  "Sesame",
  "Linseed",
  "Castor",
  "Safflower",
  "Niger",
  "Sugarcane",
  "Cotton",
  "Jute",
  "Tobacco",
  "Potato",
  "Tomato",
  "Brinjal",
  "Cabbage",
  "Cauliflower",
  "Onion",
  "Garlic",
  "Okra",
  "Carrot",
  "Radish",
  "Spinach",
  "Methi",
  "Green Peas",
  "Bitter Gourd",
  "Bottle Gourd",
  "Pumpkin",
  "Cucumber",
  "Beans",
  "Mango",
  "Banana",
  "Guava",
  "Apple",
  "Papaya",
  "Orange",
  "Lemon",
  "Pomegranate",
  "Grapes",
  "Pineapple",
  "Watermelon",
  "Muskmelon",
  "Turmeric",
  "Ginger",
  "Coriander",
  "Cumin",
  "Black Pepper",
  "Red Chilies",
  "Tea",
  "Coffee",
  "Coconut",
  "Arecanut",
  "Rubber",
  "Dragon Fruit",
  "Sponge Gourd",
  "Snake Gourd",
  "Ash Gourd",
  "Drumstick",
  "Chili",
  "Chia",
  "Rice",
  "Kiwi",
  "Amla",
  "Capsicum",
  "Other",
];

const SoilReportSidebar = ({
  selectedOperation,
  setSelectedOperation,
  setReportData,
  downloadPDF,
}) => {
  const [selectedOperationIndex, setSelectedOperationIndex] = useState(null);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [currentcrop, setcurrentcrop] = useState("");
  const [nextcrop, setnextcrop] = useState("");
  const [reportGenerated, setReportGenerated] = useState(false);
  const dispatch = useDispatch();

  const toggleSidebarVisibility = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  const fields = useSelector((state) => state.farmfield.fields);

  return (
    <>
      {isSidebarVisible && (
        <div className="w-[20vw] m-0 p-0 bg-white shadow-md flex flex-col h-screen relative overflow-y-auto">
          <div className="flex flex-col border-b border-[#344e41] gap-2 px-3 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Operation2 />
                <p className="text-[18px] font-bold text-[#344e41] m-0">Soil Report</p>
              </div>
              <svg
                width="30"
                height="30"
                className="soil-report-close-button"
                viewBox="0 0 30 30"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                onClick={toggleSidebarVisibility}
                style={{ cursor: "pointer" }}
              >
                <g clipPath="url(#clip0_302_105)">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M10.3662 15.8835C10.1319 15.6491 10.0002 15.3312 10.0002 14.9998C10.0002 14.6683 10.1319 14.3504 10.3662 14.116L17.4375 7.04478C17.6732 6.81708 17.989 6.69109 18.3167 6.69393C18.6445 6.69678 18.958 6.82824 19.1898 7.06C19.4215 7.29176 19.553 7.60528 19.5558 7.93303C19.5587 8.26077 19.4327 8.57652 19.205 8.81228L13.0175 14.9998L19.205 21.1873C19.4327 21.423 19.5587 21.7388 19.5558 22.0665C19.553 22.3943 19.4215 22.7078 19.1898 22.9395C18.958 23.1713 18.6445 23.3028 18.3167 23.3056C17.989 23.3085 17.6732 23.1825 17.4375 22.9548L10.3662 15.8835Z"
                    fill="#344E41"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_302_105">
                    <rect
                      width="30"
                      height="30"
                      fill="white"
                      transform="matrix(0 -1 1 0 0 30)"
                    />
                  </clipPath>
                </defs>
              </svg>
            </div>
            <div className="relative flex items-center mx-auto w-full">
              <CiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-100 text-lg" />
              <input
                type="search"
                className="w-full pl-10 pr-3 py-2 rounded-md border border-gray-300 text-gray-100 text-sm outline-none bg-[#344e41] focus:border-none"
                placeholder="Search"
              />
            </div>
          </div>
          <h2 className="px-4 pt-2 text-[18px] font-bold text-[#344e41]">
              All Farms
            </h2>
          <div className="flex flex-col">
            
            <div className="overflow-y-auto max-h-[225px] no-scrollbar">
              {(fields || []).map((fieldObj, index) => (
                <FieldInfo
                  key={fieldObj._id || index}
                  title={fieldObj.fieldName || `Field ${index + 1}`}
                  area={
                    fieldObj.acre !== undefined &&
                    fieldObj.acre !== null &&
                    fieldObj.acre !== ""
                      ? Number(fieldObj.acre).toFixed(3)
                      : ""
                  }
                  lat={
                    fieldObj.field?.[0]?.lat !== undefined
                      ? Number(fieldObj.field[0].lat).toFixed(3)
                      : ""
                  }
                  lon={
                    fieldObj.field?.[0]?.lng !== undefined
                      ? Number(fieldObj.field[0].lng).toFixed(3)
                      : ""
                  }
                  isSelected={selectedOperationIndex === index}
                   coordinates={fieldObj.field}
                  onClick={() => {
                    setSelectedOperationIndex(index);
                    setSelectedOperation(fieldObj);
                    setcurrentcrop("");
                    setnextcrop("");
                    setReportGenerated(false);
                  }}
                />
              ))}
            </div>

            {selectedOperationIndex !== null && (
              <div className="mt-3 p-3 flex flex-col gap-3 text-[#344e41] ">
                <h4 className="font-bold text-[#344e41]">Crop Details </h4>
                <label className="font-semibold"> Current Crop</label>
                <select
                  className="bg-[#344e41] rounded-md px-3 py-2 text-gray-200"
                  value={currentcrop}
                  onChange={(e) => setcurrentcrop(e.target.value)}
                >
                  <option>Select Crop</option>
                  {cropOptions.map((crop, index) => {
                    return (
                      <option key={index} value={crop}>
                        {crop}
                      </option>
                    );
                  })}
                </select>

                <label className="font-semibold">Next Crop</label>
                <select
                  className="bg-[#344e41] rounded-md px-3 py-2 text-gray-200"
                  value={nextcrop}
                  onChange={(e) => setnextcrop(e.target.value)}
                >
                  <option>Select Crop</option>
                  {cropOptions.map((crop, index) => {
                    return (
                      <option key={index} value={crop}>
                        {crop}
                      </option>
                    );
                  })}
                </select>

                {!reportGenerated ? (
                  <button
                    onClick={() => {
                      setReportData({
                        field: fields[selectedOperationIndex]?.farmName || "",
                        current: currentcrop,
                        nextcrop: nextcrop,
                        lat: fields[selectedOperationIndex]?.field?.[0]?.lat,
                        lng: fields[selectedOperationIndex]?.field?.[0]?.lng,
                        geometry: fields?.field,
                      });
                      dispatch(fetchSatelliteDates(fields?.field));
                      setReportGenerated(true);
                    }}
                    className="bg-[#344e41] rounded-md px-3 py-2 text-gray-200 mt-10"
                  >
                    Generate Report
                  </button>
                ) : (
                  <div className=" w-full flex justify-center p-4 ">
                    <button
                      onClick={downloadPDF}
                      className="bg-[#344e41] rounded-md px-10 py-2 text-gray-200 mt-4"
                    >
                      Download Report
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default SoilReportSidebar;
