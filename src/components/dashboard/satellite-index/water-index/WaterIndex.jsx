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
import { fetchWaterIndexData } from "../../../../redux/slices/satelliteSlice";
import {
  getDaysAgo,
  getOneYearBefore,
  getTodayDate,
} from "../../../../utility/formatDate";
import LoadingSpinner from "../../../comman/loading/LoadingSpinner";

const WaterIndex = ({ selectedFieldsDetials }) => {
  const { sowingDate, field } = selectedFieldsDetials?.[0] || {};
  const {
    waterIndexData = null,
    loading,
  } = useSelector((state) => state.satellite) || {};

  const dispatch = useDispatch();
  const [index, setIndex] = useState("NDMI");

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
    if (!waterIndexData) return [];

    let timeseries =
      waterIndexData?.data?.timeseries ||
      waterIndexData?.timeseries ||
      (Array.isArray(waterIndexData) ? waterIndexData : []);

    if (!Array.isArray(timeseries) || timeseries.length === 0) return [];

    return timeseries.map((item) => ({
      date: new Date(item.date).toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
      }),
      [index]: item.value,
    }));
  }, [waterIndexData, index]);

  const summaryData = useMemo(() => {
    if (!waterIndexData)
      return { min: -0.1, mean: 0.2, max: 0.4, timestamp: null };

    const summary =
      waterIndexData?.data?.summary || waterIndexData?.summary || {};
    const timestamp = waterIndexData?.timestamp;

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
      .filter((value, idx, arr) => arr.indexOf(value) === idx);

    return { domain, ticks };
  }, [summaryData]);

  const chartConfig = useMemo(() => {
    const dataLength = chartData.length;
    return {
      width: Math.max(dataLength * 30, 300),
      interval: 3,
    };
  }, [chartData.length]);

  const tickFormatter = useCallback((value) => {
    const { min, mean, max } = summaryData;
    if (Math.abs(value - min) < 0.001) return `Min: ${value.toFixed(3)}`;
    if (Math.abs(value - mean) < 0.001) return `Mean: ${value.toFixed(3)}`;
    if (Math.abs(value - max) < 0.001) return `Max: ${value.toFixed(3)}`;
    return value.toFixed(2);
  }, [summaryData]);

  const tooltipFormatter = useCallback(
    (value) => [value.toFixed(3), index],
    [index]
  );

  const labelFormatter = useCallback((label) => `Date: ${label}`, []);

  const handleIndexChange = useCallback((e) => {
    setIndex(e.target.value);
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
    <Card body className="shadow-md bg-white">
      <h6 className="text-blue-600 text-base font-semibold">Water Index</h6>

      <div className="flex flex-col lg:flex-row items-start gap-4 mt-2">
        {/* Left Panel */}
        <div className="w-full lg:w-[300px] text-center">
          <h2 className="text-blue-600 text-xl font-bold">{index}</h2>
          <button className="bg-[#5a7c6b] text-blue-600 px-5 py-1 rounded-md font-semibold text-base mt-2">
            +0.15
          </button>
          <p className="text-[#344e41] mt-2 text-sm">
            Last Update{" "}
            {summaryData.timestamp
              ? `${getDaysAgo(summaryData?.timestamp)} days Ago`
              : "N/A"}
          </p>
          <div className="border border-blue-600 text-[#344e41] p-3 rounded-md text-sm mt-2">
            {indexDescriptions[index]}
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex-grow w-full">
          <div className="flex justify-end mb-2">
            <select
              value={index}
              onChange={handleIndexChange}
              className="border border-[#5a7c6b] rounded-full px-4 py-1 text-gray-600 text-sm outline-none"
            >
              <option value="NDMI">NDMI</option>
              <option value="NDWI">NDWI</option>
              <option value="SMI">SMI</option>
              <option value="MSI">MSI</option>
              <option value="WI">WI</option>
              <option value="NMDI">NMDI</option>
            </select>
          </div>

          {isLoading ? (
            <div className="text-center text-gray-500">
              <LoadingSpinner height="200px" size={64} color="#86D72F" />
              <strong>Water Index</strong>
            </div>
          ) : !hasData ? (
            <Card className="mx-auto mt-4 max-w-md">
              <Card.Body className="text-center">
                <Card.Title className="text-lg font-semibold text-gray-700">
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
            <div className="overflow-x-auto max-w-full scrollbar-hide">
              <ResponsiveContainer width={chartConfig.width} height={200}>
                <LineChart
                  data={chartData}
                  margin={{ top: 10, right: 20, left: 20, bottom: 10 }}
                >
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
                    stroke="#1E90FF"
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                    connectNulls={false}
                  />
                  <Line
                    type="monotone"
                    dataKey={`${index} ( Day 2 )`}
                    stroke="#344E41"
                    dot={{ r: 2 }}
                  />
                  <Line
                    type="monotone"
                    dataKey={`${index} ( Day 3)`}
                    stroke="#344E41"
                    dot={{ r: 2 }}
                  />
                  <Line
                    type="monotone"
                    dataKey={`${index} ( Day 4 )`}
                    stroke="#344E41"
                    dot={{ r: 2 }}
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

export default React.memo(WaterIndex);
