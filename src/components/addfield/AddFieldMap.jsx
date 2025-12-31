import React, { useState, useRef, useEffect } from "react";
import L from "leaflet";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polygon,
  GeoJSON,
  useMapEvents,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import {
  BackButtonIcon,
  CurrentLocation,
  DeleteIcon,
} from "../../assets/Icons";
import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch";
import { Calender, LeftArrow, RightArrow } from "../../assets/DashboardIcons";
import "leaflet-geosearch/dist/geosearch.css";
import LoadingSpinner from "../comman/loading/LoadingSpinner";
import FileUploadOverlay from "./FileUploadOverlay";
import { motion, AnimatePresence } from "framer-motion";

const AddFieldMap = ({
  setMarkers,
  markers,
  isTabletView = false,
  isAddingMarkers,
  toggleAddMarkers,
  clearMarkers,
  onToggleSidebar,
}) => {
  const [, setLocation] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState({});
  const [selectedIcon, setSelectedIcon] = useState("");
  const [loading, setLoading] = useState(true);

  const [showUploadOverlay, setShowUploadOverlay] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [geojsonLayers, setGeojsonLayers] = useState([]);

  // Enhanced location state management
  const [locationBlocked, setLocationBlocked] = useState(false);
  const [permissionState, setPermissionState] = useState("prompt"); // 'granted', 'denied', 'prompt'
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);

  const [, setIsFullMap] = useState(false);
  const mapRef = useRef(null);

  // Check permission state using Permissions API
  const checkPermissionState = async () => {
    if ("permissions" in navigator) {
      try {
        const result = await navigator.permissions.query({ name: "geolocation" });
        setPermissionState(result.state);

        // Listen for permission changes
        result.onchange = () => {
          setPermissionState(result.state);
          if (result.state === "granted") {
            requestLocation();
          }
        };

        return result.state;
      } catch (error) {
        console.log("Permissions API not fully supported");
        return "prompt";
      }
    }
    return "prompt";
  };

  // Request location function
  const requestLocation = () => {
    setIsRequestingPermission(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setSelectedLocation({
          lat: latitude,
          lng: longitude,
          name: "Your Location",
        });
        setLoading(false);
        setLocationBlocked(false);
        setPermissionState("granted");
        setIsRequestingPermission(false);

        // If map exists, pan to location
        if (mapRef.current) {
          mapRef.current.setView([latitude, longitude], 17);
        }
      },
      (err) => {
        console.error("Location error:", err);
        setIsRequestingPermission(false);

        if (err.code === 1) {
          // PERMISSION_DENIED
          setPermissionState("denied");
          setLocationBlocked(true);
          setLoading(false);
        } else if (err.code === 2) {
          // POSITION_UNAVAILABLE
          alert("Location information is unavailable. Please try again.");
          setLoading(false);
        } else if (err.code === 3) {
          // TIMEOUT
          alert("Location request timed out. Please try again.");
          setLoading(false);
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // Handle Enable Location button click
  const handleEnableLocation = async () => {
    const currentState = await checkPermissionState();

    if (currentState === "denied") {
      // Permission permanently denied - show instructions
      showBrowserSettingsInstructions();
    } else {
      // Permission can be requested (prompt state) or already granted
      requestLocation();
    }
  };

  // Show instructions based on browser
  const showBrowserSettingsInstructions = () => {
    const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
    const isFirefox = /Firefox/.test(navigator.userAgent);
    const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
    const isEdge = /Edg/.test(navigator.userAgent);

    let instructions = "";

    if (isChrome || isEdge) {
      instructions = `Location access is blocked. To enable:

1. Click the lock/info icon (🔒) in the address bar
2. Find "Location" in the permissions
3. Change it to "Allow"
4. Refresh the page

Or go to: chrome://settings/content/location`;
    } else if (isFirefox) {
      instructions = `Location access is blocked. To enable:

1. Click the lock icon (🔒) in the address bar
2. Click "Connection secure" or the permissions section
3. Clear the blocked permission for Location
4. Refresh the page`;
    } else if (isSafari) {
      instructions = `Location access is blocked. To enable:

1. Go to Safari → Settings → Websites → Location
2. Find this website and change to "Allow"
3. Refresh the page`;
    } else {
      instructions = `Location access is blocked. Please:

1. Check your browser's address bar for a location icon
2. Click it and allow location access
3. Or check your browser settings to enable location for this site
4. Refresh the page after enabling`;
    }

    alert(instructions);
  };

  // Open browser settings (works on some mobile browsers)
  const openAppSettings = () => {
    // This only works on some mobile browsers
    if ('permissions' in navigator && 'request' in navigator.permissions) {
      // Try to re-request permission
      requestLocation();
    } else {
      showBrowserSettingsInstructions();
    }
  };

  // Initial permission check and location request
  useEffect(() => {
    const initLocation = async () => {
      const state = await checkPermissionState();

      if (state === "granted") {
        requestLocation();
      } else if (state === "prompt") {
        requestLocation();
      } else {
        // denied
        setLocationBlocked(true);
        setLoading(false);
      }
    };

    initLocation();
  }, []);

  // Component to access and store map instance
  const MapController = () => {
    const map = useMap();
    useEffect(() => {
      mapRef.current = map;
      window.mapRef = mapRef;
    }, [map]);
    return null;
  };

  // ... rest of your existing code (useEffects, helper functions, etc.)

  // Center map when GeoJSON layers change
  useEffect(() => {
    if (geojsonLayers.length === 0 || !mapRef.current) return;

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
        duration: 1.5,
      });
    }
  }, [geojsonLayers]);

  // Handle sidebar visibility based on overlay state
  useEffect(() => {
    if (isTabletView) {
      if (showUploadOverlay) {
        onToggleSidebar(false);
      } else {
        onToggleSidebar(true);
      }
    }
  }, [isTabletView, showUploadOverlay, onToggleSidebar]);

  const [, setCity] = useState("");
  const [, setState] = useState("");

  const plusCursorBase64 =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAARVBMVEUAAAD///////////////////////////////////////////////////////////////////////////////////////////////////////8+tjvlAAAAHXRSTlMAAQIDBAUGBwgJCgsMDQ4PEBESExQVFhcYGRobHxxS/qf0AAAAqUlEQVQ4y8WSSQ7DIAxFH1oQUb7/f9ERnMbdKYvDoYc2V0F+5koZP+waXQzXcFqIjg4IDR4DofEZ4BLRZbkF6CYHhXkg2w2U5CEo0BNZ0vpslsrK5HAbJXyugEEYZPvboR1xyHcRpsZhYrEdd84l1AFLShTI6wqC1fZTigHkCgnAiRH9sK91cLRE0q3H1/gInV7axjjXcxE8xeJ3X/O4q5Y+JyxbcAAAAASUVORK5CYII=";

  const CursorUpdater = ({ isAddingMarkers }) => {
    const map = useMap();
    useEffect(() => {
      map.getContainer().style.cursor = isAddingMarkers
        ? `url("${plusCursorBase64}") 24 24, crosshair`
        : "";
    }, [isAddingMarkers, map]);
    return null;
  };

  const yellowMarkerIcon = new L.divIcon({
    className: "yellow-marker",
    html: `<div style="
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 20px;
      font-weight: bold;
      color: yellow;
      background-color: rgba(0, 0, 0, 0.4); 
      border-radius: 50%;
      width: 22px;
      height: 22px;
      border: 2px solid yellow;
      box-shadow: 0 0 4px rgba(0,0,0,0.2);
    "> + </div>`,
    iconSize: [25, 25],
    iconAnchor: [12, 12],
    shadowUrl: markerShadow,
    shadowSize: [41, 41],
  });

  const clearAllMarkers = () => {
    setMarkers([]);
    setGeojsonLayers([]);
    setSelectedFiles([]);
  };

  const Markers = () => {
    useMapEvents({
      click: (e) => {
        if (isAddingMarkers) {
          const { lat, lng } = e.latlng;
          setMarkers((currentMarkers) =>
            currentMarkers.length > 12
              ? [...currentMarkers.slice(1), { lat, lng }]
              : [...currentMarkers, { lat, lng }]
          );
        }
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

  const SearchField = ({ onLocationSelect }) => {
    const map = useMap();

    useEffect(() => {
      const provider = new OpenStreetMapProvider();

      const searchControl = new GeoSearchControl({
        provider,
        style: "bar",
        autoComplete: true,
        autoCompleteDelay: 250,
        resultFormat: ({ result }) => result.label,
      });

      map.addControl(searchControl);

      map.on("geosearch/showlocation", (result) => {
        const { x, y, label } = result.location;
        onLocationSelect({ lat: y, lng: x, name: label });
        map.setView([y, x], 18);
      });

      return () => {
        map.off("geosearch/showlocation");
        map.removeControl(searchControl);
      };
    }, [map, onLocationSelect]);

    return null;
  };

  return (
    <>
      {/* Enhanced Location Permission Modal */}
      <AnimatePresence>
        {locationBlocked && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[5000]"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="bg-white p-6 rounded-xl shadow-lg w-80 text-center"
            >
              {/* Icon */}
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>

              <h2 className="text-lg font-semibold text-gray-800">
                Location Permission Required
              </h2>

              <p className="text-gray-600 text-sm mt-2">
                {permissionState === "denied"
                  ? "Location access is blocked. Please enable it in your browser settings."
                  : "We need your location to show the map correctly."}
              </p>

              {/* Permission state indicator */}
              <div className="mt-3 flex items-center justify-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${permissionState === "denied"
                      ? "bg-red-500"
                      : permissionState === "granted"
                        ? "bg-green-500"
                        : "bg-yellow-500"
                    }`}
                />
                <span className="text-xs text-gray-500 capitalize">
                  {permissionState === "denied"
                    ? "Blocked"
                    : permissionState === "granted"
                      ? "Allowed"
                      : "Not Set"}
                </span>
              </div>

              {/* Main action button */}
              <button
                onClick={handleEnableLocation}
                disabled={isRequestingPermission}
                className="mt-4 w-full bg-[#075a53] text-white py-2.5 rounded-lg font-medium
                  hover:bg-[#064841] transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                  flex items-center justify-center gap-2"
              >
                {isRequestingPermission ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    <span>Requesting...</span>
                  </>
                ) : permissionState === "denied" ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span>How to Enable</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                    </svg>
                    <span>Enable Location</span>
                  </>
                )}
              </button>

              {/* Secondary action for denied state */}
              {permissionState === "denied" && (
                <button
                  onClick={() => {
                    // Try requesting again - might work if user changed settings
                    requestLocation();
                  }}
                  className="mt-2 w-full bg-gray-100 text-gray-700 py-2 rounded-lg font-medium
                    hover:bg-gray-200 transition-colors text-sm"
                >
                  Try Again
                </button>
              )}

              {/* Skip option - use default location */}
              <button
                onClick={() => {
                  // Use a default location (e.g., center of the country or a major city)
                  setSelectedLocation({
                    lat: 20.5937, // Example: India center
                    lng: 78.9629,
                    name: "Default Location",
                  });
                  setLocationBlocked(false);
                  setLoading(false);
                }}
                className="mt-3 text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Continue without location
              </button>

              {/* Help text for blocked state */}
              {permissionState === "denied" && (
                <div className="mt-4 p-3 bg-amber-50 rounded-lg text-left">
                  <p className="text-xs text-amber-800">
                    <strong>Tip:</strong> Look for a location or lock icon in your browser's address bar
                    and click it to change permissions.
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rest of your component JSX... */}
      <div className="min-h-screen w-full flex flex-col items-center relative overflow-hidden">
        {/* ... your existing map code ... */}
        <div
          className={`w-full m-0 p-0 z-[1000] relative ${isTabletView ? "h-[40vh]" : "h-screen"
            }`}
        >
          {loading && (
            <div className="absolute top-0 left-0 w-full h-full z-[999] bg-white bg-opacity-50 flex flex-col items-center justify-center">
              <LoadingSpinner height="100px" size={64} color="#86D72F" />
              <p className="text-gray-700 text-sm">
                Loading map, please wait...
              </p>
            </div>
          )}

          {selectedLocation?.lat && selectedLocation?.lng && (
            <>
              <MapContainer
                center={[selectedLocation.lat, selectedLocation.lng]}
                zoom={17}
                zoomControl={true}
                className={`w-full m-0 p-0 relative 
                  ${isTabletView ? (showUploadOverlay ? "h-screen" : "h-[40vh]") : "h-screen"} 
                  pointer-events-auto z-0`}
              >
                <MapController />
                <TileLayer
                  attribution="© Google Maps"
                  url="http://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
                  subdomains={["mt0", "mt1", "mt2", "mt3"]}
                  maxZoom={50}
                  eventHandlers={{
                    tileloadstart: () => setLoading(true),
                    tileload: () => setLoading(false),
                  }}
                />

                {markers.map((marker, idx) => (
                  <Marker
                    key={idx}
                    position={[marker.lat, marker.lng]}
                    icon={yellowMarkerIcon}
                  >
                    <Popup>
                      Marker at [{marker.lat.toFixed(4)},{" "}
                      {marker.lng.toFixed(4)}]
                    </Popup>
                  </Marker>
                ))}

                {markers.length > 0 && (
                  <Polygon
                    positions={markers.map((marker) => [
                      marker.lat,
                      marker.lng,
                    ])}
                    color="yellow"
                  />
                )}

                <Markers />
                <SearchField onLocationSelect={setSelectedLocation} />
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

              {/* Add Files Button */}
              <button
                onClick={() => {
                  setShowUploadOverlay(true);
                  if (isTabletView) {
                    setIsFullMap(true);
                    onToggleSidebar(false);
                  }
                }}
                className={`
                  absolute z-[2000] 
                  bg-white text-[#344E41] font-bold 
                  rounded-full shadow-md transition
                  ${isTabletView
                    ? "top-3 right-3 px-3 py-1.5 text-xs"
                    : "top-4 right-4 px-4 py-2 text-sm lg:text-base"
                  }
                `}
              >
                Add Files +
              </button>

              {/* File Upload Overlay */}
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

              {/* Right side buttons */}
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
                    if (markers.length === 0) {
                      alert("No markers left to remove.");
                    } else {
                      removeLastMarker();
                    }
                  }}
                  className={`bg-[#075a53] text-white w-10 h-10 rounded-full flex items-center justify-center transition duration-400 ease-in-out cursor-pointer hover:bg-[#064841] ${selectedIcon === "back-button" ? "ring-2 ring-white" : ""
                    }`}
                >
                  <BackButtonIcon />
                </button>

                <button
                  onClick={() => {
                    clearAllMarkers();
                    setSelectedIcon("remove");
                  }}
                  className={`bg-[#075a53] text-white w-10 h-10 rounded-full flex items-center justify-center transition duration-400 ease-in-out cursor-pointer hover:bg-[#064841] ${selectedIcon === "remove" ? "ring-2 ring-white" : ""
                    }`}
                >
                  <DeleteIcon />
                </button>

                <button
                  onClick={() => {
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition(
                        (position) => {
                          const { latitude, longitude } = position.coords;
                          setSelectedLocation({
                            lat: latitude,
                            lng: longitude,
                            name: "Your Current Location",
                          });
                          mapRef.current?.setView([latitude, longitude], 18);
                        },
                        () => alert("Unable to fetch your location."),
                        {
                          enableHighAccuracy: true,
                          timeout: 10000,
                          maximumAge: 0,
                        }
                      );
                    } else {
                      alert("Geolocation not supported.");
                    }
                    setSelectedIcon("current-location");
                  }}
                  className={`bg-[#075a53] text-white w-10 h-10 rounded-full flex items-center justify-center transition duration-300 hover:bg-[#064841] cursor-pointer ${selectedIcon === "current-location"
                      ? "ring-2 ring-white"
                      : ""
                    }`}
                >
                  <CurrentLocation />
                </button>
              </div>

              {/* Bottom controls */}
              <div
                className={`z-[1100] w-full px-2 ${isTabletView
                    ? "absolute bottom-0 left-0"
                    : "absolute bottom-1 left-1/2 transform -translate-x-1/2"
                  }`}
              >
                <div className="w-full text-center">
                  <div className="flex justify-between items-center gap-4 p-2.5 bg-[#5a7c6b] rounded shadow-md w-full max-w-[900px] mx-auto">
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
                      className="px-4 text-sm lg:text-base rounded bg-[#5a7c6b] text-white font-semibold whitespace-nowrap"
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
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default AddFieldMap;