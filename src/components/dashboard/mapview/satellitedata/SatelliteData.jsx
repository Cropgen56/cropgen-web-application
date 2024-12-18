import React from "react";
import "./SatelliteData.css";
import { RightArrow } from "../../../../assets/DashboardIcons";
import { GratterThan } from "../../../../assets/Icons";

const SatelliteData = () => {
  const colorData = [
    { color: "#ffffff", range: "Clouds" },
    { color: "#79c875", range: "0.30 - 0.35" },
    { color: "#D43C2A", range: "0.35 - 0.40" },
    { color: "#ED4E3B", range: "0.10 - 0.15" },
    { color: "#FF6C4A", range: "0.40 - 0.45" },
    { color: "#FE8E59", range: "-1.00 - 0.10" },
    { color: "#FFAC6A", range: "0.30 - 0.35" },
    { color: "#FDC77F", range: "0.35 - 0.40" },
    { color: "#FFDF92", range: "0.25 - 0.30" },
    { color: "#FFEFAA", range: "0.20 - 0.25" },
    { color: "#FBFDCC", range: "0.15 - 0.20" },
    { color: "#EBF7AB", range: "0.10 - 0.15" },
    { color: "#D5EF94", range: "0.25 - 0.30" },
    { color: "#BAE280", range: "0.50 - 0.55" },
    { color: "#9BD773", range: "0.40 - 0.45" },
    { color: "#79C875", range: "0.30 - 0.35" },
    { color: "#79C875", range: "-1.00 - 0.10" },
    { color: "#269F66", range: "0.15 - 0.20" },
    { color: "#007E49", range: "0.20 - 0.25" },
  ];

  return (
    <div className="satellite-data-main-container">
      {/* First Row */}
      <div className="satellite-data-container">
        {/* Dropdown */}
        <select className="dropdown">
          <option value="satellite1">Satellite 1</option>
          <option value="satellite2">Satellite 2</option>
          <option value="satellite3">Satellite 3</option>
        </select>

        {/* Buttons */}
        <button class="button ndvi-btn">NDVI</button>
        <button class="button evi-btn">EVI</button>
        <button class="button ndre-btn">NDRE</button>
        <button class="button ndwi-btn">NDWI</button>
        <button class="button ndmi-btn">NDMI</button>
        <button class="button savi-btn">SAVI</button>
        <button class="button smi-btn">SMI</button>
        <button class="button soc-btn">SOC</button>

        {/* Static Arrow Button */}
        <button className="arrow-button">
          <GratterThan />
        </button>
      </div>

      {/* Second Row - Color Palette */}
      <div className="color-palette">
        {colorData.map((data, index) => (
          <div key={index} className="color-block">
            <div
              className="color"
              style={{ backgroundColor: data.color }}
            ></div>
            <div className="range-text">{data.range}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SatelliteData;
