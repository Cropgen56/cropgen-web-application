import React from "react";
import { FcCheckmark } from "react-icons/fc";
import { FaXmark } from "react-icons/fa6";
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

const Insight = ({ icon, title, description }) => {
  return (
    <div className="flex items-center gap-3 lg:gap-4 py-3 px-4 border-b border-gray-200 last:border-b-0">
      <div>{icon}</div>

      <div className="flex-1 min-w-0">
        <div className="text-sm lg:text-base font-semibold text-gray-900">
          {title}
        </div>

        <div className="text-xs lg:text-sm text-gray-500 whitespace-pre-line">
          {description}
        </div>
      </div>

      <div className="flex gap-4 ml-auto">
        <button className="p-2 border border-gray-200 rounded-full hover:bg-gray-100 bg-white">
          <FcCheckmark className="text-lg" />
        </button>

        <button className="p-2 border border-gray-200 rounded-full hover:bg-gray-100 bg-white">
          <FaXmark className="text-red-500 text-lg" />
        </button>
      </div>
    </div>
  );
};

/* ================= MAIN COMPONENT ================= */

const Insights = ({ selectedFieldsDetials, bypassPremium = false }) => {
  const insightsGuard = useSubscriptionGuard({
    field: selectedFieldsDetials?.[0],
    featureKey: "agronomicInsights",
  });

  const advisory = useSelector((state) => state.smartAdvisory?.advisory);

  /* ================= BUILD INSIGHTS ================= */

  const insights =
    advisory?.activitiesToDo?.map((activity) => {
      let detailsText = "";

      if (activity.details) {
        detailsText = Object.entries(activity.details)
          .filter(([_, value]) => value)
          .map(([key, value]) => `${key}: ${value}`)
          .join(", ");
      }

      return {
        icon: getIconByType(activity.type),
        title: activity.title,
        description: detailsText
          ? `${activity.message}\n${detailsText}`
          : activity.message,
      };
    }) || [];

  /* ================= CONTENT ================= */

  const content = (
    <div className="flex flex-col rounded-lg shadow-inner bg-white">
      {insights.length === 0 ? (
        <div className="p-6 text-center text-gray-500 text-sm">
          No insights available
        </div>
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
                Action
              </div>

              <div className="flex flex-col items-center [&_svg]:fill-gray-500">
                <UpArrow />
                <DownArrow />
              </div>
            </div>

            <div className="text-xs lg:text-sm text-gray-500 cursor-pointer hover:text-gray-900">
              See all
            </div>

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
