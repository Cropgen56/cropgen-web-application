import React from "react";

const Reccomendations = () => {
  return (
    <div className="flex flex-col gap-4 p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-xl font-semibold text-[#344e41]">Recommendations</h3>
      <div className="flex flex-col gap-2 text-sm text-gray-600">
        <ul className="list-none list-inside pl-2 text-gray-700 leading-relaxed text-[14px]">
          <li>
            {" "}
            <span className="text-xl font-bold">📌 &nbsp;</span> Ensure proper
            irrigation practices to maintain soil moisture.
          </li>
          <li>
            {" "}
            <span className="text-xl font-bold">📌 &nbsp;</span> Apply organic
            matter to improve soil structure and fertility.
          </li>
          <li>
            {" "}
            <span className="text-xl font-bold">📌 &nbsp;</span> Monitor soil pH
            regularly and adjust as needed for optimal crop growth.
          </li>
          <li>
            {" "}
            <span className="text-xl font-bold">📌 &nbsp;</span> Consider crop
            rotation to enhance soil health and reduce pest pressure.
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Reccomendations;
