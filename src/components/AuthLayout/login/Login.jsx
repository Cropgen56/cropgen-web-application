import React, { useState } from "react";
import "./Login.css";
import { useDispatch, useSelector } from "react-redux";
import { signinUser } from "../../../redux/slices/authSlice";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { combineSlices } from "@reduxjs/toolkit";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });

  const dispatch = useDispatch();
  const { status, error } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validate = () => {
    const emailRegex = /\S+@\S+\.\S+/;
    if (!formData.email) {
      toast.warning("Email is required.");
      return false;
    } else if (!emailRegex.test(formData.email)) {
      toast.warning("Enter a valid email.");
      return false;
    }

    if (!formData.password) {
      toast.warning("Password is required.");
      return false;
    }

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      dispatch(signinUser(formData))
        .then((result) => {
          if (result.payload.success) {
            toast.success(result.payload.message);
            navigate("/");
          }
          if (!result.payload.success) {
            toast.error(result.payload.message);
          }
        })
        .catch((err) => {});
    }
  };

  return (
    <form className="auth-form-login py-3" onSubmit={handleSubmit}>
      <div className="auth-form-group">
        <label htmlFor="email" className="auth-form-label">
          Email
        </label>
        <input
          type="tex"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="auth-form-input"
          placeholder="example@gmail.com"
        />
      </div>

      <div className="auth-form-group">
        <label htmlFor="password" className="auth-form-label">
          Password
        </label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          className="auth-form-input"
          placeholder="Password"
        />
      </div>

      <button
        type="submit"
        className="auth-form-button mb-3"
        disabled={status === "loading"}
      >
        Login
      </button>
    </form>
  );
};

export default Login;
