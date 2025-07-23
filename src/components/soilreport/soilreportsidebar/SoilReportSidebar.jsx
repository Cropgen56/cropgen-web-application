import React, { useState } from "react";
import { Operation2 } from "../../../assets/Icons";
import { FieldIcon } from "../../../assets/Globalicon";
import { CiSearch } from "react-icons/ci";
import "./SoilReportSidebar.css";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { fetchSatelliteDates } from "../../../redux/slices/satelliteSlice";
const FieldInfo = ({ title, area, lat, lon, isSelected, onClick }) => (

  <div
    className={`soil-report-info ${isSelected ? "selected-soil-report" : ""}`}
    onClick={onClick}

  >
    <FieldIcon isSelected={isSelected} />
    <div className="soil-report-operations">
      <h4 className={`${isSelected ? "selected-title" : ""}`}>{title}</h4>
      <p className="ha">{area} ha</p>
      <div className="soil-report-details">
        <p>{lat} N</p>
        <p>{lon} E</p>
      </div>
    </div>
  </div>
);

const cropOptions = [
  "Wheat",
  "Rice",
  "Corn",
  "Soybean",
  "Barley",
  "Other"
];



const SoilReportSidebar = ({ selectedOperation, setSelectedOperation, setReportData }) => {
  const [selectedOperationIndex, setSelectedOperationIndex] = useState(null);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [currentcrop, setcurrentcrop] = useState("");
  const [nextcrop, setnextcrop] = useState("");
  const [reportGenerated,setReportGenerated] = useState(false);
  const dispatch = useDispatch();


  const toggleSidebarVisibility = () => {
    setIsSidebarVisible(!isSidebarVisible);

  };

  // const operations = [
  //   { title: "Field 1", area: "0.12h", lat: "24.154", lon: "56.165" },
  //   { title: "Field 2", area: "0.14h", lat: "27.234", lon: "76.564" }
  // ];

  const fields = useSelector(state => state.farmfield.fields);
  console.log(fields);

  return (
    <>
      {isSidebarVisible && (
        <div className="soil-report-sidebar h-full flex flex-col  shadow-lg  relative">
          <div className="soil-report-heading">
            <div className="soil-report-first-row">
              <Operation2 />
              <h2>Soil Report</h2>
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
            <div className="soil-report-search">
              <CiSearch className="search-icon " />
              <input
                type="search"
                className="search-input"
                placeholder="Search"
              />
            </div>
          </div>
          <div className="soil-report-field">
            <h2>Field</h2>
      {(fields || []).map((fieldObj, index) => (
  <FieldInfo
    key={fieldObj._id || index}
    title={fieldObj.fieldName || `Field ${index + 1}`}
      area={
      fieldObj.acre !== undefined && fieldObj.acre !== null && fieldObj.acre !== ""
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
    onClick={() => {
      setSelectedOperationIndex(index);
      setSelectedOperation(fieldObj);
      setcurrentcrop("");
      setnextcrop("");
      setReportGenerated(false);
    }}
  />
))}

            {selectedOperationIndex !== null && (
              <div className="mt-5 p-3 flex flex-col gap-3 text-[#344e41] ">
                <h4 className="font-bold text-[#344e41]">Crop Details </h4>
                <label className="font-semibold" > Current Crop</label>
                <select className="bg-[#344e41] rounded-md px-3 py-2 text-gray-200"
                  value={currentcrop}
                  onChange={(e) => setcurrentcrop(e.target.value)}
                >
                  <option >Select Crop</option>
                  {cropOptions.map((crop, index) => {
                    return (
                      <option key={index} value={crop}>{crop}</option>
                    )
                  })}
                </select>

                <label className="font-semibold">Next Crop</label>
                <select className="bg-[#344e41] rounded-md px-3 py-2 text-gray-200"
                  value={nextcrop}
                  onChange={(e) => setnextcrop(e.target.value)}

                >
                  <option >Select Crop</option>
                  {cropOptions.map((crop, index) => {
                    return (
                      <option key={index} value={crop}>{crop}</option>
                    )
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
          setReportGenerated(true); // Change button to "Download Report"
        }}
        className="bg-[#344e41] rounded-md px-3 py-2 text-gray-200 mt-10"
      >
        Generate Report
      </button>
    ) : (
        <div className="absolute left-0 bottom-10 w-full flex justify-center p-4 ">
              <button
        className="bg-[#344e41] w-full rounded-md px-3 py-2 text-gray-200 "
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
