import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const DoughnutChart = () => {
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
      const { width, height } = chart;
      const ctx = chart.ctx;
      ctx.save();

      // Calculate total and percentage
      const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
      const percentage = Math.round((data.datasets[0].data[0] / total) * 100);
      const percentageText = `${percentage}%`;
      const labelText = "Normal";

      // Measure text width to center-align dynamically
      const percentageTextWidth = ctx.measureText(percentageText).width;
      const labelTextWidth = ctx.measureText(labelText).width;

      // Draw percentage
      ctx.font = "bold 24px Arial";
      ctx.fillStyle = "#344E41";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(percentageText, width / 2, height / 2 - 10);

      // Draw label
      ctx.font = "14px Arial";
      ctx.fillStyle = "#888888";
      ctx.fillText(labelText, width / 2, height / 2 + 15);

      ctx.restore();
    },
  };
  return (
    <div className="chart-container me-5">
      <Doughnut data={data} options={options} />
      {/* plugins={[centerTextPlugin]} */}
    </div>
  );
};

export default DoughnutChart;
