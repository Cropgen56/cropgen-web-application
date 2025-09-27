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

const NdviGraph = ({ selectedFieldsDetials }) => {
  const { sowingDate, field } = selectedFieldsDetials?.[0] || {};
  const {
    indexTimeSeriesSummary = null,
    loading,
    error,
  } = useSelector((state) => state.satellite) || {};

  const dispatch = useDispatch();
  const [index, setIndex] = useState("NDVI");

  const scrollRef = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

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

    const ticks = [min, mean, max, ...domain]
      .sort((a, b) => a - b)
      .filter((v, i, a) => a.indexOf(v) === i);

    return { domain, ticks };
  }, [summaryData]);

  const chartConfig = useMemo(() => {
    const length = chartData.length;
    return {
      width: Math.max(length * 30, 600),
      interval: 3,
    };
  }, [chartData.length]);

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

  const tooltipFormatter = useCallback(
    value => [value.toFixed(3), index],
    [index]
  );

  const labelFormatter = useCallback(label => `Date: ${label}`, []);
  const handleIndexChange = useCallback(e => setIndex(e.target.value), []);

  // Drag scroll handlers
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleMouseDown = (e) => {
      isDragging.current = true;
      startX.current = e.pageX - el.offsetLeft;
      scrollLeft.current = el.scrollLeft;
    };

    const handleMouseLeave = () => { isDragging.current = false; };
    const handleMouseUp = () => { isDragging.current = false; };

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
      {/* Reduced padding overall */}
      <div className="relative w-full bg-gradient-to-br from-[#5A7C6B] to-[#344E41] rounded-2xl shadow-lg text-white flex flex-col overflow-hidden px-3 py-3 md:px-4 md:py-3">
        
        {/* Index Selector */}
        <div className="absolute top-3 right-3 z-50">
          <select
            value={index}
            onChange={handleIndexChange}
            className="border-2 border-white/50 bg-white/20 backdrop-blur-sm rounded-[25px] px-3 py-1 text-white text-sm focus:outline-none"
          >
            <option value="NDVI" className="text-gray-700">NDVI</option>
            <option value="EVI" className="text-gray-700">EVI</option>
            <option value="SAVI" className="text-gray-700">SAVI</option>
            <option value="SUCROSE" className="text-gray-700">SUCROSE</option>
          </select>
        </div>

        {/* Main Heading */}
        <h2 className="text-xl lg:text-2xl font-bold mb-2 relative z-10">Vegetation Index</h2>

        {/* Content Container: *** REMOVED lg:pl-12 *** to align stat block to the left edge */}
        <div className="relative z-10 flex flex-col lg:flex-row gap-2 lg:gap-4">
          
          {/* Left Side (Stat Block) */}
          <div className="w-full lg:w-1/4 flex flex-col items-center justify-center">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-2 lg:p-3 flex flex-col items-center shadow-md border border-white/20 h-full w-full justify-around">
              <h2 className="text-xl font-bold">
                {index}
              </h2>
              <button className="bg-white/15 text-[#86d72f] px-3 py-1 text-sm font-semibold rounded mt-1 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all">
                +0.15
              </button>
              <p className="my-1 text-white/90 text-xs lg:text-sm text-center">
                Last Update{" "}
                {summaryData.timestamp
                  ? `${getDaysAgo(summaryData.timestamp)} days Ago`
                  : "N/A"}
              </p>
              <div className="border-2 border-white/20 bg-white/5 backdrop-blur-sm p-2 rounded text-white text-sm w-full">
                <div className="flex items-start justify-between gap-2">
                  <span className="flex-1 text-xs text-white/90">{index} values help in mapping vegetation and detecting cover changes over time.</span>
                  <span className="bg-white/15 backdrop-blur-sm rounded-full p-1 border border-white/20">
                    <Info size={16} strokeWidth={1.5} color="#86D72F" />
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Graph Section */}
          <div
            ref={scrollRef}
            className=" lg:w-3/4 overflow-x-auto pr-6 scrollbar-hide no-scrollbar scroll-smooth cursor-grab active:cursor-grabbing bg-gradient-to-br from-[#6B9080] to-[#3D5A40] backdrop-blur-sm rounded-xl p-2 flex-grow" >
            {isLoading ? (
              <div className="text-center text-white" style={{ minHeight: '180px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <LoadingSpinner size={48} color="#86D72F" />
                <strong>Loading Vegetation Index...</strong>
              </div>
            ) : !hasData ? (
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 mx-auto mt-2 max-w-md">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-white mb-1">
                    No Data Available
                  </h3>
                  <p className="text-sm text-white/80">
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
                    <CartesianGrid stroke="rgba(255,255,255,0.2)" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12, fill: '#fff' }}
                      interval={chartConfig.interval}
                      type="category"
                    />
                    <YAxis
                      domain={yAxisConfig.domain}
                      tick={{ fontSize: 12, fill: '#fff' }}
                      ticks={yAxisConfig.ticks}
                      tickFormatter={tickFormatter}
                      type="number"
                    />
                    <Tooltip
                      formatter={tooltipFormatter}
                      labelFormatter={labelFormatter}
                      contentStyle={{ backgroundColor: '#344E41', border: 'none', borderRadius: '8px' }}
                    />
                    <Legend
                      layout="horizontal"
                      verticalAlign="top"
                      align="start"
                      wrapperStyle={{
                        paddingBottom: "8px",
                        paddingLeft: "40px",
                        fontWeight: "bold",
                        color: "#fff"
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey={index}
                      stroke="#86D72F"
                      strokeWidth={3}
                      dot={{ r: 3, fill: '#86D72F' }}
                      activeDot={{ r: 5, fill: '#7CC520' }}
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