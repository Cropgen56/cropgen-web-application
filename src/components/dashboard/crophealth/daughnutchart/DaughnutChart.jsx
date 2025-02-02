import React, { useEffect } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { useDispatch, useSelector } from "react-redux";
import { fetchCropHealth } from "../../../../redux/slices/satelliteSlice";

ChartJS.register(ArcElement, Tooltip, Legend);

const DoughnutChart = ({ selectedFieldsDetials }) => {
  const farmDetails = selectedFieldsDetials[0];

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchCropHealth(farmDetails));
  }, [selectedFieldsDetials]);

  const { cropHealth } = useSelector((state) => state?.satellite);
  const { Health_Percentage = {}, Crop_Health = {} } = cropHealth || {};

  const data = {
    labels: ["Good", "Moderate", "Bad"],
    datasets: [
      {
        label: "Dataset",
        data: [60, 10, 30],
        backgroundColor: ["#344E41", "#78A3AD", "#5A7C6B"],
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
            const percentage = ((currentValue / total) * 100).toFixed(1);
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

      // Check if chart area is available
      if (!chart.chartArea) {
        ctx.restore();
        return;
      }

      // Calculate center point of the chart
      const x = (chart.chartArea.left + chart.chartArea.right) / 2;
      const y = (chart.chartArea.top + chart.chartArea.bottom) / 2;

      // Calculate total and percentage
      const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
      const percentage = Math.round((data.datasets[0].data[0] / total) * 100);
      const percentageText = `${percentage}%`;
      const labelText = "Normal";

      // Draw percentage
      ctx.font = "bold 24px Arial";
      ctx.fillStyle = "#344E41";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(percentageText, x, y - 20);

      // Draw label
      ctx.font = "14px Arial";
      ctx.fillStyle = "#888888";
      ctx.fillText(labelText, x, y + 15);

      ctx.restore();
    },
  };

  return (
    <div className="chart-container" style={{ height: "200px" }}>
      <Doughnut data={data} options={options} plugins={[centerTextPlugin]} />
    </div>
  );
};

export default DoughnutChart;
