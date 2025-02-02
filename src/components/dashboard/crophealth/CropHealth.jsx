import Card from "react-bootstrap/Card";
import DaughnutChart from "./daughnutchart/DaughnutChart.jsx";
import "./CropHealth.css";
import cropImage from "../../../assets/image/dashboard/crop-image.jpg";
import SoilHealthChart from "./solilhealth/SoilHealthChart.jsx";
import SoilAnalysisChart from "./soilanalysischart/SoilAnalysisChart.jsx";
import * as turf from "@turf/turf";
import SoilMoistureTemperature from "./soil-moisture-temperature/SoilMoistureTemperature.jsx";
import Daughnut from "../../../";

const CropHealth = ({ selectedFieldsDetials }) => {
  const cropDetials = selectedFieldsDetials[0];
  const sowingDate = cropDetials?.sowingDate;
  const corrdinatesPoint = cropDetials?.field;
  let totalArea = 0;

  function calculateDaysFromDate(input) {
    // Parse the input date string into a Date object
    const targetDate = new Date(input);

    // Check if the input date is valid
    if (isNaN(targetDate)) {
      console.error("Invalid date input");
      return null;
    }

    // Get the current date
    const currentDate = new Date();

    // Set the time part of both dates to midnight for accurate comparison
    targetDate.setHours(0, 0, 0, 0);
    currentDate.setHours(0, 0, 0, 0);

    // Calculate the difference in milliseconds
    const timeDifference = currentDate - targetDate;

    // Convert the difference to days
    const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

    return daysDifference;
  }

  const calculateArea = (corrdinatesPoint) => {
    // Transform backend data into Turf.js-compatible format
    const coordinates = corrdinatesPoint?.map((point) => [
      point.lng,
      point.lat,
    ]);

    // Close the polygon by adding the first point at the end
    coordinates.push(coordinates[0]);

    // Create the polygon
    const polygon = turf.polygon([coordinates]);

    // Calculate area in square meters
    const area = turf.area(polygon);

    // Convert to hectares and acres
    const areaHectares = area / 10000;
    totalArea = area / 4046.86;
  };

  if (corrdinatesPoint) {
    calculateArea(corrdinatesPoint);
  }

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
                  <td>{cropDetials?.cropName}</td>
                </tr>
                <tr>
                  {" "}
                  <th>Crop Age :-</th>
                  <td>{`${calculateDaysFromDate(sowingDate)} days`}</td>
                </tr>
                <tr>
                  {" "}
                  <th>Standerd Yield Data :-</th>
                  <td> 460.00 kg/acer</td>
                </tr>
                <tr>
                  {" "}
                  <th>Total Area :-</th>
                  <td>{totalArea?.toFixed(2) + " Acre"}</td>
                </tr>
              </td>
            </tr>
          </table>
        </div>
        <div style={{ marginLeft: "10rem" }}>
          <DaughnutChart selectedFieldsDetials={selectedFieldsDetials} />
        </div>
      </div>

      <div className="d-flex justify-content-between align-items-center mt-5">
        <div style={{ width: "50%" }}>
          <SoilAnalysisChart selectedFieldsDetials={selectedFieldsDetials} />
        </div>
        <div style={{ width: "50%" }}>
          {/* <SoilHealthChart selectedFieldsDetials={selectedFieldsDetials} /> */}
          <SoilMoistureTemperature
            selectedFieldsDetials={selectedFieldsDetials}
          />
        </div>
      </div>
    </Card>
  );
};

export default CropHealth;
