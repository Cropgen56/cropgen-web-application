import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { DEFAULT_PROFILE_IMAGE_URL } from "../../../config/brand";
import { S3_BUCKET_URL } from "../../../config/envUrls";
import {
  getUserProfileData,
  updateUserData,
  uploadAvatar,
} from "../../../redux/slices/authSlice";
import { getFarmFields } from "../../../redux/slices/farmSlice";
import { message } from "antd";
import PersonalInfoSkeleton from "../../Skeleton/PersonalInfoSkeleton";
import {
  getCountries,
  getStatesByCountry,
  getCitiesByState,
} from "../../../api/locationApi";
import { getStaticCountries } from "../../../config/countriesFallback";
import {
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
  Languages,
} from "lucide-react";
import SettingsPanel, {
  settingsFieldStyles as fs,
} from "../SettingsPanel";
import {
  FARMER_LANGUAGE_OPTIONS,
  getFarmerLanguageLabel,
  normalizeFarmerLanguage,
} from "../../../config/languages";

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
  isEditing = false,
}) => {
  const isEditable = isEditing && !readOnly;

  const locked = readOnly || !isEditing;

  return (
    <div className="group">
      <label htmlFor={id} className={fs.label}>
        {label}
      </label>
      <div className="relative">
        {Icon ? (
          <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-ember-sidebar">
            <Icon className="h-4 w-4" aria-hidden />
          </div>
        ) : null}
        <input
          type={type}
          id={id}
          placeholder={placeholder || label}
          value={value}
          onChange={onChange}
          disabled={disabled || !isEditable}
          readOnly={readOnly}
          className={`${fs.inputBase} ${Icon ? fs.inputWithIcon : fs.inputPlain} ${
            locked ? fs.inputReadonly : fs.inputEditable
          }`}
        />
      </div>
    </div>
  );
};

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
    language: "en",
    country: "",
    state: "",
    city: "",
  });

  const [originalData, setOriginalData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    organization: "",
    language: "en",
    country: "",
    state: "",
    city: "",
  });
  const [countries, setCountries] = useState(() => getStaticCountries());
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [cityUseTextInput, setCityUseTextInput] = useState(false);

  const [updateStatus, setUpdateStatus] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Do not overwrite in-progress typing while edit mode is active.
    if (userProfile && !isEditing) {
      const profileData = {
        firstName: userProfile.firstName || "",
        lastName: userProfile.lastName || "",
        email: userProfile.email || "",
        phone: userProfile.phone || "",
        organization:
          userProfile.organization?.organizationName || "No Organization",
        language: normalizeFarmerLanguage(userProfile.language),
        country: userProfile.country || "",
        state: userProfile.state || "",
        city: userProfile.city || "",
      };
      setFormData(profileData);
      setOriginalData(profileData);
      setPreviewUrl(null);
    }
  }, [userProfile, isEditing]);

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

  useEffect(() => {
    let active = true;
    getCountries().then((data) => {
      if (active && Array.isArray(data) && data.length > 0) {
        setCountries(data);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!isEditing || !formData.country) {
      setStates([]);
      return;
    }
    let active = true;
    getStatesByCountry(formData.country).then((data) => {
      if (active) setStates(Array.isArray(data) ? data : []);
    });
    return () => {
      active = false;
    };
  }, [isEditing, formData.country]);

  useEffect(() => {
    if (!isEditing || !formData.state) {
      setCities([]);
      setCityUseTextInput(false);
      return;
    }
    let active = true;
    setCityUseTextInput(false);
    getCitiesByState(formData.state).then((data) => {
      if (!active) return;
      const list = Array.isArray(data) ? data : [];
      setCities(list);
      setCityUseTextInput(list.length === 0);
    });
    return () => {
      active = false;
    };
  }, [isEditing, formData.state]);

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
    setFormData((prev) => {
      if (id === "country") {
        return { ...prev, country: value, state: "", city: "" };
      }
      if (id === "state") {
        return { ...prev, state: value, city: "" };
      }
      return { ...prev, [id]: value };
    });
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
      const rawPhone = String(formData.phone || "").trim();
      const digitsOnly = rawPhone.replace(/\D/g, "");
      let formattedPhone = "";

      if (digitsOnly.length > 0) {
        if (digitsOnly.length === 10) {
          formattedPhone = `+91${digitsOnly}`;
        } else if (digitsOnly.length >= 11 && digitsOnly.length <= 12) {
          formattedPhone = `+${digitsOnly}`;
        } else {
          throw new Error("Please enter a valid phone number");
        }
      }

      const updatePayload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        language: normalizeFarmerLanguage(formData.language),
        country: formData.country,
        state: formData.state,
        city: formData.city,
      };
      if (formattedPhone) {
        updatePayload.phone = formattedPhone;
      }

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
      const errMessage =
        err?.message ||
        err?.response?.data?.message ||
        "Failed to update profile";
      setUpdateStatus({
        success: false,
        message: errMessage,
      });
      message.error(errMessage);
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
    return DEFAULT_PROFILE_IMAGE_URL;
  };

  const StatCard = ({ icon: Icon, value, label }) => (
    <div className="flex items-center gap-2.5 rounded-xl border border-white/25 bg-white/15 px-3 py-2 shadow-sm backdrop-blur-sm transition-colors hover:bg-white/25 sm:px-3.5 sm:py-2.5">
      <Icon className="h-4 w-4 shrink-0 text-white sm:h-[18px] sm:w-[18px]" aria-hidden />
      <div className="min-w-0">
        <p className="text-base font-bold leading-tight text-white sm:text-lg">
          {value}
        </p>
        <p className="text-[11px] text-white/80 sm:text-xs">{label}</p>
      </div>
    </div>
  );

  if (loading || profileStatus === "loading") {
    return <PersonalInfoSkeleton />;
  }

  return (
    <SettingsPanel
      title="Personal Info"
      description="Manage your profile details and preferences"
      onBack={setShowSidebar}
      className="h-full bg-[#f8fbf9]"
    >
      <div className="mx-auto w-full max-w-4xl space-y-4 sm:space-y-5">
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#243d31] via-ember-sidebar to-[#5A7C6B] shadow-xl sm:rounded-3xl">
          <div className="absolute top-0 right-0 h-40 w-40 translate-x-1/3 -translate-y-1/3 rounded-full bg-white/10 sm:h-60 sm:w-60" />
          <div className="absolute -bottom-16 left-1/4 h-40 w-40 rounded-full bg-[#7dffb3]/10 blur-2xl" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

          <div className="relative px-4 py-5 sm:px-7 sm:py-7">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-6">
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
                  className="relative block h-24 w-24 overflow-hidden rounded-2xl shadow-xl ring-4 ring-white/40 transition-all hover:scale-[1.03] hover:ring-white/70 focus:outline-none focus:ring-4 focus:ring-white/70 disabled:cursor-wait disabled:opacity-70 sm:h-28 sm:w-28"
                >
                  {avatarUploading ? (
                    <div className="flex h-full w-full flex-col items-center justify-center bg-white/10">
                      <Loader2 className="h-5 w-5 animate-spin text-white" />
                      <span className="mt-0.5 text-[10px] font-medium text-white/90">
                        {uploadProgress}%
                      </span>
                    </div>
                  ) : (
                    <>
                      <img
                        src={getAvatarUrl()}
                        alt="Profile"
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = DEFAULT_PROFILE_IMAGE_URL;
                        }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity hover:opacity-100">
                        <Camera className="h-5 w-5 text-white" aria-hidden />
                      </div>
                    </>
                  )}
                </button>
                <div className="pointer-events-none absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-ember-sidebar shadow-lg">
                  <Camera className="h-4 w-4 text-white" aria-hidden />
                </div>
              </div>

              <div className="min-w-0 flex-1 text-center sm:text-left">
                <h2 className="text-xl font-bold leading-tight text-white drop-shadow-sm sm:text-2xl">
                  {userProfile?.firstName} {userProfile?.lastName}
                </h2>
                <p className="mt-1 inline-block rounded-full bg-white/20 px-3 py-0.5 text-xs font-semibold capitalize text-white">
                  {userProfile?.role}
                </p>
                <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white/95">
                  <Languages className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  {getFarmerLanguageLabel(userProfile?.language)}
                </p>
                <div className="mt-3.5 flex flex-wrap justify-center gap-2.5 sm:justify-start">
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

        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg sm:rounded-3xl">
          <div className="border-b border-gray-100 bg-gradient-to-r from-[#f1f8f4] to-white px-4 py-3.5 sm:px-6">
            <h3 className="text-base font-bold text-ember-sidebar">Personal details</h3>
            <p className="text-xs text-gray-500 sm:text-sm">Your name, contact and location</p>
          </div>
          <form onSubmit={handleSubmit} className="p-4 sm:p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
              <InputField
                id="firstName"
                label="First Name"
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="First Name"
                icon={User}
                isEditing={isEditing}
              />
              <InputField
                id="lastName"
                label="Last Name"
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder="Last Name"
                icon={User}
                isEditing={isEditing}
              />
              <InputField
                id="email"
                label="Email"
                type="email"
                value={formData.email}
                readOnly
                placeholder="Email"
                icon={Mail}
                isEditing={isEditing}
              />
              <InputField
                id="phone"
                label="Phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+91 9876543210"
                icon={Phone}
                isEditing={isEditing}
              />
              <SelectField
                id="language"
                label="Preferred language"
                value={formData.language}
                onChange={handleInputChange}
                disabled={!isEditing}
                options={FARMER_LANGUAGE_OPTIONS}
                placeholder="Select language"
                hint="Used for advisories and farm communications."
              />
              <div className="md:col-span-2">
                <InputField
                  id="organization"
                  label="Organization"
                  value={formData.organization}
                  readOnly
                  placeholder="No Organization"
                  icon={Building2}
                  isEditing={isEditing}
                />
              </div>
              <SelectField
                id="country"
                label="Country"
                value={formData.country}
                onChange={handleInputChange}
                disabled={!isEditing}
                options={(countries || []).map((c) => ({
                  label: c.name,
                  value: c.iso2,
                }))}
                placeholder="Select country"
              />
              <SelectField
                id="state"
                label="State"
                value={formData.state}
                onChange={handleInputChange}
                disabled={!isEditing || !formData.country}
                options={(states || []).map((s) => ({
                  label: s.name,
                  value: s.state_code,
                }))}
                placeholder="Select state"
              />
              <div className="md:col-span-2">
                {cityUseTextInput && isEditing ? (
                  <InputField
                    id="city"
                    label="City"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="Enter your city or village"
                    isEditing={isEditing}
                  />
                ) : (
                  <SelectField
                    id="city"
                    label="City"
                    value={formData.city}
                    onChange={handleInputChange}
                    disabled={!isEditing || !formData.state}
                    options={(cities || []).map((c) => ({
                      label: c.name,
                      value: c.name,
                    }))}
                    placeholder={
                      isEditing && formData.state && cities.length === 0
                        ? "Loading cities…"
                        : "Select city"
                    }
                  />
                )}
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:flex-wrap sm:items-center">
              {!isEditing ? (
                <button
                  type="button"
                  onClick={handleEnableEdit}
                  className={`${fs.btnPrimary} w-full sm:w-auto`}
                >
                  <Pencil className="h-4 w-4" aria-hidden />
                  Edit details
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                    className={`${fs.btnSecondary} w-full sm:w-auto`}
                  >
                    <X className="h-4 w-4" aria-hidden />
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className={`${fs.btnPrimary} w-full sm:w-auto`}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                        Saving…
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" aria-hidden />
                        Save changes
                      </>
                    )}
                  </button>
                </>
              )}
            </div>

            {isEditing ? (
              <p className="mt-2 text-center text-[11px] text-amber-800 sm:text-xs">
                <span className="inline-block rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1">
                  Edit mode — save when finished.
                </span>
              </p>
            ) : null}

            {updateStatus?.success ? (
              <p className="mt-2 text-center text-[11px] text-green-700 sm:text-xs">
                <span className="inline-block rounded-md border border-green-200 bg-green-50 px-2.5 py-1">
                  {updateStatus.message}
                </span>
              </p>
            ) : null}
          </form>
        </div>
      </div>
    </SettingsPanel>
  );
};

const SelectField = ({
  id,
  label,
  value,
  onChange,
  disabled = false,
  options = [],
  placeholder = "Select",
  hint,
}) => (
  <div className="group">
    <label htmlFor={id} className={fs.label}>
      {label}
    </label>
    <select
      id={id}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`${fs.inputBase} ${fs.inputPlain} ${
        disabled ? fs.inputReadonly : fs.inputEditable
      }`}
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={`${id}-${opt.value}`} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
    {hint ? (
      <p className="mt-1.5 text-xs leading-snug text-gray-500">
        {hint}
      </p>
    ) : null}
  </div>
);

export default PersonalInfo;
