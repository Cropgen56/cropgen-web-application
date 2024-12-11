import React, { useState } from "react";
import "./Signup.css";
import { useDispatch, useSelector } from "react-redux";
import { signupUser } from "../../../redux/slices/authSlice";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const Signup = ({ setActiveTab }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Local state to manage form data
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    terms: false,
  });

  // Get the loading state from Redux
  const { loading, status } = useSelector((state) => state.auth);

  // Handle form data change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "phone" && isNaN(value)) return;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Validate form data
  const validate = () => {
    const nameRegex = /^[A-Za-z]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{10}$/;

    if (!formData.firstName || !nameRegex.test(formData.firstName)) {
      toast.warning("First name must only contain letters.");
      return false;
    }

    if (!formData.lastName || !nameRegex.test(formData.lastName)) {
      toast.warning("Last name must only contain letters.");
      return false;
    }

    if (!formData.email || !emailRegex.test(formData.email)) {
      toast.warning("Please enter a valid email address.");
      return false;
    }

    if (!formData.phone || !phoneRegex.test(formData.phone)) {
      toast.warning("Phone number must be exactly 10 digits.");
      return false;
    }

    if (!formData.password || formData.password.length < 6) {
      toast.warning("Password must be at least 6 characters.");
      return false;
    }

    if (!formData.terms) {
      toast.warning("You must agree to the terms and conditions.");
      return false;
    }

    return true;
  };

  // Handle form submission
  const handleSignUp = async (event) => {
    event.preventDefault();

    if (!validate()) return;

    dispatch(signupUser(formData))
      .then((result) => {
        if (result.payload.success) {
          toast.success(result.payload.message);
          setActiveTab("Login");
        }
        if (!result.payload.success) {
          toast.error(result.payload.message);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <div className="container mt-0 px-2 signup-form">
      <div className="row justify-content-center">
        <div className="col-md-12 col-sm-12">
          <form onSubmit={handleSignUp}>
            {/* Name Fields */}
            <div className="row">
              <div className="col-md-6">
                <label htmlFor="firstName" className="form-label">
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  className="form-input"
                  value={formData.firstName}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-6">
                <label htmlFor="lastName" className="form-label">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  className="form-input"
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="form-input"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            {/* Phone Number Field */}
            <div>
              <label htmlFor="phone" className="form-label">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                className="form-input"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                className="form-input"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            {/* Terms and Conditions */}
            <div className="form-check my-1">
              <input
                type="checkbox"
                className="form-check-input"
                id="termsCheckbox"
                name="terms"
                checked={formData.terms}
                onChange={handleChange}
              />
              <label className="form-check-label" htmlFor="termsCheckbox">
                I agree to the Terms of Use and Privacy Policy, to the
                processing of my personal data, and to receive emails.
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="submit-button mb-2"
              disabled={loading}
            >
              {loading ? "Signing Up..." : "Sign Up"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;
