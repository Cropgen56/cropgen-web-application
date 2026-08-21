import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { message } from "antd";
import {
  setGoogleLoginData,
  decodeToken,
} from "../../../../redux/slices/authSlice";
import { persistRefreshToken } from "../../../../utility/authSession";
import { FcGoogle } from "react-icons/fc";
import { AUTH_EMAIL_CLIENT_BRAND } from "../../../../config/brand";
import { API_BASE_URL } from "../../../../config/envUrls";

const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

function SocialButtons() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const googleButtonRef = useRef(null);

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

      if (res.data.success) {
        persistRefreshToken(res.data.refreshToken);
        dispatch(
          setGoogleLoginData({
            accessToken: res.data.accessToken,
            user: res.data.user,
            role: res.data.role,
            onboardingRequired: res.data.onboardingRequired,
          }),
        );
        dispatch(decodeToken());
        navigate("/cropgen-analytics", { replace: true });
      } else {
        message.error(res.data.message || "Google login failed");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "An unexpected error occurred.";
      message.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomButtonClick = () => {
    if (!clientId) {
      message.error("Google sign-in is not configured.");
      return;
    }
    const googleBtn =
      googleButtonRef.current?.querySelector('div[role="button"]');
    if (googleBtn) {
      googleBtn.click();
    } else {
      message.error("Google sign-in is unavailable. Please try again.");
    }
  };

  return (
    <div className="flex flex-col justify-center items-center gap-3 w-full">
      <GoogleOAuthProvider clientId={clientId}>
        <div className="w-full">
          <button
            type="button"
            onClick={handleCustomButtonClick}
            disabled={isLoading}
            className={`flex w-full items-center justify-center gap-2 rounded-full px-4 py-3.5 text-sm font-medium transition-all duration-300 sm:px-6
              ${
                isLoading
                  ? "cursor-not-allowed bg-gray-400 text-white"
                  : "bg-[#0D4D44] text-white hover:opacity-95"
              }`}
          >
            <FcGoogle className="rounded-full bg-white p-0.5 text-lg" />
            {isLoading ? "Signing in..." : "Continue with Google"}
          </button>

          <div ref={googleButtonRef} className="hidden" aria-hidden="true">
            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={() => {
                message.error("Google login failed. Please try again.");
                setIsLoading(false);
              }}
              disabled={isLoading}
              useOneTap={false}
              width="100%"
              theme="filled_blue"
            />
          </div>
        </div>
      </GoogleOAuthProvider>
    </div>
  );
}

export default SocialButtons;
