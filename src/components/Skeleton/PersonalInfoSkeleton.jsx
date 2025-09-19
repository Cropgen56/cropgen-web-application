import React from "react";


const SkeletonBox = ({ className }) => (
    <div className={`bg-gray-300/50 rounded-md strong-pulse ${className}`} />
);

const PersonalInfoSkeleton = () => {
    return (
        <div className="max-w-[1200px] w-[98%] mx-auto my-2 p-2 lg:p-4 rounded-lg bg-white shadow-md font-inter h-[98%] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between text-left px-4 py-1 border-b border-black/40">
                <SkeletonBox className="h-6 w-32" />
                <SkeletonBox className="h-5 w-28" />
            </div>

            <div className="py-2 flex flex-col flex-grow gap-6">
                {/* Profile Info */}
                <div className="flex items-center gap-4 px-2 lg:px-4 pb-4 border-b border-black/40">
                    <SkeletonBox className="w-20 h-20 rounded-full" />
                    <div className="flex flex-col gap-2 w-full">
                        <SkeletonBox className="h-6 w-40" /> {/* name */}
                        <SkeletonBox className="h-4 w-24" /> {/* role */}
                        <div className="flex gap-4">
                            <SkeletonBox className="h-4 w-32" />
                            <SkeletonBox className="h-4 w-32" />
                        </div>
                    </div>
                </div>

                {/* Form Fields */}
                <form className="flex flex-col flex-grow gap-4">
                    <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4 p-2">
                        {/* Left column */}
                        <div className="flex flex-col gap-4">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="flex flex-col gap-2">
                                    <SkeletonBox className="h-4 w-24" /> {/* label */}
                                    <SkeletonBox className="h-10 w-full" /> {/* input */}
                                </div>
                            ))}
                        </div>
                        {/* Right column */}
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-2">
                                <SkeletonBox className="h-4 w-32" />
                                <SkeletonBox className="h-10 w-full" />
                            </div>
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-center items-center">
                        <SkeletonBox className="h-10 w-32 rounded-md" />
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PersonalInfoSkeleton;
