import React from "react";
import PropTypes from "prop-types";
import "./LoadingSpinner.css";

const LoadingSpinner = ({
  height = "200px",
  size = 64,
  color = "#86D72F",
  blurBackground = false,
}) => {
  return (
    <div
      className="d-flex align-items-center justify-content-center position-relative"
      style={{ height }}
    >
      {blurBackground && <div className="spinner-backdrop"></div>}
      <div
        className="dual-ring-spinner"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          "--spinner-size": `${size}px`,
          "--spinner-color": color,
          zIndex: 1020,
        }}
      ></div>
    </div>
  );
};

LoadingSpinner.propTypes = {
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  size: PropTypes.number,
  color: PropTypes.string,
  blurBackground: PropTypes.bool,
};

export default LoadingSpinner;
