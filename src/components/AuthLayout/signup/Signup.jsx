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

		if (!formData.email) {
		message.error("Email is required.");
		return false;
		}
		if (!emailRegex.test(formData.email)) {
		message.error("Invalid email format.");
		return false;
		}
		if (!formData.password) {
		message.error("Password is required.");
		return false;
		}
		if (formData.password.length < 6) {
		message.error("Password must be at least 6 characters.");
		return false;
		}
		if (!formData.terms) {
		message.warning("You must accept the terms.");
		return false;
		}

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
		<div className="w-full max-w-lg flex flex-col gap-3 lg:gap-4 items-start">
			{/* Heading */}
			<div className="w-full max-w-md lg:max-w-lg h-full flex flex-col justify-center gap-1 lg:gap-2">
				<h2 className="text-xl lg:text-[1.5rem] text-left font-semibold text-black capitalize mb-0">
					Get started with CropGen
				</h2>
				<p className="text-xs lg:text-sm text-left text-gray-400 font-semibold mb-0">
					Enter your personal data to create your account
				</p>
			</div>

			<div className="flex flex-col gap-3 lg:gap-4 w-full">
				{/* Email */}
				<div>
					<label
						htmlFor="email"
						className="block text-xs lg:text-base font-medium text-black mb-1">
						Email
					</label>
					<input
						type="email"
						name="email"
						id="email"
						placeholder="example@gmail.com*"
						className="w-full border-1 border-emerald-700 hover:border-emerald-600 focus:border-emerald-800 rounded-md px-3 py-2.5 text-xs text-gray-700 placeholder-gray-500 focus:outline-none transition duration-400 ease-in-out"
						value={formData.email}
						onChange={handleChange} />
				</div>

				{/* Password */}
				<div className="relative">
					<label
						htmlFor="password"
						className="block text-xs lg:text-base font-medium text-black mb-1">
						Password
					</label>
					<input
						type={showPassword ? "text" : "password"}
						name="password"
						id="password"
						placeholder="Password*"
						className="w-full border-1 border-emerald-700 hover:border-emerald-600 focus:border-emerald-800 rounded-md px-3 py-2.5 text-xs text-gray-700 placeholder-gray-500 focus:outline-none transition duration-400 ease-in-out"
						value={formData.password}
						onChange={handleChange} />
					<button
						type="button"
						onClick={() => setShowPassword((prev) => !prev)}
						className="absolute right-3 top-[2.5rem] sm:top-[2.8rem] md:top-[3rem] transform -translate-y-1/2 text-gray-500" >
							{showPassword ? (
								// <svg
								// 	className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6"
								// 	fill="none"
								// 	stroke="currentColor"
								// 	viewBox="0 0 24 24"
								// 	xmlns="http://www.w3.org/2000/svg"
								// >
								// 	<path
								// 	strokeLinecap="round"
								// 	strokeLinejoin="round"
								// 	strokeWidth={2}
								// 	d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a10.05 10.05 0 012.328-3.682m2.53-1.91A9.965 9.965 0 0112 5c4.477 0 8.268 2.943 9.542 7a10.05 10.05 0 01-4.207 5.137M15 12a3 3 0 11-6 0 3 3 0 016 0z"
								// 	/>
								// 	<path
								// 	strokeLinecap="round"
								// 	strokeLinejoin="round"
								// 	strokeWidth={2}
								// 	d="M3 3l18 18"
								// 	/>
								// </svg>
								<Eye size={20} strokeWidth={1.5} color="#A2A2A2" />
								) : (
								// <svg
								// 	className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6"
								// 	fill="none"
								// 	stroke="currentColor"
								// 	viewBox="0 0 24 24"
								// 	xmlns="http://www.w3.org/2000/svg"
								// >
								// 	<path
								// 	strokeLinecap="round"
								// 	strokeLinejoin="round"
								// 	strokeWidth={2}
								// 	d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
								// 	/>
								// 	<path
								// 	strokeLinecap="round"
								// 	strokeLinejoin="round"
								// 	strokeWidth={2}
								// 	d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
								// 	/>
								// </svg>
								<EyeOff size={20} strokeWidth={1.5} color="#A2A2A2" />
							)}
					</button>
				</div>

				{/* Organization Code */}
				<div>
					<label
						htmlFor="organizationCode"
						className="block text-xs lg:text-base font-medium text-black mb-1 capitalize">
						Organization code (optional)
					</label>
					<input
						type="text"
						name="organizationCode"
						id="organizationCode"
						placeholder="Enter Code Eg: CropGen01234"
						className="w-full border-1 border-emerald-700 hover:border-emerald-600 focus:border-emerald-800 rounded-md px-3 py-2.5 text-xs text-gray-700 placeholder-gray-500 focus:outline-none transition duration-400 ease-in-out"
						value={formData.organizationCode}
						onChange={handleChange} />
				</div>

				{/* Terms */}
				<div className="flex items-start gap-2">
					<input
						type="checkbox"
						name="terms"
						id="terms"
						className="w-4 h-4 md:w-6 md:h-6 accent-emerald-700 border-emerald-700 peer-checked:bg-[#075A53] peer-hover:bg-[#075A53] transition duration-400 ease-in-out rounded focus:ring-0 cursor-pointer"
						checked={formData.terms}
						onChange={handleChange} />
					<label
						htmlFor="terms"
						className="text-gray-700 text-xs" >
							I agree to the{" "}
						<a href="https://www.cropgenapp.com/terms-conditions" className="text-sky-500 hover:underline" target="_blank" >
							Terms and Privacy Policy
						</a>, to the processing of my personal data, and to receive emails
					</label>
				</div>

				{/* Submit Button */}
				<button
					type="button"
					onClick={handleSubmit}
					className="w-full bg-[#075A53] text-white py-2 sm:py-3 rounded-md md:text-base font-medium hover:bg-emerald-900 focus:outline-none transition duration-400 ease-in-out"
					disabled={status === "loading"} >
						{status === "loading" ? "Signing Up..." : "Login / Sign Up"}
				</button>

				{/* divider line */}
				<div className="flex items-center w-full">
					<div className="flex-1 h-px bg-gradient-to-l from-gray-300 to-transparent"></div>
					<span className="px-3 text-gray-400 text-xs uppercase">or</span>
					<div className="flex-1 h-px bg-gradient-to-r from-gray-300 to-transparent"></div>
				</div>

				{/* Google Sign-In */}
				<div className="w-full">
					<SocialButtons />
				</div>
			</div>
		</div>
	);
};

export default Signup;
