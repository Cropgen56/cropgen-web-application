import React, { useState, useEffect } from "react";
import {
  Calender,
  LeftArrow,
  RightArrow,
} from "../../../../assets/DashboardIcons";
import SatelliteData from "../satellitedata/SatelliteData";
import "./NdviSelector.css";

const NDVISelector = () => {
  // for genrate the whole year dates
  const currentYear = new Date().getFullYear();
  const generateYearDates = () => {
    const yearDates = [];
    for (let month = 0; month < 12; month++) {
      for (let day = 1; day <= 31; day++) {
        const date = new Date(currentYear, month, day);
        if (date.getMonth() === month) {
          yearDates.push({
            date: date.toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            }),
            value: 0.0,
            change: parseFloat((Math.random() * 0.3 - 0.15).toFixed(2)),
          });
        }
      }
    }
    return yearDates;
  };

  const [dates, setDates] = useState(generateYearDates());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [visibleDates, setVisibleDates] = useState(dates.slice(0, 7));
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);

  // for fomat the dates
  const formatDate = (date) => {
    const options = { day: "numeric", month: "short", year: "numeric" };
    const dateObject = new Date(date);
    const day = dateObject.getDate();
    const month = dateObject.toLocaleDateString("en-US", { month: "short" });
    const year = dateObject.getFullYear();
    return `${day} ${month} / ${year}`;
  };

  // when click on the arrow then move to the next dates
  const handleArrowClick = (direction) => {
    const currentStartIndex = dates.findIndex(
      (d) => d.date === visibleDates[0].date
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

  // show the new dates
  const handleDateChange = (event) => {
    const newDate = new Date(event.target.value);
    setSelectedDate(newDate);

    const selectedIndex = dates.findIndex(
      (d) => formatDate(d.date) === formatDate(newDate)
    );
    const newVisibleDates = dates.slice(
      Math.max(0, selectedIndex - 3),
      selectedIndex + 4
    );
    setVisibleDates(newVisibleDates);
  };

  useEffect(() => {
    const selectedIndex = dates.findIndex(
      (d) => formatDate(d.date) === formatDate(selectedDate)
    );
    const newVisibleDates = dates.slice(
      Math.max(0, selectedIndex - 3),
      selectedIndex + 4
    );
    setVisibleDates(newVisibleDates);
  }, [selectedDate]);

  return (
    <div className="ndvi-selector">
      {/* satellite data Component */}
      <SatelliteData />
      <div className="dates-container px-2">
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
                value={selectedDate.toISOString().slice(0, 10)}
                onChange={handleDateChange}
                className="calendar-input"
              />
            </div>
          )}
        </div>
        <div className="vertical-line" />
        <div className="arrow-button" onClick={() => handleArrowClick("prev")}>
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
            >
              <div className="date-text">{formatDate(dateItem.date)}</div>
              <div className="date-data">
                <div>0.00</div>
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
        <div className="arrow-button" onClick={() => handleArrowClick("next")}>
          <RightArrow />
        </div>
      </div>
    </div>
  );
};

export default NDVISelector;
