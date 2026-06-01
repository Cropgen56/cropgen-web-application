import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
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
import L from "leaflet";

// Import Leaflet marker icons
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const INDEXES = ["NDVI", "NDMI", "NDRE", "TRUE_COLOR"];

const TITLES = {
  NDVI: "Crop Health",
  NDMI: "Water in Crop",
  NDRE: "Crop Stress / Maturity",
  TRUE_COLOR: "True Color Image",
};

const DEFAULT_CENTER = [20.135245, 77.156935];

const isValidBounds = (bounds) => {
  if (!Array.isArray(bounds) || bounds.length !== 2) return false;

  const [sw, ne] = bounds;
  if (!Array.isArray(sw) || !Array.isArray(ne)) return false;
  if (sw.length !== 2 || ne.length !== 2) return false;

  const [swLat, swLng] = sw;
  const [neLat, neLng] = ne;

  return (
    typeof swLat === "number" &&
    typeof swLng === "number" &&
    typeof neLat === "number" &&
    typeof neLng === "number" &&
    !isNaN(swLat) &&
    !isNaN(swLng) &&
    !isNaN(neLat) &&
    !isNaN(neLng) &&
    swLat >= -90 &&
    swLat <= 90 &&
    neLat >= -90 &&
    neLat <= 90 &&
    swLng >= -180 &&
    swLng <= 180 &&
    neLng >= -180 &&
    neLng <= 180
  );
};

const closePolygon = (coords) => {
  if (!coords?.length) return [];
  const first = coords[0];
  const last = coords[coords.length - 1];

  if (first[0] !== last[0] || first[1] !== last[1]) {
    return [...coords, first];
  }

  return coords;
};

const calculateCentroid = (coords) => {
  if (!coords?.length) return { lat: null, lng: null };

  let latSum = 0;
  let lngSum = 0;
  let count = 0;

  coords.forEach(([lng, lat]) => {
    if (
      typeof lat === "number" &&
      typeof lng === "number" &&
      !isNaN(lat) &&
      !isNaN(lng)
    ) {
      latSum += lat;
      lngSum += lng;
      count += 1;
    }
  });

  if (!count) return { lat: null, lng: null };

  return {
    lat: latSum / count,
    lng: lngSum / count,
  };
};

const calculateBounds = (coords) => {
  if (!coords?.length) return null;

  const validCoords = coords.filter(
    ([lng, lat]) =>
      typeof lat === "number" &&
      typeof lng === "number" &&
      !isNaN(lat) &&
      !isNaN(lng)
  );

  if (!validCoords.length) return null;

  const lats = validCoords.map(([, lat]) => lat);
  const lngs = validCoords.map(([lng]) => lng);

  return [
    [Math.min(...lats), Math.min(...lngs)],
    [Math.max(...lats), Math.max(...lngs)],
  ];
};

const calculateImageBounds = (coords, centerOffset = 0) => {
  const bounds = calculateBounds(coords);
  if (!bounds) return null;

  const [[minLat, minLng], [maxLat, maxLng]] = bounds;

  const latPadding = Math.max((maxLat - minLat) * 0.02, 0.00005);
  const lngPadding = Math.max((maxLng - minLng) * 0.02, 0.00005);
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

        return [
          [minLat, minLng],
          [maxLat, maxLng],
        ];
      }

      if (apiBounds.length === 2) {
        const [first, second] = apiBounds;

        if (
          Array.isArray(first) &&
          Array.isArray(second) &&
          first.length === 2 &&
          second.length === 2
        ) {
          const [firstLng, firstLat] = first;
          const [secondLng, secondLat] = second;

          return [
            [firstLat, firstLng],
            [secondLat, secondLng],
          ];
        }
      }
    }

    if (typeof apiBounds === "object") {
      if (apiBounds.southwest && apiBounds.northeast) {
        return [
          [apiBounds.southwest.lat, apiBounds.southwest.lng],
          [apiBounds.northeast.lat, apiBounds.northeast.lng],
        ];
      }
    }
  } catch (err) {
    console.warn("Error parsing API bounds:", err);
  }

  return null;
};

const withTimeout = (promise, ms = 18000) => {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("SATELLITE_TIMEOUT")), ms)
    ),
  ]);
};

const formatDate = (date) => date.toISOString().split("T")[0];

const subtractDays = (days) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return formatDate(d);
};

const createDateCandidates = (selectedDate) => {
  if (selectedDate) {
    return [
      selectedDate,
      subtractDays(3),
      subtractDays(7),
      subtractDays(14),
      subtractDays(21),
      subtractDays(30),
    ].filter((v, i, arr) => v && arr.indexOf(v) === i);
  }

  return [
    subtractDays(3),
    subtractDays(7),
    subtractDays(14),
    subtractDays(21),
    subtractDays(30),
    subtractDays(45),
  ];
};

