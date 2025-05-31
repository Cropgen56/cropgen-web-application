import React, { useEffect } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { useDispatch, useSelector } from "react-redux";
import { fetchCropHealth } from "../../../../redux/slices/satelliteSlice";
import LoadingSpinner from "../../../comman/loading/LoadingSpinner";

ChartJS.register(ArcElement, Tooltip, Legend);

const DoughnutChart = ({ selectedFieldsDetials }) => {
  const farmDetails = selectedFieldsDetials[0];
  const dispatch = useDispatch();
  const { cropHealth, loading } = useSelector((state) => state?.satellite);

  // Fetch crop health data when farmDetails changes
  useEffect(() => {
    if (farmDetails) {
      dispatch(fetchCropHealth(farmDetails));
    }
  }, [dispatch, farmDetails]);

  const { Health_Percentage = 0, Crop_Health = "Unknown" } = cropHealth || {};

  // Prepare data for the doughnut chart
  const data = {
    labels: ["Excellent", "Very Good", "Good", "Moderate", "Poor"],
    datasets: [
      {
        label: "Crop Health",
        data:
          Crop_Health === "Excellent"
            ? [Health_Percentage, 0, 0, 0, 100 - Health_Percentage]
            : Crop_Health === "Very Good"
            ? [0, Health_Percentage, 0, 0, 100 - Health_Percentage]
            : Crop_Health === "Good"
            ? [0, 0, Health_Percentage, 0, 100 - Health_Percentage]
            : Crop_Health === "Moderate"
            ? [0, 0, 0, Health_Percentage, 100 - Health_Percentage]
            : Crop_Health === "Poor"
            ? [0, 0, 0, 0, Health_Percentage]
            : [0, 0, 0, 0, 0],
        backgroundColor: [
          "#2A3F2F",
          "#3E5C4A",
          "#344E41",
          "#78A3AD",
          "#5A7C6B",
        ],
        hoverOffset: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
        labels: {
          padding: 20,
          boxWidth: 20,
          font: {
            size: 14,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (tooltipItem) => {
            const dataset = tooltipItem.dataset;
            const currentValue = dataset.data[tooltipItem.dataIndex];
            const total = dataset.data.reduce((a, b) => a + b, 0);
            const percentage = total
              ? ((currentValue / total) * 100).toFixed(1)
              : 0;
            return `${tooltipItem.label}: ${percentage}%`;
          },
        },
      },
    },
  };

  const centerTextPlugin = {
    id: "centerText",
    beforeDraw: (chart) => {
      const { ctx } = chart;
      ctx.save();

      if (!chart.chartArea) {
        ctx.restore();
        return;
      }

      const x = (chart.chartArea.left + chart.chartArea.right) / 2;
      const y = (chart.chartArea.top + chart.chartArea.bottom) / 2;

      // Display Health_Percentage in the center
      const percentageText = `${Health_Percentage}%`;

      ctx.font = "bold 24px Arial";
      ctx.fillStyle = "#344E41";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(percentageText, x, y);

      ctx.restore();
    },
  };

  return (
    <div className="chart-container">
      {loading?.cropHealth ? (
        <div className="w-100 h-100 d-flex flex-column align-items-center justify-content-center">
          <LoadingSpinner height="110px" size={64} color="#86D72F" />
          <p className="loading-text-new">Crop Health Loading...</p>
        </div>
      ) : (
        <Doughnut data={data} options={options} plugins={[centerTextPlugin]} />
      )}
    </div>
  );
};

export default DoughnutChart;
