import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  sendotp,
  verifyuserotp,
  completeProfile,
} from "../../../redux/slices/authSlice";
import SocialButtons from "../shared/socialbuttons/SocialButton";
import { useNavigate } from "react-router-dom";
import { message } from "antd";

const SignupLogin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token, onboardingRequired } = useSelector((state) => state.auth);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [completingProfile, setCompletingProfile] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [orgCodeError, setOrgCodeError] = useState("");
  const [orgCodeTouched, setOrgCodeTouched] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    terms: false,
    organizationCode: "",
  });

  const [otpInputs, setOtpInputs] = useState(Array(6).fill(""));
  const inputRefs = useRef([]);

  const { isAuthenticated } = useSelector((state) => state.auth);

  const handleOtpChange = (value, index) => {
    if (/^\d?$/.test(value)) {
      const newOtp = [...otpInputs];
      newOtp[index] = value;
      setOtpInputs(newOtp);
      setFormData((prev) => ({ ...prev, otp: newOtp.join("") }));

      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otpInputs[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSendOtp = () => {
    if (!formData.email) return message.error("Please enter your email");

    setSendingOtp(true);
    dispatch(sendotp({ email: formData.email })).then((res) => {
      setSendingOtp(false);
      if (res.meta.requestStatus === "fulfilled") {
        message.success("OTP sent to your email");
      } else {
        message.error(res.payload?.message || "Failed to send OTP");
      }
    });
  };

  const handleVerifyOtp = () => {
    if (!formData.otp || formData.otp.length !== 6)
      return message.error("Enter a valid 6-digit OTP");

    setVerifyingOtp(true);
    dispatch(verifyuserotp({ email: formData.email, otp: formData.otp })).then(
      (res) => {
        setVerifyingOtp(false);
        if (res.meta.requestStatus === "fulfilled") {
          setOtpVerified(true);
          if (res.payload.onboardingRequired) {
          } else {
            navigate("/cropgen-analytics");
          }
        } else {
          message.error(res.payload?.message || "OTP verification failed");
        }
      }
    );
  };

  const handleCompleteProfile = () => {
    if (!formData.terms) {
      setOrgCodeError("You must accept Terms & Conditions");
      return;
    }
    setCompletingProfile(true);

    dispatch(
      completeProfile({
        token: token || localStorage.getItem("authToken"),
        terms: true,
        organizationCode: formData.organizationCode || null,
      })
    ).then((res) => {
      setCompletingProfile(false);
      if (res.meta.requestStatus === "fulfilled") {
        message.success("Profile Completed!");
        navigate("/cropgen-analytics");
      } else {
        console.log(res.payload?.message);
        setOrgCodeError(res.payload?.message || "Profile completion failed");
      }
    });
  };

  const handleOrgCodeChange = (e) => {
    setFormData({ ...formData, organizationCode: e.target.value });
    setOrgCodeTouched(true);
    if (orgCodeError) {
      setOrgCodeError("");
    }
  };

  useEffect(() => {
    setOtpVerified(false);
    setOrgCodeError("");
    setOrgCodeTouched(false);
  }, [formData.email]);

  return (
    <div className="w-full h-full flex items-center justify-center bg-white p-2 lg:p-4 mt-10">
      {/* Base styles are for tablet, lg: styles are for desktop */}
      <div
        className="w-full max-w-lg lg:max-w-xl bg-white rounded-xl p-3 sm:p-4 md:p-6 lg:p-10 flex flex-col justify-center
                      h-full max-h-[90vh] lg:h-[80vh] overflow-y-auto"
      >
        <div className="mb-4 lg:mb-8 text-center flex-shrink-0">
          <h2 className="text-base sm:text-xl md:text-2xl lg:text-3xl font-semibold text-black">
            Get started with CropGen
          </h2>
          <p className="text-xs sm:text-sm lg:text-base text-gray-500 mt-1 font-medium">
            Enter Your Personal data to Create your account
          </p>
        </div>

        <div className="space-y-3 lg:space-y-4 flex-1 flex flex-col ">
          <div className="space-y-3 lg:space-y-4">
            <div>
              <label className="text-xs lg:text-sm font-medium text-gray-800">
                Email
              </label>
              <div className="flex flex-col sm:flex-row gap-2 lg:gap-3 mt-1 lg:mt-2 w-full">
                <input
                  type="email"
                  placeholder="example@gmail.com*"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full sm:flex-[0.8] rounded-md px-2 py-1.5 lg:px-3 lg:py-2 text-xs lg:text-sm bg-white border-1 border-gray-300
                             focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
                />
                <button
                  onClick={handleSendOtp}
                  className="w-full sm:flex-[0.2] h-8 lg:h-10 text-xs lg:text-sm bg-[#344E41] text-white rounded-md
                             hover:bg-emerald-900 transition font-semibold flex items-center justify-center gap-2"
                  disabled={sendingOtp}
                >
                  {sendingOtp ? (
                    <div className="w-3 h-3 lg:w-4 lg:h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    "Get OTP"
                  )}
                </button>
              </div>
            </div>

            <div className="relative">
              <label className="text-xs lg:text-sm font-medium text-gray-800">
                Enter OTP
              </label>
              <div className="flex flex-col sm:flex-row gap-2 lg:gap-3 mt-1 lg:mt-2 w-full">
                <div className="grid grid-cols-6 gap-1 lg:gap-2 w-full sm:flex-[0.8]">
                  {otpInputs.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (inputRefs.current[idx] = el)}
                      type="text"
                      maxLength="1"
                      value={digit}
                      onChange={(e) => handleOtpChange(e.target.value, idx)}
                      onKeyDown={(e) => handleKeyDown(e, idx)}
                      className="w-full h-7 lg:h-10 text-center border-1 border-gray-300 rounded-md
                                 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-xs lg:text-sm"
                    />
                  ))}
                </div>
                <button
                  onClick={handleVerifyOtp}
                  className="w-full sm:flex-[0.2] h-7 lg:h-10 text-xs lg:text-sm bg-[#344E41] text-white
                             rounded-md hover:bg-emerald-900 transition font-semibold"
                  disabled={verifyingOtp}
                >
                  {verifyingOtp ? "Verifying..." : "Verify OTP"}
                </button>
              </div>
              {otpVerified && (
                <div className="flex items-center gap-1 lg:gap-2 mt-1 lg:mt-2 text-green-600 text-xs lg:text-sm">
                  <svg
                    className="w-3 h-3 lg:w-4 lg:h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>OTP verified successfully</span>
                </div>
              )}
            </div>

            <div>
              <label className="text-xs lg:text-sm font-medium text-gray-800">
                Organization Code (Optional)
              </label>
              <input
                type="text"
                placeholder="Enter Code Eg: CropGen01234"
                value={formData.organizationCode || ""}
                onChange={handleOrgCodeChange}
                className={`mt-1 w-full rounded-md px-2 py-1.5 lg:px-3 lg:py-2 text-xs lg:text-sm bg-white border-1 ${
                  orgCodeError ? "border-red-500" : "border-gray-300"
                } focus:outline-none focus:ring-2 focus:ring-emerald-600`}
              />
              {orgCodeError && (
                <div className="flex items-center gap-1 lg:gap-2 mt-1 text-red-600 text-xs lg:text-sm">
                  <svg
                    className="w-3 h-3 lg:w-4 lg:h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{orgCodeError}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2 lg:gap-3 mt-3 lg:mt-4 flex-shrink-0">
            {onboardingRequired && (
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={formData.terms}
                  onChange={(e) =>
                    setFormData({ ...formData, terms: e.target.checked })
                  }
                  className="mt-0.5 lg:mt-1 w-3 h-3 lg:w-4 lg:h-4 text-emerald-600 border-gray-300 rounded"
                />
                <label className="text-[10px] lg:text-xs text-gray-700">
                  I agree to the{" "}
                  <a
                    href="https://www.cropgenapp.com/terms-conditions"
                    className="text-sky-600 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Terms of Use and Privacy Policy
                  </a>
                  , to the processing of my personal data, and to receive emails
                </label>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                if (onboardingRequired) handleCompleteProfile();
                else handleVerifyOtp();
              }}
              disabled={completingProfile}
              className="w-full bg-[#344E41] text-white py-1.5 lg:py-2 rounded-md font-medium hover:bg-emerald-900 transition text-xs lg:text-base"
            >
              {completingProfile ? "Processing..." : "Login / Sign Up"}
            </button>

            <div className="flex items-center gap-2 mt-1 lg:mt-2">
              <hr className="flex-1 border-[#075A53]" />
              <span className="text-xs text-gray-600">OR</span>
              <hr className="flex-1 border-[#075A53]" />
            </div>

            <SocialButtons />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupLogin;
