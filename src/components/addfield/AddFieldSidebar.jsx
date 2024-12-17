import React, { useState } from "react";
import { FieldIcon } from "../../assets/Globalicon";
import "./AddFieldSidebar.css";
import cropename from "../../assets/cropname.json";

const FieldInfo = ({ title, area, lat, lon, isSelected, onClick }) => (
  <div
    className={`field-info ${isSelected ? "selected-field" : ""}`}
    onClick={onClick}
  >
    <FieldIcon isSelected={isSelected} />
    <div className="fields">
      <h4 className={`${isSelected ? "selected-title" : ""}`}>{title}</h4>
      <p className="ha">{area}</p>
      <div className="field-details">
        <p>{lat} N</p>
        <p>{lon} E</p>
      </div>
    </div>
  </div>
);

const AddFieldSidebar = ({
  selectedField,
  setSelectedField,
  saveFarm,
  markers,
}) => {
  const [selectedFieldIndex, setSelectedFieldIndex] = useState(null);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  // Form state variables
  const [farmName, setFarmName] = useState("");
  const [cropName, setCropName] = useState("");
  const [variety, setVariety] = useState("");
  const [sowingDate, setSowingDate] = useState("");
  const [typeOfIrrigation, setTypeOfIrrigation] = useState("");

  const toggleSidebarVisibility = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  const fields = [
    { title: "Field 1", area: "0.12h", lat: "24.154", lon: "56.165" },
  ];

  const handleAddField = () => {
    // Check if all required fields are filled
    if (!farmName.trim()) {
      alert("Please enter the Farm Name.");
      return;
    }
    if (!cropName.trim()) {
      alert("Please select a Crop Name.");
      return;
    }
    if (!variety.trim()) {
      alert("Please enter the Variety.");
      return;
    }
    if (!sowingDate.trim()) {
      alert("Please select the Sowing Date.");
      return;
    }
    if (!typeOfIrrigation.trim()) {
      alert("Please select the Type of Irrigation.");
      return;
    }

    if (markers.length === 0) {
      alert("Please add Field !.");
      return;
    }

    // If all fields are valid, save the farm
    saveFarm({
      markers,
      cropName,
      variety,
      sowingDate,
      typeOfIrrigation,
      farmName,
    });

    // Clear the form
    setFarmName("");
    setCropName("");
    setVariety("");
    setSowingDate("");
    setTypeOfIrrigation("");
  };

  return (
    <>
      {isSidebarVisible && (
        <div className="add-field-sidebar">
          <div className="add-field-heading">
            <h2>All Fields</h2>
            <svg
              width="30"
              height="30"
              className="add-field-sidebar-close-button"
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
          <div className="add-field-list">
            {fields.map((field, index) => (
              <FieldInfo
                key={index}
                title={field.title}
                area={field.area}
                lat={field.lat}
                lon={field.lon}
                isSelected={selectedFieldIndex === index}
                onClick={() => {
                  setSelectedFieldIndex(index);
                  setSelectedField(field);
                }}
              />
            ))}
          </div>

          {/* Crop Details Form */}
          <div>
            <form className="crop-details-container">
              <h5 className="crop-details-title">Crop Details</h5>
              <div className="farm-name-container">
                <label htmlFor="farm-name">Farm Name</label>
                <input
                  type="text"
                  value={farmName}
                  onChange={(e) => setFarmName(e.target.value)}
                />
              </div>
              <div className="crop-name-container">
                <label htmlFor="cropName">Crop Name</label>
                <select
                  className="select"
                  value={cropName}
                  onChange={(e) => setCropName(e.target.value)}
                >
                  <option value="">e.g. Tomato</option>
                  {cropename.crops.map((crop, index) => (
                    <option key={index} value={crop}>
                      {crop}
                    </option>
                  ))}
                </select>
              </div>
              <div className="crop-variety-container">
                <label htmlFor="variety">Variety</label>
                <input
                  type="text"
                  value={variety}
                  onChange={(e) => setVariety(e.target.value)}
                />
              </div>
              <div className="sowing-name-container">
                <label htmlFor="sowingDate">Sowing Date</label>
                <input
                  type="date"
                  id="sowingDate"
                  name="sowingDate"
                  value={sowingDate}
                  onChange={(e) => setSowingDate(e.target.value)}
                  required
                />
              </div>
              <div className="type-of-irrigation-container">
                <label htmlFor="irrigationType">Type Of Irrigation</label>
                <select
                  className="select"
                  value={typeOfIrrigation}
                  onChange={(e) => setTypeOfIrrigation(e.target.value)}
                >
                  <option value="">Select irrigation Type</option>
                  <option value="Sprinkler Irrigation">
                    Sprinkler Irrigation
                  </option>
                  <option value="Micro Irrigation">Micro Irrigation</option>
                  <option value="Open Irrigation">Open Irrigation</option>
                  <option value="Other Irrigation">Other Irrigation</option>
                </select>
              </div>
            </form>

            <div className="add-field-submit-button">
              <button onClick={handleAddField}>Add Field</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AddFieldSidebar;
