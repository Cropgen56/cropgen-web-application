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
const DATE_FORMAT_OPTIONS = { day: "numeric", month: "short", year: "numeric" };
const DEBOUNCE_DELAY = 500;

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

const areArraysEqual = (arr1, arr2) => {
  if (!arr1 || !arr2 || arr1.length !== arr2.length) return false;
  return arr1.every((item, index) =>
    Array.isArray(item) && Array.isArray(arr2[index])
      ? item.every((val, i) => val === arr2[index][i])
      : item === arr2[index]
  );
};

const debounce = (func, delay) => {
  let timeoutId;
  const debounced = (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
  debounced.cancel = () => clearTimeout(timeoutId);
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
      }, DEBOUNCE_DELAY),
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
    <div className="absolute bottom-0 w-full z-[1000] flex flex-col items-center font-sans py-[2px]">
      <SatelliteIndexList
        selectedFieldsDetials={selectedFieldsDetials}
        selectedDate={selectedDate}
      />
      <div className="flex items-center gap-2 w-full px-2 bg-[#5a7c6b] rounded-md">
        {loading.satelliteDates ? (
          <div className="w-full h-2 bg-gray-300 rounded overflow-hidden relative my-4">
            <div className="w-[30%] h-full bg-green-600 rounded animate-[loaderAnimation_1.5s_ease-in-out_infinite]" />
          </div>
        ) : (
          <>
            <div className="relative flex items-center">
              <button
                type="button"
                className="bg-transparent border-none cursor-pointer"
                onClick={toggleCalendar}
                aria-label="Toggle calendar"
                aria-expanded={isCalendarVisible}
              >
                <Calender />
              </button>
              {isCalendarVisible && (
                <div className="absolute top-[50px] z-10">
                  <input
                    type="date"
                    className="p-2 border border-gray-300 rounded"
                    onChange={(e) => handleDateClick(e.target.value)}
                    aria-label="Select date"
                  />
                </div>
              )}
            </div>

            <div className="w-[1px] h-8 bg-gray-300 mx-2" aria-hidden="true" />

            <button
              type="button"
              className="bg-transparent border-none cursor-pointer p-2 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => handleArrowClick("prev")}
              aria-label="Previous dates"
              disabled={
                !dates.length ||
                dates.findIndex((d) => d.date === visibleDates[0]?.date) <= 0
              }
            >
              <LeftArrow />
            </button>

            <div className="w-[1px] h-8 bg-gray-300 mx-2" aria-hidden="true" />

            <div
              className="flex gap-2 overflow-x-auto w-full justify-between py-[5px] scrollbar-hide"
              role="listbox"
              aria-label="Available dates"
            >
              {visibleDates.map((dateItem, index) => {
                const isSelected =
                  formatDate(dateItem.date) === formatDate(selectedDate);
                return (
                  <div
                    key={`${dateItem.date}-${index}`}
                    className={`flex flex-col items-center text-white font-medium cursor-pointer rounded px-2 py-[10px] h-[60px] min-w-[90px]
                      ${isSelected ? "bg-[#344e41]" : "bg-transparent"}`}
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
                    <div className="font-bold text-sm text-center whitespace-nowrap">
                      {dateItem.date}
                    </div>
                    <div className="flex justify-between w-full text-xs gap-2">
                      <div>{dateItem.value.toFixed(2)}</div>
                      <div
                        className={`${
                          dateItem.change >= 0
                            ? "text-green-600"
                            : "text-red-600"
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

            <div className="w-[1px] h-8 bg-gray-300 mx-2" aria-hidden="true" />

            <button
              type="button"
              className="bg-transparent border-none cursor-pointer p-2 disabled:opacity-50 disabled:cursor-not-allowed"
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

export default memo(IndexSelector, (prevProps, nextProps) => {
  return areArraysEqual(
    prevProps.selectedFieldsDetials[0]?.field,
    nextProps.selectedFieldsDetials[0]?.field
  );
});
