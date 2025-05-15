import React, { useState, useEffect } from "react";
import {
  Calender,
  LeftArrow,
  RightArrow,
} from "../../../../assets/DashboardIcons.jsx";
import SatelliteData from "../satellitedata/SatelliteData.jsx";
import "./IndexDates.css";
import { useDispatch, useSelector } from "react-redux";
import { fetchSatelliteDates } from "../../../../redux/slices/satelliteSlice.js";

const IndexSelector = ({ selectedFieldsDetials }) => {
  const dispatch = useDispatch();
  const { field } = selectedFieldsDetials[0] || [];
  const coordinates = [field?.map(({ lat, lng }) => [lng, lat])];

  useEffect(() => {
    if (coordinates && coordinates.length) {
      dispatch(fetchSatelliteDates(coordinates));
    }
  }, [dispatch, coordinates]);

  const { satelliteDates } = useSelector((state) => state?.satellite);

  const formatDate = (date) => {
    const options = { day: "numeric", month: "short", year: "numeric" };
    return new Date(date).toLocaleDateString("en-US", options);
  };

  const [dates, setDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [visibleDates, setVisibleDates] = useState([]);
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);

  useEffect(() => {
    if (satelliteDates?.length > 0) {
      const processedDates = satelliteDates.map((item) => ({
        date: formatDate(item.date),
        value: item.cloud_percentage,
        change: parseFloat((Math.random() * 0.3 - 0.15).toFixed(2)),
      }));
      setDates(processedDates);
      setVisibleDates(processedDates.slice(0, 7));
    }
  }, [satelliteDates]);

  // update the data
  const handleArrowClick = (direction) => {
    if (!dates.length) return;

    const currentStartIndex = dates.findIndex(
      (d) => d.date === visibleDates[0]?.date
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

  const handleDateClick = (date) => {
    const adjustedDate = new Date(date);
    adjustedDate.setHours(12, 0, 0, 0);
    setSelectedDate(adjustedDate.toISOString().split("T")[0]);
  };

  return (
    <div className="ndvi-selector">
      <SatelliteData
        selectedFieldsDetials={selectedFieldsDetials}
        selectedDate={selectedDate}
      />
      <div className="dates-container px-2">
        {satelliteDates?.length == 0 ? (
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
                  <input type="date" className="calendar-input" />
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
                    formatDate(dateItem.date) === formatDate(selectedDate)
                      ? "selected"
                      : ""
                  }`}
                  onClick={() => handleDateClick(dateItem.date)}
                >
                  <div className="date-text">{formatDate(dateItem.date)}</div>
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

export default IndexSelector;
