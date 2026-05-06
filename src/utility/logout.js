import { useDispatch } from "react-redux";
import { clear } from "idb-keyval";
import { resetFarmState } from "../redux/slices/farmSlice";
import { resetAuthState } from "../redux/slices/authSlice";
import { resetOperationState } from "../redux/slices/operationSlice";
import { resetSatelliteState } from "../redux/slices/satelliteSlice";
import { logoutUserApi } from "../api/authApi";
import { useNavigate } from "react-router-dom";
import { AUTH_ROUTES } from "../config/brand";

const useLogout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const logoutUser = async () => {
    try {
      await logoutUserApi();
    } catch {
      // Server logout failed (e.g. already expired), still clear local state
    }

    try {
      localStorage.removeItem("authToken");
      localStorage.removeItem("selectedFieldId");

      await clear();

      dispatch(resetFarmState());
      dispatch(resetAuthState());
      dispatch(resetSatelliteState());
      dispatch(resetOperationState());

      navigate(AUTH_ROUTES.login);

      return { success: true };
    } catch (error) {
      console.error("Logout failed:", error);
      return { success: false, error: error.message };
    }
  };

  return logoutUser;
};

export default useLogout;
