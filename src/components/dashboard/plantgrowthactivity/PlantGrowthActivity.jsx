import React, { useState, useEffect, useMemo, memo } from "react";
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
import { calculateAiYield } from "../../../redux/slices/satelliteSlice";

// Crop growth duration mapping (in weeks)
const CROP_GROWTH_DURATIONS = {
  Barley: 12,
  Wheat: 14,
  PearlMillet: 10,
  Sorghum: 12,
  FingerMillet: 12,
  Chickpea: 14,
  RedGram: 20,
  GreenGram: 10,
  BlackGram: 10,
  Lentil: 14,
  FieldPea: 14,
  HorseGram: 12,
  Cowpea: 12,
  Groundnut: 14,
  Mustard: 14,
  Soybean: 14,
  Sunflower: 12,
  Sesame: 12,
  Linseed: 14,
  Castor: 20,
  Safflower: 14,
  Niger: 12,
  Sugarcane: 40,
  Cotton: 20,
  Jute: 16,
  Tobacco: 16,
  Potato: 12,
  Tomato: 12,
  Brinjal: 12,
  Cabbage: 12,
  Cauliflower: 12,
  Onion: 16,
  Garlic: 16,
  Okra: 10,
  Carrot: 12,
  Radish: 6,
  Spinach: 6,
  Methi: 6,
  GreenPeas: 10,
  BitterGourd: 10,
  BottleGourd: 10,
  Pumpkin: 12,
  Cucumber: 8,
  Beans: 8,
  Mango: 52,
  Banana: 40,
  Guava: 52,
  Apple: 52,
  Papaya: 40,
  Orange: 52,
  Lemon: 52,
  Pomegranate: 52,
  Grapes: 52,
  Pineapple: 52,
  Watermelon: 10,
  Muskmelon: 10,
  Turmeric: 32,
  Ginger: 32,
  Coriander: 6,
  Cumin: 12,
  BlackPepper: 52,
  RedChilies: 12,
  Tea: 52,
  Coffee: 52,
  Coconut: 52,
  Arecanut: 52,
  Rubber: 52,
  DragonFruit: 52,
  SpongeGourd: 10,
  SnakeGourd: 10,
  AshGourd: 12,
  Drumstick: 52,
  Chili: 12,
  Chia: 12,
  Rice: 16,
  Kiwi: 52,
  Amla: 52,
  Capsicum: 12,
  Other: 13,
};

// Helper: Convert day index to "Week n, Day m"
const formatDayToWeekDay = (day) => {
  const week = Math.ceil(day / 7);
  const dayOfWeek = ((day - 1) % 7) + 1;
  return `Week ${week}, Day ${dayOfWeek}`;
};

