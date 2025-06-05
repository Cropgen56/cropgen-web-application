// Signnup.jsx
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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const validate = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{10}$/;
    if (!formData.firstName || !formData.lastName)
      return alert("Name is required.");
    if (!formData.email || !emailRegex.test(formData.email))
      return alert("Invalid email.");
    if (!formData.phone || !phoneRegex.test(formData.phone))
      return alert("Phone must be 10 digits.");
    if (!formData.password || formData.password.length < 6)
      return alert("Password must be at least 6 characters.");
    if (!formData.terms) return alert("You must accept the terms.");
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
    <>
      {/* Style override for small screens */}
      <style>{`
        @media (max-width: 389px) {
          .fix-h2-mobile {
            position: static !important;
            top: auto !important;
            z-index: 9999 !important;
            background-color: white !important;
            margin-top: 1rem;
          }

          form, .form-container, .container, .parent {
            overflow: visible !important;
          }
        }
      `}</style>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-4 px-4 mt-12 md:mt-2"
      >
        {/* Heading */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 md:text-left fix-h2-mobile">
            Get started with CropGen
          </h2>
          <p className="text-sm text-gray-600 md:text-left">
            Enter your personal data to create your account.
          </p>
        </div>

        {/* First and Last Name */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-1/2">
            <label
              htmlFor="firstName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              First Name
            </label>
            <input
              type="text"
              name="firstName"
              id="firstName"
              placeholder="First Name"
              className="w-full border border-gray-200 rounded-md px-3 py-1 text-sm"
              value={formData.firstName}
              onChange={handleChange}
            />
          </div>
          <div className="w-full md:w-1/2">
            <label
              htmlFor="lastName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Last Name
            </label>
            <input
              type="text"
              name="lastName"
              id="lastName"
              placeholder="Last Name"
              className="w-full border border-gray-200 rounded-md px-3 py-1 text-sm"
              value={formData.lastName}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email
          </label>
          <input
            type="email"
            name="email"
            id="email"
            placeholder="Email"
            className="w-full border border-gray-200 rounded-md px-3 py-1 text-sm"
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        {/* Phone */}
        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Phone Number
          </label>
          <input
            type="tel"
            name="phone"
            id="phone"
            placeholder="+91 **********"
            className="w-full border border-gray-200 rounded-md px-3 py-1 text-sm"
            value={formData.phone}
            onChange={handleChange}
          />
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Password
          </label>
          <input
            type="password"
            name="password"
            id="password"
            placeholder="Password"
            className="w-full border border-gray-200 rounded-md px-3 py-1 text-sm"
            value={formData.password}
            onChange={handleChange}
          />
        </div>

        {/* Organization Code */}
        <div>
          <label
            htmlFor="organizationCode"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Organization Code (Optional)
          </label>
          <input
            type="text"
            name="organizationCode"
            id="organizationCode"
            placeholder="Organization Code (Optional)"
            className="w-full border border-gray-200 rounded-md px-3 py-1 text-sm"
            value={formData.organizationCode}
            onChange={(e) =>
              setFormData({ ...formData, organizationCode: e.target.value.toUpperCase() })
            }
          />
        </div>

        {/* Terms */}
        <div className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            name="terms"
            id="terms"
            className="mt-1 accent-green-600"
            checked={formData.terms}
            onChange={handleChange}
          />
          <label htmlFor="terms" className="text-gray-700">
            I agree to the{" "}
            <a href="#" className="text-green-600 underline">
              Terms
            </a>{" "}
            and{" "}
            <a href="#" className="text-green-600 underline">
              Privacy Policy
            </a>
            .
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-green-800 text-white py-2 rounded-md text-sm hover:bg-green-700"
          disabled={status === "loading"}
        >
          {status === "loading" ? "Signing Up..." : "Sign Up"}
        </button>

        {/* Google Sign-In */}
        <div className="w-full text-white py-2 rounded-md text-sm ">
          <SocialButtons />
        </div>

        {/* Switch to Login */}
        <p className="text-center text-sm text-gray-600">
          Already have an account?{" "}
          <span
            onClick={() => setActiveTab("Login")}
            className="text-green-700 font-medium cursor-pointer"
          >
            Login
          </span>
        </p>
      </form>
    </>
  );
};

export default Signup;
