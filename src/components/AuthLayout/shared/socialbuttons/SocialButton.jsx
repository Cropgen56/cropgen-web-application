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





// import { GoogleOAuthProvider, GoogleLogin, useGoogleLogin } from "@react-oauth/google";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import googleIcon from "../../../../assets/google-icon.svg"; 


// const clientId =
//   "411399230985-p5tioee7chgpij247th5v51uqpeuj382.apps.googleusercontent.com";

// function SocialButtons() {
//   const navigate = useNavigate();

//   const handleGoogleLogin = async (response) => {
//     try {
//       // const { credential } = response;
//       const { credential, code } = response; 

//       let tokenToSend;
//       if (credential) {
//         tokenToSend = credential; 
//       } else if (code) {
//         tokenToSend = code; // For authorization code
//       } else {
//         console.error("No credential or code found in Google response.");
//         return;
//       }

//       // Send ID token to the backend
//       const res = await axios.post(
//         "https://server.cropgenapp.com/v1/api/auth/google",
//         {
//           token: credential,
//         }
//       );

//       if (res.data.success) {
//         // Save JWT token in local storage
//         localStorage.setItem("authToken", res.data.accessToken);

//         // Redirect to home page
//         navigate("/");
//       } else {
//         console.error("Login Failed: ", res.data.message);
//       }
//     } catch (error) {
//       console.error("Google Login Error:", error);
//     }
//   };

//   const login = useGoogleLogin({
//     onSuccess: handleGoogleLogin,
//     onError: () => console.log("Login Failed"),
//   });


//   return (
//     // <GoogleOAuthProvider clientId={clientId} >
//     //   <GoogleLogin
//     //     onSuccess={handleGoogleLogin}
//     //     onError={() => console.log("Login Failed")}
//     //   />
      
//     // </GoogleOAuthProvider>
//     <button
//       onClick={() => login()}
//       className="w-full border border-[#075A53] rounded-md py-2 sm:py-3 flex items-center justify-center gap-2 hover:bg-emerald-900 transition duration-400 ease-in-out" >
//       <img src={googleIcon} alt="Google" className="w-5 h-5" />
//       <span className="text-gray-600 font-semibold text-sm lg:text-base">
//         Connect with Google
//       </span>
//     </button>
//   );
// }

// export default SocialButtons;



