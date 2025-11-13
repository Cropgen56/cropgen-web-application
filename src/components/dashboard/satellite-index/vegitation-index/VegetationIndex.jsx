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
import {
  getDaysAgo,
  getOneYearBefore,
  getTodayDate,
} from "../../../../utility/formatDate";
import LoadingSpinner from "../../../comman/loading/LoadingSpinner";
import { Info } from "lucide-react";
import IndexPremiumWrapper from "../../../subscription/Indexpremiumwrapper";
import { selectHasVegetationIndices } from "../../../../redux/slices/membershipSlice";

const NdviGraph = ({ selectedFieldsDetials, onSubscribe }) => {
  const { sowingDate, field } = selectedFieldsDetials?.[0] || {};
  const {
    indexTimeSeriesSummary = null,
    loading,
  } = useSelector((state) => state.satellite) || {};

  const dispatch = useDispatch();
  const [index, setIndex] = useState("NDVI");

  // Get feature flag
  const hasVegetationIndices = useSelector(selectHasVegetationIndices);

  const scrollRef = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  // Fetch index data
  useEffect(() => {
    if (!field || !sowingDate) return;

    const params = {
      startDate: getOneYearBefore(getTodayDate()),
      endDate: getTodayDate(),
      geometry: field,
      index,
    };
    dispatch(fetchIndexTimeSeriesSummary(params));
  }, [dispatch, field, sowingDate, index]);

  // Process chart data
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

  // Calculate summary statistics
  const summaryData = useMemo(() => {
    const summary = indexTimeSeriesSummary?.data?.summary ||
      indexTimeSeriesSummary?.summary || { min: -0.1, mean: 0.2, max: 0.4 };
    const timestamp = indexTimeSeriesSummary?.timestamp || null;

    const { min = -0.1, mean = 0.2, max = 0.4 } = summary;
    return { min, mean, max, timestamp };
  }, [indexTimeSeriesSummary]);

  // Y-axis configuration
  const yAxisConfig = useMemo(() => {
    const { min, mean, max } = summaryData;
    const domain = [
      Math.floor(min * 10) / 10 - 0.1,
      Math.ceil(max * 10) / 10 + 0.1,
    ];

    const ticks = [min, mean, max, ...domain]
      .sort((a, b) => a - b)
      .filter((v, i, a) => a.indexOf(v) === i);

    return { domain, ticks };
  }, [summaryData]);

  // Chart configuration
  const chartConfig = useMemo(() => {
    const length = chartData.length;
    return {
      width: Math.max(length * 30, 600),
      interval: 3,
    };
  }, [chartData.length]);

  // Tick formatter for Y-axis
  const tickFormatter = useCallback(
    value => {
      const { min, mean, max } = summaryData;
      if (Math.abs(value - min) < 0.001) return `Min: ${value.toFixed(3)}`;
      if (Math.abs(value - mean) < 0.001) return `Mean: ${value.toFixed(3)}`;
      if (Math.abs(value - max) < 0.001) return `Max: ${value.toFixed(3)}`;
      return value.toFixed(2);
    },
    [summaryData]
  );

  // Tooltip formatter
  const tooltipFormatter = useCallback(
    value => [value.toFixed(3), index],
    [index]
  );

  // Label formatter
  const labelFormatter = useCallback(label => `Date: ${label}`, []);

  // Index change handler
  const handleIndexChange = useCallback(e => setIndex(e.target.value), []);

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

  return (
    <div className="w-full flex justify-center mt-4">
      <div className="relative w-full bg-white rounded-2xl shadow-md text-black flex flex-col overflow-hidden px-3 py-3 md:px-4 md:py-3">
        {/* Index Selector */}
        <div className="absolute top-3 right-3 z-50">
          <select
            value={index}
            onChange={handleIndexChange}
            className="border-2 border-gray-300 bg-white/90 rounded-[25px] px-3 py-1 text-black text-sm focus:outline-none focus:border-green-500"
          >
            <option value="NDVI">NDVI</option>
            <option value="EVI">EVI</option>
            <option value="SAVI">SAVI</option>
            <option value="SUCROSE">SUCROSE</option>
          </select>
        </div>

        {/* Title */}
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
              <p className="my-1 text-gray-600 text-sm text-center">
                Last Update{" "}
                {summaryData.timestamp
                  ? `${getDaysAgo(summaryData.timestamp)} days Ago`
                  : "N/A"}
              </p>
              <div className="border border-gray-200 bg-white/90 p-2 rounded text-black text-sm w-full">
                <div className="flex items-start justify-between gap-2">
                  <span className="flex-1 text-xs text-gray-500">
                    {index} values help in mapping vegetation and detecting cover
                    changes over time.
                  </span>
                  <span className="bg-white/90 rounded-full p-1 border border-gray-200">
                    <Info size={16} strokeWidth={1.5} color="#22c55e" />
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Chart Container */}
          <div className="lg:w-3/4 flex-grow">
            <IndexPremiumWrapper
              isLocked={!hasVegetationIndices}
              onSubscribe={onSubscribe}
              title="Vegetation Index"
            >
              <div
                ref={scrollRef}
                className="overflow-x-auto pr-6 scrollbar-hide no-scrollbar scroll-smooth cursor-grab active:cursor-grabbing bg-white rounded-xl p-2 min-h-[180px]"
              >
                {isLoading ? (
                  <div
                    className="text-center text-green-600"
                    style={{
                      minHeight: "180px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <LoadingSpinner size={48} color="#22c55e" />
                    <strong>Loading Vegetation Index...</strong>
                  </div>
                ) : !hasData ? (
                  <div className="bg-white/90 rounded-lg p-4 mx-auto mt-2 max-w-md">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-gray-800 mb-1">
                        No Data Available
                      </h3>
                      <p className="text-sm text-gray-500">
                        We couldn't find any data for the selected field and time
                        range. Please verify the field selection or adjust the date
                        range to ensure data availability.
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
                        <CartesianGrid stroke="rgba(0,0,0,0.1)" />
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
                            border: "1px solid #e2e8f0",
                            borderRadius: "8px",
                            padding: "8px",
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
                          stroke="#22c55e"
                          strokeWidth={3}
                          dot={{ r: 3, fill: "#22c55e" }}
                          activeDot={{ r: 5, fill: "#16a34a" }}
                          connectNulls={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </IndexPremiumWrapper>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(NdviGraph);