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
import Card from "react-bootstrap/Card";
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
      width: Math.max(length * 30, 300),
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
    <Card body className="bg-white shadow rounded-lg relative overflow-hidden">
      {/* Index Selector */}
      <div className="absolute top-4 right-4 z-10">
        <select
          value={index}
          onChange={handleIndexChange}
          className="border-2 border-[#5A7C6B] rounded-[25px] px-2 py-1 text-gray-500 text-sm focus:outline-none"
        >
          <option value="NDVI">NDVI</option>
          <option value="EVI">EVI</option>
          <option value="SAVI">SAVI</option>
          <option value="SUCROSE">SUCROSE</option>
        </select>
      </div>

      <h6 className="text-[#5a7c6b] text-base font-semibold mb-2">Vegetation Index</h6>

      <div className="flex flex-row gap-3 mt-[10px]">
        {/* Left Side */}
        <div className="w-1/3 lg:w-1/4 flex flex-col items-center justify-center ">
          <h2 className="text-[#86d72f] text-xl font-bold">{index}</h2>
          <button className="bg-[#5a7c6b] text-[#86d72f] px-3 py-2 text-sm font-semibold rounded mt-0">
            +0.15
          </button>
          <p className="my-2 text-[#344e41] text-xs lg:text-sm">
            Last Update{" "}
            {summaryData.timestamp
              ? `${getDaysAgo(summaryData.timestamp)} days Ago`
              : "N/A"}
          </p>
          <div className="border-2 border-[#5A7C6B] p-2 rounded text-[#344E41] text-sm lg:mx-auto mx-0 lg:w-2/3">
            <div className="flex items-start justify-between gap-2">
              <span className="flex-1">{index} values help in mapping vegetation and detecting cover changes over time.</span>
              <span className="bg-[#344E41] rounded-full">
                <Info size={16} strokeWidth={1.5} color="#fff"/>
              </span>
            </div>
          </div>
        </div>

        {/* Right Graph Section */}
        <div
          ref={scrollRef}
          className="w-2/3 lg:w-3/4 overflow-x-auto pr-8 scrollbar-hide no-scrollbar scroll-smooth cursor-grab active:cursor-grabbing" >
          {isLoading ? (
            <div className="text-center text-muted">
              <LoadingSpinner height="200px" size={64} color="#86D72F" />
              <strong>Vegetation Index</strong>
            </div>
          ) : !hasData ? (
            <Card className="no-data-card mx-auto mt-4 max-w-md">
              <Card.Body className="text-center">
                <Card.Title className="text-sm lg:text-lg font-semibold text-gray-700">
                  No Data Available
                </Card.Title>
                <Card.Text className="text-sm text-gray-500">
                  We couldn't find any data for the selected field and time
                  range. Please verify the field selection or adjust the date
                  range to ensure data availability.
                </Card.Text>
              </Card.Body>
            </Card>
          ) : (
            <div style={{ minWidth: "300px" }}>
              <ResponsiveContainer width={chartConfig.width} height={200}>
                <LineChart
                  data={chartData}
                  margin={{ top: 10, right: 20, left: 20, bottom: 10 }}
                >
                  <CartesianGrid stroke="#ccc" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    interval={chartConfig.interval}
                    type="category"
                  />
                  <YAxis
                    domain={yAxisConfig.domain}
                    tick={{ fontSize: 12 }}
                    ticks={yAxisConfig.ticks}
                    tickFormatter={tickFormatter}
                    type="number"
                  />
                  <Tooltip
                    formatter={tooltipFormatter}
                    labelFormatter={labelFormatter}
                  />
                  <Legend
                    layout="horizontal"
                    verticalAlign="top"
                    align="start"
                    wrapperStyle={{
                      paddingBottom: "10px",
                      paddingLeft: "50px",
                      fontWeight: "bold",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey={index}
                    stroke="#86D72F"
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                    connectNulls={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default React.memo(NdviGraph);
