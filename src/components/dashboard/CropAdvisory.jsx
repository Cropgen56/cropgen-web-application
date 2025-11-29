import React, {
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import CropAdvisorySkeleton from "../Skeleton/CropAdvisorySkeleton";
import IndexPremiumWrapper from "../subscription/Indexpremiumwrapper";
import { selectHasWeeklyAdvisoryReports } from "../../redux/slices/membershipSlice";

/* small presentational card */
const AdvisoryCard = React.memo(({ category, activityText }) => (
  <div className="flex-none lg:w-[250px] lg:h-[160px] md:w-[170px] md:h-[130px] bg-[#344E41]/90 border border-gray-200 rounded-lg p-3 md:p-2 shadow-md overflow-y-auto no-scrollbar">
    <h3 className="text-sm lg:text-base font-bold text-white mb-1 md:mb-0.5">
      {category}
    </h3>
    <div className="text-xs lg:text-sm text-gray-300 font-medium leading-tight">
      {activityText || "No data available"}
    </div>
  </div>
));
AdvisoryCard.displayName = "AdvisoryCard";

const categories = [
  { key: "disease_pest", label: "Disease/Pest Control" },
  { key: "spray", label: "Spray Recommendation" },
  { key: "fertigation", label: "Fertigation" },
  { key: "water", label: "Watering" },
  { key: "monitoring", label: "Monitoring" },
];

const CropAdvisory = ({ selectedFieldsDetials = [], onSubscribe, hasWeeklyAdvisoryReports }) => {
  const dispatch = useDispatch();

  // source data
  const { advisory: smartAdvisory, loading } = useSelector(
    (s) => s.smartAdvisory || {}
  );
  // const hasWeeklyAdvisoryReports = useSelector(selectHasWeeklyAdvisoryReports);

  // horizontal scroll refs/drag state
  const scrollRef = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  // derive weekly items (safe access)
  const weeklyItems = smartAdvisory?.smartAdvisory?.weeklyAdvisory?.items || [];

  // map advisory items into a simple key -> advice map
  const advisoryMapped = useMemo(() => {
    if (!Array.isArray(weeklyItems) || weeklyItems.length === 0) return null;
    const map = {};
    weeklyItems.forEach((item) => {
      if (item && item.key) map[item.key] = item.advice;
    });
    return map;
  }, [weeklyItems]);

  // attach mouse drag handlers for horizontal scroll
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

  return (
    <div className="flex flex-col gap-4 mt-10 mb-3 rounded-lg shadow-md border border-gray-200 bg-gray-50 md:h-auto lg:h-auto p-3 overflow-hidden">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">
          Weekly Crop Advisory
        </h2>
      </div>

      <IndexPremiumWrapper
        isLocked={!hasWeeklyAdvisoryReports}
        onSubscribe={onSubscribe}
        title="Crop Advisory"
      >
        {loading ? (
          <CropAdvisorySkeleton />
        ) : advisoryMapped ? (
          <div
            ref={scrollRef}
            className="flex flex-nowrap justify-between lg:gap-4 gap-2 p-2 md:p-0 overflow-x-auto scrollbar-hide no-scrollbar scroll-smooth touch-auto overscroll-x-contain cursor-grab select-none"
          >
            {categories.map((category) => (
              <AdvisoryCard
                key={category.key}
                category={category.label}
                activityText={advisoryMapped[category.key]}
              />
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center p-8 text-gray-500">
            <p>No advisory data available. Please check your field details.</p>
          </div>
        )}
      </IndexPremiumWrapper>
    </div>
  );
};

export default CropAdvisory;
