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

// Generate data to match the curve in the image
const generateCurveData = (currentWeek, cropGrowthStage) => {
  const data = [
    { week: "Week 1", height: 0, weekNumber: 1 },
    { week: "Week 2", height: 0.9, weekNumber: 2 },
    { week: "Week 3", height: 1.5, weekNumber: 3 },
    { week: "Week 4", height: 1.8, weekNumber: 4 },
    { week: "Week 5", height: 2.5, weekNumber: 5 },
    { week: "Week 6", height: 4, weekNumber: 6 },
    { week: "Week 7", height: 4.9, weekNumber: 7 },
    { week: "Week 8", height: 5, weekNumber: 8 },
    { week: "Week 9", height: 6, weekNumber: 9 },
    { week: "Week 10", height: 6.5, weekNumber: 10 },
    { week: "Week 11", height: 7, weekNumber: 11 },
    { week: "Week 12", height: 7.5, weekNumber: 12 },
    { week: "Week 13", height: 8, weekNumber: 13 },
  ].map((item) => ({
    ...item,
    growthStage:
      item.weekNumber === currentWeek ? cropGrowthStage || "Unknown" : "",
  }));
  return data;
};

const PlantGrowthActivity = ({ selectedFieldsDetials = [] }) => {
  const { cropName, sowingDate } = selectedFieldsDetials[0] || {};
  const { NpkData } = useSelector((state) => state.satellite);
  const { Crop_Growth_Stage } = NpkData || {};

  const today = new Date("2025-05-29T14:25:00+05:30");
  const sowing = sowingDate ? new Date(sowingDate) : null;
  let currentWeek = 1;

  if (sowing) {
    const timeDiff = today.getTime() - sowing.getTime();
    const daysSinceSowing = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    currentWeek = Math.min(
      Math.max(Math.floor(daysSinceSowing / 7) + 1, 1),
      13
    );
  }

  const data = generateCurveData(currentWeek, Crop_Growth_Stage);
  const currentWeekData = data.find((d) => d.weekNumber === currentWeek);

  return (
    <Card body className="plant-growth-card shadow">
      <div className="header-container">
        <div className="heading-container">
          <h2 className="header-title">Plant Growth Activity</h2>
          <div className="subheader-text">{cropName || "Unknown Crop"}</div>
        </div>
        <div className="dropdown-container">
          <div className="custom-dropdown">
            <select aria-label="Select Activity Phase">
              <option>Planting/Sowing</option>
              <option>Sowing</option>
              <option>Growth</option>
            </select>
          </div>
          <div className="custom-dropdown">
            <select aria-label="Select Time Period">
              <option>Days</option>
              <option>Weeks</option>
              <option>Months</option>
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
                <stop offset="5%" stopColor="#3A8B0A" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#3A8B0A" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#ccc" vertical={false} />
            <XAxis
              dataKey="week"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#000", fontSize: "12px", fontWeight: "bold" }}
            />
            <YAxis hide />
            <Area
              type="monotone"
              dataKey="height"
              stroke="#3A8B0A"
              fillOpacity={1}
              fill="url(#colorHeight)"
              name="Plant Height"
              dot={(props) => {
                const { cx, cy, payload } = props;
                if (
                  payload.weekNumber === currentWeek ||
                  payload.weekNumber === data.length
                ) {
                  return (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={4}
                      fill="#4B970F"
                      stroke="#fff"
                      strokeWidth={2}
                    />
                  );
                }
                return null;
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
        {currentWeekData && (
          <div
            className="custom-tooltip"
            style={{
              position: "absolute",
              left: `${(currentWeekData.weekNumber / 13) * 100}%`,
              top: `${100 - (currentWeekData.height / 6) * 100 - 10}%`,
              transform: "translateX(-50%) translateY(-100%)",
              backgroundColor: "#7BB34F",
              color: "#fff",
              padding: "5px 10px",
              borderRadius: "4px",
              zIndex: 1000,
            }}
          >
            <p className="tooltip-stage">{Crop_Growth_Stage}</p>
            {/* <p className="tooltip-info">Fertilization, pest control</p> */}
          </div>
        )}
      </div>
    </Card>
  );
};

export default PlantGrowthActivity;
