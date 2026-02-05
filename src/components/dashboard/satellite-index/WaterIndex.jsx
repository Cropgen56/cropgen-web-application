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
import { fetchWaterIndexData } from "../../../redux/slices/satelliteSlice";
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

const WATER_COLOR_MAIN = "#38bdf8";
const WATER_COLOR_LIGHT = "#7dd3fc";

const WaterIndex = ({ selectedFieldsDetials }) => {
  const { sowingDate, field } = selectedFieldsDetials?.[0] || {};
  const { waterIndexData = null, loading } =
    useSelector((state) => state.satellite) || {};

  const dispatch = useDispatch();
  const [index, setIndex] = useState("NDMI");

  /* ================= FEATURE GUARD (ADDED) ================= */
  const waterIndexGuard = useSubscriptionGuard({
    field: selectedFieldsDetials?.[0],
    featureKey: "waterIndices",
  });

  const scrollRef = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  /* ================= FETCH PARAMS ================= */
  const fetchParams = useMemo(() => {
    if (!field || !sowingDate) return null;
    return {
      startDate: getOneYearBefore(getTodayDate()),
      endDate: getTodayDate(),
      geometry: field,
      index,
    };
  }, [field, sowingDate, index]);

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    if (!fetchParams) return;
    dispatch(fetchWaterIndexData(fetchParams));
  }, [dispatch, fetchParams]);

  /* ================= DATA PROCESSING ================= */
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

  const isLoading = loading?.waterIndexData || false;
  const hasData = chartData.length > 0;

  const indexDescriptions = {
    NDMI: "NDMI values can be used to monitor vegetation water content and drought conditions over time.",
    NDWI: "NDWI values help assess water presence in vegetation and detect surface water or irrigation zones.",
    SMI: "SMI helps track surface soil moisture to support irrigation and drought planning.",
    MSI: "MSI values indicate water stress; higher values suggest drier vegetation.",
    WI: "WI highlights moisture content in crops and helps assess water availability trends.",
    NMDI: "NMDI helps detect moisture variations in soil and vegetation under stress.",
  };

  /* ================= RENDER ================= */

  return (
    <FeatureGuard guard={waterIndexGuard} title="Water Index">
      <div className="w-full flex justify-center mt-2 p-2">
        <div className="relative w-full bg-white border border-gray-200 rounded-2xl shadow-md text-gray-900 flex flex-col overflow-hidden px-3 py-3 md:px-4 md:py-4">
          {/* ===== UI BELOW IS UNCHANGED ===== */}

          <div className="absolute top-3 right-3 z-50">
            <select
              value={index}
              onChange={handleIndexChange}
              className="border-2 border-gray-300 bg-white rounded-[25px] px-3 py-1 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              {Object.keys(indexDescriptions).map((key) => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
            </select>
          </div>

          <h2 className="text-xl lg:text-2xl font-bold mb-2 relative z-10">
            Water Index
          </h2>

          <div className="relative z-10 flex flex-col lg:flex-row gap-2 lg:gap-4">
            <div className="w-full lg:w-1/4 flex flex-col items-center justify-center">
              <div className="bg-white rounded-xl p-2 lg:p-3 flex flex-col items-center shadow-md border border-gray-200 h-full w-full justify-around">
                <h2 className="text-xl font-bold text-sky-700">{index}</h2>
                <button className="bg-sky-50 text-sky-700 px-3 py-1 text-sm font-semibold rounded mt-1 border border-sky-200">
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
                    <Info size={16} color={WATER_COLOR_MAIN} />
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:w-3/4 flex-grow">
              <IndexPremiumWrapper
                isLocked={!waterIndexGuard.hasFeatureAccess}
                onSubscribe={waterIndexGuard.handleSubscribe}
                title="Water Index"
              >
                <div
                  ref={scrollRef}
                  className="w-full overflow-x-auto pr-6 bg-white rounded-xl p-2 min-h-[180px]"
                >
                  {isLoading ? (
                    <LoadingSpinner size={48} color={WATER_COLOR_MAIN} />
                  ) : !hasData ? (
                    <div className="text-center text-sm text-gray-600">
                      No Data Available
                    </div>
                  ) : (
                    <ResponsiveContainer width={chartConfig.width} height={180}>
                      <LineChart data={chartData}>
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
                          stroke={WATER_COLOR_MAIN}
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

export default React.memo(WaterIndex);
