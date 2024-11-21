// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { Form, Input, Button, Row, Col, message } from "antd";
// import "antd/dist/reset.css"; // Import Ant Design styles
// import { useNavigate } from "react-router-dom";
// import FlagsSelect from "react-flags-select";
// import "react-phone-input-2/lib/style.css";
// // import Component from "../../src/assets/Component.png";/
// import "../components/oldcomponents/i18n";

// import { useTranslation } from "react-i18next";
// import { t } from "i18next";

// const countryLanguages = {
//   IN: "hi", // India - Hindi
//   US: "en", // United States - English
//   CA: "en", // Canada - English (you might want to add French as well)
//   GB: "en", // United Kingdom - English
//   AU: "en", // Australia - English
//   FR: "fr", // France - French
//   DE: "en", // Germany - English (add German if you have translations)
//   IT: "en", // Italy - English (add Italian if you have translations)
//   JP: "en", // Japan - English (add Japanese if you have translations)
//   CN: "en", // China - English (add Chinese if you have translations)
// };

// const Login = () => {
//   const [isLogin, setIsLogin] = useState(true);
//   const [loading, setLoading] = useState(false);
//   const [country, setCountry] = useState("IN");
//   const navigate = useNavigate();
//   const { t, i18n } = useTranslation();
//   console.log("Current language:", i18n.language);
//   console.log("Translations:", t("login"), t("submit"));
//   console.log("Translations:", t("login"), t("submit"));

//   useEffect(() => {
//     console.log("Language changed:", i18n.language);
//   }, [i18n.language]);

//   const changeLanguage = (countryCode) => {
//     setCountry(countryCode);
//     const language = countryLanguages[countryCode] || "en";
//     i18n.changeLanguage(language); // Change the language based on the country code
//   };

//   // Function to handle form submission
//   const handleLogin = async (values) => {
//     setLoading(true);
//     try {
//       const response = await axios.post(
//         "https://first-project-jx9w.onrender.com/login",
//         {
//           email: values.email,
//           password: values.password,
//         }
//       );

//       message.success("Login successful!");
//       console.log("Response:", response.data);

//       // Store user info in local storage (if needed)
//       localStorage.setItem("user", JSON.stringify(response.data.user));

//       // Redirect to Dashboard
//       navigate("/dashboard"); // Redirect to Dashboard.jsx
//     } catch (error) {
//       if (error.response && error.response.data.detail) {
//         message.error(error.response.data.detail);
//       } else {
//         message.error("Login failed. Please try again.");
//       }
//     }
//     setLoading(false);
//   };

//   // Function to handle signup
//   const handleSignup = async (values) => {
//     setLoading(true);
//     try {
//       const response = await axios.post(
//         "https://first-project-jx9w.onrender.com/Farmers",
//         {
//           name: `${values.firstName} ${values.lastName}`, // Combine first and last name
//           email: values.email,
//           phone: values.phone,
//           password: values.password,
//           address: "", // You may want to add an address input field
//         }
//       );

//       message.success(response.data.message); // Show success message
//       console.log("Response:", response.data);

//       // Store user info in local storage (if needed)
//       localStorage.setItem("user", JSON.stringify(response.data.user));

//       // Redirect to Dashboard
//       navigate("/dashboard"); // Redirect to Dashboard.jsx

//       // Optionally, navigate to another page or clear the form
//     } catch (error) {
//       if (error.response && error.response.data.detail) {
//         message.error(error.response.data.detail); // Show error message
//       } else {
//         message.error("Registration failed. Please try again."); // Generic error message
//       }
//     }
//     setLoading(false); // Reset loading state
//   };

//   return (
//     <div style={{ display: "flex", height: "100vh" }}>
//       {/* Left half: Image */}
//       <div style={{ width: "45%", position: "relative" }}>
//         <img
//           // src={Component} // Path to the local image
//           alt="Background"
//           style={{ width: "100%", height: "100%" }}
//         />
//       </div>

