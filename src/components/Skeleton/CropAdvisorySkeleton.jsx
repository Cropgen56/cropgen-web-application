
import React from "react";

const CropAdvisorySkeleton = () => {
    return (
        <div className="flex flex-col gap-4 mt-2 mb-3 rounded-lg shadow border border-gray-300 bg-white md:h-auto lg:h-auto p-3 overflow-hidden animate-pulse">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div className="h-5 w-32 bg-gray-300 rounded"></div>
                <div className="h-7 w-20 bg-gray-200 rounded"></div>
            </div>

            {/* Advisory cards row */}
            <div className="flex flex-nowrap justify-between lg:gap-4 gap-2 p-2 md:p-0 overflow-x-auto scrollbar-hide">
                {[...Array(4)].map((_, idx) => (
                    <div
                        key={idx}
                        className="flex-none lg:w-[250px] lg:h-[160px] md:w-[170px] md:h-[130px] bg-gray-200 rounded-lg p-3 md:p-2 shadow-md flex flex-col gap-2"
                    >
                        <div className="h-4 w-24 bg-gray-300 rounded"></div>
                        <div className="h-3 w-32 bg-gray-300 rounded"></div>
                        <div className="h-3 w-28 bg-gray-300 rounded"></div>
                        <div className="h-3 w-20 bg-gray-300 rounded"></div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CropAdvisorySkeleton;
