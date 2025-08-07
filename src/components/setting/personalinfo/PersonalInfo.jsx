import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import profileImage from "../../../assets/image/pngimages/profile.png";
import EditIcon from "../../../assets/edit-icon.svg";
import "./PersonalInfo.css";
import { getUserData, updateUserData } from "../../../redux/slices/authSlice";
import LoadingSpinner from "../../comman/loading/LoadingSpinner";
import { getFarmFields } from "../../../redux/slices/farmSlice";
import { message } from "antd";

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
        organization: userDetails.organization?.organizationName || "No Organization",
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

      let phone = formData.phone.replace(/\D/g, ""); 
      phone = phone.slice(-10);

      const formattedPhone = `+91${phone}`;

      const updatePayload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formattedPhone,
        // phone: `+91${formData.phone.replace(/\D/g, "")}`,
        email: formData.email,
      };
      await dispatch(
        updateUserData({ id: userId, updateData: updatePayload, token })
      ).unwrap();
      message.success("Profile updated successfully!"); 
      setUpdateStatus({
        success: true,
        message: "Profile updated successfully!",
      });
    } catch (err) {
      setUpdateStatus({
        success: false,
        message: err.message || "Failed to update profile",
      });
      message.error(err.message || "Failed to update profile");
    }
  };

  if (loading) {
    return <LoadingSpinner height="800px" size={80} color="#86D72F" />;
  }

  return (
   <div className="max-w-[1200px] w-[98%] mx-auto my-2 p-2 lg:p-4 rounded-lg bg-white shadow-md font-inter h-[98%] overflow-y-auto">

      <div className="text-left px-4 py-1 border-b border-black/40 font-bold text-[#344E41]">
        <h5>Personal Info</h5>
      </div>

      <div className="py-2 flex flex-col flex-grow gap-2">
        <div className="flex items-center gap-2 lg:gap-4 flex-row px-2 lg:px-4 pb-4 border-b border-black/40">
          <div>
            <img src={profileImage} alt="User profile" className="w-20 h-20 rounded-full object-cover" />
          </div>
          <div className="flex flex-col items-start gap-2">
            <h3 className="text-xl font-bold text-[#344E41] capitalize" >
              {userDetails?.firstName} {userDetails?.lastName}
            </h3>
            <p className="text-sm font-medium text-[#344E41] capitalize mb-0">{userDetails?.role}</p>
            <div className="flex flex-wrap gap-2 md:gap-4 lg:gap-4 text-sm text-[#344E41]">
              <p className="mb-0">Total Farms Marked: {fields?.length}</p>
              <p className="mb-0">Total Crops Added: {fields?.length}</p>
            </div>
          </div>
        </div>

        <form className="flex flex-col flex-grow gap-2" onSubmit={handleSubmit}>

          {/* {updateStatus && (
            <div
              className={`p-2 rounded text-center text-sm ${
                updateStatus.success ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
              }`}
            >
              {updateStatus.message}
            </div>
          )} */}

          <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-2 p-2">
            <div className="flex flex-col gap-3">
              <div className="flex flex-col w-full gap-1">
                <label htmlFor="firstName" className="text-[15px] text-[#344E41] text-left font-medium">First Name</label>
                <div className="relative w-full">
                  <input
                    type="text"
                    id="firstName"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="px-2 py-[0.4rem] border-1 border-[#344E41] rounded outline-none text-[15px] w-full"
                  />
                  <img src={EditIcon} alt="Edit" className="absolute right-2 top-1/2 transform -translate-y-1/2 w-[clamp(10px,1.5vw,12px)] h-[clamp(10px,1.5vw,12px)] cursor-pointer" />
                </div>
              </div>
              <div className="flex flex-col w-full gap-1">
                <label htmlFor="lastName" className="text-[15px] text-[#344E41] text-left font-medium">Last Name</label>
                <div className="relative w-full">
                  <input
                    type="text"
                    id="lastName"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="px-2 py-[0.4rem] border-1 border-[#344E41] rounded outline-none text-[15px] w-full"
                  />
                  <img src={EditIcon} alt="Edit" className="absolute right-2 top-1/2 transform -translate-y-1/2 w-[clamp(10px,1.5vw,12px)] h-[clamp(10px,1.5vw,12px)] cursor-pointer" />
                </div>
              </div>
              <div className="flex flex-col w-full gap-1">
                <label htmlFor="email" className="text-[15px] text-[#344E41] text-left font-medium">Email</label>
                <div className="relative w-full">
                  <input
                    type="email"
                    id="email"
                    placeholder="Email"
                    value={formData.email}
                    className="px-2 py-[0.4rem] border-1 border-[#344E41] rounded outline-none text-[15px] w-full"
                    readOnly
                  />
                  <img src={EditIcon} alt="Edit" className="absolute right-2 top-1/2 transform -translate-y-1/2 w-[clamp(10px,1.5vw,12px)] h-[clamp(10px,1.5vw,12px)] cursor-pointer" />
                </div>
              </div>
              <div className="flex flex-col w-full gap-1">
                <label htmlFor="phone" className="text-[15px] text-[#344E41] text-left font-medium">Phone</label>
                <div className="relative w-full">
                  <input
                    type="text"
                    id="phone"
                    placeholder="Phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="px-2 py-[0.4rem] border-1 border-[#344E41] rounded outline-none text-[15px] w-full"
                  />
                  <img src={EditIcon} alt="Edit" className="absolute right-2 top-1/2 transform -translate-y-1/2 w-[clamp(10px,1.5vw,12px)] h-[clamp(10px,1.5vw,12px)] cursor-pointer" />
                </div>
              </div>
              <div className="flex flex-col w-full gap-1">
                <label htmlFor="organization" className="text-[15px] text-[#344E41] text-left font-medium">Organization</label>
                <div className="relative w-full">
                  <input
                    type="text"
                    id="organization"
                    placeholder="No Organization"
                    value={formData.organization}
                    className="px-2 py-[0.4rem] border-1 border-[#344E41] rounded outline-none text-[15px] w-full"
                    readOnly
                  />
                  <img src={EditIcon} alt="Edit" className="absolute right-2 top-1/2 transform -translate-y-1/2 w-[clamp(10px,1.5vw,12px)] h-[clamp(10px,1.5vw,12px)] cursor-pointer" />
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col w-full gap-1">
                <label htmlFor="language" className="text-[15px] text-[#344E41] text-left font-medium">Change Language</label>
                <div className="relative w-full">
                  <select
                    id="language"
                    value={formData.language}
                    onChange={handleLanguageChange}
                    className="px-2 py-[0.4rem] border-1 border-[#344E41] rounded outline-none text-[15px] w-full" >
                    <option value="English">English</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center items-center">
            <button type="submit" className="bg-[#344E41] w-30 px-8 py-1.5 hover:bg-emerald-900 text-white font-bold text-lg rounded-md cursor-pointer transition ease-in-out duration-400">
              Save
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default PersonalInfo;
