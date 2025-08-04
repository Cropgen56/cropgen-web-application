import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { userLoginSignup } from "../../../redux/slices/authSlice";
import SocialButtons from "../shared/socialbuttons/SocialButton";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { message } from "antd";

const Signup = () => {
	const dispatch = useDispatch();
	const { status } = useSelector((state) => state.auth);
	const navigate = useNavigate();

	const [formData, setFormData] = useState({
		email: "",
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
		if (!formData.email) return message.error("Email is required.");
		if (!emailRegex.test(formData.email)) return message.error("Invalid email format.");
		if (!formData.password) return message.error("Password is required.");
		if (formData.password.length < 6)
			return message.error("Password must be at least 6 characters.");
		if (!formData.terms) return message.warning("You must accept the terms.");
		return true;
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		if (!validate()) return;

		dispatch(userLoginSignup(formData)).then((res) => {
			if (res?.payload?.success) {
				message.success(res.payload.message || "Signup successful!");
				navigate("/");
			} else {
				message.error(res?.payload?.message || "Signup failed. Please try again.");
			}
		});
	};

	return (
		<div className="w-full max-w-lg">
			<div
				className="border border-white/30 shadow-xl rounded-xl sm:p-8 lg:p-14 w-full"
				style={{ background: "#FFFFFF80" }}
			>
				{/* Heading */}
				<div className="mb-10">
					<h2 className="text-xl md:text-[27px] lg:text-3xl font-semibold text-[#344E41]">
						Get Start With Cropgen
					</h2>
					<p className="text-xs md:text-[13px] lg:text-base text-white mt-1 font-semibold">
						Enter Your Personal data to Create your account
					</p>
				</div>

				{/* Form Fields */}
				<div className="space-y-4">
					{/* Email */}
					<div>
						<label htmlFor="email" className="text-xs md:text-[13px] font-medium text-gray-800">
							Email
						</label>
						<input
							type="email"
							name="email"
							id="email"
							placeholder="example@gmail.com*"
							value={formData.email}
							onChange={handleChange}
							className="mt-1 w-full rounded-md px-3 py-2 text-sm bg-white/80 border border-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-600"
						/>
					</div>

					{/* Password */}
					<div className="relative">
						<label htmlFor="password" className="text-xs md:text-[13px] font-medium text-gray-800">
							Password
						</label>
						<input
							type={showPassword ? "text" : "password"}
							name="password"
							id="password"
							placeholder="Password*"
							value={formData.password}
							onChange={handleChange}
							className="mt-1 w-full rounded-md px-3 py-2 text-sm bg-white/80 border border-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-600"
						/>
						<button
							type="button"
							onClick={() => setShowPassword((prev) => !prev)}
							className="absolute right-3 top-9 text-gray-500"
						>
							{showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
						</button>
						<div className="text-right text-xs mt-1">
							<a href="#" className="text-white hover:underline">
								Reset Password
							</a>
						</div>
					</div>

					{/* Organization Code */}
					<div>
						<label htmlFor="organizationCode" className="text-xs md:text-[13px] font-medium text-gray-800">
							Organization Code (Optional)
						</label>
						<input
							type="text"
							name="organizationCode"
							id="organizationCode"
							placeholder="Enter Code Eg: CropGen01234"
							value={formData.organizationCode}
							onChange={handleChange}
							className="mt-1 w-full rounded-md px-3 py-2 text-sm bg-white/80 border border-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-600"
						/>
					</div>

					{/* Terms */}
					<div className="flex items-start gap-2">
						<input
							type="checkbox"
							name="terms"
							id="terms"
							checked={formData.terms}
							onChange={handleChange}
							className="mt-1 w-4 h-4 text-emerald-600 border-gray-300 rounded"
						/>
						<label htmlFor="terms" className="text-[10px] md:text-[11px] text-gray-700">
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

					{/* OR Divider */}
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
	);
};

export default Signup;
