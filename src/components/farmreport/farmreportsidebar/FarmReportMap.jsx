// FarmReportMap.jsx
import React, {
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
} from "react";
import {
  MapContainer,
  TileLayer,
  Polygon,
  ImageOverlay,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchIndexDataForMap,
  clearIndexDataByType,
} from "../../../redux/slices/satelliteSlice";
import LogoFlipLoader from "../../comman/loading/LogoFlipLoader";

const MoveMapToField = ({ lat, lng, bounds }) => {
  const map = useMap();

  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();

      if (bounds && bounds.length === 2 && isValidBounds(bounds)) {
        map.fitBounds(bounds, {
          padding: [30, 30],
          maxZoom: 16,
          animate: false,
        });
      } else if (lat != null && lng != null && !isNaN(lat) && !isNaN(lng)) {
        map.setView([lat, lng], 16);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [lat, lng, bounds, map]);

  return null;
};

const MapResizer = () => {
  const map = useMap();

  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 300);

    return () => clearTimeout(timer);
  }, [map]);

  return null;
};

const isValidBounds = (bounds) => {
  if (!bounds || !Array.isArray(bounds) || bounds.length !== 2) return false;
  const [sw, ne] = bounds;
  if (!Array.isArray(sw) || !Array.isArray(ne)) return false;
  if (sw.length !== 2 || ne.length !== 2) return false;

  const [swLat, swLng] = sw;
  const [neLat, neLng] = ne;

  if (
    typeof swLat !== "number" ||
    isNaN(swLat) ||
    typeof swLng !== "number" ||
    isNaN(swLng) ||
    typeof neLat !== "number" ||
    isNaN(neLat) ||
    typeof neLng !== "number" ||
    isNaN(neLng)
  )
    return false;

  if (swLat < -90 || swLat > 90 || neLat < -90 || neLat > 90) return false;
  if (swLng < -180 || swLng > 180 || neLng < -180 || neLng > 180) return false;

  return true;
};

const closePolygon = (coords) => {
  if (!coords || !coords.length) return [];
  const first = coords[0];
  const last = coords[coords.length - 1];
  if (first[0] !== last[0] || first[1] !== last[1]) {
    return [...coords, first];
  }
  return coords;
};

const calculateCentroid = (coords) => {
  if (!coords || !coords.length) return { lat: null, lng: null };
  let x = 0,
    y = 0,
    validCount = 0;

  coords.forEach(([lng, lat]) => {
    if (
      typeof lat === "number" &&
      typeof lng === "number" &&
      !isNaN(lat) &&
      !isNaN(lng)
    ) {
      x += lat;
      y += lng;
      validCount++;
    }
  });

  if (validCount === 0) return { lat: null, lng: null };
  return { lat: x / validCount, lng: y / validCount };
};

const calculateBounds = (coords) => {
  if (!coords || !coords.length) return null;

  const validCoords = coords.filter(
    ([lng, lat]) =>
      typeof lat === "number" &&
      typeof lng === "number" &&
      !isNaN(lat) &&
      !isNaN(lng)
  );

  if (validCoords.length === 0) return null;

  const lats = validCoords.map(([lng, lat]) => lat);
  const lngs = validCoords.map(([lng, lat]) => lng);

  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  if (isNaN(minLat) || isNaN(maxLat) || isNaN(minLng) || isNaN(maxLng)) {
    return null;
  }

  return [
    [minLat, minLng],
    [maxLat, maxLng],
  ];
};

const calculateImageBounds = (coords, centerOffset = 0) => {
  if (!coords || !coords.length) return null;

  const validCoords = coords.filter(
    ([lng, lat]) =>
      typeof lat === "number" &&
      typeof lng === "number" &&
      !isNaN(lat) &&
      !isNaN(lng)
  );

  if (validCoords.length === 0) return null;

  const lats = validCoords.map(([lng, lat]) => lat);
  const lngs = validCoords.map(([lng, lat]) => lng);

  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  if (isNaN(minLat) || isNaN(maxLat) || isNaN(minLng) || isNaN(maxLng)) {
    return null;
  }

  const latPadding = (maxLat - minLat) * 0.02;
  const lngPadding = (maxLng - minLng) * 0.02;

  const latOffset = (maxLat - minLat) * centerOffset;

  return [
    [minLat - latPadding + latOffset, minLng - lngPadding],
    [maxLat + latPadding + latOffset, maxLng + lngPadding],
  ];
};

