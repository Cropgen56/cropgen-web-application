import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Calender,
  LeftArrow,
  RightArrow,
} from "../../assets/DashboardIcons";
import SmartAdvisorySatelliteIndexList from "./SmartAdvisorySatelliteIndexList";
import {
  fetchSatelliteDates,
  clearSatelliteDates,
} from "../../redux/slices/satelliteSlice";

const DATE_FORMAT_OPTIONS = { day: "numeric", month: "short", year: "numeric" };
const DEBOUNCE_DELAY = 500;
const CLOUD_COVER_THRESHOLD = 5;

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

/** Same as dashboard `IndexDates`: prefer recent scenes with low cloud. */
const pickLowCloudIsoDate = (allDates, targetIsoDate, threshold) => {
  if (!Array.isArray(allDates) || allDates.length === 0) return targetIsoDate;

  const targetIndex = allDates.findIndex((d) => d.isoDate === targetIsoDate);
  const startIndex = targetIndex === -1 ? 0 : targetIndex;

  for (let i = startIndex; i < allDates.length; i++) {
    const cloud = allDates[i]?.value ?? 0;
    if (cloud <= threshold) return allDates[i].isoDate;
  }

  let best = allDates[startIndex];
  for (let i = startIndex + 1; i < allDates.length; i++) {
    const cloud = allDates[i]?.value ?? 0;
    if ((best?.value ?? Infinity) > cloud) best = allDates[i];
  }
  return best?.isoDate ?? targetIsoDate;
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

const SmartAdvisoryIndexDates = ({ selectedFieldsDetials = [] }) => {
  const dispatch = useDispatch();
  const satelliteDates = useSelector((state) => state.satellite.satelliteDates);
  const loadingSatelliteDates = useSelector(
    (state) => state.satellite.loading.satelliteDates,
  );

  const [dates, setDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [visibleDates, setVisibleDates] = useState([]);
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);
  const [visibleCount, setVisibleCount] = useState(6);

  const currentFieldId = selectedFieldsDetials[0]?._id;
  const prevFieldIdRef = useRef(currentFieldId);

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

  const debouncedFetch = useMemo(
    () =>
      debounce((coords) => {
        if (coords.length) {
          dispatch(fetchSatelliteDates({ geometry: coords }));
        }
      }, DEBOUNCE_DELAY),
    [dispatch],
  );

  useEffect(() => {
    if (currentFieldId && currentFieldId !== prevFieldIdRef.current) {
      prevFieldIdRef.current = currentFieldId;
      setSelectedDate("");
      setDates([]);
      setVisibleDates([]);
      dispatch(clearSatelliteDates());
    }
  }, [currentFieldId, dispatch]);

  useEffect(() => {
    if (coordinates.length) debouncedFetch(coordinates);
    return () => debouncedFetch.cancel();
  }, [coordinates, debouncedFetch]);

  useEffect(() => {
    const handleResize = () => {
      setVisibleCount(window.innerWidth < 1024 ? 4 : 5);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const items = satelliteDates?.items || [];

    if (!items.length) {
      setDates([]);
      setVisibleDates([]);
      setSelectedDate("");
      return;
    }

    const dateMap = new Map();
    items.forEach((item) => {
      const isoDate = toISODateString(item.date);
      if (isoDate && !dateMap.has(isoDate)) {
        dateMap.set(isoDate, {
          date: formatDate(item.date),
          isoDate,
          value: item.cloud_cover ?? 0,
        });
      }
    });

    const uniqueDates = Array.from(dateMap.values()).sort(
      (a, b) => new Date(b.isoDate) - new Date(a.isoDate),
    );

    setDates(uniqueDates);
    setVisibleDates(uniqueDates.slice(0, visibleCount));

    setSelectedDate((prev) => {
      if (prev) return prev;
      if (!uniqueDates.length) return "";
      return pickLowCloudIsoDate(
        uniqueDates,
        uniqueDates[0].isoDate,
        CLOUD_COVER_THRESHOLD,
      );
    });
  }, [satelliteDates, visibleCount]);

  useEffect(() => {
    if (!selectedDate || dates.length === 0) return;
    const selectedObj = dates.find((d) => d.isoDate === selectedDate);
    const selectedCloud = selectedObj?.value ?? 0;
    if (selectedCloud > CLOUD_COVER_THRESHOLD) {
      const fallbackIso = pickLowCloudIsoDate(
        dates,
        selectedDate,
        CLOUD_COVER_THRESHOLD,
      );
      if (fallbackIso && fallbackIso !== selectedDate) {
        setSelectedDate(fallbackIso);
      }
    }
  }, [selectedDate, dates]);

  const handleArrowClick = useCallback(
    (direction) => {
      if (!dates.length) return;
      const currentStart = dates.findIndex(
        (d) => d.isoDate === visibleDates[0]?.isoDate,
      );
      if (direction === "next" && currentStart + visibleCount < dates.length) {
        setVisibleDates(
          dates.slice(
            currentStart + visibleCount,
            currentStart + visibleCount * 2,
          ),
        );
      } else if (direction === "prev" && currentStart > 0) {
        setVisibleDates(
          dates.slice(Math.max(0, currentStart - visibleCount), currentStart),
        );
      }
    },
    [dates, visibleDates, visibleCount],
  );

  const handleDateClick = useCallback((isoOrRaw) => {
    const formatted = toISODateString(isoOrRaw);
    if (formatted && formatted !== selectedDate) setSelectedDate(formatted);
    setIsCalendarVisible(false);
  }, [selectedDate]);

  const toggleCalendar = useCallback(
    () => setIsCalendarVisible((prev) => !prev),
    [],
  );

  return (
    <div className="absolute bottom-0 w-full z-[1200] flex flex-col items-center font-sans py-[2px]">
      <SmartAdvisorySatelliteIndexList
        selectedFieldsDetials={selectedFieldsDetials}
        selectedDate={selectedDate}
      />
      <div className="flex items-center gap-2 w-full px-2 bg-ember-surface rounded-md relative">
        <div className="relative flex items-center">
          <button
            type="button"
            onClick={toggleCalendar}
            className={`bg-transparent border-none cursor-pointer p-1 rounded transition-colors ${
              isCalendarVisible
                ? "bg-ember-sidebar"
                : "hover:bg-ember-sidebar/50"
            }`}
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
          type="button"
          onClick={() => handleArrowClick("prev")}
          disabled={
            !dates.length ||
            dates.findIndex((d) => d.isoDate === visibleDates[0]?.isoDate) <= 0
          }
        >
          <LeftArrow />
        </button>

        <div className="flex gap-2 overflow-x-auto w-full justify-between py-[5px] no-scrollbar scroll-smooth">
          {loadingSatelliteDates
            ? Array.from({ length: visibleCount }).map((_, idx) => (
                <div
                  key={idx}
                  className="flex flex-col items-center rounded px-4 py-2.5 min-w-[90px] bg-ember-sidebar/50 animate-pulse"
                >
                  <div className="h-3 w-16 bg-ember-surface rounded mb-1.5" />
                  <div className="h-3 w-14 bg-ember-surface rounded" />
                </div>
              ))
            : visibleDates.map((dateItem) => (
                <div
                  key={dateItem.isoDate}
                  className={`flex flex-col items-center text-white cursor-pointer rounded px-4 py-2.5 min-w-[90px] transition-colors ${
                    dateItem.isoDate === selectedDate
                      ? "bg-ember-sidebar brightness-75 shadow-inner"
                      : "bg-transparent hover:bg-ember-sidebar/50"
                  }`}
                  onClick={() => handleDateClick(dateItem.isoDate)}
                  role="option"
                  aria-selected={dateItem.isoDate === selectedDate}
                  tabIndex={0}
                >
                  <div className="font-semibold text-xs text-center whitespace-nowrap">
                    {dateItem.date}
                  </div>
                  <div className="text-xs text-center whitespace-nowrap">
                    {dateItem.value.toFixed(2)}% Cloud
                  </div>
                </div>
              ))}
        </div>

        <button
          type="button"
          onClick={() => handleArrowClick("next")}
          disabled={
            !dates.length ||
            dates.findIndex((d) => d.isoDate === visibleDates[0]?.isoDate) +
              visibleCount >=
              dates.length
          }
        >
          <RightArrow />
        </button>
      </div>
    </div>
  );
};

export default SmartAdvisoryIndexDates;
