import React from "react";
import { useEffect } from "react";
import { fetcNpkData } from "../../../../redux/slices/satelliteSlice";
import "./SoilAnalysisChart.css";
import { useDispatch, useSelector } from "react-redux";
const NutrientBar = ({
  label,
  symbol,
  current,
  required,
  colorCurrent,
  colorRequired,
}) => {
  const max = Math.max(current, required, 1);
  const currentWidth = `${(current / max) * 100}%`;
  const requiredWidth = `${(required / max) * 100}%`;

  return (
    <div className="nutrient-container">
      <div className="npk-icon">
        <span className="icon-text">{symbol}</span>
      </div>
      <div className="info-container">
        <span className="label">{label}</span>
        <div className="bar-wrapper">
          <div
            className="bar"
            style={{ backgroundColor: colorCurrent, width: currentWidth }}
          />
        </div>
        <div className="bar-wrapper">
          <div
            className="bar"
            style={{ backgroundColor: colorRequired, width: requiredWidth }}
          />
        </div>
      </div>
      <div className="values-container">
        <span className="current-text">{`${current} kg/acre`}</span>
        <span className="required-text">{`${required} kg/acre`}</span>
      </div>
    </div>
  );
};

const SoilAnalysisChart = ({ selectedFieldsDetials }) => {
  const dispatch = useDispatch();
  const farmDetails = selectedFieldsDetials[0];
  const { NpkData } = useSelector((state) => state?.satellite);

  const { cropName } = farmDetails || {};

  useEffect(() => {
    dispatch(fetcNpkData(farmDetails));
  }, [selectedFieldsDetials]);

  const isFinalHarvest = NpkData?.Crop_Growth_Stage === "Final Harvest";

  const data = [
    {
      symbol: "N",
      label: "Nitrogen",
      current: NpkData?.NPK_Available_kg?.N ?? 0,
      required: NpkData?.NPK_Required_at_Stage_kg?.N ?? 0,
    },
    {
      symbol: "P",
      label: "Phosphorous",
      current: NpkData?.NPK_Available_kg?.P ?? 0,
      required: NpkData?.NPK_Required_at_Stage_kg?.P ?? 0,
    },
    {
      symbol: "K",
      label: "Potassium",
      current: NpkData?.NPK_Available_kg?.K ?? 0,
      required: NpkData?.NPK_Required_at_Stage_kg?.K ?? 0,
    },
  ];

  return (
    <div className="container">
      {isFinalHarvest && (
        <div className="message-container">
          <span className="message-text">
            {`Final harvest stage reached for ${cropName || "Crop"}`}
          </span>
        </div>
      )}
      {!isFinalHarvest &&
        data.map((item, index) => (
          <NutrientBar
            key={index}
            label={item.label}
            symbol={item.symbol}
            current={item.current}
            required={item.required}
            colorCurrent="#36A534"
            colorRequired="#C4E930"
          />
        ))}
    </div>
  );
};

export default SoilAnalysisChart;
