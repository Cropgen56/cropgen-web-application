import React, { useEffect, useState, useRef } from "react";
import { Save, Trash2, ChevronDown, ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import {
  getFarmFields,
  updateFarmField,
  deleteFarmField,
} from "../../../redux/slices/farmSlice";
import { useDispatch, useSelector } from "react-redux";
import { MapContainer, TileLayer, Polygon, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Modal, message } from "antd";
import AllFarms from "./AllFarms";
import { fetchCrops } from "../../../redux/slices/cropSlice";

const AddFarm = ({ selectedFarm }) => {
  const dispatch = useDispatch();
  const { fields: farms, status } = useSelector(
    (state) => state.farmfield || { fields: [] }
  );
  const user = useSelector((state) => state.auth.user);
  const userId = user?._id || user?.id;
  const [polygonCoordinates, setPolygonCoordinates] = useState(
    selectedFarm?.field || []
  );
  const [updating, setUpdating] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [showAllFarms, setShowAllFarms] = useState(false);
  const [selectedFarmState, setSelectedFarmState] = useState(
    selectedFarm || {}
  );
  const isTabletSize = () =>
    window.innerWidth <= 1024 && window.innerWidth >= 600;
  const { crops } = useSelector((state) => state.crops);

  const [formData, setFormData] = useState({
    farmName: selectedFarm?.fieldName || "",
    cropName: selectedFarm?.cropName || "",
    variety: selectedFarm?.variety || "",
    sowingDate: selectedFarm?.sowingDate?.split("T")[0] || "",
    typeOfIrrigation: selectedFarm?.typeOfIrrigation || "",
    typeOfFarming: selectedFarm?.typeOfFarming || "",
  });

  useEffect(() => {
    setFormData({
      farmName: selectedFarmState.fieldName || "",
      cropName: selectedFarmState.cropName || "",
      variety: selectedFarmState.variety || "",
      sowingDate: selectedFarmState.sowingDate?.split("T")[0] || "",
      typeOfIrrigation: selectedFarmState.typeOfIrrigation || "",
      typeOfFarming: selectedFarmState.typeOfFarming || "",
    });
    setPolygonCoordinates(selectedFarmState.field || []);
  }, [selectedFarmState]);

  useEffect(() => {
    if (status === "idle" && userId) {
      dispatch(getFarmFields(userId));
    }
  }, [dispatch, status, userId]);

  const [isTablet, setIsTablet] = useState(isTabletSize());

  useEffect(() => {
    const handleResize = () => setIsTablet(isTabletSize());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  //fetching the crops when the page mounts
  useEffect(() => {
    dispatch(fetchCrops());
  }, [dispatch]);

  const handleFarmChange = (value) => {
    setFormData((prev) => ({ ...prev, farmName: value }));

    const existingFarm = farms?.find(
      (f) => f.fieldName?.toLowerCase() === value.toLowerCase()
    );

    if (existingFarm) {
      setFormData({
        farmName: existingFarm.fieldName || "",
        cropName: existingFarm.cropName || "",
        variety: existingFarm.variety || "",
        sowingDate: existingFarm.sowingDate?.split("T")[0] || "",
        typeOfIrrigation: existingFarm.typeOfIrrigation || "",
        typeOfFarming: existingFarm.typeOfFarming || "",
      });

      setPolygonCoordinates(existingFarm.field || []);
    } else {
      if (!selectedFarm?._id) {
        setPolygonCoordinates([]);
      }
    }
  };

  const handleChange = (name, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e?.preventDefault?.();

    if (!selectedFarmState?._id) {
      message.error("No farm selected to update!");
      return;
    }

    const updatedData = {
      ...formData,
      fieldName: formData.farmName,
      latlng: polygonCoordinates,
    };

    console.log("Payload sent to API:", updatedData);

    try {
      setUpdating(true);
      await dispatch(
        updateFarmField({ fieldId: selectedFarmState._id, updatedData })
      ).unwrap();
      message.success("Farm updated successfully!");

      dispatch(getFarmFields(userId));
    } catch (err) {
      message.error("Failed to update farm.");
    } finally {
      setUpdating(false);
    }
  };

  const defaultCenter = [20.135245, 77.156935];

  const MoveMapToField = ({ coordinates }) => {
    const map = useMap();
    useEffect(() => {
      if (coordinates.length > 0) {
        const bounds = coordinates.map((c) => [c.lat, c.lng]);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
      }
    }, [coordinates, map]);
    return null;
  };

  const handleDeleteConfirm = async () => {
    try {
      if (!selectedFarmState?._id)
        return message.error("No farm selected to delete!");

      await dispatch(deleteFarmField(selectedFarmState._id)).unwrap();
      message.success("Farm deleted successfully!");
      setDeleteModalVisible(false);
      dispatch(getFarmFields(userId));

      setShowAllFarms(true);
    } catch (error) {
      message.error("Failed to delete farm.");
    }
  };

  if (showAllFarms) {
    return (
      <AllFarms
        onAddFarmClick={(farm) => {
          setSelectedFarmState(farm);
          setShowAllFarms(false);
        }}
      />
    );
  }

  return isTablet ? (
    // === TABLET UI ===
    <div className="flex flex-col h-[100vh] overflow-y-auto">
      {/* MAP */}
      <div className="h-[60vh] w-full">
        <MapContainer
          center={
            polygonCoordinates?.length > 0
              ? [polygonCoordinates[0].lat, polygonCoordinates[0].lng]
              : defaultCenter
          }
          zoom={15}
          className="w-full h-full rounded-lg"
        >
          <TileLayer
            url="http://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
            subdomains={["mt0", "mt1", "mt2", "mt3"]}
          />
          {polygonCoordinates.length > 0 && (
            <Polygon
              positions={polygonCoordinates.map(({ lat, lng }) => [lat, lng])}
              pathOptions={{ color: "yellow", fillOpacity: 0.2 }}
            />
          )}
          <MoveMapToField coordinates={polygonCoordinates} />
        </MapContainer>
      </div>

      {/* FORM + BUTTONS */}
      <div className="h-[30vh] px-3 py-2 flex flex-col">
        {/* Scrollable form */}
        <div className="flex-grow pr-1">
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3">
            <FormInput
              label="Farm Name"
              value={formData.farmName}
              onChange={handleFarmChange}
              placeholder="Enter farm name"
            />
            
            <CustomDropdown
              label="Crop Name"
              value={formData.cropName}
              onChange={(value) => handleChange('cropName', value)}
              options={crops?.map((crop) => crop.cropName) || []}
              placeholder="Select Crop"
            />

            <FormInput
              label="Variety"
              value={formData.variety}
              onChange={(value) => handleChange('variety', value)}
              placeholder="Enter crop variety"
            />

            <CustomDatePicker
              label="Sowing Date"
              value={formData.sowingDate}
              onChange={(value) => handleChange('sowingDate', value)}
              placeholder="Select sowing date"
              maxDate={new Date()}
            />

            <CustomDropdown
              label="Type Of Irrigation"
              value={formData.typeOfIrrigation}
              onChange={(value) => handleChange('typeOfIrrigation', value)}
              options={["Open", "Drip", "Sprinkler"]}
              placeholder="Select Irrigation Type"
            />

            <CustomDropdown
              label="Type Of Farming"
              value={formData.typeOfFarming}
              onChange={(value) => handleChange('typeOfFarming', value)}
              options={["Organic", "Inorganic", "Integrated"]}
              placeholder="Select Farming Type"
            />
          </form>
        </div>

        {/* Buttons at bottom */}
        <div className="flex justify-between mt-3">
          <button
            type="button"
            onClick={() => setDeleteModalVisible(true)}
            className="flex items-center gap-1 px-4 py-2 border border-red-600 text-red-600 rounded-md hover:border-red-700 transition-colors duration-400 ease-in-out cursor-pointer"
          >
            Delete <Trash2 size={18} />
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className={`flex items-center gap-1 px-4 py-2 border ${
              updating
                ? "bg-[#5A7C6B] cursor-not-allowed"
                : "bg-[#344E41] text-white"
            } rounded-md transition-all duration-400 ease-in-out cursor-pointer`}
          >
            {updating ? (
              "Updating..."
            ) : (
              <>
                Update <Save size={18} />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Modal */}
      <Modal
        title="Confirm Delete"
        open={deleteModalVisible}
        onOk={handleDeleteConfirm}
        onCancel={() => setDeleteModalVisible(false)}
        okText="Yes, Delete"
        okButtonProps={{ danger: true }}
        className="flex justify-center items-center"
      >
        <p>
          Are you sure you want to delete this farm? This action cannot be
          undone.
        </p>
      </Modal>
    </div>
  ) : (
    // === DESKTOP UI ===
    <>
      <div className="flex flex-col flex-grow justify-between gap-4 p-2 overflow-hidden overflow-y-auto">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col-reverse lg:flex-row gap-3 lg:h-full w-full"
        >
          {/* form Section */}
          <div className="flex flex-col gap-3 w-full lg:w-[30%] bg-white ">
            <h5 className="mt-2 font-semibold text-[#344E41]">Crop Details</h5>

            <div className="flex flex-col gap-2">
              <FormInput
                label="Farm Name"
                value={formData.farmName}
                onChange={handleFarmChange}
                placeholder="Enter farm name"
              />

              <CustomDropdown
                label="Crop Name"
                value={formData.cropName}
                onChange={(value) => handleChange('cropName', value)}
                options={crops?.map((crop) => crop.cropName) || []}
                placeholder="Select Crop"
              />

              <FormInput
                label="Variety"
                value={formData.variety}
                onChange={(value) => handleChange('variety', value)}
                placeholder="Enter crop variety"
              />

              <CustomDatePicker
                label="Sowing Date"
                value={formData.sowingDate}
                onChange={(value) => handleChange('sowingDate', value)}
                placeholder="Select sowing date"
                maxDate={new Date()}
              />

              <CustomDropdown
                label="Type Of Irrigation"
                value={formData.typeOfIrrigation}
                onChange={(value) => handleChange('typeOfIrrigation', value)}
                options={["Open", "Drip", "Sprinkler"]}
                placeholder="Select Irrigation Type"
              />

              <CustomDropdown
                label="Type Of Farming"
                value={formData.typeOfFarming}
                onChange={(value) => handleChange('typeOfFarming', value)}
                options={["Organic", "Inorganic", "Integrated"]}
                placeholder="Select Farming Type"
              />
            </div>
          </div>

          {/* map Section */}
          <div className="flex flex-col gap-4 w-full lg:w-[70%] bg-white h-[300px] lg:h-auto">
            <div className="flex-grow">
              <MapContainer
                center={
                  polygonCoordinates?.length > 0 && polygonCoordinates[0]?.lat
                    ? [polygonCoordinates[0].lat, polygonCoordinates[0].lng]
                    : defaultCenter
                }
                zoom={15}
                className="w-full h-full rounded-lg"
              >
                <TileLayer
                  url="http://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
                  subdomains={["mt0", "mt1", "mt2", "mt3"]}
                />

                {polygonCoordinates.length > 0 && (
                  <Polygon
                    positions={polygonCoordinates.map(({ lat, lng }) => [
                      lat,
                      lng,
                    ])}
                    pathOptions={{ color: "yellow", fillOpacity: 0.2 }}
                  />
                )}
                <MoveMapToField coordinates={polygonCoordinates} />
              </MapContainer>
            </div>
          </div>
        </form>

        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setDeleteModalVisible(true)}
            className="flex items-center gap-1 px-4 py-2 border-1 border-red-600 text-red-600 rounded-md hover:border-red-700 transition-colors duration-400 ease-in-out cursor-pointer"
          >
            Delete <Trash2 size={18} />
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className={`flex items-center gap-1 px-4 py-2 border-1 ${
              updating
                ? "bg-[#5A7C6B] cursor-not-allowed"
                : "bg-[#344E41] text-white"
            } text-white rounded-md transition-all duration-400 ease-in-out cursor-pointer`}
          >
            {updating ? (
              "Updating..."
            ) : (
              <>
                {" "}
                Update <Save size={18} />
              </>
            )}
          </button>
        </div>

        <Modal
          title="Confirm Delete"
          open={deleteModalVisible}
          onOk={handleDeleteConfirm}
          onCancel={() => setDeleteModalVisible(false)}
          okText="Yes, Delete"
          okButtonProps={{ danger: true }}
          className="flex justify-center items-center"
        >
          <p>
            Are you sure you want to delete this farm? This action cannot be
            undone.
          </p>
        </Modal>
      </div>
    </>
  );
};

// Reusable form input
const FormInput = ({
  label,
  value,
  onChange,
  placeholder = "",
  type = "text",
}) => (
  <div className="flex flex-col gap-1">
    <label className="font-semibold text-sm">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="border border-[#344e41] w-full outline-none rounded px-3 py-2 bg-[#344E41] text-white placeholder-gray-300 focus:ring-2 focus:ring-[#344e41] focus:ring-opacity-50"
    />
  </div>
);

// Custom Date Picker Component (Compact Version)
const CustomDatePicker = ({ label, value, onChange, placeholder, maxDate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const datePickerRef = useRef(null);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (month, year) => new Date(year, month, 1).getDay();

  // Close date picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleDateSelect = (day) => {
    const selectedDate = new Date(currentYear, currentMonth, day);
    const formattedDate = selectedDate.toISOString().split('T')[0];
    onChange(formattedDate);
    setIsOpen(false);
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const formatDisplayDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const isDateDisabled = (day) => {
    if (!maxDate) return false;
    const checkDate = new Date(currentYear, currentMonth, day);
    return checkDate > maxDate;
  };

  const renderCalendar = () => {
    const totalDays = daysInMonth(currentMonth, currentYear);
    const startDay = firstDayOfMonth(currentMonth, currentYear);
    const days = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-6 w-6"></div>);
    }

    // Add days of the month
    for (let day = 1; day <= totalDays; day++) {
      const isSelected = value && 
        new Date(value).getDate() === day &&
        new Date(value).getMonth() === currentMonth &&
        new Date(value).getFullYear() === currentYear;
      
      const isDisabled = isDateDisabled(day);
      const isToday = 
        new Date().getDate() === day &&
        new Date().getMonth() === currentMonth &&
        new Date().getFullYear() === currentYear;

      days.push(
        <button
          key={day}
          type="button"
          onClick={() => !isDisabled && handleDateSelect(day)}
          disabled={isDisabled}
          className={`
            h-6 w-6 rounded text-xs flex items-center justify-center
            transition-all duration-150
            ${isSelected 
              ? 'bg-white text-[#344E41] font-bold' 
              : isToday
              ? 'bg-[#4a6b5a] text-white'
              : isDisabled
              ? 'text-gray-500 cursor-not-allowed'
              : 'text-white hover:bg-[#2b3e33]'
            }
          `}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  return (
    <div className="flex flex-col gap-1" ref={datePickerRef}>
      <label className="font-semibold text-sm">{label}</label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`
            w-full px-3 py-2 bg-[#344E41] text-white rounded
            border border-[#344e41] outline-none
            flex items-center justify-between
            hover:bg-[#2b3e33] transition-all duration-200
            focus:ring-2 focus:ring-[#344e41] focus:ring-opacity-50
            ${!value ? 'text-gray-300' : 'text-white'}
          `}
        >
          <span className="flex items-center gap-2">
            <Calendar size={14} />
            <span className="truncate text-sm">
              {value ? formatDisplayDate(value) : placeholder}
            </span>
          </span>
          <ChevronDown
            size={18}
            className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          />
        </button>

        {/* Date Picker Calendar - Compact */}
        {isOpen && (
          <div className="absolute z-50 w-56 mt-1 bg-[#344E41] border border-[#2b3e33] rounded shadow-lg p-2">
            {/* Month/Year Navigation */}
            <div className="flex items-center justify-between mb-2 text-white">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-0.5 hover:bg-[#2b3e33] rounded transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <div className="text-xs font-semibold">
                {monthNames[currentMonth].slice(0, 3)} {currentYear}
              </div>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-0.5 hover:bg-[#2b3e33] rounded transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Days of Week Headers */}
            <div className="grid grid-cols-7 gap-0.5 mb-1">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                <div key={`${day}-${index}`} className="h-5 w-6 flex items-center justify-center text-xs text-gray-300">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-0.5">
              {renderCalendar()}
            </div>

            {/* Today Button */}
            <div className="mt-2 pt-2 border-t border-[#2b3e33]">
              <button
                type="button"
                onClick={() => {
                  const today = new Date();
                  setCurrentMonth(today.getMonth());
                  setCurrentYear(today.getFullYear());
                  handleDateSelect(today.getDate());
                }}
                className="w-full py-1 text-xs text-white bg-[#2b3e33] hover:bg-[#253429] rounded transition-colors"
              >
                Today
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Custom Dropdown Component
const CustomDropdown = ({ label, value, onChange, options, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelect = (option) => {
    onChange(option);
    setIsOpen(false);
  };

  const formatOptionDisplay = (option) => {
    // If it's a simple word like "Open", "Drip", just capitalize it
    if (!option.includes("-") && !option.includes(" ")) {
      return option;
    }
    // Format compound words (e.g., "open-irrigation" -> "Open Irrigation")
    return option
      .split("-")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="flex flex-col gap-1" ref={dropdownRef}>
      <label className="font-semibold text-sm">{label}</label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`
            w-full px-3 py-2 bg-[#344E41] text-white rounded
            border border-[#344e41] outline-none
            flex items-center justify-between
            hover:bg-[#2b3e33] transition-all duration-200
            focus:ring-2 focus:ring-[#344e41] focus:ring-opacity-50
            ${!value ? 'text-gray-300' : 'text-white'}
          `}
        >
          <span className="truncate">
            {value ? formatOptionDisplay(value) : placeholder}
          </span>
          <ChevronDown
            size={20}
            className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""
              }`}
          />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-[#344E41] border border-[#2b3e33] rounded shadow-lg max-h-60 overflow-auto">
            {options.length > 0 ? (
              options.map((option, index) => (
                <div
                  key={option}
                  onClick={() => handleSelect(option)}
                  className={`
                    px-3 py-2 cursor-pointer text-white
                    hover:bg-[#2b3e33] transition-colors duration-150
                    ${value === option ? "bg-[#2b3e33]" : ""}
                    ${index !== options.length - 1 ? "border-b border-[#2b3e33]" : ""}
                  `}
                >
                  {formatOptionDisplay(option)}
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-gray-300">No options available</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AddFarm;