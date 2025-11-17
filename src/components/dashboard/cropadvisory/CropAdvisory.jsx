import React, {
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  genrateAdvisory,
  fetchSoilMoisture,
} from "../../../redux/slices/satelliteSlice";
import CropAdvisorySkeleton from "../../Skeleton/CropAdvisorySkeleton";
import PremiumContentWrapper from "../../subscription/PremiumContentWrapper";
import IndexPremiumWrapper from "../../subscription/Indexpremiumwrapper";

// Define categories outside the component
const categories = [
  "Disease/Pest Control",
  "Fertigation",
  "Watering",
  "Monitoring",
];

// Memoized AdvisoryCard (moved outside to avoid re-creation)
const AdvisoryCard = React.memo(({ category, activityText }) => {
  let content;
  if (!activityText) {
    content = <p>No data available</p>;
  } else if (category === "Disease/Pest Control") {
    const lines = activityText.split("\n");
    if (lines.length >= 2) {
      const diseaseLine = lines[0].replace("Disease Pest - ", "");
      const sprayLine = lines[1].replace("Spray - ", "");
      content = (
        <div>
          <p>
            <strong>Disease/Pest:</strong> {diseaseLine}
          </p>
          <p>
            <strong>Spray:</strong> {sprayLine}
          </p>
        </div>
      );
    } else {
      content = <p>{activityText}</p>;
    }
  } else {
    content = <p>{activityText}</p>;
  }

  return (
    <div className="flex-none lg:w-[250px] lg:h-[160px] md:w-[170px] md:h-[130px] bg-[#344E41]/90 border border-gray-200 rounded-lg p-3 md:p-2 shadow-md overflow-y-auto no-scrollbar">
      <h3 className="text-sm lg:text-base font-bold text-white mb-1 md:mb-0.5">
        {category}
      </h3>
      <div className="text-xs lg:text-sm text-gray-300 font-medium leading-tight">
        {content}
      </div>
    </div>
  );
});
AdvisoryCard.displayName = "AdvisoryCard";

