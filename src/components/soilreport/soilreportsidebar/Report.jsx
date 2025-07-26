import React from "react";
import logo from "../../../assets/image/login/logo.svg";

const Report = ({ data, isdownloading }) => {
  const parameters = [
    { name: "N (Nitrogen)", unit: "Kg/ha", range: "280-560", value: 311.72 },
    { name: "P (Phosphorus)", unit: "Kg/ha", range: "22-56", value: 28.48 },
    { name: "K (Potassium)", unit: "Kg/ha", range: "150-250", value: 166.98 },
    { name: "SOC (Soil Organic Carbon)", unit: "%", range: "1.0-3.0", value: 0.67 },
  ];

  const requiredData = [
    { name: "Soil Moisture", unit: "%", range: "-", value: 17.07 },
    { name: "Clay Content", unit: "%", range: "-", value: 15.10 },
    { name: "Ca (Calcium)", unit: "ppm", range: "500-1000", value: 613.27 },
    { name: "Mg (Magnesium)", unit: "ppm", range: "100-300", value: 147.13 },
    { name: "S (Sulfur)", unit: "ppm", range: "30-50", value: 26.79 },
    { name: "B (Boron)", unit: "ppm", range: "0.2-0.6", value: 0.61 },
    { name: "Zn (Zinc)", unit: "ppm", range: "0.5-2.0", value: 0.85 },
    { name: "Cu (Copper)", unit: "ppm", range: "0.5-2.0", value: 0.75 },
    { name: "Fe (Iron)", unit: "ppm", range: "10-50", value: 14.53 },
    { name: "Mn (Manganese)", unit: "ppm", range: "10-50", value: 19.43 },
    { name: "pH", unit: "-", range: "6.5-7.5", value: 6.74 },
    { name: "CEC (Cation Exchange Capacity)", unit: "Meq/100g", range: "-", value: 11.13 },
  ];

  const getBarWidth = (value, range) => {
    const [min, max] = range.split("-").map(parseFloat);
    if (!min || !max || isNaN(min) || isNaN(max)) return "50%";
    return `${((value - min) / (max - min)) * 100}%`;
  };

  const bgMain = isdownloading ? "bg-white text-black" : "bg-[#2d3f33] text-white";
  const bgRequiredHeading = isdownloading ? "bg-gray-200 text-black" : "bg-[#4a6e57] text-white";
  const progressColor = isdownloading ? "bg-green-600" : "bg-yellow-400";

  return (
    <div className={`${bgMain} p-7 rounded-md shadow-lg mb-0`}>
      <div className="flex justify-left items-center mb-6">
        <img src={logo} alt="Logo" className="w-[15%] p-2" />
        <h4 className={`${isdownloading ? "text-black" : "text-white"} text-3xl font-bold`}>CropGen</h4>
      </div>

      <h3 className="text-2xl font-bold mb-6">Summary &nbsp; Report</h3>
      <div className="flex justify-between gap-8 mb-8">
        <div>
          <p><strong>Farmer Name:</strong> Rajesh Kumar</p>
          <p><strong>Mobile Number:</strong> ------------</p>
          <p><strong>Current Crop:</strong> {data.current}</p>
        </div>
        
        <div>
          <p><strong>Village:</strong> Shivpur</p>
          <p><strong>Report ID:</strong> LCAKM000212</p>
          <p><strong>Next Crop:</strong> {data.nextcrop}</p>
        </div>
      </div>

      <h4 className="text-lg font-semibold mb-2">Soil Parameters</h4>
      <table className={`w-full text-left border-collapse ${isdownloading ? "text-xs" : ""}`}>
        <thead>
          <tr className="border-b border-gray-500">
            <th className="py-2 align-middle">Soil Parameters</th>
            <th className="py-2 align-middle">Unit</th>
            <th className="py-2 align-middle">Range</th>
            <th className="py-2 align-middle">Available</th>
            <th className="py-2 align-middle">Remark</th>
          </tr>
        </thead>
        <tbody>
          {parameters.map((param, idx) => (
            <tr key={idx} className="border-b border-gray-700">
              <td className="py-2 align-middle">{param.name}</td>
              <td className="py-2 align-middle">{param.unit}</td>
              <td className="py-2 align-middle">{param.range}</td>
              <td className="py-2 align-middle">{param.value}</td>
              <td className="py-2 align-middle">
                <div className="w-full bg-gray-300 h-2 rounded">
                  <div
                    className={`${progressColor} h-2 rounded`}
                    style={{
                      width: `${(param.value / parseFloat(param.range.split("-")[1])) * 100}%`,
                    }}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

   <div className={`${bgRequiredHeading} py-3 mb-4 mt-8 rounded`}>
  <h4 className={`text-center font-bold ${isdownloading ? "text-lg" : "text-2xl"}`}>
    Required Data
  </h4>
</div>

      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-500">
            <th className="py-2 align-middle">Soil Parameters</th>
            <th className="py-2 align-middle">Unit</th>
            <th className="py-2 align-middle">Range</th>
            <th className="py-2 align-middle">Available</th>
            <th className="py-2 align-middle">Remark</th>
          </tr>
        </thead>
        <tbody>
          {requiredData.map((param, idx) => (
            <tr key={idx} className="border-b border-gray-700">
              <td className="py-2 align-middle">{param.name}</td>
              <td className="py-2 align-middle">{param.unit}</td>
              <td className="py-2 align-middle">{param.range}</td>
              <td className="py-2 align-middle">{param.value}</td>
              <td className="py-2 align-middle">
                <div className="w-full bg-gray-300 h-2 rounded">
                  <div
                    className={`${progressColor} h-2 rounded`}
                    style={{
                      width: getBarWidth(param.value, param.range),
                    }}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Report;
