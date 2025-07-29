import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const clientId =
  "411399230985-p5tioee7chgpij247th5v51uqpeuj382.apps.googleusercontent.com";

function SocialButtons() {
  const navigate = useNavigate();

  const handleGoogleLogin = async (response) => {
    try {
      const { credential } = response;

      // Send ID token to the backend
      const res = await axios.post(
        "https://server.cropgenapp.com/v1/api/auth/google",
        {
          token: credential,
        }
      );

      if (res.data.success) {
        // Save JWT token in local storage
        localStorage.setItem("authToken", res.data.accessToken);

        // Redirect to home page
        navigate("/");
      } else {
        console.error("Login Failed: ", res.data.message);
      }
    } catch (error) {
      console.error("Google Login Error:", error);
    }
  };

  return (
    <GoogleOAuthProvider clientId={clientId} >
      <GoogleLogin
        onSuccess={handleGoogleLogin}
        onError={() => console.log("Login Failed")}
      />
    </GoogleOAuthProvider>
  );
}

export default SocialButtons;
