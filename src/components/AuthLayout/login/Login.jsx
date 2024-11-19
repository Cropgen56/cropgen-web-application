import React, { useState } from "react";
import "./Login.css";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validate = () => {
    let isValid = true;
    const newErrors = { email: "", password: "" };

    if (!formData.email) {
      newErrors.email = "Email is required.";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Enter a valid email.";
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = "Password is required.";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      console.log("Login data: ", formData);
    }
  };

  return (
    <form className="auth-form-login" onSubmit={handleSubmit}>
      <div className="auth-form-group">
        <label htmlFor="email" className="auth-form-label">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="auth-form-input"
          placeholder="example@gmail.com"
        />
        {errors.email && (
          <span className="auth-form-error">{errors.email}</span>
        )}
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
        {errors.password && (
          <span className="auth-form-error">{errors.password}</span>
        )}
      </div>

      <button type="submit" className="auth-form-button">
        Login
      </button>
    </form>
  );
};

export default Login;
