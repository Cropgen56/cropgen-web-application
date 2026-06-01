import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { refreshAccessToken, logout } from "../redux/slices/authSlice";
import { store } from "../redux/store";
import { decodeJWT } from "../utility/decodetoken";
import { isTokenValid } from "../utility/token";
import { msUntilAccessTokenRefresh } from "../utility/authSession";

const AuthAutoRefresh = ({ children }) => {
  const dispatch = useDispatch();
  const { token, isAuthenticated } = useSelector((state) => state.auth);
  const bootstrapTriedRef = useRef(false);

  useEffect(() => {
    if (bootstrapTriedRef.current) return;
    if (token && isTokenValid(token)) {
      bootstrapTriedRef.current = true;
      return;
    }
    bootstrapTriedRef.current = true;
    dispatch(refreshAccessToken()).catch(() => {
      // Unauthenticated visitors are expected; ProtectedRoute handles routing.
    });
  }, [dispatch, token]);

  useEffect(() => {
    if (!token || !isAuthenticated) return;

    let timeoutId;
    let cancelled = false;

    const scheduleRefresh = () => {
      try {
        const payload = decodeJWT(token);
        const exp = payload?.exp;
        if (!exp) return;

        const delayMs = msUntilAccessTokenRefresh(exp);

        const runRefresh = () => {
          dispatch(refreshAccessToken())
            .unwrap()
            .catch(() => {
              const current = store.getState().auth?.token;
              if (!cancelled && !isTokenValid(current)) {
                dispatch(logout());
              }
            });
        };

        if (delayMs <= 0) {
          runRefresh();
          return;
        }

        timeoutId = setTimeout(runRefresh, delayMs);
      } catch {
        const current = store.getState().auth?.token;
        if (!isTokenValid(current)) {
          dispatch(logout());
        }
      }
    };

    scheduleRefresh();

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [token, isAuthenticated, dispatch]);

  return children;
};

export default AuthAutoRefresh;
