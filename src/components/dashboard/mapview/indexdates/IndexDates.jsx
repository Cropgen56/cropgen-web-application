import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Calender,
  LeftArrow,
  RightArrow,
} from "../../../../assets/DashboardIcons";
import SatelliteIndexList from "../satellitedata/SatelliteIndexList";
import { fetchSatelliteDates } from "../../../../redux/slices/satelliteSlice";
import "./IndexDates.css";

// Constants
const VISIBLE_DATES_COUNT = 6;
const DATE_FORMAT_OPTIONS = {
  day: "numeric",
  month: "short",
  year: "numeric",
};
const DEBOUNCE_DELAY = 500;

// Utility function to format dates
const formatDate = (date) => {
  try {
    return new Date(date).toLocaleDateString("en-US", DATE_FORMAT_OPTIONS);
  } catch {
    return "";
  }
};

// Utility to standardize date to ISO string
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

// Utility for deep comparison of arrays
const areArraysEqual = (arr1, arr2) => {
  if (!arr1 || !arr2 || arr1.length !== arr2.length) return false;
  return arr1.every((item, index) =>
    Array.isArray(item) && Array.isArray(arr2[index])
      ? item.every((val, i) => val === arr2[index][i])
      : item === arr2[index]
  );
};

// Debounce utility
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// Main component
const IndexSelector = ({ selectedFieldsDetials = [] }) => {
  const dispatch = useDispatch();
  const { satelliteDates = [], loading } = useSelector(
    (state) => state.satellite
  );

  const [dates, setDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [visibleDates, setVisibleDates] = useState([]);
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);

  // Memoize coordinates to prevent unnecessary reference changes
  const coordinates = useMemo(() => {
    return (
      selectedFieldsDetials[0]?.field?.map(({ lat, lng }) => [lng, lat]) ?? []
    );
  }, [selectedFieldsDetials]);

  // Debounced fetch function
  const debouncedFetchSatelliteDates = useMemo(
    () =>
      debounce((coords) => {
        if (coords?.length > 0) {
          dispatch(fetchSatelliteDates([coords]));
        }
      }, DEBOUNCE_DELAY),
    [dispatch]
  );

  // Fetch satellite dates when coordinates change
  useEffect(() => {
    debouncedFetchSatelliteDates(coordinates);
    return () => debouncedFetchSatelliteDates.cancel?.();
  }, [coordinates, debouncedFetchSatelliteDates]);

  // Process satellite dates
  useEffect(() => {
    if (!satelliteDates?.length) {
      setDates([]);
      setVisibleDates([]);
      setSelectedDate("");
      return;
    }

    const uniqueDatesMap = new Map();
    satelliteDates.forEach((item) => {
      const formattedDate = formatDate(item.date);
      if (formattedDate && !uniqueDatesMap.has(formattedDate)) {
        uniqueDatesMap.set(formattedDate, {
          date: formattedDate,
          value: item.cloud_percentage ?? 0,
          change: parseFloat((Math.random() * 0.3 - 0.15).toFixed(2)),
        });
      }
    });

    const processedDates = Array.from(uniqueDatesMap.values());
    setDates(processedDates);

    // Only update visibleDates if it's empty or the current range is invalid
    if (
      visibleDates.length === 0 ||
      !visibleDates.every((vd) =>
        processedDates.some((pd) => pd.date === vd.date)
      )
    ) {
      setVisibleDates(processedDates.slice(0, VISIBLE_DATES_COUNT));
    }

    // Set default selected date only if not already set
    if (processedDates.length > 0 && !selectedDate) {
      setSelectedDate(toISODateString(satelliteDates[0].date));
    }
  }, [satelliteDates]);

  // Handle arrow navigation
  const handleArrowClick = useCallback(
    (direction) => {
      if (!dates?.length) return;

      const currentStartIndex = dates.findIndex(
        (d) => d.date === visibleDates[0]?.date
      );

      if (
        direction === "next" &&
        currentStartIndex + VISIBLE_DATES_COUNT < dates.length
      ) {
        setVisibleDates(
          dates.slice(
            currentStartIndex + VISIBLE_DATES_COUNT,
            currentStartIndex + VISIBLE_DATES_COUNT * 2
          )
        );
      } else if (direction === "prev" && currentStartIndex > 0) {
        setVisibleDates(
          dates.slice(
            Math.max(0, currentStartIndex - VISIBLE_DATES_COUNT),
            currentStartIndex
          )
        );
      }
    },
    [dates, visibleDates]
  );

  // Handle date selection
  const handleDateClick = useCallback((date) => {
    const formattedDate = toISODateString(date);
    if (formattedDate) {
      setSelectedDate(formattedDate);
    }
  }, []);

  // Toggle calendar visibility
  const toggleCalendar = useCallback(() => {
    setIsCalendarVisible((prev) => !prev);
  }, []);

  return (
    <div className="ndvi-selector">
      <SatelliteIndexList
        selectedFieldsDetials={selectedFieldsDetials}
        selectedDate={selectedDate}
      />
      <div className="dates-container px-2">
        {loading.satelliteDates ? (
          <div className="loader-bar" aria-live="polite">
            <div className="loader-bar-inner"></div>
          </div>
        ) : (
          <>
            <div className="calendar-icon-container">
              <button
                type="button"
                className="calendar-icon-button"
                onClick={toggleCalendar}
                aria-label="Toggle calendar"
                aria-expanded={isCalendarVisible}
              >
                <Calender />
              </button>
              {isCalendarVisible && (
                <div className="calendar-container">
                  <input
                    type="date"
                    className="calendar-input"
                    onChange={(e) => handleDateClick(e.target.value)}
                    aria-label="Select date"
                  />
                </div>
              )}
            </div>
            <div className="vertical-line" aria-hidden="true" />
            <button
              type="button"
              className="arrow-button"
              onClick={() => handleArrowClick("prev")}
              aria-label="Previous dates"
              disabled={
                !dates.length ||
                dates.findIndex((d) => d.date === visibleDates[0]?.date) <= 0
              }
            >
              <LeftArrow />
            </button>
            <div className="vertical-line" aria-hidden="true" />
            <div
              className="dates-list"
              role="listbox"
              aria-label="Available dates"
            >
              {visibleDates.map((dateItem, index) => {
                const isSelected =
                  formatDate(dateItem.date) === formatDate(selectedDate);
                return (
                  <div
                    key={`${dateItem.date}-${index}`}
                    className={`date-item ${isSelected ? "selected" : ""}`}
                    onClick={() => handleDateClick(dateItem.date)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleDateClick(dateItem.date);
                      }
                    }}
                    role="option"
                    aria-selected={isSelected}
                    tabIndex={0}
                  >
                    <div className="date-text">{dateItem.date}</div>
                    <div className="date-data">
                      <div>{dateItem.value.toFixed(2)}</div>
                      <div
                        className={`date-change ${
                          dateItem.change >= 0 ? "positive" : "negative"
                        }`}
                      >
                        {dateItem.change >= 0
                          ? `+${dateItem.change}`
                          : dateItem.change}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="vertical-line" aria-hidden="true" />
            <button
              type="button"
              className="arrow-button"
              onClick={() => handleArrowClick("next")}
              aria-label="Next dates"
              disabled={
                !dates.length ||
                dates.findIndex((d) => d.date === visibleDates[0]?.date) +
                  VISIBLE_DATES_COUNT >=
                  dates.length
              }
            >
              <RightArrow />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

// Memoize component
export default memo(IndexSelector, (prevProps, nextProps) => {
  return areArraysEqual(
    prevProps.selectedFieldsDetials[0]?.field,
    nextProps.selectedFieldsDetials[0]?.field
  );
});
