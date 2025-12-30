import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Calender,
  LeftArrow,
  RightArrow,
} from "../../../../assets/DashboardIcons";
import SatelliteIndexList from "../satellitedata/SatelliteIndexList";
import {
  fetchSatelliteDates,
  clearSatelliteDates,
} from "../../../../redux/slices/satelliteSlice";
import { X, Calendar, RefreshCw, AlertCircle } from "lucide-react";

const DATE_FORMAT_OPTIONS = { day: "numeric", month: "short", year: "numeric" };

// Helper functions
const formatDate = (date) => {
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return String(date);
    return d.toLocaleDateString("en-US", DATE_FORMAT_OPTIONS);
  } catch {
    return String(date);
  }
};

const toISODateString = (date) => {
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return "";
    d.setHours(12, 0, 0, 0);
    return d.toISOString().split("T")[0];
  } catch {
    return "";
  }
};

const getSixMonthsBeforeDate = () => {
  const date = new Date();
  date.setMonth(date.getMonth() - 6);
  return date.toISOString().split("T")[0];
};

const getTodayDate = () => new Date().toISOString().split("T")[0];

const areArraysEqual = (arr1, arr2) => {
  if (!arr1 || !arr2 || arr1.length !== arr2.length) return false;
  return arr1.every(
    (item, idx) => item.lat === arr2[idx].lat && item.lng === arr2[idx].lng
  );
};

// Error Modal Component
const ErrorModal = ({ isOpen, onClose, message }) => {
  const modalRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };
    
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
      <div
        ref={modalRef}
        className="bg-[#344e41] rounded-lg shadow-xl border border-[#5a7c6b] p-5 max-w-sm w-[90%] mx-4"
        style={{ animation: "scaleIn 0.2s ease-out" }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
            <AlertCircle size={24} className="text-red-400" />
          </div>
          <h3 className="text-white font-semibold text-lg">Invalid Date</h3>
        </div>

        {/* Message */}
        <p className="text-gray-300 text-sm mb-5">{message}</p>

        {/* Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 bg-[#28C878] hover:bg-[#22b06a] text-white font-medium rounded-md transition-colors"
        >
          Got it
        </button>
      </div>

      <style>{`
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};

// Date Picker Component (Start Date Only)
const DatePicker = ({
  startDate,
  onStartDateChange,
  onApply,
  onReset,
  onClose,
  isLoading,
}) => {
  const today = getTodayDate();
  const pickerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={pickerRef}
      className="absolute bottom-full left-0 mb-2 bg-[#344e41] rounded-lg shadow-xl border border-[#5a7c6b] p-4 z-[1300] min-w-[260px]"
      style={{ animation: "slideUp 0.2s ease-out" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar size={18} className="text-[#28C878]" />
          <h3 className="text-white font-semibold text-sm">Select Start Date</h3>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
          type="button"
        >
          <X size={18} />
        </button>
      </div>

      {/* Date Input */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-gray-300 font-medium">
          Show data from
        </label>
        <input
          type="date"
          value={startDate}
          max={today}
          onChange={(e) => onStartDateChange(e.target.value)}
          className="w-full px-3 py-2.5 bg-[#2a3d33] border border-[#5a7c6b] rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#28C878] focus:border-transparent cursor-pointer"
        />
        <p className="text-[10px] text-gray-400 mt-1">
          Data will be shown from selected date to today ({formatDate(today)})
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 mt-4 pt-3 border-t border-[#5a7c6b]">
        <button
          type="button"
          onClick={onReset}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-[#5a7c6b] hover:bg-[#6b8d7c] text-white text-sm rounded-md transition-colors"
        >
          <RefreshCw size={14} />
          Reset
        </button>
        <button
          type="button"
          onClick={onApply}
          disabled={isLoading}
          className="flex-1 px-3 py-2 bg-[#28C878] hover:bg-[#22b06a] text-white text-sm font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-1.5">
              <RefreshCw size={14} className="animate-spin" />
              Loading...
            </span>
          ) : (
            "Apply"
          )}
        </button>
      </div>

      {/* Current Selection Display */}
      <div className="mt-3 p-2 bg-[#2a3d33] rounded-md">
        <p className="text-[10px] text-gray-400 text-center">
          <span className="text-[#28C878] font-medium">
            {formatDate(startDate)}
          </span>
          {" → "}
          <span className="text-[#28C878] font-medium">
            {formatDate(today)}
          </span>
        </p>
      </div>
    </div>
  );
};

