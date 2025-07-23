import React, { useState } from "react";
import SoilReportSidebar from "../components/soilreport/soilreportsidebar/SoilReportSidebar";
import "../style/Soilreport.css";
import { set } from "idb-keyval";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useSelector } from "react-redux";
import Report from "../components/soilreport/soilreportsidebar/Report";
import CropHealthCard from "../components/dashboard/crophealth/CropHealthCard";
import SoilHealthChart from "../components/dashboard/crophealth/SoilHealthChart";
import SoilAnalysisChart from "../components/dashboard/crophealth/SoilAnalysisChart";
import Reccomendations from "../components/soilreport/soilreportsidebar/Reccomendations";
import WaterIndex from "../components/dashboard/satellite-index/water-index/WaterIndex";
import Soilwaterindex from "../components/soilreport/soilreportsidebar/Soilwaterindex";
import IndexDates from "../components/dashboard/mapview/indexdates/IndexDates";
import IndexSelector from "../components/soilreport/soilreportsidebar/IndexSelector";


const SoilReport = () => {
  const [selectedOperation, setSelectedOperation] = useState(null);
    const [reportdata, setReportData] = useState(null);

        console.log(reportdata)
  return (
   <div className="soil-report container-fluid m-0 p-0 d-flex h-screen  ">
      <div className="">
        <SoilReportSidebar
          selectedOperation={selectedOperation}
          setSelectedOperation={setSelectedOperation}
          setReportData={setReportData}
        />
      </div>
      <div className="w-100 p-4  overflow-y-auto"> 
       
        {reportdata && reportdata.lat && reportdata.lng && (
          <>
            <MapContainer
              center={[reportdata.lat, reportdata.lng]}
              zoom={15}
              style={{ height: "400px", width: "100%" }}
            >
              <TileLayer
                attribution="©️ Google Maps"
                url="http://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
                subdomains={["mt0", "mt1", "mt2", "mt3"]}
                maxZoom={50}
              />
              <Marker position={[reportdata.lat, reportdata.lng]}>
                <Popup>
                  {reportdata.field}
                </Popup>
              </Marker>
                   
            </MapContainer>
                <IndexSelector/>
              {reportdata && (
          <div className="mt-4">
            <Report data={reportdata} />
          </div>
        )}
            <div className="mt-4   rounded-lg shadow-md flex justify-between gap-4">    
                  <Soilwaterindex selectedFieldsDetials={[selectedOperation]} />
            </div>

            <div className="mt-4">
              <Reccomendations />
   
            </div>
         
          </>
        )}
      </div>
    </div>

  );
};


export default SoilReport;