const parseApiBounds = (apiBounds) => {
  if (!apiBounds) return null;

  try {
    if (Array.isArray(apiBounds)) {
      if (apiBounds.length === 4) {
        const [minLng, minLat, maxLng, maxLat] = apiBounds;
        if (
          typeof minLat === "number" &&
          typeof minLng === "number" &&
          typeof maxLat === "number" &&
          typeof maxLng === "number"
        ) {
          return [
            [minLat, minLng],
            [maxLat, maxLng],
          ];
        }
      } else if (apiBounds.length === 2) {
        const [first, second] = apiBounds;
        if (Array.isArray(first) && Array.isArray(second)) {
          if (first.length === 2 && second.length === 2) {
            const [firstVal0, firstVal1] = first;
            const [secondVal0, secondVal1] = second;
            if (
              typeof firstVal0 === "number" &&
              typeof firstVal1 === "number" &&
              typeof secondVal0 === "number" &&
              typeof secondVal1 === "number"
            ) {
              return [
                [firstVal1, firstVal0],
                [secondVal1, secondVal0],
              ];
            }
          }
        }
      }
    } else if (typeof apiBounds === "object") {
      if (apiBounds.southwest && apiBounds.northeast) {
        const sw = apiBounds.southwest;
        const ne = apiBounds.northeast;
        if (
          typeof sw.lat === "number" &&
          typeof sw.lng === "number" &&
          typeof ne.lat === "number" &&
          typeof ne.lng === "number"
        ) {
          return [
            [sw.lat, sw.lng],
            [ne.lat, ne.lng],
          ];
        }
      }
    }
  } catch (error) {
    console.warn("Error parsing API bounds:", error);
  }

  return null;
};

