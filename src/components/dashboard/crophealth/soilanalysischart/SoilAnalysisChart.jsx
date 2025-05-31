import React, { useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import "./SoilAnalysisChart.css";
import { useDispatch, useSelector } from "react-redux";
import { fetcNpkData } from "../../../../redux/slices/satelliteSlice";

const SoilAnalysisChart = ({ selectedFieldsDetials }) => {
  const dispatch = useDispatch();
  const farmDetails = selectedFieldsDetials[0];
  const { NpkData } = useSelector((state) => state?.satellite);

  useEffect(() => {
    dispatch(fetcNpkData(farmDetails));
  }, [selectedFieldsDetials]);

  // Check if crop is at Final Harvest stage with null NPK data
  const isFinalHarvest =
    NpkData?.Crop_Growth_Stage === "Final Harvest" &&
    NpkData?.NPK_Required_at_Stage_kg === null &&
    NpkData?.NPK_Available_kg === null;

  const data = [
    {
      nutrient: "N",
      current: NpkData?.NPK_Available_kg?.N,
      lastYear: NpkData?.NPK_Required_at_Stage_kg?.N,
      label: "Nitrogen",
    },
    {
      nutrient: "P",
      current: NpkData?.NPK_Available_kg?.P,
      lastYear: NpkData?.NPK_Required_at_Stage_kg?.P,
      label: "Phosphorous",
    },
    {
      nutrient: "K",
      current: NpkData?.NPK_Available_kg?.K,
      lastYear: NpkData?.NPK_Required_at_Stage_kg?.K,
      label: "Potassium",
    },
  ];

  // Prevent rendering of bars with negative values by default
  const formattedData = data?.map((item) => ({
    ...item,
    current: item.current < 0 ? null : item.current,
    lastYear: item.lastYear < 0 ? null : item.lastYear,
  }));

  if (isFinalHarvest) {
    return (
      <div className="soil-analysis-chart-container">
        <h2 className="soil-analysis-chart-title">Soil analysis</h2>
        <div className="no-data-message">
          No NPK data available: Crop at final harvesting stage
        </div>
      </div>
    );
  }

  return (
    <div className="soil-analysis-chart-container">
      <h2 className="soil-analysis-chart-title">Soil analysis</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={formattedData}
          layout="vertical"
          margin={{ top: 0, right: 40, bottom: 20, left: 10 }}
        >
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="nutrient"
            axisLine={false}
            tickLine={false}
            tick={(props) => {
              const { x, y, payload } = props;
              const nutrient = data.find((d) => d.nutrient === payload.value);
              return (
                <foreignObject x={x - 50} y={y - 20} width={40} height={40}>
                  <div className="y-axis-label">
                    <span>{payload.value}</span>
                  </div>
                </foreignObject>
              );
            }}
          />
          <Tooltip cursor={{ fill: "rgba(0, 0, 0, 0.1)" }} />
          <Legend align="right" verticalAlign="top" iconType="line" />
          <Bar
            dataKey="current"
            fill="#36A534"
            barSize={5}
            name="Current"
            radius={[10, 10, 10, 10]}
            label={{
              position: "right",
              fill: "#000",
              formatter: (value) => `${value} kg/acre`,
              style: {
                fontSize: "8px",
                fontWeight: "700",
              },
            }}
          />
          <Bar
            dataKey="lastYear"
            fill="#C4E930"
            barSize={5}
            name="Required"
            radius={[10, 10, 10, 10]}
            label={{
              position: "right",
              fill: "#A2A2A2",
              formatter: (value) => `${value} kg/acre`,
              style: {
                fontSize: "8px",
                fontWeight: "700",
              },
            }}
          />
        </BarChart>
      </ResponsiveContainer>
      <div className="nutrient-names">
        {data?.map((item, index) => (
          <div
            key={index}
            className={`nutrient-name nutrient-${item.nutrient}`}
          >
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SoilAnalysisChart;
