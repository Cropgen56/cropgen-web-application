import React, { useEffect, useState, useCallback, useMemo } from "react";
import "./SatelliteIndex.css";
import { GratterThan } from "../../../../assets/Icons";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchIndexData,
  removeSelectedIndexData,
} from "../../../../redux/slices/satelliteSlice";

const indexKeys = [
  "NDVI",
  "EVI",
  "SAVI",
  "MSAVI",
  "NDMI",
  "NDWI",
  "CCC",
  "EVI2",
  "NDRE",
  "SUCROSEINDEX",
  "NITROGEN",
  "DISEASE",
  "SOC",
];

const SatelliteIndex = ({ selectedFieldsDetials, selectedDate }) => {
  const colorData = useMemo(
    () => [
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
    ],
    []
  );
  const dispatch = useDispatch();

  const [selectedIndex, setSelectedIndex] = useState("NDVI");

  const { field, sowingDate } = selectedFieldsDetials?.[0] || {};

  const coordinates = useMemo(() => {
    return field?.length
      ? [
          field.map(({ lat, lng }) => [
            Number(lng.toFixed(6)),
            Number(lat.toFixed(6)),
          ]),
        ]
      : [];
  }, [field]);

  const handleIndexClick = useCallback(
    (index) => {
      dispatch(removeSelectedIndexData());
      setSelectedIndex(index);
      if (sowingDate && selectedDate && coordinates.length && index) {
        dispatch(
          fetchIndexData({
            startDate: sowingDate,
            endDate: selectedDate,
            geometry: coordinates,
            index,
          })
        );
      }
    },
    [dispatch, sowingDate, selectedDate, coordinates]
  );

  useEffect(() => {
    if (sowingDate && selectedDate && coordinates.length && selectedIndex) {
      dispatch(
        fetchIndexData({
          startDate: sowingDate,
          endDate: selectedDate,
          geometry: coordinates,
          index: selectedIndex,
        })
      );
    }
  }, [dispatch, selectedDate, selectedIndex, sowingDate, coordinates]);

  return (
    <div className="satellite-data-main-container">
      {/* First Row */}
      <div className="satellite-data-container">
        {/* Dropdown */}
        <select className="dropdown" aria-label="Select satellite">
          <option value="satellite1">Satellite 1</option>
          <option value="satellite2">Satellite 2</option>
          <option value="satellite3">Satellite 3</option>
        </select>

        {/* Index Buttons */}
        {indexKeys.map((index) => (
          <button
            key={index}
            className={`button ${index.toLowerCase()}-btn ${
              selectedIndex === index ? "selected" : ""
            }`}
            onClick={() => handleIndexClick(index)}
            aria-label={`Select ${index} index`}
          >
            {index}
          </button>
        ))}

        {/* Static Arrow Button */}
        <button className="arrow-button" aria-label="Additional options">
          <GratterThan />
        </button>
      </div>

      {/* Second Row - Color Palette */}
      <div className="color-palette">
        {colorData.map((data, index) => (
          <div
            key={`${data.range}-${data.color}-${index}`}
            className="color-block"
            role="presentation"
          >
            <div className="color" style={{ backgroundColor: data.color }} />
            <div className="range-text">{data.range}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SatelliteIndex;
