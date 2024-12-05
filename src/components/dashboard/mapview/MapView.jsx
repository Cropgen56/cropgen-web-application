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
import { CurrentLocation } from "../../../assets/Icons";
import "leaflet/dist/leaflet.css";
import "leaflet-control-geocoder/dist/Control.Geocoder.css";
import "leaflet-control-geocoder/dist/Control.Geocoder.js";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import * as ELG from "esri-leaflet-geocoder";
import { CiSearch } from "react-icons/ci";
import "./MapView.css";
import NDVISelector from "./ndviselector/NdviSelector";

const { Content } = Layout;
const { BaseLayer } = LayersControl;

const MapData = () => {
  const [markers, setMarkers] = useState([]);
  const [isAddingMarkers, setIsAddingMarkers] = useState(false);
  const mapRef = useRef(null);

  const defaultFieldCoordinates = [
    [20.136105449905884, 77.15584727246397],
    [20.137283993813227, 77.1562120770173],
    [20.13656377359276, 77.15825069069757],
    [20.13566223451258, 77.1574781634082],
  ];

  const customMarkerIcon = new L.Icon({
    iconUrl: markerIcon,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: markerShadow,
    shadowSize: [41, 41],
  });

  const customLayerIcon = new L.Icon({
    iconUrl: "path_to_custom_layer_icon.png",
    iconSize: [5, 5],
    iconAnchor: [12, 12],
    popupAnchor: [1, -12],
  });

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

    // Customize the layer control icons once the map is created
    const mapInstance = mapRef.current;

    mapInstance.whenReady(() => {
      const layersControl =
        mapInstance._controlCorners["topright"]._map._layersControl;
      if (layersControl) {
        // Customizing the BaseLayer icons
        const baseLayerControl = layersControl._getContainer();
        const baseLayerIcons = baseLayerControl.querySelectorAll(
          ".leaflet-control-layers-base"
        );
        baseLayerIcons.forEach((layerIcon) => {
          layerIcon.style.backgroundImage = `url(${customLayerIcon.options.iconUrl})`; // Set custom icon for layer switch
        });
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
          center={[20.1360471, 77.157196]}
          zoom={17}
          zoomControl={false}
          style={{
            height: "90vh",
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

          {/* Default Field Polygon */}
          <Polygon
            positions={defaultFieldCoordinates}
            pathOptions={{
              color: "#EBF7AB",
              weight: 1,
              opacity: 0.7,
              fillColor: "#EBF7AB",
              fillOpacity: 0.7,
            }}
          />

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

        {/* NDVI */}
        <NDVISelector />
      </Content>
    </Layout>
  );
};

export default MapData;
