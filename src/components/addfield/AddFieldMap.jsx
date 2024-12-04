import React, { useState, useEffect, useRef } from "react";
import L from "leaflet";
import { Layout, Button } from "antd";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polygon,
  useMapEvents,
  ZoomControl,
  LayersControl,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-control-geocoder/dist/Control.Geocoder.css";
import "leaflet-control-geocoder/dist/Control.Geocoder.js";
import * as ELG from "esri-leaflet-geocoder";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { Calender, LeftArrow, RightArrow } from "../../assets/DashboardIcons";
import { CiSearch } from "react-icons/ci";
import "./AddFieldMap.css";
import { CurrentLocation } from "../../assets/Icons";

const { Content } = Layout;
const { BaseLayer } = LayersControl;

const AddFieldMap = () => {
  // State to manage markers
  const [markers, setMarkers] = useState([]);
  const [isAddingMarkers, setIsAddingMarkers] = useState(false);
  const mapRef = useRef();

  // Custom Leaflet marker icon
  const customMarkerIcon = new L.Icon({
    iconUrl: markerIcon,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: markerShadow,
    shadowSize: [41, 41],
  });

  // Add markers on map click
  const Markers = () => {
    useMapEvents({
      click: (e) => {
        if (isAddingMarkers) {
          const { lat, lng } = e.latlng;
          setMarkers((currentMarkers) => {
            const newMarkers = [...currentMarkers, { lat, lng }];
            return newMarkers.length > 12 ? newMarkers.slice(-12) : newMarkers;
          });
        }
      },
    });
    return null;
  };

  // Initialize map with geosearch control
  useEffect(() => {
    if (!mapRef.current) return;

    const searchControl = new ELG.Geosearch({
      useMapBounds: false,
      expanded: true,
      placeholder: "Search for a location...",
    }).addTo(mapRef.current);

    searchControl.on("results", (data) => {
      if (data.results.length > 0) {
        const { latlng } = data.results[0];
        setMarkers((currentMarkers) => [...currentMarkers, latlng]);
        mapRef.current.setView(latlng, 10);
      }
    });
  }, []);

  // Toggle marker adding mode
  const toggleAddMarkers = () => setIsAddingMarkers((prev) => !prev);

  return (
    <Layout className="map-layout add-field">
      <Content className="map-content">
        {/* Search Bar */}
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search Location"
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                const query = e.target.value.trim();
                if (!query) {
                  alert("Please enter a valid location!");
                  return;
                }

                // Geocode query using Esri Leaflet Geocoder
                const geocoder = new ELG.GeocodeService({
                  apikey: "YOUR_API_KEY",
                });

                geocoder
                  .geocode()
                  .text(query)
                  .run((error, response) => {
                    if (error) {
                      console.error("Geocoding error:", error.message);
                      alert(
                        "An error occurred during the search. Please try again."
                      );
                      return;
                    }
                    if (
                      response &&
                      response.results &&
                      response.results.length > 0
                    ) {
                      const { latlng } = response.results[0];
                      setMarkers((currentMarkers) => [
                        ...currentMarkers,
                        latlng,
                      ]);
                      mapRef.current.setView(latlng, 12);
                    } else {
                      alert("No results found for the entered location.");
                    }
                  });
              }
            }}
          />
          <CiSearch className="field-search-icon" />
        </div>

        <MapContainer
          center={[20.5937, 78.9629]}
          zoom={5}
          zoomControl={false}
          className="map-container"
          whenCreated={(mapInstance) => {
            mapRef.current = mapInstance;
          }}
        >
          {/* Layers Control */}
          <LayersControl position="topright">
            <BaseLayer checked name="Satellite">
              <TileLayer
                attribution="© Google Satellite"
                url="http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
                subdomains={["mt0", "mt1", "mt2", "mt3"]}
                maxZoom={50}
              />
            </BaseLayer>
            <BaseLayer name="Road">
              <TileLayer
                attribution="© Google Road"
                url="http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                subdomains={["mt0", "mt1", "mt2", "mt3"]}
                maxZoom={20}
              />
            </BaseLayer>
          </LayersControl>

          {/* Markers */}
          {markers.map((marker, idx) => (
            <Marker
              key={idx}
              position={[marker.lat, marker.lng]}
              icon={customMarkerIcon}
            >
              <Popup>
                Marker at [{marker.lat.toFixed(4)}, {marker.lng.toFixed(4)}]
              </Popup>
            </Marker>
          ))}

          {/* Polygon connecting markers */}
          {markers.length > 0 && (
            <Polygon
              positions={markers.map((marker) => [marker.lat, marker.lng])}
              color="purple"
            />
          )}

          <Markers />
          <ZoomControl />
        </MapContainer>

        {/* Map Controls */}
        <div className="map-controls">
          <Button onClick={() => setMarkers([])} className="delete-markers-btn">
            Delete Markers
          </Button>
          <Button
            className="current-location-btn"
            onClick={() => {
              if (mapRef.current) {
                mapRef.current.locate({ setView: true, maxZoom: 16 });
              } else {
                alert("Map is not initialized yet. Please wait.");
              }
            }}
          >
            <CurrentLocation />
          </Button>
        </div>

        {/* Add Field Button Section */}
        <div className="add-field-button">
          <div className="d-flex justify-content-between mx-auto">
            <div className="add-field-left-arrow">
              <button>
                <Calender />
              </button>
              <button>
                <LeftArrow />
              </button>
            </div>
            <button onClick={toggleAddMarkers} className="add-field">
              Add Field
            </button>
            <button className="add-field-right-arrow">
              <RightArrow />
            </button>
          </div>
        </div>
      </Content>
    </Layout>
  );
};

export default AddFieldMap;
