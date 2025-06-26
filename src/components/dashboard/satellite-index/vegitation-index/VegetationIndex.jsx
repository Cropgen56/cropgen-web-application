import React, { useEffect, useState, useMemo, useCallback } from "react";
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

const NdviGraph = ({ selectedFieldsDetials }) => {
  const { sowingDate, field } = selectedFieldsDetials?.[0] || {};
  const {
    indexTimeSeriesSummary = null,
    loading,
  } = useSelector((state) => state.satellite) || {};

  const dispatch = useDispatch();
  const [index, setIndex] = useState("NDVI");

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
    if (!indexTimeSeriesSummary) return [];
    let timeseries = indexTimeSeriesSummary.data?.timeseries ||
                     indexTimeSeriesSummary.timeseries ||
                     (Array.isArray(indexTimeSeriesSummary) ? indexTimeSeriesSummary : []);
    if (!Array.isArray(timeseries)) return [];
    return timeseries.map((item) => ({
      date: new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "2-digit" }),
      [index]: item.value,
    }));
  }, [indexTimeSeriesSummary, index]);

  const summaryData = useMemo(() => {
    const data = indexTimeSeriesSummary?.data?.summary || indexTimeSeriesSummary?.summary || {};
    const timestamp = indexTimeSeriesSummary?.timestamp || null;
    const { min = -0.1, mean = 0.2, max = 0.4 } = data;
    return { min, mean, max, timestamp };
  }, [indexTimeSeriesSummary]);

  const yAxisConfig = useMemo(() => {
    const { min, mean, max } = summaryData;
    const domain = [Math.floor(min * 10) / 10 - 0.1, Math.ceil(max * 10) / 10 + 0.1];
    const ticks = [min, mean, max, domain[0], domain[1]]
      .sort((a, b) => a - b)
      .filter((v, i, a) => a.indexOf(v) === i);
    return { domain, ticks };
  }, [summaryData]);

  const chartConfig = useMemo(() => {
    const len = chartData.length;
    return { width: Math.max(len * 30, 300), interval: 3 };
  }, [chartData.length]);

  const tickFormatter = useCallback((value) => {
    const { min, mean, max } = summaryData;
    if (Math.abs(value - min) < 0.001) return `Min: ${value.toFixed(3)}`;
    if (Math.abs(value - mean) < 0.001) return `Mean: ${value.toFixed(3)}`;
    if (Math.abs(value - max) < 0.001) return `Max: ${value.toFixed(3)}`;
    return value.toFixed(2);
  }, [summaryData]);

  const tooltipFormatter = useCallback((value) => [value.toFixed(3), index], [index]);
  const labelFormatter = useCallback((label) => `Date: ${label}`, []);
  const handleIndexChange = useCallback((e) => setIndex(e.target.value), []);

  const isLoading = loading?.indexTimeSeriesSummary || false;
  const hasData = chartData.length > 0;

  return (
    <Card body className="shadow-md bg-white">
      <h6 className="text-[#5a7c6b] text-base font-semibold">Vegetation Index</h6>
      <div className="flex flex-col lg:flex-row items-start gap-4 mt-2">
        {/* Left Section */}
        <div className="w-full lg:w-[300px] text-center">
          <h2 className="text-[#86d72f] text-xl font-bold">{index}</h2>
          <button className="bg-[#5a7c6b] text-[#86d72f] py-[5px] px-[20px] text-base font-semibold rounded mt-2">
            +0.15
          </button>
          <p className="mt-2 text-[#344e41] text-sm">
            Last Update{" "}
            {summaryData.timestamp ? `${getDaysAgo(summaryData.timestamp)} days Ago` : "N/A"}
          </p>
          <div className="border border-[#86d72f] p-3 mt-2 rounded text-[#344e41] text-sm">
            {index} values help in mapping vegetation and detecting cover changes over time.
          </div>
        </div>

        {/* Right Section */}
        <div className="w-full flex-grow">
          <div className="flex justify-end mb-2">
            <select
              value={index}
              onChange={handleIndexChange}
              className="py-[5px] px-[15px] rounded-full border border-[#5a7c6b] text-[#9a9898] text-base cursor-pointer"
            >
              <option value="NDVI">NDVI</option>
              <option value="EVI">EVI</option>
              <option value="SAVI">SAVI</option>
              <option value="SUCROSE">SUCROSE</option>
            </select>
          </div>

          {isLoading ? (
            <div className="text-center text-gray-500">
              <LoadingSpinner height="200px" size={64} color="#86D72F" />
              <strong>Vegetation Index</strong>
            </div>
          ) : !hasData ? (
            <Card className="mx-auto mt-4 max-w-md">
              <Card.Body className="text-center">
                <Card.Title className="text-lg font-semibold text-gray-700">No Data Available</Card.Title>
                <Card.Text className="text-sm text-gray-500">
                  We couldn't find any data for the selected field and time range. Please verify the field selection or adjust the date range.
                </Card.Text>
              </Card.Body>
            </Card>
          ) : (
            <div className="overflow-x-auto max-w-full [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <ResponsiveContainer width={chartConfig.width} height={200}>
                <LineChart data={chartData} margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
                  <CartesianGrid stroke="#ccc" vertical horizontal />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    interval={chartConfig.interval}
                    type="category"
                  />
                  <YAxis
                    domain={yAxisConfig.domain}
                    ticks={yAxisConfig.ticks}
                    tickFormatter={tickFormatter}
                    tick={{ fontSize: 12 }}
                    type="number"
                  />
                  <Tooltip formatter={tooltipFormatter} labelFormatter={labelFormatter} />
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
                  <Line type="monotone" dataKey={`${index} ( Day 2 )`} stroke="#344E41" dot={{ r: 2 }} />
                  <Line type="monotone" dataKey={`${index} ( Day 3)`} stroke="#344E41" dot={{ r: 2 }} />
                  <Line type="monotone" dataKey={`${index} ( Day 4 )`} stroke="#344E41" dot={{ r: 2 }} />
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
