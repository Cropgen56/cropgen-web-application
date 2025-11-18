// src/components/PdfHeader/PdfHeader.jsx (Example Path)

import React from "react";
// Assuming this path is correct relative to the PdfHeader component's location

import logo from "../../../assets/image/login/logo.svg"; 

const PdfHeader = () => {
  return (
    <div 
      className="pdf-report-header"
      style={{
        width: "100%",
        marginBottom: "10px", // Spacing before the report content starts
        padding: "10px 0",
        boxSizing: "border-box",
        backgroundColor: "#ffffff", // Ensure white background for PDF
      }}
    >
      <div 
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: "5px",
        }}
      >
        {/* Logo (Adjust width/height as needed) */}
        <img
          src={logo}
          alt="CROPGEN Logo"
          // Crucial for html2canvas to include it correctly
          crossOrigin="anonymous" 
          style={{
            height: "25px", // Example size
            width: "25px",  // Example size
            marginRight: "8px",
          }}
        />
        
        {/* CROPGEN Text */}
        <span 
          style={{
            color: "#000000",
            fontSize: "18px",
            fontWeight: "bold",
            lineHeight: "25px",
            marginRight: "15px",
          }}
        >
          CROPGEN
        </span>

        {/* Horizontal Line */}
        <div 
          style={{
            flexGrow: 1, // Line takes remaining space
            height: "3px",
            backgroundColor: "#86D72F", // The requested color
          }}
        ></div>
      </div>
    </div>
  );
};

export default PdfHeader;