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

    useEffect(() => {
        if (farmDetails) {
            dispatch(fetchCropHealth(farmDetails));
        }
    }, [dispatch, farmDetails]);

    const { Health_Percentage = 0, Crop_Health = "Unknown" } = cropHealth || {};


    const data = {
        labels: ["Excellent", "Very Good", "Good", "Moderate", "Poor"],
        datasets: [{
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
                    : [0, 0, 0, 0, 100],
                backgroundColor: [
                "#2A3F2F",
                "#3E5C4A",
                "#344E41",
                "#78A3AD",
                "#5A7C6B",
                ],
                borderWidth: 1,
                hoverOffset: 4,
        }],
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

    const centerTextPlugin = {
        id: "centerText",
        beforeDraw: (chart) => {
        const { ctx, chartArea } = chart;
        if (!chartArea) return;

        ctx.save();
        const x = (chartArea.left + chartArea.right) / 2;
        const y = (chartArea.top + chartArea.bottom) / 2;
        const percentageText = `${Health_Percentage}%`;

        ctx.font = "bold 24px Arial"; // Fixed text size
        ctx.fillStyle = "#000000";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(percentageText, x, y);
        ctx.restore();
        },
    };

    return (
        // <div className=" w-full max-w-[280px] sm:max-w-[320px] md:max-w-[420px] md:h-[220px] md:scale-[1.1] lg:max-w-[500px] lg:h-[240px] lg:scale-100 flex justify-center items-center">
        <div className="w-full max-w-[300px] h-[220px] md:scale-[1.1] lg:scale-100 flex justify-center items-center">

            {loading?.cropHealth ? (
                <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                    <LoadingSpinner
                        height="100px"
                        size={40}
                        sm={48}
                        md={56}
                        color="#86D72F" />
                    <p className="text-sm sm:text-base md:text-lg text-green-500 animate-fade-in">
                        Crop Health Loading...
                    </p>
                </div>
            ) : (
                <div className="w-full max-w-[300px] md:max-w-[400px] h-full">
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