//       {/* Right half: Form with background */}
//       <div
//         style={{
//           width: "55%",
//           display: "flex",
//           flexDirection: "column",
//           backgroundColor: "#075A53",
//         }}
//       >
//         <div style={{ position: "absolute", top: 20, right: 20 }}>
//           <FlagsSelect
//             selected={country}
//             onSelect={changeLanguage}
//             countries={[
//               "IN",
//               "US",
//               "CA",
//               "GB",
//               "AU",
//               "FR",
//               "DE",
//               "IT",
//               "JP",
//               "CN",
//             ]}
//             placeholder="Select Country"
//             className="flag-select"
//             styles={{
//               select: {},
//             }}
//           />
//           <span style={{ color: "#ffff", marginLeft: "8px" }}>
//             {i18n.language.toUpperCase()}
//             {/* Display the official language */}
//           </span>
//         </div>
//         <div
//           style={{
//             flex: 1,
//             display: "flex",
//             flexDirection: "column",
//             position: "absolute",
//             top: 100,
//             right: 150,
//           }}
//         >
//           <div style={{ width: "100%", height: "100%" }}>
//             <div
//               style={{
//                 backgroundColor: "#2E7670",
//                 borderRadius: "20px",
//                 border: "solid 2px #fff",
//                 width: 500,
//                 height: "auto",
//               }}
//             >
//               {/* Login/Signup toggle */}
//               <div style={{ display: "flex", marginBottom: "10px" }}>
//                 <Button
//                   type="text"
//                   htmlType="submit"
//                   block
//                   loading={loading}
//                   onClick={() => setIsLogin(true)}
//                   style={{
//                     flex: 1,
//                     backgroundColor: isLogin ? "#075A53" : "transparent",
//                     color: "#fff",
//                     fontWeight: "bold",
//                     borderTopLeftRadius: "18px",
//                     borderBottomLeftRadius: 0,
//                     borderBottomRightRadius: 0,
//                     borderTopRightRadius: 0,
//                     fontSize: 20,
//                     padding: 35,
//                     borderColor: isLogin ? "#fff" : "",
//                   }}
//                 >
//                   {t("Sign Up")}
//                 </Button>
//                 <Button
//                   type="text"
//                   onClick={() => setIsLogin(false)}
//                   style={{
//                     flex: 1,
//                     backgroundColor: !isLogin ? "#075A53" : "transparent",
//                     color: "#fff",
//                     fontWeight: "bold",
//                     borderTopRightRadius: "18px",
//                     borderBottomLeftRadius: 0,
//                     borderBottomRightRadius: 0,
//                     borderTopLeftRadius: 0,
//                     fontSize: 20,
//                     padding: 35,
//                     borderColor: !isLogin ? "#fff" : "",
//                   }}
//                 >
//                   {t("Login")}
//                 </Button>
//               </div>
//               <div style={{ padding: "25px" }}>
//                 {/* Google and Facebook buttons */}
//                 {/* <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '16px' }}>
//                 <Button
//                   type="default"
//                   style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', backgroundColor: '#4285F4', color: '#fff', borderRadius: '8px', padding: '20px 140px' }}
//                 >
//                   <GoogleOutlined style={{ marginRight: '8px' }} />
//                   Google
//                 </Button>
//                 <Button
//                   type="default"
//                   style={{ display: 'flex', alignItems: 'center', backgroundColor: '#3b5998', color: '#fff', borderRadius: '8px', padding: '20px 132px' }}
//                 >
//                   <FacebookOutlined style={{ marginRight: '8px' }} />
//                   Facebook
//                 </Button>
//               </div> */}

