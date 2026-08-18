import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  ArrowLeft,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Plus,
  X,
} from "lucide-react";
import { message } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { fetchCrops } from "../../redux/slices/cropSlice";
import {
  FARMING_TYPES,
  IRRIGATION_TYPES,
  CROP_LIFECYCLE_TYPES,
  CROP_LIFECYCLE_LABELS,
  formatFarmEnumLabel,
} from "../../constants/farmEnums";

const AddFieldSidebar = ({
  saveFarm,
  markers,
  isTabletView,
  fieldLandType = "crop",
  isDrawingField = false,
  onRequestChangeFieldStatus,
}) => {
  const [farmName, setFarmName] = useState("");
  const [cropName, setCropName] = useState("");
  const [variety, setVariety] = useState("");
  const [sowingDate, setSowingDate] = useState("");
  const [typeOfIrrigation, setTypeOfIrrigation] = useState("");
  const [typeOfFarming, setTypeOfFarming] = useState("");
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  // Multi-crop: optional extra crops on top of the one above. Default
  // single-crop flow is completely unaffected when this stays empty.
  const [additionalCrops, setAdditionalCrops] = useState([]);
  const [showAddCropForm, setShowAddCropForm] = useState(false);

  const toggleSidebarVisibility = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  const dispatch = useDispatch();
  const { crops } = useSelector((state) => state.crops);

  useEffect(() => {
    dispatch(fetchCrops());
  }, [dispatch]);

  useEffect(() => {
    setSowingDate("");
  }, [fieldLandType]);

  const handleAddField = useCallback(
    (landTypeOverride) => {
      const landType =
        landTypeOverride === "crop" || landTypeOverride === "barren"
          ? landTypeOverride
          : fieldLandType;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const sowing = sowingDate.trim() ? new Date(sowingDate) : null;
      if (sowing) sowing.setHours(0, 0, 0, 0);

      if (!farmName.trim())
        return message.error("Please enter the Farm Name.");
      if (!cropName.trim()) return message.error("Please select a Crop Name.");
      if (!variety.trim()) return message.error("Please enter the Variety.");
      if (!sowingDate.trim()) {
        return message.error(
          landType === "barren"
            ? "Please select the expected sowing date."
            : "Please select the sowing date.",
        );
      }
      if (landType === "crop" && sowing > today)
        return message.error("Sowing date cannot be in the future.");
      if (landType === "barren" && sowing < today)
        return message.error("Expected sowing date cannot be in the past.");
      if (!typeOfIrrigation.trim())
        return message.error("Please select the Type of Irrigation.");
      if (markers.length === 0) return message.warning("Please add Field !.");

      saveFarm({
        markers,
        cropName,
        variety,
        sowingDate,
        typeOfIrrigation,
        farmName,
        typeOfFarming,
        isBarrenLand: landType === "barren",
        additionalCrops,
      });

      setFarmName("");
      setCropName("");
      setVariety("");
      setSowingDate("");
      setTypeOfIrrigation("");
      setTypeOfFarming("");
      setAdditionalCrops([]);
      setShowAddCropForm(false);
    },
    [
      fieldLandType,
      farmName,
      cropName,
      variety,
      sowingDate,
      typeOfIrrigation,
      typeOfFarming,
      markers,
      saveFarm,
      additionalCrops,
    ],
  );

  const fieldStatusSummary = (
    <div className="rounded-lg border border-[#0b5d3d]/18 bg-[#f4faf6] px-3 py-2.5 mb-2 sm:mb-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span className="text-xs font-semibold text-ember-sidebar">
          Field status
        </span>
        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-medium px-2.5 py-1 rounded-full text-white ${
              fieldLandType === "barren" ? "bg-[#436b52]" : "bg-ember-sidebar"
            }`}
          >
            {fieldLandType === "barren" ? "Barren land" : "Crop in field"}
          </span>
          {!isDrawingField && (
            <button
              type="button"
              onClick={() => onRequestChangeFieldStatus?.()}
              className="text-xs font-semibold text-ember-sidebar underline underline-offset-2 hover:text-ember-sidebar-hover"
            >
              Change
            </button>
          )}
        </div>
      </div>
      <p className="text-[11px] sm:text-xs text-gray-600 mt-1.5 leading-snug">
        {fieldLandType === "barren"
          ? "Use expected sowing date below (today or future)."
          : "Use actual sowing date below (today or earlier)."}
      </p>
    </div>
  );

  const additionalCropsSection = (
    <AdditionalCropsSection
      crops={additionalCrops}
      setCrops={setAdditionalCrops}
      showForm={showAddCropForm}
      setShowForm={setShowAddCropForm}
      cropCatalog={crops}
      fieldLandType={fieldLandType}
    />
  );

  if (!isSidebarVisible) return null;

  return (
    <>
      {isTabletView ? (
        <div className="flex-1 flex flex-col justify-start items-center px-2 sm:px-4 pb-4 text-ember-sidebar z-[9999] h-full overflow-y-auto no-scrollbar">
          <div className="flex justify-center items-start p-1 sm:p-2 w-full min-h-min">
            <div className="w-full max-w-6xl bg-white shadow-lg rounded-xl p-3 sm:p-4 md:p-6 mx-auto">
              <h5 className="text-ember-sidebar mb-3 sm:mb-4 md:mb-6 text-center text-base sm:text-lg font-bold">
                Crop Details
              </h5>

              {fieldStatusSummary}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
                <FormInput
                  label="Farm Name"
                  value={farmName}
                  onChange={setFarmName}
                  placeholder="Enter farm name"
                />
                <AutocompleteDropdown
                  label="Crop Name"
                  value={cropName}
                  onChange={setCropName}
                  options={crops
                    .map((crop) => crop.cropName)
                    .sort((a, b) => a.localeCompare(b))}
                  placeholder="Search or select crop"
                />
                <FormInput
                  label="Variety"
                  value={variety}
                  onChange={setVariety}
                  placeholder="Enter crop variety"
                />
                <CustomDatePicker
                  label={
                    fieldLandType === "barren"
                      ? "Expected sowing date"
                      : "Sowing date"
                  }
                  value={sowingDate}
                  onChange={setSowingDate}
                  placeholder={
                    fieldLandType === "barren"
                      ? "Select expected sowing date"
                      : "Select sowing date"
                  }
                  maxDate={fieldLandType === "crop" ? new Date() : undefined}
                  minDate={fieldLandType === "barren" ? new Date() : undefined}
                />
                <AutocompleteDropdown
                  label="Type Of Irrigation"
                  value={typeOfIrrigation}
                  onChange={setTypeOfIrrigation}
                  options={IRRIGATION_TYPES}
                  placeholder="Search or select irrigation"
                />
                <AutocompleteDropdown
                  label="Type Of Farming"
                  value={typeOfFarming}
                  onChange={setTypeOfFarming}
                  options={FARMING_TYPES}
                  placeholder="Search or select farming type"
                />
              </div>

              {additionalCropsSection}

              <div className="mt-3 sm:mt-4 md:mt-6">
                <button
                  className="w-full h-9 sm:h-10 md:h-11 bg-ember-sidebar hover:bg-ember-sidebar-hover text-white font-semibold text-sm sm:text-base rounded-md transition-all duration-300"
                  onClick={() => handleAddField()}
                >
                  Add Field
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="sm:min-w-[250px] sm:max-w-[20vw] m-0 p-0 h-full overflow-hidden flex flex-col">
          <div className="flex flex-row justify-between items-center border-b border-ember-sidebar p-2.5 cursor-pointer flex-shrink-0">
            <h2 className="flex items-center gap-1 text-base text-ember-sidebar">
              All Fields
            </h2>
            <ArrowLeft
              size={20}
              color="#0B5D3D"
              strokeWidth={2}
              onClick={toggleSidebarVisibility}
            />
          </div>

          <div className="flex flex-col flex-1 overflow-hidden">
            <form className="p-3 text-ember-sidebar flex-1 overflow-y-auto no-scrollbar">
              <h5 className="text-ember-sidebar mb-3">Crop Details</h5>
              <div className="flex flex-col gap-2 no-scrollbar">
                {fieldStatusSummary}
                <FormInput
                  label="Farm Name"
                  value={farmName}
                  onChange={setFarmName}
                  placeholder="Enter farm name"
                />
                <AutocompleteDropdown
                  label="Crop Name"
                  value={cropName}
                  onChange={setCropName}
                  options={crops
                    .map((crop) => crop.cropName)
                    .sort((a, b) => a.localeCompare(b))}
                  placeholder="Search or select crop"
                />
                <FormInput
                  label="Variety"
                  value={variety}
                  onChange={setVariety}
                  placeholder="Enter crop variety"
                />
                <CustomDatePicker
                  label={
                    fieldLandType === "barren"
                      ? "Expected sowing date"
                      : "Sowing date"
                  }
                  value={sowingDate}
                  onChange={setSowingDate}
                  placeholder={
                    fieldLandType === "barren"
                      ? "Select expected sowing date"
                      : "Select sowing date"
                  }
                  maxDate={fieldLandType === "crop" ? new Date() : undefined}
                  minDate={fieldLandType === "barren" ? new Date() : undefined}
                />
                <AutocompleteDropdown
                  label="Type Of Irrigation"
                  value={typeOfIrrigation}
                  onChange={setTypeOfIrrigation}
                  options={IRRIGATION_TYPES}
                  placeholder="Select irrigation"
                />
                <AutocompleteDropdown
                  label="Type Of Farming"
                  value={typeOfFarming}
                  onChange={setTypeOfFarming}
                  options={FARMING_TYPES}
                  placeholder=" Select farming type"
                />
                {additionalCropsSection}
              </div>
            </form>

            <footer className="flex justify-center p-3 flex-shrink-0 border-t border-gray-200">
              <button
                className="border-none outline-none rounded-md bg-ember-sidebar text-white font-semibold w-3/4 h-9 transition-all duration-400 ease-in-out hover:bg-ember-sidebar-hover"
                onClick={() => handleAddField()}
              >
                Add Field
              </button>
            </footer>
          </div>
        </div>
      )}
    </>
  );
};

const FormInput = ({
  label,
  value,
  onChange,
  placeholder = "",
  type = "text",
}) => (
  <div className="flex flex-col gap-1">
    <label className="font-semibold text-xs sm:text-sm">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="border border-ember-sidebar w-full outline-none rounded px-2 sm:px-3 py-1.5 sm:py-2 text-sm bg-ember-sidebar text-white placeholder-gray-300 focus:ring-2 focus:ring-ember-sidebar focus:ring-opacity-50"
    />
  </div>
);

const CustomDatePicker = ({
  label,
  value,
  onChange,
  placeholder,
  maxDate,
  minDate,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const datePickerRef = useRef(null);

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const daysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (month, year) => new Date(year, month, 1).getDay();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        datePickerRef.current &&
        !datePickerRef.current.contains(event.target)
      ) {
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
    const formattedDate = selectedDate.toISOString().split("T")[0];
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
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const isDateDisabled = (day) => {
    const checkDate = new Date(currentYear, currentMonth, day);
    checkDate.setHours(0, 0, 0, 0);
    if (maxDate) {
      const max = new Date(maxDate);
      max.setHours(0, 0, 0, 0);
      if (checkDate > max) return true;
    }
    if (minDate) {
      const min = new Date(minDate);
      min.setHours(0, 0, 0, 0);
      if (checkDate < min) return true;
    }
    return false;
  };

  const renderCalendar = () => {
    const totalDays = daysInMonth(currentMonth, currentYear);
    const startDay = firstDayOfMonth(currentMonth, currentYear);
    const days = [];

    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-6 w-6"></div>);
    }

    for (let day = 1; day <= totalDays; day++) {
      const isSelected =
        value &&
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
            ${
              isSelected
                ? "bg-white text-ember-sidebar font-bold"
                : isToday
                  ? "bg-ember-surface-muted text-white"
                  : isDisabled
                    ? "text-gray-500 cursor-not-allowed"
                    : "text-white hover:bg-ember-sidebar-hover"
            }
          `}
        >
          {day}
        </button>,
      );
    }

    return days;
  };

  return (
    <div className="flex flex-col gap-1 relative" ref={datePickerRef}>
      <label className="font-semibold text-xs sm:text-sm">{label}</label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`
            w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-ember-sidebar text-white rounded
            border border-ember-sidebar outline-none
            flex items-center justify-between
            hover:bg-ember-sidebar-hover transition-all duration-200
            focus:ring-2 focus:ring-ember-sidebar focus:ring-opacity-50
            ${!value ? "text-gray-300" : "text-white"}
          `}
        >
          <span className="flex items-center gap-1 sm:gap-2">
            <Calendar size={14} />
            <span className="truncate text-xs sm:text-sm">
              {value ? formatDisplayDate(value) : placeholder}
            </span>
          </span>
          <ChevronDown
            size={18}
            className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          />
        </button>

        {isOpen && (
          // <div className="absolute z-[10000] w-56 mt-1 bg-ember-sidebar border border-ember-sidebar-hover rounded shadow-xl p-2">
          <div className="fixed z-[10000] bottom-6 w-56 bg-ember-sidebar border border-ember-sidebar-hover rounded shadow-xl p-2">
            <div className="flex items-center justify-between mb-2 text-white">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-0.5 hover:bg-ember-sidebar-hover rounded transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <div className="text-xs font-semibold">
                {monthNames[currentMonth].slice(0, 3)} {currentYear}
              </div>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-0.5 hover:bg-ember-sidebar-hover rounded transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-0.5 mb-1">
              {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
                <div
                  key={`${day}-${index}`}
                  className="h-5 w-6 flex items-center justify-center text-xs text-gray-300"
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-0.5">{renderCalendar()}</div>

            <div className="mt-2 pt-2 border-t border-ember-sidebar-hover">
              <button
                type="button"
                onClick={() => {
                  const today = new Date();
                  setCurrentMonth(today.getMonth());
                  setCurrentYear(today.getFullYear());
                  handleDateSelect(today.getDate());
                }}
                className="w-full py-1 text-xs text-white bg-ember-sidebar-hover hover:bg-ember-sidebar rounded transition-colors"
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

const AutocompleteDropdown = ({
  label,
  value,
  onChange,
  options,
  placeholder,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setIsFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const formatOptionDisplay = (option) => formatFarmEnumLabel(option);

  const filteredOptions = options.filter((option) =>
    formatOptionDisplay(option)
      .toLowerCase()
      .includes(searchTerm.toLowerCase()),
  );

  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    setSearchTerm(inputValue);
    onChange(inputValue);
    setIsOpen(true);
  };

  const handleSelect = (option) => {
    onChange(option);
    setSearchTerm("");
    setIsOpen(false);
    setIsFocused(false);
  };

  const handleInputFocus = () => {
    setIsFocused(true);
    setIsOpen(true);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      inputRef.current?.focus();
    }
  };

  return (
    <div className="flex flex-col gap-1 relative" ref={dropdownRef}>
      <label className="font-semibold text-xs sm:text-sm">{label}</label>
      <div className="relative">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={
              isFocused ? searchTerm : value ? formatOptionDisplay(value) : ""
            }
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            placeholder={placeholder}
            className={`
              w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-ember-sidebar text-white rounded
              border border-ember-sidebar outline-none
              placeholder-gray-300 text-sm
              hover:bg-ember-sidebar-hover transition-all duration-200
              focus:ring-2 focus:ring-ember-sidebar focus:ring-opacity-50
              pr-10
            `}
          />
          <button
            type="button"
            onClick={toggleDropdown}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors"
          >
            <ChevronDown
              size={20}
              className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
            />
          </button>
        </div>

        {isOpen && (
          <div className="absolute z-[10000] w-full mt-1 bg-ember-sidebar border border-ember-sidebar-hover rounded shadow-xl max-h-48 sm:max-h-60 overflow-auto">
            {/* // <div className="absolute z-50 w-full bottom-full mb-1 bg-ember-sidebar border border-ember-sidebar-hover rounded-md shadow-lg max-h-60 overflow-auto"> */}

            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <div
                  key={option}
                  onClick={() => handleSelect(option)}
                  className={`
                    px-2 sm:px-3 py-1.5 sm:py-2 cursor-pointer text-white text-sm
                    hover:bg-ember-sidebar-hover transition-colors duration-150
                    ${value === option ? "bg-ember-sidebar-hover font-semibold" : ""}
                    ${index !== filteredOptions.length - 1 ? "border-b border-ember-sidebar-hover" : ""}
                  `}
                >
                  {formatOptionDisplay(option)}
                </div>
              ))
            ) : (
              <div className="px-2 sm:px-3 py-1.5 sm:py-2 text-gray-300 text-sm">
                {searchTerm ? "No matching options" : "No options available"}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Optional "+ Add another crop" section: lets the farmer stack extra crops
// (each with its own name/variety/lifecycle/dates) on top of the single
// crop entered above. Left untouched (empty), the farm creation flow is
// exactly the single-crop flow it always was.
const AdditionalCropsSection = ({
  crops,
  setCrops,
  showForm,
  setShowForm,
  cropCatalog,
  fieldLandType,
}) => {
  const emptyDraft = {
    cropName: "",
    variety: "",
    cropLifecycleType: "seasonal",
    startDate: "",
    expectedEndDate: "",
  };
  const [draft, setDraft] = useState(emptyDraft);

  const handleAdd = () => {
    if (!draft.cropName.trim())
      return message.error("Please select a crop name.");
    if (!draft.variety.trim())
      return message.error("Please enter the variety.");
    if (!draft.startDate.trim())
      return message.error("Please select the crop's start date.");
    if (draft.cropLifecycleType === "seasonal" && !draft.expectedEndDate.trim()) {
      return message.error(
        "Please select the expected harvest date for a seasonal crop.",
      );
    }
    setCrops((prev) => [...prev, { ...draft, _localId: Date.now() }]);
    setDraft(emptyDraft);
    setShowForm(false);
  };

  return (
    <div className="flex flex-col gap-2 mt-1">
      {crops.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <span className="font-semibold text-xs sm:text-sm">
            Additional crops on this farm ({crops.length})
          </span>
          {crops.map((c, i) => (
            <div
              key={c._localId || i}
              className="flex items-center justify-between gap-2 rounded border border-ember-sidebar/40 bg-ember-surface-muted/20 px-2 py-1.5"
            >
              <div className="text-xs leading-snug min-w-0 text-ember-sidebar">
                <span className="font-semibold">{c.cropName}</span>
                {c.variety ? ` (${c.variety})` : ""} —{" "}
                {CROP_LIFECYCLE_LABELS[c.cropLifecycleType] || c.cropLifecycleType}
              </div>
              <button
                type="button"
                onClick={() =>
                  setCrops((prev) => prev.filter((_, idx) => idx !== i))
                }
                className="text-ember-sidebar hover:text-red-600 flex-shrink-0"
                aria-label="Remove crop"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {showForm ? (
        <div className="flex flex-col gap-2 rounded-md border border-ember-sidebar/40 p-2">
          <AutocompleteDropdown
            label="Crop Name"
            value={draft.cropName}
            onChange={(v) => setDraft((d) => ({ ...d, cropName: v }))}
            options={cropCatalog
              .map((c) => c.cropName)
              .sort((a, b) => a.localeCompare(b))}
            placeholder="Search or select crop"
          />
          <FormInput
            label="Variety"
            value={draft.variety}
            onChange={(v) => setDraft((d) => ({ ...d, variety: v }))}
            placeholder="Enter crop variety"
          />
          <div className="flex flex-col gap-1">
            <label className="font-semibold text-xs sm:text-sm">
              Lifecycle
            </label>
            <div className="flex gap-1.5">
              {CROP_LIFECYCLE_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() =>
                    setDraft((d) => ({ ...d, cropLifecycleType: type }))
                  }
                  className={`flex-1 py-1.5 rounded text-xs font-semibold border ${
                    draft.cropLifecycleType === type
                      ? "bg-ember-sidebar text-white border-ember-sidebar"
                      : "bg-white text-ember-sidebar border-ember-sidebar/40"
                  }`}
                >
                  {CROP_LIFECYCLE_LABELS[type]}
                </button>
              ))}
            </div>
          </div>
          <CustomDatePicker
            label={fieldLandType === "barren" ? "Expected start date" : "Start date"}
            value={draft.startDate}
            onChange={(v) => setDraft((d) => ({ ...d, startDate: v }))}
            placeholder="Select start date"
          />
          {draft.cropLifecycleType === "seasonal" && (
            <CustomDatePicker
              label="Expected harvest date"
              value={draft.expectedEndDate}
              onChange={(v) => setDraft((d) => ({ ...d, expectedEndDate: v }))}
              placeholder="Select expected harvest date"
            />
          )}
          <div className="flex gap-2 mt-1">
            <button
              type="button"
              onClick={handleAdd}
              className="flex-1 h-8 bg-ember-sidebar hover:bg-ember-sidebar-hover text-white font-semibold text-xs rounded-md"
            >
              Add crop
            </button>
            <button
              type="button"
              onClick={() => {
                setDraft(emptyDraft);
                setShowForm(false);
              }}
              className="px-3 h-8 border border-ember-sidebar/40 text-ember-sidebar font-semibold text-xs rounded-md"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="flex items-center justify-center gap-1 h-8 border border-dashed border-ember-sidebar/50 text-ember-sidebar font-semibold text-xs rounded-md hover:bg-ember-sidebar/5"
        >
          <Plus size={14} /> Add another crop
        </button>
      )}
    </div>
  );
};

export default AddFieldSidebar;
