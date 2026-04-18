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
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  AlertTriangle,
  ArrowRight,
  Crosshair,
  Sparkles,
  Stethoscope,
  Waves,
} from "lucide-react";
import { fetchweatherData } from "../../../redux/slices/weatherSlice";
import { resetSatelliteState } from "../../../redux/slices/satelliteSlice";
import LogoFlipLoader from "../../comman/loading/LogoFlipLoader";
import IndexDates from "./indexdates/IndexDates";

const TutorialOverlay = ({ show, onAddField }) => {
  if (!show) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center z-[2000] pointer-events-none">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-[100%] max-w-4xl pointer-events-auto">
        <h2 className="text-xl font-semibold text-center mb-4">
          How to Add Your First Farm Field
        </h2>

        <div className="aspect-video rounded-lg overflow-hidden">
          <iframe
            className="w-full h-full"
            src="https://www.youtube.com/embed/U_sVgXnqYPk"
            title="Add Field Tutorial"
            allowFullScreen
          />
        </div>

        <p className="text-gray-600 text-center mt-4">
          Watch this tutorial to learn how to add your farm field.
        </p>

        <div className="flex justify-center mt-6">
          <button
            onClick={onAddField}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Add Your Field
          </button>
        </div>
      </div>
    </div>
  );
};

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
      (rgb.r - itemRgb.r) ** 2 + (rgb.g - itemRgb.g) ** 2 + (rgb.b - itemRgb.b) ** 2,
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

// Subscription Status Dot Component
const SubscriptionDot = ({ isSubscribed }) => {
  return (
    <span
      className={`w-2 h-2 rounded-full flex-shrink-0 ${
        isSubscribed ? "bg-[#28C878]" : "bg-[#E63946]"
      }`}
      title={isSubscribed ? "Subscribed" : "Not Subscribed"}
    />
  );
};

