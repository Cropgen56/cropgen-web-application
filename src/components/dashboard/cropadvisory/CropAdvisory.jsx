import React from "react";
import Card from "react-bootstrap/Card";
import "./CropAdvisory.css";

const CropAdvisory = () => {
  const data = [
    {
      advisoryHeading: "Seasonal Tips",
      advisory:
        "Get seasonal recommendations based on your crop type and local climate conditions. This includes planting schedules, watering needs, and fertilization strategies.",
    },
    {
      advisoryHeading: "Pest and Disease Alerts",
      advisory:
        "Receive real-time alerts on potential pest infestations and disease outbreaks in your area. Suggested actions: 'Aphid activity detected in your crops.'",
    },
    {
      advisoryHeading: "Weather-Driven Advice",
      advisory:
        "Stay informed about upcoming weather patterns that may affect your crops. This includes frost warnings, heavy rainfall alerts, and drought conditions.",
    },
    {
      advisoryHeading: "Nutrient Management",
      advisory:
        "Get advice on nutrient management tailored to your crop and soil conditions. Learn about best practices for soil testing and the right types of fertilizers to use.",
    },
  ];

  return (
    <Card body className="mt-2 mb-2 crop-advisory shadow">
      <div className="crop-advisory-title ">
        <h2>Crop Advisory</h2>
      </div>
      <div className="horizontal-scroll">
        {data.map((item, index) => (
          <Card key={index} className="advisory-card">
            <Card.Body>
              <Card.Title>{item.advisoryHeading}</Card.Title>
              <Card.Text>{item.advisory}</Card.Text>
              <a href="#" className="read-more">
                Read More..
              </a>
            </Card.Body>
          </Card>
        ))}
      </div>
    </Card>
  );
};

export default CropAdvisory;
