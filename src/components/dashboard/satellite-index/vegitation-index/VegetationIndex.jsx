import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useDispatch, useSelector } from "react-redux";
import { fetchIndexTimeSeriesSummary } from "../../../../redux/slices/satelliteSlice";
import { getDaysAgo, getOneYearBefore, getTodayDate } from "../../../../utility/formatDate";
import LoadingSpinner from "../../../comman/loading/LoadingSpinner";
import { Info } from "lucide-react";

const NDVI_COLOR_MAIN = "#22c55e";
const NDVI_COLOR_LIGHT = "#16a34a";

const NdviGraph = ({ selectedFieldsDetials }) => {
  const { sowingDate, field } = selectedFieldsDetials?.[0] || {};
  const { indexTimeSeriesSummary = null, loading } = useSelector(state => state.satellite) || {};

  const dispatch = useDispatch();
  const [index, setIndex] = useState("NDVI");

  const scrollRef = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const fetchParams = useMemo(() => {
    if (!field || !sowingDate) return null;
    return {
      startDate: getOneYearBefore(getTodayDate()),
      endDate: getTodayDate(),
      geometry: field,
      index,
    };
  }, [field, sowingDate, index]);

  useEffect(() => {
    if (!fetchParams) return;
    dispatch(fetchIndexTimeSeriesSummary(fetchParams));
  }, [dispatch, fetchParams]);

  const chartData = useMemo(() => {
    let timeseries = indexTimeSeriesSummary?.data?.timeseries ||
      indexTimeSeriesSummary?.timeseries ||
      (Array.isArray(indexTimeSeriesSummary) ? indexTimeSeriesSummary : []);
    if (!Array.isArray(timeseries)) return [];

    return timeseries.map(item => ({
      date: new Date(item.date).toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
      }),
      [index]: item.value,
    }));
  }, [indexTimeSeriesSummary, index]);

  const summaryData = useMemo(() => {
    const summary = indexTimeSeriesSummary?.data?.summary ||
      indexTimeSeriesSummary?.summary || { min: -0.1, mean: 0.2, max: 0.4 };
    const timestamp = indexTimeSeriesSummary?.timestamp || null;
    const { min = -0.1, mean = 0.2, max = 0.4 } = summary;
    return { min, mean, max, timestamp };
  }, [indexTimeSeriesSummary]);

  const yAxisConfig = useMemo(() => {
    const { min, mean, max } = summaryData;
    const domain = [
      Math.floor(min * 10) / 10 - 0.1,
      Math.ceil(max * 10) / 10 + 0.1,
    ];
    const ticks = [min, mean, max, ...domain].sort((a, b) => a - b).filter((v, i, a) => a.indexOf(v) === i);
    return { domain, ticks };
  }, [summaryData]);

  const chartConfig = useMemo(() => {
    const length = chartData.length;
    return {
      width: Math.max(length * 30, 600),
      interval: 3,
    };
  }, [chartData.length]);

  const tickFormatter = useCallback(value => {
    const { min, mean, max } = summaryData;
    if (Math.abs(value - min) < 0.001) return `Min: ${value.toFixed(3)}`;
    if (Math.abs(value - mean) < 0.001) return `Mean: ${value.toFixed(3)}`;
    if (Math.abs(value - max) < 0.001) return `Max: ${value.toFixed(3)}`;
    return value.toFixed(2);
  }, [summaryData]);

  const tooltipFormatter = useCallback(value => [value.toFixed(3), index], [index]);
  const labelFormatter = useCallback(label => `Date: ${label}`, []);
  const handleIndexChange = useCallback(e => setIndex(e.target.value), []);

  // Drag scroll
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleMouseDown = e => {
      isDragging.current = true;
      startX.current = e.pageX - el.offsetLeft;
      scrollLeft.current = el.scrollLeft;
    };
    const handleMouseUp = () => { isDragging.current = false; };
    const handleMouseLeave = () => { isDragging.current = false; };
    const handleMouseMove = e => {
      if (!isDragging.current) return;
      e.preventDefault();
      const x = e.pageX - el.offsetLeft;
      const walk = x - startX.current;
      el.scrollLeft = scrollLeft.current - walk;
    };

    el.addEventListener("mousedown", handleMouseDown);
    el.addEventListener("mouseup", handleMouseUp);
    el.addEventListener("mouseleave", handleMouseLeave);
    el.addEventListener("mousemove", handleMouseMove);

    return () => {
      el.removeEventListener("mousedown", handleMouseDown);
      el.removeEventListener("mouseup", handleMouseUp);
      el.removeEventListener("mouseleave", handleMouseLeave);
      el.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const isLoading = loading?.indexTimeSeriesSummary || false;
  const hasData = chartData.length > 0;

  const indexDescriptions = {
    NDVI: "NDVI values help in mapping vegetation and detecting cover changes over time.",
    EVI: "EVI values are enhanced to reduce atmospheric and canopy influences.",
    SAVI: "SAVI corrects for soil brightness to assess vegetation vigor.",
    SUCROSE: "SUCROSE values are specific measurements related to crop sugar content.",
  };

  return (
    <div className="w-full flex justify-center mt-4">
      <div className="relative w-full bg-gray-50 rounded-2xl shadow-md text-gray-900 flex flex-col overflow-hidden px-3 py-3 md:px-4 md:py-4">

        {/* Index Selector */}
        <div className="absolute top-3 right-3 z-50">
          <select
            value={index}
            onChange={handleIndexChange}
            className="border-2 border-gray-300 bg-white rounded-[25px] px-3 py-1 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {Object.keys(indexDescriptions).map(idx => (
              <option key={idx} value={idx} className="text-gray-700">{idx}</option>
            ))}
          </select>
        </div>

        <h2 className="text-xl lg:text-2xl font-bold mb-2 relative z-10">
          Vegetation Index
        </h2>

        <div className="relative z-10 flex flex-col lg:flex-row gap-2 lg:gap-4">

          {/* Summary Card */}
          <div className="w-full lg:w-1/4 flex flex-col items-center justify-center">
            <div className="bg-white rounded-xl p-2 lg:p-3 flex flex-col items-center shadow-md border border-gray-200 h-full w-full justify-around">
              <h2 className="text-xl font-bold text-green-600">{index}</h2>
              <button className="bg-green-100 text-green-600 px-3 py-1 text-sm font-semibold rounded mt-1 border border-green-200 hover:bg-green-200 transition-all">
                +0.15
              </button>
              <p className="my-1 text-gray-600 text-xs lg:text-sm text-center">
                Last Update{" "}
                {summaryData.timestamp
                  ? `${getDaysAgo(summaryData.timestamp)} days Ago`
                  : "N/A"}
              </p>
              <div className="border-2 border-gray-200 bg-white p-2 rounded text-gray-700 text-sm w-full">
                <div className="flex items-start justify-between gap-2">
                  <span className="flex-1 text-xs text-gray-600">
                    {indexDescriptions[index]}
                  </span>
                  <span className="bg-gray-100 rounded-full p-1 border border-gray-200">
                    <Info size={16} strokeWidth={1.5} color={NDVI_COLOR_MAIN} />
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Scrollable Chart */}
          <div
            ref={scrollRef}
            className="w-full lg:w-3/4 overflow-x-auto pr-6 scrollbar-hide no-scrollbar scroll-smooth cursor-grab active:cursor-grabbing bg-white rounded-xl p-2 flex-grow"
          >
            {isLoading ? (
              <div className="text-center text-gray-900" style={{ minHeight: "180px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <LoadingSpinner size={48} color={NDVI_COLOR_MAIN} />
                <strong>Loading Vegetation Index...</strong>
              </div>
            ) : !hasData ? (
              <div className="bg-gray-100 rounded-lg p-4 mx-auto mt-2 max-w-md">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">No Data Available</h3>
                  <p className="text-sm text-gray-600">
                    We couldn't find any data for the selected field and time range. Please verify the field selection or adjust the date range.
                  </p>
                </div>
              </div>
            ) : (
              <div className="w-full">
                <ResponsiveContainer width={chartConfig.width} height={180}>
                  <LineChart
                    data={chartData}
                    margin={{ top: 5, right: 15, left: 15, bottom: 5 }}
                  >
                    <CartesianGrid stroke="rgba(0, 0, 0, 0.1)" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12, fill: "#333" }}
                      interval={chartConfig.interval}
                      type="category"
                    />
                    <YAxis
                      domain={yAxisConfig.domain}
                      tick={{ fontSize: 12, fill: "#333" }}
                      ticks={yAxisConfig.ticks}
                      tickFormatter={tickFormatter}
                      type="number"
                    />
                    <Tooltip
                      formatter={tooltipFormatter}
                      labelFormatter={labelFormatter}
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "none",
                        borderRadius: "8px",
                        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                      }}
                    />
                    <Legend
                      layout="horizontal"
                      verticalAlign="top"
                      align="start"
                      wrapperStyle={{
                        paddingBottom: "8px",
                        paddingLeft: "40px",
                        fontWeight: "bold",
                        color: "#333",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey={index}
                      stroke={NDVI_COLOR_MAIN}
                      strokeWidth={3}
                      dot={{ r: 3, fill: NDVI_COLOR_MAIN }}
                      activeDot={{ r: 5, fill: NDVI_COLOR_LIGHT }}
                      connectNulls={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default React.memo(NdviGraph);
