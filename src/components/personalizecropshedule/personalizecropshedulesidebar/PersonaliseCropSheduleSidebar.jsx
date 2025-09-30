import React, { useState } from "react";
import { PersonaliseCropSheduleDarkIcon } from "../../../assets/Icons";
import { FieldIcon } from "../../../assets/Globalicon";
import { CiSearch } from "react-icons/ci";

const FieldInfo = ({ title, area, lat, lon, isSelected, onClick }) => (
  <div
    className={`flex justify-around border-b border-[#344e41] pt-4 cursor-pointer ${
      isSelected ? "bg-[#5a7c6b]" : ""
    }`}
    onClick={onClick}
  >
    <FieldIcon isSelected={isSelected} />
    <div className="flex flex-col">
      <h4
        className={`${isSelected ? "text-white" : "text-[#344e41]"} text-base font-normal`}>
        {title}
      </h4>
      <p className="m-0 p-0 text-[0.7rem] text-[#a2a2a2] mb-[0.2rem]">{area}</p>
      <div className="flex">
        <p className="text-[0.7rem] text-[#a2a2a2] mr-4">{lat} N</p>
        <p className="text-[0.7rem] text-[#a2a2a2]">{lon} E</p>
      </div>
    </div>
  </div>
);

const PersonaliseCropSheduleSidebar = ({
  selectedOperation,
  setSelectedOperation,
}) => {
  const [selectedOperationIndex, setSelectedOperationIndex] = useState(null);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  const toggleSidebarVisibility = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  const operations = [
    { title: "Field 1", area: "0.12h", lat: "24.154", lon: "56.165" },
  ];

  return (
    <>
      {isSidebarVisible && (
        <div className="w-[20vw] h-screen m-0 p-0 bg-white">
          <div className="flex flex-col border-b border-[#344e41] gap-2 px-2 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <PersonaliseCropSheduleDarkIcon />
                <h2 className="text-[18px] font-bold text-[#344e41]">Personalise Crop shedule</h2>
              </div>
              <svg
                width="30"
                height="30"
                className="personalise-crop-schedule-sidebar-close-button"
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
          <div className="overflow-y-auto max-h-[calc(100vh-150px)] no-scrollbar">
            <h2 className="text-[16px] font-bold text-[#344e41] p-2">Field</h2>
            {operations.map((operation, index) => (
              <FieldInfo
                key={index}
                title={operation.title}
                area={operation.area}
                lat={operation.lat}
                lon={operation.lon}
                isSelected={selectedOperationIndex === index}
                onClick={() => {
                  console.log("hello");
                  setSelectedOperationIndex(index);
                  setSelectedOperation(operation);
                }}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default PersonaliseCropSheduleSidebar;
