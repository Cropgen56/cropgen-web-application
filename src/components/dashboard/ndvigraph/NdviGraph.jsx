import React from "react";
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

const data = [
  { date: "Jan 03", NDVI1: 0.4, NDVI2: 0.35, NDVI3: 0.3 },
  { date: "Feb 10", NDVI1: 0.6, NDVI2: 0.55, NDVI3: 0.5 },
  { date: "March 17", NDVI1: 0.65, NDVI2: 0.6, NDVI3: 0.55 },
  { date: "Apr 24", NDVI1: 0.7, NDVI2: 0.65, NDVI3: 0.6 },
  { date: "May 01", NDVI1: 0.6, NDVI2: 0.55, NDVI3: 0.5 },
  { date: "Jun 07", NDVI1: 0.75, NDVI2: 0.7, NDVI3: 0.65 },
  { date: "Jully 14", NDVI1: 0.55, NDVI2: 0.5, NDVI3: 0.45 },
  { date: "Aug 21", NDVI1: 0.6, NDVI2: 0.55, NDVI3: 0.5 },
  { date: "Sep 28", NDVI1: 0.7, NDVI2: 0.65, NDVI3: 0.6 },
  { date: "Oct 04", NDVI1: 0.8, NDVI2: 0.75, NDVI3: 0.7 },
  { date: "Nov 11", NDVI1: 0.65, NDVI2: 0.6, NDVI3: 0.55 },
  { date: "Dec 18", NDVI1: 0.5, NDVI2: 0.45, NDVI3: 0.4 },
];

const NdviGraph = () => {
  return (
    <Card body className="ndvi-graph mb-3">
      <div className="ndvi-container p-0 m-0">
        {/* Left Side */}
        <div className="ndvi-left">
          <h2>NDVI</h2>
          <button>+0.15</button>
          <p>Last Update 4 days Ago</p>
          <div>
            NDVI values can also be used to map and classify vegetation types,
            and to detect changes in vegetation cover over time.
          </div>
        </div>

        {/* Right Side */}
        <div className="ndvi-right">
          <div className="ndvi-select">
            <select>
              <option value="NDVI">NDVI</option>
              <option value="EVI">EVI</option>
              <option value="NDRE">NDRE</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart
              data={data}
              margin={{ top: 20, right: 0, left: 0, bottom: 5 }}
            >
              <CartesianGrid stroke="#ccc" vertical={true} horizontal={false} />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis
                domain={[0, 1]}
                tick={{ fontSize: 12 }}
                ticks={[0, 0.2, 0.4, 0.6, 0.8, 1]}
              />
              <Tooltip />
              <Legend
                layout="horizontal"
                verticalAlign="top"
                align="start"
                wrapperStyle={{
                  paddingBottom: "20px",
                }}
                formatter={(value) => {
                  const color = value === "NDVI1" ? "#86D72F" : "#000000";
                  return <span style={{ color }}>{value}</span>;
                }}
              />
              {/* Render only NDVI1 line */}
              <Line
                type="monotone"
                dataKey="NDVI1"
                stroke="#86D72F"
                dot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
};

export default NdviGraph;
