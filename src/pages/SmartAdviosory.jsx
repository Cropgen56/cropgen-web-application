import React, { useState, useEffect } from "react";
import SmartAdvisorySidebar from "../components/smartadvisory/smartadvisorysidebar/SmartAdvisorySidebar";
import { useDispatch, useSelector } from "react-redux";
import { getFarmFields } from "../redux/slices/farmSlice";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import img1 from "../assets/image/Group 31.png"

import SatelliteIndexScroll from "../components/smartadvisory/smartadvisorysidebar/SatelliteIndexScroll";
import NDVIChartCard from "../components/smartadvisory/smartadvisorysidebar/Ndvigrapgh";
import IrrigationStatusCard from "../components/smartadvisory/smartadvisorysidebar/IrrigationStatusCard";
import CropAdvisoryCard from "../components/smartadvisory/smartadvisorysidebar/CropAdvisoryCard";
import WeatherCard from "../components/smartadvisory/smartadvisorysidebar/WeatherCard";
import PestDiseaseCard from "../components/smartadvisory/smartadvisorysidebar/PestDiseaseCard";
import FarmAdvisoryCard from "../components/smartadvisory/smartadvisorysidebar/Farmadvisory";
import Fertigation from "../components/smartadvisory/smartadvisorysidebar/Fertigation";
import Soiltemp from "../components/smartadvisory/smartadvisorysidebar/Soiltemp";
import useIsTablet from "../components/smartadvisory/smartadvisorysidebar/Istablet";

const SmartAdvisory = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state?.auth?.user);
  const fields = useSelector((state) => state?.farmfield?.fields);
  const [reportdata, setReportData] = useState(null);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const isTablet = useIsTablet();

  const userId = user?.id;

  useEffect(() => {
    if (userId) {
      dispatch(getFarmFields(userId));
    }
  }, [dispatch, userId]);

  return (
    <div className="flex h-screen overflow-hidden bg-[#5a7c6b] text-white">
      {/* Sidebar */}
      {isSidebarVisible && (
        <div className="min-w-[280px] h-full border-r border-gray-700 bg-white text-black">
          <SmartAdvisorySidebar
            setReportData={setReportData}
            setIsSidebarVisible={setIsSidebarVisible}
          />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 p-4 h-screen overflow-y-auto relative">
        {/* Show Sidebar Button */}
        {!isSidebarVisible && (
          <div className="mb-4">
            <button
              className="bg-[#344e41] text-white px-4 py-2 rounded-md text-sm shadow"
              onClick={() => {
                setIsSidebarVisible(true);
                setReportData(null);
              }}
            >
              Select Another Farm
            </button>
          </div>
        )}

        {/* Advisory or Placeholder View */}
        {reportdata ? (
          isTablet ? (
            // ===== Tablet Layout =====
            <div className="flex flex-col gap-4 w-full max-w-[1024px] mx-auto">
              {/* Map */}
              <div className="w-full h-[300px] rounded-lg overflow-hidden shadow relative">
                <MapContainer
                  center={[reportdata.lat, reportdata.lng]}
                  zoom={15}
                  className="w-full h-full z-0"
                >
                  <TileLayer
                    attribution="©️ Google Maps"
                    url="http://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
                    subdomains={["mt0", "mt1", "mt2", "mt3"]}
                  />
                  <Marker position={[reportdata.lat, reportdata.lng]}>
                    <Popup>{reportdata.field}</Popup>
                  </Marker>
                </MapContainer>
                <div className="absolute bottom-1 left-2 right-2 z-[1000]">
                  <SatelliteIndexScroll />
                </div>
              </div>

              <NDVIChartCard />

              {/* Cards */}
              <div className="grid grid-cols-2 gap-4 w-full">
                <div className="bg-[#4b6b5b] rounded-lg p-2 overflow-hidden">
                  <IrrigationStatusCard />
                </div>
                <div className="bg-[#4b6b5b] rounded-lg p-2 overflow-hidden">
                  <CropAdvisoryCard />
                </div>
                <div className="col-span-2 bg-[#4b6b5b] rounded-lg p-2 overflow-hidden">
                  <WeatherCard />
                </div>
                <div className="col-span-2 bg-[#4b6b5b] rounded-lg p-2 overflow-hidden">
                  <PestDiseaseCard />
                </div>
                <div className="col-span-2 bg-[#4b6b5b] rounded-lg p-2 overflow-x-auto">
                  <Fertigation />
                </div>
                <div className="col-span-2 bg-[#4b6b5b] rounded-lg p-2 overflow-x-auto">
                  <Soiltemp />
                </div>
              </div>

              <div className="w-full bg-[#4b6b5b] rounded-lg p-2 overflow-hidden">
                <FarmAdvisoryCard />
              </div>
            </div>
          ) : (
            // ===== Desktop Layout =====
            <div className="flex flex-col gap-4 w-full">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex flex-col lg:w-[65%]">
                  <div className="w-full h-[300px] rounded-lg overflow-hidden shadow relative">
                    <MapContainer
                      center={[reportdata.lat, reportdata.lng]}
                      zoom={15}
                      className="w-full h-full z-0"
                    >
                      <TileLayer
                        attribution="©️ Google Maps"
                        url="http://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
                        subdomains={["mt0", "mt1", "mt2", "mt3"]}
                      />
                      <Marker position={[reportdata.lat, reportdata.lng]}>
                        <Popup>{reportdata.field}</Popup>
                      </Marker>
                    </MapContainer>
                    <div className="absolute bottom-1 left-2 right-2 z-[1000]">
                      <SatelliteIndexScroll />
                    </div>
                  </div>

                  <NDVIChartCard />
                </div>

                <div className="lg:w-[35%]">
                  <IrrigationStatusCard />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                <CropAdvisoryCard />
                <WeatherCard />
                <PestDiseaseCard />
              </div>

              <div className="flex flex-row gap-4 w-full">
                <div className="w-[32%] overflow-x-auto">
                  <Fertigation />
                </div>
                <div className="w-[65%] overflow-x-auto">
                  <Soiltemp />
                </div>
              </div>

              <div className="w-full">
                <FarmAdvisoryCard />
              </div>
            </div>
          )
        ) : (
          // ===== Placeholder if no field selected =====
          <div className="flex items-center justify-center h-full w-full">
            <div className="flex flex-col items-center text-center opacity-60">
              {/* You can replace this with your own logo or SVG */}
              <img src={img1} alt="" />
              <p className="text-2xl font-semibold">
                Select Field For Generate Smart Advisory
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartAdvisory;
