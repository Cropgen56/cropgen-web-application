import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  sendotp,
  verifyuserotp,
  completeProfile,
} from "../../../redux/slices/authSlice";
import SocialButtons from "../shared/socialbuttons/SocialButton";
import { useNavigate } from "react-router-dom";
import tick from "../../../assets/logo/tick2.svg";
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

  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    terms: false,
    organizationCode: "",
  });

  const [otpInputs, setOtpInputs] = useState(Array(6).fill(""));
  const inputRefs = useRef([]);

  const handleOtpChange = (value, index) => {
    if (/^\d?$/.test(value)) {
      const newOtp = [...otpInputs];
      newOtp[index] = value;
      setOtpInputs(newOtp);
      setFormData((prev) => ({ ...prev, otp: newOtp.join("") }));
      if (value && index < 5) inputRefs.current[index + 1]?.focus();
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
        setStep(2);
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
          if (res.payload && res.payload.onboardingRequired === false) {
            navigate("/cropgen-analytics");
          } else {
            setStep(3);
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
        token,
        terms: true,
        organizationCode: formData.organizationCode || null,
      })
    ).then((res) => {
      setCompletingProfile(false);
      if (res.meta.requestStatus === "fulfilled") {
        message.success("Profile Completed!");
        navigate("/cropgen-analytics");
      } else {
        setOrgCodeError(res.payload?.message || "Profile completion failed");
      }
    });
  };

  const handleOrgCodeChange = (e) => {
    setFormData({ ...formData, organizationCode: e.target.value });
    setOrgCodeTouched(true);
    if (orgCodeError) setOrgCodeError("");
  };

  useEffect(() => {
    setOtpVerified(false);
    setOrgCodeError("");
    setOrgCodeTouched(false);
  }, [formData.email]);

  const translateY = `${-(step - 1) * 100}%`;

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text").trim();

    if (/^\d{6}$/.test(paste)) {
      const digits = paste.split("");

      setOtpInputs(digits);
      setFormData((prev) => ({ ...prev, otp: paste }));

      // Last box par focus
      inputRefs.current[5]?.focus();
    }
  };

  return (
    <div className="w-full h-full flex items-start sm:items-center justify-center mt-10 sm:mt-0 bg-white p-2  sm:p-4 lg:p-8 ">
      <div className="w-full max-w-lg lg:max-w-xl bg-white rounded-xl flex flex-col gap-2.5 sm:gap-4 justify-start overflow-hidden relative">
        <div className="flex flex-col items-center text-center">
          <h2 className="text-base sm:text-xl md:text-2xl lg:text-3xl font-semibold text-black">
            Get started with CropGen
          </h2>
          <p className="text-xs sm:text-sm lg:text-base text-gray-500 sm:mt-1 font-medium">
            Enter your personal data to create your account
          </p>
        </div>

        <div className="relative w-full h-[320px] sm:h-[400px] md:h-[380px] lg:h-[420px] overflow-hidden">
          <div
            className="absolute left-0 top-0 w-full h-full transition-transform duration-500 ease-in-out"
            style={{ transform: `translateY(${translateY})` }}
          >
            <section className="w-full h-full flex flex-col justify-start gap-4 px-4">
              <div className="w-full">
                <SocialButtons />
              </div>

              <div className="flex items-center gap-2 w-[95%] sm:w-[70%] mx-auto">
                <hr className="flex-1 border-2 border-green-900 my-1 sm:my-4" />
                <span className="text-xs text-green-900/80 font-semibold">
                  OR
                </span>
                <hr className="flex-1  border-2 border-green-900 my-1 sm:my-4" />
              </div>

              <div className="flex flex-col gap-2 w-full justify-center items-center">
                <input
                  type="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-[95%] sm:w-[70%] sm:mt-1 lg:mt-2 rounded-full px-2 lg:py-3 py-2  text-center font-semibold text-green-900 text-xs sm:text-sm bg-white border-2 border-green-900/60 focus:outline-none "
                />

                <button
                  onClick={handleSendOtp}
                  disabled={sendingOtp}
                  className="w-[95%] sm:w-[70%] sm:mt-3 lg:mt-4 bg-[#344E41] text-white py-3 lg:py-2 rounded-full font-medium hover:bg-emerald-900 transition-all duration-500 ease-in-out text-sm lg:text-base"
                >
                  {sendingOtp ? "Sending OTP..." : "Continue"}
                </button>
              </div>
              <div className="pt-3 sm:mt-12 text-center text-sm text-green-900/70 font-semibold ">
                We will send a 6-digit OTP to your email.
              </div>
            </section>

            <section className="w-full h-full flex flex-col justify-start p-4">
              <div className="flex flex-col gap-2 items-center ">
                <img
                  src={tick}
                  alt="Success"
                  className="w-12 h-12 sm:w-16 sm:h-16 animate-bounce"
                />
                <h3 className="text-lg font-semibold text-green-700">
                  OTP Sent Successfully!
                </h3>
                <p className="text-sm text-gray-500">
                  Please check your email to verify.
                </p>
              </div>

              <div className="relative">
                <div className="flex flex-col gap-2 justify-center lg:gap-3 sm:mt-3 lg:mt-2 w-full">
                  <div className="flex justify-center">
                    <div className="grid grid-cols-6 gap-1 lg:gap-2 w-[70%]  sm:flex-[0.8]" onPaste={handleOtpPaste} >
                      {otpInputs.map((digit, idx) => (
                        <input
                          key={idx}
                          ref={(el) => (inputRefs.current[idx] = el)}
                          type="text"
                          inputMode="numeric"
                          maxLength="1"
                          value={digit}
                          onChange={(e) => handleOtpChange(e.target.value, idx)}
                          onKeyDown={(e) => handleKeyDown(e, idx)}
                          className="w-14 h-14 text-center border-2 border-green-900/30 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-600 text-lg font-semibold"
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <button
                      onClick={handleVerifyOtp}
                      disabled={verifyingOtp}
                      className="w-[80%] mt-3 lg:mt-4 bg-[#344E41] text-white py-3 lg:py-2 rounded-full font-medium hover:bg-emerald-900 transition text-xs lg:text-base"
                    >
                      {verifyingOtp ? "Verifying..." : "Verify OTP"}
                    </button>
                  </div>
                </div>

                {otpVerified && (
                  <div className="flex items-center gap-2 mt-3 text-green-600 text-sm">
                    <svg
                      className="w-4 h-4"
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

              <div className="pt-2 sm:pt-4 text-xs text-gray-500 text-center mt-2">
                Didn't receive OTP? Try again or change email.
              </div>
            </section>
            <section className="w-full h-full p-3 sm:p-4 md:p-6 lg:p-8 flex flex-col gap-3 justify-start">
              <div>
                <label className="text-xs lg:text-sm font-medium text-gray-800 text-center">
                  Organization Code (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Enter Code Eg: CropGen01234"
                  value={formData.organizationCode || ""}
                  onChange={handleOrgCodeChange}
                  className={`mt-1 w-full rounded-xl px-2 py-1.5 lg:px-3 lg:py-2 text-xs lg:text-sm bg-white border ${
                    orgCodeError ? "border-red-500" : "border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-emerald-600`}
                />
                {orgCodeError && (
                  <div className="flex items-center gap-2 mt-2 text-red-600 text-xs lg:text-sm">
                    <svg
                      className="w-4 h-4"
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
                    , to the processing of my personal data, and to receive
                    emails
                  </label>
                </div>
              )}

              <div className="flex gap-3 justify-center">
                <button
                  type="button"
                  onClick={() => {
                    if (onboardingRequired) handleCompleteProfile();
                    else handleVerifyOtp();
                  }}
                  disabled={completingProfile}
                  className="w-[95%] sm:w-[70%] bg-[#344E41] text-white py-2.5 sm:py-3 rounded-full  font-medium hover:bg-emerald-900 transition-all duration-500 ease-in-out text-sm lg:text-base "
                >
                  {completingProfile ? "Processing..." : "Login / Sign Up"}
                </button>
              </div>

              <div className="flex items-center gap-2 w-[95%] sm:w-[70%] mx-auto">
                <hr className="flex-1 border-2 border-green-900" />
                <span className="text-xs text-green-900/80 font-semibold">
                  OR
                </span>
                <hr className="flex-1  border-2 border-green-900" />
              </div>

              <div>
                <SocialButtons />
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupLogin;
