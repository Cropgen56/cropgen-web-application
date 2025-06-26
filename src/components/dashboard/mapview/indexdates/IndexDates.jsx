import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Calender,
  LeftArrow,
  RightArrow,
} from "../../../../assets/DashboardIcons";
import SatelliteIndexList from "../satellitedata/SatelliteIndexList";
import { fetchSatelliteDates } from "../../../../redux/slices/satelliteSlice";

const VISIBLE_DATES_COUNT = 6;

const DATE_FORMAT_OPTIONS = {
  day: "numeric",
  month: "short",
  year: "numeric",
};

const formatDate = (date) => {
  try {
    return new Date(date).toLocaleDateString("en-US", DATE_FORMAT_OPTIONS);
  } catch {
    return "";
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

const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

const areArraysEqual = (arr1, arr2) => {
  if (!arr1 || !arr2 || arr1.length !== arr2.length) return false;
  return arr1.every((item, index) =>
    Array.isArray(item) && Array.isArray(arr2[index])
      ? item.every((val, i) => val === arr2[index][i])
      : item === arr2[index]
  );
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
    return (
      selectedFieldsDetials[0]?.field?.map(({ lat, lng }) => [lng, lat]) ?? []
    );
  }, [selectedFieldsDetials]);

  const debouncedFetchSatelliteDates = useMemo(
    () =>
      debounce((coords) => {
        if (coords?.length > 0) {
          dispatch(fetchSatelliteDates([coords]));
        }
      }, 500),
    [dispatch]
  );

  useEffect(() => {
    debouncedFetchSatelliteDates(coordinates);
    return () => debouncedFetchSatelliteDates.cancel?.();
  }, [coordinates, debouncedFetchSatelliteDates]);

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

    if (
      visibleDates.length === 0 ||
      !visibleDates.every((vd) =>
        processedDates.some((pd) => pd.date === vd.date)
      )
    ) {
      setVisibleDates(processedDates.slice(0, VISIBLE_DATES_COUNT));
    }

    if (processedDates.length > 0 && !selectedDate) {
      setSelectedDate(toISODateString(satelliteDates[0].date));
    }
  }, [satelliteDates]);

  const handleArrowClick = useCallback(
    (direction) => {
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

  const handleDateClick = useCallback((date) => {
    const formattedDate = toISODateString(date);
    if (formattedDate) {
      setSelectedDate(formattedDate);
    }
  }, []);

  const toggleCalendar = useCallback(() => {
    setIsCalendarVisible((prev) => !prev);
  }, []);

  return (
    <div className="absolute bottom-0 w-full flex flex-col items-center font-sans z-[1000] py-1">
      <SatelliteIndexList
        selectedFieldsDetials={selectedFieldsDetials}
        selectedDate={selectedDate}
      />
      <div className="flex items-center bg-[#5a7c6b] rounded gap-2 px-2 w-[98%]">
        {loading.satelliteDates ? (
          <div className="w-full h-2 bg-gray-300 rounded overflow-hidden my-4 relative">
            <div className="w-1/3 h-full bg-green-600 rounded animate-pulse absolute inset-0" />
          </div>
        ) : (
          <>
            <div className="relative flex items-center">
              <button
                type="button"
                onClick={toggleCalendar}
                className="bg-transparent border-none cursor-pointer"
              >
                <Calender />
              </button>
              {isCalendarVisible && (
                <div className="absolute top-10 z-10">
                  <input
                    type="date"
                    className="p-2 border border-gray-300 rounded"
                    onChange={(e) => handleDateClick(e.target.value)}
                  />
                </div>
              )}
            </div>
            <div className="w-px h-8 bg-gray-300 mx-2" />
            <button
              type="button"
              onClick={() => handleArrowClick("prev")}
              disabled={
                !dates.length ||
                dates.findIndex((d) => d.date === visibleDates[0]?.date) <= 0
              }
              className="bg-transparent border-none disabled:opacity-50"
            >
              <LeftArrow />
            </button>
            <div className="w-px h-8 bg-gray-300 mx-2" />

            <div className="flex gap-2 overflow-x-auto">
              {visibleDates.map((dateItem, index) => {
                const isSelected =
                  formatDate(dateItem.date) === formatDate(selectedDate);
                return (
                  <div
                    key={`${dateItem.date}-${index}`}
                    className={`flex flex-col text-center rounded p-1 px-3 text-white text-sm font-medium cursor-pointer ${
                      isSelected ? "bg-[#344e41]" : "bg-transparent"
                    }`}
                    onClick={() => handleDateClick(dateItem.date)}
                    tabIndex={0}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <div className="font-bold">{dateItem.date}</div>
                    <div className="flex justify-between text-xs w-full">
                      <span>{dateItem.value.toFixed(2)}</span>
                      <span
                        className={`${
                          dateItem.change >= 0 ? "text-green-500" : "text-red-500"
                        }`}
                      >
                        {dateItem.change >= 0
                          ? `+${dateItem.change}`
                          : dateItem.change}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="w-px h-8 bg-gray-300 mx-2" />
            <button
              type="button"
              onClick={() => handleArrowClick("next")}
              disabled={
                !dates.length ||
                dates.findIndex((d) => d.date === visibleDates[0]?.date) +
                  VISIBLE_DATES_COUNT >=
                  dates.length
              }
              className="bg-transparent border-none disabled:opacity-50"
            >
              <RightArrow />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default memo(IndexSelector, (prevProps, nextProps) => {
  return areArraysEqual(
    prevProps.selectedFieldsDetials[0]?.field,
    nextProps.selectedFieldsDetials[0]?.field
  );
});
