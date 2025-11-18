import React, {
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSoilMoisture } from "../../../redux/slices/satelliteSlice";
import { fetchCropAdvisory } from "../../../redux/slices/cropSlice";
import CropAdvisorySkeleton from "../../Skeleton/CropAdvisorySkeleton";
import IndexPremiumWrapper from "../../subscription/Indexpremiumwrapper";
import { selectHasWeeklyAdvisoryReports } from "../../../redux/slices/membershipSlice";

const categories = [
  { key: "disease_pest", label: "Disease/Pest Control" },
  { key: "spray", label: "Spray Recommendation" },
  { key: "fertigation", label: "Fertigation" },
  { key: "water", label: "Watering" },
  { key: "monitoring", label: "Monitoring" },
];

const AdvisoryCard = React.memo(({ category, activityText }) => {
  return (
    <div className="flex-none lg:w-[250px] lg:h-[160px] md:w-[170px] md:h-[130px] bg-[#344E41]/90 border border-gray-200 rounded-lg p-3 md:p-2 shadow-md overflow-y-auto no-scrollbar">
      <h3 className="text-sm lg:text-base font-bold text-white mb-1 md:mb-0.5">
        {category}
      </h3>
      <div className="text-xs lg:text-sm text-gray-300 font-medium leading-tight">
        {activityText || "No data available"}
      </div>
    </div>
  );
});
AdvisoryCard.displayName = "AdvisoryCard";

const CropAdvisory = ({ selectedFieldsDetials, onSubscribe }) => {
  const dispatch = useDispatch();

  const { cropAdvisory, advisoryLoading } = useSelector(
    (state) => state.crops || {}
  );
  const { soilMoisture } = useSelector((state) => state.satellite || {});
  const { forecastData } = useSelector((state) => state.weather || {});

  // Get feature flag
  const hasWeeklyAdvisoryReports = useSelector(selectHasWeeklyAdvisoryReports);

  const scrollRef = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const farmDetails = selectedFieldsDetials?.[0] || null;
  const farmId = farmDetails?._id ?? farmDetails?.id ?? null;

  const lastSoilFetchRef = useRef(null);

  // Fetch soil moisture data
  useEffect(() => {
    if (!farmId) return;
    if (lastSoilFetchRef.current === farmId) return;
    lastSoilFetchRef.current = farmId;

    dispatch(fetchSoilMoisture(farmDetails));
  }, [dispatch, farmId, farmDetails]);

  const lastAdvisoryKeyRef = useRef(null);
  const advisoryTimerRef = useRef(null);

  // Build payload and fetch advisory
  useEffect(() => {
    if (!farmDetails || !forecastData) return;

    const { cropName, sowingDate, bbch, variety, irrigationType, farmingType } =
      farmDetails;

    // Extract weather data
    const currentWeather = forecastData?.current || forecastData;
    const humidity = currentWeather?.humidity || 0;
    const temp = currentWeather?.temp || 0;
    const rain = currentWeather?.rain?.["1h"] || 0;

    // Extract soil data
    const soilTemp = soilMoisture?.soilTemperature || 0;
    const soilMoist = soilMoisture?.soilMoisture || 0;

    const advisoryKey = `${farmId}::${cropName}::${bbch}::${
      forecastData?.current?.dt || Date.now()
    }`;

    if (lastAdvisoryKeyRef.current === advisoryKey) return;

    if (advisoryTimerRef.current) clearTimeout(advisoryTimerRef.current);

    advisoryTimerRef.current = setTimeout(() => {
      lastAdvisoryKeyRef.current = advisoryKey;

      const payload = {
        crop_name: cropName || "Wheat",
        sowing_date: sowingDate || new Date().toISOString().split("T")[0],
        bbch_stage: String(bbch || "31"),
        variety: variety || "Standard",
        irrigation_type: irrigationType || "Drip",
        type_of_farming: farmingType || "Conventional",
        humidity: Math.round(humidity),
        temp: Math.round(temp),
        rain: Math.round(rain),
        soil_temp: Math.round(soilTemp),
        soil_moisture: Math.round(soilMoist),
        language: "en",
      };

      dispatch(fetchCropAdvisory(payload)).catch(() => {
        lastAdvisoryKeyRef.current = null;
      });
    }, 300);

    return () => {
      if (advisoryTimerRef.current) {
        clearTimeout(advisoryTimerRef.current);
        advisoryTimerRef.current = null;
      }
    };
  }, [dispatch, farmDetails, forecastData, soilMoisture, farmId]);

  // Drag handlers for horizontal scroll
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

  // Get advisory data
  const advisoryData = useMemo(() => {
    if (!cropAdvisory?.advisory) return null;
    return cropAdvisory.advisory;
  }, [cropAdvisory]);

  return (
    <div className="flex flex-col gap-4 mt-10 mb-3 rounded-lg shadow-md border border-gray-200 bg-gray-50 md:h-auto lg:h-auto p-3 overflow-hidden">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">
          {" "}
          Weekly Crop Advisory
        </h2>
      </div>

      {/* Temporarily remove wrapper for testing */}
      {/* <IndexPremiumWrapper
        isLocked={!hasWeeklyAdvisoryReports}
        onSubscribe={onSubscribe}
        title="Crop Advisory"
      > */}
      {advisoryLoading ? (
        <CropAdvisorySkeleton />
      ) : advisoryData ? (
        <div
          ref={scrollRef}
          className="flex flex-nowrap justify-between lg:gap-4 gap-2 p-2 md:p-0 overflow-x-auto scrollbar-hide no-scrollbar scroll-smooth touch-auto overscroll-x-contain cursor-grab select-none"
        >
          {categories.map((category) => (
            <AdvisoryCard
              key={category.key}
              category={category.label}
              activityText={advisoryData[category.key]}
            />
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center p-8 text-gray-500">
          <p>No advisory data available. Please check your field details.</p>
        </div>
      )}
      {/* </IndexPremiumWrapper> */}
    </div>
  );
};

export default CropAdvisory;
