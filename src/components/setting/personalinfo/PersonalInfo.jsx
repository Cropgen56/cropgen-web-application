import React, { useEffect, useMemo, useState, useRef } from "react";
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
  buildE164,
  getPhoneValidationError,
  maxLocalPhoneLength,
  normalizePhoneLocal,
} from "../../../utils/phone";
import {
  FARMER_LANGUAGE_OPTIONS,
  getFarmerLanguageLabel,
  normalizeFarmerLanguage,
} from "../../../config/languages";

const flagUrl = (iso2) =>
  iso2 ? `https://flagcdn.com/w40/${String(iso2).toLowerCase()}.png` : "";

/** Searchable country-code picker: flag, country name and +code for every country. */
const DialCodeSelect = ({
  countries,
  value,
  selectedIso,
  onSelect,
  disabled,
  onBlur,
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef(null);

  const selected =
    countries.find((c) => c.iso2 === selectedIso && c.code === value) ||
    countries.find((c) => c.code === value) ||
    null;

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
        onBlur?.();
      }
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onBlur]);

  const q = query.trim().toLowerCase().replace(/^\+/, "");
  const list = q
    ? countries.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.iso2.toLowerCase() === q ||
          c.code.startsWith(q)
      )
    : countries;

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        id="dialCode"
        disabled={disabled}
        aria-label="Country code"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => {
          setQuery("");
          setOpen((o) => !o);
        }}
        className={`${fs.inputBase} flex w-[7.5rem] items-center gap-2 px-3 ${
          disabled ? fs.inputReadonly : fs.inputEditable
        }`}
      >
        {selected ? (
          <img
            src={flagUrl(selected.iso2)}
            alt=""
            className="h-4 w-6 shrink-0 rounded-sm object-cover"
          />
        ) : null}
        <span className="font-medium">+{value || "--"}</span>
        <svg
          className="ml-auto h-3.5 w-3.5 text-gray-400"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden
        >
          <path d="M5.5 7.5 10 12l4.5-4.5-1-1L10 10 6.5 6.5z" />
        </svg>
      </button>

      {open ? (
        <div className="absolute left-0 top-full z-50 mt-1 w-72 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
          <div className="border-b border-gray-100 p-2">
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search country or code"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-ember-sidebar focus:ring-2 focus:ring-ember-sidebar/20"
            />
          </div>
          <ul role="listbox" className="max-h-64 overflow-y-auto py-1">
            {list.length === 0 ? (
              <li className="px-3 py-3 text-sm text-gray-500">No match</li>
            ) : (
              list.map((c) => {
                const active =
                  c.code === value &&
                  (!selectedIso || c.iso2 === selected?.iso2);
                return (
                  <li key={c.iso2} role="option" aria-selected={active}>
                    <button
                      type="button"
                      onClick={() => {
                        onSelect(c);
                        setOpen(false);
                      }}
                      className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm hover:bg-[#eefaf3] ${
                        active ? "bg-[#eefaf3] font-semibold" : ""
                      }`}
                    >
                      <img
                        src={flagUrl(c.iso2)}
                        alt=""
                        loading="lazy"
                        className="h-4 w-6 shrink-0 rounded-sm object-cover"
                      />
                      <span className="min-w-0 flex-1 truncate">{c.name}</span>
                      <span className="shrink-0 text-gray-500">+{c.code}</span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
};

const NAME_RE = /^[\p{L}\p{M}][\p{L}\p{M} .'-]*$/u;

/** Split a stored E.164 number ("+917878787878") into dial code + local digits. */
function splitE164(phone, dialCodes) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (!digits) return { dialCode: "", local: "" };
  for (const len of [4, 3, 2, 1]) {
    const code = digits.slice(0, len);
    if (dialCodes.has(code)) return { dialCode: code, local: digits.slice(len) };
  }
  return { dialCode: "91", local: digits };
}

const emptyForm = {
  firstName: "",
  lastName: "",
  email: "",
  dialCode: "91",
  phone: "",
  organization: "",
  language: "en",
  country: "",
  state: "",
  city: "",
};

function validateForm(f, hadPhone) {
  const errors = {};
  const first = f.firstName.trim();
  const last = f.lastName.trim();
  if (!first) errors.firstName = "First name is required";
  else if (first.length > 50 || !NAME_RE.test(first))
    errors.firstName = "Use letters only (max 50 characters)";
  if (last && (last.length > 50 || !NAME_RE.test(last)))
    errors.lastName = "Use letters only (max 50 characters)";
  if (f.phone.trim() || hadPhone) {
    const err = getPhoneValidationError(f.dialCode, f.phone);
    if (err) errors.phone = err;
  }
  return errors;
}

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
  error,
  onBlur,
  inputMode,
  maxLength,
  autoComplete,
  required = false,
}) => {
  const isEditable = isEditing && !readOnly;

  const locked = readOnly || !isEditing;

  return (
    <div className="group">
      <label htmlFor={id} className={fs.label}>
        {label}
        {required && isEditing ? (
          <span className="ml-0.5 text-red-500" aria-hidden>
            *
          </span>
        ) : null}
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
          onBlur={onBlur}
          disabled={disabled || !isEditable}
          readOnly={readOnly}
          inputMode={inputMode}
          maxLength={maxLength}
          autoComplete={autoComplete}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`${fs.inputBase} ${Icon ? fs.inputWithIcon : fs.inputPlain} ${
            locked ? fs.inputReadonly : fs.inputEditable
          } ${error ? "!border-red-400 focus:!ring-red-200" : ""}`}
        />
      </div>
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-1 text-xs text-red-600">
          {error}
        </p>
      ) : null}
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

  const [formData, setFormData] = useState(emptyForm);
  const [originalData, setOriginalData] = useState(emptyForm);
  const [touched, setTouched] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [countries, setCountries] = useState(() => getStaticCountries());
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [cityUseTextInput, setCityUseTextInput] = useState(false);

  const [updateStatus, setUpdateStatus] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Every country with a dial code (static data: works even if the location API is slow).
  const dialCountries = useMemo(
    () =>
      getStaticCountries()
        .map((c) => ({
          iso2: c.iso2,
          name: c.name,
          code: String(c.phonecode || "").replace(/\D/g, ""),
        }))
        .filter((c) => c.code),
    []
  );
  const dialCodeSet = useMemo(
    () => new Set(dialCountries.map((c) => c.code)),
    [dialCountries]
  );
  const [dialIso, setDialIso] = useState("");

  useEffect(() => {
    // Do not overwrite in-progress typing while edit mode is active.
    if (userProfile && !isEditing) {
      const { dialCode, local } = splitE164(userProfile.phone, dialCodeSet);
      const profileData = {
        firstName: userProfile.firstName || "",
        lastName: userProfile.lastName || "",
        email: userProfile.email || "",
        dialCode: dialCode || "91",
        phone: local,
        organization:
          userProfile.organization?.organizationName || "No Organization",
        language: normalizeFarmerLanguage(userProfile.language),
        country: userProfile.country || "",
        state: userProfile.state || "",
        city: userProfile.city || "",
      };
      setFormData(profileData);
      setOriginalData(profileData);
      setDialIso("");
      setPreviewUrl(null);
    }
  }, [userProfile, isEditing, dialCodeSet]);

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
        // Follow the country's dial code unless the user already typed a number.
        const code = dialCountries.find((x) => x.iso2 === value)?.code || "";
        return {
          ...prev,
          country: value,
          state: "",
          city: "",
          dialCode: !prev.phone && code ? code : prev.dialCode,
        };
      }
      if (id === "state") {
        return { ...prev, state: value, city: "" };
      }
      if (id === "phone") {
        return {
          ...prev,
          phone: normalizePhoneLocal(prev.dialCode, value),
        };
      }
      if (id === "dialCode") {
        return {
          ...prev,
          dialCode: value,
          phone: normalizePhoneLocal(value, prev.phone),
        };
      }
      return { ...prev, [id]: value };
    });
  };

  const handleBlur = (e) => {
    const { id } = e.target;
    setTouched((t) => ({ ...t, [id]: true }));
  };

  const hadPhone = Boolean(originalData.phone);
  const errors = useMemo(
    () => (isEditing ? validateForm(formData, hadPhone) : {}),
    [formData, hadPhone, isEditing]
  );
  const showError = (key) =>
    submitAttempted || touched[key] || (key === "phone" && touched.dialCode)
      ? errors[key]
      : undefined;

  const changedKeys = useMemo(
    () =>
      Object.keys(formData).filter(
        (k) => String(formData[k] ?? "") !== String(originalData[k] ?? "")
      ),
    [formData, originalData]
  );
  const isDirty = isEditing && changedKeys.length > 0;

  // Warn before closing the tab with unsaved edits.
  useEffect(() => {
    if (!isDirty) return undefined;
    const handler = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  const handleEnableEdit = () => {
    setOriginalData({ ...formData });
    setTouched({});
    setSubmitAttempted(false);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    if (
      isDirty &&
      !window.confirm("Discard your unsaved changes?")
    ) {
      return;
    }
    setFormData({ ...originalData });
    setTouched({});
    setSubmitAttempted(false);
    setIsEditing(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSaving) return;
    setUpdateStatus(null);
    setSubmitAttempted(true);

    if (Object.keys(errors).length > 0) {
      message.error("Please fix the highlighted fields");
      return;
    }
    if (changedKeys.length === 0) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      // Send only what changed (email and organization are read-only here).
      const updatePayload = {};
      if (changedKeys.includes("firstName"))
        updatePayload.firstName = formData.firstName.trim();
      if (changedKeys.includes("lastName"))
        updatePayload.lastName = formData.lastName.trim();
      if (changedKeys.includes("language"))
        updatePayload.language = normalizeFarmerLanguage(formData.language);
      ["country", "state", "city"].forEach((k) => {
        if (changedKeys.includes(k)) updatePayload[k] = formData[k];
      });
      if (changedKeys.includes("phone") || changedKeys.includes("dialCode")) {
        updatePayload.phone = buildE164(formData.dialCode, formData.phone);
      }

      if (Object.keys(updatePayload).length === 0) {
        setIsEditing(false);
        return;
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
      setTouched({});
      setSubmitAttempted(false);
    } catch (err) {
      const errMessage =
        (typeof err === "string" ? err : null) ||
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

  const cropCount = (fields || []).reduce((n, f) => {
    if (Array.isArray(f.crops) && f.crops.length > 0) {
      return n + f.crops.filter((c) => c.isActive !== false).length;
    }
    return n + (f.cropName ? 1 : 0);
  }, 0);

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
                    value={cropCount}
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
                required
                maxLength={50}
                autoComplete="given-name"
                onBlur={handleBlur}
                error={showError("firstName")}
              />
              <InputField
                id="lastName"
                label="Last Name"
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder="Last Name"
                icon={User}
                isEditing={isEditing}
                maxLength={50}
                autoComplete="family-name"
                onBlur={handleBlur}
                error={showError("lastName")}
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
              <div className="group">
                <label htmlFor="phone" className={fs.label}>
                  Phone
                  {isEditing ? (
                    <span className="ml-0.5 text-red-500" aria-hidden>
                      *
                    </span>
                  ) : null}
                </label>
                <div className="flex gap-2">
                  <DialCodeSelect
                    countries={dialCountries}
                    value={formData.dialCode}
                    selectedIso={dialIso || formData.country}
                    disabled={!isEditing}
                    onBlur={() => setTouched((t) => ({ ...t, dialCode: true }))}
                    onSelect={(c) => {
                      setDialIso(c.iso2);
                      setFormData((prev) => ({
                        ...prev,
                        dialCode: c.code,
                        phone: normalizePhoneLocal(c.code, prev.phone),
                      }));
                    }}
                  />
                  <div className="relative min-w-0 flex-1">
                    <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-ember-sidebar">
                      <Phone className="h-4 w-4" aria-hidden />
                    </div>
                    <input
                      id="phone"
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel-national"
                      placeholder="9876543210"
                      maxLength={maxLocalPhoneLength(formData.dialCode) + 4}
                      value={formData.phone}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      disabled={!isEditing}
                      aria-invalid={showError("phone") ? "true" : undefined}
                      aria-describedby={showError("phone") ? "phone-error" : undefined}
                      className={`${fs.inputBase} ${fs.inputWithIcon} ${
                        isEditing ? fs.inputEditable : fs.inputReadonly
                      } ${showError("phone") ? "!border-red-400 focus:!ring-red-200" : ""}`}
                    />
                  </div>
                </div>
                {showError("phone") ? (
                  <p id="phone-error" role="alert" className="mt-1 text-xs text-red-600">
                    {showError("phone")}
                  </p>
                ) : isEditing ? (
                  <p className="mt-1 text-xs text-gray-500">
                    Used to sign in and for alerts. Must be unique to your account.
                  </p>
                ) : null}
              </div>
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
                    disabled={isSaving || !isDirty}
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
                  {isDirty
                    ? `${changedKeys.length} unsaved change${changedKeys.length === 1 ? "" : "s"} — save when finished.`
                    : "Edit mode — change a field to enable Save."}
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
