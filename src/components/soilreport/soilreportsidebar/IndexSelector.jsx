import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSatelliteDates } from "../../../redux/slices/satelliteSlice";
import { LeftArrow, RightArrow } from "../../../assets/DashboardIcons";

const VISIBLE_COUNT = 6;
const formatDate = (date) => {
  try {
    const d = new Date(date);
    return `${d.getDate().toString().padStart(2, "0")} ${d.toLocaleString("en-US", { month: "short" })}/${d.getFullYear()}`;
  } catch {
    return "";
  }
};

const toISODate = (date) => {
  try {
    const d = new Date(date);
    d.setHours(12, 0, 0, 0);
    return d.toISOString().split("T")[0];
  } catch {
    return "";
  }
};

const IndexDateStrip = ({ selectedFieldsDetials = [] }) => {
  const dispatch = useDispatch();
  const { satelliteDates = [] } = useSelector((state) => state.satellite);

  const [dates, setDates] = useState([]);
  const [visibleDates, setVisibleDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");

  const coordinates = useMemo(() => {
    return selectedFieldsDetials[0]?.field?.map(({ lat, lng }) => [lng, lat]) ?? [];
  }, [selectedFieldsDetials]);

  useEffect(() => {
    if (coordinates?.length) {
      dispatch(fetchSatelliteDates([coordinates]));
    }
  }, [coordinates]);

  useEffect(() => {
    const uniqueDates = new Map();

    satelliteDates.forEach((item) => {
      const label = formatDate(item.date);
      if (!uniqueDates.has(label)) {
        uniqueDates.set(label, {
          date: label,
          value: item.cloud_percentage ?? 0,
          change: parseFloat((Math.random() * 0.3 - 0.15).toFixed(2)), // Dummy
        });
      }
    });

    const finalDates = Array.from(uniqueDates.values());
    setDates(finalDates);
    setVisibleDates(finalDates.slice(0, VISIBLE_COUNT));
    if (finalDates.length) {
      setSelectedDate(toISODate(satelliteDates[0].date));
    }
  }, [satelliteDates]);

  const handleScroll = (direction) => {
    const start = dates.findIndex((d) => d.date === visibleDates[0]?.date);
    if (direction === "next" && start + VISIBLE_COUNT < dates.length) {
      setVisibleDates(dates.slice(start + VISIBLE_COUNT, start + VISIBLE_COUNT * 2));
    } else if (direction === "prev" && start > 0) {
      setVisibleDates(dates.slice(Math.max(0, start - VISIBLE_COUNT), start));
    }
  };

  return (
    <div className="w-full bg-[#5a7c6b] text-white rounded-md px-2 py-2 flex items-center justify-between overflow-x-auto no-scrollbar shadow-xl">
      {/* Left Arrow */}
      <button
        onClick={() => handleScroll("prev")}
        disabled={dates.findIndex((d) => d.date === visibleDates[0]?.date) <= 0}
        className="p-2 disabled:opacity-50"
      >
        <LeftArrow />
      </button>

      {/* Dates */}
      <div className="flex flex-1 gap-5 justify-center overflow-x-auto">
        {visibleDates.map((d, i) => {
          const isSelected = formatDate(selectedDate) === d.date;
          return (
            <div
              key={i}
              className={`min-w-[100px] h-[60px] flex flex-col items-center justify-center rounded px-2 py-1 cursor-pointer ${
                isSelected ? "bg-[#2e3e33]" : "bg-transparent"
              }`}
              onClick={() => setSelectedDate(toISODate(d.date))}
            >
              <div className="text-sm font-bold">{d.date}</div>
              <div className="text-xs flex justify-between w-full gap-2">
                <div>{d.value.toFixed(2)}</div>
                <div className={d.change >= 0 ? "text-green-400" : "text-red-400"}>
                  {d.change >= 0 ? `+${d.change}` : d.change}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Right Arrow */}
      <button
        onClick={() => handleScroll("next")}
        disabled={
          dates.findIndex((d) => d.date === visibleDates[0]?.date) + VISIBLE_COUNT >= dates.length
        }
        className="p-2 disabled:opacity-50"
      >
        <RightArrow />
      </button>
    </div>
  );
};

export default IndexDateStrip;