const hasUsableImage = (data) => {
  return Boolean(data?.image_base64);
};

const MoveMapToField = ({ lat, lng, bounds }) => {
  const map = useMap();

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        map.invalidateSize(true);

        if (bounds && isValidBounds(bounds)) {
          map.fitBounds(bounds, {
            padding: [50, 50],
            maxZoom: 16,
            animate: false,
          });
        } else if (lat != null && lng != null && !isNaN(lat) && !isNaN(lng)) {
          map.setView([lat, lng], 16, { animate: false });
        }
      } catch (e) {
        console.warn("Error in MoveMapToField:", e);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [lat, lng, bounds, map]);

  return null;
};

const MapResizer = () => {
  const map = useMap();

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        map.invalidateSize(true);
      } catch (e) {
        console.warn("Error in MapResizer:", e);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [map]);

  return null;
};

const MapCaptureMode = ({ isPDFMode }) => {
  const map = useMap();

  useEffect(() => {
    if (!isPDFMode) {
      // Re-enable interactions
      try {
        map.dragging.enable();
        map.touchZoom.enable();
        map.doubleClickZoom.enable();
        map.scrollWheelZoom.enable();
        map.boxZoom.enable();
        map.keyboard.enable();
      } catch (e) {
        console.warn("Error enabling map interactions:", e);
      }
      return;
    }

    // Disable for PDF
    try {
      map.dragging.disable();
      map.touchZoom.disable();
      map.doubleClickZoom.disable();
      map.scrollWheelZoom.disable();
      map.boxZoom.disable();
      map.keyboard.disable();
      map.invalidateSize({ animate: false });
    } catch (e) {
      console.warn("Error disabling map interactions:", e);
    }
  }, [isPDFMode, map]);

  return null;
};

