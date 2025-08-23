import React, { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import Card from "react-bootstrap/Card";
import { useSelector } from "react-redux";
import axios from "axios";

// Generate chart data for Days/Weeks/Months
const generateCurveData = (interval, currentDay, bbchData) => {
  const totalDays = 13 * 7;

  if (interval === "Days") {
    return Array.from({ length: totalDays }, (_, i) => {
      const day = i + 1;
      return {
        label: `Day ${day}`,
        height: Math.max(1, Math.sin(i / 10) * 3 + 4),
        index: day,
        stage: bbchData && day <= currentDay ? bbchData.finalStage.stage : "",
        activity: bbchData && day <= currentDay ? bbchData.keyActivity : "",
      };
    });
  }

  // Weeks
  return Array.from({ length: 13 }, (_, i) => {
    const week = i + 1;
    return {
      label: `Week ${week}`,
      height: 1 + i * 0.5,
      index: week,
      stage: bbchData && week <= Math.ceil(currentDay / 7) ? bbchData.finalStage.stage : "",
      activity: bbchData && week <= Math.ceil(currentDay / 7) ? bbchData.keyActivity : "",
    };
  });
};

// Tooltip component
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const { stage, activity } = payload[0].payload;
    return (
      <div className="bg-[#7BB34F] text-white text-xs p-3 rounded shadow-lg max-w-[200px]">
        <p className="font-bold text-sm">{stage || "Unknown Stage"}</p>
        <p>Key Activities:<br />{activity || "No activities available."}</p>
      </div>
    );
  }
  return null;
};

const PlantGrowthActivity = ({ selectedFieldsDetials = [] }) => {
  const { cropName, sowingDate } = selectedFieldsDetials[0] || {};
  const aois = useSelector((state) => state.weather.aois) || [];
  const [interval, setInterval] = useState("Weeks");
  const [bbchData, setBbchData] = useState(null);

  const today = new Date();
  const sowing = sowingDate ? new Date(sowingDate) : null;
  const daysSinceSowing = sowing
    ? Math.floor((today.getTime() - sowing.getTime()) / (1000 * 60 * 60 * 24)) + 1
    : 1;
  const currentWeek = Math.min(Math.ceil(daysSinceSowing / 7), 13);

  // Fetch BBCH data based on AOI
useEffect(() => {
  const fetchBbch = async () => {
    if (!cropName || !sowingDate) return;

    // Find AOI for selected field
    const selectedFieldId = selectedFieldsDetials[0]?._id;
    const aoi = aois.find((a) => a.name === selectedFieldId);
    if (!aoi?.id) return;

    const payload = {
      cropName,
      sowingDate,
      currentDate: today.toISOString().split("T")[0],
      geometryId: aoi.id,
    };
    console.log(payload)

    try {
      const response = await axios.post(
        "https://server.cropgenapp.com/v2/api/bbch-stage",
        payload
      );

      console.log("BBCH API Response:", response.data); // <- Log the response here

      if (response.data.success) {
        setBbchData(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch BBCH stage:", error);
    }
  };

  fetchBbch();
}, [cropName, sowingDate, aois, selectedFieldsDetials, today]);



  const data = generateCurveData(interval, daysSinceSowing, bbchData);

  return (
    <Card body className="bg-white rounded-lg p-4 border border-gray-300 shadow plant-growth-card">
      <div className="flex justify-between items-start mb-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-sm lg:text-xl font-semibold text-[#344e41] m-0">
            Plant Growth Activity
          </h2>
          <div className="text-sm text-gray-600 md:text-xs">
            {cropName || "Unknown Crop"}
          </div>
        </div>

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
        </div>
      </div>

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

            {/* Marker for current day/week */}
            {interval === "Days" ? (
              <ReferenceLine x={`Day ${daysSinceSowing}`} stroke="red" strokeDasharray="3 3" />
            ) : (
              <ReferenceLine x={`Week ${currentWeek}`} stroke="red" strokeDasharray="3 3" />
            )}

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