import React from "react";
import "./weatherSkeleton.css"; // strong pulse animation

const SkeletonBox = ({ className }) => (
    <div className={`bg-gray-300/50 rounded-md strong-pulse ${className}`} />
);

const WeatherSkeleton = () => {
    return (
        <div className="w-full h-full p-6 space-y-10 overflow-y-auto">
            {/* Week Weather (Weather Data cards) */}
            <section className="grid grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex flex-col space-y-3">
                        <SkeletonBox className="h-6 w-full mx-auto" /> {/* small top bar */}
                        <SkeletonBox className="h-24 w-full" />       {/* chart box */}
                    </div>
                ))}
            </section>

            {/* Weather History */}
            <section className="flex flex-col space-y-4 mt-10">

                <div className="flex space-x-4">
                    <SkeletonBox className="h-40 w-1/2" />
                    <SkeletonBox className="h-40 w-1/2" />
                </div>
            </section>

            {/* Rain Chances */}
            <section className="flex flex-col space-y-4 mt-20">
                <div className="flex  justify-center space-x-4">
                    {[1, 2, 3, 4].map((i) => (
                        <SkeletonBox key={i} className="h-10 w-full" />
                    ))}
                </div>
                <SkeletonBox className="h-72 w-full" />
            </section>

            {/* Wind */}
            <section className="flex flex-col space-y-4 mt-10">
                <div className="flex space-x-4">
                    <SkeletonBox className="h-10 w-1/6" mt-10 />
                    <SkeletonBox className="h-10 w-1/4" />
                </div>
                <SkeletonBox className="h-32 w-full" />
            </section>

            {/* Temperature */}
            <section className="flex flex-col space-y-4">
                <SkeletonBox className="h-6 w-1/4" />
                <SkeletonBox className="h-32 w-full" />
            </section>

            {/* Humidity */}
            <section className="flex flex-col space-y-4">
                <SkeletonBox className="h-6 w-1/4" />
                <SkeletonBox className="h-32 w-full" />
            </section>
        </div>
    );
};

export default WeatherSkeleton;
