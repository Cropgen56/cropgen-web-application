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
import { useSelector } from "react-redux";

// Generate data for curve
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
    currentWeek = Math.min(Math.max(Math.floor(daysSinceSowing / 7) + 1, 1), 13);
  }

  const data = generateCurveData(currentWeek, Crop_Growth_Stage);
  const currentWeekData = data.find((d) => d.weekNumber === currentWeek);

  return (
    <Card body className="bg-white rounded-lg p-4 sm:p-4 md:p-5 shadow-md">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg sm:text-xl font-semibold text-[#344e41] m-0">
            Plant Growth Activity
          </h2>
          <p className="text-sm sm:text-base text-gray-600 m-0">
            {cropName || "Unknown Crop"}
          </p>
        </div>

        {/* Dropdowns */}
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-auto">
            <select
              className="w-full py-2 px-6 text-sm border border-[#5a7c6b] rounded-full text-gray-700 appearance-none pr-8 bg-transparent bg-no-repeat bg-[right_0.75rem_center] bg-[length:1em] cursor-pointer"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e\")",
              }}
            >
              <option>Planting/Sowing</option>
              <option>Sowing</option>
              <option>Growth</option>
            </select>
          </div>
          <div className="relative w-full sm:w-auto">
            <select
              className="w-full py-2 px-6 text-sm border border-[#5a7c6b] rounded-full text-gray-700 appearance-none pr-8 bg-transparent bg-no-repeat bg-[right_0.75rem_center] bg-[length:1em] cursor-pointer"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e\")",
              }}
            >
              <option>Days</option>
              <option>Weeks</option>
              <option>Months</option>
            </select>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="relative w-full h-[200px] sm:h-[240px] md:h-[280px] bg-white">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorHeight" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3A8B0A" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#3A8B0A" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid stroke="#E5E7EB" strokeDasharray="3 3" horizontal vertical={false} />
            <XAxis
              dataKey="week"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#000", fontSize: 12, fontWeight: "bold" }}
            />
            <YAxis hide />
            <Area
              type="monotone"
              dataKey="height"
              stroke="#3A8B0A"
              fillOpacity={1}
              fill="url(#colorHeight)"
              name="Plant Height"
              dot={({ cx, cy, payload }) => {
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

        {/* Tooltip */}
        {currentWeekData && (
          <div
            className="absolute z-50 bg-[#7BB34F] text-white text-xs sm:text-sm px-3 py-1 rounded-md text-center whitespace-nowrap"
            style={{
              left: `${(currentWeekData.weekNumber / 13) * 100}%`,
              top: `${100 - (currentWeekData.height / 6) * 100 - 10}%`,
              transform: "translateX(-50%) translateY(-100%)",
            }}
          >
            <p className="font-bold m-0">{Crop_Growth_Stage}</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default PlantGrowthActivity;
