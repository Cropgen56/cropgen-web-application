import React, { useEffect, useState } from "react";
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
    if (NpkData && SoilMoisture && selectedFieldsDetials.length) {
      dispatch(
        genrateAdvisory({
          farmDetails: selectedFieldsDetials[0],
          NpkData,
          SoilMoisture,
        })
      );
    }
  }, [dispatch, NpkData, SoilMoisture, selectedFieldsDetials]);

  const advisoryData =
    advisory &&
    Object.entries(advisory).map(([day, activities]) => ({
      day,
      activities,
    }));

  const categories = [
    "Disease/Pest Control",
    "Fertigation",
    "Watering",
    "Monitoring",
  ];

  const currentDayData =
    advisoryData?.find((item) => item.day === selectedDay)?.activities || {};

  // Function to truncate monitoring text at first dot
  const truncateAtFirstDot = (text) => {
    const firstDotIndex = text.indexOf(".");
    return firstDotIndex !== -1 ? text.substring(0, firstDotIndex + 1) : text;
  };

  return (
    <Card body className="mt-2 mb-3 crop-advisory shadow">
      <div className="crop-advisory-title">
        <div>
          {" "}
          <h2>Crop Advisory</h2>
        </div>
        <div>
          {" "}
          <Form.Control
            as="select"
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value)}
            className="day-selector"
          >
            {advisoryData?.map((item) => (
              <option key={item.day} value={item.day}>
                {item.day}
              </option>
            ))}
          </Form.Control>
        </div>
      </div>

      {advisoryData?.length > 0 ? (
        <div className="advisory-grid">
          {categories.map((category) => (
            <Card key={category} className="advisory-card">
              <Card.Body>
                <Card.Title>{category}</Card.Title>
                <Card.Text>
                  {category === "Monitoring"
                    ? // For Monitoring, show only up to first dot
                      truncateAtFirstDot(currentDayData[category] || "")
                        .split("\n")
                        .map((line, i) => <p key={i}>{line}</p>)
                    : // Other categories show full text
                      currentDayData[category]
                        ?.split("\n")
                        .map((line, i) => <p key={i}>{line}</p>)}
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
