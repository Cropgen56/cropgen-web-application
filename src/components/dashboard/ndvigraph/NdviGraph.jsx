import React, { useEffect, useState, useMemo } from "react";
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
import { fetchIndexTimeSeriesSummary } from "../../../redux/slices/satelliteSlice";
import { getDaysAgo, getSixMonthsBefore } from "../../../utility/formatDate";
import "./NdviGraph.css";

const NdviGraph = ({ selectedFieldsDetials }) => {
  const { sowingDate, field } = selectedFieldsDetials?.[0] || {};
  const {
    indexTimeSeriesSummary = null,
    loading,
    error,
  } = useSelector((state) => state.satellite) || {};

  const dispatch = useDispatch();
  const [index, setIndex] = useState("NDVI");
  const [chartData, setChartData] = useState([]);

  // Fetch new data whenever index, field, or sowingDate changes
  useEffect(() => {
    if (!field || !sowingDate) return;

    dispatch(
      fetchIndexTimeSeriesSummary({
        startDate: getSixMonthsBefore(sowingDate),
        endDate: sowingDate,
        geometry: field,
        index,
      })
    );
  }, [index, field, sowingDate, dispatch]);

  //  Update chartData only when the actual data is available
  useEffect(() => {
    const timeseries = indexTimeSeriesSummary?.data?.timeseries;

    if (loading?.indexTimeSeriesSummary || !Array.isArray(timeseries)) {
      return;
    }

    const transformed = timeseries.map((item) => ({
      date: new Date(item.date).toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
      }),
      [index]: item.value,
    }));

    setChartData(transformed);
  }, [indexTimeSeriesSummary, index, loading]);

  // Extract data summary safely
  const { timestamp } = indexTimeSeriesSummary || {};
  const summary = indexTimeSeriesSummary?.data?.summary || {};
  const { min = -0.1, mean = 0.2, max = 0.4 } = summary;

  // Memoize yAxis domain
  const yAxisDomain = useMemo(() => {
    return [Math.floor(min * 10) / 10 - 0.1, Math.ceil(max * 10) / 10 + 0.1];
  }, [min, max]);

  // Memoize Y ticks
  const customTicks = useMemo(() => {
    return [min, mean, max, yAxisDomain[0], yAxisDomain[1]].sort(
      (a, b) => a - b
    );
  }, [min, mean, max, yAxisDomain]);

  return (
    <Card body className="ndvi-graph-main">
      <div className="ndvi-container p-0 m-0">
        {/* Left Panel */}
        <div className="ndvi-left">
          <h2>{index}</h2>
          <button>+0.15</button>
          <p>
            Last Update{" "}
            {timestamp ? `${getDaysAgo(timestamp)} days Ago` : "N/A"}
          </p>
          <div>
            {index} values help in mapping vegetation and detecting cover
            changes over time.
          </div>
        </div>

        {/* Right Panel */}
        {loading?.indexTimeSeriesSummary ? (
          <div>Loading chart data...</div>
        ) : (
          <div className="ndvi-right">
            <div className="ndvi-select">
              <select value={index} onChange={(e) => setIndex(e.target.value)}>
                <option value="NDVI">NDVI</option>
                <option value="EVI">EVI</option>
                <option value="SAVI">SAVI</option>
              </select>
            </div>

            <div style={{ overflowX: "auto", maxWidth: "100%" }}>
              <ResponsiveContainer
                width={chartData.length * 30 || 300}
                height={200}
              >
                <LineChart
                  data={chartData}
                  margin={{ top: 10, right: 20, left: 20, bottom: 10 }}
                >
                  <CartesianGrid stroke="#ccc" vertical horizontal />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    interval={Math.floor(chartData.length / 10)}
                  />
                  <YAxis
                    domain={yAxisDomain}
                    tick={{ fontSize: 12 }}
                    ticks={customTicks}
                    tickFormatter={(value) => {
                      if (value === min) return `Min: ${value.toFixed(3)}`;
                      if (value === mean) return `Mean: ${value.toFixed(3)}`;
                      if (value === max) return `Max: ${value.toFixed(3)}`;
                      return value.toFixed(2);
                    }}
                  />
                  <Tooltip
                    formatter={(value) => [value.toFixed(3), index]}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Legend
                    layout="horizontal"
                    verticalAlign="top"
                    align="start"
                    wrapperStyle={{
                      paddingBottom: "10px",
                      paddingLeft: "50px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey={index}
                    stroke="#86D72F"
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default NdviGraph;
