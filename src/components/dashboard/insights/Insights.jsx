import React from "react";
import { useNavigate } from "react-router-dom";
import { Info, Eye } from "lucide-react";
import {
  Drop,
  SmallDrop,
  Lite,
  DownArrow,
  UpArrow,
} from "../../../assets/DashboardIcons";
import { useSelector } from "react-redux";

import PremiumContentWrapper from "../../subscription/PremiumContentWrapper";
import FeatureGuard from "../../subscription/FeatureGuard";
import { useSubscriptionGuard } from "../../subscription/hooks/useSubscriptionGuard";

const ACTIVITIES_TO_DO_PATH = "/smart-advisory#activities-to-do";

/* ================= ICON MAPPER ================= */

const getIconByType = (type) => {
  switch (type) {
    case "SPRAY":
      return (
        <div className="w-8 h-8 bg-red-400 rounded-full flex items-center justify-center">
          <Drop />
        </div>
      );

    case "FERTIGATION":
      return (
        <div className="w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center relative">
          <Drop />
          <sup>
            <SmallDrop className="absolute -top-1 -right-1" />
          </sup>
        </div>
      );

    case "IRRIGATION":
      return (
        <div className="w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center">
          <Drop />
        </div>
      );

    case "WEATHER":
      return (
        <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
          <Lite />
        </div>
      );

    case "CROP_RISK":
      return (
        <div className="w-8 h-8 bg-purple-400 rounded-full flex items-center justify-center">
          <Lite />
        </div>
      );

    default:
      return (
        <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
          <Lite />
        </div>
      );
  }
};

/* ================= SUB COMPONENT ================= */

const Insight = ({ icon, title, description, onView }) => {
  return (
    <div className="flex items-center gap-3 lg:gap-4 py-3 px-4 border-b border-gray-200 last:border-b-0">
      <div className="flex-shrink-0">{icon}</div>

      <div className="flex-1 min-w-0">
        <div className="text-sm lg:text-base font-semibold text-gray-900">
          {title}
        </div>

        {description ? (
          <div className="text-xs lg:text-sm text-gray-500 mt-0.5 line-clamp-2">
            {description}
          </div>
        ) : null}
      </div>

      <button
        type="button"
        onClick={onView}
        className="p-2 border border-gray-200 rounded-full hover:bg-gray-100 bg-white flex-shrink-0"
        title="View in Smart Advisory"
        aria-label="View activity in Smart Advisory"
      >
        <Eye className="w-5 h-5 text-[#344E41]" />
      </button>
    </div>
  );
};

const InsightsEmptyState = () => (
  <div className="p-8 text-center flex flex-col items-center justify-center gap-3 min-h-[160px]">
    <div className="w-12 h-12 rounded-full bg-[#5a7c6b]/20 flex items-center justify-center">
      <Info className="w-6 h-6 text-[#344E41]" />
    </div>
    <div className="text-gray-900 font-semibold text-sm lg:text-base">
      No insights available
    </div>
    <div className="text-gray-500 text-xs lg:text-sm max-w-[360px]">
      Your agronomic insights will appear after the next analysis run for this field.
    </div>
  </div>
);

/* ================= MAIN COMPONENT ================= */

const Insights = ({
  selectedFieldsDetials,
  bypassPremium = false,
  isGenerating = false,
}) => {
  const navigate = useNavigate();
  const insightsGuard = useSubscriptionGuard({
    field: selectedFieldsDetials?.[0],
    featureKey: "agronomicInsights",
  });

  const advisory = useSelector((state) => state.smartAdvisory?.advisory);

  const goToActivitiesToDo = () => {
    navigate(ACTIVITIES_TO_DO_PATH);
  };

  /* ================= BUILD INSIGHTS ================= */

  const canSeeInsights = bypassPremium || insightsGuard.hasFeatureAccess;

  const insights = canSeeInsights
    ? advisory?.activitiesToDo?.map((activity) => ({
        icon: getIconByType(activity.type),
        title: activity.title,
        description: String(activity.message || "").trim(),
        onView: goToActivitiesToDo,
      })) || []
    : [];

  const content = (
    <div className="flex flex-col rounded-lg shadow-inner bg-white min-h-[220px]">
      {insights.length === 0 ? (
        isGenerating ? (
          <p className="text-sm text-gray-500 text-center py-10">
            Generating farm advisory…
          </p>
        ) : (
          <InsightsEmptyState />
        )
      ) : (
        insights.map((insight, index) => <Insight key={index} {...insight} />)
      )}
    </div>
  );

  return (
    <div className="w-full flex mt-8">
      <div className="relative w-full bg-gray-50 rounded-2xl shadow-md text-gray-900 flex flex-col overflow-hidden p-4 md:p-6">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 px-4 sm:px-6">
          <div className="flex items-center gap-1">
            <div className="text-md lg:text-lg font-semibold text-gray-900">
              Insights
            </div>

            <div className="flex flex-col items-center [&_svg]:fill-gray-500">
              <UpArrow />
              <DownArrow />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <div className="text-md lg:text-lg font-semibold text-gray-900">
                View
              </div>

              <div className="flex flex-col items-center [&_svg]:fill-gray-500">
                <UpArrow />
                <DownArrow />
              </div>
            </div>

            <button
              type="button"
              onClick={goToActivitiesToDo}
              className="text-xs lg:text-sm text-gray-500 cursor-pointer hover:text-gray-900 bg-transparent border-0 p-0"
            >
              See all
            </button>

            {!bypassPremium && !insightsGuard.hasFeatureAccess && (
              <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                Premium
              </span>
            )}
          </div>
        </div>

        {/* PREMIUM HANDLING */}

        {bypassPremium ? (
          content
        ) : (
          <FeatureGuard guard={insightsGuard} title="Agronomic Insights">
            <PremiumContentWrapper
              isLocked={!insightsGuard.hasFeatureAccess}
              onSubscribe={insightsGuard.handleSubscribe}
              title="Agronomic Insights"
            >
              {content}
            </PremiumContentWrapper>
          </FeatureGuard>
        )}
      </div>
    </div>
  );
};

export default React.memo(Insights);
