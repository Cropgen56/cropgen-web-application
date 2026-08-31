import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ImageOverlay,
  MapContainer,
  Polygon,
  TileLayer,
  Tooltip,
  useMap,
} from "react-leaflet";
import {
  AlertTriangle,
  ArrowRight,
  Crosshair,
  Sparkles,
  Stethoscope,
  Waves,
  Maximize2,
} from "lucide-react";
import "leaflet/dist/leaflet.css";
import {
  calculateZoneCentroid,
  DEFAULT_MAP_CENTER,
  getZoneColor,
} from "./zoningUtils";

const ZoningFitBounds = ({ fieldBoundary, zones }) => {
  const map = useMap();

  useEffect(() => {
    const pts = [];
    if (fieldBoundary?.length >= 3) pts.push(...fieldBoundary);
    zones?.forEach((z) => {
      if (Array.isArray(z.coordinates) && z.coordinates.length) pts.push(...z.coordinates);
    });
    if (pts.length < 2) return;

    const lats = pts.map((p) => p[0]);
    const lngs = pts.map((p) => p[1]);
    map.fitBounds(
      [
        [Math.min(...lats), Math.min(...lngs)],
        [Math.max(...lats), Math.max(...lngs)],
      ],
      { padding: [32, 32], maxZoom: 19 },
    );
  }, [map, fieldBoundary, zones]);

  return null;
};

const calculatePolygonBounds = (coordinates) => {
  if (!coordinates?.length) return null;
  const lats = coordinates.map(([lat]) => lat);
  const lngs = coordinates.map(([, lng]) => lng);
  return [
    [Math.min(...lats), Math.min(...lngs)],
    [Math.max(...lats), Math.max(...lngs)],
  ];
};

/**
 * Leaflet's ImageOverlay can only draw an axis-aligned rectangle, but a
 * field's real boundary is usually a rotated/irregular polygon — so the
 * raster overflows past the field's true edges into the padding around
 * it. Build a CSS clip-path (percentages relative to the image's own
 * bounds) so the rendered raster is masked to the field's actual shape.
 */
const buildClipPathPolygon = (coordinates, bounds) => {
  if (!bounds || !coordinates?.length || coordinates.length < 3) return null;
  const [[minLat, minLng], [maxLat, maxLng]] = bounds;
  if (maxLat === minLat || maxLng === minLng) return null;

  const points = coordinates.map(([lat, lng]) => {
    const x = ((lng - minLng) / (maxLng - minLng)) * 100;
    const y = ((maxLat - lat) / (maxLat - minLat)) * 100;
    return `${x.toFixed(3)}% ${y.toFixed(3)}%`;
  });
  return `polygon(${points.join(", ")})`;
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
      action: "Inspect irrigation uniformity and apply corrective nutrients within 48 hours",
    };
  }

  if (label.includes("low")) {
    return {
      title: "Field Performance Dropping",
      cause: "Below-target crop vigor in this pocket",
      action: "Scout this patch and compare with neighboring rows in the next visit",
    };
  }

  if (label.includes("moderate") || label.includes("medium")) {
    return {
      title: "Moderate Crop Variation",
      cause: "Mixed crop response across the sampled area",
      action: "Monitor this section and validate with ground observations before intervention",
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
    action: "Review this area in detail and compare with the full legend report",
  };
};

