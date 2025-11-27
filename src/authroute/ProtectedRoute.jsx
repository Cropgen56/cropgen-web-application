import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import { refreshAccessToken, logout } from "../redux/slices/authSlice";
import { isTokenValid } from "../../src/utility/token";
import LogoFlipLoader from "../components/comman/loading/LogoFlipLoader";
import { motion, AnimatePresence } from "framer-motion";

const ProtectedRoute = ({ children }) => {
  const auth = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const location = useLocation();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let mounted = true;

    const ensureAuth = async () => {
      const token = auth?.token;

      // 1) If token is already valid, no need to refresh
      if (isTokenValid(token)) {
        if (mounted) setChecking(false);
        return;
      }

      // 2) Token missing OR invalid/expired → try silent refresh via refresh token (cookie)
      try {
        await dispatch(refreshAccessToken()).unwrap();
      } catch (err) {
        if (mounted) {
          dispatch(logout());
        }
      } finally {
        if (mounted) setChecking(false);
      }
    };

    ensureAuth();

    return () => {
      mounted = false;
    };
  }, [auth?.token, dispatch]);

  // Show loader only while initial auth check is happening
  if (checking) {
    return (
      <div className="flex justify-center items-center h-screen w-full bg-[#344e41] realtive ">
        <AnimatePresence>
          <motion.div
            key="loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="absolute inset-0 flex flex-col items-center justify-center z-[1000] rounded-2xl"
          >
            <LogoFlipLoader />
            <p className="text-white text-xl mt-2 font-bold animate-pulse">
              Loading...
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  // After checking: recompute authenticated state using token validity
  const isAuthenticated =
    !!auth?.token && isTokenValid(auth.token) && auth.isAuthenticated;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Auth OK -> render protected content
  return children;
};

export default ProtectedRoute;