// Date Range Badge
const DateRangeBadge = ({ startDate, onClear }) => {
  const today = getTodayDate();
  
  return (
    <div className="flex items-center gap-1 px-2 py-0.5 bg-[#28C878]/20 border border-[#28C878]/40 rounded-full">
      <span className="text-[10px] text-[#28C878] whitespace-nowrap">
        From {formatDate(startDate)}
      </span>
      <button
        type="button"
        onClick={onClear}
        className="ml-1 text-[#28C878] hover:text-white transition-colors"
        title="Reset to default"
      >
        <X size={12} />
      </button>
    </div>
  );
};

const IndexSelector = ({ selectedFieldsDetials = [] }) => {
  const dispatch = useDispatch();
  const { satelliteDates, loading } = useSelector((state) => state.satellite);

  // Default dates
  const defaultStartDate = useMemo(() => getSixMonthsBeforeDate(), []);
  const endDate = useMemo(() => getTodayDate(), []);

  // State
  const [dates, setDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [visibleDates, setVisibleDates] = useState([]);
  const [visibleCount, setVisibleCount] = useState(6);

  // Calendar state
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);
  const [customStartDate, setCustomStartDate] = useState(defaultStartDate);
  const [appliedStartDate, setAppliedStartDate] = useState(defaultStartDate);

  // Error modal state
  const [errorModal, setErrorModal] = useState({
    isOpen: false,
    message: "",
  });

  // Track field ID
  const currentFieldId = selectedFieldsDetials[0]?._id;
  const prevFieldIdRef = useRef(currentFieldId);

  // Check if using default
  const isDefaultRange = useMemo(() => {
    return appliedStartDate === defaultStartDate;
  }, [appliedStartDate, defaultStartDate]);

  // Build coordinates
  const coordinates = useMemo(() => {
    const field = selectedFieldsDetials[0]?.field;
    if (!field || field.length < 3) return [];
    const coords = field.map(({ lat, lng }) => [lng, lat]);
    if (
      coords.length > 0 &&
      (coords[0][0] !== coords[coords.length - 1][0] ||
        coords[0][1] !== coords[coords.length - 1][1])
    ) {
      coords.push(coords[0]);
    }
    return coords;
  }, [selectedFieldsDetials]);

  // Fetch function
  const fetchDatesDirectly = useCallback(
    (coords, startDate) => {
      if (!coords || coords.length === 0) return;

      dispatch(
        fetchSatelliteDates({
          geometry: coords,
          startDate: startDate,
          endDate: endDate,
        })
      );
    },
    [dispatch, endDate]
  );

  // Reset on field change
  useEffect(() => {
    if (currentFieldId && currentFieldId !== prevFieldIdRef.current) {
      prevFieldIdRef.current = currentFieldId;
      setCustomStartDate(defaultStartDate);
      setAppliedStartDate(defaultStartDate);
      setSelectedDate("");
      setDates([]);
      setVisibleDates([]);
      dispatch(clearSatelliteDates());
    }
  }, [currentFieldId, defaultStartDate, dispatch]);

  // Fetch when coordinates or applied date changes
  useEffect(() => {
    if (coordinates.length > 0) {
      fetchDatesDirectly(coordinates, appliedStartDate);
    }
  }, [coordinates, appliedStartDate, fetchDatesDirectly]);

  // Responsive visible count
  useEffect(() => {
    const handleResize = () => {
      setVisibleCount(window.innerWidth < 1024 ? 5 : 6);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Process satellite dates
  useEffect(() => {
    const items = satelliteDates?.items || [];

    if (!items.length) {
      setDates([]);
      setVisibleDates([]);
      if (selectedDate) setSelectedDate("");
      return;
    }

    const dateMap = new Map();
    items.forEach((item) => {
      const isoDate = toISODateString(item.date);
      if (isoDate && !dateMap.has(isoDate)) {
        dateMap.set(isoDate, {
          date: formatDate(item.date),
          isoDate: isoDate,
          value: item.cloud_cover ?? 0,
        });
      }
    });

    const uniqueDates = Array.from(dateMap.values()).sort(
      (a, b) => new Date(b.isoDate) - new Date(a.isoDate)
    );

    setDates(uniqueDates);
    setVisibleDates(uniqueDates.slice(0, visibleCount));

    if (uniqueDates.length > 0 && !selectedDate) {
      setSelectedDate(uniqueDates[0].isoDate);
    }
  }, [satelliteDates, visibleCount, selectedDate]);

  // Handlers
  const handleApplyDateRange = useCallback(() => {
    if (!customStartDate) return;

    const today = getTodayDate();

    // Check if start date equals today
    if (customStartDate === today) {
      setErrorModal({
        isOpen: true,
        message:
          "Start date cannot be the same as today's date. Please select a date in the past to view historical satellite data.",
      });
      return;
    }

    // Check if start date is in the future
    if (customStartDate > today) {
      setErrorModal({
        isOpen: true,
        message:
          "Start date cannot be in the future. Please select a valid past date.",
      });
      return;
    }

    setAppliedStartDate(customStartDate);
    setSelectedDate("");
    setIsCalendarVisible(false);
    dispatch(clearSatelliteDates());

    if (coordinates.length > 0) {
      fetchDatesDirectly(coordinates, customStartDate);
    }
  }, [customStartDate, coordinates, fetchDatesDirectly, dispatch]);

  const handleResetDateRange = useCallback(() => {
    setCustomStartDate(defaultStartDate);
    setAppliedStartDate(defaultStartDate);
    setSelectedDate("");
    setIsCalendarVisible(false);
    dispatch(clearSatelliteDates());

    if (coordinates.length > 0) {
      fetchDatesDirectly(coordinates, defaultStartDate);
    }
  }, [defaultStartDate, coordinates, fetchDatesDirectly, dispatch]);

  const handleArrowClick = useCallback(
    (direction) => {
      if (!dates.length) return;

      const currentStart = dates.findIndex(
        (d) => d.date === visibleDates[0]?.date
      );

      if (direction === "next" && currentStart + visibleCount < dates.length) {
        setVisibleDates(
          dates.slice(
            currentStart + visibleCount,
            currentStart + visibleCount * 2
          )
        );
      } else if (direction === "prev" && currentStart > 0) {
        setVisibleDates(
          dates.slice(Math.max(0, currentStart - visibleCount), currentStart)
        );
      }
    },
    [dates, visibleDates, visibleCount]
  );

  const handleDateClick = useCallback(
    (isoDate) => {
      if (isoDate && isoDate !== selectedDate) {
        setSelectedDate(isoDate);
      }
    },
    [selectedDate]
  );

  const toggleCalendar = useCallback(() => {
    setIsCalendarVisible((prev) => !prev);
  }, []);

  const closeCalendar = useCallback(() => {
    setIsCalendarVisible(false);
  }, []);

  const closeErrorModal = useCallback(() => {
    setErrorModal({ isOpen: false, message: "" });
  }, []);

  // Disabled states
  const isPrevDisabled = useMemo(() => {
    if (loading.satelliteDates || !dates.length) return true;
    const currentStart = dates.findIndex(
      (d) => d.date === visibleDates[0]?.date
    );
    return currentStart <= 0;
  }, [loading.satelliteDates, dates, visibleDates]);

  const isNextDisabled = useMemo(() => {
    if (loading.satelliteDates || !dates.length) return true;
    const currentStart = dates.findIndex(
      (d) => d.date === visibleDates[0]?.date
    );
    return currentStart + visibleCount >= dates.length;
  }, [loading.satelliteDates, dates, visibleDates, visibleCount]);

  return (
    <div className="absolute bottom-0 w-full z-[1200] flex flex-col items-center font-sans py-[2px]">
      {/* Error Modal */}
      <ErrorModal
        isOpen={errorModal.isOpen}
        onClose={closeErrorModal}
        message={errorModal.message}
      />

      <SatelliteIndexList
        selectedFieldsDetials={selectedFieldsDetials}
        selectedDate={selectedDate}
      />

      <div className="flex items-center gap-2 w-full px-2 bg-[#5a7c6b] rounded-md relative">
        {/* Calendar Button */}
        <div className="relative flex items-center">
          <button
            type="button"
            onClick={toggleCalendar}
            className={`bg-transparent border-none cursor-pointer p-1 rounded transition-colors ${
              isCalendarVisible ? "bg-[#344e41]" : "hover:bg-[#344e41]/50"
            }`}
            aria-label="Toggle calendar"
            title="Select start date"
          >
            <Calender />
          </button>

          {/* Date Picker */}
          {isCalendarVisible && (
            <DatePicker
              startDate={customStartDate}
              onStartDateChange={setCustomStartDate}
              onApply={handleApplyDateRange}
              onReset={handleResetDateRange}
              onClose={closeCalendar}
              isLoading={loading.satelliteDates}
            />
          )}
        </div>

        {/* Date Range Badge */}
        {!isDefaultRange && (
          <DateRangeBadge
            startDate={appliedStartDate}
            onClear={handleResetDateRange}
          />
        )}

        {/* Previous Button */}
        <button
          type="button"
          onClick={() => handleArrowClick("prev")}
          disabled={isPrevDisabled}
          className="disabled:opacity-50 disabled:cursor-not-allowed p-1"
        >
          <LeftArrow />
        </button>

        {/* Date Items */}
        <div className="flex gap-2 overflow-x-auto w-full justify-between py-[5px] scrollbar-hide scroll-smooth">
          {loading.satelliteDates ? (
            Array.from({ length: visibleCount }).map((_, idx) => (
              <div
                key={idx}
                className="h-[40px] min-w-[90px] rounded-xl bg-[#344e41]/50 animate-pulse"
              />
            ))
          ) : visibleDates.length > 0 ? (
            visibleDates.map((dateItem) => (
              <div
                key={dateItem.isoDate}
                className={`flex flex-col items-center text-white cursor-pointer rounded px-4 py-2.5 min-w-[90px] transition-colors ${
                  dateItem.isoDate === selectedDate
                    ? "bg-[#344e41]"
                    : "bg-transparent hover:bg-[#344e41]/50"
                }`}
                onClick={() => handleDateClick(dateItem.isoDate)}
                role="option"
                aria-selected={dateItem.isoDate === selectedDate}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    handleDateClick(dateItem.isoDate);
                  }
                }}
              >
                <div className="font-semibold text-xs text-center whitespace-nowrap">
                  {dateItem.date}
                </div>
                <div className="text-xs text-center whitespace-nowrap">
                  {dateItem.value.toFixed(2)}% Cloud
                </div>
              </div>
            ))
          ) : (
            <div className="flex-1 flex items-center justify-center py-2">
              <p className="text-white/70 text-xs">
                No dates available for selected range
              </p>
            </div>
          )}
        </div>

        {/* Next Button */}
        <button
          type="button"
          onClick={() => handleArrowClick("next")}
          disabled={isNextDisabled}
          className="disabled:opacity-50 disabled:cursor-not-allowed p-1"
        >
          <RightArrow />
        </button>
      </div>

      {/* CSS Animation */}
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default React.memo(IndexSelector, (prev, next) =>
  areArraysEqual(
    prev.selectedFieldsDetials[0]?.field,
    next.selectedFieldsDetials[0]?.field
  )
);