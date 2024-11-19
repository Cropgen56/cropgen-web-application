import React from "react";
import { Bar } from "react-chartjs-2";
import "./SoilAnalysisChart.css";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const SoilAnalysisChart = () => {
  const data = {
    labels: ["Nitrogen", "Phosphorous", "Potassium"],
    datasets: [
      {
        label: "This year",
        data: [200, 300, 250],
        borderColor: "#36A534",
        backgroundColor: "#36A534",
        borderWidth: 1,
        barThickness: 5,
      },
      {
        label: "Last year",
        data: [85, 90, 88],
        borderColor: "#C4E930",
        backgroundColor: "#C4E930",
        borderWidth: 1,
        barThickness: 5,
      },
    ],
  };

  const options = {
    responsive: true,
    indexAxis: "y",
    plugins: {
      legend: {
        position: "top",
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: {
          display: false,
        },
        ticks: {
          display: false,
        },
      },
      y: {
        grid: {
          display: false,
        },
        ticks: {
          display: false,
        },
      },
    },
  };

  return (
    <div>
      <h2
        style={{ color: "#344E41", fontSize: "1.1rem", marginBottom: "2rem" }}
      >
        Soil Analysis
      </h2>
      <Bar data={data} options={options} />
    </div>
  );
};

export default SoilAnalysisChart;
