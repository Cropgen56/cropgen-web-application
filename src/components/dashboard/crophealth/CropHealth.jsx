import Card from "react-bootstrap/Card";
import DaughnutChart from "./daughnutchart/DaughnutChart.jsx";
import "./CropHealth.css";
import cropImage from "../../../assets/image/dashboard/crop-image.jpg";
import SoilHealthChart from "./solilhealth/SoilHealthChart.jsx";
import SoilAnalysisChart from "./soilanalysischart/SoilAnalysisChart.jsx";

const CropHealth = () => {
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
                  <td>Wheat</td>
                </tr>
                <tr>
                  {" "}
                  <th>Crop Age :-</th>
                  <td>15 days</td>
                </tr>
                <tr>
                  {" "}
                  <th>Standerd Yield Data :-</th>
                  <td> 460.00 kg/acer</td>
                </tr>
                <tr>
                  {" "}
                  <th>Total Area :-</th>
                  <td>1.5 Acre</td>
                </tr>
              </td>
            </tr>
          </table>
        </div>
        <div style={{ marginLeft: "10rem" }}>
          <DaughnutChart />
        </div>
      </div>

      <div className="d-flex justify-content-between align-items-center mt-5">
        <div style={{ width: "50%" }}>
          <SoilAnalysisChart />
        </div>
        <div style={{ width: "50%" }}>
          <SoilHealthChart />
        </div>
      </div>
    </Card>
  );
};

export default CropHealth;
