import React, { useEffect, useState } from "react";
import "./SatelliteData.css";
import { RightArrow } from "../../../../assets/DashboardIcons";
import { GratterThan } from "../../../../assets/Icons";
import { useDispatch, useSelector } from "react-redux";
import { fetchIndexData } from "../../../../redux/slices/satelliteSlice";
import { removeSelectedIndexData } from "../../../../redux/slices/satelliteSlice";

const SatelliteData = ({ selectedFieldsDetials, selectedDate }) => {
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

  const [seletedIndex, setSelectedIndex] = useState(null);
  const dispatch = useDispatch();
  const { field, sowingDate } = selectedFieldsDetials[0];
  const coordinates = [field.map(({ lat, lng }) => [lng, lat])];

  const handelFetchIndex = () => {
    if (sowingDate && selectedDate && coordinates && seletedIndex) {
      dispatch(
        fetchIndexData({
          startDate: sowingDate,
          endDate: selectedDate,
          geometry: coordinates,
          index: seletedIndex,
        })
      );
    }
  };

  useEffect(() => {
    if (sowingDate && selectedDate && coordinates && seletedIndex) {
      dispatch(
        fetchIndexData({
          startDate: sowingDate,
          endDate: selectedDate,
          geometry: coordinates,
          index: seletedIndex,
        })
      );
    }
  }, [selectedDate]);

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
        <button
          className={`button ndvi-btn ${
            seletedIndex == "NDVI" ? "selected" : null
          }`}
          onClick={() => {
            dispatch(removeSelectedIndexData());
            setSelectedIndex("NDVI");
            handelFetchIndex("NDVI");
          }}
        >
          NDVI
        </button>
        <button
          className={`button evi-btn ${
            seletedIndex == "EVI" ? "selected" : null
          }`}
          onClick={() => {
            dispatch(removeSelectedIndexData());
            setSelectedIndex("EVI");
            handelFetchIndex("EVI");
          }}
        >
          EVI
        </button>
        <button
          className={`button ndre-btn ${
            seletedIndex == "NDRE" ? "selected" : null
          }`}
          onClick={() => {
            dispatch(removeSelectedIndexData());
            setSelectedIndex("NDRE");
            handelFetchIndex("NDRE");
          }}
        >
          NDRE
        </button>
        <button
          className={`button ndwi-btn ${
            seletedIndex == "NDWI" ? "selected" : null
          }`}
          onClick={() => {
            dispatch(removeSelectedIndexData());
            setSelectedIndex("NDWI");
            handelFetchIndex("NDWI");
          }}
        >
          NDWI
        </button>
        <button
          className={`button ndmi-btn ${
            seletedIndex == "NDMI" ? "selected" : null
          }`}
          onClick={() => {
            dispatch(removeSelectedIndexData());
            setSelectedIndex("NDMI");
            handelFetchIndex("NDMI");
          }}
        >
          NDMI
        </button>
        <button
          className={`button savi-btn ${
            seletedIndex == "SAVI" ? "selected" : null
          }`}
          onClick={() => {
            dispatch(removeSelectedIndexData());
            setSelectedIndex("SAVI");
            handelFetchIndex("SAVI");
          }}
        >
          SAVI
        </button>
        <button
          className={`button smi-btn ${
            seletedIndex == "SMI" ? "selected" : null
          }`}
          onClick={() => {
            dispatch(removeSelectedIndexData());
            setSelectedIndex("SMI");
            handelFetchIndex("SMI");
          }}
        >
          SMI
        </button>
        <button
          className={`button soc-btn ${
            seletedIndex == "SOC" ? "selected" : null
          }`}
          onClick={() => {
            dispatch(removeSelectedIndexData());
            setSelectedIndex("SOC");
            handelFetchIndex("SOC");
          }}
        >
          SOC
        </button>

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
