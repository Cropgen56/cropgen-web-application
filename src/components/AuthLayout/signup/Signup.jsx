import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { signupUser } from "../../../redux/slices/authSlice";
import SocialButtons from "../shared/socialbuttons/SocialButton";

const Signup = ({ setActiveTab }) => {
  const dispatch = useDispatch();
  const { status } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    organizationCode: "",
    terms: false,
  });
  const [showPassword, setShowPassword] = useState(false);

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
    const phoneRegex = /^\d{10}$/;

    if (!formData.firstName) {
      alert("First name is required.");
      return false;
    }
    if (!formData.lastName) {
      alert("Last name is required.");
      return false;
    }
    if (!formData.email) {
      alert("Email is required.");
      return false;
    }
    if (!emailRegex.test(formData.email)) {
      alert("Invalid email format.");
      return false;
    }
    if (!formData.phone) {
      alert("Phone number is required.");
      return false;
    }
    if (!phoneRegex.test(formData.phone)) {
      alert("Phone must be 10 digits.");
      return false;
    }
    if (!formData.password) {
      alert("Password is required.");
      return false;
    }
    if (formData.password.length < 6) {
      alert("Password must be at least 6 characters.");
      return false;
    }
    if (!formData.terms) {
      alert("You must accept the terms.");
      return false;
    }

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    dispatch(signupUser(formData)).then((res) => {
      if (res?.payload?.success) {
        alert(res.payload.message || "Signup successful!");
        setActiveTab("Login");
      } else {
        alert(res?.payload?.message || "Signup failed. Please try again.");
      }
    });
  };

  return (
    <div className="w-full max-w-md mx-auto px-2 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-1">
      {/* Heading */}
      <div className="text-left mb-6">
        <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-medium text-gray-800">
          Get started with cropgen
        </h2>
        <p className="text-xs sm:text-sm md:text-base text-gray-500 mt-2">
          Enter your personal data to create your account
        </p>
      </div>

      <div className="space-y-4 sm:space-y-5">
        {/* First and Last Name */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="w-full sm:w-1/2">
            <label
              htmlFor="firstName"
              className="block text-xs sm:text-sm md:text-base font-medium text-gray-700 mb-2"
            >
              First Name
            </label>
            <input
              type="text"
              name="firstName"
              id="firstName"
              placeholder="First Name"
              className="w-full border-0 bg-gray-200 rounded-md px-3 py-2 sm:py-3 text-xs sm:text-sm md:text-base text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-0"
              value={formData.firstName}
              onChange={handleChange}
            />
          </div>
          <div className="w-full sm:w-1/2">
            <label
              htmlFor="lastName"
              className="block text-xs sm:text-sm md:text-base font-medium text-gray-700 mb-2"
            >
              Last Name
            </label>
            <input
              type="text"
              name="lastName"
              id="lastName"
              placeholder="Last Name"
              className="w-full border-0 bg-gray-200 rounded-md px-3 py-2 sm:py-3 text-xs sm:text-sm md:text-base text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-0"
              value={formData.lastName}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="block text-xs sm:text-sm md:text-base font-medium text-gray-700 mb-2"
          >
            Email
          </label>
          <input
            type="email"
            name="email"
            id="email"
            placeholder="example@gmail.com"
            className="w-full border-0 bg-gray-200 rounded-md px-3 py-2 sm:py-3 text-xs sm:text-sm md:text-base text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-0"
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        {/* Phone */}
        <div className="relative">
          <label
            htmlFor="phone"
            className="block text-xs sm:text-sm md:text-base font-medium text-gray-700 mb-2"
          >
            Phone Number
          </label>
          <span className="absolute left-3 top-[2.5rem] sm:top-[2.8rem] md:top-[3rem] transform -translate-y-1/2 text-gray-500 text-xs sm:text-sm md:text-base">
            +91
          </span>
          <input
            type="tel"
            name="phone"
            id="phone"
            placeholder="Phone Number"
            className="w-full border-0 bg-gray-200 rounded-md pl-12 pr-3 py-2 sm:py-3 text-xs sm:text-sm md:text-base text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-0"
            value={formData.phone}
            onChange={handleChange}
          />
        </div>

        {/* Password */}
        <div className="relative">
          <label
            htmlFor="password"
            className="block text-xs sm:text-sm md:text-base font-medium text-gray-700 mb-2"
          >
            Password
          </label>
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            id="password"
            placeholder="Password"
            className="w-full border-0 bg-gray-200 rounded-md px-3 py-2 sm:py-3 text-xs sm:text-sm md:text-base text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-0"
            value={formData.password}
            onChange={handleChange}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-[2.5rem] sm:top-[2.8rem] md:top-[3rem] transform -translate-y-1/2 text-gray-500"
          >
            {showPassword ? (
              // Eye Off Icon
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a10.05 10.05 0 012.328-3.682m2.53-1.91A9.965 9.965 0 0112 5c4.477 0 8.268 2.943 9.542 7a10.05 10.05 0 01-4.207 5.137M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3l18 18"
                />
              </svg>
            ) : (
              // Eye Icon
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Organization Code */}
        <div>
          <label
            htmlFor="organizationCode"
            className="block text-xs sm:text-sm md:text-base font-medium text-gray-700 mb-2"
          >
            Organization Code (Optional)
          </label>
          <input
            type="text"
            name="organizationCode"
            id="organizationCode"
            placeholder="Organization Code (Optional)"
            className="w-full border-0 bg-gray-200 rounded-md px-3 py-2 sm:py-3 text-xs sm:text-sm md:text-base text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-0"
            value={formData.organizationCode}
            onChange={handleChange}
          />
        </div>

        {/* Terms */}
        <div className="flex items-center gap-2 text-xs sm:text-sm md:text-base">
          <input
            type="checkbox"
            name="terms"
            id="terms"
            className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 accent-gray-600 border-gray-300 rounded focus:ring-0 cursor-pointer"
            checked={formData.terms}
            onChange={handleChange}
          />
          <label
            htmlFor="terms"
            className="text-gray-700 text-xs sm:text-sm md:text-base"
          >
            I agree to the{" "}
            <a
              href="https://www.cropgenapp.com/terms-conditions"
              className="text-green-600 hover:underline"
              target="_blank"
            >
              Terms and Privacy Policy
            </a>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="button"
          onClick={handleSubmit}
          className="w-full bg-[#265A48] text-white py-2 sm:py-3 rounded-md text-sm md:text-base uppercase hover:bg-[#1f4a3a] focus:outline-none transition-colors duration-200"
          disabled={status === "loading"}
        >
          {status === "loading" ? "Signing Up..." : "Sign Up"}
        </button>

        {/* Google Sign-In */}
        <div className="w-full">
          <SocialButtons />
        </div>

        {/* Switch to Login */}
        <p className="text-center text-xs sm:text-sm md:text-base text-gray-600">
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => setActiveTab("Login")}
            className="text-green-700 font-medium hover:underline focus:outline-none"
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
};

export default Signup;
