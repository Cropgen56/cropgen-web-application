import React, { useState, useEffect, useCallback, memo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Calender,
  LeftArrow,
  RightArrow,
} from "../../../../assets/DashboardIcons";
import SatelliteData from "../satellitedata/SatelliteData";
import { fetchSatelliteDates } from "../../../../redux/slices/satelliteSlice";
import "./IndexDates.css";

// Constants
const VISIBLE_DATES_COUNT = 7;
const DATE_FORMAT_OPTIONS = {
  day: "numeric",
  month: "short",
  year: "numeric",
};

// Utility function to format dates
const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-US", DATE_FORMAT_OPTIONS);

// Main component
const IndexSelector = ({ selectedFieldsDetials }) => {
  const dispatch = useDispatch();
  const { satelliteDates } = useSelector((state) => state.satellite);

  const [dates, setDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [visibleDates, setVisibleDates] = useState([]);
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);

  // Extract coordinates from selected field details
  const coordinates =
    selectedFieldsDetials[0]?.field?.map(({ lat, lng }) => [lng, lat]) || [];

  // Fetch satellite dates when coordinates change
  useEffect(() => {
    if (coordinates.length > 0) {
      dispatch(fetchSatelliteDates([coordinates]));
    }
  }, [dispatch, coordinates]);

  // Process satellite dates and set first date as default
  useEffect(() => {
    if (satelliteDates?.length) {
      // Remove duplicate dates by creating a Set of formatted dates
      const uniqueDatesMap = new Map();
      satelliteDates.forEach((item) => {
        const formattedDate = formatDate(item.date);
        if (!uniqueDatesMap.has(formattedDate)) {
          uniqueDatesMap.set(formattedDate, {
            date: formattedDate,
            value: item.cloud_percentage,
            change: parseFloat((Math.random() * 0.3 - 0.15).toFixed(2)),
          });
        }
      });

      const processedDates = Array.from(uniqueDatesMap.values());
      setDates(processedDates);
      setVisibleDates(processedDates.slice(0, VISIBLE_DATES_COUNT));

      // Set the first date as the default selected date
      if (processedDates.length > 0 && !selectedDate) {
        const firstDate = new Date(satelliteDates[0].date);
        firstDate.setHours(12, 0, 0, 0);
        setSelectedDate(firstDate.toISOString().split("T")[0]);
      }
    }
  }, [satelliteDates, selectedDate]);

  // Handle arrow navigation
  const handleArrowClick = useCallback(
    (direction) => {
      if (!dates.length) return;

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
    const adjustedDate = new Date(date);
    adjustedDate.setHours(12, 0, 0, 0);
    setSelectedDate(adjustedDate.toISOString().split("T")[0]);
  }, []);

  // Toggle calendar visibility
  const toggleCalendar = useCallback(() => {
    setIsCalendarVisible((prev) => !prev);
  }, []);

  return (
    <div className="ndvi-selector">
      <SatelliteData
        selectedFieldsDetials={selectedFieldsDetials}
        selectedDate={selectedDate}
      />
      <div className="dates-container px-2">
        {satelliteDates?.length === 0 ? (
          <div className="loading-text">Loading Dates...</div>
        ) : (
          <>
            <div className="calendar-icon-container">
              <button
                type="button"
                className="calendar-icon-button"
                onClick={toggleCalendar}
                aria-label="Toggle calendar"
              >
                <Calender />
              </button>
              {isCalendarVisible && (
                <div className="calendar-container">
                  <input
                    type="date"
                    className="calendar-input"
                    onChange={(e) => handleDateClick(e.target.value)}
                  />
                </div>
              )}
            </div>
            <div className="vertical-line" />
            <button
              type="button"
              className="arrow-button"
              onClick={() => handleArrowClick("prev")}
              aria-label="Previous dates"
            >
              <LeftArrow />
            </button>
            <div className="vertical-line" />
            <div className="dates-list" role="listbox">
              {visibleDates.map((dateItem, index) => (
                <div
                  key={`${dateItem.date}-${index}`}
                  className={`date-item ${
                    formatDate(dateItem.date) === formatDate(selectedDate)
                      ? "selected"
                      : ""
                  }`}
                  onClick={() => handleDateClick(dateItem.date)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && handleDateClick(dateItem.date)
                  }
                  role="option"
                  aria-selected={
                    formatDate(dateItem.date) === formatDate(selectedDate)
                  }
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
              ))}
            </div>
            <div className="vertical-line" />
            <button
              type="button"
              className="arrow-button"
              onClick={() => handleArrowClick("next")}
              aria-label="Next dates"
            >
              <RightArrow />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

// Memoize component to prevent unnecessary re-renders
export default memo(IndexSelector);
