import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { userLoginSignup } from "../../../redux/slices/authSlice";
import SocialButtons from "../shared/socialbuttons/SocialButton";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { message, Spin } from "antd";
import axios from "axios";
import { forgotPassword } from "../../../api/authApi";


const Signup = () => {
  const dispatch = useDispatch();
  const { status } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [scale, setScale] = useState(1);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    organizationCode: "",
    terms: false,
  });
  const [showPassword, setShowPassword] = useState(false);

  // Shrink UI if height is small
  useEffect(() => {
    const handleResize = () => {
      const screenHeight = window.innerHeight;
      if (screenHeight < 700) {
        setScale(screenHeight / 700);
      } else {
        setScale(1);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : name === "organizationCode"
            ? value.toUpperCase()
            : value,
    }));
  };

  const validate = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) return message.error("Email is required."), false;
    if (!emailRegex.test(formData.email))
      return message.error("Invalid email format."), false;
    if (!formData.password) return message.error("Password is required."), false;
    if (formData.password.length < 10 || formData.password.length > 15)
      return message.error("Password must be between 10 and 15 characters."), false;
    if (!formData.terms)
      return (
        message.error(
          "You must accept the Terms of Use and Privacy Policy."
        ),
        false
      );
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    dispatch(userLoginSignup(formData)).then((res) => {
      if (res?.payload?.token) {
        message.success("Signup successful!");
        navigate("/");
      } else {
        message.error(
          res?.payload?.message || "Signup failed. Please try again."
        );
      }
    });
  };
  
  const openEmailProvider = (email) => {
    const domain = email.split("@")[1].toLowerCase();

    if (domain.includes("gmail")) {
      window.open("https://mail.google.com", "_blank");
    } else if (domain.includes("outlook") || domain.includes("hotmail") || domain.includes("live")) {
      window.open("https://outlook.live.com", "_blank");
    } else if (domain.includes("yahoo")) {
      window.open("https://mail.yahoo.com", "_blank");
    } else {
      // Fallback
      window.open("https://" + domain, "_blank");
    }
  };


  // Handle forgot password
  const handleForgotPassword = async () => {

    if (!formData.email) return message.error("Please enter your email first");
    setLoading(true);
    try {
      const res = await forgotPassword(formData.email);
      message.success(res.message || "Password reset email sent!");
      setTimeout(() => {
        setLoading(false);
        openEmailProvider(formData.email);
      }, 1000);
    } catch (err) {
      message.error(err.response?.data?.message || "Error sending reset email");
    }
  };

  return (
    <div
      className="w-full flex items-center justify-center h-full"
    >
      <div
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "center",
          transition: "transform 0.2s ease",
        }}
      >
        <div
          className="p-6 md:p-10 lg:p-14 w-[90vw] max-w-sm lg:max-w-xl xl:max-w-2xl"
        >
          {/* Heading */}
          <div className="mb-8 text-center">
            <h2 className="text-lg md:text-2xl lg:text-3xl font-semibold text-black">
              Get started with CropGen
            </h2>
            <p className="text-xs md:text-sm lg:text-base text-[#9A9898] mt-1 font-medium">
              Enter Your Personal data to Create your account
            </p>
          </div>

          {/* Form */}
          <div className="space-y-4">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="text-xs md:text-sm font-medium text-gray-800"
              >
                Email
              </label>
              <input
                type="email"
                name="email"
                placeholder="example@gmail.com*"
                value={formData.email}
                onChange={handleChange}
                className="mt-1 w-full rounded-md px-3 py-2 text-sm bg-white/80 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <label
                htmlFor="password"
                className="text-xs md:text-sm font-medium text-gray-800"
              >
                Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password*"
                value={formData.password}
                onChange={handleChange}
                className="mt-1 w-full rounded-md px-3 py-2 text-sm bg-white/80 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-9 text-gray-500"
              >
                {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
              </button>
              {/*  Forgot Password Button */}
              <div className="text-right text-xs mt-1">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-gray-600 hover:underline"
                >
                  {loading ? <Spin size="small" /> : "Forgot Password"}
                </button>
              </div>
            </div>

            {/* Organization Code */}
            <div>
              <label
                htmlFor="organizationCode"
                className="text-xs md:text-sm font-medium text-gray-800"
              >
                Organization Code (Optional)
              </label>
              <input
                type="text"
                name="organizationCode"
                placeholder="Enter Code Eg: CropGen01234"
                value={formData.organizationCode}
                onChange={handleChange}
                className="mt-1 w-full rounded-md px-3 py-2 text-sm bg-white/80 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            {/* Terms */}
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                name="terms"
                checked={formData.terms}
                onChange={handleChange}
                className="mt-1 w-4 h-4 text-emerald-600 border-gray-300 rounded"
              />
              <label
                htmlFor="terms"
                className="text-[10px] md:text-xs text-gray-700"
              >
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

            {/* Submit */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={status === "loading"}
              className="w-full bg-[#344E41] text-white py-2 rounded-md font-medium hover:bg-emerald-900 transition"
            >
              {status === "loading" ? "Signing Up..." : "Login / Sign Up"}
            </button>

            {/* OR */}
            <div className="flex items-center gap-2 mt-2">
              <hr className="flex-1 border-[#075A53]" />
              <span className="text-xs text-gray-600">OR</span>
              <hr className="flex-1 border-[#075A53]" />
            </div>

            {/* Google Sign-In */}
            <SocialButtons />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
