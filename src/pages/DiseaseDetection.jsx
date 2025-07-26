import React from "react";
import UploadCropImage from "../components/diseasedetection/uploadcropimage/UploadCropImage";
import "../style/DiseaseDetection.css";
import Sidebardiseasedetection from "../components/diseasedetection/sidebar/Sidebardiseasedetection";



const DiseaseDetection = () => {
  return (
    <div className="disease-detection flex flex-col md:flex-row">
      <Sidebardiseasedetection />
      <UploadCropImage />
    </div>
  );
};

export default DiseaseDetection;
