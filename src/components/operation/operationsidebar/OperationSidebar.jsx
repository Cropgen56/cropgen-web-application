import React, { useState } from "react";
import { Operation2 } from "../../../assets/Icons";
import { FieldIcon } from "../../../assets/Globalicon";
import { CiSearch } from "react-icons/ci";
import "./OperationSidebar.css";

const FieldInfo = ({ title, area, lat, lon, isSelected, onClick }) => (
  <div
    className={`operation-info ${isSelected ? "selected-operation" : ""}`}
    onClick={onClick}
  >
    <FieldIcon isSelected={isSelected} />
    <div className="operations">
      <h4 className={`${isSelected ? "selected-title" : ""}`}>{title}</h4>
      <p className="ha">{area}</p>
      <div className="operation-details">
        <p>{lat} N</p>
        <p>{lon} E</p>
      </div>
    </div>
  </div>
);

const OperationSidebar = ({ selectedOperation, setSelectedOperation }) => {
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
        <div className="operation-sidebar">
          <div className="operation-heading">
            <div className="operation-firt-row">
              <Operation2 />
              <h2>Operations</h2>
              <svg
                width="30"
                height="30"
                className="weather-sidebar-close-button"
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
            <div className="operation-search">
              <CiSearch className="search-icon" />
              <input
                type="search"
                className="search-input"
                placeholder="Search"
              />
            </div>
          </div>
          <div className="operation-field">
            <h2>Field</h2>
            {operations.map((operation, index) => (
              <FieldInfo
                key={index}
                title={operation.title}
                area={operation.area}
                lat={operation.lat}
                lon={operation.lon}
                isSelected={selectedOperationIndex === index}
                onClick={() => {
                  setSelectedOperationIndex(index);
                  if (typeof setSelectedOperation === "function") {
                    setSelectedOperation(operation);
                  } else {
                    console.error("setSelectedOperation is not a function.");
                  }
                }}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default OperationSidebar;
