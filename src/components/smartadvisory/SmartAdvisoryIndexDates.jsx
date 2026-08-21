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
  setSelectedSatellite,
} from "../../redux/slices/satelliteSlice";
import {
  SATELLITE_OPTIONS,
  DEFAULT_SATELLITE,
  isSentinel1,
} from "../../constants/satelliteIndices";

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
  const selectedSatellite = useSelector(
    (state) => state.satellite.selectedSatellite || DEFAULT_SATELLITE,
  );
  const satellite = selectedSatellite || DEFAULT_SATELLITE;

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
      debounce((coords, sat) => {
        if (coords.length) {
          dispatch(fetchSatelliteDates({ geometry: coords, satellite: sat }));
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
    if (coordinates.length) debouncedFetch(coordinates, satellite);
    return () => debouncedFetch.cancel();
  }, [coordinates, satellite, debouncedFetch]);

  const handleSatelliteChange = useCallback(
    (event) => {
      const next = event.target.value;
      if (!next || next === satellite) return;
      setSelectedDate("");
      setDates([]);
      setVisibleDates([]);
      dispatch(setSelectedSatellite(next));
    },
    [satellite, dispatch],
  );

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
      <div className="flex items-center gap-2 w-full px-2 bg-ember-surface rounded-md">
        <div className="relative flex items-center gap-1.5">
          <select
            value={satellite}
            onChange={handleSatelliteChange}
            disabled={loadingSatelliteDates}
            className="bg-ember-sidebar text-white text-xs rounded px-2 py-1.5 border border-white/10 cursor-pointer outline-none hover:bg-ember-sidebar/80 disabled:opacity-50 max-w-[118px]"
            aria-label="Select satellite"
            title="Select satellite"
          >
            {SATELLITE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            type="button"
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
                  className="h-[30px] min-w-[80px] rounded-xl bg-ember-sidebar/50 animate-pulse"
                />
              ))
            : visibleDates.map((dateItem) => (
                <div
                  key={dateItem.isoDate}
                  className={`flex flex-col items-center text-white cursor-pointer rounded px-3 py-2 min-w-[80px] ${
                    dateItem.isoDate === selectedDate ? "bg-ember-sidebar" : "bg-transparent"
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
                    {isSentinel1(satellite) || dateItem.value == null
                      ? "0.00% Cloud"
                      : `${dateItem.value.toFixed(2)}% Cloud`}
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
