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
import { X, AlertCircle } from "lucide-react";
import DateRangePicker from "./DateRangePicker";

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

// Skeleton Loader Component
const DateSkeleton = ({ count = 6 }) => (
  <>
    {Array.from({ length: count }).map((_, idx) => (
      <div
        key={idx}
        className="flex flex-col items-center rounded px-4 py-2.5 min-w-[90px] bg-[#344e41]/50 animate-pulse"
      >
        <div className="h-3 w-16 bg-[#5a7c6b] rounded mb-1.5" />
        <div className="h-3 w-14 bg-[#5a7c6b] rounded" />
      </div>
    ))}
  </>
);

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
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
            <AlertCircle size={24} className="text-red-400" />
          </div>
          <h3 className="text-white font-semibold text-lg">Invalid Date</h3>
        </div>

        <p className="text-gray-300 text-sm mb-5">{message}</p>

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

// Date Range Badge Component
const DateRangeBadge = ({ startDate, endDate, onClear }) => {
  return (
    <div className="flex items-center gap-1 px-2 py-0.5 bg-[#28C878]/20 border border-[#28C878]/40 rounded-full">
      <span className="text-[10px] text-[#28C878] whitespace-nowrap">
        {formatDate(startDate)} → {formatDate(endDate)}
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

  const defaultStartDate = useMemo(() => getSixMonthsBeforeDate(), []);
  const defaultEndDate = useMemo(() => getTodayDate(), []);

  const [dates, setDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [visibleDates, setVisibleDates] = useState([]);
  const [visibleCount, setVisibleCount] = useState(6);

  const [isCalendarVisible, setIsCalendarVisible] = useState(false);
  const [customStartDate, setCustomStartDate] = useState(defaultStartDate);
  const [customEndDate, setCustomEndDate] = useState(defaultEndDate);
  const [appliedStartDate, setAppliedStartDate] = useState(defaultStartDate);
  const [appliedEndDate, setAppliedEndDate] = useState(defaultEndDate);

  const [errorModal, setErrorModal] = useState({
    isOpen: false,
    message: "",
  });

  const currentFieldId = selectedFieldsDetials[0]?._id;
  const prevFieldIdRef = useRef(currentFieldId);

  const isDefaultRange = useMemo(() => {
    return appliedStartDate === defaultStartDate && appliedEndDate === defaultEndDate;
  }, [appliedStartDate, appliedEndDate, defaultStartDate, defaultEndDate]);

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

  const fetchDatesDirectly = useCallback(
    (coords, startDate, endDate) => {
      if (!coords || coords.length === 0) return;

      dispatch(
        fetchSatelliteDates({
          geometry: coords,
          startDate: startDate,
          endDate: endDate,
        })
      );
    },
    [dispatch]
  );

  // Reset on field change
  useEffect(() => {
    if (currentFieldId && currentFieldId !== prevFieldIdRef.current) {
      prevFieldIdRef.current = currentFieldId;
      setCustomStartDate(defaultStartDate);
      setCustomEndDate(defaultEndDate);
      setAppliedStartDate(defaultStartDate);
      setAppliedEndDate(defaultEndDate);
      setSelectedDate("");
      setDates([]);
      setVisibleDates([]);
      dispatch(clearSatelliteDates());
    }
  }, [currentFieldId, defaultStartDate, defaultEndDate, dispatch]);

  // Fetch when coordinates or applied dates change
  useEffect(() => {
    if (coordinates.length > 0) {
      fetchDatesDirectly(coordinates, appliedStartDate, appliedEndDate);
    }
  }, [coordinates, appliedStartDate, appliedEndDate, fetchDatesDirectly]);

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

  // Scroll to selected date
  useEffect(() => {
    if (selectedDate && dates.length > 0) {
      const selectedIndex = dates.findIndex((d) => d.isoDate === selectedDate);
      if (selectedIndex !== -1) {
        const pageStart = Math.floor(selectedIndex / visibleCount) * visibleCount;
        const newVisibleDates = dates.slice(pageStart, pageStart + visibleCount);

        const isInCurrentView = visibleDates.some((d) => d.isoDate === selectedDate);
        if (!isInCurrentView && newVisibleDates.length > 0) {
          setVisibleDates(newVisibleDates);
        }
      }
    }
  }, [selectedDate, dates, visibleCount]);

  const handleApplyDateRange = useCallback(() => {
    if (!customStartDate || !customEndDate) return;

    const today = getTodayDate();

    if (customStartDate > customEndDate) {
      setErrorModal({
        isOpen: true,
        message: "Start date cannot be after end date. Please select a valid date range.",
      });
      return;
    }

    if (customStartDate === customEndDate) {
      setErrorModal({
        isOpen: true,
        message: "Start date and end date cannot be the same. Please select different dates to view satellite data.",
      });
      return;
    }

    if (customEndDate > today) {
      setErrorModal({
        isOpen: true,
        message: "End date cannot be in the future. Please select a valid date.",
      });
      return;
    }

    setAppliedStartDate(customStartDate);
    setAppliedEndDate(customEndDate);
    setSelectedDate("");
    setIsCalendarVisible(false);
    dispatch(clearSatelliteDates());

    if (coordinates.length > 0) {
      fetchDatesDirectly(coordinates, customStartDate, customEndDate);
    }
  }, [customStartDate, customEndDate, coordinates, fetchDatesDirectly, dispatch]);

  const handleResetDateRange = useCallback(() => {
    setCustomStartDate(defaultStartDate);
    setCustomEndDate(defaultEndDate);
    setAppliedStartDate(defaultStartDate);
    setAppliedEndDate(defaultEndDate);
    setSelectedDate("");
    setIsCalendarVisible(false);
    dispatch(clearSatelliteDates());

    if (coordinates.length > 0) {
      fetchDatesDirectly(coordinates, defaultStartDate, defaultEndDate);
    }
  }, [defaultStartDate, defaultEndDate, coordinates, fetchDatesDirectly, dispatch]);

  const handleArrowClick = useCallback(
    (direction) => {
      if (!dates.length) return;

      const currentStart = dates.findIndex(
        (d) => d.date === visibleDates[0]?.date
      );

      if (direction === "next" && currentStart + visibleCount < dates.length) {
        setVisibleDates(
          dates.slice(currentStart + visibleCount, currentStart + visibleCount * 2)
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

  const isPrevDisabled = useMemo(() => {
    if (loading.satelliteDates || !dates.length) return true;
    const currentStart = dates.findIndex((d) => d.date === visibleDates[0]?.date);
    return currentStart <= 0;
  }, [loading.satelliteDates, dates, visibleDates]);

  const isNextDisabled = useMemo(() => {
    if (loading.satelliteDates || !dates.length) return true;
    const currentStart = dates.findIndex((d) => d.date === visibleDates[0]?.date);
    return currentStart + visibleCount >= dates.length;
  }, [loading.satelliteDates, dates, visibleDates, visibleCount]);

  const renderDateItems = () => {
    if (loading.satelliteDates || visibleDates.length === 0) {
      return <DateSkeleton count={visibleCount} />;
    }

    return visibleDates.map((dateItem) => (
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
    ));
  };

  return (
    <div className="absolute bottom-0 w-full z-[1200] flex flex-col items-center font-sans py-[2px]">
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
        <div className="relative flex items-center">
          <button
            type="button"
            onClick={toggleCalendar}
            className={`bg-transparent border-none cursor-pointer p-1 rounded transition-colors ${
              isCalendarVisible ? "bg-[#344e41]" : "hover:bg-[#344e41]/50"
            }`}
            aria-label="Toggle calendar"
            title="Select date range"
          >
            <Calender />
          </button>

          {isCalendarVisible && (
            <DateRangePicker
              startDate={customStartDate}
              endDate={customEndDate}
              onStartDateChange={setCustomStartDate}
              onEndDateChange={setCustomEndDate}
              onApply={handleApplyDateRange}
              onReset={handleResetDateRange}
              onClose={closeCalendar}
              isLoading={loading.satelliteDates}
            />
          )}
        </div>

        {!isDefaultRange && (
          <DateRangeBadge
            startDate={appliedStartDate}
            endDate={appliedEndDate}
            onClear={handleResetDateRange}
          />
        )}

        <button
          type="button"
          onClick={() => handleArrowClick("prev")}
          disabled={isPrevDisabled}
          className="disabled:opacity-50 disabled:cursor-not-allowed p-1"
        >
          <LeftArrow />
        </button>

        <div className="flex gap-2 overflow-x-auto w-full justify-between py-[5px] scrollbar-hide scroll-smooth">
          {renderDateItems()}
        </div>

        <button
          type="button"
          onClick={() => handleArrowClick("next")}
          disabled={isNextDisabled}
          className="disabled:opacity-50 disabled:cursor-not-allowed p-1"
        >
          <RightArrow />
        </button>
      </div>
    </div>
  );
};

export default React.memo(IndexSelector, (prev, next) =>
  areArraysEqual(
    prev.selectedFieldsDetials[0]?.field,
    next.selectedFieldsDetials[0]?.field
  )
);