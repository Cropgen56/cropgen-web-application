import React from "react";
import { useNavigate } from "react-router-dom";
import "../style/Pagenotfound.css";

const PageNotFound = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/");
  };

  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <h1 className="not-found-title">404</h1>
        <h2 className="not-found-subtitle">Oops! Page Not Found</h2>
        <p className="not-found-message">
          The page you are looking for might have been removed, had its name
          changed, or is temporarily unavailable.
        </p>
        <button className="go-home-button" onClick={handleGoHome}>
          Go to Homepage
        </button>
      </div>
    </div>
  );
};

export default PageNotFound;
