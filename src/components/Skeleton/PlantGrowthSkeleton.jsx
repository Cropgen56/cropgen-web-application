// PlantGrowthSkeleton.jsx
import React from "react";

const PlantGrowthSkeleton = () => {
    return (
        <div className="flex flex-col bg-white rounded-xl shadow-sm border border-[#075A53]/20 animate-pulse p-4 h-[350px] w-full">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <div className="h-4 w-28 bg-gray-300 rounded"></div>
                <div className="h-4 w-12 bg-gray-300 rounded"></div>
            </div>

            {/* Chart Area */}
            <div className="flex-grow flex flex-col justify-between">
                {/* Fake Y-axis ticks */}
                <div className="flex flex-col justify-between h-full">
                    {[...Array(5)].map((_, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                            <div className="h-2 w-6 bg-gray-300 rounded"></div>
                            <div className="h-2 flex-grow bg-gray-200 rounded"></div>
                        </div>
                    ))}
                </div>
            </div>

            {/* X-axis */}
            <div className="flex justify-between mt-4">
                {[...Array(6)].map((_, idx) => (
                    <div key={idx} className="h-2 w-8 bg-gray-300 rounded"></div>
                ))}
            </div>
        </div>
    );
};

export default PlantGrowthSkeleton;