const FarmMap = ({
  fields = [],
  selectedField,
  setSelectedField,
  selectedFieldsDetials,
  showFieldDropdown = true,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { indexData, loading } = useSelector((state) => state?.satellite);

  const mapRef = useRef(null);
  const mapWrapperRef = useRef(null);
  const imageCanvasRef = useRef(null);
  const [image, setImage] = useState(null);
  const [showLegend, setShowLegend] = useState(false);
  const [hoveredLegendItem, setHoveredLegendItem] = useState(null);
  const [hoverPanelPosition, setHoverPanelPosition] = useState({ x: 0, y: 0 });

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

  // Get selected field data with subscription status
  const selectedFieldObj = useMemo(
    () => fields.find((f) => f._id === selectedField),
    [fields, selectedField],
  );

  const isSelectedFieldSubscribed = useMemo(
    () => selectedFieldObj?.subscription?.hasActiveSubscription === true,
    [selectedFieldObj],
  );

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".legend-dropdown-wrapper")) setShowLegend(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedFieldData = useMemo(
    () => fields.find((item) => item?._id === selectedField) || {},
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
  }, [image, selectedField, indexData?.legend]);

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
      if (!polygonBounds || !imageCanvasRef.current || !indexData?.legend?.length) return;

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

      const matchedLegendItem = getClosestLegendItem({ r, g, b }, indexData.legend);
      setHoveredLegendItem(matchedLegendItem);

      const wrapperRect = mapWrapperRef.current?.getBoundingClientRect();
      const { clientX, clientY } = e.originalEvent || {};
      if (wrapperRect && clientX != null && clientY != null) {
        setHoverPanelPosition({
          x: Math.min(wrapperRect.width - 16, Math.max(16, clientX - wrapperRect.left)),
          y: Math.min(wrapperRect.height - 16, Math.max(16, clientY - wrapperRect.top)),
        });
      }
    },
    [polygonBounds, indexData?.legend],
  );

  const fetchWeatherData = useCallback(() => {
    if (!centroid.lat || !centroid.lng) return;
    const lastFetchTime = localStorage.getItem("lastFetchTime");
    const currentTime = Date.now();
    const threeHours = 3 * 60 * 60 * 1000;
    if (
      !lastFetchTime ||
      currentTime - parseInt(lastFetchTime, 10) > threeHours
    ) {
      dispatch(
        fetchweatherData({ latitude: centroid.lat, longitude: centroid.lng }),
      ).then((action) => {
        if (action.payload) {
          try {
            localStorage.setItem("weatherData", JSON.stringify(action.payload));
            localStorage.setItem("lastFetchTime", currentTime.toString());
          } catch (e) {
            if (e.name === "QuotaExceededError") {
              console.error("localStorage quota exceeded");
              localStorage.removeItem("oldWeatherData");
            }
          }
        }
      });
    }
  }, [dispatch, centroid.lat, centroid.lng]);

  useEffect(() => {
    fetchWeatherData();
  }, [fetchWeatherData]);

  useEffect(() => {
    dispatch(resetSatelliteState());
  }, [selectedField, dispatch]);

  const defaultCenter = [20.135245, 77.156935];
  const mapWrapperWidth = mapWrapperRef.current?.clientWidth || 900;
  const hoveredInsight = useMemo(
    () => (hoveredLegendItem ? buildLegendInsight(hoveredLegendItem) : null),
    [hoveredLegendItem],
  );

  return (
    <div
      ref={mapWrapperRef}
      className={`flex flex-col items-center w-full relative h-[75vh] ${fields?.length === 0 ? "h-[98vh]" : "lg:h-[85vh]"}`}
    >
      <MapContainer
        center={
          centroid.lat != null ? [centroid.lat, centroid.lng] : defaultCenter
        }
        zoom={18}
        attributionControl={false}
        zoomControl={true}
        className={`w-full h-full overflow-hidden ${
          fields.length === 0 ? "rounded-2xl" : "rounded-2xl"
        }`}
        ref={mapRef}
        maxZoom={20}
      >
        <AnimatePresence>
          {loading.indexData && (
            <motion.div
              key="map-loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-[1000] rounded-2xl"
            >
              <LogoFlipLoader />
              <p className="text-white text-sm mt-4 font-medium animate-pulse">
                Almost there… optimizing your field insights
              </p>
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
            <Polygon
              pathOptions={{
                fillColor: "#e9ecef",
                fillOpacity: 1,
                color: "transparent",
                weight: 0,
              }}
              positions={polygonCoordinates.map(({ lat, lng }) => [lat, lng])}
            />
            <Polygon
              pathOptions={{
                fillColor: "transparent",
                fillOpacity: 0,
                color: "green",
                weight: 4,
              }}
              positions={polygonCoordinates.map(({ lat, lng }) => [lat, lng])}
            />
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
      <TutorialOverlay
        show={fields.length === 0}
        onAddField={() => navigate("/addfield")}
      />

      <div className="absolute top-2 right-2 flex flex-row gap-3 items-end z-[1000]">
        {showFieldDropdown && fields?.length > 0 && (
          <div className="relative w-full min-w-[150px]">
            <Listbox
              value={selectedField}
              onChange={(value) => setSelectedField(value)}
            >
              <div className="relative">
                {/* Updated Listbox Button with subscription dot */}
                <Listbox.Button className="bg-[#344e41] text-white rounded border border-[#344e41] px-3 py-1.5 cursor-pointer w-full shadow-md">
                  <div className="flex items-center gap-2">
                    <SubscriptionDot isSubscribed={isSelectedFieldSubscribed} />
                    <span className="truncate">
                      {selectedFieldObj?.fieldName || "Select a field"}
                    </span>
                  </div>
                </Listbox.Button>

                {/* Updated Listbox Options with subscription dots */}
                <Listbox.Options
                  className="absolute mt-1 w-full bg-[#344e41] rounded-lg shadow-lg 
                     text-white z-50 border border-[#344e41] 
                     max-h-[300px] overflow-y-auto no-scrollbar"
                >
                  {sortedFields.map((field) => {
                    const isSubscribed =
                      field.subscription?.hasActiveSubscription === true;

                    return (
                      <Listbox.Option
                        key={field._id}
                        value={field._id}
                        className={({ active }) =>
                          `cursor-pointer select-none px-3 py-2 rounded transition-all duration-500 ease-in-out ${
                            active ? "bg-[#5a7c6b]" : ""
                          }`
                        }
                      >
                        <div className="flex items-center gap-2">
                          <SubscriptionDot isSubscribed={isSubscribed} />
                          <span className="truncate">{field.fieldName}</span>
                        </div>
                      </Listbox.Option>
                    );
                  })}
                </Listbox.Options>
              </div>
            </Listbox>
          </div>
        )}

        <div className="legend-dropdown-wrapper relative w-max">
          <strong
            onClick={() => {
              setShowLegend(!showLegend);
            }}
            className="flex items-center whitespace-nowrap bg-[#344e41] outline-none border border-[#344e41] rounded z-[3000] text-white px-3 py-1.5 font-normal cursor-pointer shadow-md"
          >
            🗺️ Legend
          </strong>
          {showLegend && indexData?.legend && (
            <div className="absolute top-12 right-0 bg-[#344e41] text-white rounded-lg shadow-lg max-w-[300px] max-h-[300px] overflow-y-auto z-[3000] animate-slideIn no-scrollbar">
              {/* Legend Header with Subscription Status */}
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
                    className="flex items-center gap-3 p-2 cursor-pointer hover:bg-[#5a7c6b] transition-all duration-500 ease-in-out rounded"
                  >
                    <span
                      className="w-[30px] h-[20px] rounded border border-black/10"
                      style={{ backgroundColor: item.color }}
                    ></span>
                    <span className="flex-1 whitespace-nowrap font-medium">
                      {item.label}
                    </span>
                    <span className="text-gray-200 font-normal whitespace-nowrap">
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
                    {selectedFieldObj?.fieldName || "selected field"}
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
      <IndexDates selectedFieldsDetials={selectedFieldsDetials} />
    </div>
  );
};

export default FarmMap;
