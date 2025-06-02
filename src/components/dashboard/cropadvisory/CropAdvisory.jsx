import React, { useEffect, useState } from "react";
import { Card, Form } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { genrateAdvisory } from "../../../redux/slices/satelliteSlice";
import { fetchSoilMoisture } from "../../../redux/slices/satelliteSlice";
import "./CropAdvisory.css";
import LoadingSpinner from "../../../components/comman/loading/LoadingSpinner";

const CropAdvisory = ({ selectedFieldsDetials }) => {
  const dispatch = useDispatch();
  const [selectedDay, setSelectedDay] = useState("Day 1");
  const { NpkData, SoilMoisture, advisory } = useSelector(
    (state) => state.satellite
  );

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
      text.split("\n").map((line, i) => <p key={i}>{line}</p>)
    ) : (
      <p>No data available</p>
    );

  return (
    <Card body className="mt-2 mb-3 crop-advisory shadow">
      <div className="crop-advisory-title">
        <h2>Crop Advisory</h2>
        <Form.Select
          value={selectedDay}
          onChange={(e) => setSelectedDay(e.target.value)}
          className="day-selector"
          aria-label="Select advisory day"
          style={{
            width: "120px",
            height: "30px",
            fontSize: "14px",
            padding: "4px",
          }}
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

      {advisoryData?.length > 0 ? (
        <div className="advisory-grid">
          {categories?.map((category) => (
            <Card key={category} className="advisory-card">
              <Card.Body>
                <Card.Title>{category}</Card.Title>
                <Card.Text as="div">
                  {renderActivityText(currentDayData[category])}
                </Card.Text>
              </Card.Body>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-center text-muted">
          <LoadingSpinner />
          <strong>Generating Advisory</strong>
        </p>
      )}
    </Card>
  );
};

export default CropAdvisory;
