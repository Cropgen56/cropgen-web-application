import React, { useState, useRef } from "react";
import imageupload from "../../../assets/image/pngimages/imageupload.png";
import CropDetials from "../cropdetails/CropDetails";

const UploadCropImage = () => {
  const [showCropModal, setShowCropModal] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log("File selected:", file.name);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="flex h-screen w-full">
      {/* Sidebar stays — already handled externally */}

      {/* Right-side content */}
      <div className="flex-1 bg-[#5a7c6b] flex items-center justify-center p-8">
        {!showCropModal ? (
          <div className="border-4 border-dotted border-white rounded-lg flex flex-col items-center justify-center w-full h-full">
            <img src={imageupload} alt="Upload" className="w-56 h-56" />
            <p className="mt-14 text-center text-white text-lg font-bold">
              Drag and Drop Files <br />
              or{" "}
              <span>
                <a
                  href="#"
                  className="text-[#00b2eb] mx-1"
                  onClick={triggerFileUpload}
                >
                  click here
                </a>
              </span>{" "}
              to select from your device
            </p>
            <button
              className="mt-3 px-20 py-2 bg-white text-[#344e41] font-semibold text-lg rounded-md"
              onClick={() => setShowCropModal(true)}
            >
              Upload
            </button>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleFileSelect}
            />
          </div>
        ) : (
          <CropDetials closeModal={() => setShowCropModal(false)} />
        )}
      </div>
    </div>
  );
};

export default UploadCropImage;
