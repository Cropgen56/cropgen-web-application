import React from "react";
import { Logo } from "../../../assets/Icons";
import "./Loading.css";

const Loading = () => {
  return (
    <div className="loading-container">
      <div className="loading-content">
        <Logo />
        <h5 className="loading-text">Loading...</h5>
      </div>
    </div>
  );
};

export default Loading;
