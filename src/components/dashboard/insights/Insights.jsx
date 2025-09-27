import React from "react";
// Card import is removed as we replace it with a div
import { FcCheckmark } from "react-icons/fc";
import { FaXmark } from "react-icons/fa6";
import {
  Drop,
  SmallDrop,
  Lite,
  DownArrow,
  UpArrow,
} from "../../../assets/DashboardIcons";

const Insight = ({ icon, title, description, actions }) => {
  return (
    // Internal list item borders changed to a light gray/white for visibility
    <div className="flex items-center gap-3 lg:gap-4 py-2 px-4 border-b border-gray-300 last:border-b-0">
      <div>{icon}</div>
      <div className="flex-1 min-w-0">
        {/* Title: Changed to white text for visibility */}
        <div className="text-sm lg:text-base font-semibold text-white">
          {title}
        </div>
        {/* Description: Changed to gray-300 text */}
        <div className="text-xs lg:text-sm text-gray-300">{description}</div>
      </div>
      <div className="flex gap-4 ml-auto">
        <button className="p-2 border border-gray-300 rounded-full hover:bg-gray-100 transition-colors bg-white">
          <FcCheckmark className="text-lg" />
        </button>
        <button className="p-2 border border-gray-300 rounded-full hover:bg-gray-100 transition-colors bg-white">
          <FaXmark className="text-red-500 text-lg" />
        </button>
      </div>
    </div>
  );
};

const Insights = () => {
  // insights from the backend
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
      actions: [
        { label: "X", active: true },
        { label: "X", active: false },
      ],
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
      actions: [
        { label: "x", active: true },
        { label: "X", active: false },
      ],
    },
    {
      icon: (
        <div className="w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center">
          <Lite />
        </div>
      ),
      title: "You should add 1mm to your irrigation",
      description: "We detected an anomaly with stress and low temperature.",
      actions: [
        { label: "X", active: true },
        { label: "X", active: false },
      ],
    },
  ];

  return (
    <div className="w-full flex  mt-8">
      {/* Main Gradient Card (Replaces Card body) */}
      <div className="relative w-full  bg-gradient-to-br from-[#5A7C6B] to-[#344E41] rounded-2xl shadow-lg text-white flex flex-col overflow-hidden p-4 md:p-6">

        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 px-4 sm:px-6">
          <div className="flex items-center gap-1">
            {/* Heading color updated to white */}
            <div className="text-md lg:text-lg font-semibold text-white">
              Insights
            </div>
            {/* Icons adjusted for visibility (assuming UpArrow/DownArrow need fill color) */}
            <div className="flex flex-col items-center [&_svg]:fill-white/70">
              <UpArrow />
              <DownArrow />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              {/* Action Heading color updated to white */}
              <div className="text-md lg:text-lg font-semibold text-white">
                Action
              </div>
              <div className="flex flex-col items-center [&_svg]:fill-white/70">
                <UpArrow />
                <DownArrow />
              </div>
            </div>
            {/* See All link text color updated */}
            <div className="text-xs lg:text-sm text-gray-300 cursor-pointer hover:text-white">
              See all
            </div>
          </div>
        </div>
        <div className="flex flex-col rounded-lg shadow-inner">
          {insights.map((insight, index) => (
            <Insight key={index} {...insight} />
          ))}
        </div>

      </div>
    </div>
  );
};

export default Insights;