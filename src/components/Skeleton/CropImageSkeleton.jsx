import React, { useState } from "react";

const CropImageLoader = ({ src, alt }) => {
    const [loading, setLoading] = useState(true);

    return (
        <div className="flex flex-col items-center shadow-md border border-gray-100 rounded-md w-[160px] h-[160px] overflow-hidden bg-gray-200 relative">
            {loading && (
                <div className="absolute inset-0 bg-gray-300 animate-pulse" />
            )}
            <img
                src={src || "https://via.placeholder.com/160"}
                alt={alt || "crop"}
                className={`w-full h-full object-cover transition-opacity duration-500 ${loading ? "opacity-0" : "opacity-100"
                    }`}
                onLoad={() => setLoading(false)}
                onError={() => setLoading(false)}
            />
        </div>
    );
};

export default CropImageLoader;
