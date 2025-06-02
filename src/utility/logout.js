import { useDispatch } from "react-redux";
import { clear } from "idb-keyval";
import { resetFarmState } from "../redux/slices/farmSlice";
import { resetAuthState } from "../redux/slices/authSlice";
import { resetOperationState } from "../redux/slices/operationSlice";
import { resetSatelliteState } from "../redux/slices/satelliteSlice";
import { useNavigate } from "react-router-dom";

const useLogout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const logoutUser = async () => {
    try {
      // Clear specific localStorage keys (replace with your app-specific keys)
      localStorage.removeItem("authToken");
      localStorage.removeItem("selectedFieldId");
      // Add other specific keys as needed

      // Clear IndexedDB
      await clear();

      // Reset Redux state
      dispatch(resetFarmState());
      dispatch(resetAuthState());
      dispatch(resetSatelliteState());
      dispatch(resetOperationState());

      // Navigate to login page (optional, adjust path as needed)
      navigate("/login");

      return { success: true };
    } catch (error) {
      console.error("Logout failed:", error);
      return { success: false, error: error.message };
    }
  };

  return logoutUser;
};

export default useLogout;
