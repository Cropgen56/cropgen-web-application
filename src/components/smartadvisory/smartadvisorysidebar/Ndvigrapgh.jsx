import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { FiInfo } from "react-icons/fi";
import { MdDownload } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { fetchIndexTimeSeriesSummary } from "../../../redux/slices/satelliteSlice";
import {
  getDaysAgo,
  getOneYearBefore,
  getTodayDate,
} from "../../../utility/formatDate";

const NDVIChartCard = ({ selectedField }) => {
  const dispatch = useDispatch();
  
  // Get data from Redux
  const { indexTimeSeriesSummary = null, loading } = useSelector(
    (state) => state.satellite
  ) || {};

  const [index, setIndex] = useState("NDVI");

  // Scroll ref for drag functionality
  const scrollRef = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  // Get field geometry and sowing date
  const fieldGeometry = selectedField?.field;
  const sowingDate = selectedField?.sowingDate;

  // Fetch NDVI data when field changes
  useEffect(() => {
    if (!fieldGeometry || !sowingDate) {
      console.log("Missing field geometry or sowing date");
      return;
    }

    const params = {
      startDate: getOneYearBefore(getTodayDate()),
      endDate: getTodayDate(),
      geometry: fieldGeometry,
      index,
    };
    
    dispatch(fetchIndexTimeSeriesSummary(params));
  }, [dispatch, fieldGeometry, sowingDate, index]);

  // Process chart data
  const chartData = useMemo(() => {
    let timeseries =
      indexTimeSeriesSummary?.data?.timeseries ||
      indexTimeSeriesSummary?.timeseries ||
      (Array.isArray(indexTimeSeriesSummary) ? indexTimeSeriesSummary : []);

    if (!Array.isArray(timeseries) || timeseries.length === 0) {
      return [];
    }

    return timeseries.map((item) => ({
      date: new Date(item.date).toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
      }),
      [index]: parseFloat(item.value?.toFixed(2) || 0),
      rawDate: item.date,
    }));
  }, [indexTimeSeriesSummary, index]);

  // Calculate summary statistics
  const summaryData = useMemo(() => {
    const summary =
      indexTimeSeriesSummary?.data?.summary ||
      indexTimeSeriesSummary?.summary ||
      {};
    const timestamp = indexTimeSeriesSummary?.timestamp || null;

    const { min = 0, mean = 0, max = 0 } = summary;

    // Calculate change (difference between last two values)
    let change = 0;
    if (chartData.length >= 2) {
      const lastValue = chartData[chartData.length - 1]?.[index] || 0;
      const prevValue = chartData[chartData.length - 2]?.[index] || 0;
      change = lastValue - prevValue;
    }

    return { min, mean, max, timestamp, change };
  }, [indexTimeSeriesSummary, chartData, index]);

  // Handle index change
  const handleIndexChange = useCallback((e) => setIndex(e.target.value), []);

  // Drag scroll handlers
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleMouseDown = (e) => {
      isDragging.current = true;
      startX.current = e.pageX - el.offsetLeft;
      scrollLeft.current = el.scrollLeft;
      el.style.cursor = "grabbing";
    };

    const handleMouseLeave = () => {
      if (isDragging.current) {
        isDragging.current = false;
        el.style.cursor = "grab";
      }
    };

    const handleMouseUp = () => {
      if (isDragging.current) {
        isDragging.current = false;
        el.style.cursor = "grab";
      }
    };

    const handleMouseMove = (e) => {
      if (!isDragging.current) return;
      e.preventDefault();
      const x = e.pageX - el.offsetLeft;
      const walk = x - startX.current;
      el.scrollLeft = scrollLeft.current - walk;
    };

    el.addEventListener("mousedown", handleMouseDown);
    el.addEventListener("mouseleave", handleMouseLeave);
    el.addEventListener("mouseup", handleMouseUp);
    el.addEventListener("mousemove", handleMouseMove);

    return () => {
      el.removeEventListener("mousedown", handleMouseDown);
      el.removeEventListener("mouseleave", handleMouseLeave);
      el.removeEventListener("mouseup", handleMouseUp);
      el.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const isLoading = loading?.indexTimeSeriesSummary || false;
  const hasData = chartData.length > 0;

  // Format change value for display
  const changeDisplay = summaryData.change >= 0 
    ? `+${summaryData.change.toFixed(2)}` 
    : summaryData.change.toFixed(2);

  const changeColor = summaryData.change >= 0 ? "text-[#86D72F]" : "text-red-400";
  const changeBgColor = summaryData.change >= 0 ? "bg-[#47664D]" : "bg-red-900/30";

  // No field selected state
  if (!selectedField) {
    return (
      <div className="w-full bg-[#2C4C3B] rounded-lg p-4 text-white">
        <h2 className="text-2xl font-bold text-[#86D72F] mb-4">NDVI</h2>
        <div className="h-[200px] flex items-center justify-center text-gray-300">
          <div className="text-center">
            <p>No field selected</p>
            <p className="text-sm text-gray-400 mt-1">
              Select a field to view NDVI data
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#2C4C3B] rounded-lg px-3 py-4 text-white">
      {/* Header Row */}
      <div className="flex flex-col md:flex-row justify-between gap-6">
        {/* Left: NDVI Info */}
        <div className="w-full md:w-[35%] flex flex-col gap-3">
          {/* Index Selector */}
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-3xl lg:text-4xl font-bold text-[#86D72F]">{index}</h2>
            <select
              value={index}
              onChange={handleIndexChange}
              className="bg-[#47664D] text-white rounded-md px-3 py-1 text-sm border border-[#5a8060] focus:outline-none focus:border-[#86D72F]"
            >
              <option value="NDVI">NDVI</option>
              <option value="EVI">EVI</option>
              <option value="SAVI">SAVI</option>
              <option value="SUCROSE">SUCROSE</option>
            </select>
          </div>

          {/* Change Value */}
          <div className={`${changeBgColor} ${changeColor} px-4 py-2 rounded-md text-xl font-semibold w-fit`}>
            {isLoading ? "..." : changeDisplay}
          </div>

          {/* Last Update */}
          <p className="text-sm text-gray-300">
            {summaryData.timestamp
              ? `Last Update ${getDaysAgo(summaryData.timestamp)} days Ago`
              : "Last Update N/A"}
          </p>

          {/* Field Name */}
          <p className="text-xs text-gray-400">
            Field: {selectedField?.fieldName || selectedField?.farmName || "Unknown"}
          </p>

          {/* Summary Stats */}
          {hasData && (
            <div className="bg-[#365541] border border-gray-400 p-3 rounded-md text-sm">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-gray-400 text-xs">Min</p>
                  <p className="font-semibold text-[#86D72F]">
                    {summaryData.min?.toFixed(2) || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Mean</p>
                  <p className="font-semibold text-[#86D72F]">
                    {summaryData.mean?.toFixed(2) || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Max</p>
                  <p className="font-semibold text-[#86D72F]">
                    {summaryData.max?.toFixed(2) || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Chart and Info Cards */}
        <div className="w-full md:w-[65%] flex flex-col justify-between">
          {/* Chart */}
          <div className="relative w-full">
            {isLoading ? (
              <div className="h-[200px] flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#86D72F]"></div>
                  <span className="text-gray-300">Loading {index} data...</span>
                </div>
              </div>
            ) : !hasData ? (
              <div className="h-[200px] flex items-center justify-center">
                <div className="text-center text-gray-300">
                  <p>No {index} data available</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Try selecting a different time range
                  </p>
                </div>
              </div>
            ) : (
              <div
                ref={scrollRef}
                className="overflow-x-auto cursor-grab active:cursor-grabbing no-scrollbar"
              >
                <div style={{ minWidth: Math.max(chartData.length * 40, 500) }}>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart
                      data={chartData}
                      margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid stroke="#3a5947" strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        stroke="#ccc"
                        fontSize={12}
                        interval={Math.floor(chartData.length / 8)}
                      />
                      <YAxis
                        stroke="#ccc"
                        fontSize={12}
                        domain={[0, 1]}
                        tickFormatter={(value) => value.toFixed(1)}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#47664D",
                          border: "none",
                          color: "white",
                          borderRadius: "8px",
                        }}
                        labelStyle={{ color: "white" }}
                        formatter={(value) => [value.toFixed(3), index]}
                        labelFormatter={(label) => `Date: ${label}`}
                      />
                      <Legend
                        verticalAlign="top"
                        align="right"
                        wrapperStyle={{ paddingBottom: 10 }}
                      />
                      <Line
                        type="monotone"
                        dataKey={index}
                        stroke="#86D72F"
                        dot={{ r: 3, fill: "#86D72F" }}
                        strokeWidth={2}
                        activeDot={{ r: 5, fill: "#5cb020" }}
                        connectNulls
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Download Button */}
            {hasData && (
              <div className="absolute top-0 right-0 pr-4 pt-2">
                <MdDownload
                  className="text-xl cursor-pointer hover:text-[#86D72F] transition-colors"
                  title="Download data"
                />
              </div>
            )}
          </div>

          {/* Compact Info Cards under Chart */}
          <div className="grid grid-cols-1 md:grid-cols-3 rounded-md overflow-hidden text-[11px] leading-snug text-white">
            {/* Card 1 */}
            <div className="bg-[#5B7C6F] p-2 flex flex-col justify-between border-r border-[#3e5c4a]">
              <p className="font-semibold border-b border-[#3e5c4a] mb-1 text-xs">
                Low {index} in Specific Areas
              </p>
              <p className="pl-3">
                • Check for irrigation leaks, clogged drippers, or uneven
                fertilizer distribution.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-[#5B7C6F] p-2 flex flex-col justify-between border-r border-[#3e5c4a]">
              <p className="font-semibold border-b border-[#3e5c4a] pb-1 mb-1">
                Sudden {index} Drops
              </p>
              <p className="pl-3">
                • Investigate pest outbreaks or extreme weather events like
                hailstorms or drought.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-[#5B7C6F] p-2 flex flex-col justify-between">
              <p className="font-semibold border-b border-[#3e5c4a] pb-1 mb-1">
                Consistently Low {index}
              </p>
              <p className="pl-3">
                • May indicate soil fertility issues. Conduct soil tests for
                corrective measures.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NDVIChartCard;