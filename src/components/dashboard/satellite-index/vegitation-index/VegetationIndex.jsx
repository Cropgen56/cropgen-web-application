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
import "./VegetationIndex.css";

const NdviGraph = ({ selectedFieldsDetials }) => {
  const { sowingDate, field } = selectedFieldsDetials?.[0] || {};
  const {
    indexTimeSeriesSummary = null,
    loading,
    error,
  } = useSelector((state) => state.satellite) || {};

  const dispatch = useDispatch();
  const [index, setIndex] = useState("NDVI");

  // Memoize the fetch parameters to prevent unnecessary API calls
  const fetchParams = useMemo(() => {
    if (!field || !sowingDate) return null;

    return {
      startDate: getOneYearBefore(getTodayDate()),
      endDate: getTodayDate(),
      geometry: field,
      index,
    };
  }, [field, sowingDate, index]);

  // Fetch data only when parameters actually change
  useEffect(() => {
    if (!fetchParams) return;

    dispatch(fetchIndexTimeSeriesSummary(fetchParams));
  }, [dispatch, fetchParams]);

  // Memoize chart data transformation to prevent unnecessary recalculations
  const chartData = useMemo(() => {
    // Return empty if no summary data at all
    if (!indexTimeSeriesSummary) {
      return [];
    }

    // Try different possible data structures
    let timeseries = null;

    // Check common data structure patterns
    if (indexTimeSeriesSummary.data?.timeseries) {
      timeseries = indexTimeSeriesSummary.data.timeseries;
    } else if (indexTimeSeriesSummary.timeseries) {
      timeseries = indexTimeSeriesSummary.timeseries;
    } else if (Array.isArray(indexTimeSeriesSummary)) {
      timeseries = indexTimeSeriesSummary;
    } else {
      return [];
    }

    // Validate timeseries data
    if (!Array.isArray(timeseries) || timeseries.length === 0) {
      return [];
    }

    return timeseries.map((item) => ({
      date: new Date(item.date).toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
      }),
      [index]: item.value,
    }));
  }, [indexTimeSeriesSummary, index]);

  // Memoize summary data extraction
  const summaryData = useMemo(() => {
    if (!indexTimeSeriesSummary) {
      return { min: -0.1, mean: 0.2, max: 0.4, timestamp: null };
    }

    // Handle different data structures
    let summary, timestamp;

    if (indexTimeSeriesSummary.data?.summary) {
      summary = indexTimeSeriesSummary.data.summary;
      timestamp = indexTimeSeriesSummary.timestamp;
    } else if (indexTimeSeriesSummary.summary) {
      summary = indexTimeSeriesSummary.summary;
      timestamp = indexTimeSeriesSummary.timestamp;
    } else {
      summary = {};
      timestamp = indexTimeSeriesSummary.timestamp;
    }

    const { min = -0.1, mean = 0.2, max = 0.4 } = summary;

    return { min, mean, max, timestamp };
  }, [indexTimeSeriesSummary]);

  // Memoize Y-axis configuration
  const yAxisConfig = useMemo(() => {
    const { min, mean, max } = summaryData;

    const domain = [
      Math.floor(min * 10) / 10 - 0.1,
      Math.ceil(max * 10) / 10 + 0.1,
    ];

    const ticks = [min, mean, max, domain[0], domain[1]]
      .sort((a, b) => a - b)
      .filter((value, index, array) => array.indexOf(value) === index);

    return { domain, ticks };
  }, [summaryData]);

  // Memoize chart configuration
  const chartConfig = useMemo(() => {
    const dataLength = chartData.length;

    return {
      width: Math.max(dataLength * 30, 300),
      interval: 3,
    };
  }, [chartData.length]);

  // Memoized tick formatter to prevent function recreation
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

  // Memoized tooltip formatter
  const tooltipFormatter = useCallback(
    (value) => [value.toFixed(3), index],
    [index]
  );
  const labelFormatter = useCallback((label) => `Date: ${label}`, []);

  // Memoized select handler
  const handleIndexChange = useCallback((e) => {
    setIndex(e.target.value);
  }, []);

  const isLoading = loading?.indexTimeSeriesSummary || false;
  const hasData = chartData.length > 0;

  return (
    <Card body className="ndvi-graph-main">
      <h6 style={{ color: "#5a7c6b" }}>Vegetation Index</h6>
      <div className="ndvi-container p-0 m-0">
        {/* Left Panel */}
        <div className="ndvi-left">
          <h2>{index}</h2>
          <button>+0.15</button>
          <p>
            Last Update{" "}
            {summaryData.timestamp
              ? `${getDaysAgo(summaryData?.timestamp)} days Ago`
              : "N/A"}
          </p>
          <div>
            {index} values help in mapping vegetation and detecting cover
            changes over time.
          </div>
        </div>
        {/* Right Panel */}
        <div className="ndvi-right">
          <div className="ndvi-select">
            <select value={index} onChange={handleIndexChange}>
              <option value="NDVI">NDVI</option>
              <option value="EVI">EVI</option>
              <option value="SAVI">SAVI</option>
              <option value="SUCROSE">SUCROSE</option>
            </select>
          </div>

          {isLoading ? (
            <div className="text-center text-muted">
              <LoadingSpinner height="200px" size={64} color="#86D72F" />
              <strong>Vegetation Index</strong>
            </div>
          ) : !hasData ? (
            <Card className="no-data-card mx-auto mt-4 max-w-md">
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
            <div
              style={{ overflowX: "auto", maxWidth: "100%" }}
              className="hide-scrollbar"
            >
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

export default React.memo(NdviGraph);
