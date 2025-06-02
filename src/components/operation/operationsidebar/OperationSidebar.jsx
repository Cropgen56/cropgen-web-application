import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
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

const OperationSidebar = ({ setSelectedField, selectedField }) => {
  const [selectedOperationIndex, setSelectedOperationIndex] = useState(0);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const fields = useSelector((state) => state?.farmfield?.fields);

  // // Synchronize selectedOperationIndex with selectedField
  // useEffect(() => {
  //   if (selectedField && fields) {
  //     const index = fields.findIndex((field) => field._id === selectedField);
  //     setSelectedOperationIndex(index >= 0 ? index : null);
  //   } else {
  //     setSelectedOperationIndex(null);
  //   }
  // }, [selectedField, fields]);

  // Function to calculate the centroid (average) of field coordinates
  const calculateCentroid = (field) => {
    if (!field || field.length === 0) return { lat: 0, lon: 0 };
    const total = field.reduce(
      (acc, point) => ({
        lat: acc.lat + point.lat,
        lng: acc.lng + point.lng,
      }),
      { lat: 0, lng: 0 }
    );
    return {
      lat: (total.lat / field.length).toFixed(3),
      lon: (total.lng / field.length).toFixed(3),
    };
  };

  // Function to convert acres to hectares and format
  const formatArea = (acres) => {
    const hectares = (acres * 0.404686).toFixed(2);
    return `${hectares}h`;
  };

  const toggleSidebarVisibility = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

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
                    d="M10.3662 15.8835C10.1319 15.6491 10.0002 14.9998 10.0002 14.9998C10.0002 14.6683 10.1319 14.3504 10.3662 14.116L17.4375 7.04478C17.6732 6.81708 17.989 6.69109 18.3167 6.69393C18.6445 6.69678 18.958 6.82824 19.1898 7.06C19.4215 7.29176 19.553 7.60528 19.5558 7.93303C19.5587 8.26077 19.4327 8.57652 19.205 8.81228L13.0175 14.9998L19.205 21.1873C19.4327 21.423 19.5587 21.7388 19.5558 22.0665C19.553 22.3943 19.4215 22.7078 19.1898 22.9395C18.958 23.1713 18.6445 23.3028 18.3167 23.3056C17.989 23.3085 17.6732 23.1825 17.4375 22.9548L10.3662 15.8835Z"
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
          <div className="operation-field operation-field-scrollable">
            <h2>Field</h2>
            {fields && fields.length > 0 ? (
              fields.map((field, index) => {
                const { lat, lon } = calculateCentroid(field.field);
                return (
                  <FieldInfo
                    key={field._id}
                    title={field.fieldName}
                    area={formatArea(field.acre)}
                    lat={lat}
                    lon={lon}
                    isSelected={selectedOperationIndex === index}
                    onClick={() => {
                      setSelectedOperationIndex(index);
                      if (typeof setSelectedField === "function") {
                        setSelectedField(field._id);
                      } else {
                        console.error("setSelectedField is not a function.");
                      }
                    }}
                  />
                );
              })
            ) : (
              <p>No fields available</p>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default OperationSidebar;
