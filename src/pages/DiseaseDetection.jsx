import React from "react";
import UploadCropImage from "../components/diseasedetection/uploadcropimage/UploadCropImage";
import "../style/DiseaseDetection.css";
const DiseaseDetection = () => {
  return (
    <div className="disease-detection">
      <UploadCropImage />
    </div>
  );
};

export default DiseaseDetection;
