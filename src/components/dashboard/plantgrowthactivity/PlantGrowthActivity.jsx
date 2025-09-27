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
import { useSelector, useDispatch } from "react-redux";
import { formatToYYYYMMDD } from "../../../utility/convertYYYYMMDD";
import { getTheCropGrowthStage } from "../../../redux/slices/satelliteSlice";
import { calculateAiYield } from "../../../redux/slices/satelliteSlice";
import PlantGrowthSkeleton from "../../Skeleton/PlantGrowthSkeleton";

// Define Green Theme Colors for decoration (Standard Growth Theme)
const GRASS_COLOR_MAIN = "#86D72F"; // Bright Green
const GRASS_COLOR_LIGHT = "#7CC520"; // Medium Green
const GRASS_COLOR_ACCENT = "#6FB51A"; // Darker Green

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
  const regexDash = /^\d{4}-\d{2}-\d{2}$/;
  const regexSlash = /^\d{4}\/\d{2}\/\d{2}$/;
  if (
    typeof dateInput === "string" &&
    (regexDash.test(dateInput) || regexSlash.test(dateInput))
  ) {
    const date = new Date(dateInput.replace(/\//g, "-"));
    return !isNaN(date.getTime());
  }
  const date = new Date(dateInput);
  return !isNaN(date.getTime());
};

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

  // Use "Weeks" as the default interval if data suggests a long growth cycle
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
      formattedCurrentDate = "2025-08-25"; // Fallback
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
  }, [cropGrowthStage, dispatch, selectedFieldsDetials]);

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
      // Reduced padding/margin on the outer container for consistency
      <div className="w-full flex justify-center mt-6"> 
        <div className="relative w-full max-w-6xl bg-gradient-to-br from-[#5A7C6B] to-[#344E41] rounded-2xl shadow-lg text-white p-4 md:p-5">
          <div className="w-full  flex items-center justify-center bg-white/10 rounded-lg p-4">
            <span className="text-white/80 text-sm">
              Invalid sowing date. Please provide a valid date.
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex  mt-6"> {/* Reduced top margin from 8 to 6 */}
      {/* Outer Container: Reduced padding slightly, maintaining dark gradient */}
      <div className="relative w-full bg-gradient-to-br from-[#5A7C6B] to-[#344E41] rounded-2xl shadow-lg text-white flex flex-col overflow-hidden p-3 md:p-5">
        
        <div className="relative z-10 w-full bg-white/10 backdrop-blur-sm rounded-xl p-3 "> {/* Inner panel slightly tighter padding */}

          <div className="flex justify-between items-start mb-2"> {/* Reduced mb gap */}
            <div className="flex flex-col gap-0.5"> {/* Reduced gap between title/subtitle */}
              <h2 className="text-xl font-semibold text-white m-0">
                Plant Growth Activity
              </h2>
              <div className="text-sm text-gray-300">
                {cropName || "Unknown Crop"}
              </div>
              <div className="text-sm text-gray-300">{suggestion}</div>
            </div>
            <select
              value={interval}
              onChange={(e) => setInterval(e.target.value)}
              className="w-[100px] h-[35px] px-2 py-1 text-sm border-2 border-white/30 rounded-full bg-white/20 text-white focus:outline-none cursor-pointer"
            >
              <option value="Days" className="text-gray-800">Days</option>
              <option value="Weeks" className="text-gray-800">Weeks</option>
            </select>
          </div>

          {isLoading ? (
            <PlantGrowthSkeleton />
          ) : (
            // *** HEIGHT REDUCTION APPLIED HERE ***
            // Chart height reduced from 350px to 300px for less vertical space.
            // Height is managed by the container div for responsiveness.
            <div className="w-full h-[300px]"> 
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={data}
                  // Adjusted margins: reduced top padding significantly
                  margin={{ top: 60, right: 30, left: 30, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorHeight" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={GRASS_COLOR_MAIN} stopOpacity={0.8} />
                      <stop offset="95%" stopColor={GRASS_COLOR_MAIN} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.2)" vertical={false} />
                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#fff", fontSize: "11px", fontWeight: "bold" }} // Slightly smaller font
                    interval={Math.ceil(data.length / 10)}
                  />
                  <YAxis hide />
                  <ReferenceLine
                    x={referenceData.label}
                    stroke={GRASS_COLOR_MAIN}
                    strokeWidth={2}
                  />
                  <ReferenceDot
                    x={referenceData.label}
                    y={referenceData.height}
                    r={0}
                    fill={GRASS_COLOR_MAIN}
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
                    stroke={GRASS_COLOR_MAIN}
                    fillOpacity={1}
                    fill="url(#colorHeight)"
                    name="Plant Height"
                  />
                </AreaChart>
              </ResponsiveContainer>
              {/* Always visible Tooltip */}
              {tooltipPos && (
                <div
                  className="absolute z-50 bg-[#344E41] text-white text-xs p-2 rounded shadow-xl max-w-[280px]" // Slightly tighter tooltip box
                  style={{
                    left: Math.max(10, tooltipPos.x - 100),
                    top: Math.max(10, tooltipPos.y - 50),
                  }}
                >
                  <p className="font-bold sm:text-base">
                    {cropGrowthStage?.finalStage?.stage || "Unknown Stage"}
                  </p>
                  <p className="font-semibold mb-1">Key Activities:</p>
                  <ul className="list-disc list-inside space-y-1 max-h-[140px] overflow-auto"> {/* Tighter list max height */}
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
                  <p className="italic mt-1 text-gray-400">
                    {interval === "Days"
                      ? formatDayToWeekDay(daysSinceSowing)
                      : `Week ${currentWeek}`}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default PlantGrowthActivity;