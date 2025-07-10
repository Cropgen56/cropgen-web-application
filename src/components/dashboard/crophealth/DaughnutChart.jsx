import React, { useEffect } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { useDispatch, useSelector } from "react-redux";
import { fetchCropHealth } from "../../../redux/slices/satelliteSlice";
import LoadingSpinner from "../../comman/loading/LoadingSpinner";

ChartJS.register(ArcElement, Tooltip, Legend);

const DoughnutChart = ({ selectedFieldsDetials }) => {
  const farmDetails = selectedFieldsDetials?.[0];
  const dispatch = useDispatch();
  const { cropHealth, loading } = useSelector((state) => state?.satellite);

  // Fetch crop health data
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
            : [0, 0, 0, 0, 100], // Default to show "Poor" if unknown
        backgroundColor: [
          "#2A3F2F",
          "#3E5C4A",
          "#344E41",
          "#78A3AD",
          "#5A7C6B",
        ],
        borderWidth: 1,
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
          padding: 10,
          boxWidth: 15,
          font: {
            size: 12,
          },
        },
        maxWidth: 150,
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

  // Center text plugin with responsive font size
  const centerTextPlugin = {
    id: "centerText",
    beforeDraw: (chart) => {
      const { ctx, chartArea } = chart;
      if (!chartArea) return;

      ctx.save();
      const x = (chartArea.left + chartArea.right) / 2;
      const y = (chartArea.top + chartArea.bottom) / 2;
      const percentageText = `${Health_Percentage}%`;

      // Adjust font size based on chart width
      const chartWidth = chart.width;
      let fontSize = 40; // default for desktop

      if (chartWidth < 640) {
        fontSize = 22; // mobile
      } else if (chartWidth < 1024) {
        fontSize = 28; // tablet
      }

      ctx.font = `bold ${fontSize}px Arial`;
      ctx.fillStyle = "#000000";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(percentageText, x, y);
      ctx.restore();
    },
  };

  return (
    <div className="w-full md:w-auto max-w-[280px] sm:max-w-[320px] md:max-w-[199px] lg:max-w-[400px] h-[160px]  md:h-[96px] lg:h-[200px] flex items-center md:self-end md:pr-2 lg:pr-0">

      {loading?.cropHealth ? (
        <div className="w-full h-full flex flex-col items-center justify-center gap-2">
          <LoadingSpinner
            height="100px"
            size={40}
            sm={48}
            md={56}
            color="#86D72F"
          />
          <p className="text-sm sm:text-base md:text-lg text-green-500 animate-fade-in">
            Crop Health Loading...
          </p>
        </div>
      ) : (
        <div className="w-full h-full">
          <Doughnut
            data={data}
            options={options}
            plugins={[centerTextPlugin]}
          />
        </div>
      )}
    </div>
  );
};

export default DoughnutChart;
