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
import "./AddFieldMap.css";

const AddFieldMap = ({ setMarkers, markers }) => {
  const data = useLocation();
  const [isAddingMarkers, setIsAddingMarkers] = useState(false);
  const [location, setLocation] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState({});
  const navigate = useNavigate();
  const [selectedIcon, setSelectedIcon] = useState("");

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
    html: '<div style="background-color: yellow; border-radius: 50%; width: 15px; height: 15px; border: 1px solid #ffcc00; "></div>',
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

    return (
      <button
        style={{
          position: "absolute",
          top: "60vh",
          right: 10,
          // left: 5,
          zIndex: 1000,
          padding: "8px 8px",
          backgroundColor: "#075a53",
          color: "#fff",
          border: "none",
          borderRadius: "50px",
          cursor: "pointer",
        }}
        className={selectedIcon == "current-location" ? "selected-icon" : ""}
        onClick={() => {
          handleCurrentLocation();
          setSelectedIcon("current-location");
        }}
      >
        <CurrentLocation />
      </button>
    );
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
          container: "custom-geosearch-container",
          form: "custom-geosearch-form",
          input: "custom-geosearch-input",
          results: "custom-geosearch-results",
          result: "custom-geosearch-result",
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
      <div className="search-field-container">
        {/* Search control is added by leaflet-geosearch */}
      </div>
    );
  };
  return (
    <div className="add-field-map-layout">
      <div className="add-field-main-container">
        {selectedLocation?.lat && selectedLocation?.lng ? (
          <>
            <MapContainer
              center={[selectedLocation.lat, selectedLocation.lng]}
              zoom={17}
              zoomControl={true}
              className="map-container"
            >
              <TileLayer
                attribution="© Google Maps"
                url="http://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
                subdomains={["mt0", "mt1", "mt2", "mt3"]}
                maxZoom={50}
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
              <div className="search-field-container">
                {" "}
                <SearchField onLocationSelect={setSelectedLocation} />
              </div>
            </MapContainer>{" "}
            <div className="map-controls">
              <button
                onClick={() => {
                  setSelectedIcon("back-button");
                  if (markers.length === 0) {
                    alert("No markers left to remove.");
                  } else {
                    removeLastMarker();
                  }
                }}
                className={selectedIcon == "back-button" ? "selected-icon" : ""}
              >
                <BackButtonIcon />
              </button>
              <button
                onClick={() => {
                  clearMarkers();
                  setSelectedIcon("remove");
                }}
                className={selectedIcon == "remove" ? "selected-icon" : ""}
              >
                <DeleteIcon />
              </button>
            </div>
            {/* Add Field Button Section */}
            <div className="add-field-button">
              <div className="button-container">
                <div className="add-field-left-arrow">
                  <button>
                    <Calender />
                  </button>
                  <button>
                    <LeftArrow />
                  </button>
                </div>
                <button
                  className="add-field"
                  onClick={() => setIsAddingMarkers(!isAddingMarkers)}
                >
                  {isAddingMarkers ? "Stop Adding Markers" : "Add Field"}
                </button>
                <button className="add-field-right-arrow">
                  <RightArrow />
                </button>
              </div>
            </div>
          </>
        ) : (
          false
        )}
      </div>
    </div>
  );
};

export default AddFieldMap;
