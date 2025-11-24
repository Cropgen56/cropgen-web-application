import React, { useState, useMemo, memo } from "react";
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
import { useSelector } from "react-redux";
import PlantGrowthSkeleton from "../Skeleton/PlantGrowthSkeleton.jsx";
import PremiumContentWrapper from "../subscription/PremiumContentWrapper.jsx";
import { selectHasCropGrowthMonitoring } from "../../redux/slices/membershipSlice.js";

const GRASS_COLOR_MAIN = "#86D72F";

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

const formatDayToWeekDay = (day) => {
  const week = Math.ceil(day / 7);
  const dayOfWeek = ((day - 1) % 7) + 1;
  return `Week ${week}, Day ${dayOfWeek}`;
};

const PlantGrowthActivity = memo(
  ({ selectedFieldsDetials = [], onSubscribe }) => {
    const advisoryState = useSelector((s) => s.smartAdvisory?.advisory || null);
    const hasCropGrowthMonitoring = useSelector(selectHasCropGrowthMonitoring);

    const field = selectedFieldsDetials[0] || {};
    const cropName =
      field?.cropName || advisoryState?.farmFieldId?.cropName || "Other";

    const plantActivity =
      advisoryState?.smartAdvisory?.plantGrowthActivity ||
      advisoryState?.plantGrowthActivity ||
      null;

    const sowingDateStr =
      field?.sowingDate || advisoryState?.farmFieldId?.sowingDate || null;
    const targetDateStr = advisoryState?.targetDate || new Date().toISOString();

    const { daysSinceSowing, currentWeek } = useMemo(() => {
      const safeParse = (d) => {
        if (!d) return null;
        const dd = new Date(d);
        return isNaN(dd.getTime()) ? null : dd;
      };

      const sowing = safeParse(sowingDateStr);
      const target = safeParse(targetDateStr) || new Date();

      if (!sowing) return { daysSinceSowing: 1, currentWeek: 1 };

      const diffDays = Math.max(
        1,
        Math.floor(
          (target.getTime() - sowing.getTime()) / (1000 * 60 * 60 * 24)
        ) + 1
      );

      const weeks = Math.min(
        Math.ceil(diffDays / 7),
        CROP_GROWTH_DURATIONS[cropName] || CROP_GROWTH_DURATIONS.Other
      );

      return { daysSinceSowing: diffDays, currentWeek: weeks };
    }, [sowingDateStr, targetDateStr, cropName]);

    const [interval, setInterval] = useState("Weeks");
    const data = useMemo(
      () => generateCurveData(interval, cropName),
      [interval, cropName]
    );
    const referenceLabel =
      interval === "Days" ? `Day ${daysSinceSowing}` : `Week ${currentWeek}`;

    const [tooltipPos, setTooltipPos] = useState(null);

    if (!sowingDateStr) {
      return (
        <div className="w-full flex justify-center mt-4">
          <div className="relative w-full max-w-4xl rounded-2xl shadow-lg bg-white p-4 text-center">
            <div className="text-gray-800 text-sm">
              Sowing date not available for this field.
            </div>
          </div>
        </div>
      );
    }

    const isLoading = false;

    return (
      <PremiumContentWrapper
        isLocked={!hasCropGrowthMonitoring}
        onSubscribe={onSubscribe}
        title="Crop Growth Monitoring"
      >
        <div className="w-full flex mt-6">
          <div className="relative w-full rounded-2xl shadow-lg flex flex-col overflow-hidden p-3 md:p-5 bg-white">
            <div className="w-full mb-4 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-semibold text-[#344E41] m-0">
                  Plant Growth Activity
                </h2>
                <div className="text-sm font-bold text-[#344E41] mt-2">
                  {cropName}
                </div>
                <div className="text-sm text-gray-700 mt-1">
                  {plantActivity?.stageName
                    ? `Stage: ${plantActivity.stageName}`
                    : `Days since sowing: ${daysSinceSowing}`}
                </div>
                {plantActivity?.description && (
                  <div className="text-xs text-gray-600 mt-1 max-w-2xl">
                    {plantActivity.description}
                  </div>
                )}
              </div>

              <select
                value={interval}
                onChange={(e) => setInterval(e.target.value)}
                className="w-[100px] h-[35px] px-2 py-1 text-sm border-2 border-gray-300 rounded-full bg-white text-gray-800 focus:outline-none cursor-pointer"
              >
                <option value="Days">Days</option>
                <option value="Weeks">Weeks</option>
              </select>
            </div>

            {isLoading ? (
              <PlantGrowthSkeleton />
            ) : (
              <div className="w-full h-[300px] bg-gray-100 rounded-2xl relative">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={data}
                    margin={{ top: 60, right: 30, left: 30, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="colorHeight"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor={GRASS_COLOR_MAIN}
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor={GRASS_COLOR_MAIN}
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>

                    <CartesianGrid stroke="rgba(0,0,0,0.06)" vertical={false} />
                    <XAxis
                      dataKey="label"
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fill: "#333",
                        fontSize: "11px",
                        fontWeight: "600",
                      }}
                      interval={Math.max(0, Math.floor(data.length / 8))}
                    />
                    <YAxis hide />
                    <ReferenceLine
                      x={referenceLabel}
                      stroke={GRASS_COLOR_MAIN}
                      strokeWidth={2}
                    />

                    {/* capture the svg coordinates of the reference point via label's viewBox and store in state */}
                    <ReferenceDot
                      x={referenceLabel}
                      y={
                        data.find((d) => d.label === referenceLabel)?.height ||
                        0
                      }
                      r={3}
                      fill={GRASS_COLOR_MAIN}
                      isFront
                      label={({ viewBox }) => {
                        if (!viewBox) return null;
                        const { x, y } = viewBox;

                        if (
                          !tooltipPos ||
                          tooltipPos.x !== x ||
                          tooltipPos.y !== y
                        ) {
                          requestAnimationFrame(() => {
                            setTooltipPos({ x, y });
                          });
                        }
                        return null;
                      }}
                    />

                    <Area
                      type="monotone"
                      dataKey="height"
                      stroke={GRASS_COLOR_MAIN}
                      fill="url(#colorHeight)"
                      fillOpacity={1}
                    />
                  </AreaChart>
                </ResponsiveContainer>

                {/* tooltip near the reference point (convert svg coords to container) */}
                {tooltipPos && plantActivity && (
                  <div
                    className="absolute z-50 bg-[#344E41] text-white text-xs p-3 rounded shadow-xl max-w-[320px]"
                    style={{
                      left: Math.max(8, tooltipPos.x - 160),
                      top: Math.max(8, tooltipPos.y - 100),
                      transform: "translateZ(0)",
                    }}
                  >
                    <p className="font-bold text-sm mb-1">
                      {plantActivity.stageName ||
                        `BBCH ${plantActivity?.bbchStage ?? ""}`}
                    </p>
                    {plantActivity.bbchStage && (
                      <p className="text-xs text-gray-200 mb-1">
                        BBCH: {plantActivity.bbchStage}
                      </p>
                    )}
                    {plantActivity.description && (
                      <p className="text-xs text-gray-200 mb-1">
                        {plantActivity.description}
                      </p>
                    )}
                    <p className="italic text-gray-300 mt-1 text-xs">
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
      </PremiumContentWrapper>
    );
  }
);

PlantGrowthActivity.displayName = "PlantGrowthActivity";

export default PlantGrowthActivity;
