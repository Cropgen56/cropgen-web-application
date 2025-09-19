// FarmSkeletonLoader.jsx
import React from "react";

const FarmSkeletonCard = () => (
    <div className="flex flex-col rounded-lg shadow-sm border border-[#075A53] overflow-hidden animate-pulse">
        {/* Header */}
        <div className="flex justify-between items-center bg-[#5A7C6B]/50 p-2">
            <div className="h-3 w-20 bg-gray-300 rounded"></div>
            <div className="h-3 w-10 bg-gray-300 rounded"></div>
        </div>

        {/* Polygon / Map Preview */}
        <div className="flex-grow flex items-center justify-center bg-gray-100">
            <div className="w-20 h-20 bg-gray-300 rounded-full"></div>
        </div>

        {/* Footer Info */}
        <div className="flex justify-around items-center bg-white border-t border-[#075A53] p-2">
            <div className="flex flex-col items-center gap-1">
                <div className="w-4 h-4 bg-gray-300 rounded"></div>
                <div className="h-2 w-10 bg-gray-300 rounded"></div>
            </div>
            <div className="flex flex-col items-center gap-1">
                <div className="w-4 h-4 bg-gray-300 rounded"></div>
                <div className="h-2 w-14 bg-gray-300 rounded"></div>
            </div>
            <div className="flex flex-col items-center gap-1">
                <div className="w-4 h-4 bg-gray-300 rounded"></div>
                <div className="h-2 w-12 bg-gray-300 rounded"></div>
            </div>
        </div>
    </div>
);

const FarmSkeletonLoader = ({ count = 6 }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-2">
        {Array.from({ length: count }).map((_, idx) => (
            <FarmSkeletonCard key={idx} />
        ))}
    </div>
);

export default FarmSkeletonLoader;

