import React, { useState, useRef } from "react";
import SoilReportSidebar from "../components/soilreport/soilreportsidebar/SoilReportSidebar";
import "../style/Soilreport.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import Report from "../components/soilreport/soilreportsidebar/Report";
import Reccomendations from "../components/soilreport/soilreportsidebar/Reccomendations";
import Soilwaterindex from "../components/soilreport/soilreportsidebar/Soilwaterindex";
import SOCreport from "../components/soilreport/soilreportsidebar/SOCreport";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const SoilReport = () => {
  const [selectedOperation, setSelectedOperation] = useState(null);
  const [reportdata, setReportData] = useState(null);
  const [isdownloading, setIsDownloading] = useState(false);

  const reportRef = useRef();
  const restRef = useRef();

  const downloadPDF = async () => {
    const input1 = reportRef.current;
    const input2 = restRef.current;

    setIsDownloading(true);

    input1.classList.add("pdf-style");
    input2.classList.add("pdf-style");

    await new Promise((res) => setTimeout(res, 300));

    const pdf = new jsPDF("p", "mm", "a4");
    const width = pdf.internal.pageSize.getWidth();
    const height = pdf.internal.pageSize.getHeight();

    const capturePage = async (element, pageNumber) => {
  const canvas = await html2canvas(element, { scale: 2, useCORS: true });
  const imgData = canvas.toDataURL("image/png");

  const imgHeight = (canvas.height * width) / canvas.width;
  const scaledHeight = height * 0.95;; // force fit A4

  pdf.addImage(imgData, "PNG", 0, 0, width, scaledHeight);
  pdf.setTextColor(100);
  pdf.setFontSize(10);
  pdf.text(`Page ${pageNumber}`, width - 20, height - 10);
};

    await capturePage(input1, 1);
    pdf.addPage();
    await capturePage(input2, 2);

    pdf.save("soil-report.pdf");

    input1.classList.remove("pdf-style");
    input2.classList.remove("pdf-style");
    setIsDownloading(false);
  };

  return (
    <div className="soil-report container-fluid m-0 p-0 d-flex h-screen">
      <div>
        <SoilReportSidebar
          selectedOperation={selectedOperation}
          setSelectedOperation={setSelectedOperation}
          setReportData={setReportData}
          downloadPDF={downloadPDF}
        />
      </div>

      <div className="w-100 p-4 h-screen overflow-y-auto">
        {reportdata?.lat && reportdata?.lng && (
          <>
            {/* Map UI only */}
            <MapContainer
              center={[reportdata.lat, reportdata.lng]}
              zoom={15}
              style={{ height: "400px", width: "100%" }}
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

            {/* Page 1 */}
            <div ref={reportRef} className={`${isdownloading ? "bg-white text-black p-4" : ""}`}>
              <div className="mt-4">
                <Report data={reportdata} isdownloading={isdownloading} />
              </div>
            </div>

            {/* Page 2 */}
            <div ref={restRef} className={`${isdownloading ? "bg-white text-black p-4" : ""}`}>
              <div className="mt-4">
                <SOCreport isdownloading={isdownloading} />
              </div>

              <div className="mt-4 rounded-lg shadow-md flex justify-between gap-4 mt-10">
                <Soilwaterindex isdownloading={isdownloading} selectedFieldsDetials={[selectedOperation]} />
              </div>

              <div className="mt-4">
                <Reccomendations isdownloading={isdownloading} />
              </div>

              <div className={`mt-5 p-4 rounded-lg shadow-md ${isdownloading ? "text-black" : "text-green-100"}`}>
                <p className="text-xs">
                  * This is a satellite-based generated soil report, not a physical or lab-tested report.
                  The results are indicative and may not represent exact ground conditions. Please use it for advisory purposes only.
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SoilReport;
