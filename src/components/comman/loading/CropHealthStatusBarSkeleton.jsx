import React from "react";

const CropHealthStatusBarSkeleton = () => {
  return (
    <div className="w-full flex flex-col gap-2 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center gap-2">
        <div className="h-5 bg-gray-300 rounded w-40"></div>
        <div className="w-5 h-5 bg-gray-300 rounded-full"></div>
      </div>

      {/* Content Skeleton */}
      <div className="flex items-center justify-between w-full">
        <div className="flex items-baseline gap-3">
          <div className="h-7 bg-gray-300 rounded w-16"></div>
          <div className="h-4 bg-gray-300 rounded w-48"></div>
        </div>
        <div className="h-8 bg-gray-300 rounded w-24"></div>
      </div>

      {/* Progressive Loading Bar */}
      <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
        <div
          className="absolute left-0 top-0 h-3 rounded-full"
          style={{
            width: '100%',
            background: 'linear-gradient(90deg, #5a7c6b 0%, #7a9c8b 50%, #5a7c6b 100%)',
            backgroundSize: '200% 100%',
            animation: 'progressiveLoad 1.5s ease-in-out infinite'
          }}
        />
      </div>

      {/* Loading Text with Spinner */}
      <div className="flex items-center justify-center gap-2 mt-2">
        <div 
          className="w-4 h-4 border-2 rounded-full animate-spin"
          style={{
            borderColor: '#5a7c6b',
            borderTopColor: 'transparent'
          }}
        ></div>
        <span className="text-sm font-medium" style={{ color: '#5a7c6b' }}>
          Fetching crop health data...
        </span>
      </div>

      {/* Add CSS animations */}
      <style>{`
        @keyframes progressiveLoad {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
};

export default CropHealthStatusBarSkeleton;