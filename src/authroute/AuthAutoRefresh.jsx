import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { refreshAccessToken, logout } from "../redux/slices/authSlice";
import { decodeJWT } from "../utility/decodetoken";

const REFRESH_BEFORE_EXPIRY_SECONDS = 3300;

const AuthAutoRefresh = ({ children }) => {
  const dispatch = useDispatch();
  const { token, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!isAuthenticated || !token) return;

    let timeoutId;

    try {
      const payload = decodeJWT(token);
      const exp = payload?.exp;
      if (!exp) return;

      const now = Date.now() / 1000;
      const secondsUntilExpiry = exp - now;

      const secondsUntilRefresh =
        secondsUntilExpiry - REFRESH_BEFORE_EXPIRY_SECONDS;

      const delayMs = Math.max(secondsUntilRefresh, 0) * 1000;

      if (delayMs <= 0) {
        // immediate refresh
        dispatch(refreshAccessToken())
          .unwrap()
          .catch(() => {
            dispatch(logout());
          });
        return;
      }

      timeoutId = setTimeout(() => {
        dispatch(refreshAccessToken())
          .unwrap()
          .catch(() => {
            dispatch(logout());
          });
      }, delayMs);
    } catch (err) {
      dispatch(logout());
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [token, isAuthenticated, dispatch]);

  return children;
};

export default AuthAutoRefresh;
