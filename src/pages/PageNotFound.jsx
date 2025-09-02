import React from "react";
import { useNavigate } from "react-router-dom";

const PageNotFound = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/");
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-[#e8f5e9] to-[#c8e6c9] text-[#333]">
      <div className="text-center max-w-[600px] p-5 bg-white shadow-md rounded-[10px]">
        <h1 className="text--6rem font-bold text-[#388e3c] m-0">404</h1>
        <h2 className="text-2xl my-2 text-[#2e7d32]">Oops! Page Not Found</h2>
        <p className="text-lg my-5 text-[#6a9955]">
          The page you are looking for might have been removed, had its name
          changed, or is temporarily unavailable.
        </p>
        <button
          onClick={handleGoHome}
          className="bg-[#43a047] text-white px-5 py-2 text-base rounded-md cursor-pointer transition-colors duration-300 ease-in-out hover:bg-[#2e7d32] focus:outline-none"
        >
          Go to Homepage
        </button>
      </div>
    </div>
  );
};

export default PageNotFound;
