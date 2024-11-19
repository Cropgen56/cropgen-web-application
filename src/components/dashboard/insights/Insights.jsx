import React from "react";
import "./Insights.css";
import Card from "react-bootstrap/Card";
import { FcCheckmark } from "react-icons/fc";
import { FaXmark } from "react-icons/fa6";

const Insight = ({ icon, title, description, actions }) => {
  return (
    <div className="insight-container ">
      <div className="insight-icon">{icon}</div>
      <div className="insight-details col-5">
        <div className="insight-title">{title}</div>
        <div className="insight-description">{description}</div>
      </div>
      <div className="insight-actions">
        {/* {actions.map((action, index) => (
          <button
            key={index}
            className={`action-button ${action.active ? "active" : ""}`}
          >
            {action.label}
          </button>
        ))} */}
        <button className="action-button d-flex align-items-center justify-content-center">
          <FcCheckmark />
        </button>
        <button className="action-button">
          <FaXmark color="red" />
        </button>
      </div>
    </div>
  );
};

const Insights = () => {
  // insights from the backend
  const insights = [
    {
      icon: <div className="icon-stress" />,
      title: "Stress is building up!",
      description:
        "4 hours of -80 stress was measured. Rain is not forecasted for the next 3 days.",
      actions: [
        { label: "X", active: true },
        { label: "X", active: false },
      ],
    },
    {
      icon: <div className="icon-shallow-irrigation" />,
      title: "Shallow irrigation detected in the 7 days",
      description: "We detected an anomaly with stress and low temperature.",
      actions: [
        { label: "x", active: true },
        { label: "X", active: false },
      ],
    },
    {
      icon: <div className="icon-add-irrigation" />,
      title: "You should add 1mm to your irrigation",
      description: "We detected an anomaly with stress and low temperature.",
      actions: [
        { label: "X", active: true },
        { label: "X", active: false },
      ],
    },
  ];

  return (
    <Card body className="mt-4 mb-5 forecast shadow">
      <div className="d-flex flex-direction-row justify-content-between">
        <div className="insights-titel">Insights</div>
        <div className="insight-action-title">Action</div>
        <div className="insight-see-all">See all</div>
      </div>
      <div className="insights-container ">
        {insights.map((insight, index) => (
          <Insight key={index} {...insight} />
        ))}
      </div>
    </Card>
  );
};

export default Insights;