const CropAdvisory = ({
  selectedFieldsDetials,
  isLocked,
  onSubscribe,
  usePremiumWrapper = true,
}) => {
  const dispatch = useDispatch();
  const [selectedDay, setSelectedDay] = useState("Day 1");
  const { advisory, cropGrowthStage } = useSelector(
    (state) => state.satellite || {}
  );
  const { forecastData } = useSelector((state) => state.weather || {});

  const scrollRef = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const farmDetails = selectedFieldsDetials?.[0] || null;
  const farmId = farmDetails?._id ?? farmDetails?.id ?? null;

  // Keep last processed farmId to avoid duplicate fetches (in case farmDetails object changes reference)
  const lastSoilFetchRef = useRef(null);

  // Fetch soil moisture only when farmId meaningfully changes
  useEffect(() => {
    if (!farmId) return;
    if (lastSoilFetchRef.current === farmId) return;
    lastSoilFetchRef.current = farmId;

    dispatch(fetchSoilMoisture(farmDetails));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, farmId]); // farmDetails intentionally omitted to avoid object ref churn

  // Generate advisory: only when meaningful inputs change (bbch, forecast timestamp, farmId)
  const lastAdvisoryKeyRef = useRef(null);
  const advisoryTimerRef = useRef(null);

  useEffect(() => {
    const bbch = cropGrowthStage?.finalStage?.bbch ?? null;
    const forecastTs = forecastData?.current?.dt ?? forecastData?.dt ?? null;
    const advisoryKey = `${farmId || "nofarm"}::${bbch ?? "nobbch"}::${
      forecastTs ?? "nofc"
    }`;

    // if missing required inputs, skip
    if (!farmId || !bbch || !forecastData || !selectedFieldsDetials?.length)
      return;

    if (lastAdvisoryKeyRef.current === advisoryKey) return;

    // debounce tiny interval to avoid rapid repeated dispatches
    if (advisoryTimerRef.current) clearTimeout(advisoryTimerRef.current);
    advisoryTimerRef.current = setTimeout(() => {
      // store before dispatch to avoid duplicate calls during dispatch-triggered renders
      lastAdvisoryKeyRef.current = advisoryKey;

      dispatch(
        genrateAdvisory({
          farmDetails: selectedFieldsDetials[0],
          currenWeather: forecastData?.current,
          bbchData: cropGrowthStage?.finalStage,
        })
      ).catch(() => {
        // if dispatch fails, clear key so it can retry next time
        lastAdvisoryKeyRef.current = null;
      });
    }, 200);

    return () => {
      if (advisoryTimerRef.current) {
        clearTimeout(advisoryTimerRef.current);
        advisoryTimerRef.current = null;
      }
    };
  }, [
    dispatch,
    cropGrowthStage?.finalStage?.bbch,
    forecastData?.current?.dt,
    farmId,
    selectedFieldsDetials,
    forecastData,
  ]);

  // Drag handlers: attach once and cleanup properly
  const attachDragHandlers = useCallback(() => {
    const slider = scrollRef.current;
    if (!slider) return () => {};

    const handleMouseDown = (e) => {
      isDragging.current = true;
      startX.current = e.pageX - slider.offsetLeft;
      scrollLeft.current = slider.scrollLeft;
      slider.style.cursor = "grabbing";
    };

    const handleMouseLeaveOrUp = () => {
      if (isDragging.current) {
        isDragging.current = false;
        slider.style.cursor = "grab";
      }
    };

    const handleMouseMove = (e) => {
      if (!isDragging.current) return;
      e.preventDefault();
      const x = e.pageX - slider.offsetLeft;
      const walk = x - startX.current;
      slider.scrollLeft = scrollLeft.current - walk;
    };

    slider.addEventListener("mousedown", handleMouseDown);
    slider.addEventListener("mouseleave", handleMouseLeaveOrUp);
    slider.addEventListener("mouseup", handleMouseLeaveOrUp);
    slider.addEventListener("mousemove", handleMouseMove);

    return () => {
      slider.removeEventListener("mousedown", handleMouseDown);
      slider.removeEventListener("mouseleave", handleMouseLeaveOrUp);
      slider.removeEventListener("mouseup", handleMouseLeaveOrUp);
      slider.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  useEffect(() => {
    const cleanup = attachDragHandlers();
    return () => cleanup && cleanup();
  }, [attachDragHandlers]);

  // Memoize advisoryData to handle array format and map keys to categories
  const advisoryData = useMemo(() => {
    if (!Array.isArray(advisory)) return [];
    return advisory.map((item) => ({
      day: item.day,
      activities: {
        "Disease/Pest Control": `Disease Pest - ${String(
          item.disease_pest ?? ""
        ).replace(/[[```]/g, "")}\nSpray - ${String(item.spray ?? "").replace(
          /[[```]/g,
          ""
        )}`,
        Fertigation: item.fertigation ?? "",
        Watering: item.water ?? "",
        Monitoring: item.monitoring ?? "",
      },
    }));
  }, [advisory]);

  // Ensure selectedDay exists in advisoryData (pick first available if not)
  useEffect(() => {
    if (
      advisoryData.length > 0 &&
      !advisoryData.some((item) => item.day === selectedDay)
    ) {
      setSelectedDay(advisoryData[0].day);
    }
  }, [advisoryData, selectedDay]);

  // Memoized currentDayData
  const currentDayData = useMemo(() => {
    return (
      advisoryData.find((item) => item.day === selectedDay)?.activities || {}
    );
  }, [advisoryData, selectedDay]);

  return (
    <div className="flex flex-col gap-4 mt-4 mb-3 rounded-lg shadow-md border border-gray-200 bg-gray-50 md:h-auto lg:h-auto p-3 overflow-hidden">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">Crop Advisory</h2>

        <select
          value={selectedDay}
          onChange={(e) => setSelectedDay(e.target.value)}
          aria-label="Select advisory day"
          className="border-2 border-gray-300 bg-white rounded-[25px] px-3 py-1 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 "
        >
          {advisoryData.length > 0 ? (
            advisoryData.map((item) => (
              <option key={item.day} value={item.day} className="text-gray-700">
                Day {item.day}
              </option>
            ))
          ) : (
            <option value="Day 1" className="text-gray-700">
              Day 1
            </option>
          )}
        </select>
      </div>

      {usePremiumWrapper ? (
        <IndexPremiumWrapper
          isLocked={isLocked}
          onSubscribe={onSubscribe}
          title="Crop Advisory"
        >
          {advisoryData.length > 0 ? (
            <div
              ref={scrollRef}
              className="flex flex-nowrap justify-between lg:gap-4 gap-2 p-2 md:p-0 overflow-x-auto scrollbar-hide no-scrollbar scroll-smooth touch-auto overscroll-x-contain cursor-grab select-none"
            >
              {categories.map((category) => (
                <AdvisoryCard
                  key={category}
                  category={category}
                  activityText={currentDayData[category]}
                />
              ))}
            </div>
          ) : (
            <CropAdvisorySkeleton />
          )}
        </IndexPremiumWrapper>
      ) : (
        <>
          {advisoryData.length > 0 ? (
            <div
              ref={scrollRef}
              className="flex flex-nowrap justify-between lg:gap-4 gap-2 p-2 md:p-0 overflow-x-auto scrollbar-hide no-scrollbar scroll-smooth touch-auto overscroll-x-contain cursor-grab select-none"
            >
              {categories.map((category) => (
                <AdvisoryCard
                  key={category}
                  category={category}
                  activityText={currentDayData[category]}
                />
              ))}
            </div>
          ) : (
            <CropAdvisorySkeleton />
          )}
        </>
      )}
    </div>
  );
};

export default CropAdvisory;
