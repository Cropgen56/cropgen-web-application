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
import { getCityState } from "../../utility/getUserLocation";
import { Calender, LeftArrow, RightArrow } from "../../assets/DashboardIcons";
import { getCurrentLocation } from "../../utility/getCurrentLocation";
import "leaflet-geosearch/dist/geosearch.css";
import LoadingSpinner from "../comman/loading/LoadingSpinner";
import FileUploadOverlay from "./FileUploadOverlay";
import { motion } from "framer-motion";

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
  const [locationBlocked, setLocationBlocked] = useState(false);

  const [, setIsFullMap] = useState(false);
  const mapRef = useRef(null);

  // Component to access and store map instance
  const MapController = () => {
    const map = useMap();
    useEffect(() => {
      mapRef.current = map;
      window.mapRef = mapRef;
    }, [map]);
    return null;
  };

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

  useEffect(() => {
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
      },
      (err) => {
        setLocationBlocked(true);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

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

    return (
      <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-4/5 max-w-[400px] z-[2000]">
        {/* Placeholder for search UI injected by leaflet-geosearch */}
      </div>
    );
  };

  return (
    <>
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
            <h2 className="text-lg font-semibold">
              Location Permission Needed
            </h2>
            <p className="text-gray-600 text-sm mt-2">
              Please enable location access to load the map correctly.
            </p>

            <button
              onClick={() => {
                setLocationBlocked(false);
                setLoading(true);

                navigator.geolocation.getCurrentPosition(
                  (pos) => {
                    const { latitude, longitude } = pos.coords;
                    setSelectedLocation({ lat: latitude, lng: longitude });
                    setLoading(false);
                    setLocationBlocked(false);

                    setTimeout(() => {
                      window.location.reload();
                    }, 300);
                  },
                  () => {
                    setLocationBlocked(true);
                    setLoading(false);
                  },
                  { enableHighAccuracy: true, timeout: 8000 }
                );
              }}
              className="mt-4 w-full bg-[#075a53] text-white py-2 rounded-lg"
            >
              Enable Location
            </button>
          </motion.div>
        </motion.div>
      )}
      <div className="min-h-screen w-full flex flex-col items-center relative overflow-hidden">
        <div
          className={`w-full m-0 p-0 z-[1000] relative ${
            isTabletView ? "h-[40vh]" : "h-screen"
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

    ${
      isTabletView
        ? "top-3 right-3 px-3 py-1.5 text-xs"
        : "top-4 right-4 px-4 py-2 text-sm lg:text-base"
    } // Desktop mode → normal size
  `}
              >
                Add Files +
              </button>

              {/* Render the extracted overlay */}
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
                  className={`bg-[#075a53] text-white w-10 h-10 rounded-full flex items-center justify-center transition duration-300 hover:bg-[#064841] cursor-pointer ${
                    selectedIcon === "current-location"
                      ? "ring-2 ring-white"
                      : ""
                  }`}
                >
                  <CurrentLocation />
                </button>
              </div>

              {/* Bottom controls */}
              <div
                className={`z-[1100] w-full px-2 ${
                  isTabletView
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
      </div>{" "}
    </>
  );
};

export default AddFieldMap;
