import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import profileImage from "../../../assets/image/pngimages/profile.png";
import EditIcon from "../../../assets/edit-icon.svg";
import {
  getUserProfileData,
  updateUserData,
  uploadAvatar,
} from "../../../redux/slices/authSlice";
import { getFarmFields } from "../../../redux/slices/farmSlice";
import { message } from "antd";
import PersonalInfoSkeleton from "../../Skeleton/PersonalInfoSkeleton";
import { ArrowLeft, Camera, Loader2, Pencil, X, Save } from "lucide-react";

const S3_BUCKET_URL =
  process.env.REACT_APP_S3_BUCKET_URL ||
  "https://your-bucket-name.s3.amazonaws.com";

const PersonalInfo = ({ setShowSidebar }) => {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);
  const profileStatus = useSelector((state) => state.auth.profileStatus);
  const userId = useSelector((state) => state?.auth?.user?.id);
  const { userProfile, loading, avatarUploading, avatarUploadProgress } =
    useSelector((state) => state.auth);
  const fields = useSelector((state) => state?.farmfield?.fields);

  // File input ref
  const fileInputRef = useRef(null);

  // Avatar states
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    organization: "",
    language: "English",
  });

  // Store original data to restore on cancel
  const [originalData, setOriginalData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    organization: "",
    language: "English",
  });

  const [updateStatus, setUpdateStatus] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize form data with user profile details
  useEffect(() => {
    if (userProfile) {
      const profileData = {
        firstName: userProfile.firstName || "",
        lastName: userProfile.lastName || "",
        email: userProfile.email || "",
        phone: userProfile.phone || "",
        organization:
          userProfile.organization?.organizationName || "No Organization",
        language: "English",
      };
      setFormData(profileData);
      setOriginalData(profileData);
      // Reset preview when userProfile changes
      setPreviewUrl(null);
    }
  }, [userProfile]);

  // Reset update status after a short delay
  useEffect(() => {
    if (updateStatus) {
      const timer = setTimeout(() => setUpdateStatus(null), 1000);
      return () => clearTimeout(timer);
    }
  }, [updateStatus]);

  // Fetch user profile data when token changes or on initial load
  useEffect(() => {
    if (token && profileStatus === "idle" && !userProfile) {
      dispatch(getUserProfileData(token));
    }
  }, [token, profileStatus, userProfile, dispatch]);

  // Fetch farm fields when userId changes
  useEffect(() => {
    if (userId) {
      dispatch(getFarmFields(userId));
    }
  }, [dispatch, userId]);

  // Handle avatar click to trigger file input
  const handleAvatarClick = () => {
    if (!avatarUploading) {
      fileInputRef.current?.click();
    }
  };

  // Handle file selection for avatar upload
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      message.error(
        "Please select a valid image file (JPEG, PNG, GIF, or WebP)"
      );
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      message.error("Image size should be less than 5MB");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload avatar
    try {
      setUploadProgress(0);
      await dispatch(
        uploadAvatar({
          file,
          onProgress: (progress) => setUploadProgress(progress),
        })
      ).unwrap();

      message.success("Profile photo updated successfully!");

      // Refresh user profile to get updated avatar URL
      dispatch(getUserProfileData(token));
    } catch (error) {
      setPreviewUrl(null);
      setUploadProgress(0);
      message.error(error || "Failed to upload avatar");
    }

    // Reset file input
    e.target.value = "";
  };

  // Handle input changes for form fields
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  // Handle language change
  const handleLanguageChange = (e) => {
    setFormData((prev) => ({ ...prev, language: e.target.value }));
  };

  // Enable edit mode
  const handleEnableEdit = () => {
    setOriginalData({ ...formData });
    setIsEditing(true);
  };

  // Cancel edit mode and restore original data
  const handleCancelEdit = () => {
    setFormData({ ...originalData });
    setIsEditing(false);
  };

  // Handle form submission to update user data
  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdateStatus(null);
    setIsSaving(true);

    try {
      let phone = formData.phone.replace(/\D/g, "");
      phone = phone.slice(-10);
      const formattedPhone = `+91${phone}`;

      const updatePayload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formattedPhone,
        email: formData.email,
      };

      await dispatch(
        updateUserData({ id: userId, updateData: updatePayload, token })
      ).unwrap();

      // Refresh user profile data after successful update
      dispatch(getUserProfileData(token));

      message.success("Profile updated successfully!");
      setUpdateStatus({
        success: true,
        message: "Profile updated successfully!",
      });

      // Exit edit mode after successful save
      setIsEditing(false);
    } catch (err) {
      setUpdateStatus({
        success: false,
        message: err.message || "Failed to update profile",
      });
      message.error(err.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  // Get the avatar URL to display
  const getAvatarUrl = () => {
    if (previewUrl) return previewUrl;
    if (userProfile?.avatar) {
      // If avatar is already a full URL, use it directly
      if (userProfile.avatar.startsWith("http")) {
        return userProfile.avatar;
      }
      // Construct S3 URL from the key
      return `${S3_BUCKET_URL}/${userProfile.avatar}`;
    }
    return profileImage;
  };

  if (loading || profileStatus === "loading") {
    return <PersonalInfoSkeleton />;
  }

  return (
    <div className="max-w-[1200px] w-[98%] mx-auto my-2 p-2 lg:p-4 rounded-lg bg-white shadow-md font-inter h-[98%] overflow-y-auto">
      <div className="flex items-center justify-between text-left px-4 py-1 border-b border-black/40 text-[#344E41]">
        <h5 className="font-bold">Personal Info</h5>
        <button
          onClick={() => setShowSidebar(true)}
          className="flex items-center gap-1 text-sm text-[#344E41] hover:text-[#1d3039] transition-all duration-300 ease-in-out cursor-pointer"
        >
          <ArrowLeft size={18} />
          Back to Settings
        </button>
      </div>

      <div className="py-2 flex flex-col flex-grow gap-2">
        <div className="flex items-center gap-2 lg:gap-4 flex-row px-2 lg:px-4 pb-4 border-b border-black/40">
          {/* Avatar Section with Upload */}
          <div className="relative group">
            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              accept="image/jpeg,image/png,image/gif,image/webp"
              className="hidden"
            />

            {/* Avatar container */}
            <div
              onClick={handleAvatarClick}
              className={`relative w-20 h-20 rounded-full overflow-hidden border-2 border-[#344E41] group-hover:border-[#588157] transition-all duration-300 ${avatarUploading ? "cursor-wait" : "cursor-pointer"
                }`}
            >
              {avatarUploading ? (
                // Upload progress indicator
                <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100">
                  <Loader2 className="w-6 h-6 animate-spin text-[#344E41]" />
                  <span className="text-xs text-[#344E41] mt-1">
                    {uploadProgress}%
                  </span>
                </div>
              ) : (
                <>
                  <img
                    src={getAvatarUrl()}
                    alt="User profile"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = profileImage;
                    }}
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                </>
              )}
            </div>

            {/* Edit badge */}
            <button
              onClick={handleAvatarClick}
              disabled={avatarUploading}
              className="absolute bottom-0 right-0 w-6 h-6 bg-white rounded-full border-2 border-[#344E41] flex items-center justify-center shadow-md hover:bg-gray-100 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Camera className="w-3 h-3 text-[#344E41]" />
            </button>
          </div>

          <div className="flex flex-col items-start gap-2">
            <h3 className="text-xl font-bold text-[#344E41] capitalize">
              {userProfile?.firstName} {userProfile?.lastName}
            </h3>
            <p className="text-sm font-medium text-[#344E41] capitalize mb-0">
              {userProfile?.role}
            </p>
            <div className="flex flex-wrap gap-2 md:gap-4 lg:gap-4 text-sm text-[#344E41]">
              <p className="mb-0">Total Farms Marked: {fields?.length || 0}</p>
              <p className="mb-0">Total Crops Added: {fields?.length || 0}</p>
            </div>
          </div>
        </div>

        <form className="flex flex-col flex-grow gap-2" onSubmit={handleSubmit}>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-2 p-2">
            <div className="flex flex-col gap-3">
              <div className="flex flex-col w-full gap-1">
                <label
                  htmlFor="firstName"
                  className="text-[15px] text-[#344E41] text-left font-medium"
                >
                  First Name
                </label>
                <div className="relative w-full">
                  <input
                    type="text"
                    id="firstName"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`px-2 py-[0.4rem] border-1 border-[#344E41] rounded outline-none text-[15px] w-full transition-all duration-300 ${!isEditing
                        ? "bg-gray-50 cursor-not-allowed text-gray-600"
                        : "bg-white cursor-text"
                      }`}
                  />
                  <img
                    src={EditIcon}
                    alt="Edit"
                    className={`absolute right-2 top-1/2 transform -translate-y-1/2 w-[clamp(10px,1.5vw,12px)] h-[clamp(10px,1.5vw,12px)] ${!isEditing ? "opacity-30" : "opacity-100 cursor-pointer"
                      }`}
                  />
                </div>
              </div>
              <div className="flex flex-col w-full gap-1">
                <label
                  htmlFor="lastName"
                  className="text-[15px] text-[#344E41] text-left font-medium"
                >
                  Last Name
                </label>
                <div className="relative w-full">
                  <input
                    type="text"
                    id="lastName"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`px-2 py-[0.4rem] border-1 border-[#344E41] rounded outline-none text-[15px] w-full transition-all duration-300 ${!isEditing
                        ? "bg-gray-50 cursor-not-allowed text-gray-600"
                        : "bg-white cursor-text"
                      }`}
                  />
                  <img
                    src={EditIcon}
                    alt="Edit"
                    className={`absolute right-2 top-1/2 transform -translate-y-1/2 w-[clamp(10px,1.5vw,12px)] h-[clamp(10px,1.5vw,12px)] ${!isEditing ? "opacity-30" : "opacity-100 cursor-pointer"
                      }`}
                  />
                </div>
              </div>
              <div className="flex flex-col w-full gap-1">
                <label
                  htmlFor="email"
                  className="text-[15px] text-[#344E41] text-left font-medium"
                >
                  Email
                </label>
                <div className="relative w-full">
                  <input
                    type="email"
                    id="email"
                    placeholder="Email"
                    value={formData.email}
                    className="px-2 py-[0.4rem] border-1 border-[#344E41] rounded outline-none text-[15px] w-full bg-gray-50 cursor-not-allowed text-gray-600"
                    readOnly
                    disabled
                  />
                  <img
                    src={EditIcon}
                    alt="Edit"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 w-[clamp(10px,1.5vw,12px)] h-[clamp(10px,1.5vw,12px)] opacity-30"
                  />
                </div>
              </div>
              <div className="flex flex-col w-full gap-1">
                <label
                  htmlFor="phone"
                  className="text-[15px] text-[#344E41] text-left font-medium"
                >
                  Phone
                </label>
                <div className="relative w-full">
                  <input
                    type="text"
                    id="phone"
                    placeholder="Phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`px-2 py-[0.4rem] border-1 border-[#344E41] rounded outline-none text-[15px] w-full transition-all duration-300 ${!isEditing
                        ? "bg-gray-50 cursor-not-allowed text-gray-600"
                        : "bg-white cursor-text"
                      }`}
                  />
                  <img
                    src={EditIcon}
                    alt="Edit"
                    className={`absolute right-2 top-1/2 transform -translate-y-1/2 w-[clamp(10px,1.5vw,12px)] h-[clamp(10px,1.5vw,12px)] ${!isEditing ? "opacity-30" : "opacity-100 cursor-pointer"
                      }`}
                  />
                </div>
              </div>
              <div className="flex flex-col w-full gap-1">
                <label
                  htmlFor="organization"
                  className="text-[15px] text-[#344E41] text-left font-medium"
                >
                  Organization
                </label>
                <div className="relative w-full">
                  <input
                    type="text"
                    id="organization"
                    placeholder="No Organization"
                    value={formData.organization}
                    className="px-2 py-[0.4rem] border-1 border-[#344E41] rounded outline-none text-[15px] w-full bg-gray-50 cursor-not-allowed text-gray-600"
                    readOnly
                    disabled
                  />
                  <img
                    src={EditIcon}
                    alt="Edit"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 w-[clamp(10px,1.5vw,12px)] h-[clamp(10px,1.5vw,12px)] opacity-30"
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col w-full gap-1">
                <label
                  htmlFor="language"
                  className="text-[15px] text-[#344E41] text-left font-medium"
                >
                  Change Language
                </label>
                <div className="relative w-full">
                  <select
                    id="language"
                    value={formData.language}
                    onChange={handleLanguageChange}
                    disabled={!isEditing}
                    className={`px-2 py-[0.4rem] border-1 border-[#344E41] rounded outline-none text-[15px] w-full transition-all duration-300 ${!isEditing
                        ? "bg-gray-50 cursor-not-allowed text-gray-600"
                        : "bg-white cursor-pointer"
                      }`}
                  >
                    <option value="English">English</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                  </select>
                </div>
              </div>
            </div>
          </div>


          <div className="flex justify-center items-center gap-4 mt-4">
            {!isEditing ? (
       
              <button
                type="button"
                onClick={handleEnableEdit}
                className="flex items-center gap-2 bg-[#344E41] px-6 py-2 hover:bg-emerald-900 text-white font-semibold text-base rounded-md cursor-pointer transition ease-in-out duration-300"
              >
                <Pencil size={18} />
                Edit Your Details
              </button>
            ) : (
   
              <>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                  className="flex items-center gap-2 bg-gray-200 px-6 py-2 hover:bg-gray-300 text-gray-700 font-semibold text-base rounded-md cursor-pointer transition ease-in-out duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X size={18} />
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 bg-[#344E41] px-6 py-2 hover:bg-emerald-900 text-white font-semibold text-base rounded-md cursor-pointer transition ease-in-out duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Save Changes
                    </>
                  )}
                </button>
              </>
            )}
          </div>

      
          {isEditing && (
            <div className="flex justify-center mt-2">
              <span className="text-sm text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                You are in edit mode. Make your changes and click "Save Changes".
              </span>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default PersonalInfo;