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
import { fetchIndexTimeSeriesSummary } from "../../../redux/slices/satelliteSlice";
import {
  getDaysAgo,
  getOneYearBefore,
  getTodayDate,
} from "../../../utility/formatDate";
import LoadingSpinner from "../../comman/loading/LoadingSpinner";
import { Info } from "lucide-react";

import IndexPremiumWrapper from "../../subscription/PremiumIndexWrapper";
import FeatureGuard from "../../subscription/FeatureGuard";
import { useSubscriptionGuard } from "../../subscription/hooks/useSubscriptionGuard";

const NdviGraph = ({ selectedFieldsDetials }) => {
  const { sowingDate, field } = selectedFieldsDetials?.[0] || {};
  const { indexTimeSeriesSummary = null, loading } =
    useSelector((state) => state.satellite) || {};

  const dispatch = useDispatch();
  const [index, setIndex] = useState("NDVI");

  /* ================= FEATURE GUARD (ADDED) ================= */
  const vegetationGuard = useSubscriptionGuard({
    field: selectedFieldsDetials?.[0],
    featureKey: "vegetationIndices",
  });

  const scrollRef = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    if (!field || !sowingDate) return;

    dispatch(
      fetchIndexTimeSeriesSummary({
        startDate: getOneYearBefore(getTodayDate()),
        endDate: getTodayDate(),
        geometry: field,
        index,
      }),
    );
  }, [dispatch, field, sowingDate, index]);

  /* ================= DATA PROCESSING ================= */
  const chartData = useMemo(() => {
    let timeseries =
      indexTimeSeriesSummary?.data?.timeseries ||
      indexTimeSeriesSummary?.timeseries ||
      (Array.isArray(indexTimeSeriesSummary) ? indexTimeSeriesSummary : []);

    if (!Array.isArray(timeseries)) return [];

    return timeseries.map((item) => ({
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
    (value) => {
      const { min, mean, max } = summaryData;
      if (Math.abs(value - min) < 0.001) return `Min: ${value.toFixed(3)}`;
      if (Math.abs(value - mean) < 0.001) return `Mean: ${value.toFixed(3)}`;
      if (Math.abs(value - max) < 0.001) return `Max: ${value.toFixed(3)}`;
      return value.toFixed(2);
    },
    [summaryData],
  );

  const tooltipFormatter = useCallback(
    (value) => [value.toFixed(3), index],
    [index],
  );

  const labelFormatter = useCallback((label) => `Date: ${label}`, []);
  const handleIndexChange = useCallback((e) => setIndex(e.target.value), []);

  /* ================= DRAG SCROLL ================= */
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleMouseDown = (e) => {
      isDragging.current = true;
      startX.current = e.pageX - el.offsetLeft;
      scrollLeft.current = el.scrollLeft;
      el.style.cursor = "grabbing";
    };

    const stopDrag = () => {
      isDragging.current = false;
      el.style.cursor = "grab";
    };

    const handleMouseMove = (e) => {
      if (!isDragging.current) return;
      e.preventDefault();
      const x = e.pageX - el.offsetLeft;
      el.scrollLeft = scrollLeft.current - (x - startX.current);
    };

    el.addEventListener("mousedown", handleMouseDown);
    el.addEventListener("mouseleave", stopDrag);
    el.addEventListener("mouseup", stopDrag);
    el.addEventListener("mousemove", handleMouseMove);

    return () => {
      el.removeEventListener("mousedown", handleMouseDown);
      el.removeEventListener("mouseleave", stopDrag);
      el.removeEventListener("mouseup", stopDrag);
      el.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const isLoading = loading?.indexTimeSeriesSummary || false;
  const hasData = chartData.length > 0;

  /* ================= RENDER ================= */

  return (
    <FeatureGuard guard={vegetationGuard} title="Vegetation Index">
      <div className="w-full flex justify-center mt-4">
        <div className="relative w-full bg-white border border-gray-200 rounded-2xl shadow-md text-gray-900 flex flex-col overflow-hidden px-3 py-3 md:px-4 md:py-4">
          {/* ===== UI BELOW IS UNCHANGED ===== */}

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

          <h2 className="text-xl lg:text-2xl font-bold mb-2 relative z-10">
            Vegetation Index
          </h2>

          <div className="relative z-10 flex flex-col lg:flex-row gap-2 lg:gap-4">
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
                      {index} values help in mapping vegetation and detecting
                      cover changes over time.
                    </span>
                    <span className="bg-white/90 rounded-full p-1 border border-gray-200">
                      <Info size={16} strokeWidth={1.5} color="#22c55e" />
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:w-3/4 flex-grow">
              <IndexPremiumWrapper
                isLocked={!vegetationGuard.hasFeatureAccess}
                onSubscribe={vegetationGuard.handleSubscribe}
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
                          We couldn't find any data for the selected field and
                          time range.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <ResponsiveContainer width={chartConfig.width} height={180}>
                      <LineChart
                        data={chartData}
                        margin={{ top: 5, right: 15, left: 15, bottom: 5 }}
                      >
                        <CartesianGrid stroke="rgba(0,0,0,0.1)" />
                        <XAxis dataKey="date" interval={chartConfig.interval} />
                        <YAxis
                          domain={yAxisConfig.domain}
                          ticks={yAxisConfig.ticks}
                          tickFormatter={tickFormatter}
                        />
                        <Tooltip
                          formatter={tooltipFormatter}
                          labelFormatter={labelFormatter}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey={index}
                          stroke="#22c55e"
                          strokeWidth={3}
                          dot={{ r: 3 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </IndexPremiumWrapper>
            </div>
          </div>
        </div>
      </div>
    </FeatureGuard>
  );
};

export default React.memo(NdviGraph);
