import React, { useState, useRef } from "react";
import imageupload from "../../../assets/image/pngimages/imageupload.png";
import "./UploadCropImage.css";
import CropDetials from "../cropdetails/CropDetails";

const UploadCropImage = () => {
  const [isVisible, setIsVisible] = useState(false);
  const fileInputRef = useRef(null);

  const handleUploadClick = () => {
    setIsVisible(true);
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log("File selected:", file.name);
      // Handle the file upload process here
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current.click();
  };

  return (
    <div>
      {!isVisible ? (
        <div className="uploadScreen">
          <div className="uploadBox">
            <img src={imageupload} alt="Upload crop image placeholder" />
            <p className="uploadText">
              Drag and Drop Files <br />
              or{" "}
              <span>
                <a href="#" className="uploadLink" onClick={triggerFileUpload}>
                  click here
                </a>
              </span>{" "}
              to select from your device
            </p>
            <button className="uploadButton" onClick={handleUploadClick}>
              Upload
            </button>
          </div>
          <input
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            ref={fileInputRef}
            onChange={handleFileSelect}
          />
        </div>
      ) : (
        <CropDetials />
      )}
    </div>
  );
};

export default UploadCropImage;
