import React, { useState } from "react";
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
import { useSelector } from "react-redux";

// Utility function to generate data based on selected interval
const generateCurveData = (interval, currentWeek, cropGrowthStage) => {
  if (interval === "Days") {
    return Array.from({ length: 13 * 7 }, (_, i) => ({
      label: `Day ${i + 1}`,
      height: Math.max(1, Math.sin(i / 10) * 3 + 4),
      index: i + 1,
      growthStage: i === (currentWeek - 1) * 7 ? cropGrowthStage : "",
    }));
  }

  if (interval === "Months") {
    return Array.from({ length: 4 }, (_, i) => ({
      label: `Month ${i + 1}`,
      height: [1.2, 3, 5.2, 6.5][i],
      index: i + 1,
      growthStage: i + 1 === Math.ceil(currentWeek / 4) ? cropGrowthStage : "",
    }));
  }

  // Default: Weeks
  return [
    { label: "Week 1", height: 1 },
    { label: "Week 2", height: 1.5 },
    { label: "Week 3", height: 2 },
    { label: "Week 4", height: 2.4 },
    { label: "Week 5", height: 3.2 },
    { label: "Week 6", height: 4 },
    { label: "Week 7", height: 4.8 },
    { label: "Week 8", height: 5 },
    { label: "Week 9", height: 5.5 },
    { label: "Week 10", height: 5.8 },
    { label: "Week 11", height: 6 },
    { label: "Week 12", height: 6.3 },
    { label: "Week 13", height: 6.5 },
  ].map((item, idx) => ({
    ...item,
    index: idx + 1,
    growthStage: idx + 1 === currentWeek ? cropGrowthStage : "",
  }));
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const { growthStage } = payload[0].payload;

    return (
      <div className="bg-[#7BB34F] text-white text-xs p-3 rounded shadow-lg max-w-[200px]">
        <p className="font-bold text-sm">{growthStage || "Unknown Stage"}</p>
        <p>Key Activities:<br />Fertilization, pest control.</p>
      </div>
    );
  }
  return null;
};

const PlantGrowthActivity = ({ selectedFieldsDetials = [] }) => {
  const { cropName, sowingDate } = selectedFieldsDetials[0] || {};
  const { NpkData } = useSelector((state) => state.satellite);
  const { Crop_Growth_Stage } = NpkData || {};

  const [interval, setInterval] = useState("Weeks");
  const [plantingType, setPlantingType] = useState("Planting/Sowing");

  const today = new Date("2025-05-29T14:25:00+05:30");
  const sowing = sowingDate ? new Date(sowingDate) : null;
  let currentWeek = 1;

  if (sowing) {
    const timeDiff = today.getTime() - sowing.getTime();
    const daysSinceSowing = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    currentWeek = Math.min(Math.max(Math.floor(daysSinceSowing / 7) + 1, 1), 13);
  }

  const data = generateCurveData(interval, currentWeek, Crop_Growth_Stage);

  return (
    <Card body className="bg-white rounded-lg p-4 border border-gray-300 shadow plant-growth-card">
      <div className="flex justify-between items-start mb-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-sm lg:text-xl font-semibold whitespace-nowrap text-[#344e41] m-0">
            Plant Growth Activity
          </h2>
          <div className="text-sm text-gray-600 md:text-xs">
            {cropName || "Unknown Crop"}
          </div>
        </div>

        {/* Dropdowns */}
        <div className="flex gap-2">
          {/* Planting/Sowing dropdown */}
          <div className="relative md:w-[160px] w-[180px] h-[40px]">
            <select
              value={plantingType}
              onChange={(e) => setPlantingType(e.target.value)}
              className="w-full h-full px-3 pr-10 py-2 text-sm border-2 border-[#5a7c6b] rounded-full bg-white text-gray-600 appearance-none focus:outline-none cursor-pointer"
            >
              <option>Planting/Sowing</option>
              <option>Sowing</option>
              <option>Growth</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
              <svg className="w-4 h-4 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 011.08 1.04l-4.25 4.25a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>

          {/* Interval dropdown (Days, Weeks, Months) */}
          <div className="relative w-[100px] h-[40px]">
            <select
              value={interval}
              onChange={(e) => setInterval(e.target.value)}
              className="w-full h-full px-2 pr-10 py-2 text-sm border-2 border-[#5a7c6b] rounded-full bg-white text-gray-600 appearance-none focus:outline-none cursor-pointer"
            >
              <option>Days</option>
              <option>Weeks</option>
              <option>Months</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
              <svg className="w-4 h-4 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 011.08 1.04l-4.25 4.25a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="w-full h-[200px] relative">
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorHeight" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3A8B0A" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#3A8B0A" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid stroke="#ccc" vertical={false} />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#000", fontSize: "12px", fontWeight: "bold" }}
            />
            <YAxis hide />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#3A8B0A", strokeWidth: 1 }} />

            <Area
              type="monotone"
              dataKey="height"
              stroke="#3A8B0A"
              fillOpacity={1}
              fill="url(#colorHeight)"
              name="Plant Height"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default PlantGrowthActivity;
