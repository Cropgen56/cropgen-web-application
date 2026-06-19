import React, { useState, useRef, useEffect, useCallback } from "react";
import L from "leaflet";
import {
  MapContainer,
  TileLayer,
  Polygon,
  Polyline,
  CircleMarker,
  GeoJSON,
  useMapEvents,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import {
  BackButtonIcon,
  CurrentLocation,
  DeleteIcon,
} from "../../assets/Icons";
import { Calender, LeftArrow, RightArrow } from "../../assets/DashboardIcons";
import FileUploadOverlay from "./FileUploadOverlay";
import GoogleSearchField from "./GoogleSearchField";

const DEFAULT_CENTER = { lat: 20.5937, lng: 78.9629 };
const SNAP_CLOSE_FIRST_VERTEX_PX = 32;

const GEO_OPTIONS = {
  enableHighAccuracy: true,
  timeout: 15000,
  maximumAge: 60_000,
};

const AddFieldMap = ({
  setMarkers,
  markers,
  isTabletView = false,
  isAddingMarkers,
  toggleAddMarkers,
  clearMarkers,
  onToggleSidebar,
  initialMapCenter = null,
}) => {
  const [mapCenter, setMapCenter] = useState(() =>
    initialMapCenter ? { ...initialMapCenter } : DEFAULT_CENTER,
  );
  const [hasCenteredOnUser, setHasCenteredOnUser] = useState(!!initialMapCenter);
  const [isLocatingUser, setIsLocatingUser] = useState(!initialMapCenter);
  const [selectedIcon, setSelectedIcon] = useState("");
  const [showUploadOverlay, setShowUploadOverlay] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [geojsonLayers, setGeojsonLayers] = useState([]);
  const [isMapReady, setIsMapReady] = useState(false);
  const [drawPreview, setDrawPreview] = useState(null);

  const mapRef = useRef(null);
  const drawPreviewRaf = useRef(null);
  const defaultLocationRequestedRef = useRef(false);
  const cancelDefaultGeoRef = useRef(false);

  const MapController = () => {
    const map = useMap();

    useEffect(() => {
      if (!mapRef.current) {
        mapRef.current = map;
        window.mapRef = mapRef;
        setIsMapReady(true);
      }
    }, [map]);

    return null;
  };

  useEffect(() => {
    if (geojsonLayers.length === 0 || !mapRef.current || !isMapReady) return;
    if (hasCenteredOnUser || isLocatingUser) return;

    const timeoutId = setTimeout(() => {
      let allBounds = null;

      geojsonLayers.forEach((geojson) => {
        const layer = L.geoJSON(geojson);
        const bounds = layer.getBounds();

        if (allBounds === null) {
          allBounds = bounds;
        } else {
          allBounds.extend(bounds);
        }
      });

      if (allBounds && allBounds.isValid()) {
        mapRef.current.fitBounds(allBounds, {
          padding: [50, 50],
          animate: true,
          duration: 0.5,
        });
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [geojsonLayers, isMapReady, hasCenteredOnUser, isLocatingUser]);

  useEffect(() => {
    if (initialMapCenter == null) return;

    if (
      typeof initialMapCenter.lat !== "number" ||
      typeof initialMapCenter.lng !== "number"
    ) {
      return;
    }

    cancelDefaultGeoRef.current = true;
    setMapCenter({ lat: initialMapCenter.lat, lng: initialMapCenter.lng });
    setHasCenteredOnUser(true);
    setIsLocatingUser(false);
  }, [initialMapCenter]);

  useEffect(() => {
    if (initialMapCenter != null) return;
    if (defaultLocationRequestedRef.current) return;

    if (!navigator.geolocation) {
      setIsLocatingUser(false);
      return;
    }

    defaultLocationRequestedRef.current = true;
    setIsLocatingUser(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (cancelDefaultGeoRef.current) return;

        const { latitude, longitude } = position.coords;

        setMapCenter({ lat: latitude, lng: longitude });
        setHasCenteredOnUser(true);
        setIsLocatingUser(false);
      },
      () => {
        if (cancelDefaultGeoRef.current) return;

        setIsLocatingUser(false);
        setHasCenteredOnUser(false);
      },
      GEO_OPTIONS,
    );
  }, [initialMapCenter]);

  useEffect(() => {
    if (!hasCenteredOnUser || !isMapReady || !mapRef.current) return;

    mapRef.current.flyTo([mapCenter.lat, mapCenter.lng], 18, {
      animate: true,
      duration: 0.75,
    });
  }, [hasCenteredOnUser, isMapReady, mapCenter.lat, mapCenter.lng]);

  useEffect(() => {
    if (isTabletView) {
      if (showUploadOverlay) {
        onToggleSidebar(false);
      } else {
        onToggleSidebar(true);
      }
    }
  }, [isTabletView, showUploadOverlay, onToggleSidebar]);

  useEffect(() => {
    return () => {
      if (drawPreviewRaf.current) {
        cancelAnimationFrame(drawPreviewRaf.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isAddingMarkers) setDrawPreview(null);
  }, [isAddingMarkers]);

  const CursorUpdater = ({ isAddingMarkers }) => {
    const map = useMap();

    useEffect(() => {
      map.getContainer().style.cursor = isAddingMarkers ? "crosshair" : "";
    }, [isAddingMarkers, map]);

    return null;
  };

  const clearAllMarkers = () => {
    setMarkers([]);
    setGeojsonLayers([]);
    setSelectedFiles([]);
  };

  const DrawingInteraction = () => {
    const map = useMap();

    useMapEvents({
      click: (e) => {
        if (!isAddingMarkers) return;

        const first = markers[0];

        if (first && markers.length >= 3) {
          const clickPt = map.latLngToContainerPoint(e.latlng);
          const firstPt = map.latLngToContainerPoint(
            L.latLng(first.lat, first.lng),
          );

          const pxDist = Math.hypot(
            clickPt.x - firstPt.x,
            clickPt.y - firstPt.y,
          );

          if (pxDist <= SNAP_CLOSE_FIRST_VERTEX_PX) {
            toggleAddMarkers();
            return;
          }
        }

        const { lat, lng } = e.latlng;

        setMarkers((currentMarkers) => [...currentMarkers, { lat, lng }]);
      },

      mousemove: (e) => {
        if (!isAddingMarkers) return;

        const lat = e.latlng.lat;
        const lng = e.latlng.lng;

        if (drawPreviewRaf.current) {
          cancelAnimationFrame(drawPreviewRaf.current);
        }

        drawPreviewRaf.current = requestAnimationFrame(() => {
          drawPreviewRaf.current = null;
          setDrawPreview({ lat, lng });
        });
      },

      mouseout: () => {
        if (isAddingMarkers) setDrawPreview(null);
      },
    });

    return null;
  };

  const removeLastMarker = () => {
    setMarkers((currentMarkers) => {
      if (currentMarkers.length === 0) {
        alert("No markers left to remove.");
        return currentMarkers;
      }

      return currentMarkers.slice(0, -1);
    });
  };

  const handleCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setIsLocatingUser(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        setMapCenter({ lat: latitude, lng: longitude });
        setHasCenteredOnUser(true);
        setIsLocatingUser(false);
        setSelectedIcon("current-location");

        mapRef.current?.flyTo([latitude, longitude], 18, {
          animate: true,
          duration: 1,
        });
      },
      () => {
        setIsLocatingUser(false);
        alert("Unable to fetch your location. Please allow location access.");
      },
      GEO_OPTIONS,
    );
  }, []);

  return (
    <>
      <div className="min-h-screen w-full flex flex-col items-center relative overflow-hidden">
        <div
          className={`w-full m-0 p-0 z-[1000] relative ${
            isTabletView ? "h-[40vh]" : "h-screen"
          }`}
        >
          <MapContainer
            center={[mapCenter.lat, mapCenter.lng]}
            zoom={17}
            zoomControl={true}
            className={`w-full m-0 p-0 relative 
              ${
                isTabletView
                  ? showUploadOverlay
                    ? "h-screen"
                    : "h-[40vh]"
                  : "h-screen"
              }
              pointer-events-auto z-0`}
            fadeAnimation={false}
            markerZoomAnimation={false}
          >
            <MapController />

            <TileLayer
              attribution="© Google Maps"
              url="http://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
              subdomains={["mt0", "mt1", "mt2", "mt3"]}
              maxZoom={50}
            />

            {markers.map((marker, idx) => (
              <CircleMarker
                key={idx}
                center={[marker.lat, marker.lng]}
                radius={5}
                pathOptions={{
                  color: "#ca8a04",
                  weight: 2,
                  fillColor: "#fef08a",
                  fillOpacity: 1,
                }}
              />
            ))}

            {isAddingMarkers && markers.length >= 2 && (
              <Polyline
                positions={markers.map((marker) => [marker.lat, marker.lng])}
                pathOptions={{
                  color: "#eab308",
                  weight: 2.5,
                  dashArray: "4, 6",
                  opacity: 0.95,
                }}
              />
            )}

            {!isAddingMarkers && markers.length >= 3 && (
              <Polygon
                positions={markers.map((marker) => [marker.lat, marker.lng])}
                pathOptions={{
                  color: "#eab308",
                  weight: 2.5,
                  dashArray: "4, 6",
                  fillColor: "#facc15",
                  fillOpacity: 0.15,
                }}
              />
            )}

            {!isAddingMarkers && markers.length === 2 && (
              <Polyline
                positions={markers.map((marker) => [marker.lat, marker.lng])}
                pathOptions={{
                  color: "#eab308",
                  weight: 2.5,
                  dashArray: "4, 6",
                  opacity: 0.95,
                }}
              />
            )}

            {isAddingMarkers && drawPreview && markers.length > 0 && (
              <Polyline
                positions={[
                  [
                    markers[markers.length - 1].lat,
                    markers[markers.length - 1].lng,
                  ],
                  [drawPreview.lat, drawPreview.lng],
                ]}
                pathOptions={{
                  color: "#fde047",
                  weight: 2,
                  dashArray: "6 5",
                  opacity: 0.95,
                }}
              />
            )}

            <DrawingInteraction />

            <GoogleSearchField
              setMapCenter={setMapCenter}
              setHasCenteredOnUser={setHasCenteredOnUser}
            />

            <CursorUpdater isAddingMarkers={isAddingMarkers} />

            {isTabletView && (
              <div className="absolute top-1/2 left-0 w-full h-1/2 z-[5000] bg-transparent pointer-events-none"></div>
            )}

            {geojsonLayers.map((geojson, idx) => (
              <GeoJSON
                key={idx}
                data={geojson}
                style={{
                  color: "yellow",
                  weight: 2,
                  opacity: 1,
                  fillOpacity: 0.1,
                }}
                pointToLayer={(feature, latlng) =>
                  L.circleMarker(latlng, {
                    radius: 4,
                    color: "yellow",
                    fillColor: "yellow",
                    fillOpacity: 1,
                  })
                }
              />
            ))}
          </MapContainer>

          {isLocatingUser && (
            <div className="absolute inset-0 z-[500] flex items-center justify-center pointer-events-none bg-black/10">
              <div className="rounded-lg bg-white/95 px-4 py-2 text-sm text-ember-sidebar shadow-md">
                Finding your location…
              </div>
            </div>
          )}

          <button
            onClick={() => {
              setShowUploadOverlay(true);
              if (isTabletView) {
                onToggleSidebar(false);
              }
            }}
            className={`
              absolute z-[2000] 
              bg-white text-ember-sidebar font-bold 
              rounded-full shadow-md transition
              ${
                isTabletView
                  ? "top-3 right-3 px-3 py-1.5 text-xs"
                  : "top-4 right-4 px-4 py-2 text-sm lg:text-base"
              }
            `}
          >
            Add Files +
          </button>

          {showUploadOverlay && (
            <FileUploadOverlay
              showUploadOverlay={showUploadOverlay}
              setShowUploadOverlay={setShowUploadOverlay}
              selectedFiles={selectedFiles}
              setSelectedFiles={setSelectedFiles}
              geojsonLayers={geojsonLayers}
              setGeojsonLayers={setGeojsonLayers}
              markers={markers}
              setMarkers={setMarkers}
              onToggleSidebar={onToggleSidebar}
              isTabletView={isTabletView}
            />
          )}

          <div
            className="absolute right-4 flex flex-col gap-4 z-[1000] justify-center"
            style={{
              top: "50%",
              transform: "translateY(-50%)",
              height: isTabletView ? "40vh" : "100vh",
            }}
          >
            <button
              onClick={() => {
                setSelectedIcon("back-button");
                removeLastMarker();
              }}
              className={`bg-[#075a53] text-white w-10 h-10 rounded-full flex items-center justify-center transition duration-400 ease-in-out cursor-pointer hover:bg-[#064841] ${
                selectedIcon === "back-button" ? "ring-2 ring-white" : ""
              }`}
            >
              <BackButtonIcon />
            </button>

            <button
              onClick={() => {
                clearAllMarkers();
                setSelectedIcon("remove");
              }}
              className={`bg-[#075a53] text-white w-10 h-10 rounded-full flex items-center justify-center transition duration-400 ease-in-out cursor-pointer hover:bg-[#064841] ${
                selectedIcon === "remove" ? "ring-2 ring-white" : ""
              }`}
            >
              <DeleteIcon />
            </button>

            <button
              onClick={handleCurrentLocation}
              className={`bg-[#075a53] text-white w-10 h-10 rounded-full flex items-center justify-center transition duration-300 hover:bg-[#064841] cursor-pointer ${
                selectedIcon === "current-location" ? "ring-2 ring-white" : ""
              }`}
            >
              <CurrentLocation />
            </button>
          </div>

          <div
            className={`z-[1100] w-full px-2 ${
              isTabletView
                ? "absolute bottom-0 left-0"
                : "absolute bottom-1 left-1/2 transform -translate-x-1/2"
            }`}
          >
            <div className="w-full text-center">
              <div className="flex justify-between items-center gap-4 p-2.5 bg-ember-surface rounded shadow-md w-full max-w-[900px] mx-auto">
                <div className="flex items-center gap-2 border-r border-gray-200 pr-2">
                  <button
                    aria-label="Calendar"
                    className="border-r border-gray-200 pr-2"
                  >
                    <Calender />
                  </button>

                  <button aria-label="Previous">
                    <LeftArrow />
                  </button>
                </div>

                <button
                  className="px-4 text-sm lg:text-base rounded bg-ember-surface text-white font-semibold whitespace-nowrap"
                  onClick={toggleAddMarkers}
                >
                  {isAddingMarkers ? "Stop Adding Markers" : "Add Field"}
                </button>

                <button
                  className="border-l border-gray-200 pl-2"
                  aria-label="Next"
                >
                  <RightArrow />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddFieldMap;