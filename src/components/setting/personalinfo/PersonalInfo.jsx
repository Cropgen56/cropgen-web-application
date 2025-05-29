import React from "react";
import profileImage from "../../../assets/image/pngimages/profile.png";
import EditIcon from "../../../assets/edit-icon.svg";
import "./PersonalInfo.css";
import { useSelector } from "react-redux";
import { decodeJWT } from "../../../utility/decodetoken";

const PersonalInfo = () => {
  return (
    <div className="personal-info-container">
      <div className="personal-info-header">
        <h2>Personal Info</h2>
      </div>
      <div className="personal-info-content">
        <div className="profile-section">
          <div className="profile-image-container">
            <img src={profileImage} alt="User profile" />
            {/* <img
              src={EditIcon}
              alt="Edit profile"
              className="edit-profile-icon"
            /> */}
          </div>
          <div className="profile-details">
            <h3>Mark Wood</h3>
            <p className="role">Farmer</p>
            <div className="stats">
              <p>Total Farms Marked: 10</p>
              <p>Total Crops Added: 11</p>
            </div>
          </div>
        </div>
        <form className="personal-info-form">
          <div className="form-layout">
            {/* Left Column */}
            <div className="form-column">
              <div className="form-group">
                <label htmlFor="firstName">First Name</label>
                <div className="input-with-icon">
                  <input type="text" id="firstName" placeholder="Mark" />
                  <img src={EditIcon} alt="Edit" className="edit-icon" />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="lastName">Last Name</label>
                <div className="input-with-icon">
                  <input type="text" id="lastName" placeholder="Wood" />
                  <img src={EditIcon} alt="Edit" className="edit-icon" />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <div className="input-with-icon">
                  <input
                    type="email"
                    id="email"
                    placeholder="mark.wood@example.com"
                  />
                  <img src={EditIcon} alt="Edit" className="edit-icon" />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="phoneNumber">Phone Number</label>
                <div className="input-with-icon">
                  <input
                    type="text"
                    id="phoneNumber"
                    placeholder="+1234567890"
                  />
                  <img src={EditIcon} alt="Edit" className="edit-icon" />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="changePassword">Update Password</label>
                <div className="input-with-icon">
                  <input
                    type="password"
                    id="changePassword"
                    placeholder="********"
                  />
                  <img src={EditIcon} alt="Edit" className="edit-icon" />
                </div>
              </div>
            </div>
            {/* Right Column */}
            <div className="form-column">
              <div className="form-group">
                <label htmlFor="language">Change Language</label>
                <div className="input-with-icon">
                  <select id="language">
                    <option value="English">English</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                  </select>
                </div>
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