// Fixed Legend Component
const ColorBarLegend = ({ legend, indexName }) => {
  if (!legend || legend.length === 0) return null;

  const sortedLegend = [...legend].sort((a, b) => {
    const aVal = parseFloat(a.label) || 0;
    const bVal = parseFloat(b.label) || 0;
    return aVal - bVal;
  });

  return (
    <div
      className="pdf-legend-bar"
      style={{
        marginTop: "12px",
        paddingLeft: "8px",
        paddingRight: "8px",
        display: "flex",
        flexDirection: "column",
        visibility: "visible",
        opacity: "1",
      }}
    >
      <div
        style={{
          display: "flex",
          height: "16px",
          borderRadius: "6px",
          overflow: "hidden",
          border: "1px solid rgba(255, 255, 255, 0.2)",
        }}
      >
        {sortedLegend.map((item, idx) => (
          <div
            key={`bar-${idx}`}
            style={{
              flex: 1,
              backgroundColor: item.color,
            }}
            title={`${item.label}: ${item.hectares?.toFixed(2) || 0} ha`}
          />
        ))}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "6px",
          paddingLeft: "4px",
          paddingRight: "4px",
        }}
      >
        <span
          style={{
            fontSize: "10px",
            color: "rgba(255, 255, 255, 0.9)",
            fontWeight: "500",
          }}
        >
          {sortedLegend[0]?.label || "Low"}
        </span>
        <span
          style={{
            fontSize: "10px",
            color: "rgba(255, 255, 255, 0.9)",
            fontWeight: "bold",
          }}
        >
          {indexName}
        </span>
        <span
          style={{
            fontSize: "10px",
            color: "rgba(255, 255, 255, 0.9)",
            fontWeight: "500",
          }}
        >
          {sortedLegend[sortedLegend.length - 1]?.label || "High"}
        </span>
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "8px",
          marginTop: "8px",
        }}
      >
        {sortedLegend.map((item, idx) => (
          <div
            key={`detail-${idx}`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "3px",
                backgroundColor: item.color,
                border: "1px solid rgba(255, 255, 255, 0.3)",
                display: "inline-block",
              }}
            />
            <span
              style={{
                fontSize: "9px",
                color: "rgba(255, 255, 255, 0.95)",
                fontWeight: "500",
                whiteSpace: "nowrap",
              }}
            >
              {item.label}: {item.hectares?.toFixed(2) || "0.0"}ha
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const FarmReportMap = React.forwardRef(
  (
    { selectedFieldsDetials, selectedDate = null, hidePolygonForPDF = false },
    ref
  ) => {
    const dispatch = useDispatch();
    const { indexDataByType, loading } = useSelector((state) => state.satellite);

    const prevRunKeyRef = useRef("");
    const mapInstancesRef = useRef({});

    const [showLegend, setShowLegend] = useState({
      NDVI: false,
      NDMI: false,
      NDRE: false,
      TRUE_COLOR: false,
    });

    const [localLoadingByIndex, setLocalLoadingByIndex] = useState({});
    const [failedByIndex, setFailedByIndex] = useState({});
    const [dateUsedByIndex, setDateUsedByIndex] = useState({});

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

    const polygonSignature = useMemo(() => {
      return JSON.stringify(polygonCoordinates);
    }, [polygonCoordinates]);

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

    const fetchSingleIndex = useCallback(
      async (indexName, dateCandidates) => {
        setLocalLoadingByIndex((prev) => ({
          ...prev,
          [indexName]: true,
        }));

        setFailedByIndex((prev) => ({
          ...prev,
          [indexName]: false,
        }));

        let found = false;
        let lastError = null;

        for (const dateToUse of dateCandidates) {
          try {
            const result = await withTimeout(
              dispatch(
                fetchIndexDataForMap({
                  endDate: dateToUse,
                  geometry: [polygonCoordinates],
                  index: indexName,
                })
              ).unwrap(),
              18000
            );

            if (hasUsableImage(result)) {
              setDateUsedByIndex((prev) => ({
                ...prev,
                [indexName]: dateToUse,
              }));

              found = true;
              break;
            }
          } catch (err) {
            lastError = err;
            console.warn(
              `${indexName} failed for date ${dateToUse}:`,
              err?.message || err
            );
          }
        }

        if (!found) {
          console.warn(`${indexName} no usable data found`, lastError);

          setFailedByIndex((prev) => ({
            ...prev,
            [indexName]: true,
          }));
        }

        setLocalLoadingByIndex((prev) => ({
          ...prev,
          [indexName]: false,
        }));
      },
      [dispatch, polygonCoordinates]
    );

    const fetchAllIndexes = useCallback(async () => {
      if (!polygonCoordinates.length || !fieldId) return;

      const dateCandidates = createDateCandidates(selectedDate);

      await Promise.allSettled(
        INDEXES.map((indexName) => fetchSingleIndex(indexName, dateCandidates))
      );
    }, [polygonCoordinates, fieldId, selectedDate, fetchSingleIndex]);

    useEffect(() => {
      if (!polygonCoordinates.length || !fieldId) return;

      const runKey = `${fieldId}-${selectedDate || "auto"}-${polygonSignature}`;

      if (prevRunKeyRef.current === runKey) return;

      prevRunKeyRef.current = runKey;

      dispatch(clearIndexDataByType());

      setFailedByIndex({});
      setDateUsedByIndex({});
      setLocalLoadingByIndex(
        INDEXES.reduce((acc, indexName) => {
          acc[indexName] = true;
          return acc;
        }, {})
      );

      fetchAllIndexes();
    }, [
      fieldId,
      selectedDate,
      polygonSignature,
      polygonCoordinates.length,
      dispatch,
      fetchAllIndexes,
    ]);

    useEffect(() => {
      return () => {
        dispatch(clearIndexDataByType());
        prevRunKeyRef.current = "";
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

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);

    const toggleLegend = useCallback((indexName) => {
      setShowLegend((prev) => ({
        ...prev,
        [indexName]: !prev[indexName],
      }));
    }, []);

    const retryIndex = useCallback(
      (indexName) => {
        const dateCandidates = createDateCandidates(selectedDate);
        fetchSingleIndex(indexName, dateCandidates);
      },
      [selectedDate, fetchSingleIndex]
    );

    if (!field || !field.field || field.field.length < 3) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
          {INDEXES.map((indexName) => (
            <div
              key={indexName}
              className="relative w-full h-[280px] rounded-xl overflow-hidden shadow-md bg-gray-800 flex items-center justify-center"
            >
              <div className="text-center p-4">
                <div className="animate-pulse">
                  <div className="w-16 h-16 bg-gray-600 rounded-full mx-auto mb-4" />
                  <div className="h-4 bg-gray-600 rounded w-32 mx-auto mb-2" />
                  <div className="h-3 bg-gray-700 rounded w-24 mx-auto" />
                </div>

                <p className="text-gray-400 mt-4 text-sm">
                  Waiting for field data...
                </p>
              </div>

              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 z-[3000] bg-ember-primary min-w-[160px] px-3 py-1.5 text-white text-sm font-semibold text-center rounded-md shadow-md">
                {TITLES[indexName]}
              </div>
            </div>
          ))}
        </div>
      );
    }

    const gridClasses = hidePolygonForPDF
      ? "grid grid-cols-2 gap-3 w-full"
      : "grid grid-cols-1 md:grid-cols-2 gap-3 w-full";

    return (
      <div ref={ref} className={gridClasses}>
        {INDEXES.map((indexName) => {
          const layer = indexDataByType?.[indexName];

          const reduxLoading = loading?.indexDataByType?.[indexName] === true;
          const localLoading = localLoadingByIndex?.[indexName] === true;

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

          const canRenderImage =
            imageUrl && effectiveImageBounds && isValidBounds(effectiveImageBounds);

          const showLoader = (reduxLoading || localLoading) && !canRenderImage;

          const showNoData =
            !showLoader && !canRenderImage && failedByIndex[indexName];

          return (
            <div
              key={`${indexName}-${fieldId}`}
              className={`map-card-wrapper ${
                hidePolygonForPDF ? "min-w-[580px]" : ""
              }`}
            >
              <div className="relative w-full h-[280px] rounded-xl overflow-hidden shadow-md bg-gray-900">
                {showLoader && (
                  <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-[5000] rounded-xl">
                    <LogoFlipLoader />

                    <p className="text-white text-sm mt-4 font-medium animate-pulse">
                      Loading {TITLES[indexName]}...
                    </p>

                    <p className="text-white/60 text-[11px] mt-1">
                      Searching latest available satellite scene
                    </p>
                  </div>
                )}

                {showNoData && (
                  <div className="absolute inset-0 bg-black/55 flex flex-col items-center justify-center z-[4000] rounded-xl">
                    <p className="text-white text-sm font-semibold text-center px-4">
                      No data available for {TITLES[indexName]}
                    </p>

                    <p className="text-white/70 text-xs text-center px-6 mt-1">
                      No usable image was found in recent satellite dates.
                    </p>

                    <button
                      onClick={() => retryIndex(indexName)}
                      className="mt-3 px-3 py-1.5 bg-ember-primary text-white text-xs rounded hover:bg-ember-primary-hover transition-colors"
                    >
                      Retry
                    </button>
                  </div>
                )}

                {!hidePolygonForPDF && (
                  <div className="absolute top-2 right-2 z-[5000] legend-dropdown-wrapper">
                    <button
                      onClick={() => toggleLegend(indexName)}
                      className="flex items-center whitespace-nowrap bg-ember-primary outline-none border border-ember-primary rounded text-white px-2 py-1 text-sm font-normal cursor-pointer hover:bg-ember-primary-hover transition-colors"
                    >
                      🗺️ Legend
                    </button>

                    {showLegend[indexName] && layer?.legend && (
                      <div className="absolute top-10 right-0 bg-ember-primary text-white rounded-lg shadow-lg max-w-[280px] max-h-[250px] overflow-y-auto z-[6000] animate-slideIn no-scrollbar">
                        <ul className="divide-y divide-white/10 list-none p-2 no-scrollbar">
                          {layer.legend.map((item, idx) => (
                            <li
                              key={`${item.label}-${idx}`}
                              className="flex items-center gap-2 p-1 cursor-pointer hover:bg-ember-primary-hover transition-colors duration-200 rounded"
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
                  dragging={!hidePolygonForPDF}
                  doubleClickZoom={false}
                  touchZoom={false}
                  style={{
                    height: "100%",
                    width: "100%",
                    background: "white",
                  }}
                  maxZoom={20}
                  minZoom={10}
                  attributionControl={false}
                  zoomControl={false}
                  preferCanvas={true}
                  ref={(mapRef) => {
                    if (mapRef) {
                      mapInstancesRef.current[indexName] = mapRef;
                    }
                  }}
                  whenReady={(mapEvent) => {
                    setTimeout(() => {
                      try {
                        mapEvent.target.invalidateSize(true);
                      } catch (e) {
                        console.warn("Error in whenReady:", e);
                      }
                    }, 150);
                  }}
                >
                  <MapResizer />
                  <MapCaptureMode isPDFMode={hidePolygonForPDF} />

                  <TileLayer
                    attribution="© Google Maps"
                    url="https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
                    subdomains={["mt0", "mt1", "mt2", "mt3"]}
                    maxZoom={20}
                    crossOrigin="anonymous"
                    updateWhenIdle={false}
                    keepBuffer={2}
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

                {dateUsedByIndex[indexName] && (
                  <div className="absolute top-2 left-2 z-[3000] rounded-md bg-black/60 px-2 py-1 text-[10px] font-medium text-white">
                    {dateUsedByIndex[indexName]}
                  </div>
                )}

                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 z-[3000] bg-ember-primary min-w-[160px] px-3 py-1.5 text-white text-sm font-semibold text-center rounded-md shadow-md">
                  {TITLES[indexName]}
                </div>
              </div>

              {hidePolygonForPDF && layer?.legend && indexName !== "TRUE_COLOR" && (
                <ColorBarLegend
                  legend={layer.legend}
                  indexName={TITLES[indexName]}
                />
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