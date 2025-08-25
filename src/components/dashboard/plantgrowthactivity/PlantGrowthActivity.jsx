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
import { useSelector, useDispatch } from "react-redux";
import { formatToYYYYMMDD } from "../../../utility/convertYYYYMMDD";
import { getTheCropGrowthStage } from "../../../redux/slices/satelliteSlice";

// Generate chart data for Days/Weeks/Months
const generateCurveData = (interval, currentDay, bbchData) => {
  const totalDays = 13 * 7;
  const historicalData = bbchData?.historicalData?.daily || {};
  const timeData = historicalData.time || [];
  const tempMean = historicalData.temp_mean || [];
  const soilMoisture = historicalData.soil_moisture_5cm || [];
  const precipitation = historicalData.precipitation || [];

  if (interval === "Days") {
    return Array.from({ length: totalDays }, (_, i) => {
      const day = i + 1;
      const dayIndex = Math.min(i, timeData.length - 1);
      return {
        label: `Day ${day}`,
        height: Math.max(1, Math.sin(i / 10) * 3 + 4), // Placeholder growth curve
        index: day,
        date: timeData[dayIndex] || "",
        temp: tempMean[dayIndex] || null,
        soilMoisture: soilMoisture[dayIndex] || null,
        precipitation: precipitation[dayIndex] || null,
        stage: bbchData && day <= currentDay ? bbchData.finalStage?.stage : "",
        activity: bbchData && day <= currentDay ? bbchData.keyActivity : "",
      };
    });
  }

  // Weeks
  return Array.from({ length: 13 }, (_, i) => {
    const week = i + 1;
    const weekStartDay = (week - 1) * 7;
    const weekEndDay = Math.min(week * 7, timeData.length - 1);
    const weekData = timeData.slice(weekStartDay, weekEndDay);
    const avg = (arr) =>
      arr.length ? arr.reduce((a, b) => a + (b || 0), 0) / arr.length : null;

    return {
      label: `Week ${week}`,
      height: 1 + i * 0.5, // Placeholder growth curve
      index: week,
      date: weekData[0] || "",
      temp: avg(tempMean.slice(weekStartDay, weekEndDay)),
      soilMoisture: avg(soilMoisture.slice(weekStartDay, weekEndDay)),
      precipitation: avg(precipitation.slice(weekStartDay, weekEndDay)),
      stage:
        bbchData && week <= Math.ceil(currentDay / 7)
          ? bbchData.finalStage?.stage
          : "",
      activity:
        bbchData && week <= Math.ceil(currentDay / 7)
          ? bbchData.keyActivity
          : "",
    };
  });
};

// Tooltip component
const CustomTooltip = ({ active, payload, coordinate, chartWidth }) => {
  if (active && payload && payload.length) {
    const { stage, activity, date, temp, soilMoisture, precipitation } =
      payload[0].payload;
    const tooltipWidth = 200;
    const xPosition =
      coordinate.x + tooltipWidth > chartWidth
        ? coordinate.x - tooltipWidth - 10
        : coordinate.x + 10;

    return (
      <div
        className="bg-[#7BB34F] text-white text-xs p-3 rounded shadow-lg max-w-[200px]"
        style={{
          transform: `translate(${xPosition}px, ${coordinate.y - 100}px)`,
          position: "absolute",
          pointerEvents: "none",
        }}
      >
        <p className="font-bold text-sm">{stage || "Unknown Stage"}</p>
        {date && (
          <p>
            <strong>Date:</strong> {date}
          </p>
        )}
        <p>
          <strong>Key Activities:</strong>
          <br />
          {activity || "No activities available."}
        </p>
        {temp && (
          <p>
            <strong>Mean Temp:</strong> {temp.toFixed(1)}°C
          </p>
        )}
        {soilMoisture && (
          <p>
            <strong>Soil Moisture (5cm):</strong>{" "}
            {(soilMoisture * 100).toFixed(1)}%
          </p>
        )}
        {precipitation && (
          <p>
            <strong>Precipitation:</strong> {precipitation.toFixed(1)} mm
          </p>
        )}
      </div>
    );
  }
  return null;
};

const PlantGrowthActivity = ({ selectedFieldsDetials = [] }) => {
  const dispatch = useDispatch();
  const { cropName, sowingDate } = selectedFieldsDetials[0] || {};
  const aois = useSelector((state) => state.weather?.aois) || [];
  const bbchData = useSelector((state) => state.satellite?.bbchStage?.data);

  const isLoading = useSelector((state) => state.satellite?.bbchStage?.loading);
  const error = useSelector((state) => state.satellite?.bbchStage?.error);
  const [interval, setInterval] = useState("Weeks");
  const [chartWidth, setChartWidth] = useState(0);

  const today = new Date();
  const sowing = sowingDate ? new Date(sowingDate) : null;
  const daysSinceSowing = sowing
    ? Math.floor((today.getTime() - sowing.getTime()) / (1000 * 60 * 60 * 24)) +
      1
    : 1;
  const currentWeek = Math.min(Math.ceil(daysSinceSowing / 7), 13);

  // Update chart width for tooltip positioning
  useEffect(() => {
    const updateWidth = () => {
      const chartContainer = document.querySelector(".plant-growth-card");
      if (chartContainer) {
        setChartWidth(chartContainer.offsetWidth);
      }
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  // Dispatch Thunk to fetch BBCH data
  useEffect(() => {
    if (!cropName || !sowingDate || !selectedFieldsDetials[0]?._id) return;

    const selectedFieldId = selectedFieldsDetials[0]._id;
    const aoi = aois.find((a) => a.name === selectedFieldId);
    if (!aoi?.id) {
      dispatch({
        type: "FETCH_BBCH_STAGE_FAILURE",
        payload: "No matching AOI found",
      });
      return;
    }

    const payload = {
      cropName,
      sowingDate: formatToYYYYMMDD(sowingDate),
      currentDate: today.toISOString().split("T")[0],
      geometryId: aoi.id,
    };

    dispatch(getTheCropGrowthStage(payload));
  }, [cropName, sowingDate, aois, selectedFieldsDetials, dispatch]);

  const data = generateCurveData(interval, daysSinceSowing, bbchData);

  if (error) {
    return (
      <Card body className="text-red-500 p-4">
        Error: {error}
      </Card>
    );
  }

  return (
    <Card
      body
      className="bg-white rounded-lg p-4 border border-gray-300 shadow plant-growth-card"
    >
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

      {isLoading ? (
        <div className="w-full h-[200px] flex items-center justify-center">
          Loading...
        </div>
      ) : (
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
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#000", fontSize: "12px", fontWeight: "bold" }}
              />
              <YAxis hide />
              <Tooltip
                content={<CustomTooltip chartWidth={chartWidth} />}
                cursor={{ stroke: "#3A8B0A", strokeWidth: 1 }}
              />

              {interval === "Days" ? (
                <ReferenceLine
                  x={`Day ${daysSinceSowing}`}
                  stroke="red"
                  strokeDasharray="3 3"
                />
              ) : (
                <ReferenceLine
                  x={`Week ${currentWeek}`}
                  stroke="red"
                  strokeDasharray="3 3"
                />
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
      )}
    </Card>
  );
};

export default PlantGrowthActivity;
