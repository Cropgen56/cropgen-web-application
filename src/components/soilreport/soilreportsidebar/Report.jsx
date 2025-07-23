import React from "react";
import logo from "../../../assets/image/login/logo.svg"


const Report = ({ data }) =>  {
  const parameters = [
    { name: "N (Nitrogen)", unit: "Kg/ha", range: "280-560", value: 311.72 },
    { name: "P (Phosphorus)", unit: "Kg/ha", range: "22-56", value: 28.48 },
    { name: "K (Potassium)", unit: "Kg/ha", range: "150-250", value: 166.98 },
    { name: "SOC (Soil Organic Carbon)", unit: "%", range: "1.0-3.0", value: 0.67 },
  ];

  return (
    <div className="bg-[#2d3f33] text-white p-8 rounded-lg shadow-lg">
         <div className="flex justify-left items-center mb-6">
             <img  src={logo} alt="Logo" className=" w-18 p-3" />
        <h4 className="text-white text-base font-bold">CropGen</h4>
         </div>
      <h3 className="text-2xl font-bold mb-6">Summary Report</h3>
      <div className="grid grid-cols-2 gap-6 mb-8">
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

      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-500">
            <th className="py-2">Soil Parameters</th>
            <th className="py-2">Unit</th>
            <th className="py-2">Range</th>
            <th className="py-2">Available</th>
            <th className="py-2">Remark</th>
          </tr>
        </thead>
        <tbody>
          {parameters.map((param, idx) => (
            <tr key={idx} className="border-b border-gray-700">
              <td className="py-2">{param.name}</td>
              <td className="py-2">{param.unit}</td>
              <td className="py-2">{param.range}</td>
              <td className="py-2">{param.value}</td>
              <td className="py-2">
                <div className="w-full bg-gray-600 h-2 rounded">
                  <div
                    className="bg-green-400 h-2 rounded"
                    style={{ width: `${(param.value / parseFloat(param.range.split('-')[1])) * 100}%` }}
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
