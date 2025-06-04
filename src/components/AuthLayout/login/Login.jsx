import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { signinUser } from "../../../redux/slices/authSlice";
import { useNavigate } from "react-router-dom";

const Login = ({ setActiveTab }) => {
  const [formData, setFormData] = useState({ email: "", password: "" });

  const dispatch = useDispatch();
  const { status } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validate = () => {
    const emailRegex = /\S+@\S+\.\S+/;
    if (!formData.email) {
      alert("Email is required.");
      return false;
    } else if (!emailRegex.test(formData.email)) {
      alert("Enter a valid email.");
      return false;
    }

    if (!formData.password) {
      alert("Password is required.");
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
            alert(result.payload.message);
            navigate("/");
          } else {
            alert(result.payload.message);
          }
        })
        .catch(() => {});
    }
  };

  return (
    <form
      className="w-full max-w-md space-y-6 px-4 sm:px-0 mt-8 sm:mt-12"
      onSubmit={handleSubmit}
    >
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Login to your account</h2>
        <p className="text-sm text-gray-600">Enter your credentials to continue.</p>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          type="text"
          id="email"
          name="email"
          placeholder="example@gmail.com"
          className="w-full border border-gray-200 rounded-md px-4 py-2 text-sm"
          value={formData.email}
          onChange={handleChange}
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <input
          type="password"
          id="password"
          name="password"
          placeholder="Password"
          className="w-full border border-gray-200 rounded-md px-4 py-2 text-sm"
          value={formData.password}
          onChange={handleChange}
        />
      </div>

      <button
        type="submit"
        className="w-full bg-green-800 text-white py-2 rounded-md text-sm hover:bg-green-700"
        disabled={status === "loading"}
      >
        {status === "loading" ? "Logging in..." : "Login"}
      </button>

      <p className="text-center text-sm text-gray-600">
        Don't have an account?{" "}
        <span
          onClick={() => setActiveTab("SignUp")}
          className="text-green-700 font-medium cursor-pointer"
        >
          Sign up
        </span>
      </p>
    </form>
  );
};

export default Login;
