import React from "react";
import SettingsPanel from "../setting/SettingsPanel";

const SkeletonBox = ({ className }) => (
  <div className={`animate-pulse rounded-md bg-gray-200/80 ${className}`} />
);

const PersonalInfoSkeleton = () => (
  <SettingsPanel
    title="Personal Info"
    description="Loading your profile…"
    className="h-full bg-[#f8fbf9]"
  >
    <div className="mx-auto w-full max-w-4xl space-y-3 sm:space-y-4">
      <div className="rounded-xl bg-gray-200/60 p-4 sm:p-5">
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center">
          <SkeletonBox className="h-[72px] w-[72px] rounded-xl sm:h-20 sm:w-20" />
          <div className="flex w-full flex-col items-center gap-2 sm:items-start">
            <SkeletonBox className="h-5 w-40" />
            <SkeletonBox className="h-3 w-24" />
            <div className="flex gap-2">
              <SkeletonBox className="h-10 w-20" />
              <SkeletonBox className="h-10 w-20" />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-3 sm:p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <SkeletonBox className="h-3 w-20" />
              <SkeletonBox className="h-9 w-full rounded-lg" />
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-center border-t border-gray-100 pt-4">
          <SkeletonBox className="h-9 w-28 rounded-lg" />
        </div>
      </div>
    </div>
  </SettingsPanel>
);

export default PersonalInfoSkeleton;
