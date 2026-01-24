import React, { useMemo, useRef, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import CropAdvisorySkeleton from "../Skeleton/CropAdvisorySkeleton";
import IndexPremiumWrapper from "../subscription/Indexpremiumwrapper";

/* ===================== CARD ===================== */
const AdvisoryCard = React.memo(
  ({ title, description, isPreparedForPDF = false }) => (
    <div
      className={`
        ${
          isPreparedForPDF
            ? "w-full min-h-[140px]"
            : "flex-none lg:w-[260px] lg:h-[170px] md:w-[180px] md:h-[140px]"
        }
        bg-[#344E41]/90
        border border-gray-200
        rounded-lg
        p-3
        shadow-md
        overflow-y-auto
        no-scrollbar
      `}
      style={
        isPreparedForPDF
          ? {
              breakInside: "avoid",
              pageBreakInside: "avoid",
              WebkitColumnBreakInside: "avoid",
            }
          : {}
      }
    >
      <h3 className="text-sm lg:text-base font-bold text-white mb-2">
        {title}
      </h3>

      <p className="text-xs lg:text-sm text-gray-200 leading-relaxed">
        {description?.trim()
          ? description
          : "No advisory required at this stage."}
      </p>
    </div>
  )
);
AdvisoryCard.displayName = "AdvisoryCard";

/* ===================== MAIN ===================== */
const CropAdvisory = ({
  onSubscribe,
  hasWeeklyAdvisoryReports,
  isPreparedForPDF = false,
}) => {
  const { advisory: data, loading } = useSelector(
    (s) => s.smartAdvisory || {}
  );

  /* -------- Drag Scroll -------- */
  const scrollRef = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const attachDragHandlers = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return () => {};

    const down = (e) => {
      isDragging.current = true;
      startX.current = e.pageX - el.offsetLeft;
      scrollLeft.current = el.scrollLeft;
      el.style.cursor = "grabbing";
    };

    const up = () => {
      isDragging.current = false;
      el.style.cursor = "grab";
    };

    const move = (e) => {
      if (!isDragging.current) return;
      e.preventDefault();
      el.scrollLeft =
        scrollLeft.current - (e.pageX - el.offsetLeft - startX.current);
    };

    el.addEventListener("mousedown", down);
    el.addEventListener("mouseleave", up);
    el.addEventListener("mouseup", up);
    el.addEventListener("mousemove", move);

    return () => {
      el.removeEventListener("mousedown", down);
      el.removeEventListener("mouseleave", up);
      el.removeEventListener("mouseup", up);
      el.removeEventListener("mousemove", move);
    };
  }, []);

  useEffect(() => {
    if (isPreparedForPDF) return;
    const cleanup = attachDragHandlers();
    return () => cleanup && cleanup();
  }, [attachDragHandlers, isPreparedForPDF]);

  /* -------- Map Backend → Cards -------- */
  const advisory = useMemo(() => {
    const weekly = data?.smartAdvisory?.weeklyAdvisory;
    const irrigation = data?.smartAdvisory?.irrigationStage;

    if (!weekly && !irrigation) return null;

    return {
      spray:
        weekly?.sprayRecommendation?.purpose ||
        "No spray recommended at this stage.",

      fertigation:
        weekly?.fertigationSchedule?.purpose ||
        "No fertigation required at this stage.",

      weather:
        weekly?.weatherAlert?.instruction ||
        "No adverse weather conditions expected.",

      cropRisk:
        weekly?.cropRiskAlert?.instruction ||
        "No significant crop risk detected.",

      irrigation:
        irrigation?.recommendations
          ? `${irrigation.recommendations.action}. ${irrigation.recommendations.quantity} ${irrigation.recommendations.unit}. ${irrigation.recommendations.rationale}`
          : "No irrigation required at this stage.",
    };
  }, [data]);

  /* ===================== RENDER ===================== */
  return (
    <div className="flex flex-col gap-3 mt-10 mb-3 rounded-lg shadow-md border border-gray-200 bg-gray-50 p-3">
      <h2 className="text-xl font-bold text-gray-900">
        Weekly Crop Advisory
      </h2>

      <IndexPremiumWrapper
        isLocked={!hasWeeklyAdvisoryReports}
        onSubscribe={onSubscribe}
        title="Crop Advisory"
      >
        {loading ? (
          <CropAdvisorySkeleton />
        ) : advisory ? (
          <div
            ref={scrollRef}
            className={
              isPreparedForPDF
                ? "grid grid-cols-2 gap-4 w-full"
                : "flex gap-2 overflow-x-auto scrollbar-hide cursor-grab"
            }
          >
            <AdvisoryCard title="Spray Recommendation" description={advisory.spray} />
            <AdvisoryCard title="Fertigation" description={advisory.fertigation} />
            <AdvisoryCard title="Weather" description={advisory.weather} />
            <AdvisoryCard title="Crop Risk" description={advisory.cropRisk} />
            <AdvisoryCard title="Irrigation" description={advisory.irrigation} />
          </div>
        ) : (
          <div className="p-6 text-gray-500 text-center">
            No advisory data available.
          </div>
        )}
      </IndexPremiumWrapper>
    </div>
  );
};

export default CropAdvisory;
