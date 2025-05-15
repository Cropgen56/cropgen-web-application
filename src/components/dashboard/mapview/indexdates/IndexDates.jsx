import React, { useState, useEffect } from "react";
import {
  Calender,
  LeftArrow,
  RightArrow,
} from "../../../../assets/DashboardIcons.jsx";
import SatelliteIndex from "../satellitedata/SatelliteIndex.jsx";
import "./IndexDates.css";
import { useDispatch, useSelector } from "react-redux";
import { fetchSatelliteDates } from "../../../../redux/slices/satelliteSlice.js";

const IndexDates = ({ selectedFieldsDetials }) => {
  const dispatch = useDispatch();
  // Safely access field data
  const { field } = selectedFieldsDetials?.[0] || {};
  const coordinates = field?.length
    ? [field.map(({ lat, lng }) => [lng, lat])]
    : [];

  // Fetch satellite dates when coordinates change
  useEffect(() => {
    if (coordinates?.length > 0) {
      dispatch(fetchSatelliteDates(coordinates));
    }
  }, [selectedFieldsDetials]);

  const { satelliteDates, loading } = useSelector((state) => state?.satellite);

  console.log(satelliteDates);

  // Format date to "dd MMM yyyy"
  const formatDate = (date) => {
    if (!date) return "";
    const options = { day: "numeric", month: "short", year: "numeric" };
    return new Date(date).toLocaleDateString("en-US", options);
  };

  const [dates, setDates] = useState([]);
  const [visibleDates, setVisibleDates] = useState([]);
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  // Process satellite dates, remove duplicates, and set default selected date
  useEffect(() => {
    if (satelliteDates?.length > 0) {
      // Deduplicate dates based on raw date field
      const seenDates = new Set();
      const uniqueDates = satelliteDates.filter((item) => {
        const dateKey = new Date(item.date).toISOString().split("T")[0];
        if (!seenDates.has(dateKey)) {
          seenDates.add(dateKey);
          return true;
        }
        return false;
      });

      const processedDates = uniqueDates.map((item) => ({
        date: item.date,
        formattedDate: formatDate(item.date),
        value: item.cloud_percentage,
        change: parseFloat((Math.random() * 0.3 - 0.15).toFixed(2)),
      }));

      setDates(processedDates);
      setVisibleDates(processedDates.slice(0, 7));

      // Set the first date as default if no date is selected
      if (!selectedDate && processedDates.length > 0) {
        const firstDate = new Date(processedDates[0].date);
        firstDate.setHours(12, 0, 0, 0);
        setSelectedDate(firstDate.toISOString().split("T")[0]);
      }
    } else {
      setDates([]);
      setVisibleDates([]);
      setSelectedDate(null);
    }
  }, [satelliteDates]);

  // update the data vishal
  const handleArrowClick = (direction) => {
    if (!dates.length) return;

    const currentStartIndex = dates.findIndex(
      (d) => d.formattedDate === visibleDates[0]?.formattedDate
    );
    if (direction === "next" && currentStartIndex + 7 < dates.length) {
      setVisibleDates(
        dates.slice(currentStartIndex + 7, currentStartIndex + 14)
      );
    } else if (direction === "prev" && currentStartIndex > 0) {
      setVisibleDates(
        dates.slice(Math.max(0, currentStartIndex - 7), currentStartIndex)
      );
    }
  };

  // Handle user date selection
  const handleDateClick = (date) => {
    const adjustedDate = new Date(date);
    adjustedDate.setHours(12, 0, 0, 0);
    setSelectedDate(adjustedDate.toISOString().split("T")[0]);
  };

  return (
    <div className="ndvi-selector">
      <SatelliteIndex
        selectedFieldsDetials={selectedFieldsDetials}
        selectedDate={selectedDate}
      />
      <div className="dates-container px-2">
        {satelliteDates?.length === 0 ? (
          <div className="loading-text">Dates Loading...</div>
        ) : (
          <>
            <div className="calendar-icon-container">
              <div
                className="calendar-icon-button"
                onClick={() => setIsCalendarVisible(!isCalendarVisible)}
              >
                <Calender />
              </div>
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
            <div
              className="arrow-button"
              onClick={() => handleArrowClick("prev")}
            >
              <LeftArrow />
            </div>
            <div className="vertical-line" />
            <div className="dates-list">
              {visibleDates.map((dateItem, index) => (
                <div
                  key={index}
                  className={`date-item ${
                    dateItem.formattedDate === formatDate(selectedDate)
                      ? "selected"
                      : ""
                  }`}
                  onClick={() => handleDateClick(dateItem.date)}
                >
                  <div className="date-text">{dateItem.formattedDate}</div>
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
            <div
              className="arrow-button"
              onClick={() => handleArrowClick("next")}
            >
              <RightArrow />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default IndexDates;
