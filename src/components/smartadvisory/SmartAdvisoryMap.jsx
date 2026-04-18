import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { Listbox } from "@headlessui/react";
import {
  MapContainer,
  TileLayer,
  Polygon,
  ImageOverlay,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import {
  AlertTriangle,
  ArrowRight,
  Crosshair,
  Sparkles,
  Stethoscope,
  Waves,
} from "lucide-react";
import { resetSatelliteState } from "../../redux/slices/satelliteSlice";
import SmartAdvisoryIndexDates from "./SmartAdvisoryIndexDates";

const calculatePolygonCentroid = (coordinates) => {
  if (!coordinates || coordinates.length < 3) return { lat: null, lng: null };
  let area = 0,
    sumX = 0,
    sumY = 0;
  for (let i = 0; i < coordinates.length; i++) {
    const current = coordinates[i];
    const next = coordinates[(i + 1) % coordinates.length];
    const crossProduct = current.lat * next.lng - next.lat * current.lng;
    area += crossProduct;
    sumX += (current.lat + next.lat) * crossProduct;
    sumY += (current.lng + next.lng) * crossProduct;
  }
  area /= 2;
  return {
    lat: sumX / (6 * area),
    lng: sumY / (6 * area),
  };
};

const calculatePolygonBounds = (coordinates) => {
  if (!coordinates?.length) return null;
  const lats = coordinates.map(({ lat }) => lat);
  const lngs = coordinates.map(({ lng }) => lng);
  return [
    [Math.min(...lats), Math.min(...lngs)],
    [Math.max(...lats), Math.max(...lngs)],
  ];
};

const parseColorToRgb = (value) => {
  if (!value || typeof value !== "string") return null;
  const trimmed = value.trim();
  if (trimmed.startsWith("#")) {
    const hex = trimmed.slice(1);
    if (hex.length === 3) {
      return {
        r: parseInt(`${hex[0]}${hex[0]}`, 16),
        g: parseInt(`${hex[1]}${hex[1]}`, 16),
        b: parseInt(`${hex[2]}${hex[2]}`, 16),
      };
    }
    if (hex.length >= 6) {
      return {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16),
      };
    }
  }
  const rgbMatch = trimmed.match(
    /^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/,
  );
  if (rgbMatch) {
    return {
      r: Number(rgbMatch[1]),
      g: Number(rgbMatch[2]),
      b: Number(rgbMatch[3]),
    };
  }
  return null;
};

const getClosestLegendItem = (rgb, legendItems = []) => {
  if (!rgb || !legendItems.length) return null;
  let closest = null;
  let minDistance = Number.POSITIVE_INFINITY;
  legendItems.forEach((item) => {
    const itemRgb = parseColorToRgb(item?.color);
    if (!itemRgb) return;
    const distance = Math.sqrt(
      (rgb.r - itemRgb.r) ** 2 +
        (rgb.g - itemRgb.g) ** 2 +
        (rgb.b - itemRgb.b) ** 2,
    );
    if (distance < minDistance) {
      minDistance = distance;
      closest = item;
    }
  });
  return closest;
};

const buildLegendInsight = (item) => {
  const label = (item?.label || "").toLowerCase();
  if (label.includes("poor") || label.includes("very low")) {
    return {
      title: "Crop Stress Detected",
      cause: "Low vegetation vigor / possible moisture stress",
      action:
        "Inspect irrigation uniformity and apply corrective nutrients within 48 hours",
    };
  }
  if (label.includes("low")) {
    return {
      title: "Field Performance Dropping",
      cause: "Below-target crop vigor in this pocket",
      action:
        "Scout this patch and compare with neighboring rows in the next visit",
    };
  }
  if (label.includes("moderate") || label.includes("medium")) {
    return {
      title: "Moderate Crop Variation",
      cause: "Mixed crop response across the sampled area",
      action:
        "Monitor this section and validate with ground observations before intervention",
    };
  }
  if (label.includes("good") || label.includes("high")) {
    return {
      title: "Healthy Growth Zone",
      cause: "Strong vegetation response in this area",
      action: "Maintain the current irrigation and nutrition schedule",
    };
  }
  return {
    title: "Satellite Insight Available",
    cause: "Index color indicates a measurable crop variation",
    action:
      "Review this area in detail and compare with the full legend report",
  };
};

