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

  // Validate that the geometry is a closed polygon
  const validateGeometry = (field) => {
    if (!field || field.length < 3) return false;
    const first = field[0];
    const last = field[field.length - 1];
    return first.lat === last.lat && first.lng === last.lng;
  };

  const coordinates = useMemo(() => {
    const field = selectedFieldsDetials[0]?.field;
    if (!field || field.length < 3) {
      console.warn("Invalid geometry provided: insufficient points", field);
      return [];
    }

    let coords = field.map(({ lat, lng }) => [lng, lat]);

    // If not closed, append the first coordinate to close the polygon
    if (!validateGeometry(field)) {
      coords = [...coords, coords[0]];
    }

    return coords;
  }, [selectedFieldsDetials]);

  const debouncedFetchSatelliteDates = useMemo(
    () =>
      debounce((coords) => {
        if (coords?.length > 0) {
          dispatch(
            fetchSatelliteDates({ geometry: coords, selectedFieldsDetials })
          );
        }
      }, DEBOUNCE_DELAY),
    [dispatch]
  );

  useEffect(() => {
    debouncedFetchSatelliteDates(coordinates);
    return () => debouncedFetchSatelliteDates.cancel?.();
  }, [coordinates, debouncedFetchSatelliteDates]);

  useEffect(() => {
    const items = satelliteDates?.items || [];
    if (!items.length) {
      if (dates.length !== 0) setDates([]);
      if (visibleDates.length !== 0) setVisibleDates([]);
      if (selectedDate !== "") setSelectedDate("");
      return;
    }

    const uniqueDatesMap = new Map();
    items.forEach((item) => {
      const formattedDate = formatDate(item.date);
      if (formattedDate && !uniqueDatesMap.has(formattedDate)) {
        uniqueDatesMap.set(formattedDate, {
          date: formattedDate,
          value: item.cloud_cover ?? 0, // Use cloud_cover
          change: 0,
        });
      }
    });

    const processedDates = Array.from(uniqueDatesMap.values());

    if (!areArraysEqual(dates, processedDates)) {
      setDates(processedDates);
    }

    if (
      processedDates.length > 0 &&
      (visibleDates.length === 0 ||
        !visibleDates.every((vd) =>
          processedDates.some((pd) => pd.date === vd.date)
        ))
    ) {
      setVisibleDates(processedDates.slice(0, VISIBLE_DATES_COUNT));
    }

    if (processedDates.length > 0 && !selectedDate) {
      setSelectedDate(toISODateString(items[0].date));
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

  const handleDateClick = useCallback(
    (date) => {
      const formattedDate = toISODateString(date);
      if (formattedDate && formattedDate !== selectedDate) {
        setSelectedDate(formattedDate);
        setIsCalendarVisible(false);
      }
    },
    [selectedDate]
  );

  const toggleCalendar = useCallback(() => {
    setIsCalendarVisible((prev) => !prev);
  }, []);

  return (
    <div className="absolute bottom-0 w-full z-[1200] flex flex-col items-center font-sans py-[2px]">
      <SatelliteIndexList
        selectedFieldsDetials={selectedFieldsDetials}
        selectedDate={selectedDate}
      />

      <div className="flex items-center gap-1 lg:gap-2 w-full px-2 bg-[#5a7c6b] rounded-md">
        {/* Calendar Button */}
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

        <div
          className="w-[1px] h-8 bg-gray-300 mx-1 lg:mx-2"
          aria-hidden="true"
        />

        {/* Prev Button */}
        <button
          type="button"
          className="bg-transparent border-none cursor-pointer py-0 lg:p-2 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => handleArrowClick("prev")}
          aria-label="Previous dates"
          disabled={
            !dates.length ||
            dates.findIndex((d) => d.date === visibleDates[0]?.date) <= 0
          }
        >
          <LeftArrow />
        </button>

        <div
          className="w-[1px] h-8 bg-gray-300 mx-1 lg:mx-2"
          aria-hidden="true"
        />

        {/* Dates / Skeleton */}
        <div
          className="flex gap-1 lg:gap-2 overflow-x-auto w-full justify-between py-[5px] scrollbar-hide no-scrollbar scroll-smooth"
          role="listbox"
          aria-label="Available dates"
        >
          {loading.satelliteDates
            ? Array.from({ length: VISIBLE_DATES_COUNT }).map((_, idx) => (
                <div
                  key={idx}
                  className="relative h-[30px] min-w-[90px] rounded-xl overflow-hidden bg-[#344e41]/50"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_1.5s_infinite]" />
                </div>
              ))
            : visibleDates.map((dateItem, index) => {
                const isSelected =
                  formatDate(dateItem.date) === formatDate(selectedDate);
                return (
                  <div
                    key={`${dateItem.date}-${index}`}
                    className={`flex flex-col items-center text-white cursor-pointer rounded px-4 py-2.5 h-auto min-w-[90px]
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
                    <div className="font-semibold text-xs lg:text-sm text-center whitespace-nowrap">
                      {dateItem.date}
                    </div>
                    <div className="text-xs text-center whitespace-nowrap">
                      {dateItem.value.toFixed(2)}% Cloud
                    </div>
                  </div>
                );
              })}
        </div>

        <div
          className="w-[1px] h-8 bg-gray-300 mx-1 lg:mx-2"
          aria-hidden="true"
        />

        {/* Next Button */}
        <button
          type="button"
          className="bg-transparent border-none cursor-pointer py-0 lg:p-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
