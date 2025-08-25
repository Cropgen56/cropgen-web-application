import React, { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceDot,
} from "recharts";
import Card from "react-bootstrap/Card";
import { useSelector, useDispatch } from "react-redux";
import { formatToYYYYMMDD } from "../../../utility/convertYYYYMMDD";
import { getTheCropGrowthStage } from "../../../redux/slices/satelliteSlice";

// ✅ Helper: Convert day index → "Week n, Day m"
const formatDayToWeekDay = (day) => {
  const week = Math.ceil(day / 7);
  const dayOfWeek = ((day - 1) % 7) + 1;
  return `Week ${week}, Day ${dayOfWeek}`;
};

// ✅ Custom Tooltip above the dot
const CustomTooltip = ({ viewBox, stage, activity, timeLabel }) => {
  if (!viewBox) return null;
  const { x, y } = viewBox;

  const activities = Array.isArray(activity) ? activity : [activity];

  return (
    <foreignObject x={x - 80} y={y - 200} width={300} height={200}>
      <div className="bg-[#7BB34F] text-white text-xs p-2 rounded shadow-lg max-h-[400px] overflow-auto">
        <p className="font-bold text-sm">{stage}</p>
        <p className="font-semibold mb-1">Key Activities:</p>
        <ul className="list-disc list-inside space-y-1">
          {activities.map((act, idx) => (
            <li key={idx} className="whitespace-normal">
              {act}
            </li>
          ))}
        </ul>
        <p className="italic mt-1">{timeLabel}</p>
      </div>
    </foreignObject>
  );
};
// Generate chart data for Days/Weeks
const generateCurveData = (interval) => {
  const totalDays = 13 * 7;

  if (interval === "Days") {
    return Array.from({ length: totalDays }, (_, i) => {
      const day = i + 1;
      return {
        label: `Day ${day}`,
        height: Math.max(1, Math.sin(i / 10) * 3 + 4),
        index: day,
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
    };
  });
};

const PlantGrowthActivity = ({ selectedFieldsDetials = [] }) => {
  const dispatch = useDispatch();
  const { cropName, sowingDate } = selectedFieldsDetials[0] || {};
  const aois = useSelector((state) => state.weather?.aois) || [];

  const cropGrowthStage = useSelector(
    (state) => state.satellite?.cropGrowthStage
  );
  const bbchData = cropGrowthStage;
  const isLoading = useSelector(
    (state) => state.satellite?.loading?.cropGrowthStage
  );
  const error = useSelector((state) => state.satellite?.error);

  const [interval, setInterval] = useState("Weeks");

  const today = new Date();
  const sowing = sowingDate ? new Date(sowingDate) : null;
  const daysSinceSowing = sowing
    ? Math.floor((today.getTime() - sowing.getTime()) / (1000 * 60 * 60 * 24)) +
      1
    : 1;
  const currentWeek = Math.min(Math.ceil(daysSinceSowing / 7), 13);

  useEffect(() => {
    if (!cropName || !sowingDate || !selectedFieldsDetials[0]?._id) return;

    const selectedFieldId = selectedFieldsDetials[0]._id;
    const aoi = aois.find((a) => a.name === selectedFieldId);
    if (!aoi?.id) return;

    const payload = {
      cropName,
      sowingDate: formatToYYYYMMDD(sowingDate),
      currentDate: today.toISOString().split("T")[0],
      geometryId: aoi.id,
    };

    dispatch(getTheCropGrowthStage(payload));
  }, [cropName, sowingDate, aois, selectedFieldsDetials, dispatch]);

  const data = generateCurveData(interval);

  if (error) {
    return (
      <Card body className="text-red-500 p-4">
        Error:{" "}
        {typeof error === "object"
          ? error?.detail || JSON.stringify(error)
          : error}
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
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="w-full h-[350px] flex items-center justify-center">
          Loading...
        </div>
      ) : (
        <div className="w-full h-[350px] relative">
          <ResponsiveContainer>
            <AreaChart
              data={data}
              margin={{ top: 80, right: 20, left: 0, bottom: 0 }} // more top margin
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

              {/* ✅ Green Reference Line */}
              {interval === "Days" ? (
                <ReferenceLine
                  x={`Day ${daysSinceSowing}`}
                  stroke="#3A8B0A"
                  strokeWidth={2}
                />
              ) : (
                <ReferenceLine
                  x={`Week ${currentWeek}`}
                  stroke="#3A8B0A"
                  strokeWidth={2}
                />
              )}

              {/* ✅ ReferenceDot with Custom Tooltip */}
              <ReferenceDot
                x={
                  interval === "Days"
                    ? `Day ${daysSinceSowing}`
                    : `Week ${currentWeek}`
                }
                y={
                  data.find(
                    (d) =>
                      d.label ===
                      (interval === "Days"
                        ? `Day ${daysSinceSowing}`
                        : `Week ${currentWeek}`)
                  )?.height
                }
                r={0}
                isFront
                label={
                  <CustomTooltip
                    stage={bbchData?.finalStage?.stage || "Unknown Stage"}
                    activity={
                      bbchData?.keyActivity || "No activities available"
                    }
                    timeLabel={
                      interval === "Days"
                        ? formatDayToWeekDay(daysSinceSowing)
                        : `Week ${currentWeek}`
                    }
                  />
                }
              />

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
