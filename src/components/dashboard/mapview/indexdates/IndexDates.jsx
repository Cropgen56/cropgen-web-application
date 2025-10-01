import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Calender,
  LeftArrow,
  RightArrow,
} from "../../../../assets/DashboardIcons";
import SatelliteIndexList from "../satellitedata/SatelliteIndexList";
import { fetchSatelliteDates } from "../../../../redux/slices/satelliteSlice";

const VISIBLE_DATES_COUNT = 6;
const DATE_FORMAT_OPTIONS = { day: "numeric", month: "short", year: "numeric" };
const DEBOUNCE_DELAY = 500;

const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-US", DATE_FORMAT_OPTIONS);
const toISODateString = (date) => {
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  d.setHours(12, 0, 0, 0);
  return d.toISOString().split("T")[0];
};

const areArraysEqual = (arr1, arr2) => {
  if (!arr1 || !arr2 || arr1.length !== arr2.length) return false;
  return arr1.every(
    (item, idx) => item.lat === arr2[idx].lat && item.lng === arr2[idx].lng
  );
};

const debounce = (fn, delay) => {
  let timer;
  const debounced = (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
  debounced.cancel = () => clearTimeout(timer);
  return debounced;
};

const IndexSelector = ({ selectedFieldsDetials = [] }) => {
  const dispatch = useDispatch();
  const { satelliteDates = [], loading } = useSelector(
    (state) => state.satellite
  );

  const [dates, setDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [visibleDates, setVisibleDates] = useState([]);
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);

  const coordinates = useMemo(() => {
    const field = selectedFieldsDetials[0]?.field;
    if (!field || field.length < 3) return [];
    const coords = field.map(({ lat, lng }) => [lng, lat]);
    return coords[0][0] === coords[coords.length - 1][0] &&
      coords[0][1] === coords[coords.length - 1][1]
      ? coords
      : [...coords, coords[0]];
  }, [selectedFieldsDetials]);

  // Debounced API fetch
  const debouncedFetch = useMemo(
    () =>
      debounce((coords) => {
        if (coords.length)
          dispatch(
            fetchSatelliteDates({ geometry: coords, selectedFieldsDetials })
          );
      }, DEBOUNCE_DELAY),
    [dispatch, selectedFieldsDetials]
  );

  useEffect(() => {
    if (coordinates.length) debouncedFetch(coordinates);
    return () => debouncedFetch.cancel();
  }, [coordinates, debouncedFetch]);

  // Update dates when satelliteDates change
  useEffect(() => {
    const items = satelliteDates?.items || [];
    if (!items.length) {
      setDates([]);
      setVisibleDates([]);
      setSelectedDate("");
      return;
    }

    const uniqueDates = Array.from(
      new Map(
        items.map((item) => [
          toISODateString(item.date), // Use ISO string for sorting
          {
            date: formatDate(item.date),
            value: item.cloud_cover ?? 0,
            change: 0,
          },
        ])
      ).values()
    ).sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort descending (latest first)

    setDates(uniqueDates);
    setVisibleDates(uniqueDates.slice(0, VISIBLE_DATES_COUNT)); // Show latest dates first

    if (!selectedDate && uniqueDates.length)
      setSelectedDate(toISODateString(items[0].date));
  }, [satelliteDates]);

  const handleArrowClick = useCallback(
    (direction) => {
      if (!dates.length) return;
      const currentStart = dates.findIndex(
        (d) => d.date === visibleDates[0]?.date
      );
      if (
        direction === "next" &&
        currentStart + VISIBLE_DATES_COUNT < dates.length
      ) {
        setVisibleDates(
          dates.slice(
            currentStart + VISIBLE_DATES_COUNT,
            currentStart + VISIBLE_DATES_COUNT * 2
          )
        );
      } else if (direction === "prev" && currentStart > 0) {
        setVisibleDates(
          dates.slice(
            Math.max(0, currentStart - VISIBLE_DATES_COUNT),
            currentStart
          )
        );
      }
    },
    [dates, visibleDates]
  );

  const handleDateClick = useCallback(
    (date) => {
      const formatted = toISODateString(date);
      if (formatted && formatted !== selectedDate) setSelectedDate(formatted);
      setIsCalendarVisible(false);
    },
    [selectedDate]
  );

  const toggleCalendar = useCallback(
    () => setIsCalendarVisible((prev) => !prev),
    []
  );

  return (
    <div className="absolute bottom-0 w-full z-[1200] flex flex-col items-center font-sans py-[2px]">
      <SatelliteIndexList
        selectedFieldsDetials={selectedFieldsDetials}
        selectedDate={selectedDate}
      />
      <div className="flex items-center gap-2 w-full px-2 bg-[#5a7c6b] rounded-md">
        <div className="relative flex items-center">
          <button
            onClick={toggleCalendar}
            className="bg-transparent border-none cursor-pointer"
            aria-label="Toggle calendar"
          >
            <Calender />
          </button>
          {isCalendarVisible && (
            <div className="absolute top-[50px] z-10">
              <input
                type="date"
                className="p-2 border border-gray-300 rounded"
                onChange={(e) => handleDateClick(e.target.value)}
              />
            </div>
          )}
        </div>

        <button
          onClick={() => handleArrowClick("prev")}
          disabled={
            !dates.length ||
            dates.findIndex((d) => d.date === visibleDates[0]?.date) <= 0
          }
        >
          <LeftArrow />
        </button>

        <div className="flex gap-2 overflow-x-auto w-full justify-between py-[5px] scrollbar-hide scroll-smooth">
          {loading.satelliteDates
            ? Array.from({ length: VISIBLE_DATES_COUNT }).map((_, idx) => (
                <div
                  key={idx}
                  className="h-[30px] min-w-[90px] rounded-xl bg-[#344e41]/50 animate-pulse"
                />
              ))
            : visibleDates.map((dateItem) => (
                <div
                  key={dateItem.date}
                  className={`flex flex-col items-center text-white cursor-pointer rounded px-4 py-2.5 min-w-[90px] ${
                    formatDate(dateItem.date) === formatDate(selectedDate)
                      ? "bg-[#344e41]"
                      : "bg-transparent"
                  }`}
                  onClick={() => handleDateClick(dateItem.date)}
                  role="option"
                  aria-selected={
                    formatDate(dateItem.date) === formatDate(selectedDate)
                  }
                  tabIndex={0}
                >
                  <div className="font-semibold text-sm text-center whitespace-nowrap">
                    {dateItem.date}
                  </div>
                  <div className="text-xs text-center whitespace-nowrap">
                    {dateItem.value.toFixed(2)}% Cloud
                  </div>
                </div>
              ))}
        </div>

        <button
          onClick={() => handleArrowClick("next")}
          disabled={
            !dates.length ||
            dates.findIndex((d) => d.date === visibleDates[0]?.date) +
              VISIBLE_DATES_COUNT >=
              dates.length
          }
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
