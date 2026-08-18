import React, { useRef, useState } from "react";
import shp from "shpjs";
import { kml as kmlToGeoJSON, gpx as gpxToGeoJSON } from "@tmcw/togeojson";
import { message } from "antd";
import L from "leaflet";

const ACCEPTED_EXTENSIONS = [".zip", ".kml", ".kmz", ".geojson", ".json", ".gpx"];

const FileUploadOverlay = ({
  setShowUploadOverlay,
  setSelectedFiles,
  setGeojsonLayers,
  setMarkers,
  onToggleSidebar,
  isTabletView,
}) => {
  const [uploadError, setUploadError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const getShpLib = () => {
    if (typeof shp === "function") return shp;
    if (shp && typeof shp.default === "function") return shp.default;
    if (shp && typeof shp.parseZip === "function") return shp.parseZip;
    return null;
  };

  const toLatLngs = (ring) =>
    (ring || [])
      .filter((c) => Array.isArray(c) && c.length >= 2)
      .map(([lng, lat]) => ({ lat: Number(lat), lng: Number(lng) }))
      .filter((c) => Number.isFinite(c.lat) && Number.isFinite(c.lng));

  const addRing = (coords, allMarkersRef, combinedBoundsRef) => {
    if (!coords || coords.length < 3) return;
    allMarkersRef.push(...coords);
    const featureBounds = L.latLngBounds(coords.map((c) => [c.lat, c.lng]));
    if (!featureBounds.isValid()) return;
    if (!combinedBoundsRef.current) combinedBoundsRef.current = featureBounds;
    else combinedBoundsRef.current.extend(featureBounds);
  };

  const extractFromGeometry = (geometry, allMarkersRef, combinedBoundsRef) => {
    if (!geometry) return;
    const gType = geometry.type;

    if (gType === "Polygon") {
      addRing(toLatLngs(geometry.coordinates?.[0]), allMarkersRef, combinedBoundsRef);
    } else if (gType === "MultiPolygon") {
      geometry.coordinates?.forEach((poly) => {
        addRing(toLatLngs(poly?.[0]), allMarkersRef, combinedBoundsRef);
      });
    } else if (gType === "LineString") {
      addRing(toLatLngs(geometry.coordinates), allMarkersRef, combinedBoundsRef);
    } else if (gType === "MultiLineString") {
      geometry.coordinates?.forEach((line) => {
        addRing(toLatLngs(line), allMarkersRef, combinedBoundsRef);
      });
    } else if (gType === "GeometryCollection") {
      geometry.geometries?.forEach((g) =>
        extractFromGeometry(g, allMarkersRef, combinedBoundsRef),
      );
    }
  };

  const extractPolygonsAndBounds = (geojson, allMarkersRef, combinedBoundsRef) => {
    if (!geojson) return;
    if (geojson.type === "FeatureCollection" && Array.isArray(geojson.features)) {
      geojson.features.forEach((f) =>
        extractPolygonsAndBounds(f, allMarkersRef, combinedBoundsRef),
      );
      return;
    }
    if (geojson.type === "Feature") {
      extractFromGeometry(geojson.geometry, allMarkersRef, combinedBoundsRef);
      return;
    }
    extractFromGeometry(geojson, allMarkersRef, combinedBoundsRef);
  };

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

  const parseXmlToDom = (text) => {
    const parser = new window.DOMParser();
    const doc = parser.parseFromString(text, "text/xml");
    const parseError = doc.querySelector("parsererror");
    if (parseError) {
      throw new Error(parseError.textContent || "Invalid XML");
    }
    return doc;
  };

  const processFiles = async (files) => {
    setUploadError("");
    setSelectedFiles(files);

    if (!files.length) {
      setUploadError("No files selected.");
      return false;
    }

    const parsedGeojsons = [];
    const allMarkers = [];
    const combinedBoundsRef = { current: null };
    const errors = [];

    for (const file of files) {
      const name = (file.name || "").toLowerCase();
      try {
        if (name.endsWith(".geojson") || name.endsWith(".json")) {
          const text = await file.text();
          const geojsonFromFile = JSON.parse(text);
          parsedGeojsons.push(geojsonFromFile);
          extractPolygonsAndBounds(geojsonFromFile, allMarkers, combinedBoundsRef);
        } else if (name.endsWith(".zip")) {
          const shpLib = getShpLib();
          if (!shpLib) {
            errors.push("Shapefile parser is not available. Try GeoJSON or KML instead.");
            continue;
          }
          try {
            const arrayBuffer = await file.arrayBuffer();
            const raw = await shpLib(arrayBuffer);
            const geojsonList = normalizeShpResult(raw);
            if (geojsonList.length === 0) {
              errors.push(
                `Couldn't parse geometry from "${file.name}". Zip must contain .shp + .dbf + .shx (and optionally .prj/.cpg).`,
              );
              continue;
            }
            geojsonList.forEach((g) => {
              parsedGeojsons.push(g);
              extractPolygonsAndBounds(g, allMarkers, combinedBoundsRef);
            });
          } catch (zipErr) {
            console.error("Error parsing zipped shapefile:", file.name, zipErr);
            errors.push(`Failed to parse zipped shapefile: ${file.name}`);
          }
        } else if (name.endsWith(".kml")) {
          const text = await file.text();
          const geojsonFromFile = kmlToGeoJSON(parseXmlToDom(text));
          parsedGeojsons.push(geojsonFromFile);
          extractPolygonsAndBounds(geojsonFromFile, allMarkers, combinedBoundsRef);
        } else if (name.endsWith(".gpx")) {
          const text = await file.text();
          const geojsonFromFile = gpxToGeoJSON(parseXmlToDom(text));
          parsedGeojsons.push(geojsonFromFile);
          extractPolygonsAndBounds(geojsonFromFile, allMarkers, combinedBoundsRef);
        } else if (name.endsWith(".kmz") || name.endsWith(".shp")) {
          errors.push(
            `"${file.name}" must be uploaded as a .zip (shapefile) or exported as KML/GeoJSON.`,
          );
        } else {
          errors.push(`Unsupported file type: ${file.name}`);
        }
      } catch (err) {
        console.error("Failed to parse file:", file.name, err);
        errors.push(`Failed to parse file: ${file.name}`);
      }
    }

    if (errors.length) {
      setUploadError(errors[0]);
    }

    if (!parsedGeojsons.length || allMarkers.length < 3) {
      if (!errors.length) {
        setUploadError(
          "No farm boundary found in the file. Use a polygon in GeoJSON, KML, GPX, or a zipped shapefile.",
        );
      }
      return false;
    }

    setGeojsonLayers(parsedGeojsons);
    setMarkers(allMarkers);
    return true;
  };

  const runUpload = async (fileList) => {
    const files = Array.from(fileList || []);
    setUploading(true);
    setUploadError("");
    setUploadSuccess(false);
    try {
      const ok = await processFiles(files);
      setUploadSuccess(Boolean(ok));
      if (!ok) {
        message.error("Failed to read the boundary file. Check the error message.");
      }
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const closeOverlay = () => {
    setShowUploadOverlay(false);
    if (isTabletView) {
      onToggleSidebar(true);
    }
  };

  const onDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const onDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const onDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer?.files || []);
    if (!files.length) return;
    await runUpload(files);
  };

  return (
    <div
      className="absolute inset-0 z-[2000] flex items-center justify-center bg-black/70 p-4 sm:p-6 lg:p-8 overflow-auto pointer-events-auto h-screen"
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
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
            <p className="text-red-400 text-xs sm:text-sm mb-2 text-center">
              {uploadError}
            </p>
          )}
        </div>

        <div className="flex-1 overflow-y-auto w-full space-y-4">
          <div className="w-full flex flex-col items-center">
            {!uploading && !uploadSuccess && (
              <>
                <label
                  className={`flex flex-col items-center justify-center w-full h-44 sm:h-52 lg:h-56 border-2 border-dashed rounded-lg cursor-pointer transition p-4 ${
                    isDragging
                      ? "border-white bg-white/25"
                      : "border-white/40 bg-white/10 hover:bg-white/20"
                  }`}
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onDrop={onDrop}
                >
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
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept={ACCEPTED_EXTENSIONS.join(",")}
                    className="hidden"
                    onChange={async (e) => {
                      await runUpload(e.target.files);
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
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-12 h-12"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <p className="text-white font-semibold text-center mb-2">
                  Your field has been marked on the map!
                </p>
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
    </div>
  );
};

export default FileUploadOverlay;
