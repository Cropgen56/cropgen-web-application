import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Card from "react-bootstrap/Card";
import * as turf from "@turf/turf";
import DaughnutChart from "./daughnutchart/DaughnutChart.jsx";
import SoilAnalysisChart from "./soilanalysischart/SoilAnalysisChart.jsx";
import SoilMoistureTemperature from "./soil-moisture-temperature/SoilMoistureTemperature.jsx";
import { calculateAiYield } from "../../../redux/slices/satelliteSlice.js";
import cropImage from "../../../assets/image/dashboard/crop-image.jpg";
import "./CropHealth.css";

const CropHealth = ({ selectedFieldsDetials }) => {
  const cropDetials = selectedFieldsDetials?.[0];
  const sowingDate = cropDetials?.sowingDate;
  const corrdinatesPoint = cropDetials?.field;

  const dispatch = useDispatch();
  const { cropYield, NpkData } = useSelector((state) => state?.satellite);

  // Memoize the calculation of days from sowing date
  const daysFromSowing = React.useMemo(() => {
    if (!sowingDate) return 0;
    const targetDate = new Date(sowingDate);
    const currentDate = new Date();
    targetDate.setHours(0, 0, 0, 0);
    currentDate.setHours(0, 0, 0, 0);
    const timeDifference = currentDate - targetDate;
    return Math.floor(timeDifference / (1000 * 60 * 60 * 24));
  }, [sowingDate]);

  // Memoize the calculation of area
  const totalArea = React.useMemo(() => {
    if (!corrdinatesPoint || corrdinatesPoint.length < 3) return 0;
    const coordinates = corrdinatesPoint.map((point) => [point.lng, point.lat]);
    coordinates.push(coordinates[0]);
    const polygon = turf.polygon([coordinates]);
    const area = turf.area(polygon);
    return area / 4046.86;
  }, [corrdinatesPoint]);

  // Extract Crop_Growth_Stage
  const { Crop_Growth_Stage } = NpkData || {};

  // Dispatch calculateAiYield only when Crop_Growth_Stage changes
  useEffect(() => {
    if (Crop_Growth_Stage && cropDetials) {
      dispatch(calculateAiYield({ cropDetials, Crop_Growth_Stage }));
    }
  }, [dispatch, cropDetials, Crop_Growth_Stage]);

  return (
    <Card body className="mt-4 mb-3 crop-health shadow">
      <h2 className="crop-health-title">Crop Health</h2>
      <div className="d-flex align-items-center">
        <div className="pt-1">
          <table>
            <tr>
              <th>
                <img
                  src={cropImage}
                  alt="crop image"
                  className="crop-health-crop-image"
                />
              </th>
              <td className="crop-information ps-4">
                <tr>
                  <th>Crop Name :-</th>
                  <td>{cropDetials?.cropName || " "}</td>
                </tr>
                <tr>
                  <th>Crop Age :-</th>
                  <td>{daysFromSowing} days</td>
                </tr>
                <tr>
                  <th>Standard Yield Data :-</th>
                  <td>{cropYield?.Standard_Yield_units || "N/A"}</td>
                </tr>
                <tr>
                  <th>Total Area :-</th>
                  <td>{totalArea.toFixed(2)} acres</td>
                </tr>
              </td>
            </tr>
          </table>
        </div>
        <div style={{ marginLeft: "13rem" }}>
          <DaughnutChart selectedFieldsDetials={selectedFieldsDetials} />
        </div>
      </div>

      <div className="d-flex justify-content-between align-items-center mt-5">
        <div style={{ width: "50%" }}>
          <SoilAnalysisChart selectedFieldsDetials={selectedFieldsDetials} />
        </div>
        <div style={{ width: "50%" }}>
          <SoilMoistureTemperature
            selectedFieldsDetials={selectedFieldsDetials}
          />
        </div>
      </div>
    </Card>
  );
};

export default CropHealth;
