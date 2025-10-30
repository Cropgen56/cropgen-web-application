import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useState, useRef } from "react";
import { useDispatch } from "react-redux";
import {
  setGoogleLoginData,
  decodeToken,
} from "../../../../redux/slices/authSlice";
import { FcGoogle } from "react-icons/fc";

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

      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/auth/google`,
        {
          token: credential,
        },
        { withCredentials: true }
      );

      if (res.data.success) {
        dispatch(
          setGoogleLoginData({
            accessToken: res.data.accessToken,
            user: res.data.user,
            role: res.data.role,
            onboardingRequired: res.data.onboardingRequired,
          })
        );
        navigate("/cropgen-analytics");
        dispatch(decodeToken());
      } else {
        alert(`Login Failed: ${res.data.message}`);
        console.error("Login Failed:", res.data.message);
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "An unexpected error occurred.";
      alert(`Google Login Error: ${errorMessage}`);
      console.error("Google Login Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomButtonClick = () => {
    // Programmatically click the hidden Google button
    const googleBtn = googleButtonRef.current?.querySelector('div[role="button"]');
    if (googleBtn) {
      googleBtn.click();
    }
  };

  return (
    <div className="flex flex-col justify-center items-center gap-3 w-full">
      <GoogleOAuthProvider clientId={clientId}>
        <div className="w-[70%]">
          {/* Custom styled button */}
          <button
            onClick={handleCustomButtonClick}
            disabled={isLoading}
            className={`flex w-full items-center justify-center gap-2 px-6 py-3 rounded-full font-medium text-sm transition 
              ${isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#344E41] hover:bg-emerald-900 text-white"
              }`}
          >
            <FcGoogle className="text-lg bg-white rounded-full p-0.5" />
            {isLoading ? "Signing in..." : "Continue with Google"}
          </button>

          {/* Hidden GoogleLogin component */}
          <div ref={googleButtonRef} style={{ display: 'none' }}>
            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={() => {
                alert("Google Login Failed. Please try again.");
                console.error("Google Login Failed");
                setIsLoading(false);
              }}
              disabled={isLoading}
              useOneTap={false}
            />
          </div>
        </div>
      </GoogleOAuthProvider>
    </div>
  );
}

export default SocialButtons;