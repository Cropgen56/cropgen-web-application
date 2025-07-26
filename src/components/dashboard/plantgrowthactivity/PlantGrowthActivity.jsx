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
    <Card
      body
      className="md:h-[225px] bg-white rounded-lg p-4 md:p-3 sm:p-2 border border-gray-300 shadow plant-growth-card"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-sm lg:text-xl font-semibold whitespace-nowrap text-[#344e41] m-0">
            Plant Growth Activity
          </h2>
          <div className="text-sm text-gray-600 md:text-xs">
            {cropName || "Unknown Crop"}
          </div>
        </div>

        {/* Right dropdowns */}
        <div className="flex gap-2">
          {/* Dropdown 1 */}
          <div className="relative md:w-[160px] w-[180px] h-[40px]">
            <select
              className="w-full h-full px-6 pr-10 py-2 text-sm border-2 border-[#5a7c6b] rounded-full bg-white text-gray-600 appearance-none focus:outline-none cursor-pointer"
            >
              <option>Planting/Sowing</option>
              <option>Sowing</option>
              <option>Growth</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
              <svg
                className="w-4 h-4 text-gray-600"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 011.08 1.04l-4.25 4.25a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>

          {/* Dropdown 2 */}
          <div className="relative w-[100px] h-[40px]">
            <select
              className="w-full h-full px-6 pr-10 py-2 text-sm border-2 border-[#5a7c6b] rounded-full bg-white text-gray-600 appearance-none focus:outline-none cursor-pointer"
            >
              <option>Days</option>
              <option>Weeks</option>
              <option>Months</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
              <svg
                className="w-4 h-4 text-gray-600"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
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
            className="absolute z-10 text-white text-center text-xs p-2 rounded bg-[#7BB34F]"
            style={{
              left: `${(currentWeekData.weekNumber / 13) * 100}%`,
              top: `${100 - (currentWeekData.height / 6) * 100 - 10}%`,
              transform: "translateX(-50%) translateY(-100%)",
            }}
          >
            <p className="m-0 text-sm font-bold">{Crop_Growth_Stage}</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default PlantGrowthActivity;
