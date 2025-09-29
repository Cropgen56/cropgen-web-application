import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { message } from "antd";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import bgimage from "../../../assets/image/Group1.png"; // new background
import tick from "../../../assets/image/Group 535.png"; // new tick image
import { resetPassword } from "../../../api/authApi";


const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || !confirm) return message.error("All fields required");
    if (password !== confirm) return message.error("Passwords do not match");
    if (password.length < 10) return message.error("Password must be at least 10 characters");

    try {
      const res = await resetPassword(token, password);
      message.success(res.message || "Password reset successful!");
      setIsSuccess(true);
    } catch (err) {
      message.error(err.response?.data?.message || "Error resetting password");
    }
  };

  return (
    <div
      className="w-full h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(${bgimage})` }}
    >
      {isSuccess ? (
        <div className="border border-white/30 shadow-xl rounded-xl px-8 py-10 sm:p-12 lg:p-16 w-[90vw] max-w-lg backdrop-blur-md bg-white/40 h-[85vh] flex flex-col justify-center text-center">
          {/* Custom tick image */}
          <div className="flex justify-center mb-20">
            <img src={tick} alt="success" className="w-30 h-30 object-contain" />
          </div>

          <h2 className="text-2xl md:text-3xl font-bold text-[#344E41] mb-10">
            Your password has been successfully reset!
          </h2>

          <p className="text-sm  text-white font-bold mb-10">
            You can now login with your new password. If you encounter any
            issues, please contact support.
          </p>

          <button
            onClick={() => navigate("/login")}
            className="w-full bg-[#075A53] text-white py-3 rounded-lg font-semibold hover:bg-emerald-900 transition"
          >
            Back to Login
          </button>
        </div>
      ) : (
        <div className="border border-white/30 shadow-xl rounded-xl px-8 py-10 sm:p-12 lg:p-16 w-[90vw] max-w-lg backdrop-blur-md bg-white/40 h-[85vh] ">
          {/* Back button */}
          <button
            onClick={() => navigate("/login")}
            className="flex items-center gap-2 text-gray-700 hover:text-emerald-700 mb-6"
          >
            <ArrowLeft size={20} />
            <span className="text-sm font-medium">Back</span>
          </button>

          {/* Heading */}
          <h2 className="text-2xl md:text-3xl font-bold text-center text-[#344E41] mb-3">
            Create a New Password
          </h2>
          <p className="text-center text-gray-600 text-sm md:text-base mb-10 text-white font-bold">
            Enter your new password below to complete the reset process. Ensure
            it’s strong and secure.
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="w-full rounded-md px-3 py-2 text-sm bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-500"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Must be at least 10 characters
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">
                Repeat New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Confirm your password"
                  className="w-full rounded-md px-3 py-2 text-sm bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-2.5 text-gray-500"
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-[#075A53] text-white py-3 rounded-md font-semibold hover:bg-emerald-900 transition"
            >
              Submit
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ResetPassword;
