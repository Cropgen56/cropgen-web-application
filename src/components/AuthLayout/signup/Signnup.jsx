import React from "react";
import "./Signup.css";

const Signup = () => {
  const handleSignUp = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());
    console.log("SignUp data: ", data);
  };

  return (
    <div className="container mt-0 p-2 signup-form ">
      <div className="row justify-content-center">
        <div className="col-md-12 col-sm-12">
          <form onSubmit={handleSignUp}>
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
                  required
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
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="form-input"
                required
              />
            </div>
            <div>
              <label htmlFor="phone" className="form-label">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                className="form-input"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                className="form-input"
                required
              />
            </div>

            <div className="form-check my-1">
              <input
                type="checkbox"
                className="form-check-input"
                id="termsCheckbox"
                name="terms"
                required
              />
              <label className="form-check-label" htmlFor="termsCheckbox">
                I agree to the Terms of Use and Privacy Policy , to the
                processing of my personal data, and to receive emails
              </label>
            </div>

            <button type="submit" className="submit-button">
              Sign Up
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;