// Helper: Validate date for formatToYYYYMMDD
const isValidDate = (dateInput) => {
  if (!dateInput) return false;

  // Check for yyyy-mm-dd or yyyy/mm/dd formats
  const regexDash = /^\d{4}-\d{2}-\d{2}$/;
  const regexSlash = /^\d{4}\/\d{2}\/\d{2}$/;
  if (
    typeof dateInput === "string" &&
    (regexDash.test(dateInput) || regexSlash.test(dateInput))
  ) {
    // Additional validation to ensure the date is parseable
    const date = new Date(dateInput.replace(/\//g, "-"));
    return !isNaN(date.getTime());
  }

  // Check if it's a valid Date object or parseable string
  const date = new Date(dateInput);
  return !isNaN(date.getTime());
};

// Custom Tooltip for ReferenceDot
// const CustomTooltip = ({ viewBox, stage, activity, timeLabel }) => {
//   if (!viewBox) return null;
//   const { x, y } = viewBox;
//   const activities = Array.isArray(activity) ? activity : [activity];

//   // Adjust position to prevent tooltip from being cut off
//   const tooltipWidth = window.innerWidth < 640 ? 150 : 300;
//   const tooltipX = Math.max(
//     10,
//     Math.min(x - tooltipWidth / 2, window.innerWidth - tooltipWidth - 10)
//   );

//   return (
//     <foreignObject
//       x={tooltipX}
//       y={y - 220}
//       width={tooltipWidth}
//       height={200}
//       className="absolute z-10"
//     >
//       <div className="bg-[#7BB34F] text-white text-xs p-2 rounded shadow-lg max-h-[200px] overflow-auto sm:text-sm ">
//         <p className="font-bold sm:text-base">{stage}</p>
//         <p className="font-semibold mb-1">Key Activities:</p>
//         <ul className="list-disc list-inside space-y-1">
//           {activities.map((act, idx) => (
//             <li key={idx}>{act}</li>
//           ))}
//         </ul>
//         <p className="italic mt-1">{timeLabel}</p>
//       </div>
//     </foreignObject>
//   );
// };

// Generate chart data for Days/Weeks
const generateCurveData = (interval, cropName) => {
  const totalWeeks =
    CROP_GROWTH_DURATIONS[cropName] || CROP_GROWTH_DURATIONS.Other;
  const totalDays = totalWeeks * 7;

  if (interval === "Days") {
    return Array.from({ length: totalDays }, (_, i) => ({
      label: `Day ${i + 1}`,
      height: Math.max(1, Math.sin(i / 10) * 3 + 4),
      index: i + 1,
    }));
  }

  return Array.from({ length: totalWeeks }, (_, i) => ({
    label: `Week ${i + 1}`,
    height: 1 + i * 0.5,
    index: i + 1,
  }));
};

// Memoize component to prevent unnecessary re-renders
const PlantGrowthActivity = memo(({ selectedFieldsDetials = [] }) => {
  const dispatch = useDispatch();
  const {
    cropName,
    sowingDate,
    _id: selectedFieldId,
  } = selectedFieldsDetials[0] || {};
  const aois = useSelector((state) => state.weather?.aois || []);
  const { cropGrowthStage, loading } = useSelector(
    (state) => state.satellite || {}
  );
  const isLoading = loading?.cropGrowthStage || false;

  const [interval, setInterval] = React.useState("Weeks");
  const [tooltipPos, setTooltipPos] = useState(null);

  // Memoize daysSinceSowing, currentWeek, date validity, and suggestion
  const {
    daysSinceSowing,
    currentWeek,
    isSowingDateValid,
    currentDate,
    suggestion,
  } = useMemo(() => {
    const isSowingValid = isValidDate(sowingDate);
    const today = new Date(); // Dynamic current date
    const isTodayValid = isValidDate(today);
    let formattedCurrentDate = "";
    if (isTodayValid) {
      formattedCurrentDate = formatToYYYYMMDD(today);
    } else {
      // Fallback (unlikely with new Date())
      formattedCurrentDate = "2025-08-25";
    }
    const sowing = isSowingValid ? new Date(sowingDate) : null;
    const days = sowing
      ? Math.max(
          1,
          Math.floor(
            (today.getTime() - sowing.getTime()) / (1000 * 60 * 60 * 24)
          ) + 1
        )
      : 1;
    const maxWeeks =
      CROP_GROWTH_DURATIONS[cropName] || CROP_GROWTH_DURATIONS.Other;

    // Generate suggestion based on BBCH stage
    let suggestionText = "Awaiting growth stage data...";
    if (cropGrowthStage?.finalStage?.stage && cropGrowthStage?.keyActivity) {
      const stage = cropGrowthStage.finalStage.stage;
      const activity = Array.isArray(cropGrowthStage.keyActivity)
        ? cropGrowthStage.keyActivity.join(", ")
        : cropGrowthStage.keyActivity;
      suggestionText = `Based on BBCH stage ${stage}.`;
    } else if (cropGrowthStage?.finalStage?.stage) {
      suggestionText = `Based on BBCH stage ${cropGrowthStage.finalStage.stage}, monitor crop development.`;
    }

    return {
      daysSinceSowing: days,
      currentWeek: Math.min(Math.ceil(days / 7), maxWeeks),
      isSowingDateValid: isSowingValid,
      currentDate: formattedCurrentDate,
      suggestion: suggestionText,
    };
  }, [sowingDate, cropName, cropGrowthStage]);

  // Fetch crop growth stage
  useEffect(() => {
    if (
      !cropName ||
      !sowingDate ||
      !isSowingDateValid ||
      !selectedFieldId ||
      !aois.length
    )
      return;

    const aoi = aois.find((a) => a.name === selectedFieldId);
    if (!aoi?.id) return;

    const payload = {
      cropName,
      sowingDate: formatToYYYYMMDD(sowingDate),
      currentDate,
      geometryId: aoi.id,
    };
    dispatch(getTheCropGrowthStage(payload));
  }, [
    cropName,
    sowingDate,
    isSowingDateValid,
    currentDate,
    selectedFieldId,
    aois,
    dispatch,
  ]);

  useEffect(() => {
    if (cropGrowthStage?.finalStage?.bbch) {
      dispatch(
        calculateAiYield({
          cropDetials: selectedFieldsDetials[0],
          cropGrowthStage: cropGrowthStage?.finalStage?.bbch,
        })
      );
    }
  }, [cropGrowthStage]);

  // Memoize chart data
  const data = useMemo(
    () => generateCurveData(interval, cropName),
    [interval, cropName]
  );

  // Memoize reference point data
  const referenceData = useMemo(() => {
    const label =
      interval === "Days" ? `Day ${daysSinceSowing}` : `Week ${currentWeek}`;
    const height = data.find((d) => d.label === label)?.height ?? 1;
    return { label, height };
  }, [interval, daysSinceSowing, currentWeek, data]);

  if (!isSowingDateValid) {
    return (
      <Card
        body
        className="bg-white rounded-lg p-4 border border-gray-300 shadow"
      >
        <div className="w-full h-[350px] flex items-center justify-center">
          <span className="text-gray-600 text-sm">
            Invalid sowing date. Please provide a valid date.
          </span>
        </div>
      </Card>
    );
  }

  return (
    <Card
      body
      className="bg-white rounded-lg p-4 border border-gray-300 shadow"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold text-[#344e41] m-0">
            Plant Growth Activity
          </h2>
          <div className="text-sm text-gray-600">
            {cropName || "Unknown Crop"}
          </div>
          <div className="text-sm text-gray-600">{suggestion}</div>
        </div>
        <select
          value={interval}
          onChange={(e) => setInterval(e.target.value)}
          className="w-[100px] h-[40px] px-2 pr-10 py-2 text-sm border-2 border-[#5a7c6b] rounded-full bg-white text-gray-600 focus:outline-none cursor-pointer"
        >
          <option>Days</option>
          <option>Weeks</option>
        </select>
      </div>

      {isLoading ? (
        <div className="w-full h-[350px] flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-[#3A8B0A] border-t-transparent rounded-full animate-spin"></div>
            <span className="mt-2 text-gray-600 text-sm">
              Loading growth data...
            </span>
          </div>
        </div>
      ) : (
        <div className="w-full h-[350px]">
          <ResponsiveContainer>
            <AreaChart
              data={data}
              margin={{ top: 80, right: 30, left: 30, bottom: 0 }}
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
                interval={Math.ceil(data.length / 10)}
              />
              <YAxis hide />
              <ReferenceLine
                x={referenceData.label}
                stroke="#3A8B0A"
                strokeWidth={2}
              />
              <ReferenceDot
                x={referenceData.label}
                y={referenceData.height}
                r={0}
                fill="#3A8B0A"
                isFront={true}
                label={({ viewBox }) => {
                  if (!viewBox) return null;
                  const { x, y } = viewBox;
                  if (!tooltipPos || tooltipPos.x !== x || tooltipPos.y !== y) {
                    setTooltipPos({ x, y });
                  }
                  return null;
                }}
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
          {/* Always visible Tooltip */}
          {tooltipPos && (
            <div
              className="absolute z-50 bg-[#7BB34F] text-white text-xs p-2 rounded shadow-lg max-w-[300px]"
              style={{
                left: Math.max(10, tooltipPos.x - 100),
                top: Math.max(10, tooltipPos.y - 50),
              }}
            >
              <p className="font-bold sm:text-base">
                {cropGrowthStage?.finalStage?.stage || "Unknown Stage"}
              </p>
              <p className="font-semibold mb-1">Key Activities:</p>
              <ul className="list-disc list-inside space-y-1 max-h-[150px] overflow-auto">
                {Array.isArray(cropGrowthStage?.keyActivity) ? (
                  cropGrowthStage.keyActivity.map((act, idx) => (
                    <li key={idx}>{act}</li>
                  ))
                ) : (
                  <li>
                    {cropGrowthStage?.keyActivity || "No activities available"}
                  </li>
                )}
              </ul>
              <p className="italic mt-1">
                {interval === "Days"
                  ? formatDayToWeekDay(daysSinceSowing)
                  : `Week ${currentWeek}`}
              </p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
});

export default PlantGrowthActivity;
