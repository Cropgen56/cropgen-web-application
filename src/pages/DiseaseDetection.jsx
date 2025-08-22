import React from "react";
import UploadCropImage from "../components/diseasedetection/uploadcropimage/UploadCropImage";
import "../style/DiseaseDetection.css";
import Sidebardiseasedetection from "../components/diseasedetection/sidebar/Sidebardiseasedetection";
import { useNavigate } from "react-router-dom";
import img1 from "../assets/image/Group 31.png"
import { useDispatch, useSelector } from "react-redux";
import { getFarmFields } from "../redux/slices/farmSlice";



const DiseaseDetection = () => {
    const fields = useSelector((state) => state?.farmfield?.fields);
  const navigate= useNavigate();







  if (fields.length === 0) {
  return (
     <div className="flex flex-col items-center justify-center w-full h-screen bg-[#5a7c6b] text-center px-4">
  {/* Centered Background Image */}
  <img
    src={img1}
    alt="No Fields"
    className="w-[400px] h-[400px] mb-6 opacity-70"
  />

  {/* Text */}
  <h2 className="text-2xl font-semibold text-white">
    Add Farm to See the Disease Detection.
  </h2>

  {/* Optional Button */}
  <button
    onClick={() => navigate("/addfield")}
    className="mt-6 px-5 py-2 rounded-lg bg-white text-[#5a7c6b] font-medium hover:bg-gray-200 transition"
  >
    Add Field
  </button>
</div>
  );
}
  return (
    <div className="disease-detection flex flex-col md:flex-row">
      <Sidebardiseasedetection />
      <UploadCropImage />
    </div>
  );
};

export default DiseaseDetection;
