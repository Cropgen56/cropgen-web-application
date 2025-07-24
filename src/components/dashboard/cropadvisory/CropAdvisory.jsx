import React, { useEffect, useState, useRef } from "react";
import { Card, Form } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import {
  genrateAdvisory,
  fetchSoilMoisture,
} from "../../../redux/slices/satelliteSlice";
import LoadingSpinner from "../../../components/comman/loading/LoadingSpinner";

const CropAdvisory = ({ selectedFieldsDetials }) => {
  const dispatch = useDispatch();
  const [selectedDay, setSelectedDay] = useState("Day 1");
  const { NpkData, SoilMoisture, advisory } = useSelector(
    (state) => state.satellite
  );

  const scrollRef = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const farmDetails = selectedFieldsDetials[0];

  useEffect(() => {
    dispatch(fetchSoilMoisture(farmDetails));
  }, [selectedFieldsDetials]);

  useEffect(() => {
    if (NpkData && SoilMoisture && selectedFieldsDetials?.length) {
      const timer = setTimeout(() => {
        dispatch(
          genrateAdvisory({
            farmDetails: selectedFieldsDetials[0],
            NpkData,
            SoilMoisture,
          })
        );
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [dispatch, NpkData, SoilMoisture, selectedFieldsDetials]);

  useEffect(() => {
    const slider = scrollRef.current;
    if (!slider) return;

    const handleMouseDown = (e) => {
      isDragging.current = true;
      startX.current = e.pageX - slider.offsetLeft;
      scrollLeft.current = slider.scrollLeft;
      slider.style.cursor = "grabbing";
    };

    const handleMouseLeave = () => {
      isDragging.current = false;
      slider.style.cursor = "grab";
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      slider.style.cursor = "grab";
    };

    const handleMouseMove = (e) => {
      if (!isDragging.current) return;
      e.preventDefault();
      const x = e.pageX - slider.offsetLeft;
      const walk = x - startX.current;
      slider.scrollLeft = scrollLeft.current - walk;
    };

    slider.addEventListener("mousedown", handleMouseDown);
    slider.addEventListener("mouseleave", handleMouseLeave);
    slider.addEventListener("mouseup", handleMouseUp);
    slider.addEventListener("mousemove", handleMouseMove);

    return () => {
      slider.removeEventListener("mousedown", handleMouseDown);
      slider.removeEventListener("mouseleave", handleMouseLeave);
      slider.removeEventListener("mouseup", handleMouseUp);
      slider.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const advisoryData =
    advisory && typeof advisory === "object"
      ? Object.entries(advisory).map(([day, activities]) => ({
          day,
          activities,
        }))
      : [];

  const categories = [
    "Disease/Pest Control",
    "Fertigation",
    "Watering",
    "Monitoring",
  ];

  const currentDayData =
    advisoryData.find((item) => item.day === selectedDay)?.activities || {};
  
    const renderActivityText = (text) =>
      text ? (
        <ol className="list-decimal pl-4">
          {text.split("\n").map((line, i) => (
            <li key={i} className="mb-2 leading-tight">
              {line}
            </li>
          ))}
        </ol>
      ) : (
        <p>No data available</p>
      );
    
  return (
    <div className="flex flex-col gap-4 mt-2 mb-3 rounded-lg shadow border border-gray-300 bg-white md:h-auto lg:h-auto p-3 overflow-hidden">
      {/* Title & Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-[#344e41]">
          Crop Advisory
        </h2>
        <Form.Select
          value={selectedDay}
          onChange={(e) => setSelectedDay(e.target.value)}
          aria-label="Select advisory day"
          style={{ width: "100px", height: "30px" }}
          className="text-[14px] md:text-[11px] p-1 appearance-auto bg-no-repeat bg-[right_0.5rem_center]"
        >
          {advisoryData.length > 0 ? (
            advisoryData.map((item) => (
              <option key={item.day} value={item.day}>
                {item.day}
              </option>
            ))
          ) : (
            <option value="Day 1">Day 1</option>
          )}
        </Form.Select>
      </div>

      {/* Advisory Cards Scrollable */}
      {advisoryData?.length > 0 ? (
        <div
          ref={scrollRef}
          className="flex flex-nowrap justify-between lg:gap-4 gap-2 p-2 md:p-0 overflow-x-auto scrollbar-hide no-scrollbar scroll-smooth touch-auto overscroll-x-contain cursor-grab select-none"
        >
          {categories?.map((category) => (
            <div
              key={category}
              className="flex-none lg:w-[250px] lg:h-[160px] md:w-[170px] md:h-[130px] bg-[#5A7C6BB2] text-white border border-gray-300 rounded-lg p-3 md:p-2 shadow-md overflow-hidden"
            >
              <h3 className="text-sm lg:text-base font-bold text-[#344e41] mb-1 md:mb-0.5">
                {category}
              </h3>
              <div className="text-xs lg:text-sm text-white font-medium leading-tight">
                {renderActivityText(currentDayData[category])}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-muted">
          <LoadingSpinner />
          <strong>Generating Advisory</strong>
        </p>
      )}
    </div>
  );
};

export default CropAdvisory;
