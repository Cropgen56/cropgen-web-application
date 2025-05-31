import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import profileImage from "../../../assets/image/pngimages/profile.png";
import EditIcon from "../../../assets/edit-icon.svg";
import "./PersonalInfo.css";
import { getUserData, updateUserData } from "../../../redux/slices/authSlice";
import LoadingSpinner from "../../comman/loading/LoadingSpinner";
import { getFarmFields } from "../../../redux/slices/farmSlice";

const PersonalInfo = () => {
  const dispatch = useDispatch();
  const token = localStorage.getItem("authToken");
  const userId = useSelector((state) => state?.auth?.user?.id);
  const { userDetails, loading } = useSelector((state) => state.auth);
  const fields = useSelector((state) => state?.farmfield?.fields);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  const [updateStatus, setUpdateStatus] = useState(null);

  // Initialize form data with user details
  useEffect(() => {
    if (userDetails) {
      setFormData({
        firstName: userDetails.firstName || "",
        lastName: userDetails.lastName || "",
        email: userDetails.email || "",
        phone: userDetails.phone || "",
      });
    }
  }, [userDetails]);

  // Reset update status after a short delay
  useEffect(() => {
    if (updateStatus) {
      const timer = setTimeout(() => setUpdateStatus(null), 1000);
      return () => clearTimeout(timer);
    }
  }, [updateStatus]);

  // Fetch user data when token changes or on initial load
  useEffect(() => {
    if (token) {
      dispatch(getUserData(token));
    }
  }, [token, dispatch, updateStatus]);

  // Fetch farm fields when userId changes
  useEffect(() => {
    if (userId) {
      dispatch(getFarmFields(userId));
    }
  }, [dispatch, userId]);

  // Handle input changes for form fields
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  // Handle language change
  const handleLanguageChange = (e) => {
    setFormData((prev) => ({ ...prev, language: e.target.value }));
  };

  // Handle form submission to update user data
  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdateStatus(null);
    try {
      const updatePayload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        email: formData.email,
      };
      await dispatch(
        updateUserData({ id: userId, updateData: updatePayload, token })
      ).unwrap();
      setUpdateStatus({
        success: true,
        message: "Profile updated successfully!",
      });
    } catch (err) {
      setUpdateStatus({
        success: false,
        message: err.message || "Failed to update profile",
      });
    }
  };

  if (loading) {
    return <LoadingSpinner height="800px" size={80} color="#86D72F" />;
  }

  return (
    <div className="personal-info-container">
      <div className="personal-info-header">
        <h2>Personal Info</h2>
      </div>
      <div className="personal-info-content">
        <div className="profile-section">
          <div className="profile-image-container">
            <img src={profileImage} alt="User profile" />
          </div>
          <div className="profile-details">
            <h3>
              {userDetails?.firstName} {userDetails?.lastName}
            </h3>
            <p className="role">{userDetails?.role}</p>
            <div className="stats">
              <p>Total Farms Marked: {fields?.length}</p>
              <p>Total Crops Added: {fields?.length}</p>
            </div>
          </div>
        </div>
        <form className="personal-info-form" onSubmit={handleSubmit}>
          {updateStatus && (
            <div
              className={`update-message ${
                updateStatus.success ? "success" : "error"
              }`}
            >
              {updateStatus.message}
            </div>
          )}
          <div className="form-layout">
            <div className="form-column">
              <div className="form-group">
                <label htmlFor="firstName">First Name</label>
                <div className="input-with-icon">
                  <input
                    type="text"
                    id="firstName"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={handleInputChange}
                  />
                  <img src={EditIcon} alt="Edit" className="edit-icon" />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="lastName">Last Name</label>
                <div className="input-with-icon">
                  <input
                    type="text"
                    id="lastName"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={handleInputChange}
                  />
                  <img src={EditIcon} alt="Edit" className="edit-icon" />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <div className="input-with-icon">
                  <input
                    type="email"
                    id="email"
                    placeholder="Email"
                    value={formData.email}
                    readOnly
                  />
                  <img src={EditIcon} alt="Edit" className="edit-icon" />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="phone">Phone</label>
                <div className="input-with-icon">
                  <input
                    type="text"
                    id="phone"
                    placeholder="Phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                  <img src={EditIcon} alt="Edit" className="edit-icon" />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="organization">Organization</label>
                <div className="input-with-icon">
                  <input
                    type="text"
                    id="organization"
                    placeholder="No Organization"
                    value={formData.organization}
                    readOnly
                  />
                  <img src={EditIcon} alt="Edit" className="edit-icon" />
                </div>
              </div>
            </div>
            <div className="form-column">
              <div className="form-group">
                <label htmlFor="language">Change Language</label>
                <div className="input-with-icon">
                  <select
                    id="language"
                    value={formData.language}
                    onChange={handleLanguageChange}
                  >
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