const MoveMapToField = ({ lat, lng, bounds }) => {
  const map = useMap();
  useEffect(() => {
    if (lat != null && lng != null && bounds) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    } else if (lat != null && lng != null) {
      map.setView([lat, lng], 15);
    }
  }, [lat, lng, bounds, map]);
  return null;
};

const SubscriptionDot = ({ isSubscribed }) => (
  <span
    className={`w-2 h-2 rounded-full shrink-0 ${
      isSubscribed ? "bg-[#28C878]" : "bg-[#EC1C24]"
    }`}
    title={isSubscribed ? "Active" : "Inactive"}
  />
);

// Simple Circular Loader Component
const CircularLoader = () => (
  <div className="flex flex-col items-center justify-center">
    <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
    <p className="text-white text-sm mt-3 font-medium">
      Loading satellite data...
    </p>
  </div>
);

const SmartAdvisoryMap = ({
  fields = [],
  selectedField,
  setSelectedField,
  selectedFieldsDetials,
  showFieldDropdown = false,
  height = "500px",
}) => {
  const dispatch = useDispatch();
  const { indexData, loading } = useSelector((state) => state?.satellite);

  const mapRef = useRef(null);
  const mapWrapperRef = useRef(null);
  const imageCanvasRef = useRef(null);
  const [image, setImage] = useState(null);
  const [showLegend, setShowLegend] = useState(false);
  const [hoveredLegendItem, setHoveredLegendItem] = useState(null);
  const [hoverPanelPosition, setHoverPanelPosition] = useState({ x: 0, y: 0 });

  const isSelectedFieldSubscribed =
    selectedField?.subscription?.hasActiveSubscription === true;

  // Sort fields in descending order (latest first)
  const sortedFields = useMemo(() => {
    return [...fields].sort((a, b) => {
      if (a.createdAt && b.createdAt) {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      if (a._id && b._id) {
        return b._id.localeCompare(a._id);
      }
      return fields.indexOf(b) - fields.indexOf(a);
    });
  }, [fields]);

  const selectedFieldData = useMemo(
    () =>
      fields.find((item) => item?._id === selectedField?._id) ||
      selectedField ||
      {},
    [fields, selectedField],
  );

  const polygonCoordinates = useMemo(
    () => selectedFieldData.field?.map(({ lat, lng }) => ({ lat, lng })) || [],
    [selectedFieldData],
  );

  const centroid = useMemo(
    () => calculatePolygonCentroid(polygonCoordinates),
    [polygonCoordinates],
  );

  const polygonBounds = useMemo(
    () => calculatePolygonBounds(polygonCoordinates),
    [polygonCoordinates],
  );

  useEffect(() => {
    setImage(
      indexData?.image_base64
        ? `data:image/png;base64,${indexData.image_base64}`
        : null,
    );
  }, [indexData]);

  useEffect(() => {
    setHoveredLegendItem(null);
  }, [image, selectedField?._id, indexData?.legend]);

  useEffect(() => {
    if (!image) {
      imageCanvasRef.current = null;
      return;
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = image;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const context = canvas.getContext("2d");
      if (!context) return;
      context.drawImage(img, 0, 0);
      imageCanvasRef.current = canvas;
    };
  }, [image]);

  const handleOverlayHover = useCallback(
    (e) => {
      if (
        !polygonBounds ||
        !imageCanvasRef.current ||
        !indexData?.legend?.length
      )
        return;

      const [southWest, northEast] = polygonBounds;
      const [minLat, minLng] = southWest;
      const [maxLat, maxLng] = northEast;
      const { lat, lng } = e.latlng || {};
      if (lat == null || lng == null) return;
      if (
        lat < minLat ||
        lat > maxLat ||
        lng < minLng ||
        lng > maxLng ||
        maxLng === minLng ||
        maxLat === minLat
      ) {
        setHoveredLegendItem(null);
        return;
      }

      const normalizedX = (lng - minLng) / (maxLng - minLng);
      const normalizedY = (maxLat - lat) / (maxLat - minLat);
      const canvas = imageCanvasRef.current;
      const context = canvas.getContext("2d");
      if (!context) return;

      const sampleX = Math.min(
        canvas.width - 1,
        Math.max(0, Math.round(normalizedX * (canvas.width - 1))),
      );
      const sampleY = Math.min(
        canvas.height - 1,
        Math.max(0, Math.round(normalizedY * (canvas.height - 1))),
      );
      const [r, g, b, a] = context.getImageData(sampleX, sampleY, 1, 1).data;
      if (a === 0) {
        setHoveredLegendItem(null);
        return;
      }

      const matchedLegendItem = getClosestLegendItem(
        { r, g, b },
        indexData.legend,
      );
      setHoveredLegendItem(matchedLegendItem);

      const wrapperRect = mapWrapperRef.current?.getBoundingClientRect();
      const { clientX, clientY } = e.originalEvent || {};
      if (wrapperRect && clientX != null && clientY != null) {
        setHoverPanelPosition({
          x: Math.min(
            wrapperRect.width - 16,
            Math.max(16, clientX - wrapperRect.left),
          ),
          y: Math.min(
            wrapperRect.height - 16,
            Math.max(16, clientY - wrapperRect.top),
          ),
        });
      }
    },
    [polygonBounds, indexData?.legend],
  );

  useEffect(() => {
    dispatch(resetSatelliteState());
  }, [selectedField, dispatch]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".legend-dropdown-wrapper")) setShowLegend(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const defaultCenter = [20.135245, 77.156935];
  const mapWrapperWidth = mapWrapperRef.current?.clientWidth || 900;
  const hoveredInsight = useMemo(
    () => (hoveredLegendItem ? buildLegendInsight(hoveredLegendItem) : null),
    [hoveredLegendItem],
  );
  const selectedFieldDisplayName =
    selectedFieldData?.fieldName ||
    selectedFieldData?.farmName ||
    "selected field";

  // Prepare selectedFieldsDetials for IndexDates component
  const fieldDetailsForIndex = useMemo(() => {
    if (selectedFieldsDetials && selectedFieldsDetials.length > 0) {
      return selectedFieldsDetials;
    }
    if (selectedFieldData && selectedFieldData.field) {
      return [selectedFieldData];
    }
    return [];
  }, [selectedFieldsDetials, selectedFieldData]);

  return (
    <div
      ref={mapWrapperRef}
      className="flex flex-col items-center w-full relative mt-2"
      style={{ height: height }}
    >
      <MapContainer
        center={
          centroid.lat != null ? [centroid.lat, centroid.lng] : defaultCenter
        }
        zoom={18}
        attributionControl={false}
        zoomControl={true}
        className="w-full h-full overflow-hidden rounded-lg"
        ref={mapRef}
        maxZoom={20}
      >
        {/* Loading Overlay with Circular Loader */}
        <AnimatePresence>
          {loading.indexData && (
            <motion.div
              key="map-loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="absolute inset-0 bg-black/60 flex items-center justify-center z-[1000] rounded-lg"
            >
              <CircularLoader />
            </motion.div>
          )}
        </AnimatePresence>

        <TileLayer
          attribution="© Google Maps"
          url="http://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
          subdomains={["mt0", "mt1", "mt2", "mt3"]}
          maxZoom={20}
        />

        {polygonCoordinates.length > 0 && (
          <>
            {/* Masking Polygon to hide white patch */}
            <Polygon
              pathOptions={{
                fillColor: "#e9ecef",
                fillOpacity: 1,
                color: "transparent",
                weight: 0,
              }}
              positions={polygonCoordinates.map(({ lat, lng }) => [lat, lng])}
            />
            {/* Field Polygon Outline */}
            <Polygon
              pathOptions={{
                fillColor: "transparent",
                fillOpacity: 0,
                color: "green",
                weight: 4,
              }}
              positions={polygonCoordinates.map(({ lat, lng }) => [lat, lng])}
            />
            {/* Satellite Overlay */}
            {polygonBounds && image && (
              <ImageOverlay
                url={image}
                bounds={polygonBounds}
                opacity={1}
                zIndex={400}
                interactive={true}
                className="leaflet-image-overlay-custom"
                eventHandlers={{
                  mouseover: handleOverlayHover,
                  mousemove: handleOverlayHover,
                  mouseout: () => setHoveredLegendItem(null),
                }}
              />
            )}
          </>
        )}

        <MoveMapToField
          lat={centroid.lat}
          lng={centroid.lng}
          bounds={polygonBounds}
        />
      </MapContainer>

      {/* Legend and Field Dropdown */}
      <div className="absolute top-2 right-2 flex flex-row gap-2 items-end z-[1000]">
        {showFieldDropdown && fields?.length > 0 && (
          <div className="relative w-full min-w-[140px]">
            <Listbox
              value={selectedField?._id}
              onChange={(value) => {
                const field = fields.find((f) => f._id === value);
                if (field) setSelectedField(field);
              }}
            >
              <div className="relative">
                <Listbox.Button className="bg-ember-sidebar text-white text-xs rounded border border-ember-sidebar px-2 py-1 cursor-pointer w-full">
                  {selectedField?.fieldName ||
                    selectedField?.farmName ||
                    "Select a field"}
                </Listbox.Button>
                <Listbox.Options
                  className="absolute mt-1 w-full bg-ember-sidebar rounded-lg shadow-lg 
                     text-white text-xs z-50 border border-ember-sidebar 
                     max-h-[200px] overflow-y-auto no-scrollbar"
                >
                  {sortedFields.map((field) => (
                    <Listbox.Option
                      key={field._id}
                      value={field._id}
                      className={({ active }) =>
                        `cursor-pointer select-none px-2 py-1.5 rounded ${
                          active ? "bg-ember-surface" : ""
                        }`
                      }
                    >
                      {field.fieldName || field.farmName}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </div>
            </Listbox>
          </div>
        )}

        {/* Index Legend (like Dashboard Map) */}
        <div className="legend-dropdown-wrapper relative w-max">
          <button
            type="button"
            onClick={() => setShowLegend(!showLegend)}
            className="flex items-center whitespace-nowrap bg-ember-sidebar outline-none border border-ember-sidebar rounded z-[3000] text-white px-3 py-1.5 font-normal cursor-pointer hover:bg-ember-sidebar-hover transition-colors text-sm"
          >
            🗺️ Legend
          </button>
          {showLegend && indexData?.legend && (
            <div className="absolute top-full right-0 mt-2 bg-ember-sidebar text-white rounded-lg shadow-lg max-w-[300px] max-h-[300px] overflow-y-auto z-[3000] no-scrollbar">
              <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
                <span className="font-semibold text-sm">Index Legend</span>
                <div className="flex items-center gap-1.5">
                  <SubscriptionDot isSubscribed={isSelectedFieldSubscribed} />
                  <span className="text-xs text-gray-300">
                    {isSelectedFieldSubscribed ? "Active" : ""}
                  </span>
                </div>
              </div>
              <ul className="divide-y divide-white/10 list-none p-2 no-scrollbar">
                {indexData.legend.map((item) => (
                  <li
                    key={item.label}
                    className="flex items-center gap-3 p-2 hover:bg-ember-sidebar-hover transition-colors rounded"
                  >
                    <span
                      className="w-6 h-4 rounded border border-black/10 shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="flex-1 whitespace-nowrap font-medium text-sm">
                      {item.label}
                    </span>
                    <span className="text-gray-200 text-xs whitespace-nowrap">
                      {item.hectares?.toFixed(2) || "0.00"} ha (
                      {item.percent?.toFixed(2) || "0.00"}%)
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {hoveredLegendItem && (
        <div
          className="absolute pointer-events-none z-[2500] w-[430px] max-w-[calc(100%-20px)] overflow-hidden rounded-[18px] bg-[#fbf5e9] text-[#1f2937] shadow-[0_16px_36px_rgba(15,23,42,0.16)]"
          style={{
            left: Math.max(
              220,
              Math.min(hoverPanelPosition.x + 18, mapWrapperWidth - 220),
            ),
            top: Math.max(84, hoverPanelPosition.y - 8),
            transform: "translate(-50%, -100%)",
          }}
        >
          <div className="absolute inset-y-0 left-0 w-[10px] bg-gradient-to-b from-[#ffb300] via-[#ff8a00] to-[#ff5c45]" />
          <div className="absolute bottom-[-6px] left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 bg-white shadow-[0_10px_20px_rgba(15,23,42,0.1)]" />
          <div className="relative px-4 pb-3 pt-4">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#fff1c9] shadow-[0_6px_14px_rgba(245,158,11,0.16)]">
                <AlertTriangle
                  size={17}
                  strokeWidth={2.2}
                  className="text-[#f59e0b]"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#0f766e]">
                  Smart Satellite Insight
                </p>
                <h4 className="mt-0.5 text-[14px] font-bold leading-tight text-slate-900">
                  {hoveredInsight?.title}
                </h4>
              </div>
              <div className="rounded-[12px] border border-slate-200/80 bg-white px-2.5 py-2 shadow-[0_6px_14px_rgba(15,23,42,0.05)]">
                <div className="flex items-center gap-2">
                  <span
                    className="h-5 w-5 rounded-md border border-black/10 shadow-sm"
                    style={{ backgroundColor: hoveredLegendItem.color }}
                  />
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold leading-none text-slate-900">
                      {hoveredLegendItem.label}
                    </p>
                    <p className="mt-1 text-[8px] leading-none text-slate-500">
                      {hoveredLegendItem.hectares?.toFixed(2) || "0.00"} ha
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-[1.05fr_1.1fr] gap-3">
              <div className="rounded-[14px] border border-slate-200/80 bg-white px-3 py-2.5 shadow-[0_6px_14px_rgba(15,23,42,0.05)]">
                <div className="flex items-center gap-2 text-slate-800">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500">
                    <Crosshair size={14} />
                  </div>
                  <p className="text-[11px] font-medium leading-4">
                    {hoveredLegendItem.hectares?.toFixed(2) || "0.00"} ha in{" "}
                    {selectedFieldDisplayName}
                  </p>
                </div>
              </div>
              <div className="rounded-[14px] border border-emerald-200 bg-gradient-to-r from-[#f3fff8] to-[#eefcf5] px-3 py-2.5">
                <p className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.08em] text-[#0f766e]">
                  <Waves size={12} /> Recommended
                </p>
                <p className="mt-1.5 text-[11px] font-medium leading-4 text-slate-900">
                  {hoveredInsight?.action}
                </p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between gap-3 border-t border-slate-200/80 pt-3">
              <div className="min-w-0 flex-1">
                <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-slate-500">
                  Possible Cause
                </p>
                <div className="mt-1 flex items-center gap-2 text-[11px] font-semibold text-slate-900">
                  <Sparkles size={14} className="shrink-0 text-[#f59e0b]" />
                  <span className="truncate">{hoveredInsight?.cause}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1.5 text-[10px] font-semibold text-[#0f766e]">
                  <Stethoscope size={12} />
                  <span>
                    {hoveredLegendItem.percent?.toFixed(2) || "0.00"}%
                  </span>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#0f766e] px-3 py-2 text-[11px] font-semibold text-white shadow-[0_8px_16px_rgba(15,118,110,0.22)]"
                >
                  <span>View Report</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Index Dates Selector */}
      {fieldDetailsForIndex.length > 0 && (
        <SmartAdvisoryIndexDates selectedFieldsDetials={fieldDetailsForIndex} />
      )}
    </div>
  );
};

export default SmartAdvisoryMap;
