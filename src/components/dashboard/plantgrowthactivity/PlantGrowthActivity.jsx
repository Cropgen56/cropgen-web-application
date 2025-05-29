import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import Card from "react-bootstrap/Card";
import "./PlantGrowthActivity.css";
import { useSelector } from "react-redux";

// Generate linear data for a straight line from (Week 1, 0) to (Week 11, 6)
const generateLinearData = (currentWeek, cropGrowthStage) => {
  const data = Array.from({ length: 11 }, (_, i) => {
    const week = i + 1;
    return {
      week: `Week ${week}`,
      height: (week / 11) * 6,
      growthStage: week === currentWeek ? cropGrowthStage || "Unknown" : "",
      weekNumber: week,
    };
  });
  return data;
};

const PlantGrowthActivity = ({ selectedFieldsDetials = [] }) => {
  const { cropName, sowingDate } = selectedFieldsDetials[0] || {};
  const { NpkData } = useSelector((state) => state.satellite);
  const { Crop_Growth_Stage } = NpkData || {};

  // Current date and time: May 29, 2025, 02:25 PM IST
  const today = new Date("2025-05-29T14:25:00+05:30");
  const sowing = sowingDate ? new Date(sowingDate) : null;
  let currentWeek = 1;

  // Calculate current week
  if (sowing) {
    const timeDiff = today.getTime() - sowing.getTime();
    const daysSinceSowing = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    currentWeek = Math.min(
      Math.max(Math.floor(daysSinceSowing / 7) + 1, 1),
      11
    );
  }

  // Generate chart data
  const data = generateLinearData(currentWeek, Crop_Growth_Stage);

  // Find the current week's data point
  const currentWeekData = data.find((d) => d.weekNumber === currentWeek);

  return (
    <Card body className="plant-growth-card shadow">
      <div className="header-container">
        <div className="heading-container">
          <h2 className="header-title">Plant Growth Activity</h2>
          <div className="subheader-text">{cropName || "Unknown Crop"}</div>
          {Crop_Growth_Stage && (
            <div className="growth-stage-text">
              Current Stage: {Crop_Growth_Stage} (Week {currentWeek})
            </div>
          )}
        </div>
        <div className="dropdown-container">
          <div className="custom-dropdown">
            <select aria-label="Select Activity Phase">
              <option>Planning/Sowing</option>
              <option>Sowing</option>
              <option>Growth</option>
            </select>
          </div>
          <div className="custom-dropdown">
            <select aria-label="Select Time Period">
              <option>Days</option>
              <option>Week 1</option>
              <option>Week 2</option>
              <option>Week 3</option>
            </select>
          </div>
        </div>
      </div>

      <div className="chart-container" style={{ position: "relative" }}>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart
            data={data}
            margin={{ top: 5, right: 0, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorHeight" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4B970F" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#4B970F" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#ccc" vertical={false} />
            <XAxis hide />
            <YAxis hide />
            <Area
              type="linear"
              dataKey="height"
              stroke="#4B970F"
              fillOpacity={1}
              fill="url(#colorHeight)"
              name="Plant Height"
            />
          </AreaChart>
        </ResponsiveContainer>
        {currentWeekData && (
          <div
            className="custom-tooltip"
            style={{
              position: "absolute",
              left: `${(currentWeekData.weekNumber / 11) * 100}%`,
              top: `${100 - (currentWeekData.height / 6) * 100 - 5}%`,
              transform: "translateX(-50%) translateY(-100%)",
              backgroundColor: "#fff",
              border: "1px solid #ccc",
              padding: "5px",
              borderRadius: "4px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
              zIndex: 1000,
            }}
          >
            <p className="tooltip-week">{currentWeekData.week}</p>
            <p className="tooltip-stage">
              Growth Stage: {currentWeekData.growthStage || "Unknown"}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default PlantGrowthActivity;
