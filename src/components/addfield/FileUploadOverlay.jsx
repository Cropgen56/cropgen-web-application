// src/components/addfield/FileUploadOverlay.js
import React, { useState } from "react";
import shp from "shpjs";
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

  const normalizeShpResult = (result) => {
    const out = [];
    if (!result) return out;
    if (result.type === "FeatureCollection" && Array.isArray(result.features)) {
      out.push(result);
      return out;
    }
    if (Array.isArray(result) && result.length && result[0].type === "Feature") {
      out.push({ type: "FeatureCollection", features: result });
      return out;
    }
    if (typeof result === "object") {
      for (const key of Object.keys(result)) {
        const val = result[key];
        if (!val) continue;
        if (val.type === "FeatureCollection" && Array.isArray(val.features)) {
          out.push(val);
        } else if (Array.isArray(val) && val.length && val[0].type === "Feature") {
          out.push({ type: "FeatureCollection", features: val });
        } else if (val && Array.isArray(val.features)) {
          out.push(val);
        }
      }
    }
    return out;
  };

  const extractPolygonsAndBounds = (geojson, allMarkersRef, combinedBoundsRef) => {
    if (!geojson) return;
    if (geojson.type === "FeatureCollection" && Array.isArray(geojson.features)) {
      geojson.features.forEach((f) => {
        if (!f.geometry) return;
        const gType = f.geometry.type;
        if (gType === "Polygon") {
          const coords = f.geometry.coordinates[0].map(([lng, lat]) => ({ lat, lng }));
          allMarkersRef.push(...coords);
          const featureBounds = L.latLngBounds(coords.map((c) => [c.lat, c.lng]));
          if (!combinedBoundsRef.current) combinedBoundsRef.current = featureBounds;
          else combinedBoundsRef.current.extend(featureBounds);
        } else if (gType === "MultiPolygon") {
          f.geometry.coordinates.forEach((poly) => {
            const coords = poly[0].map(([lng, lat]) => ({ lat, lng }));
            allMarkersRef.push(...coords);
            const featureBounds = L.latLngBounds(coords.map((c) => [c.lat, c.lng]));
            if (!combinedBoundsRef.current) combinedBoundsRef.current = featureBounds;
            else combinedBoundsRef.current.extend(featureBounds);
          });
        }
      });
    }
  };

  // Returns boolean success
  const handleFileChange = async (e) => {
    setUploadError("");
    const files = Array.from(e?.target?.files || []);
    setSelectedFiles(files);

    if (!files.length) {
      setUploadError("No files selected.");
      return false;
    }

    const parsedGeojsons = [];
    const allMarkers = [];
    const combinedBoundsRef = { current: null };

    const shpLib = typeof shp === "function" ? shp : shp && shp.default ? shp.default : null;
    if (!shpLib) {
      console.error("shpjs not available or import failed", shp);
      setUploadError("Internal error: shapefile parser not loaded.");
      return false;
    }

    for (const file of files) {
      const name = (file.name || "").toLowerCase();
      try {
        let geojsonFromFile = null;

        if (name.endsWith(".geojson") || name.endsWith(".json")) {
          const text = await file.text();
          geojsonFromFile = JSON.parse(text);
          parsedGeojsons.push(geojsonFromFile);
          extractPolygonsAndBounds(geojsonFromFile, allMarkers, combinedBoundsRef);
        } else if (name.endsWith(".zip")) {
          try {
            const arrayBuffer = await file.arrayBuffer();
            const raw = await shpLib(arrayBuffer);
            const geojsonList = normalizeShpResult(raw);
            if (geojsonList.length === 0) {
              console.warn("shpjs returned unexpected structure for zip:", raw);
              setUploadError(
                `Couldn't parse geometry from zipped shapefile "${file.name}". Make sure the zip contains .shp + .dbf + .shx (and optionally .prj/.cpg).`
              );
              continue;
            }
            geojsonList.forEach((g) => {
              parsedGeojsons.push(g);
              extractPolygonsAndBounds(g, allMarkers, combinedBoundsRef);
            });
          } catch (zipErr) {
            console.error("Error parsing zipped shapefile:", file.name, zipErr);
            setUploadError(`Failed to parse zipped shapefile: ${file.name}`);
            continue;
          }
        } else if (name.endsWith(".kml")) {
          const text = await file.text();
          const parser = new DOMParser();
          const kmlDom = parser.parseFromString(text, "text/xml");
          geojsonFromFile = toGeoJSON.kml(kmlDom);
          parsedGeojsons.push(geojsonFromFile);
          extractPolygonsAndBounds(geojsonFromFile, allMarkers, combinedBoundsRef);
        } else if (name.endsWith(".gpx")) {
          const text = await file.text();
          const parser = new DOMParser();
          const gpxDom = parser.parseFromString(text, "text/xml");
          geojsonFromFile = toGeoJSON.gpx(gpxDom);
          parsedGeojsons.push(geojsonFromFile);
          extractPolygonsAndBounds(geojsonFromFile, allMarkers, combinedBoundsRef);
        } else {
          setUploadError(`Unsupported file type: ${file.name}`);
          continue;
        }
      } catch (err) {
        console.error("Failed to parse file:", file.name, err);
        setUploadError(`Failed to parse file: ${file.name}`);
        continue;
      }
    }

    // Save parsed layers (no direct fitBounds here; AddFieldMap handles centering)
    // Save parsed layers
    setGeojsonLayers(parsedGeojsons);

    if (allMarkers.length > 0) {
      setMarkers(allMarkers);

      // Fit map to bounds
      if (window.mapRef?.current) {
        const bounds = L.latLngBounds(allMarkers.map((c) => [c.lat, c.lng]));
        if (bounds.isValid()) {
          setTimeout(() => {
            window.mapRef.current.fitBounds(bounds, { padding: [50, 50], animate: true, duration: 1.5 });
          }, 100);
        }
      }
    }

    return parsedGeojsons.length > 0;
  };


  const handleAddField = () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      message.error("Please select at least one file to proceed.");
      return;
    }
    setShowUploadOverlay(false);
    message.success(`${selectedFiles.length} file(s) added. Polygons are displayed on the map.`);

    // Do NOT call fitBounds here — AddFieldMap effect will center once.
  };

  const closeOverlay = () => {
    setShowUploadOverlay(false);
    if (isTabletView) {
      onToggleSidebar(true); // Show sidebar when closing on tablet
    }
  };

  return (
    <div className="absolute inset-0 z-[2000] flex items-center justify-center bg-black/70 p-4 sm:p-6 lg:p-8 overflow-auto pointer-events-auto h-screen">
      <div className="bg-[#344E41] text-white rounded-lg shadow-2xl p-6 sm:p-8 relative flex flex-col min-h-0 max-h-[90vh] w-[90%] max-w-3xl">
        <button
          onClick={closeOverlay}
          className="absolute top-3 right-3 text-white hover:text-gray-200 font-bold text-lg z-10"
          aria-label="Close upload modal"
        >
          ✕
        </button>

        <div className="mb-4">
          <h2 className="text-[clamp(20px,5vw,32px)] font-extrabold text-center mb-2 ">
            Add Your{" "}
            <span className="bg-gradient-to-r from-[#5A7C6B] to-[#E1FFF0] bg-clip-text text-transparent">
              Farm
            </span>{" "}
            Boundary
          </h2>
          <p className="text-white/90 text-sm font-bold sm:text-base mb-2 text-center">
            Define Your farm's boundaries to get started with CropGen.
          </p>
          {uploadError && (
            <p className="text-red-400 text-xs sm:text-sm mb-2 text-center">{uploadError}</p>
          )}
        </div>

        <div className="flex-1 overflow-y-auto w-full space-y-4">
          <div className="w-full flex flex-col items-center">
            {!uploading && !uploadSuccess && (
              <>
                <label className="flex flex-col items-center justify-center w-full h-44 sm:h-52 lg:h-56 border-2 border-dashed border-white/40 rounded-lg cursor-pointer bg-white/10 hover:bg-white/20 transition p-4">
                  <svg className="w-10 h-10 mb-4 text-white/80" fill="none" viewBox="0 0 20 16" xmlns="http://www.w3.org/2000/svg">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                  </svg>
                  <p className="text-base font-semibold mb-1">Drag and drop Your File here</p>

                  <input
                    type="file"
                    multiple
                    accept=".zip,.kml,.geojson,.json,.gpx"
                    className="hidden"
                    onChange={async (e) => {
                      setUploading(true);
                      setUploadError("");
                      const ok = await handleFileChange(e);
                      setUploading(false);
                      setUploadSuccess(Boolean(ok));
                      if (!ok) {
                        message.error("Failed to parse files. Check console / error message.");
                      }
                    }}
                  />

                  <span className="text-sm mt-2 px-3 py-1 bg-white text-[#344E41] rounded-md font-semibold cursor-pointer">
                    Browse File
                  </span>
                </label>

                <p className="text-xs sm:text-sm text-white/70 mt-4">
                  Supported file types: .zip shapefile, KML, GeoJSON, GPX
                </p>

                <div className="flex items-center my-4 w-full">
                  <div className="flex-1 h-px bg-white/30" />
                  <span className="px-3 text-sm text-white/70">OR</span>
                  <div className="flex-1 h-px bg-white/30" />
                </div>
              </>
            )}

            {uploading && (
              <div className="flex flex-col items-center justify-center mt-6 h-44 sm:h-52 lg:h-56">
                <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mb-2" />
                <p className="text-white/80">Processing file...</p>
              </div>
            )}

            {uploadSuccess && (
              <div className="flex flex-col items-center justify-center mt-6 h-44 sm:h-52 lg:h-56">
                <div className="text-green-400 mb-2 animate-bounce">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-white font-semibold text-center mb-2">Your field has been marked on the map!</p>
                <button
                  onClick={() => {
                    setShowUploadOverlay(false);
                    if (isTabletView) onToggleSidebar(true);
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
        </div>

        <div className="flex-shrink-0 mt-4 w-full">
          <button
            onClick={() => {
              setShowUploadOverlay(false);
              if (isTabletView) onToggleSidebar(true);
            }}
            className="w-full bg-white text-[#344E41] py-2 sm:py-3 rounded-lg hover:bg-gray-100 transition text-sm sm:text-base font-semibold flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 20h9" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19.5l-4 1 1-4L16.5 3.5z" />
            </svg>
            Draw Manually
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileUploadOverlay;