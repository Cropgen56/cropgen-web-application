import React, { useEffect, useState } from "react";
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
import "./NdviGraph.css";
import { useDispatch, useSelector } from "react-redux";
import { fetchIndexTimeSeriesSummary } from "../../../redux/slices/satelliteSlice";
import { getDaysAgo, getSixMonthsBefore } from "../../../utility/formatDate";

const NdviGraph = ({ selectedFieldsDetials }) => {
  const { sowingDate, field } = selectedFieldsDetials[0] || {};
  const { indexTimeSeriesSummary } =
    useSelector((state) => state.satellite) || {};
  const dispatch = useDispatch();
  const [index, setIndex] = useState("NDVI");

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

  // Process timeseries data for the chart
  const chartData =
    indexTimeSeriesSummary?.data?.timeseries?.map((item) => ({
      date: new Date(item.date).toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
      }),
      [index]: item.value,
    })) || [];

  const { timestamp } = indexTimeSeriesSummary || {};

  // Get summary statistics
  const summary = indexTimeSeriesSummary?.data?.summary || {};
  const { min = -0.1, mean = 0.2, max = 0.4 } = summary;

  // Calculate Y-axis domain with padding
  const yAxisDomain = [
    Math.floor(min * 10) / 10 - 0.1,
    Math.ceil(max * 10) / 10 + 0.1,
  ];

  // Custom tick formatter to highlight summary stats
  const customTicks = [min, mean, max, yAxisDomain[0], yAxisDomain[1]].sort(
    (a, b) => a - b
  );

  return (
    <Card body className="ndvi-graph-main">
      <div className="ndvi-container p-0 m-0">
        {/* Left Side */}
        <div className="ndvi-left">
          <h2>{index}</h2>
          <button>+0.15</button>
          <p>Last Update {getDaysAgo(timestamp)} days Ago</p>
          <div>
            {index} values can also be used to map and classify vegetation
            types, and to detect changes in vegetation cover over time.
          </div>
        </div>

        {/* Right Side */}
        <div className="ndvi-right">
          <div className="ndvi-select">
            <select value={index} onChange={(e) => setIndex(e.target.value)}>
              <option value="NDVI">NDVI</option>
              <option value="EVI">EVI</option>
              <option value="SAVI">SAVI</option>
            </select>
          </div>
          <div style={{ overflowX: "auto", maxWidth: "100%" }}>
            <ResponsiveContainer width={chartData.length * 30} height={200}>
              <LineChart
                data={chartData}
                margin={{ top: 10, right: 20, left: 20, bottom: 10 }}
              >
                <CartesianGrid
                  stroke="#ccc"
                  vertical={true}
                  horizontal={true}
                />
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
      </div>
    </Card>
  );
};

export default NdviGraph;
