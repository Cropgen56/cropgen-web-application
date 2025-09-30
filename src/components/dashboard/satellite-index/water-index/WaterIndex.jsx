import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
} from "react";
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
import { fetchWaterIndexData } from "../../../../redux/slices/satelliteSlice";
import {
  getDaysAgo,
  getOneYearBefore,
  getTodayDate,
} from "../../../../utility/formatDate";
import LoadingSpinner from "../../../comman/loading/LoadingSpinner";
import { Info } from "lucide-react";

// Define Water Theme Colors (Using Tailwind's sky-400 equivalent for consistency)
const WATER_COLOR_MAIN = "#38bdf8";
const WATER_COLOR_LIGHT = "#7dd3fc";

const WaterIndex = ({ selectedFieldsDetials }) => {
  const { sowingDate, field } = selectedFieldsDetials?.[0] || {};
  const { waterIndexData = null, loading } =
    useSelector((state) => state.satellite) || {};

  const dispatch = useDispatch();
  const [index, setIndex] = useState("NDMI");

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
    dispatch(fetchWaterIndexData(fetchParams));
  }, [dispatch, fetchParams]);

  const chartData = useMemo(() => {
    let timeseries =
      waterIndexData?.data?.timeseries ||
      waterIndexData?.timeseries ||
      (Array.isArray(waterIndexData) ? waterIndexData : []);
    if (!Array.isArray(timeseries)) return [];

    return timeseries.map((item) => ({
      date: new Date(item.date).toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
      }),
      [index]: item.value,
    }));
  }, [waterIndexData, index]);

  const summaryData = useMemo(() => {
    const summary = waterIndexData?.data?.summary ||
      waterIndexData?.summary || { min: -0.1, mean: 0.2, max: 0.4 };
    const timestamp = waterIndexData?.timestamp || null;

    const { min = -0.1, mean = 0.2, max = 0.4 } = summary;
    return { min, mean, max, timestamp };
  }, [waterIndexData]);

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
    (value) => {
      const { min, mean, max } = summaryData;
      if (Math.abs(value - min) < 0.001) return `Min: ${value.toFixed(3)}`;
      if (Math.abs(value - mean) < 0.001) return `Mean: ${value.toFixed(3)}`;
      if (Math.abs(value - max) < 0.001) return `Max: ${value.toFixed(3)}`;
      return value.toFixed(2);
    },
    [summaryData]
  );

  const tooltipFormatter = useCallback(
    (value) => [value.toFixed(3), index],
    [index]
  );

  const labelFormatter = useCallback((label) => `Date: ${label}`, []);
  const handleIndexChange = useCallback((e) => setIndex(e.target.value), []);

  // Drag-to-scroll logic
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleMouseDown = (e) => {
      isDragging.current = true;
      startX.current = e.pageX - el.offsetLeft;
      scrollLeft.current = el.scrollLeft;
    };

    const handleMouseLeave = () => {
      isDragging.current = false;
    };
    const handleMouseUp = () => {
      isDragging.current = false;
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

  const isLoading = loading?.waterIndexData || false;
  const hasData = chartData.length > 0;

  const indexDescriptions = {
    NDMI: "NDMI values can be used to monitor vegetation water content and drought conditions over time.",
    NDWI: "NDWI values help assess water presence in vegetation and detect surface water or irrigation zones.",
    SMI: "SMI (Soil Moisture Index) helps track surface soil moisture to support irrigation and drought planning.",
    MSI: "MSI values indicate water stress; higher values suggest drier vegetation or moisture deficit.",
    WI: "WI (Water Index) highlights moisture content in crops and helps assess water availability trends.",
    NMDI: "NMDI helps detect moisture variations in soil and vegetation, especially under stress or dry spells.",
  };

  return (
    <div className="w-full flex justify-center mt-4">
      {" "}
      {/* Reduced top margin */}
      <div className="relative w-full bg-gradient-to-br from-[#5A7C6B] to-[#344E41] rounded-2xl shadow-lg text-white flex flex-col overflow-hidden px-3 py-3 md:px-4 md:py-4">
        {" "}
        {/* Reduced padding */}
        {/* Index Selector */}
        <div className="absolute top-3 right-3 z-50">
          {" "}
          {/* Reduced vertical position */}
          <select
            value={index}
            onChange={handleIndexChange}
            className="border-2 border-white/50 bg-white/20 backdrop-blur-sm rounded-[25px] px-3 py-1 text-white text-sm focus:outline-none"
          >
            <option value="NDMI" className="text-gray-700">
              NDMI
            </option>
            <option value="NDWI" className="text-gray-700">
              NDWI
            </option>
            <option value="SMI" className="text-gray-700">
              SMI
            </option>
            <option value="MSI" className="text-gray-700">
              MSI
            </option>
            <option value="WI" className="text-gray-700">
              WI
            </option>
            <option value="NMDI" className="text-gray-700">
              NMDI
            </option>
          </select>
        </div>
        {/* Main Heading */}
        <h2 className="text-xl lg:text-2xl font-bold mb-2 relative z-10">
          Water Index
        </h2>{" "}
        {/* Reduced bottom margin */}
        {/* Content Container */}
        <div className="relative z-10 flex flex-col lg:flex-row gap-2 lg:gap-4 ">
          {" "}
          {/* Reduced gap */}
          {/* Left Side (Stat Block) */}
          <div className="w-full lg:w-1/4 flex flex-col items-center justify-center">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-2 lg:p-3 flex flex-col items-center shadow-md border border-white/20 h-full w-full justify-around">
              {" "}
              {/* Reduced padding */}
              <h2 className="text-xl font-bold">
                {" "}
                {/* Reduced text size */}
                {index}
              </h2>
              <button className="bg-white/15 text-sky-400 px-3 py-1 text-sm font-semibold rounded mt-1 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all">
                {" "}
                {/* Reduced padding */}
                +0.15
              </button>
              <p className="my-1 text-white/90 text-xs lg:text-sm text-center">
                {" "}
                {/* Reduced margin */}
                Last Update{" "}
                {summaryData.timestamp
                  ? `${getDaysAgo(summaryData.timestamp)} days Ago`
                  : "N/A"}
              </p>
              <div className="border-2 border-sky-400/50 bg-white/5 backdrop-blur-sm p-2 rounded text-white text-sm w-full">
                {" "}
                {/* Reduced padding */}
                <div className="flex items-start justify-between gap-2">
                  <span className="flex-1 text-xs text-white/90">
                    {indexDescriptions[index]}
                  </span>{" "}
                  {/* Reduced text size */}
                  <span className="bg-white/15 backdrop-blur-sm rounded-full p-1 border border-sky-400/20">
                    <Info
                      size={16}
                      strokeWidth={1.5}
                      color={WATER_COLOR_MAIN}
                    />
                  </span>
                </div>
              </div>
            </div>
          </div>
          {/* Right Graph Section */}
          <div
            ref={scrollRef}
            className="w-full lg:w-3/4 overflow-x-auto pr-6 scrollbar-hide no-scrollbar scroll-smooth cursor-grab active:cursor-grabbing bg-gradient-to-br from-[#6B9080] to-[#3D5A40] backdrop-blur-sm rounded-xl p-2 flex-grow"
          >
            {" "}
            {/* Reduced padding */}
            {isLoading ? (
              <div
                className="text-center text-white"
                style={{
                  minHeight: "180px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                {" "}
                {/* Reduced min-height */}
                <LoadingSpinner size={48} color={WATER_COLOR_MAIN} />{" "}
                {/* Reduced spinner size */}
                <strong>Loading Water Index...</strong>
              </div>
            ) : !hasData ? (
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 mx-auto mt-2 max-w-md">
                {" "}
                {/* Reduced padding */}
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-white mb-1">
                    {" "}
                    {/* Reduced margin */}
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
                  {" "}
                  {/* Reduced chart height */}
                  <LineChart
                    data={chartData}
                    margin={{ top: 5, right: 15, left: 15, bottom: 5 }}
                  >
                    <CartesianGrid stroke="rgba(255,255,255,0.2)" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12, fill: "#fff" }}
                      interval={chartConfig.interval}
                      type="category"
                    />
                    <YAxis
                      domain={yAxisConfig.domain}
                      tick={{ fontSize: 12, fill: WATER_COLOR_MAIN }}
                      ticks={yAxisConfig.ticks}
                      tickFormatter={tickFormatter}
                      type="number"
                    />
                    <Tooltip
                      formatter={tooltipFormatter}
                      labelFormatter={labelFormatter}
                      contentStyle={{
                        backgroundColor: "#344E41",
                        border: "none",
                        borderRadius: "8px",
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
                        color: "#fff",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey={index}
                      stroke={WATER_COLOR_MAIN}
                      strokeWidth={3}
                      dot={{ r: 3, fill: WATER_COLOR_MAIN }}
                      activeDot={{ r: 5, fill: WATER_COLOR_LIGHT }}
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

export default React.memo(WaterIndex);
