import React from "react";
import "./CropDetails.css";

const CropDetails = ({closeModal}) => {
  return (
    <div className="crop-details">
      <div className="crop-details-form-container mx-auto my-auto">
         <button
          onClick={closeModal}
          className="flex justify-end text-[#344e41] font-bold text-xl mb-4"
        >
          &times;
        </button>
        {/* Image Section */}
        <div className="image-section">
          <img
            src="https://via.placeholder.com/150"
            alt="Leaf"
            className="crop-image"
          />
          <img
            src="https://via.placeholder.com/150"
            alt="Leaf"
            className="crop-image"
          />
          <div className="add-more-container">
            <div className="add-more-box">
              <p className="add-more-text">
                <span className="add-more-icon">+</span>
                <p>Add More</p>
              </p>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <form className="form-content flex flex-col gap-2 text-[#344e41]">
          <div className="form-group flex justify-between items-center gap-3">
            <label htmlFor="crop-name" className="disease-details-form-label text-[#344e41] text-[#344e41] font-bold ">
              Crop Name 
            </label>
            <input
              id="crop-name"
              type="text"
              className="disease-details-form-input "
              
            />
          </div>
          <div className="form-group flex justify-between items-center gap-4">
            <label htmlFor="disease" className="disease-details-form-label text-[#344e41] font-bold ">
              Disease 
            </label>
            <input
              id="disease"
              type="text"
              className="disease-details-form-input"
            />
          </div>
          <div className="form-group flex justify-between items-center gap-3">
            <label htmlFor="treatment" className="disease-details-form-label text-[#344e41] font-bold">
              Treatment
            </label>
            <input
              id="treatment"
              type="text"
              className="disease-details-form-input"
            />
          </div>

          {/* Feedback Section */}
          <h2 className="additional-info text-[#344e41] font-bold">Tell us about Treatment</h2>
          <p className="additional-info-feedback p-0 m-0">
            Do you Like Treatment / Is it Helpful to?
          </p>
          <div className="form-radio-group my-3">
            <div className="radio-option">
              <input type="radio" id="yes" name="feedback" />
              <label htmlFor="yes" className="form-radio-label">
                Yes
              </label>
            </div>
            <div className="radio-option">
              <input type="radio" id="no" name="feedback" />
              <label htmlFor="no" className="form-radio-label">
                No
              </label>
            </div>
          </div>

          {/* Comment Box */}
          <textarea 
            rows="3"
            placeholder="Leave your comments"
            className="form-textarea "
          ></textarea>
        </form>
      </div>
    </div>
  );
};

export default CropDetails;
