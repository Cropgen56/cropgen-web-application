import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { MapContainer, TileLayer, Polygon, ImageOverlay } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Layers } from "lucide-react";
import {
  isValidImageBounds,
  parseApiBounds,
  paddedBoundsFromPolygon,
} from "./mapOverlayUtils";

export default function MapPreview({ field, ndviLayer, analysisDate }) {
  const positions = useMemo(() => {
    const pts = field?.field;
    if (!pts?.length) return [];
    return pts.map((p) => [p.lat, p.lng]);
  }, [field]);

  const center = useMemo(() => {
    if (!positions.length) return [20.5937, 78.9629];
    let lat = 0;
    let lng = 0;
    positions.forEach(([la, ln]) => {
      lat += la;
      lng += ln;
    });
    const n = positions.length;
    return [lat / n, lng / n];
  }, [positions]);

  const ndviImageUrl = ndviLayer?.image_base64
    ? `data:image/png;base64,${ndviLayer.image_base64}`
    : null;

  const imageBounds = useMemo(() => {
    const fromApi = parseApiBounds(ndviLayer?.bounds);
    if (fromApi && isValidImageBounds(fromApi)) return fromApi;
    const fallback = paddedBoundsFromPolygon(positions);
    if (fallback && isValidImageBounds(fallback)) return fallback;
    return null;
  }, [ndviLayer?.bounds, positions]);

  const canShowNdvi =
    Boolean(ndviImageUrl) && imageBounds && isValidImageBounds(imageBounds);

  const legend = Array.isArray(ndviLayer?.legend) ? ndviLayer.legend : [];

  if (positions.length < 3) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[12px] bg-white border border-dashed border-gray-200 p-8 text-center text-gray-500 text-sm"
      >
        <Layers className="w-8 h-8 mx-auto mb-2 text-gray-400" />
        GIS snapshot unavailable — field geometry required.
      </motion.section>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.24 }}
      className="rounded-[12px] bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-gray-100 overflow-hidden"
    >
      <div className="px-5 py-3 border-b border-gray-100 flex flex-wrap items-center gap-2 bg-[#fafcfb]">
        <Layers className="w-4 h-4 text-[#0D6B45]" />
        <h2 className="text-sm font-bold uppercase tracking-wide text-[#0D6B45]">
          GIS / NDVI snapshot
        </h2>
        {analysisDate ? (
          <span className="text-xs font-medium text-gray-500 ml-auto">
            Scene: {analysisDate}
          </span>
        ) : null}
      </div>
      <div className="h-[220px] w-full relative">
        <MapContainer
          center={center}
          zoom={16}
          scrollWheelZoom={false}
          zoomControl={false}
          className="h-full w-full z-0"
          attributionControl={false}
        >
          <TileLayer
            attribution="© Google"
            url="http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
            subdomains={["mt0", "mt1", "mt2", "mt3"]}
            maxZoom={20}
            crossOrigin
          />
          {canShowNdvi ? (
            <ImageOverlay
              url={ndviImageUrl}
              bounds={imageBounds}
              opacity={0.88}
              zIndex={400}
            />
          ) : null}
          <Polygon
            positions={positions}
            pathOptions={{
              color: "#0D6B45",
              weight: 3,
              fillColor: "#0D6B45",
              fillOpacity: canShowNdvi ? 0.05 : 0.2,
            }}
          />
        </MapContainer>
        {!canShowNdvi ? (
          <div className="absolute bottom-2 left-2 right-2 pointer-events-none">
            <p className="text-[10px] text-center bg-black/55 text-white/95 rounded-md py-1 px-2">
              NDVI raster loads with the report; showing field outline on basemap.
            </p>
          </div>
        ) : null}
      </div>
      {legend.length > 0 && canShowNdvi ? (
        <div className="px-4 py-2.5 border-t border-gray-100 bg-[#fafcfb]">
          <p className="text-[10px] font-bold uppercase tracking-wide text-gray-500 mb-1.5">
            NDVI class legend
          </p>
          <div className="flex h-2.5 rounded overflow-hidden border border-gray-200">
            {[...legend]
              .sort((a, b) => (a.percent ?? 0) - (b.percent ?? 0))
              .map((item, idx) => (
                <div
                  key={`${item.label}-${idx}`}
                  className="flex-1 min-w-0"
                  style={{ backgroundColor: item.color || "#ccc" }}
                  title={`${item.label}${item.percent != null ? ` (${item.percent}%)` : ""}`}
                />
              ))}
          </div>
          <div className="flex justify-between mt-1 text-[9px] text-gray-500">
            <span>{legend[0]?.label || "Low"}</span>
            <span className="font-semibold text-[#0D6B45]">NDVI</span>
            <span>{legend[legend.length - 1]?.label || "High"}</span>
          </div>
        </div>
      ) : null}
    </motion.section>
  );
}