//                 {isLogin ? (
//                   <SignupForm onSignup={handleSignup} />
//                 ) : (
//                   <LoginForm onLogin={handleLogin} loading={loading} />
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// const LoginForm = ({ onLogin, loading }) => (
//   <Form
//     name="login"
//     layout="vertical"
//     onFinish={onLogin}
//     style={{ display: "flex", flexDirection: "column", gap: "16px" }}
//   >
//     <Form.Item
//       name="email"
//       label={
//         <span style={{ color: "white", fontWeight: "bold" }}>{t("Email")}</span>
//       }
//       rules={[{ required: true, message: "Please enter your email!" }]}
//     >
//       <Input
//         style={{
//           backgroundColor: "#075A53",
//           color: "#ffff",
//           borderColor: "#075A53",
//           borderRadius: "4px",
//         }}
//         placeholder={t("Enter your email")}
//         placeholderColor="color: #fff"
//       />
//     </Form.Item>
//     <Form.Item
//       name="password"
//       label={
//         <span style={{ color: "white", fontWeight: "bold" }}>
//           {t("Password")}
//         </span>
//       }
//       rules={[{ required: true, message: "Please enter your password!" }]}
//     >
//       <Input.Password
//         style={{
//           backgroundColor: "#075A53",
//           color: "#fff",
//           borderColor: "#075A53",
//           borderRadius: "4px",
//         }}
//         placeholder={t("Enter your password")}
//       />
//     </Form.Item>
//     <Form.Item>
//       <Button
//         type="primary"
//         htmlType="submit"
//         block
//         loading={loading}
//         style={{ backgroundColor: "#3592FD" }}
//       >
//         {t("Login")}
//       </Button>
//     </Form.Item>
//   </Form>
// );

// const SignupForm = ({ onSignup }) => (
//   <Form
//     name="signup"
//     layout="vertical"
//     onFinish={onSignup}
//     style={{ display: "flex", flexDirection: "column", gap: "16px" }}
//   >
//     <Row gutter={16}>
//       <Col span={12}>
//         <Form.Item
//           name="firstName"
//           label={
//             <span style={{ color: "white", fontWeight: "bold" }}>
//               {t("First Name")}
//             </span>
//           }
//           rules={[{ required: true, message: "Please enter your first name!" }]}
//         >
//           <Input
//             style={{
//               backgroundColor: "#075A53",
//               color: "#fff",
//               borderColor: "#075A53",
//               borderRadius: "4px",
//             }}
//             placeholder={t("Enter your first name")}
//           />
//         </Form.Item>
//       </Col>
//       <Col span={12}>
//         <Form.Item
//           name="lastName"
//           label={
//             <span style={{ color: "white", fontWeight: "bold" }}>
//               {t("Last Name")}
//             </span>
//           }
//           rules={[{ required: true, message: "Please enter your last name!" }]}
//         >
//           <Input
//             style={{
//               backgroundColor: "#075A53",
//               color: "#fff",
//               borderColor: "#075A53",
//               borderRadius: "4px",
//             }}
//             placeholder={t("Enter your last name")}
//           />
//         </Form.Item>
//       </Col>
//     </Row>
//     <Form.Item
//       name="email"
//       label={
//         <span style={{ color: "white", fontWeight: "bold" }}>{t("Email")}</span>
//       }
//       rules={[{ required: true, message: "Please enter your email!" }]}
//     >
//       <Input
//         style={{
//           backgroundColor: "#075A53",
//           color: "#fff",
//           borderColor: "#075A53",
//           borderRadius: "4px",
//         }}
//         placeholder={t("Enter your email")}
//       />
//     </Form.Item>
//     <Form.Item
//       name="phone"
//       label={
//         <span style={{ color: "white", fontWeight: "bold" }}>
//           {t("Phone Number")}
//         </span>
//       }
//       rules={[{ required: true, message: "Please enter your phone number!" }]}
//     >
//       <Input
//         style={{
//           backgroundColor: "#075A53",
//           color: "#fff",
//           borderColor: "#075A53",
//           borderRadius: "4px",
//         }}
//         placeholder={t("Enter your phone number")}
//       />
//     </Form.Item>
//     <Form.Item
//       name="password"
//       label={
//         <span style={{ color: "white", fontWeight: "bold" }}>
//           {t("Password")}
//         </span>
//       }
//       rules={[{ required: true, message: "Please enter your password!" }]}
//     >
//       <Input.Password
//         style={{
//           backgroundColor: "#075A53",
//           color: "#fff",
//           borderColor: "#075A53",
//           borderRadius: "4px",
//         }}
//         placeholder={t("Enter your password")}
//       />
//     </Form.Item>
//     <Form.Item>
//       <Button
//         type="primary"
//         htmlType="submit"
//         block
//         style={{ backgroundColor: "#3592FD" }}
//       >
//         {t("Sign Up")}
//       </Button>
//     </Form.Item>
//   </Form>
// );

// export default Login;
