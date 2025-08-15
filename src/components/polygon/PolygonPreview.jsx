import React from "react";

const PolygonPreview = ({
    coordinates = [],
    width = 60,
    height = 60,
    isSelected = false
}) => {
    if (!coordinates.length) return null;

    const lats = coordinates.map(c => c.lat);
    const lngs = coordinates.map(c => c.lng);

    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    const latRange = maxLat - minLat || 1;
    const lngRange = maxLng - minLng || 1;

    const points = coordinates
        .map(({ lat, lng }) => {
            const x = ((lng - minLng) / lngRange) * width;
            const y = ((maxLat - lat) / latRange) * height;
            return `${x},${y}`;
        })
        .join(" ");

    return (
        <svg width={width} height={height}>
            <polygon
                points={points}
                fill="none"
                stroke={isSelected ? "#344e41" : "#344e41"}
                strokeWidth="1"
            />
        </svg>
    );
};

export default PolygonPreview;
