import React, { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Polygon,
  ImageOverlay,
  useMap,
} from "react-leaflet";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchIndexData,
  fetchIndexDataForMap,
  removeSelectedIndexData,
} from "../../../redux/slices/satelliteSlice";

const MoveMapToField = ({ lat, lng, bounds }) => {
  const map = useMap();
  useEffect(() => {
    if (bounds) map.fitBounds(bounds, { padding: [40, 40], maxZoom: 17 });
    else if (lat != null && lng != null) map.setView([lat, lng], 17);
  }, [lat, lng, bounds, map]);
  return null;
};

// Close polygon
const closePolygon = (coords) => {
  if (!coords.length) return [];
  const first = coords[0];
  const last = coords[coords.length - 1];
  return first[0] !== last[0] || first[1] !== last[1]
    ? [...coords, first]
    : coords;
};

// Centroid
const calculateCentroid = (coords) => {
  if (!coords.length) return { lat: null, lng: null };
  let x = 0,
    y = 0;
  coords.forEach(([lng, lat]) => {
    x += lat;
    y += lng;
  });
  return { lat: x / coords.length, lng: y / coords.length };
};

// Bounds
const calculateBounds = (coords) => {
  if (!coords.length) return null;
  const lats = coords.map(([lng, lat]) => lat);
  const lngs = coords.map(([lng, lat]) => lng);
  return [
    [Math.min(...lats), Math.min(...lngs)],
    [Math.max(...lats), Math.max(...lngs)],
  ];
};

const FarmReportMap = ({ selectedFieldsDetials }) => {
  const dispatch = useDispatch();
  const { indexData } = useSelector((state) => state.satellite);
  const [showLegend, setShowLegend] = useState({
    NDVI: false,
    NDMI: false,
    NDRE: false,
    TRUE_COLOR: false,
  });

  const field = selectedFieldsDetials?.[0];

  const polygonCoordinates = useMemo(() => {
    if (!field?.field || field.field.length < 3) return [];
    let coords = field.field.map(({ lat, lng }) => [lng, lat]);
    return closePolygon(coords);
  }, [field]);

  const centroid = useMemo(
    () => calculateCentroid(polygonCoordinates),
    [polygonCoordinates]
  );
  const polygonBounds = useMemo(
    () => calculateBounds(polygonCoordinates),
    [polygonCoordinates]
  );

  const indexes = ["NDVI", "NDMI", "NDRE", "TRUE_COLOR"];
  const titles = {
    NDVI: "Crop Health",
    NDMI: "Water in Crop",
    NDRE: "Crop Stress / Maturity",
    TRUE_COLOR: "True Color Image",
  };

  // Fetch data for all indexes
  useEffect(() => {
    if (!polygonCoordinates.length) return;
    const today = new Date().toISOString().split("T")[0];

    // Clear previous index data
    dispatch(removeSelectedIndexData());

    indexes.forEach((index) => {
      dispatch(
        fetchIndexData({
          endDate: today,
          geometry: [polygonCoordinates],
          index,
        })
      );
    });
  }, [polygonCoordinates, dispatch]);

  console.log("selectedFieldsDetials", selectedFieldsDetials);
  console.log("polygonCoordinates", polygonCoordinates);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full p-2">
      {indexes.map((indexName, i) => {
        const layer = indexData?.[indexName];
        const imageUrl = layer?.image_base64
          ? `data:image/png;base64,${layer.image_base64}`
          : null;

        return (
          <div
            key={i}
            className="relative w-full h-[280px] rounded-xl overflow-hidden shadow-md bg-white"
          >
            <div className="absolute top-2 right-2 z-[5000] legend-dropdown-wrapper">
              <strong
                onClick={() =>
                  setShowLegend((prev) => ({
                    ...prev,
                    [indexName]: !prev[indexName],
                  }))
                }
                className="flex items-center whitespace-nowrap bg-[#344e41] outline-none border border-[#344e41] rounded z-[3000] text-white px-3 py-1.5 font-normal cursor-pointer"
              >
                🗺️ Legend
              </strong>

              {showLegend[indexName] && indexData?.[indexName]?.legend && (
                <div className="absolute top-10 right-0 bg-[#344e41] text-white rounded-lg shadow-lg max-w-[300px] max-h-[270px] overflow-y-auto z-[4000] animate-slideIn no-scrollbar">
                  <ul className="divide-y divide-white/10 list-none p-2 no-scrollbar">
                    {indexData[indexName].legend.map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center gap-3 p-1.5 cursor-pointer hover:bg-[#5a7c6b] transition-colors duration-200 rounded"
                      >
                        <span
                          className="w-[25px] h-[15px] rounded border border-black/10"
                          style={{ backgroundColor: item.color }}
                        ></span>

                        <span className="flex-1 text-sm whitespace-nowrap font-medium">
                          {item.label}
                        </span>

                        <span className="text-gray-200 text-xs font-normal whitespace-nowrap">
                          {item.hectares?.toFixed(2)} ha (
                          {item.percent?.toFixed(2)}%)
                        </span>
                      </div>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <MapContainer
              center={
                centroid.lat != null
                  ? [centroid.lat, centroid.lng]
                  : [20.135245, 77.156935]
              }
              zoom={16}
              scrollWheelZoom={false}
              style={{ height: "100%", width: "100%" }}
              maxZoom={20}
            >
              <TileLayer
                attribution="© Google Maps"
                url="http://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
                subdomains={["mt0", "mt1", "mt2", "mt3"]}
                maxZoom={20}
                crossOrigin={true}
                referrerpolicy="no-referrer"
              />
              {polygonCoordinates.length > 0 && (
                <>
                  <Polygon
                    positions={polygonCoordinates.map(([lng, lat]) => [
                      lat,
                      lng,
                    ])}
                    pathOptions={{
                      fillColor: "#e9ecef",
                      fillOpacity: 1,
                      color: "transparent",
                      weight: 0,
                    }}
                  />
                  <Polygon
                    positions={polygonCoordinates.map(([lng, lat]) => [
                      lat,
                      lng,
                    ])}
                    pathOptions={{
                      fillColor: "transparent",
                      fillOpacity: 0,
                      color: "green",
                      weight: 4,
                    }}
                  />
                  {/* {imageUrl && polygonBounds && <ImageOverlay url={imageUrl} bounds={polygonBounds} opacity={1} zIndex={400} />} */}
                  {imageUrl && polygonBounds?.length === 2 && (
                    <ImageOverlay
                      url={imageUrl}
                      bounds={polygonBounds}
                      opacity={1}
                      zIndex={400}
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
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 z-[3000] bg-[#344E41] w-[200px] h-[40px] text-white text-base font-semibold p-2 text-center rounded-md shadow-md">
              {titles[indexName]}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FarmReportMap;
