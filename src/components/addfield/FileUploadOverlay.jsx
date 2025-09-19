// src/components/addfield/FileUploadOverlay.js

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as shp from "shpjs";
import * as toGeoJSON from "@tmcw/togeojson";
import { DOMParser } from "xmldom";
import { message } from "antd";
import L from "leaflet";

const FileUploadOverlay = ({
  showUploadOverlay,
  setShowUploadOverlay,
  selectedFiles,
  setSelectedFiles,
  geojsonLayers,
  setGeojsonLayers,
  markers,
  setMarkers,
  onToggleSidebar,
  isTabletView,
}) => {
  const [uploadError, setUploadError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
    setUploadError("");
    const parsedGeojsons = [];
    const allMarkers = [];
    let combinedBounds = null;

    for (const file of files) {
      const name = file.name.toLowerCase();
      try {
        let geojson = null;

        if (name.endsWith(".geojson") || name.endsWith(".json")) {
          const text = await file.text();
          geojson = JSON.parse(text);
        } else if (name.endsWith(".zip")) {
          const arrayBuffer = await file.arrayBuffer();
          geojson = await shp(arrayBuffer);
        } else if (name.endsWith(".kml")) {
          const text = await file.text();
          const parser = new DOMParser();
          const kmlDom = parser.parseFromString(text, "text/xml");
          geojson = toGeoJSON.kml(kmlDom);
        } else {
          setUploadError(`Unsupported file type: ${file.name}`);
          continue;
        }

        if (geojson) {
          parsedGeojsons.push(geojson);

          // Extract polygon coordinates and calculate bounds
          if (geojson.type === "FeatureCollection") {
            geojson.features.forEach((f) => {
              if (f.geometry.type === "Polygon") {
                const coords = f.geometry.coordinates[0].map(([lng, lat]) => ({
                  lat,
                  lng,
                }));
                allMarkers.push(...coords);

                // Update combined bounds
                const featureBounds = L.latLngBounds(coords.map(c => [c.lat, c.lng]));
                if (!combinedBounds) {
                  combinedBounds = featureBounds;
                } else {
                  combinedBounds.extend(featureBounds);
                }
              } else if (f.geometry.type === "MultiPolygon") {
                f.geometry.coordinates.forEach((poly) => {
                  const coords = poly[0].map(([lng, lat]) => ({ lat, lng }));
                  allMarkers.push(...coords);

                  // Update combined bounds
                  const featureBounds = L.latLngBounds(coords.map(c => [c.lat, c.lng]));
                  if (!combinedBounds) {
                    combinedBounds = featureBounds;
                  } else {
                    combinedBounds.extend(featureBounds);
                  }
                });
              }
            });
          }
        }
      } catch (err) {
        console.error("Failed to parse file:", file.name, err);
        setUploadError(`Failed to parse file: ${file.name}`);
        continue;
      }
    }

    setGeojsonLayers(parsedGeojsons);

    if (allMarkers.length > 0) {
      setMarkers(allMarkers);

      // Center map immediately after setting markers
      if (combinedBounds && combinedBounds.isValid() && window.mapRef?.current) {
        setTimeout(() => {
          window.mapRef.current.fitBounds(combinedBounds, {
            padding: [50, 50],
            animate: true,
            duration: 1.5,
          });
        }, 100);
      }
    }
  };

  const handleAddField = () => {
    if (selectedFiles.length === 0) {
      message.error("Please select at least one file to proceed.");
      return;
    }
    setShowUploadOverlay(false);
    message.success(`${selectedFiles.length} file(s) added. Polygons are displayed on the map.`);

    // Re-center map after closing overlay if needed
    if (geojsonLayers.length > 0 && window.mapRef?.current) {
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
        window.mapRef.current.fitBounds(allBounds, {
          padding: [50, 50],
          animate: true,
        });
      }
    }
  };

  const closeOverlay = () => {
    setShowUploadOverlay(false);
    if (isTabletView) {
      onToggleSidebar(true); // Show sidebar when closing on tablet
    }
  };


  return (
    <div className="absolute inset-0 z-[2000] flex flex-col items-center justify-center bg-black/70 p-4 sm:p-6 lg:p-8 pointer-events-auto">
      <div className="bg-[#344E41]/80 text-white rounded-lg shadow-2xl w-[90%] h-[80%] p-6 sm:p-8 relative flex flex-col items-center">
        {/* Close button */}
        <button
          onClick={closeOverlay}
          className="absolute top-3 right-3 text-white hover:text-gray-200 font-bold text-lg"
        >
          ✕
        </button>

        {/* Heading */}
        <h2 className="text-[clamp(20px,5vw,42px)] font-extrabold text-center mb-2 bg-gradient-to-r from-[#5A7C6B] to-[#E1FFF0] bg-clip-text text-transparent">
          Add Your Farm Boundary
        </h2>

        {/* Subheading */}
        <p className="text-white/90 text-sm font-bold sm:text-base mb-6 text-center">
          Define Your farm's boundaries to get started with CropGen.
        </p>

        {/* Error message */}
        {uploadError && (
          <p className="text-red-400 text-xs sm:text-sm mb-3 text-center">
            {uploadError}
          </p>
        )}

        {/* --- UPLOAD / LOADER / SUCCESS SECTION --- */}
        <div className="w-full flex flex-col items-center">
          {!uploading && !uploadSuccess && (
            <>
              {/* Upload area */}
              <label className="flex flex-col items-center justify-center w-full h-44 sm:h-52 lg:h-56 border-2 border-dashed border-white/40 rounded-lg cursor-pointer bg-white/10 hover:bg-white/20 transition p-4">
                <svg
                  className="w-10 h-10 mb-4 text-white/80"
                  fill="none"
                  viewBox="0 0 20 16"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                  />
                </svg>
                <p className="text-base font-semibold mb-1">
                  Drag and drop Your File here
                </p>
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={async (e) => {
                    setUploading(true);
                    await handleFileChange(e);
                    setTimeout(() => {
                      setUploading(false);
                      setUploadSuccess(true);
                    }, 2000); // 2 sec loader
                  }}
                />
                <span className="text-sm mt-2 px-3 py-1 bg-white text-[#344E41] rounded-md font-semibold cursor-pointer">
                  Browse File
                </span>
              </label>

              {/* File types */}
              <p className="text-xs sm:text-sm text-white/70 mt-4">
                Supported file types: .zip shapefile, KML, GeoJSON, GPX
              </p>

              {/* OR Divider */}
              <div className="flex items-center my-4 w-full">
                <div className="flex-1 h-px bg-white/30" />
                <span className="px-3 text-sm text-white/70">OR</span>
                <div className="flex-1 h-px bg-white/30" />
              </div>
            </>
          )}

          {uploading && (
            <div className="flex flex-col items-center justify-center mt-6 h-44 sm:h-52 lg:h-56">
              <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mb-2"></div>
              <p className="text-white/80">Processing file...</p>
            </div>
          )}

          {uploadSuccess && (
            <div className="flex flex-col items-center justify-center mt-6 h-44 sm:h-52 lg:h-56">
              <div className="text-green-400 mb-2 animate-bounce">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-12 h-12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-white font-semibold text-center mb-2">
                Your field has been marked on the map!
              </p>
              <button
                onClick={() => {
                  setShowUploadOverlay(false);
                  if (isTabletView) {
                    onToggleSidebar(true);
                  }
                }}
                className="bg-green-500 hover:bg-green-600 text-white py-2 px-6 rounded-lg font-semibold transition"
              >
                Enter Details
              </button>
            </div>
          )}
        </div>

        {uploading && (
          <div className="flex items-center my-4 w-full">
            <div className="flex-1 h-px bg-white/30" />
            <span className="px-3 text-sm text-white/70">OR</span>
            <div className="flex-1 h-px bg-white/30" />
          </div>
        )}

        {uploadSuccess && (
          <div className="flex items-center my-4 w-full">
            <div className="flex-1 h-px bg-white/30" />
            <span className="px-3 text-sm text-white/70">OR</span>
            <div className="flex-1 h-px bg-white/30" />
          </div>
        )}

        {/* Draw manually button */}
        <button
          onClick={() => {
            setShowUploadOverlay(false);
            if (isTabletView) {
              onToggleSidebar(true);
            }
          }}
          className="w-full bg-white text-[#344E41] py-2 sm:py-3 rounded-lg hover:bg-gray-100 transition text-sm sm:text-base font-semibold flex items-center justify-center gap-2 mt-4"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 20h9" />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19.5l-4 1 1-4L16.5 3.5z"
            />
          </svg>
          Draw Manually
        </button>
      </div>
    </div>
  );
};

export default FileUploadOverlay;