// Color Palette Legend Component for PDF
const ColorPaletteLegend = ({ legend, indexName }) => {
  if (!legend || legend.length === 0) return null;

  return (
    <div className="color-palette-legend mt-2 bg-white/10 rounded-lg p-2">
      <div className="flex flex-wrap gap-1 justify-center items-center">
        {legend.map((item, idx) => (
          <div
            key={`${item.label}-${idx}`}
            className="flex items-center gap-1 px-2 py-1 bg-white/5 rounded"
          >
            <span
              className="w-4 h-3 rounded-sm border border-white/20 flex-shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-[10px] text-white font-medium whitespace-nowrap">
              {item.label}
            </span>
            <span className="text-[9px] text-white/70 whitespace-nowrap">
              ({item.hectares?.toFixed(1) || "0.0"}ha)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Horizontal Color Bar Legend for PDF (more compact)
const ColorBarLegend = ({ legend, indexName }) => {
  if (!legend || legend.length === 0) return null;

  // Sort legend by value (assuming labels contain value ranges)
  const sortedLegend = [...legend].sort((a, b) => {
    const aVal = parseFloat(a.label) || 0;
    const bVal = parseFloat(b.label) || 0;
    return aVal - bVal;
  });

  return (
    <div className="color-bar-legend mt-2 px-2 pdf-legend-bar">
      {/* Color gradient bar */}
      <div className="flex h-4 rounded-md overflow-hidden border border-white/20">
        {sortedLegend.map((item, idx) => (
          <div
            key={`bar-${idx}`}
            className="flex-1 relative group"
            style={{ backgroundColor: item.color }}
            title={`${item.label}: ${item.hectares?.toFixed(2) || 0} ha`}
          />
        ))}
      </div>
      
      {/* Labels below the bar */}
      <div className="flex justify-between mt-1 px-1">
        <span className="text-[9px] text-white/80">
          {sortedLegend[0]?.label || 'Low'}
        </span>
        <span className="text-[9px] text-white/80 font-medium">
          {indexName}
        </span>
        <span className="text-[9px] text-white/80">
          {sortedLegend[sortedLegend.length - 1]?.label || 'High'}
        </span>
      </div>
      
      {/* Detailed legend items */}
      <div className="flex flex-wrap justify-center gap-x-2 gap-y-1 mt-1">
        {sortedLegend.map((item, idx) => (
          <div key={`detail-${idx}`} className="flex items-center gap-1">
            <span
              className="w-3 h-2 rounded-sm border border-white/30"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-[8px] text-white/90">
              {item.label}: {item.hectares?.toFixed(1) || '0.0'}ha
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const INDEXES = ["NDVI", "NDMI", "NDRE", "TRUE_COLOR"];
const TITLES = {
  NDVI: "Crop Health",
  NDMI: "Water in Crop",
  NDRE: "Crop Stress / Maturity",
  TRUE_COLOR: "True Color Image",
};

const DEFAULT_CENTER = [20.135245, 77.156935];

const FarmReportMap = React.forwardRef(
  ({ selectedFieldsDetials, selectedDate = null, hidePolygonForPDF = false }, ref) => {
    const dispatch = useDispatch();
    const { indexDataByType, loading } = useSelector((state) => state.satellite);

    const hasFetchedRef = useRef(false);
    const prevFieldIdRef = useRef(null);

    const [showLegend, setShowLegend] = useState({
      NDVI: false,
      NDMI: false,
      NDRE: false,
      TRUE_COLOR: false,
    });

    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [localLoading, setLocalLoading] = useState(false);

    const field = selectedFieldsDetials?.[0];
    const fieldId = field?._id || field?.id;

    const polygonCoordinates = useMemo(() => {
      if (!field?.field || field.field.length < 3) return [];

      const validCoords = field.field
        .filter(
          (point) =>
            point &&
            typeof point.lat === "number" &&
            typeof point.lng === "number"
        )
        .map(({ lat, lng }) => [lng, lat]);

      if (validCoords.length < 3) return [];
      return closePolygon(validCoords);
    }, [field]);

    const centroid = useMemo(
      () => calculateCentroid(polygonCoordinates),
      [polygonCoordinates]
    );

    const polygonBounds = useMemo(
      () => calculateBounds(polygonCoordinates),
      [polygonCoordinates]
    );

    const imageBounds = useMemo(
      () => calculateImageBounds(polygonCoordinates, 0.05),
      [polygonCoordinates]
    );

    const leafletCoordinates = useMemo(() => {
      return polygonCoordinates
        .filter(
          ([lng, lat]) =>
            typeof lat === "number" &&
            typeof lng === "number" &&
            !isNaN(lat) &&
            !isNaN(lng)
        )
        .map(([lng, lat]) => [lat, lng]);
    }, [polygonCoordinates]);

    useEffect(() => {
      if (!polygonCoordinates.length) return;

      const fieldChanged = prevFieldIdRef.current !== fieldId;

      if (fieldChanged) {
        dispatch(clearIndexDataByType());
        hasFetchedRef.current = false;
        setIsInitialLoad(true);
        setLocalLoading(true);
      }

      if (hasFetchedRef.current && !fieldChanged) return;

      const dateToUse = selectedDate || new Date().toISOString().split("T")[0];

      hasFetchedRef.current = true;
      prevFieldIdRef.current = fieldId;

      const fetchPromises = INDEXES.map((index) =>
        dispatch(
          fetchIndexDataForMap({
            endDate: dateToUse,
            geometry: [polygonCoordinates],
            index,
          })
        )
      );

      Promise.all(fetchPromises).finally(() => {
        setIsInitialLoad(false);
        setLocalLoading(false);
      });
    }, [polygonCoordinates, selectedDate, dispatch, fieldId]);

    useEffect(() => {
      return () => {
        dispatch(clearIndexDataByType());
        hasFetchedRef.current = false;
        prevFieldIdRef.current = null;
      };
    }, [dispatch]);

    useEffect(() => {
      const handleClickOutside = (e) => {
        if (!e.target.closest(".legend-dropdown-wrapper")) {
          setShowLegend({
            NDVI: false,
            NDMI: false,
            NDRE: false,
            TRUE_COLOR: false,
          });
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleLegend = useCallback((indexName) => {
      setShowLegend((prev) => ({
        ...prev,
        [indexName]: !prev[indexName],
      }));
    }, []);

    if (!field || !field.field || field.field.length < 3) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full">
          {INDEXES.map((indexName) => (
            <div
              key={indexName}
              className="relative w-full h-[250px] rounded-xl overflow-hidden shadow-md bg-gray-800 flex items-center justify-center"
            >
              <div className="text-center p-4">
                <div className="animate-pulse">
                  <div className="w-16 h-16 bg-gray-600 rounded-full mx-auto mb-4"></div>
                  <div className="h-4 bg-gray-600 rounded w-32 mx-auto mb-2"></div>
                  <div className="h-3 bg-gray-700 rounded w-24 mx-auto"></div>
                </div>
                <p className="text-gray-400 mt-4 text-sm">
                  Waiting for field data...
                </p>
              </div>
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 z-[3000] bg-[#344E41] min-w-[160px] px-3 py-1.5 text-white text-sm font-semibold text-center rounded-md shadow-md">
                {TITLES[indexName]}
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div ref={ref} className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full">
        {INDEXES.map((indexName) => {
          const layer = indexDataByType?.[indexName];
          const isLoading = loading?.indexDataByType?.[indexName] ?? false;
          const imageUrl = layer?.image_base64
            ? `data:image/png;base64,${layer.image_base64}`
            : null;

          const apiParsedBounds = parseApiBounds(layer?.bounds);

          let effectiveImageBounds = null;

          if (apiParsedBounds && isValidBounds(apiParsedBounds)) {
            effectiveImageBounds = apiParsedBounds;
          } else if (imageBounds && isValidBounds(imageBounds)) {
            effectiveImageBounds = imageBounds;
          }

          const showLoader =
            isLoading || localLoading || (isInitialLoad && !imageUrl);
          const showNoData =
            !isLoading && !localLoading && !imageUrl && !isInitialLoad;
          const canRenderImage =
            imageUrl &&
            effectiveImageBounds &&
            isValidBounds(effectiveImageBounds);

          return (
            <div
              key={`${indexName}-${fieldId}`}
              className="map-card-wrapper"
            >
              <div className="relative w-full h-[250px] rounded-xl overflow-hidden shadow-md bg-gray-900">
                {showLoader && (
                  <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-[5000] rounded-xl">
                    <LogoFlipLoader />
                    <p className="text-white text-sm mt-4 font-medium animate-pulse">
                      Loading {TITLES[indexName]}...
                    </p>
                  </div>
                )}

                {showNoData && (
                  <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center z-[4000] rounded-xl">
                    <p className="text-white text-sm font-medium text-center px-4">
                      No data available for {TITLES[indexName]}
                    </p>
                    <button
                      onClick={() => {
                        const dateToUse =
                          selectedDate || new Date().toISOString().split("T")[0];
                        dispatch(
                          fetchIndexDataForMap({
                            endDate: dateToUse,
                            geometry: [polygonCoordinates],
                            index: indexName,
                          })
                        );
                      }}
                      className="mt-2 px-3 py-1 bg-[#344e41] text-white text-xs rounded hover:bg-[#5a7c6b] transition-colors"
                    >
                      Retry
                    </button>
                  </div>
                )}

                {!hidePolygonForPDF && (
                  <div className="absolute top-2 right-2 z-[5000] legend-dropdown-wrapper">
                    <button
                      onClick={() => toggleLegend(indexName)}
                      className="flex items-center whitespace-nowrap bg-[#344e41] outline-none border border-[#344e41] rounded text-white px-2 py-1 text-sm font-normal cursor-pointer hover:bg-[#5a7c6b] transition-colors"
                    >
                      🗺️ Legend
                    </button>

                    {showLegend[indexName] && layer?.legend && (
                      <div className="absolute top-10 right-0 bg-[#344e41] text-white rounded-lg shadow-lg max-w-[280px] max-h-[250px] overflow-y-auto z-[6000] animate-slideIn no-scrollbar">
                        <ul className="divide-y divide-white/10 list-none p-2 no-scrollbar">
                          {layer.legend.map((item, idx) => (
                            <li
                              key={`${item.label}-${idx}`}
                              className="flex items-center gap-2 p-1 cursor-pointer hover:bg-[#5a7c6b] transition-colors duration-200 rounded"
                            >
                              <span
                                className="w-[20px] h-[12px] rounded border border-black/10 flex-shrink-0"
                                style={{ backgroundColor: item.color }}
                              />
                              <span className="flex-1 text-xs whitespace-nowrap font-medium">
                                {item.label}
                              </span>
                              <span className="text-gray-200 text-xs font-normal whitespace-nowrap">
                                {item.hectares?.toFixed(2) || "0.00"} ha
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                <MapContainer
                  key={`map-${indexName}-${fieldId}`}
                  center={
                    centroid.lat != null &&
                    centroid.lng != null &&
                    !isNaN(centroid.lat) &&
                    !isNaN(centroid.lng)
                      ? [centroid.lat, centroid.lng]
                      : DEFAULT_CENTER
                  }
                  zoom={16}
                  scrollWheelZoom={false}
                  dragging={false}
                  doubleClickZoom={false}
                  touchZoom={false}
                  style={{ height: "100%", width: "100%" }}
                  maxZoom={20}
                  minZoom={10}
                  attributionControl={false}
                  zoomControl={false}
                >
                  <MapResizer />

                  <TileLayer
                    attribution="© Google Maps"
                    url="http://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
                    subdomains={["mt0", "mt1", "mt2", "mt3"]}
                    maxZoom={20}
                    crossOrigin={true}
                  />

                  {leafletCoordinates.length > 0 && (
                    <>
                      {canRenderImage && (
                        <ImageOverlay
                          url={imageUrl}
                          bounds={effectiveImageBounds}
                          opacity={1}
                          zIndex={400}
                        />
                      )}

                      {!hidePolygonForPDF && (
                        <Polygon
                          positions={leafletCoordinates}
                          pathOptions={{
                            fillColor: "transparent",
                            fillOpacity: 0,
                            color: "#ffffff",
                            weight: 2,
                            opacity: 1,
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

                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 z-[3000] bg-[#344E41] min-w-[160px] px-3 py-1.5 text-white text-sm font-semibold text-center rounded-md shadow-md">
                  {TITLES[indexName]}
                </div>
              </div>

              {/* Color Palette Legend for PDF - Always visible when hidePolygonForPDF is true */}
              {hidePolygonForPDF && layer?.legend && indexName !== "TRUE_COLOR" && (
                <ColorBarLegend legend={layer.legend} indexName={TITLES[indexName]} />
              )}
            </div>
          );
        })}
      </div>
    );
  }
);

FarmReportMap.displayName = "FarmReportMap";

export default FarmReportMap;