// PlantGrowthActivity.js
import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Card from "react-bootstrap/Card";
import "./PlantGrowthActivity.css";

const PlantGrowthActivity = () => {
  const data = [
    { week: "Week 1", height: 1 },
    { week: "Week 2", height: 1.5 },
    { week: "Week 3", height: 2 },
    { week: "Week 4", height: 2.5 },
    { week: "Week 5", height: 3 },
    { week: "Week 6", height: 3.5 },
    { week: "Week 7", height: 4 },
    { week: "Week 8", height: 4.5 },
    { week: "Week 9", height: 5 },
    { week: "Week 10", height: 5.5 },
    { week: "Week 11", height: 6 },
  ];

  return (
    <Card body className="plant-growth-card shadow">
      <div className="header-container">
        <div className="heading-container">
          {" "}
          <h2 className="header-title">Plant Growth Activity</h2>
          <div className="subheader-text">Wheat</div>
        </div>
        <div className="dropdown-container">
          <div className="custom-dropdown">
            <select>
              <option>Planning/Sowing</option>
              <option>Sowing</option>
              <option>Growth</option>
            </select>
          </div>
          <div className="custom-dropdown">
            <select>
              <option>Days</option>
              <option>Week 1</option>
              <option>Week 2</option>
              <option>Week 3</option>
            </select>
          </div>
        </div>
      </div>

      <div className="chart-container">
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart
            data={data}
            margin={{ top: 10, right: 30, left: 10, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorHeight" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4B970F" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#4B970F" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#ccc" vertical={false} />
            <XAxis dataKey="week" />
            <YAxis
              type="number"
              domain={[1, 6]}
              ticks={[1, 2, 3, 4, 5, 6]}
              unit=" cm"
            />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="height"
              stroke="#4B970F"
              fillOpacity={1}
              fill="url(#colorHeight)"
              name="Plant Height (cm)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default PlantGrowthActivity;
