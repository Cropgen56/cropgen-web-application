import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polygon,
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
import { useLocation } from "react-router-dom";
import "leaflet-geosearch/dist/geosearch.css";
import { Calender, LeftArrow, RightArrow } from "../../assets/DashboardIcons";
import { getCurrentLocation } from "../../utility/getCurrentLocation";
// import "./AddFieldMap.css";
import LoadingSpinner from "../comman/loading/LoadingSpinner";

const AddFieldMap = ({ setMarkers, markers }) => {
  const data = useLocation();
  const [isAddingMarkers, setIsAddingMarkers] = useState(false);
  const [location, setLocation] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState({});
  const navigate = useNavigate();
  const [selectedIcon, setSelectedIcon] = useState("");
  const [loading, setLoading] = useState(true);
  const mapRef = useRef(null);

  // Fetch the weather data
  const [city, setCity] = useState("");
  const [state, setState] = useState("");

  useEffect(() => {
    getCurrentLocation({
      setLocation: (loc) => {
        setLocation(loc);
        if (loc?.latitude && loc?.longitude) {
          // Update selectedLocation when location is fetched
          setSelectedLocation({
            lat: loc.latitude,
            lng: loc.longitude,
            name: "Your Current Location",
          });

          getCityState({
            lat: loc.latitude,
            lng: loc.longitude,
            setCity,
            setState,
          });
        }
      },
    });
  }, []);

  const yellowMarkerIcon = new L.divIcon({
    className: "yellow-marker",
    // html: '<div style="background-color: yellow; border-radius: 50%; width: 15px; height: 15px; border: 1px solid #ffcc00; "></div>',
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

  const clearMarkers = () => setMarkers([]);

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

  // remove the last marks
  const removeLastMarker = () => {
    setMarkers((currentMarkers) => {
      if (currentMarkers.length === 0) {
        alert("No markers left to remove.");
        return currentMarkers;
      }
      return currentMarkers.slice(0, -1);
    });
  };

  // get the currenct location
  const CurrentLocationButton = ({ onLocationFound }) => {
    const map = useMap();

    const handleCurrentLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            onLocationFound({
              lat: latitude,
              lng: longitude,
              name: "Your Current Location",
            });
            map.setView([latitude, longitude], 18);
          },
          () => alert("Unable to fetch your location."),
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      } else {
        alert("Geolocation not supported.");
      }
    };

    // return (
    //     <button
    //     className={`absolute top-[60vh] right-2 z-[5000] p-2 bg-[#075a53] text-white w-10 h-10 rounded-full flex items-center justify-center transition duration-400 ease-in-out pointer-events-auto cursor-pointer hover:bg-[#064841] ${selectedIcon == "current-location" ? "selected-icon" : ""} `}
    //     onClick={() => {
    //     handleCurrentLocation();
    //     setSelectedIcon("current-location");
    //     }} >
    //     <CurrentLocation />
    // </button>
    // );
  };

  // search the location
  const SearchField = ({ onLocationSelect }) => {
    const map = useMap();

    useEffect(() => {
      const provider = new OpenStreetMapProvider({
        params: {
          countrycodes: "in",
          viewbox: "67.0,6.0,99.0,37.0",
        },
      });

      const searchControl = new GeoSearchControl({
        provider,
        style: "bar",
        showMarker: true,
        retainZoomLevel: false,
        autoComplete: true,
        autoCompleteDelay: 250,
        classNames: {
          container: "bg-white rounded shadow-md",
          form: "w-full",
          input:
            " w-full p-2 border-b border-gray-300 text-sm text-black bg-white",
          results:
            "z-[2000] bg-white border border-gray-300 rounded max-h-[200px] overflow-y-auto w-full",
          result:
            "p-2 cursor-pointer text-gray-800 text-sm hover:bg-gray-100 hover:text-black transition ease-in-out duration-400",
        },
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
        {/* Search control is added by leaflet-geosearch */}
      </div>
    );
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center relative overflow-hidden">
      <div className="h-screen w-full m-0 p-0 z-[1000] relative">
        {loading && (
          <div className="absolute top-0 left-0 w-full h-full z-[999] bg-white bg-opacity-50 flex flex-col items-center justify-center">
            <LoadingSpinner height="100px" size={64} color="#86D72F" />
            <p className="text-gray-700 text-sm">Loading map, please wait...</p>
          </div>
        )}

        {selectedLocation?.lat && selectedLocation?.lng ? (
          <>
            <MapContainer
              center={[selectedLocation.lat, selectedLocation.lng]}
              zoom={17}
              zoomControl={true}
              className="h-screen w-full m-0 p-0 relative z-[1000]"
              whenCreated={(mapInstance) => {
                mapRef.current = mapInstance;
              }}
            >
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
                    Marker at [{marker.lat.toFixed(4)}, {marker.lng.toFixed(4)}]
                  </Popup>
                </Marker>
              ))}

              {markers.length > 0 && (
                <Polygon
                  positions={markers.map((marker) => [marker.lat, marker.lng])}
                  color="yellow"
                />
              )}

              <Markers />
              <CurrentLocationButton onLocationFound={setSelectedLocation} />

              <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-4/5 max-w-[400px] z-[2000]">
                {" "}
                <SearchField onLocationSelect={setSelectedLocation} />
              </div>
            </MapContainer>{" "}
            <div className="absolute top-0 right-2 h-screen flex flex-col justify-center gap-4 z-[1000] ">
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
                  selectedIcon == "back-button" ? "ring-2 ring-white" : ""
                }`}
              >
                <BackButtonIcon />
              </button>

              <button
                onClick={() => {
                  clearMarkers();
                  setSelectedIcon("remove");
                }}
                className={`bg-[#075a53] text-white w-10 h-10 rounded-full flex items-center justify-center transition duration-400 ease-in-out cursor-pointer hover:bg-[#064841] ${
                  selectedIcon == "remove" ? "selected-icon" : ""
                }`}
              >
                <DeleteIcon />
              </button>

              <button
                onClick={() => {
                  console.log("Location button clicked");
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                      (position) => {
                        const { latitude, longitude } = position.coords;
                        console.log(
                          "Got current location:",
                          latitude,
                          longitude
                        );

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
                  selectedIcon === "current-location" ? "ring-2 ring-white" : ""
                }`}
              >
                <CurrentLocation />
              </button>
            </div>
            {/* Add Field Button Section */}
            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 z-[1100] w-[95%] md:max-w-[500px] lg:max-w-[900px]  bg-[#5a7c6b] rounded shadow-md mx-auto">
              <div className="w-full text-center z-[1000]">
                <div className="flex justify-between items-center gap-4 p-2.5 bg-[#5a7c6b] rounded w-full">
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
                    onClick={() => setIsAddingMarkers(!isAddingMarkers)}
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
        ) : null}
      </div>
    </div>
  );
};

export default AddFieldMap;
