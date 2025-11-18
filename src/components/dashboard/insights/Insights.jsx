import React from "react";
import { FcCheckmark } from "react-icons/fc";
import { FaXmark } from "react-icons/fa6";
import { useSelector } from "react-redux";
import {
  Drop,
  SmallDrop,
  Lite,
  DownArrow,
  UpArrow,
} from "../../../assets/DashboardIcons";
import PremiumContentWrapper from "../../subscription/PremiumContentWrapper";
import { selectHasAgronomicInsights } from "../../../redux/slices/membershipSlice";

const Insight = ({ icon, title, description }) => {
  return (
    <div className="flex items-center gap-3 lg:gap-4 py-2 px-4 border-b border-gray-200 last:border-b-0">
      <div>{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="text-sm lg:text-base font-semibold text-gray-900">
          {title}
        </div>
        <div className="text-xs lg:text-sm text-gray-500">{description}</div>
      </div>
      <div className="flex gap-4 ml-auto">
        <button className="p-2 border border-gray-200 rounded-full hover:bg-gray-100 transition-colors bg-white">
          <FcCheckmark className="text-lg" />
        </button>
        <button className="p-2 border border-gray-200 rounded-full hover:bg-gray-100 transition-colors bg-white">
          <FaXmark className="text-red-500 text-lg" />
        </button>
      </div>
    </div>
  );
};

const Insights = ({ onSubscribe }) => {
  const hasAgronomicInsights = useSelector(selectHasAgronomicInsights);

  const insights = [
    {
      icon: (
        <div className="w-8 h-8 bg-red-400 rounded-full flex items-center justify-center">
          <Drop />
        </div>
      ),
      title: "Stress is building up!",
      description:
        "4 hours of -80 stress was measured. Rain is not forecasted for the next 3 days.",
    },
    {
      icon: (
        <div className="w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center relative">
          <Drop />
          <sup>
            <SmallDrop className="absolute -top-1 -right-1" />
          </sup>
        </div>
      ),
      title: "Shallow irrigation detected in the 7 days",
      description: "We detected an anomaly with stress and low temperature.",
    },
    {
      icon: (
        <div className="w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center">
          <Lite />
        </div>
      ),
      title: "You should add 1mm to your irrigation",
      description: "We detected an anomaly with stress and low temperature.",
    },
  ];

  return (
    <PremiumContentWrapper
      isLocked={!hasAgronomicInsights}
      onSubscribe={onSubscribe}
      title="Agronomic Insights"
    >
      <div className="w-full flex mt-8">
        <div className="relative w-full bg-gray-50 rounded-2xl shadow-md text-gray-900 flex flex-col overflow-hidden p-4 md:p-6">
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
            </div>
          </div>
          <div className="flex flex-col rounded-lg shadow-inner bg-white">
            {insights.map((insight, index) => (
              <Insight key={index} {...insight} />
            ))}
          </div>
        </div>
      </div>
    </PremiumContentWrapper>
  );
};

export default Insights;
