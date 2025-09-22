import React from "react";

const NutrientBarSkeleton = () => {
  return (
    <div className="flex items-center gap-2 sm:gap-3 md:gap-2 mb-3 sm:mb-4 animate-pulse">
      {/* Nutrient Circle */}
      <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-6 md:h-6 bg-gray-300 rounded-full" />

      {/* Bars */}
      <div className="flex-1">
        {/* Label */}
        <div className="h-3 sm:h-4 md:h-3 w-20 sm:w-28 md:w-16 bg-gray-300 rounded mb-2" />

        {/* Current Bar */}
        <div className="bg-gray-200 h-1.5 sm:h-2 md:h-1.5 rounded-full mb-1 overflow-hidden">
          <div className="h-full bg-gray-300 w-3/5 rounded-full" />
        </div>

        {/* Required Bar */}
        <div className="bg-gray-200 h-1.5 sm:h-2 md:h-1.5 rounded-full overflow-hidden">
          <div className="h-full bg-gray-300 w-4/5 rounded-full" />
        </div>
      </div>

      {/* Values */}
      <div className="flex flex-col items-start pt-4 sm:pt-5 md:pt-4">
        <div className="h-3 w-12 sm:w-14 bg-gray-300 rounded mb-1" />
        <div className="h-3 w-10 sm:w-12 bg-gray-200 rounded" />
      </div>
    </div>
  );
};

const NpkChartSkeleton = () => {
  return (
    <div className="w-full px-2 sm:px-4 md:scale-[0.95] md:pl-1">
      {/* Legend Skeleton */}
      <div className="flex justify-end items-center mb-3 sm:mb-4 animate-pulse">
        <div className="flex items-center mr-6">
          <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-300 rounded-sm mr-2" />
          <div className="h-3 w-12 bg-gray-200 rounded" />
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-300 rounded-sm mr-2" />
          <div className="h-3 w-14 bg-gray-200 rounded" />
        </div>
      </div>

      {/* 3 Nutrient Bars */}
      <NutrientBarSkeleton />
      <NutrientBarSkeleton />
      <NutrientBarSkeleton />

      {/* Notes Skeleton */}
      <div className="mt-4 sm:mt-6 bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-300 animate-pulse">
        <div className="h-4 w-32 bg-gray-300 rounded mb-2" />
        <div className="h-3 w-full bg-gray-200 rounded mb-1" />
        <div className="h-3 w-4/5 bg-gray-200 rounded" />
      </div>
    </div>
  );
};

export default NpkChartSkeleton;
