import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import profileImage from "../../../assets/image/pngimages/profile.png";
import {
  getUserProfileData,
  updateUserData,
  uploadAvatar,
} from "../../../redux/slices/authSlice";
import { getFarmFields } from "../../../redux/slices/farmSlice";
import { message } from "antd";
import PersonalInfoSkeleton from "../../Skeleton/PersonalInfoSkeleton";
import {
  ArrowLeft,
  Camera,
  Loader2,
  Pencil,
  X,
  Save,
  Home,
  Sprout,
  User,
  Mail,
  Phone,
  Building2,
} from "lucide-react";

const S3_BUCKET_URL =
  process.env.REACT_APP_S3_BUCKET_URL ||
  "https://your-bucket-name.s3.amazonaws.com";

const PersonalInfo = ({ setShowSidebar }) => {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);
  const profileStatus = useSelector((state) => state.auth.profileStatus);
  const userId = useSelector((state) => state?.auth?.user?.id);
  const { userProfile, loading, avatarUploading } =
    useSelector((state) => state.auth);
  const fields = useSelector((state) => state?.farmfield?.fields);

  const fileInputRef = useRef(null);

  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    organization: "",
  });

  const [originalData, setOriginalData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    organization: "",
  });

  const [updateStatus, setUpdateStatus] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (userProfile) {
      const profileData = {
        firstName: userProfile.firstName || "",
        lastName: userProfile.lastName || "",
        email: userProfile.email || "",
        phone: userProfile.phone || "",
        organization:
          userProfile.organization?.organizationName || "No Organization",
      };
      setFormData(profileData);
      setOriginalData(profileData);
      setPreviewUrl(null);
    }
  }, [userProfile]);

  useEffect(() => {
    if (updateStatus) {
      const timer = setTimeout(() => setUpdateStatus(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [updateStatus]);

  useEffect(() => {
    if (token && profileStatus === "idle" && !userProfile) {
      dispatch(getUserProfileData());
    }
  }, [token, profileStatus, userProfile, dispatch]);

  useEffect(() => {
    if (userId) {
      dispatch(getFarmFields(userId));
    }
  }, [dispatch, userId]);

  const handleAvatarClick = () => {
    if (!avatarUploading) {
      fileInputRef.current?.click();
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      message.error(
        "Please select a valid image file (JPEG, PNG, GIF, or WebP)"
      );
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      message.error("Image size should be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);

    try {
      setUploadProgress(0);
      await dispatch(
        uploadAvatar({
          file,
          onProgress: (progress) => setUploadProgress(progress),
        })
      ).unwrap();

      message.success("Profile photo updated successfully!");
      dispatch(getUserProfileData());
    } catch (error) {
      setPreviewUrl(null);
      setUploadProgress(0);
      message.error(error || "Failed to upload avatar");
    }

    e.target.value = "";
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleEnableEdit = () => {
    setOriginalData({ ...formData });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setFormData({ ...originalData });
    setIsEditing(false);
  };

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
        updateUserData({ id: userId, updateData: updatePayload })
      ).unwrap();

      dispatch(getUserProfileData());

      message.success("Profile updated successfully!");
      setUpdateStatus({
        success: true,
        message: "Profile updated successfully!",
      });

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

  const getAvatarUrl = () => {
    if (previewUrl) return previewUrl;
    if (userProfile?.avatar) {
      if (userProfile.avatar.startsWith("http")) {
        return userProfile.avatar;
      }
      return `${S3_BUCKET_URL}/${userProfile.avatar}`;
    }
    return profileImage;
  };

  const StatCard = ({ icon: Icon, value, label }) => (
    <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30">
      <Icon className="w-5 h-5 text-white" />
      <div>
        <p className="text-lg font-bold text-white leading-tight">{value}</p>
        <p className="text-xs text-white/80">{label}</p>
      </div>
    </div>
  );

  const InputField = ({
    id,
    label,
    type = "text",
    value,
    onChange,
    disabled = false,
    readOnly = false,
    placeholder,
    icon: Icon,
  }) => {
    const isEditable = isEditing && !readOnly;

    return (
      <div className="group">
        <label
          htmlFor={id}
          className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5"
        >
          {label}
        </label>
        <div className="relative">
          {Icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#344E41] transition-colors">
              <Icon className="w-4 h-4" />
            </div>
          )}
          <input
            type={type}
            id={id}
            placeholder={placeholder || label}
            value={value}
            onChange={onChange}
            disabled={disabled || !isEditable}
            readOnly={readOnly}
            className={`w-full rounded-xl border-2 py-3 transition-all duration-200 outline-none text-[15px] ${
              Icon ? "pl-10 pr-4" : "px-4"
            } ${
              readOnly || !isEditing
                ? "bg-gray-50 border-gray-200 text-gray-600 cursor-not-allowed"
                : "bg-white border-gray-200 hover:border-[#344E41]/40 focus:border-[#344E41] focus:ring-2 focus:ring-[#344E41]/20"
            }`}
          />
        </div>
      </div>
    );
  };

  if (loading || profileStatus === "loading") {
    return <PersonalInfoSkeleton />;
  }

  return (
    <div className="max-w-[1200px] w-[98%] mx-auto my-2 p-2 px-4 lg:p-4 rounded-lg bg-white shadow-md font-inter min-h-[98%] overflow-y-auto">
      {/* Header - aligned with Farm Settings, Pricing, Profile */}
      <div className="px-4 py-2 text-[#344E41] border-b border-black/40">
        <div className="flex items-center justify-between">
          <h5 className="text-[18px] font-bold text-[#344E41]">Personal Info</h5>
          <button
            onClick={() => setShowSidebar(true)}
            className="flex items-center gap-1 text-xs text-[#344E41] hover:text-[#1d3039] transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Settings
          </button>
        </div>
        <p className="mt-1 mb-0.5 text-[#344E41] font-medium text-sm leading-[100%]">
          Manage your profile details and preferences
        </p>
      </div>

      <div className="px-4 py-6 lg:px-6 space-y-8 overflow-y-auto">
        {/* Profile hero card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#344E41] via-[#3d5a4a] to-[#2d4339] shadow-xl">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

          <div className="relative px-6 lg:px-8 py-8 lg:py-10">
            <div className="flex flex-col sm:flex-row items-center gap-6 lg:gap-8">
              {/* Avatar */}
              <div className="relative shrink-0">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarChange}
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={handleAvatarClick}
                  disabled={avatarUploading}
                  className="relative block w-24 h-24 lg:w-28 lg:h-28 rounded-2xl overflow-hidden ring-4 ring-white/30 shadow-2xl hover:ring-white/50 focus:outline-none focus:ring-4 focus:ring-white/50 transition-all disabled:opacity-70 disabled:cursor-wait"
                >
                  {avatarUploading ? (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-white/10">
                      <Loader2 className="w-8 h-8 animate-spin text-white" />
                      <span className="text-xs text-white/90 mt-1 font-medium">
                        {uploadProgress}%
                      </span>
                    </div>
                  ) : (
                    <>
                      <img
                        src={getAvatarUrl()}
                        alt="Profile"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = profileImage;
                        }}
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Camera className="w-8 h-8 text-white" />
                      </div>
                    </>
                  )}
                </button>
                <div className="absolute -bottom-1 -right-1 w-9 h-9 bg-white rounded-lg shadow-lg flex items-center justify-center border-2 border-[#344E41]">
                  <Camera className="w-4 h-4 text-[#344E41]" />
                </div>
              </div>

              {/* Name & stats */}
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
                  {userProfile?.firstName} {userProfile?.lastName}
                </h2>
                <p className="mt-1 text-white/90 font-medium capitalize">
                  {userProfile?.role}
                </p>
                <div className="flex flex-wrap gap-3 mt-4 justify-center sm:justify-start">
                  <StatCard
                    icon={Home}
                    value={fields?.length || 0}
                    label="Farms"
                  />
                  <StatCard
                    icon={Sprout}
                    value={fields?.length || 0}
                    label="Crops"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 lg:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                id="firstName"
                label="First Name"
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="First Name"
                icon={User}
              />
              <InputField
                id="lastName"
                label="Last Name"
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder="Last Name"
                icon={User}
              />
              <InputField
                id="email"
                label="Email"
                type="email"
                value={formData.email}
                readOnly
                placeholder="Email"
                icon={Mail}
              />
              <InputField
                id="phone"
                label="Phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+91 9876543210"
                icon={Phone}
              />
              <div className="md:col-span-2">
                <InputField
                  id="organization"
                  label="Organization"
                  value={formData.organization}
                  readOnly
                  placeholder="No Organization"
                  icon={Building2}
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-center gap-4">
              {!isEditing ? (
                <button
                  type="button"
                  onClick={handleEnableEdit}
                  className="flex items-center gap-2 px-6 py-3 bg-[#344E41] hover:bg-[#2d4339] text-white font-semibold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#344E41] focus:ring-offset-2"
                >
                  <Pencil className="w-4 h-4" />
                  Edit Your Details
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex items-center gap-2 px-6 py-3 bg-[#344E41] hover:bg-[#2d4339] text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#344E41] focus:ring-offset-2"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Changes
                      </>
                    )}
                  </button>
                </>
              )}
            </div>

            {isEditing && (
              <div className="mt-4 text-center">
                <span className="inline-flex items-center gap-2 text-sm text-amber-700 bg-amber-50 px-4 py-2 rounded-xl border border-amber-200">
                  You're in edit mode — make your changes and click Save.
                </span>
              </div>
            )}

            {updateStatus?.success && (
              <div className="mt-4 text-center">
                <span className="inline-flex items-center gap-2 text-sm text-green-700 bg-green-50 px-4 py-2 rounded-xl border border-green-200">
                  ✓ {updateStatus.message}
                </span>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfo;
