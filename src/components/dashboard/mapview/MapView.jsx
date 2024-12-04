import L from "leaflet";
import React, { useState, useEffect, useRef } from "react";
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
import {
  Calender,
  LeftArrow,
  RightArrow,
} from "../../../assets/DashboardIcons";
import { CurrentLocation } from "../../../assets/Icons";
import "leaflet/dist/leaflet.css";
import "leaflet-control-geocoder/dist/Control.Geocoder.css";
import "leaflet-control-geocoder/dist/Control.Geocoder.js";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import * as ELG from "esri-leaflet-geocoder";
import { CiSearch } from "react-icons/ci";
import "./MapView.css";

const { Content } = Layout;
const { BaseLayer } = LayersControl;

const MapData = () => {
  const [markers, setMarkers] = useState([]);
  const [isAddingMarkers, setIsAddingMarkers] = useState(false);
  const mapRef = useRef(null);

  const customMarkerIcon = new L.Icon({
    iconUrl: markerIcon,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: markerShadow,
    shadowSize: [41, 41],
  });

  // Component for handling map clicks to add markers
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

  // Initialize geocoder search control
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
        mapRef.current.setView(latlng, 12);
      }
    });
  }, []);

  const toggleAddMarkers = () => {
    setIsAddingMarkers((prev) => !prev);
  };

  return (
    <Layout className="map-layout-dashboard">
      <Content style={{ height: "100%", position: "relative" }}>
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
          className="dashboard-map"
          center={[20.5937, 78.9629]}
          zoom={6}
          zoomControl={false}
          style={{
            height: "80vh",
            width: "100%",
            margin: "auto",
            borderRadius: "1rem",
          }}
          whenCreated={(mapInstance) => {
            mapRef.current = mapInstance;
          }}
        >
          <LayersControl position="topright">
            <BaseLayer checked name="Satellite">
              <TileLayer
                attribution="© Google Satellite"
                url="http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
                subdomains={["mt0", "mt1", "mt2", "mt3"]}
                maxZoom={20}
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

          {/* Render Markers */}
          {markers.map((marker, idx) => (
            <Marker
              key={idx}
              position={[marker.lat, marker.lng]}
              icon={customMarkerIcon}
            >
              <Popup>
                Marker Location: [{marker.lat.toFixed(4)},{" "}
                {marker.lng.toFixed(4)}]
              </Popup>
            </Marker>
          ))}

          {/* Render Polygon if more than two markers */}
          {markers.length > 2 && (
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
          {/* <Button onClick={() => setMarkers([])} className="delete-markers-btn">
            Delete Markers
          </Button> */}
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

export default MapData;
