import React from "react";
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

const data = [
  { nutrient: "P", current: 23.4, lastYear: 15.6, label: "Nitrogen" },
  { nutrient: "Mg", current: 28.1, lastYear: 12.5, label: "Phosphorous" },
  { nutrient: "K", current: 10.4, lastYear: 8.1, label: "Potassium" },
];

const SoilAnalysisChart = () => {
  return (
    <div className="soil-analysis-chart-container">
      <h2 className="soil-analysis-chart-title">Soil analysis</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 40, bottom: 20, left: 10 }}
        >
          {/* Hide Cartesian Gridlines */}
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
            barSize={4}
            name="Current"
            radius={[10, 10, 10, 10]}
            label={{
              position: "right",
              fill: "#000",
              formatter: (value) => `${value}`,
              style: {
                fontSize: "12px",
                fontWeight: "700",
              },
            }}
          />
          <Bar
            dataKey="lastYear"
            fill="#C4E930"
            barSize={4}
            name="Last Year"
            radius={[10, 10, 10, 10]}
            label={{
              position: "right",
              fill: "#A2A2A2",
              formatter: (value) => `${value}`,
              style: {
                fontSize: "7px",
                fontWeight: "bold",
              },
            }}
          />
        </BarChart>
      </ResponsiveContainer>
      <div className="nutrient-names">
        {data.map((item, index) => (
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
