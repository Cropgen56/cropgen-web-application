import React, { useEffect, useState, useMemo } from "react";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import "./CropAdvisory.css";
import { useDispatch, useSelector } from "react-redux";
import { genrateAdvisory } from "../../../redux/slices/satelliteSlice";

const CropAdvisory = ({ selectedFieldsDetials }) => {
  const dispatch = useDispatch();
  const [selectedDay, setSelectedDay] = useState("Day 1");
  const { NpkData, SoilMoisture, advisory } = useSelector(
    (state) => state.satellite
  );

  useEffect(() => {
    if (NpkData && SoilMoisture && selectedFieldsDetials?.length) {
      dispatch(
        genrateAdvisory({
          farmDetails: selectedFieldsDetials[0],
          NpkData,
          SoilMoisture,
        })
      );
    }
  }, [dispatch, NpkData, SoilMoisture, selectedFieldsDetials]);

  // Memoize advisoryData to prevent recomputation
  const advisoryData = useMemo(
    () =>
      advisory
        ? Object.entries(advisory).map(([day, activities]) => ({
            day,
            activities,
          }))
        : [],
    [advisory]
  );

  const categories = [
    "Disease/Pest Control",
    "Fertigation",
    "Water Management",
    "Monitoring",
  ];

  // Memoize currentDayData to avoid searching on every render
  const currentDayData = useMemo(
    () =>
      advisoryData.find((item) => item.day === selectedDay)?.activities || {},
    [advisoryData, selectedDay]
  );

  // Truncate monitoring text at first dot
  const truncateAtFirstDot = (text) => {
    const firstDotIndex = text.indexOf(".");
    return firstDotIndex !== -1 ? text.substring(0, firstDotIndex + 1) : text;
  };

  return (
    <Card body className="mt-2 mb-3 crop-advisory shadow">
      <div className="crop-advisory-title">
        <h2>Crop Advisory</h2>
        <Form.Select
          value={selectedDay}
          onChange={(e) => setSelectedDay(e.target.value)}
          className="day-selector"
          aria-label="Select advisory day"
        >
          {advisoryData.map((item) => (
            <option key={item.day} value={item.day}>
              {item.day}
            </option>
          ))}
        </Form.Select>
      </div>

      {advisoryData.length > 0 ? (
        <div
          className="advisory-grid"
          role="region"
          aria-label="Advisory categories"
        >
          {categories.map((category) => (
            <Card key={category} className="advisory-card">
              <Card.Body>
                <Card.Title>{category}</Card.Title>
                <Card.Text>
                  {category === "Monitoring"
                    ? truncateAtFirstDot(currentDayData[category] || "")
                        .split("\n")
                        .map((line, i) => (
                          <p key={`${category}-${i}`}>{line}</p>
                        ))
                    : currentDayData[category]
                        ?.split("\n")
                        .map((line, i) => (
                          <p key={`${category}-${i}`}>{line}</p>
                        ))}
                </Card.Text>
              </Card.Body>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-center text-muted">Advisory Loading...</p>
      )}
    </Card>
  );
};

export default CropAdvisory;
