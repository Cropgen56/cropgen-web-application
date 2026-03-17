import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { getUserProfileData } from "../redux/slices/authSlice";
import {
  Mail,
  Phone,
  Building2,
  Settings,
  Shield,
  ArrowLeft,
} from "lucide-react";

const S3_BUCKET_URL =
  process.env.REACT_APP_S3_BUCKET_URL ||
  "https://your-bucket-name.s3.amazonaws.com";

const Profile = () => {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);
  const profileStatus = useSelector((state) => state.auth.profileStatus);
  const { userProfile, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token && profileStatus === "idle" && !userProfile) {
      dispatch(getUserProfileData());
    }
  }, [token, profileStatus, userProfile, dispatch]);

  const getAvatarUrl = () => {
    if (!userProfile?.avatar) return null;
    if (userProfile.avatar.startsWith("http")) return userProfile.avatar;
    return `${S3_BUCKET_URL}/${userProfile.avatar}`;
  };

  const fullName =
    [userProfile?.firstName, userProfile?.lastName].filter(Boolean).join(" ") ||
    "User";
  const role = userProfile?.role
    ? userProfile.role.charAt(0).toUpperCase() + userProfile.role.slice(1)
    : null;

  if (loading) {
    return (
      <div className="max-w-[1200px] w-[98%] mx-auto my-2 p-2 px-4 lg:p-4 rounded-lg bg-white shadow-md font-inter min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[#344e41]/20 animate-pulse" />
          <div className="h-6 w-32 bg-[#344e41]/20 rounded animate-pulse" />
          <div className="h-4 w-48 bg-[#344e41]/10 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] w-[98%] mx-auto my-2 p-2 px-4 lg:p-4 rounded-lg bg-white shadow-md font-inter min-h-[98%] overflow-y-auto">
      {/* Header - aligned with Personal Info, Farm Settings, Pricing */}
      <div className="px-4 py-2 text-[#344E41] border-b border-black/40">
        <div className="flex items-center justify-between">
          <h5 className="text-[18px] font-bold text-[#344E41]">Profile</h5>
          <Link
            to="/setting"
            className="flex items-center gap-1 text-xs text-[#344E41] hover:text-[#1d3039] transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Settings
          </Link>
        </div>
        <p className="mt-1 mb-0.5 text-[#344E41] font-medium text-sm leading-[100%]">
          View your account information
        </p>
      </div>

      {/* Content */}
      <div className="px-4 py-6 flex flex-col flex-grow">
        {/* Profile hero - matches Personal Info card style */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#344E41] via-[#3d5a4a] to-[#2d4339] shadow-lg mb-6">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative px-6 lg:px-8 py-8">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative shrink-0">
                <div className="w-24 h-24 lg:w-28 lg:h-28 rounded-2xl overflow-hidden bg-white/20 ring-4 ring-white/30 flex items-center justify-center shadow-xl">
                  {getAvatarUrl() ? (
                    <img
                      src={getAvatarUrl()}
                      alt={fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl lg:text-5xl font-bold text-white/90">
                      {fullName.charAt(0)}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-center sm:text-left flex-1">
                <h2 className="text-xl lg:text-2xl font-bold text-white tracking-tight">
                  {fullName}
                </h2>
                {role && (
                  <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full bg-white/20 text-white/95 text-sm">
                    <Shield className="w-4 h-4" />
                    {role}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Details section */}
        <div className="bg-gray-50/50 rounded-xl p-6 border border-gray-100">
          <ProfileRow
            icon={Mail}
            label="Email"
            value={userProfile?.email}
            placeholder="Not set"
          />
          <ProfileRow
            icon={Phone}
            label="Phone"
            value={userProfile?.phone}
            placeholder="Not set"
          />
          <ProfileRow
            icon={Building2}
            label="Organization"
            value={userProfile?.organization?.organizationName}
            placeholder="No organization"
          />
        </div>

        {/* Edit CTA - matches Settings button style */}
        <div className="mt-6">
          <Link
            to="/setting"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#344E41] hover:bg-[#2d4339] text-white font-semibold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <Settings className="w-4 h-4" />
            Edit profile in Settings
          </Link>
        </div>
      </div>
    </div>
  );
};

const ProfileRow = ({ icon: Icon, label, value, placeholder }) => (
  <div className="flex items-start gap-4 py-3 border-b border-gray-100 last:border-b-0">
    <div className="mt-0.5 p-2 rounded-lg bg-[#344e41]/10 text-[#344e41]">
      <Icon className="w-4 h-4" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
        {label}
      </p>
      <p className="text-gray-800 font-medium mt-0.5 truncate">
        {value || placeholder}
      </p>
    </div>
  </div>
);

export default Profile;