const ZoningMap = ({
  zones,
  center,
  fieldBoundary,
  fieldName,
  alerts = [],
  ndviLayer,
  /** data:image/png;base64,... from VRA SOC/N/P/K maps */
  overlayImageUrl = null,
  reservedRightInset = 0,
  selectedZoneId,
  onSelectZone,
  className = "",
  showLabels = true,
  showLayer = true,
  onFullscreen,
}) => {
  const mapWrapperRef = useRef(null);
  const imageCanvasRef = useRef(null);
  const [hoveredLegendItem, setHoveredLegendItem] = useState(null);
  const [hoverPanelPosition, setHoverPanelPosition] = useState({ x: 0, y: 0 });

  const mapCenter =
    fieldBoundary?.length >= 3 ? calculateZoneCentroid(fieldBoundary) : center || DEFAULT_MAP_CENTER;
  const fieldBounds = useMemo(
    () => calculatePolygonBounds(fieldBoundary),
    [fieldBoundary],
  );
  const overlayClipPath = useMemo(
    () => buildClipPathPolygon(fieldBoundary, fieldBounds),
    [fieldBoundary, fieldBounds],
  );
  const ndviImage = useMemo(() => {
    if (overlayImageUrl) return overlayImageUrl;
    return ndviLayer?.image_base64
      ? `data:image/png;base64,${ndviLayer.image_base64}`
      : null;
  }, [overlayImageUrl, ndviLayer?.image_base64]);
  const hoveredInsight = useMemo(
    () => (hoveredLegendItem ? buildLegendInsight(hoveredLegendItem) : null),
    [hoveredLegendItem],
  );
  const mapWrapperWidth = mapWrapperRef.current?.clientWidth || 900;
  const hoverTooltipWidth = 430;

  useEffect(() => {
    setHoveredLegendItem(null);
  }, [ndviImage, ndviLayer?.legend]);

  useEffect(() => {
    if (!ndviImage) {
      imageCanvasRef.current = null;
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = ndviImage;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const context = canvas.getContext("2d");
      if (!context) return;
      context.drawImage(img, 0, 0);
      imageCanvasRef.current = canvas;
    };
  }, [ndviImage]);

  const handleOverlayHover = useCallback(
    (e) => {
      if (!fieldBounds || !imageCanvasRef.current || !ndviLayer?.legend?.length) return;

      const [southWest, northEast] = fieldBounds;
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

      const matchedLegendItem = getClosestLegendItem({ r, g, b }, ndviLayer.legend);
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
    [fieldBounds, ndviLayer?.legend],
  );

  return (
    <div ref={mapWrapperRef} className={`relative overflow-hidden rounded-2xl ${className}`}>
      <MapContainer
        center={mapCenter}
        zoom={16}
        className="h-full w-full"
        scrollWheelZoom={false}
        attributionControl={false}
        zoomControl={true}
        maxZoom={20}
      >
        <TileLayer
          attribution="© Google Maps"
          url="http://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
          subdomains={["mt0", "mt1", "mt2", "mt3"]}
          maxZoom={20}
        />

        <ZoningFitBounds fieldBoundary={fieldBoundary} zones={zones} />

        {fieldBoundary?.length >= 3 && (
          <Polygon
            positions={fieldBoundary}
            pathOptions={{
              color: "#15803d",
              weight: 3,
              fillColor: "#ecfdf5",
              fillOpacity: 0.12,
            }}
          />
        )}

        {fieldBounds && ndviImage && (
          <>
            {overlayClipPath && (
              <style>{`.leaflet-image-overlay-custom { clip-path: ${overlayClipPath}; -webkit-clip-path: ${overlayClipPath}; }`}</style>
            )}
            <ImageOverlay
              url={ndviImage}
              bounds={fieldBounds}
              opacity={0.82}
              zIndex={350}
              interactive={true}
              className="leaflet-image-overlay-custom"
              eventHandlers={{
                mouseover: handleOverlayHover,
                mousemove: handleOverlayHover,
                mouseout: () => setHoveredLegendItem(null),
              }}
            />
          </>
        )}

        {zones.map((zone) => {
          const color = getZoneColor(zone.productivityLevel);
          const isSelected = zone.id === selectedZoneId;
          const centroid = calculateZoneCentroid(zone.coordinates);

          return (
            <React.Fragment key={zone.id}>
              {showLayer && zone.coordinates?.length >= 3 && (
                <Polygon
                  positions={zone.coordinates}
                  pathOptions={{
                    color: isSelected ? "#ffffff" : color,
                    fillColor: color,
                    fillOpacity: isSelected ? 0.4 : 0.28,
                    weight: isSelected ? 4 : 2,
                  }}
                  eventHandlers={{
                    click: () => onSelectZone?.(zone.id),
                  }}
                />
              )}

              {showLabels && showLayer && zone.coordinates?.length >= 3 && (
                <Tooltip direction="center" permanent position={centroid} opacity={1}>
                  <div className="rounded-md bg-white/95 px-2 py-1 text-xs font-semibold text-slate-700 shadow">
                    {zone.name}
                  </div>
                </Tooltip>
              )}
            </React.Fragment>
          );
        })}

        {alerts.map((alert) => (
          <Tooltip
            key={alert.id}
            direction="top"
            permanent
            position={alert.centroid}
            opacity={1}
            offset={[0, -18]}
            className="smart-alert-tooltip"
          >
            <div className="relative w-[430px] overflow-hidden rounded-[28px] bg-[#fbf5e9] shadow-[0_30px_70px_rgba(15,23,42,0.22)]">
              <div className="absolute inset-y-0 left-0 w-[18px] bg-gradient-to-b from-[#ffb300] via-[#ff8a00] to-[#ff5c45]" />

              <div className="relative px-8 pb-6 pl-8 pt-7">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#fff1c9] shadow-[0_10px_25px_rgba(245,158,11,0.18)]">
                    <AlertTriangle size={24} strokeWidth={2.2} className="text-[#f59e0b]" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-[#0f766e]">
                      Smart Satellite Insight
                    </p>
                    <h4 className="mt-1 text-[20px] font-bold leading-tight text-slate-900">
                      Crop Stress Detected
                    </h4>
                  </div>
                </div>

                <div className="mt-5 rounded-[18px] border border-slate-200/80 bg-white px-5 py-4 shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
                  <div className="flex items-center gap-4 text-slate-800">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500">
                      <Crosshair size={18} />
                    </div>
                    <p className="text-[15px] font-medium">
                      {alert.areaAffected} Acre area affected in {alert.zoneName}
                    </p>
                  </div>
                </div>

                <div className="mt-5">
                  <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
                    Possible Cause
                  </p>
                  <div className="mt-2 flex items-center gap-3 text-[15px] font-semibold text-slate-900">
                    <Sparkles size={18} className="text-[#f59e0b]" />
                    <span>{alert.possibleCause}</span>
                  </div>
                </div>

                <div className="mt-5 rounded-[18px] border border-emerald-200 bg-gradient-to-r from-[#f3fff8] to-[#eefcf5] px-5 py-4">
                  <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[#0f766e]">
                    <Waves size={15} />
                    Recommended Action
                  </p>
                  <p className="mt-3 text-[15px] font-medium leading-6 text-slate-900">
                    {alert.recommendedAction}
                  </p>
                </div>

                <div className="mt-6 flex items-center justify-between gap-3 border-t border-slate-200/80 pt-5">
                  <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-[14px] font-semibold text-[#0f766e]">
                    <Stethoscope size={16} />
                    <span>{alert.confidence}% AI Confidence</span>
                  </div>

                  <button
                    type="button"
                    className="inline-flex items-center gap-3 rounded-2xl bg-[#0f766e] px-6 py-3 text-[15px] font-semibold text-white shadow-[0_12px_24px_rgba(15,118,110,0.28)] transition hover:bg-[#0b5d55]"
                  >
                    <span>View Detailed Report</span>
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          </Tooltip>
        ))}
      </MapContainer>

      {hoveredLegendItem && (
        <div
          className="absolute pointer-events-none z-[5000] w-[430px] max-w-[calc(100%-20px)] overflow-hidden rounded-[18px] bg-[#fbf5e9] text-[#1f2937] shadow-[0_16px_36px_rgba(15,23,42,0.16)]"
          style={{
            left: Math.max(
              hoverTooltipWidth / 2 + 10,
              Math.min(
                hoverPanelPosition.x + 18,
                mapWrapperWidth - reservedRightInset - hoverTooltipWidth / 2,
              ),
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
                <AlertTriangle size={17} strokeWidth={2.2} className="text-[#f59e0b]" />
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
                    {hoveredLegendItem.hectares?.toFixed(2) || "0.00"} ha ·{" "}
                    {fieldName || "Field"}
                  </p>
                </div>
              </div>

              <div className="rounded-[14px] border border-emerald-200 bg-gradient-to-r from-[#f3fff8] to-[#eefcf5] px-3 py-2.5">
                <p className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.08em] text-[#0f766e]">
                  <Waves size={12} />
                  Recommended
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
                  <span>{hoveredLegendItem.percent?.toFixed(2) || "0.00"}%</span>
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

      {onFullscreen && (
        <button
          type="button"
          onClick={onFullscreen}
          className="absolute bottom-4 right-4 z-[500] rounded-xl bg-white p-2 shadow-md hover:bg-slate-100"
          aria-label="Toggle fullscreen"
        >
          <Maximize2 size={18} className="text-slate-700" />
        </button>
      )}
    </div>
  );
};

export default ZoningMap;
