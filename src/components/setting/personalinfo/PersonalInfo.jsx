import React from "react";
import profileImage from "../../../assets/image/pngimages/profile.png";
import "./PersonalInfo.css";

const PersonalInfo = () => {
  return (
    <div className="personal-info-container">
      <div className="personal-info-header">
        <h2>Personal Info</h2>
      </div>
      <div className="personal-info-content px-4 py-1">
        <div className="profile-image-container">
          <img src={profileImage} alt="User profile" />
        </div>
        <form className="personal-info-form">
          <div className="form-layout">
            {/* Left Column */}
            <div className="form-column">
              <div className="form-group">
                <label htmlFor="firstName">First Name</label>
                <input type="text" id="firstName" />
              </div>
              <div className="form-group">
                <label htmlFor="lastName">Last Name</label>
                <input type="text" id="lastName" />
              </div>
              <div className="form-group ">
                <label htmlFor="email">Email</label>
                <input type="email" id="email" />
              </div>
              <div className="form-group">
                <label htmlFor="phoneNumber">Phone Number</label>
                <input type="text" id="phoneNumber" />
              </div>
              <div className="form-group">
                <label htmlFor="changePassword">Change Password</label>
                <input type="password" id="changePassword" />
              </div>
            </div>
            {/* Right Column */}
            <div className="form-column ms-5">
              <div className="form-group">
                <label htmlFor="language">Language</label>
                <input type="text" id="language" />
              </div>
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="save-button">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PersonalInfo;
