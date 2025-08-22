import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { userLoginSignup } from "../../../redux/slices/authSlice";
import SocialButtons from "../shared/socialbuttons/SocialButton";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { message } from "antd";
import axios from "axios"; 

const Signup = () => {
  const dispatch = useDispatch();
  const { status } = useSelector((state) => state.auth);
  const navigate = useNavigate();

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
    if (formData.password.length < 6)
      return message.error("Password must be at least 6 characters."), false;
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

  // Handle forgot password
  const handleForgotPassword = async () => {
    if (!formData.email) return message.error("Please enter your email first");
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/auth/forgot-password`,
        { email: formData.email }
      );
      message.success(res.data.message || "Password reset email sent!");
    } catch (err) {
      message.error(
        err.response?.data?.message || "Error sending reset email"
      );
    }
  };

  return (
    <div
      className="w-full h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: "url('/your-bg.jpg')" }}
    >
      <div
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "center",
          transition: "transform 0.2s ease",
        }}
      >
        <div
          className="border border-white/30 shadow-xl rounded-xl p-6 sm:p-8 lg:p-14 w-[90vw] max-w-lg"
          style={{ background: "#FFFFFF80" }}
        >
          {/* Heading */}
          <div className="mb-8 text-center">
            <h2 className="text-lg md:text-2xl lg:text-3xl font-semibold text-[#344E41]">
              Get Start With Cropgen
            </h2>
            <p className="text-xs md:text-sm lg:text-base text-white mt-1 font-semibold">
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
                  className="text-white hover:underline"
                >
                  Forgot Password
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
              className="w-full bg-[#075A53] text-white py-2 rounded-md font-medium hover:bg-emerald-900 transition"
            >
              {status === "loading" ? "Signing Up..." : "Login / Sign Up"}
            </button>

            {/* OR */}
            <div className="flex items-center gap-2 mt-2">
              <hr className="flex-1 border-gray-300" />
              <span className="text-xs text-gray-600">OR</span>
              <hr className="flex-1 border-gray-300" />
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
