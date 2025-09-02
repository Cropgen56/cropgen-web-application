import React, { useState, useRef } from "react";
import SoilReportSidebar from "../components/soilreport/soilreportsidebar/SoilReportSidebar";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import Report from "../components/soilreport/soilreportsidebar/Report";
import Reccomendations from "../components/soilreport/soilreportsidebar/Reccomendations";
import Soilwaterindex from "../components/soilreport/soilreportsidebar/Soilwaterindex";
import SOCreport from "../components/soilreport/soilreportsidebar/SOCreport";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { getFarmFields } from "../redux/slices/farmSlice";
import img1 from "../assets/image/Group 31.png"
import { useNavigate } from "react-router-dom";

const SoilReport = () => {
  const [selectedOperation, setSelectedOperation] = useState(null);
  const [reportdata, setReportData] = useState(null);
  const [isdownloading, setIsDownloading] = useState(false);
  const fields = useSelector((state) => state?.farmfield?.fields);

  const dispatch = useDispatch();
  const user = useSelector((state) => state?.auth?.user);
  const userId = user?.id;
  const navigate = useNavigate();

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
      const scaledHeight = height * 0.95; // force fit A4

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

  // Fetch fields once when userId is available
  useEffect(() => {
    if (userId) {
      dispatch(getFarmFields(userId));
    }
  }, [dispatch, userId]);

  if (fields.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-screen bg-[#5a7c6b] text-center px-4">
        {/* Centered Background Image */}
        <img
          src={img1}
          alt="No Fields"
          className="w-[400px] h-[400px] mb-6 opacity-70"
        />

        {/* Text */}
        <h2 className="text-2xl font-semibold text-white">
          Add Farm to See the Soil Report
        </h2>

        {/* Optional Button */}
        <button
          onClick={() => navigate("/addfield")}
          className="mt-6 px-5 py-2 rounded-lg bg-white text-[#5a7c6b] font-medium hover:bg-gray-200 transition"
        >
          Add Field
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-[#5a7c6b] flex">
    <div>
      <SoilReportSidebar
        selectedOperation={selectedOperation}
        setSelectedOperation={setSelectedOperation}
        setReportData={setReportData}
        downloadPDF={downloadPDF}
      />
    </div>

    <div className="w-100 p-4 h-screen overflow-y-auto">
      {/* Placeholder if no field selected */}
      {!reportdata ? (
        <div className="flex items-center justify-center h-full w-full">
          <div className="flex flex-col items-center text-center opacity-60">
            <img src={img1} alt="placeholder" className="w-[300px] h-[300px] mb-6 opacity-70" />
            <p className="text-2xl font-semibold text-white">
              Select Field to Generate Soil Report
            </p>
          </div>
        </div>
      ) : (
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
          <div
            ref={reportRef}
            className={`${isdownloading ? "bg-white text-black p-4" : ""}`}
          >
            <div className="mt-4">
              <Report data={reportdata} isdownloading={isdownloading} />
            </div>
          </div>

          {/* Page 2 */}
          <div
            ref={restRef}
            className={`${isdownloading ? "bg-white text-black p-4" : ""}`}
          >
            <div className="mt-4">
              <SOCreport isdownloading={isdownloading} />
            </div>

            <div className="mt-10 rounded-lg shadow-md flex justify-between gap-4">
              <Soilwaterindex
                isdownloading={isdownloading}
                selectedFieldsDetials={[selectedOperation]}
              />
            </div>

            <div className="mt-4">
              <Reccomendations isdownloading={isdownloading} />
            </div>

            <div
              className={`mt-5 p-4 rounded-lg shadow-md ${
                isdownloading ? "text-black" : "text-green-100"
              }`}
            >
              <p className="text-xs">
                * This is a satellite-based generated soil report, not a
                physical or lab-tested report. The results are indicative and
                may not represent exact ground conditions. Please use it for
                advisory purposes only.
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
