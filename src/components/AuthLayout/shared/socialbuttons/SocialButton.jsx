import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { message } from "antd";
import { setGoogleLoginData } from "../../../../redux/slices/authSlice";
import { persistRefreshToken } from "../../../../utility/authSession";
import { FcGoogle } from "react-icons/fc";
import { AUTH_EMAIL_CLIENT_BRAND } from "../../../../config/brand";
import { API_BASE_URL } from "../../../../config/envUrls";

const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

function SocialButtons() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async (response) => {
    try {
      setIsLoading(true);
      const { credential } = response;

      if (!credential) {
        message.error("Google sign-in did not return a credential. Try again.");
        return;
      }

      const res = await axios.post(
        `${API_BASE_URL}/api/auth/google`,
        {
          token: credential,
          clientBrand: AUTH_EMAIL_CLIENT_BRAND,
        },
        {
          withCredentials: true,
          headers: {
            "X-Client-Brand": AUTH_EMAIL_CLIENT_BRAND,
            "X-Client-App": "cropgen_web",
          },
        },
      );

      if (!res.data.success) {
        message.error(res.data.message || "Google login failed");
        return;
      }

      persistRefreshToken(res.data.refreshToken);
      const user = res.data.user;
      const isNewUser = !!res.data.isNewUser;
      const missingName =
        !String(user?.firstName || "").trim() ||
        !String(user?.lastName || "").trim();
      const needsOrganizationPopup = isNewUser || missingName;

      dispatch(
        setGoogleLoginData({
          accessToken: res.data.accessToken,
          user,
          role: res.data.role,
          isNewUser,
          onboardingRequired: needsOrganizationPopup,
          profileDetailsRequired: needsOrganizationPopup,
        }),
      );

      if (needsOrganizationPopup) {
        return;
      }

      navigate("/cropgen-analytics", { replace: true });
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "An unexpected error occurred.";
      message.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!clientId) {
    return (
      <button
        type="button"
        disabled
        className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-full bg-gray-400 px-4 py-3.5 text-sm font-medium text-white"
      >
        <FcGoogle className="rounded-full bg-white p-0.5 text-lg" />
        Google sign-in is not configured
      </button>
    );
  }

  return (
    <div className="flex w-full flex-col items-center justify-center gap-3">
      <GoogleOAuthProvider clientId={clientId}>
        <div className="relative w-full">
          <div
            className={`flex w-full items-center justify-center gap-2 rounded-full px-4 py-3.5 text-sm font-medium text-white sm:px-6 ${
              isLoading ? "bg-gray-400" : "bg-[#0D4D44]"
            }`}
          >
            <FcGoogle className="rounded-full bg-white p-0.5 text-lg" />
            {isLoading ? "Signing in..." : "Continue with Google"}
          </div>
          {/* Keep GIS button in the layout (opacity-0). display:none breaks Google login. */}
          <div className="absolute inset-0 z-10 overflow-hidden opacity-0">
            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={() => {
                message.error("Google login failed. Please try again.");
                setIsLoading(false);
              }}
              useOneTap={false}
              width="400"
              theme="filled_blue"
              size="large"
              text="continue_with"
            />
          </div>
        </div>
      </GoogleOAuthProvider>
    </div>
  );
}

export default SocialButtons;
